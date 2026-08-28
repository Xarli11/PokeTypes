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

const MULTIPLIER_SYMBOLS = new Map([[8, '8×'], [4, '4×'], [2, '2×'], [1, '1×'], [0.5, '½×'], [0.25, '¼×'], [0.125, '⅛×'], [0, '0×']]);

/**
 * Display-only formatting for a multiplier (e.g. 0.5 -> '½×'). Falls back
 * to `${n}×` for values off the standard ladder (Filter-reduced hits,
 * etc.) — this never affects any calculation, only presentation. Shared
 * by ui.js, pro.js, and simulator.js so the symbol used for a given
 * number is identical everywhere in the UI.
 * @param {number} n
 * @returns {string}
 */
export function formatMultiplierSymbol(n) {
    return MULTIPLIER_SYMBOLS.get(n) || `${n}×`;
}

/**
 * Display-only severity bucket for a multiplier, used to pick a
 * `.mult-*` CSS class. Distinct from `classifyMultiplier` (weak/neutral/
 * resist/immune, used for weak/resist/immune tallying): this one further
 * splits "weak" into critical (>=4x, e.g. an 8x/4x hit) vs weak (2x) so
 * the UI can give critical weaknesses a visually stronger treatment.
 * @param {number} n
 * @returns {'mult-critical'|'mult-weak'|'mult-resist'|'mult-immune'|'mult-neutral'}
 */
export function classifySeverity(n) {
    if (n === 0) return 'mult-immune';
    if (n >= 4) return 'mult-critical';
    if (n > 1) return 'mult-weak';
    if (n < 1) return 'mult-resist';
    return 'mult-neutral';
}
