import { describe, it, expect } from 'vitest';

// typeSelector.js imports i18n.js, whose module-scope singleton reads
// localStorage at construction time. Vitest's default (Node) environment
// has no `localStorage` global, so it must be stubbed before the import —
// this has no bearing on the pure function under test below.
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k)
    };
}

const { buildTypeGridHTML } = await import('../../src/js/modules/typeSelector.js');

// Pure part of the type selector popover (typeSelector.js is otherwise
// DOM-heavy — this is the one piece worth unit testing directly).
describe('buildTypeGridHTML', () => {
    const contrast = { Fire: 'light', Electric: 'dark' };

    it('renders one button per type, each carrying its own type color class', () => {
        const html = buildTypeGridHTML(['Fire', 'Electric'], contrast);
        expect(html).toContain('bg-type-fire');
        expect(html).toContain('bg-type-electric');
        expect((html.match(/data-type="/g) || []).length).toBe(2);
    });

    it('uses the contrast map to pick readable text color per type', () => {
        const html = buildTypeGridHTML(['Fire', 'Electric'], contrast);
        expect(html).toContain('type-text-light'); // Fire -> light contrast text
        expect(html).toContain('type-text-dark');  // Electric -> dark contrast text
    });

    it('carries the type name in data-type so the popover can set the underlying select', () => {
        const html = buildTypeGridHTML(['Fire'], contrast);
        expect(html).toContain('data-type="Fire"');
    });

    it('returns an empty string for an empty type list', () => {
        expect(buildTypeGridHTML([], {})).toBe('');
    });
});
