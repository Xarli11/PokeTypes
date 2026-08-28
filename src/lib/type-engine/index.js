// src/lib/type-engine/index.js
//
// Public entry point for the shared type engine. See docs/type-engine.md
// for the architecture, the input/output models, and documented
// assumptions/limitations (Transistor, Tera, conditional abilities).
//
// Consumed by: SSR Astro pages (src/pages/tipo/[...slug].astro), the
// browser client (src/js/modules/*.js via main.js), and the Vitest suite
// (tests/type-engine/*.test.js). No DOM access, no global mutation —
// safe to import from any of those contexts.

export {
    getEffectiveness,
    computeDefenseMap,
    computeDefenseMapIgnoringTypeImmunities,
    calculateDefense,
    calculateOffense,
    findImmuneDualTypes
} from './effectiveness.js';

export {
    ABILITY_EFFECTIVENESS,
    ITEM_EFFECTIVENESS,
    getAbilityModifiers,
    getItemModifiers,
    getImmuneTypesFromModifiers,
    applyDefensiveModifiers
} from './modifiers.js';

export {
    MULTIPLIER_CATEGORIES,
    categorizeMultiplier,
    classifyMultiplier
} from './result.js';

export {
    analyzeTeamDefense,
    getThreatAlerts,
    getPokemonDefenseBreakdown
} from './team.js';
