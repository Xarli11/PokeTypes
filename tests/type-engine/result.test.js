import { describe, it, expect } from 'vitest';
import { categorizeMultiplier, classifyMultiplier, MULTIPLIER_CATEGORIES } from '../../src/lib/type-engine/result.js';

describe('categorizeMultiplier', () => {
    it.each([
        [8, 'x8'], [4, 'x4'], [2, 'x2'], [1, 'x1'],
        [0.5, 'x05'], [0.25, 'x025'], [0.125, 'x0125'], [0, 'x0']
    ])('maps %s -> %s', (value, key) => {
        expect(categorizeMultiplier(value)).toBe(key);
    });

    it('returns null for a value off the canonical ladder (e.g. a Filter-reduced 3x)', () => {
        expect(categorizeMultiplier(3)).toBeNull();
    });

    it('lists exactly 8 categories, strongest weakness to hardest resistance', () => {
        expect(MULTIPLIER_CATEGORIES.map(c => c.value)).toEqual([8, 4, 2, 1, 0.5, 0.25, 0.125, 0]);
    });
});

describe('classifyMultiplier', () => {
    it('classifies anything above 1 as weak, regardless of exact value', () => {
        expect(classifyMultiplier(2)).toBe('weak');
        expect(classifyMultiplier(3)).toBe('weak');
        expect(classifyMultiplier(1.5)).toBe('weak');
    });

    it('classifies anything between 0 and 1 as resist', () => {
        expect(classifyMultiplier(0.5)).toBe('resist');
        expect(classifyMultiplier(0.75)).toBe('resist');
    });

    it('classifies exactly 0 as immune and exactly 1 as neutral', () => {
        expect(classifyMultiplier(0)).toBe('immune');
        expect(classifyMultiplier(1)).toBe('neutral');
    });
});
