import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, createDebouncedTracker } from '../../src/js/modules/analytics.js';

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

// Regression coverage for a real bug: main.js's pokemon_search wiring
// scheduled a 600ms debounced trackEvent() but only ever canceled it from
// the code path that scheduled a NEW one — a keystroke that cleared the
// search box short-circuited before that cancel, so the stale timer still
// fired for a search the user had already undone. createDebouncedTracker()
// centralizes the cancel-on-every-input contract so that bug class can't
// come back silently.
describe('createDebouncedTracker — cancellation', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('fires exactly once, after the delay, when scheduled once and left alone (no event per keystroke)', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };
        const tracker = createDebouncedTracker('pokemon_search', 600);

        tracker.schedule({ has_results: true, language: 'en' });
        vi.advanceTimersByTime(599);
        expect(gtag).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(gtag).toHaveBeenCalledTimes(1);
        expect(gtag).toHaveBeenCalledWith('event', 'pokemon_search', { has_results: true, language: 'en' });
    });

    it('cancel() before the delay elapses prevents the event entirely — "pika" then cleared before 600ms fires 0 events', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };
        const tracker = createDebouncedTracker('pokemon_search', 600);

        tracker.schedule({ has_results: true, language: 'en' }); // typed "pika"
        vi.advanceTimersByTime(300); // well before 600ms
        tracker.cancel(); // field cleared

        vi.advanceTimersByTime(1000); // plenty past the original 600ms
        expect(gtag).not.toHaveBeenCalled();
    });

    it('re-scheduling before the delay elapses only fires once, for the latest params (rapid typing)', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };
        const tracker = createDebouncedTracker('pokemon_search', 600);

        tracker.schedule({ has_results: false, language: 'en' }); // "p"
        vi.advanceTimersByTime(200);
        tracker.schedule({ has_results: false, language: 'en' }); // "pi"
        vi.advanceTimersByTime(200);
        tracker.schedule({ has_results: true, language: 'en' }); // "pika"

        vi.advanceTimersByTime(600);
        expect(gtag).toHaveBeenCalledTimes(1);
        expect(gtag).toHaveBeenCalledWith('event', 'pokemon_search', { has_results: true, language: 'en' });
    });

    it('a completed search after the debounce elapses fires exactly one event', () => {
        const gtag = vi.fn();
        globalThis.window = { gtag };
        const tracker = createDebouncedTracker('pokemon_search', 600);

        tracker.schedule({ has_results: true, language: 'en' });
        vi.advanceTimersByTime(600);

        expect(gtag).toHaveBeenCalledTimes(1);
    });
});
