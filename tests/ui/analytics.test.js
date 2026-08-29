import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from '../../src/js/modules/analytics.js';

// Vitest's default environment has no `window` global. Rather than pull in
// jsdom as a new dependency, stub the minimal shape trackEvent() actually
// reads — the same approach tests/ui/type-selector.test.js already uses for
// localStorage. This also naturally satisfies "tests must never send real
// analytics data": with no window.gtag defined, trackEvent() no-ops.
const originalWindow = globalThis.window;

afterEach(() => {
    globalThis.window = originalWindow;
    vi.restoreAllMocks();
});

describe('trackEvent — gtag available', () => {
    it('calls window.gtag with "event", the given name, and params', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };

        trackEvent('pokemon_select', { pokemon: 'dragonite', source: 'search' });

        expect(gtag).toHaveBeenCalledTimes(1);
        expect(gtag).toHaveBeenCalledWith('event', 'pokemon_select', { pokemon: 'dragonite', source: 'search' });
    });

    it('passes an empty params object through when none is given', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };

        trackEvent('mode_change');

        expect(gtag).toHaveBeenCalledWith('event', 'mode_change', {});
    });

    it('does not throw even if gtag itself throws', () => {
        globalThis.window = { gtag: () => { throw new Error('blocked by an ad blocker'); } };

        expect(() => trackEvent('share', { context: 'team' })).not.toThrow();
    });
});

describe('trackEvent — gtag unavailable', () => {
    it('no-ops silently when window.gtag is not a function (no window at all)', () => {
        globalThis.window = undefined;
        expect(() => trackEvent('pokemon_search', { has_results: true })).not.toThrow();
    });

    it('no-ops silently when window exists but gtag was never loaded', () => {
        globalThis.window = {};
        expect(() => trackEvent('pokemon_search', { has_results: true })).not.toThrow();
    });

    it('no-ops silently when window.gtag is defined but not a function', () => {
        globalThis.window = { gtag: 'not-a-function' };
        expect(() => trackEvent('type_calculate', { type_1: 'Fire' })).not.toThrow();
    });
});

describe('trackEvent — does not duplicate calls', () => {
    it('one trackEvent() call results in exactly one gtag() call', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };

        trackEvent('team_member_add', { pokemon: 'gholdengo', slot: 0, team_size: 1 });

        expect(gtag).toHaveBeenCalledTimes(1);
    });
});
