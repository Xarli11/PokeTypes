// src/lib/type-engine/modifiers.js
//
// Ability and item modifiers layered on top of the raw type-effectiveness
// map from effectiveness.js. Modeled explicitly as one of three kinds so
// callers (and tests) can reason about them without guessing:
//
//   - immunity            : modifier === 0, always wins over anything else.
//   - multiplier          : plain damage scaling (0.5, 1.25, 1.5, 2, ...).
//   - conditional effect  : `superEffectiveOnly` (Filter/Solid Rock/Prism
//                           Armor — only scales hits that are already
//                           super effective) or `blockNonSE` (Wonder Guard
//                           — zeroes anything that isn't already super
//                           effective).
//
// `type: 'Offensive'` entries describe a move-boosting effect on the
// ability holder's own STAB (Transistor, Adaptability, Tinted Lens...).
// They never change how much damage the holder TAKES, so
// `applyDefensiveModifiers` intentionally ignores them — they only exist
// for informational display (see ui.js renderAbilityAlerts and
// simulator.js's "why didn't the number change" note).
//
// Known unmodeled limitations (documented rather than guessed at):
//   - Multiscale / Shadow Shield / Tera Shell are "only at full HP" in the
//     games. PokeTypes has no battle-state/HP concept, so they are applied
//     unconditionally (best-case, full-HP scenario) wherever they appear.
//   - Neutralizing Gas (suppresses every other ability) and Delta Stream
//     (removes a Flying-type's own weaknesses while it's active) require
//     cross-ability/weather state PokeTypes doesn't track. They are listed
//     with a neutral modifier (no-op) rather than simulated.

export const ABILITY_EFFECTIVENESS = {
    'levitate': [{ type: 'Ground', modifier: 0, description: 'Grants immunity to Ground-type moves.' }],
    'flash-fire': [{ type: 'Fire', modifier: 0, description: 'Grants immunity to Fire-type moves.' }],
    'volt-absorb': [{ type: 'Electric', modifier: 0, description: 'Grants immunity to Electric-type moves.' }],
    'motor-drive': [{ type: 'Electric', modifier: 0, description: 'Grants immunity to Electric-type moves.' }],
    'lightning-rod': [{ type: 'Electric', modifier: 0, description: 'Grants immunity to Electric-type moves.' }],
    'sap-sipper': [{ type: 'Grass', modifier: 0, description: 'Grants immunity to Grass-type moves.' }],
    'water-absorb': [{ type: 'Water', modifier: 0, description: 'Grants immunity to Water-type moves.' }],
    'storm-drain': [{ type: 'Water', modifier: 0, description: 'Grants immunity to Water-type moves.' }],
    'dry-skin': [
        { type: 'Water', modifier: 0, description: 'Grants immunity to Water-type moves.' },
        { type: 'Fire', modifier: 1.25, description: 'Takes 25% more damage from Fire-type moves.' }
    ],
    'earth-eater': [{ type: 'Ground', modifier: 0, description: 'Grants immunity to Ground-type moves.' }],
    'thick-fat': [
        { type: 'Fire', modifier: 0.5, description: 'Halves damage from Fire-type moves.' },
        { type: 'Ice', modifier: 0.5, description: 'Halves damage from Ice-type moves.' }
    ],
    'heatproof': [{ type: 'Fire', modifier: 0.5, description: 'Halves damage from Fire-type moves.' }],
    'purifying-salt': [{ type: 'Ghost', modifier: 0.5, description: 'Halves damage from Ghost-type moves.' }],
    'well-baked-body': [{ type: 'Fire', modifier: 0, description: 'Grants immunity to Fire-type moves.' }],
    'water-bubble': [{ type: 'Fire', modifier: 0.5, description: 'Halves damage from Fire-type moves.' }],
    'fluffy': [{ type: 'Fire', modifier: 2, description: 'Takes 2x damage from Fire-type moves.' }],
    'filter': [{ type: 'All', modifier: 0.75, superEffectiveOnly: true, description: 'Reduces Super Effective damage by 25%.' }],
    'solid-rock': [{ type: 'All', modifier: 0.75, superEffectiveOnly: true, description: 'Reduces Super Effective damage by 25%.' }],
    'prism-armor': [{ type: 'All', modifier: 0.75, superEffectiveOnly: true, description: 'Reduces Super Effective damage by 25%.' }],
    'wonder-guard': [{ type: 'All', modifier: 0, blockNonSE: true, description: 'Immune to all non-Super Effective damage.' }],
    'multiscale': [{ type: 'All', modifier: 0.5, description: 'Halves damage when HP is full.' }],
    'shadow-shield': [{ type: 'All', modifier: 0.5, description: 'Halves damage when HP is full.' }],
    'tera-shell': [{ type: 'All', modifier: 0.5, description: 'All moves are Not Very Effective when HP is full.' }],
    'delta-stream': [{ type: 'Flying', modifier: 1, description: 'Removes weaknesses of Flying-type Pokemon.' }],
    'desolate-land': [{ type: 'Water', modifier: 0, description: 'Grants immunity to Water-type moves.' }],
    'primordial-sea': [{ type: 'Fire', modifier: 0, description: 'Grants immunity to Fire-type moves.' }],
    'neutralizing-gas': [{ type: 'All', modifier: 1, description: 'Suppresses all other abilities while active.' }],
    'tinted-lens': [{ type: 'Offensive', modifier: 2, description: 'Doubles damage of "Not Very Effective" moves.' }],
    'scrappy': [{ type: 'Offensive', modifier: 1, description: 'Allows Normal and Fighting moves to hit Ghost types.' }],
    'minds-eye': [{ type: 'Offensive', modifier: 1, description: 'Allows Normal and Fighting moves to hit Ghost types.' }],
    'adaptability': [{ type: 'Offensive', modifier: 2, description: 'Doubles the STAB bonus (2x instead of 1.5x).' }],
    'neuroforce': [{ type: 'Offensive', modifier: 1.25, description: 'Boosts the power of Super Effective moves by 25%.' }],
    'galvanize': [{ type: 'Offensive', modifier: 1.2, description: 'Normal-type moves become Electric-type and gain 20% power.' }],
    'pixilate': [{ type: 'Offensive', modifier: 1.2, description: 'Normal-type moves become Fairy-type and gain 20% power.' }],
    'refrigerate': [{ type: 'Offensive', modifier: 1.2, description: 'Normal-type moves become Ice-type and gain 20% power.' }],
    'aerilate': [{ type: 'Offensive', modifier: 1.2, description: 'Normal-type moves become Flying-type and gain 20% power.' }],
    'transistor': [{ type: 'Offensive', modifier: 1.5, description: 'Boosts the power of Electric-type moves by 50%.' }],
    'dragons-maw': [{ type: 'Offensive', modifier: 1.5, description: 'Boosts the power of Dragon-type moves by 50%.' }],
    'steelworker': [{ type: 'Offensive', modifier: 1.5, description: 'Boosts the power of Steel-type moves by 50%.' }],
    'rocky-payload': [{ type: 'Offensive', modifier: 1.5, description: 'Boosts the power of Rock-type moves by 50%.' }],
    'stakeout': [{ type: 'Offensive', modifier: 2, description: 'Doubles damage against a Pokemon that just switched in.' }]
};

