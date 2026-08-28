// src/lib/type-engine/result.js
//
// Centralizes the "magic number" multiplier categories so they live in one
// place instead of being re-checked with `=== 0.5` style comparisons all
// over the UI/analysis layers.

/**
 * Every multiplier PokeTypes can produce for a defending combination of up
 * to 3 types, from strongest weakness to hardest resistance.
 */
export const MULTIPLIER_CATEGORIES = [
    { key: 'x8', value: 8 },
    { key: 'x4', value: 4 },
    { key: 'x2', value: 2 },
    { key: 'x1', value: 1 },
    { key: 'x05', value: 0.5 },
    { key: 'x025', value: 0.25 },
    { key: 'x0125', value: 0.125 },
    { key: 'x0', value: 0 }
];

/**
 * Maps an exact multiplier to its canonical bucket key (e.g. 0.5 -> 'x05').
 * Only meaningful for values straight out of the effectiveness table
 * (products of 1, 2, 0.5, 0 across up to 3 types) — ability/item modifiers
 * can produce values off this ladder (e.g. Filter's 0.75), which is why
 * post-modifier classification uses `classifyMultiplier` instead.
 * @param {number} multiplier
 * @returns {string|null}
 */
export function categorizeMultiplier(multiplier) {
    const match = MULTIPLIER_CATEGORIES.find(c => c.value === multiplier);
    return match ? match.key : null;
}

/**
 * Coarse classification used once ability/item modifiers are in play,
 * where exact values may no longer sit on the standard multiplier ladder.
 * Only the sign relative to 1 matters for weak/resist/immune tallying.
 * @param {number} multiplier
 * @returns {'weak'|'neutral'|'resist'|'immune'}
 */
export function classifyMultiplier(multiplier) {
    if (multiplier === 0) return 'immune';
    if (multiplier > 1) return 'weak';
    if (multiplier < 1) return 'resist';
    return 'neutral';
}
