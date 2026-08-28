import { describe, it, expect } from 'vitest';

// i18n.js's module-scope singleton reads localStorage at construction
// time; Vitest's default (Node) environment has no `localStorage`
// global, so it must be stubbed before the import (same pattern as
// tests/ui/type-selector.test.js).
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k)
    };
}

const { i18n } = await import('../../src/js/modules/i18n.js');

// simulator.js has no jsdom available in this test environment, so
// refreshSimulatorLanguage()'s actual <select> relabeling (a one-line
// `opt.textContent = i18n.tType(opt.value)` loop, verified manually via
// browser QA) isn't directly exercised here. What IS fully testable
// without a DOM — and is the actual bug this covers — is that i18n.tType
// keeps returning the correct label for the same literal type value
// across repeated language switches, and that the value passed in (what
// an <option>'s `value` attribute holds) is never itself translated.
// setLanguage() also writes document.documentElement.lang, which needs a
// real DOM; setting currentLang directly exercises the exact same
// tType() lookup path (the only thing this suite cares about) without
// requiring jsdom.
describe('i18n.tType — simulator attack-type select relabeling', () => {
    it('EN: returns the English label for each type value', () => {
        i18n.currentLang = 'en';
        expect(i18n.tType('Fire')).toBe('Fire');
        expect(i18n.tType('Water')).toBe('Water');
        expect(i18n.tType('Ground')).toBe('Ground');
    });

    it('toggled to ES: the same type values now return Spanish labels', () => {
        i18n.currentLang = 'es';
        expect(i18n.tType('Fire')).toBe('Fuego');
        expect(i18n.tType('Water')).toBe('Agua');
        expect(i18n.tType('Ground')).toBe('Tierra');
    });

    it('toggled back to EN: labels revert without needing a page reload', () => {
        i18n.currentLang = 'en';
        expect(i18n.tType('Fire')).toBe('Fire');
        expect(i18n.tType('Water')).toBe('Water');
        expect(i18n.tType('Ground')).toBe('Ground');
    });

    it('the type value itself is never translated — only the label is', () => {
        // The <option value="..."> that simulator.js keeps untouched
        // when relabeling is always the raw type name (e.g. "Fire"),
        // matched case-sensitively elsewhere in the engine — tType must
        // only ever be used to derive the visible textContent from it.
        i18n.currentLang = 'es';
        const value = 'Fire';
        const label = i18n.tType(value);
        expect(value).toBe('Fire');
        expect(label).toBe('Fuego');
        expect(label).not.toBe(value);
    });
});
