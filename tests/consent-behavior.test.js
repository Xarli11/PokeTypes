import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const layout = read('src/layouts/Layout.astro');

// Runs the real inline <script> blocks of Layout/LegalFooter against a fake window that
// implements the documented googlefc callbackQueue contract (CONSENT_MODE_DATA_READY,
// CONSENT_API_READY, getGoogleConsentModeValues, showRevocationMessage).
const inlineScript = (source, marker) => {
    const blocks = [...source.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    return blocks.find(b => b.includes(marker));
};
const GRANTED = 1, DENIED = 2, NOT_APPLICABLE = 3, UNKNOWN = 0;
const SIGNALS = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];
const modeValues = (ad, user, pers, analytics) => ({
    adStoragePurposeConsentStatus: ad, adUserDataPurposeConsentStatus: user,
    adPersonalizationPurposeConsentStatus: pers, analyticsStoragePurposeConsentStatus: analytics
});

function bootLayout(values) {
    const appended = [];
    const ctx = vm.createContext({
        document: { createElement: () => ({}), head: { appendChild: el => appended.push(el) } },
        Date, Object
    });
    ctx.window = ctx;
    ctx.googlefc = { getGoogleConsentModeValues: () => values };
    vm.runInContext(inlineScript(layout, "gtag('consent', 'default'"), ctx);
    const fire = () => ctx.googlefc.callbackQueue.forEach(item => item.CONSENT_MODE_DATA_READY?.());
    const commands = () => ctx.dataLayer.map(a => Array.from(a));
    return { ctx, appended, fire, commands };
}

