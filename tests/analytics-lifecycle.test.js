import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { trackEvent, createDebouncedTracker } from '../src/js/modules/analytics.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const layout = read('src/layouts/Layout.astro');

const GRANTED = 1, DENIED = 2, UNKNOWN = 0;
const values = s => ({
    adStoragePurposeConsentStatus: s, adUserDataPurposeConsentStatus: s,
    adPersonalizationPurposeConsentStatus: s, analyticsStoragePurposeConsentStatus: s
});
const GA_DISABLE = 'ga-disable-G-9D59NL7KTH';

const originalWindow = globalThis.window;
afterEach(() => {
    globalThis.window = originalWindow;
    vi.useRealTimers();
});

// Runs the real Layout consent script, then points the real analytics.js wrapper at it.
// `set` changes what Google's CMP reports WITHOUT re-firing any callback (worst case).
function boot(initial) {
    const appended = [];
    const ctx = vm.createContext({
        document: { createElement: () => ({}), head: { appendChild: el => appended.push(el) } },
        Date, Object
    });
    ctx.window = ctx;
    let current = initial;
    ctx.googlefc = { getGoogleConsentModeValues: () => current };
    const script = [...layout.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(b => b.includes("gtag('consent', 'default'"));
    vm.runInContext(script, ctx);
    globalThis.window = ctx;
    return {
        ctx, appended,
        set: v => { current = v; },
        fire: () => ctx.googlefc.callbackQueue.forEach(i => i.CONSENT_MODE_DATA_READY?.()),
        broken: () => { ctx.googlefc.getGoogleConsentModeValues = () => { throw new Error('broken'); }; },
        commands: () => ctx.dataLayer.map(a => Array.from(a)),
        events: () => ctx.dataLayer.map(a => Array.from(a)).filter(c => c[0] === 'event').map(c => c[1]),
        updates: () => ctx.dataLayer.map(a => Array.from(a)).filter(c => c[1] === 'update').map(c => c[2].analytics_storage)
    };
}

describe('analytics events and consent (real Layout script + real trackEvent)', () => {
    it('before any consent events are not queued in dataLayer and the tag-level flag blocks hits', () => {
        const b = boot(values(UNKNOWN));
        trackEvent('type_calculate');
        trackEvent('pokemon_select');
        expect(b.events()).toEqual([]);
        expect(b.ctx[GA_DISABLE]).toBe(true);
    });

    it('no consent -> accept: pre-consent interactions are NOT sent retroactively', () => {
        const b = boot(values(UNKNOWN));
        trackEvent('type_calculate');
        b.set(values(GRANTED));
        b.fire();
        trackEvent('share');
        expect(b.events()).toEqual(['share']);
        expect(b.appended).toHaveLength(1);
        expect(b.ctx[GA_DISABLE]).toBe(false);
    });

    it('reject -> accept without reload: only events after accepting are queued, the tag loads once', () => {
        const b = boot(values(UNKNOWN));
        b.set(values(DENIED));
        b.fire();
        trackEvent('mode_change');
        expect(b.appended).toHaveLength(0);
        b.set(values(GRANTED));
        b.fire();
        trackEvent('team_member_add');
        expect(b.events()).toEqual(['team_member_add']);
        expect(b.appended).toHaveLength(1);
    });

    it('accept -> withdraw -> accept with gtag.js already loaded, without reload and without callbacks', () => {
        const b = boot(values(GRANTED));
        b.fire();
        trackEvent('e1');
        b.set(values(DENIED));
        expect(b.ctx[GA_DISABLE]).toBe(true);
        trackEvent('e2');
        b.set(values(GRANTED));
        expect(b.ctx[GA_DISABLE]).toBe(false);
        trackEvent('e3');
        expect(b.events()).toEqual(['e1', 'e3']);
        expect(b.updates()).toEqual(['granted', 'denied', 'granted']);
        expect(b.appended).toHaveLength(1);
    });

    it('a cleared record (UNKNOWN while the reopen flow runs) counts as withdrawn', () => {
        const b = boot(values(GRANTED));
        b.fire();
        b.set(values(UNKNOWN));
        trackEvent('while_reopening');
        expect(b.events()).toEqual([]);
        expect(b.ctx[GA_DISABLE]).toBe(true);
    });

    it('with reload: a fresh page starts empty, loads the tag once if consent persists, and carries nothing over', () => {
        let b = boot(values(UNKNOWN));
        trackEvent('before_reload');
        b = boot(values(GRANTED));
        b.fire();
        trackEvent('after_reload');
        expect(b.events()).toEqual(['after_reload']);
        expect(b.appended).toHaveLength(1);
        b = boot(values(DENIED));
        b.fire();
        trackEvent('after_reload_rejected');
        expect(b.events()).toEqual([]);
        expect(b.appended).toHaveLength(0);
    });

    it('accept -> withdraw -> accept across reloads', () => {
        let b = boot(values(GRANTED));
        b.fire();
        trackEvent('a');
        b = boot(values(DENIED)); // reload after withdrawing
        b.fire();
        trackEvent('b');
        expect(b.appended).toHaveLength(0);
        b = boot(values(GRANTED)); // reload after accepting again
        b.fire();
        trackEvent('c');
        expect(b.events()).toEqual(['c']);
        expect(b.appended).toHaveLength(1);
    });

    it('a broken googlefc never throws, sends nothing and blocks the tag', () => {
        const b = boot(values(GRANTED));
        b.broken();
        expect(() => trackEvent('x')).not.toThrow();
        expect(b.events()).toEqual([]);
        expect(b.ctx[GA_DISABLE]).toBe(true);
    });

    it('a debounced event re-checks consent when its timer fires', () => {
        vi.useFakeTimers();
        const b = boot(values(GRANTED));
        const tracker = createDebouncedTracker('pokemon_search', 600);
        tracker.schedule({ has_results: true });
        b.set(values(DENIED));
        vi.advanceTimersByTime(700);
        expect(b.events()).toEqual([]);
    });
});

describe('trackEvent contract (unit)', () => {
    it('drops the event when the consent function is missing, false or throws, and never throws itself', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };
        expect(() => trackEvent('share')).not.toThrow();
        globalThis.window = { gtag, pokeAnalyticsGranted: () => false };
        trackEvent('share');
        globalThis.window = { gtag, pokeAnalyticsGranted: () => { throw new Error('googlefc broke'); } };
        expect(() => trackEvent('share')).not.toThrow();
        expect(gtag).not.toHaveBeenCalled();
    });

    it('sends exactly one event when analytics is granted, and gtag throwing cannot escape', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag, pokeAnalyticsGranted: () => true };
        trackEvent('share', { a: 1 });
        expect(gtag).toHaveBeenCalledTimes(1);
        globalThis.window = { gtag: () => { throw new Error('blocked'); }, pokeAnalyticsGranted: () => true };
        expect(() => trackEvent('share')).not.toThrow();
    });
});

describe('calculator actions never depend on Analytics', () => {
    const files = ['main.js', 'modules/pro.js', 'modules/simulator.js', 'modules/ui.js', 'modules/data.js', 'modules/team.js'];
    const callSites = files.flatMap(f => read(`src/js/${f}`).split('\n')
        .filter(l => /\btrackEvent\(/.test(l) && !/^\s*(import|\/\/)/.test(l)).map(l => [f, l.trim()]));

    it('every call site ignores the result, and nothing else touches gtag, dataLayer or googlefc', () => {
        expect(callSites.length).toBeGreaterThan(5);
        for (const [f, line] of callSites) expect(line, `${f}: ${line}`).toMatch(/^trackEvent\(/);
        for (const f of [...files, 'modules/analytics.js']) {
            const text = read(`src/js/${f}`).replace(/\/\/.*$/gm, '');
            expect(text, f).not.toMatch(/dataLayer|googlefc/);
            if (f !== 'modules/analytics.js') expect(text, f).not.toMatch(/\bgtag\(/);
        }
    });

    it('trackEvent returns nothing, so no caller can branch on it', () => {
        globalThis.window = { gtag: () => 'x', pokeAnalyticsGranted: () => true };
        expect(trackEvent('share')).toBeUndefined();
    });
});
