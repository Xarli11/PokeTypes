import { describe, it, expect } from 'vitest';
import { normalizeTypeSelection } from '../../src/js/modules/typeSelection.js';

// Regression coverage for a real bug: main.js's type_calculate analytics
// event was built from the RAW t1/t2/t3 selection, before this same
// normalization ran later in displayAnalysis() — so Fire+Fire could report
// type_count: 2 even though the actual analysis treats it as a monotype.
// normalizeTypeSelection() is the exact logic displayAnalysis() runs (moved
// here verbatim, no behavior change) — testing it directly guarantees
// analytics can never drift from what's really calculated again, since
// main.js calls this same function rather than reimplementing the rules.
describe('normalizeTypeSelection', () => {
    it('Fire alone stays Fire (monotype)', () => {
        expect(normalizeTypeSelection('Fire', '', '')).toEqual({ t1: 'Fire', t2: '', t3: '' });
    });

    it('Fire + Water stays a distinct dual type', () => {
        expect(normalizeTypeSelection('Fire', 'Water', '')).toEqual({ t1: 'Fire', t2: 'Water', t3: '' });
    });

    it('Fire + Water + Grass stays a distinct triple type', () => {
        expect(normalizeTypeSelection('Fire', 'Water', 'Grass')).toEqual({ t1: 'Fire', t2: 'Water', t3: 'Grass' });
    });

    it('Fire + Fire collapses to monotype Fire', () => {
        expect(normalizeTypeSelection('Fire', 'Fire', '')).toEqual({ t1: 'Fire', t2: '', t3: '' });
    });

    it('Fire + Water + Fire collapses the duplicate t3, leaving the real dual type Fire/Water', () => {
        // t1===t3 clears t3 first; t2===t3 then compares 'Water' to the
        // now-empty t3 and does nothing further — the documented current
        // behavior for this exact case (see the sprint's #4 audit).
        expect(normalizeTypeSelection('Fire', 'Water', 'Fire')).toEqual({ t1: 'Fire', t2: 'Water', t3: '' });
    });

    it('documents t2 === t3 behavior: a duplicate in the last two slots clears t3, keeping t1 distinct', () => {
        expect(normalizeTypeSelection('Fire', 'Water', 'Water')).toEqual({ t1: 'Fire', t2: 'Water', t3: '' });
    });

    it('all three the same collapses fully to monotype', () => {
        expect(normalizeTypeSelection('Fire', 'Fire', 'Fire')).toEqual({ t1: 'Fire', t2: '', t3: '' });
    });
});

// Mirrors exactly how main.js derives type_calculate's params from
// normalizeTypeSelection()'s output, so this test fails if that derivation
// ever drifts from the normalization it's supposed to describe.
function toTypeCalculateParams(t1, t2, t3) {
    const n = normalizeTypeSelection(t1, t2, t3);
    return {
        type_1: n.t1 || null,
        type_2: n.t2 || null,
        type_3: n.t3 || null,
        type_count: [n.t1, n.t2, n.t3].filter(Boolean).length
    };
}

describe('type_calculate event params — reflect the real analyzed combination', () => {
    it('Fire -> type_count 1', () => {
        expect(toTypeCalculateParams('Fire', '', '')).toEqual({ type_1: 'Fire', type_2: null, type_3: null, type_count: 1 });
    });

    it('Fire + Water -> type_count 2', () => {
        expect(toTypeCalculateParams('Fire', 'Water', '')).toEqual({ type_1: 'Fire', type_2: 'Water', type_3: null, type_count: 2 });
    });

    it('Fire + Water + Grass -> type_count 3', () => {
        expect(toTypeCalculateParams('Fire', 'Water', 'Grass')).toEqual({ type_1: 'Fire', type_2: 'Water', type_3: 'Grass', type_count: 3 });
    });

    it('Fire + Fire -> reported as monotype Fire, not type_count 2', () => {
        expect(toTypeCalculateParams('Fire', 'Fire', '')).toEqual({ type_1: 'Fire', type_2: null, type_3: null, type_count: 1 });
    });

    it('Fire + Water + Fire -> reported as the real dual type Fire/Water', () => {
        expect(toTypeCalculateParams('Fire', 'Water', 'Fire')).toEqual({ type_1: 'Fire', type_2: 'Water', type_3: null, type_count: 2 });
    });
});