describe('basic consent mode (Layout inline script against the documented googlefc contract)', () => {
    it('before the CMP reports anything: defaults are the first command, nothing is loaded', () => {
        const { appended, commands } = bootLayout(modeValues(UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN));
        expect(commands()).toHaveLength(1);
        expect(commands()[0].slice(0, 2)).toEqual(['consent', 'default']);
        for (const k of SIGNALS) expect(commands()[0][2][k]).toBe('denied');
        expect(appended).toHaveLength(0);
    });

    it('accepted: mirrors the four signals as granted, then queues config and loads gtag.js', () => {
        const { appended, fire, commands } = bootLayout(modeValues(GRANTED, GRANTED, GRANTED, GRANTED));
        fire();
        const update = commands().find(c => c[0] === 'consent' && c[1] === 'update');
        for (const k of SIGNALS) expect(update[2][k]).toBe('granted');
        expect(commands().findIndex(c => c[0] === 'config')).toBeGreaterThan(commands().indexOf(update));
        expect(appended).toHaveLength(1);
        expect(appended[0].src).toBe('https://www.googletagmanager.com/gtag/js?id=G-9D59NL7KTH');
    });

    it('rejected: signals stay denied and gtag.js is never requested', () => {
        const { appended, fire, commands } = bootLayout(modeValues(DENIED, DENIED, DENIED, DENIED));
        fire();
        const update = commands().find(c => c[0] === 'consent' && c[1] === 'update');
        for (const k of SIGNALS) expect(update[2][k]).toBe('denied');
        expect(commands().some(c => c[0] === 'config')).toBe(false);
        expect(appended).toHaveLength(0);
    });

    it('analytics rejected but ads accepted: only the ad signals are granted, GA stays blocked', () => {
        const { appended, fire, commands } = bootLayout(modeValues(GRANTED, GRANTED, GRANTED, DENIED));
        fire();
        const update = commands().find(c => c[0] === 'consent' && c[1] === 'update')[2];
        expect([update.ad_storage, update.analytics_storage]).toEqual(['granted', 'denied']);
        expect(appended).toHaveLength(0);
    });

    it('unknown keeps GA blocked; not applicable loads it but never grants by itself', () => {
        let b = bootLayout(modeValues(UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN));
        b.fire();
        expect(b.commands().some(c => c[1] === 'update')).toBe(false);
        expect(b.appended).toHaveLength(0);
        b = bootLayout(modeValues(NOT_APPLICABLE, NOT_APPLICABLE, NOT_APPLICABLE, NOT_APPLICABLE));
        b.fire();
        expect(b.commands().some(c => c[1] === 'update')).toBe(false);
        expect(b.appended).toHaveLength(1);
    });

    it('a repeated callback never loads gtag.js twice and mirrors a later withdrawal', () => {
        let values = modeValues(GRANTED, GRANTED, GRANTED, GRANTED);
        const b = bootLayout();
        b.ctx.googlefc.getGoogleConsentModeValues = () => values;
        b.fire();
        values = modeValues(DENIED, DENIED, DENIED, DENIED);
        b.fire();
        expect(b.appended).toHaveLength(1);
        const updates = b.commands().filter(c => c[1] === 'update');
        expect(updates.map(u => u[2].analytics_storage)).toEqual(['granted', 'denied']);
    });

    it('the gtag.js loader exists only inside the callback (no static <script src> for it)', () => {
        expect(layout).not.toMatch(/<script[^>]*src="https:\/\/www\.googletagmanager\.com/);
    });
});

describe('reopening preferences (LegalFooter inline script)', () => {
    const footer = read('src/components/LegalFooter.astro');
    function bootFooter({ googlefc, tcf, path = '/' } = {}) {
        let click;
        const ctx = vm.createContext({
            document: { getElementById: () => ({ addEventListener: (_, fn) => { click = fn; } }) },
            location: { pathname: path, hash: '', href: '' }
        });
        ctx.window = ctx;
        if (googlefc) ctx.googlefc = googlefc;
        if (tcf) ctx.__tcfapi = tcf;
        vm.runInContext(inlineScript(footer, 'privacy-settings'), ctx);
        return { ctx, click: () => click() };
    }
    const cmp = () => { const calls = []; return { calls, googlefc: { showRevocationMessage: () => calls.push('revoke') } }; };

    it('uses the documented googlefc.showRevocationMessage() when the CMP is loaded', () => {
        const { calls, googlefc } = cmp();
        bootFooter({ googlefc }).click();
        expect(calls).toEqual(['revoke']);
    });

    it('registers CONSENT_API_READY and reads gdprApplies through __tcfapi addEventListener (version 0)', () => {
        const { calls, googlefc } = cmp();
        const seen = [];
        const { ctx, click } = bootFooter({ googlefc, tcf: (cmd, version, cb) => { seen.push([cmd, version]); cb({ gdprApplies: true }, true); } });
        ctx.googlefc.callbackQueue.forEach(i => i.CONSENT_API_READY?.());
        expect(seen).toEqual([['addEventListener', 0]]);
        click();
        expect(calls).toEqual(['revoke']);
    });

    it('goes to /privacy#cookies when consent is not requested (gdprApplies false) or the CMP is not loaded', () => {
        const a = cmp();
        const notApplicable = bootFooter({ googlefc: a.googlefc, tcf: (cmd, v, cb) => cb({ gdprApplies: false }, true) });
        notApplicable.ctx.googlefc.callbackQueue.forEach(i => i.CONSENT_API_READY?.());
        notApplicable.click();
        expect(a.calls).toEqual([]);
        expect(notApplicable.ctx.location.href).toBe('/privacy#cookies');
        const missing = bootFooter({});
        missing.click();
        expect(missing.ctx.location.href).toBe('/privacy#cookies');
        const onPolicy = bootFooter({ path: '/privacy' });
        onPolicy.click();
        expect(onPolicy.ctx.location.hash).toBe('cookies');
    });
});

describe('self-hosted fonts', () => {
    const css = read('src/styles/fonts.css');

    it('no request to Google Fonts remains in the layout or styles', () => {
        for (const text of [layout, css, read('src/styles/global.css')]) {
            expect(text).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
        }
    });

    it('serves exactly Syne 700-800, Outfit 300-800 and JetBrains Mono 400/700/800 from files that exist', () => {
        const faces = [...css.matchAll(/@font-face \{([\s\S]*?)\}/g)].map(m => m[1]);
        const seen = new Set(faces.map(f => `${f.match(/font-family: '([^']+)'/)[1]} ${f.match(/font-weight: (\d+)/)[1]}`));
        expect([...seen].sort()).toEqual([
            ...[300, 400, 500, 600, 700, 800].map(w => `Outfit ${w}`),
            ...[400, 700, 800].map(w => `JetBrains Mono ${w}`),
            ...[700, 800].map(w => `Syne ${w}`)
        ].sort());
        for (const f of faces) {
            expect(f).toContain('font-display: swap');
            const file = f.match(/url\(\/fonts\/([^)]+)\)/)[1];
            expect(existsSync(new URL(`../public/fonts/${file}`, import.meta.url)), file).toBe(true);
        }
    });
});