export const ITEM_EFFECTIVENESS = {
    'air-balloon': [{ type: 'Ground', modifier: 0, description: 'Grants immunity to Ground-type moves.' }],
    'ring-target': [{ type: 'All', modifier: 1, description: 'Allows moves to hit even if the user is normally immune.' }]
};

export function getAbilityModifiers(abilityName) {
    if (!abilityName) return [];
    return ABILITY_EFFECTIVENESS[abilityName.toLowerCase()] || [];
}

export function getItemModifiers(itemName) {
    if (!itemName) return [];
    const slug = itemName.toLowerCase().replace(/ /g, '-');
    return ITEM_EFFECTIVENESS[slug] || [];
}

/**
 * The subset of a modifier list that represents hard immunities, expanded
 * to concrete type names (`type: 'All'` -> every type in `allTypes`).
 * @param {Array<{type: string, modifier: number}>} modifiers
 * @param {string[]} allTypes
 * @returns {Set<string>}
 */
export function getImmuneTypesFromModifiers(modifiers, allTypes) {
    const immune = new Set();
    modifiers.forEach(mod => {
        if (mod.modifier !== 0) return;
        const types = mod.type === 'All' ? allTypes : [mod.type];
        types.forEach(t => immune.add(t));
    });
    return immune;
}

/**
 * Applies a combined list of ability/item defensive modifiers on top of a
 * raw per-attacking-type multiplier map (see effectiveness.computeDefenseMap).
 * Pure — returns a new map, never mutates `defenseMap`.
 *
 * Only entries whose `type` is a real type name (or 'All') can affect
 * anything here: `type: 'Offensive'` entries never match a real type key
 * and are therefore always a no-op in this function, by construction.
 *
 * @param {Record<string, number>} defenseMap
 * @param {Array<{type: string, modifier: number, superEffectiveOnly?: boolean, blockNonSE?: boolean}>} modifiers
 * @param {string[]} allTypes
 * @returns {Record<string, number>}
 */
export function applyDefensiveModifiers(defenseMap, modifiers, allTypes) {
    const result = { ...defenseMap };

    modifiers.forEach(mod => {
        const types = mod.type === 'All'
            ? allTypes
            : (Object.prototype.hasOwnProperty.call(result, mod.type) ? [mod.type] : []);

        types.forEach(type => {
            const current = result[type];

            if (mod.blockNonSE) {
                // Wonder Guard: only super-effective hits get through.
                if (current < 2) result[type] = 0;
            } else if (mod.superEffectiveOnly) {
                // Filter / Solid Rock / Prism Armor: only softens hits that
                // are already super effective; neutral/resisted/immune are
                // untouched.
                if (current >= 2) result[type] = current * mod.modifier;
            } else if (mod.modifier === 0) {
                // Hard immunity always wins, regardless of the prior value.
                result[type] = 0;
            } else {
                result[type] = current * mod.modifier;
            }
        });
    });

    return result;
}
