// src/lib/type-engine/effectiveness.js
//
// Pure Gen 9 type-effectiveness math. No DOM, no globals, no mutation of
// inputs. Shared verbatim between SSR (Astro frontmatter), the browser
// client, and the test suite — this is the single source of truth for
// "what beats what" in PokeTypes.

/**
 * Raw attacker → defender multiplier from the effectiveness table.
 * @param {string} attackingType
 * @param {string} defendingType
 * @param {Record<string, Record<string, number>>} effectiveness
 * @returns {number}
 */
export function getEffectiveness(attackingType, defendingType, effectiveness) {
    const attackerEffects = effectiveness[attackingType];
    if (attackerEffects && Object.prototype.hasOwnProperty.call(attackerEffects, defendingType)) {
        return attackerEffects[defendingType];
    }
    return 1;
}

/**
 * Raw defensive multiplier for every attacking type against a 1-3 type
 * defending combination. This is the pre-modifier (no ability/item) map
 * that all higher-level defense helpers build on.
 * @param {string} type1
 * @param {string|null} type2
 * @param {string[]} allTypes - full type roster, used as the attacker list
 * @param {Record<string, Record<string, number>>} effectiveness
 * @param {string|null} [type3]
 * @returns {Record<string, number>} attackingType -> multiplier
 */
export function computeDefenseMap(type1, type2, allTypes, effectiveness, type3 = null) {
    const map = {};
    allTypes.forEach(attackingType => {
        let modifier = getEffectiveness(attackingType, type1, effectiveness);
        if (type2) modifier *= getEffectiveness(attackingType, type2, effectiveness);
        if (type3) modifier *= getEffectiveness(attackingType, type3, effectiveness);
        map[attackingType] = modifier;
    });
    return map;
}

/**
 * Same defense map as `computeDefenseMap`, except any single defending
 * type's component that would grant a hard TYPE-based immunity (e.g.
 * Flying's immunity to Ground) is treated as neutral (1x) instead of 0,
 * while every other type's component in the combination is left exactly
 * as-is (still weak/resisted/whatever it naturally is).
 *
 * This is deliberately *not* "clamp the final product to 1 if it's 0" —
 * that would be wrong for a combination where the immunity-granting type
 * is paired with a type that's independently weak or resistant to the
 * same attacker (e.g. Ground/Flying is immune to Electric only because of
 * Flying; Ground's own component is neutral, but Flying's is actually
 * weak (2x) to Electric — negating just the immunity should reveal that
 * 2x, not fall back to neutral).
 *
 * Exists to support Ring Target (see modifiers.js), which negates the
 * holder's type-based immunities without touching ability/item-based
 * ones (Levitate, Volt Absorb, ...) — those are handled separately in
 * applyDefensiveModifiers.
 * @param {string} type1
 * @param {string|null} type2
 * @param {string[]} allTypes
 * @param {Record<string, Record<string, number>>} effectiveness
 * @param {string|null} [type3]
 * @returns {Record<string, number>}
 */
export function computeDefenseMapIgnoringTypeImmunities(type1, type2, allTypes, effectiveness, type3 = null) {
    const defendingTypes = [type1, type2, type3].filter(Boolean);
    const map = {};
    allTypes.forEach(attackingType => {
        let modifier = 1;
        defendingTypes.forEach(defendingType => {
            const component = getEffectiveness(attackingType, defendingType, effectiveness);
            modifier *= (component === 0 ? 1 : component);
        });
        map[attackingType] = modifier;
    });
    return map;
}

/**
 * Groups a defense map into the fixed multiplier buckets the UI renders
 * (weaknesses8x..immunities). Only used for the no-modifier, type-only
 * path, where every value is guaranteed to land exactly on one of the
 * eight canonical multipliers (see result.js for why post-modifier maps
 * use classifyMultiplier instead).
 * @param {Record<string, number>} defenseMap
 */
function bucketDefenseMap(defenseMap) {
    const results = {
        weaknesses8x: [],
        weaknesses4x: [],
        weaknesses2x: [],
        neutral: [],
        resistances05x: [],
        resistances025x: [],
        resistances0125x: [],
        immunities: []
    };

    Object.entries(defenseMap).forEach(([attackingType, modifier]) => {
        if (modifier === 8) results.weaknesses8x.push(attackingType);
        else if (modifier === 4) results.weaknesses4x.push(attackingType);
        else if (modifier === 2) results.weaknesses2x.push(attackingType);
        else if (modifier === 1) results.neutral.push(attackingType);
        else if (modifier === 0.5) results.resistances05x.push(attackingType);
        else if (modifier === 0.25) results.resistances025x.push(attackingType);
        else if (modifier === 0.125) results.resistances0125x.push(attackingType);
        else if (modifier === 0) results.immunities.push(attackingType);
    });

    return results;
}

/**
 * Defensive effectiveness of a 1-3 type combination against every type in
 * `types`, bucketed by multiplier. Pure type math only — no abilities or
 * items (see modifiers.js for that layer, applied on top of
 * `computeDefenseMap`).
 * @param {string} type1
 * @param {string|null} type2
 * @param {string[]} types
 * @param {Record<string, Record<string, number>>} effectiveness
 * @param {string|null} [type3]
 */
export function calculateDefense(type1, type2, types, effectiveness, type3 = null) {
    return bucketDefenseMap(computeDefenseMap(type1, type2, types, effectiveness, type3));
}

/**
 * Offensive effectiveness of a 1-3 type combination against every type in
 * `types`. Offense uses the best available STAB move (Math.max across the
 * attacker's own types), not a product — a dual/triple-type attacker only
 * needs one type to hit hard.
 * @param {string} type1
 * @param {string|null} type2
 * @param {string[]} types
 * @param {Record<string, Record<string, number>>} effectiveness
 * @param {string|null} [type3]
 */
export function calculateOffense(type1, type2, types, effectiveness, type3 = null) {
    const results = {
        superEffective2x: [],
        neutral: [],
        notVeryEffective: [],
        noEffect: []
    };

    types.forEach(defendingType => {
        let modifier = getEffectiveness(type1, defendingType, effectiveness);
        if (type2) modifier = Math.max(modifier, getEffectiveness(type2, defendingType, effectiveness));
        if (type3) modifier = Math.max(modifier, getEffectiveness(type3, defendingType, effectiveness));

        if (modifier >= 2) results.superEffective2x.push(defendingType);
        else if (modifier === 1) results.neutral.push(defendingType);
        else if (modifier === 0.5) results.notVeryEffective.push(defendingType);
        else if (modifier === 0) results.noEffect.push(defendingType);
    });

    return results;
}

/**
 * Dual-type defending combinations that are "Totally Walled" against a
 * given attacker (single or dual type) — i.e. the attacker's best
 * available STAB move still does 0 damage — excluding pairs where either
 * type alone would already be immune (redundant pairs).
 * @param {string} type1
 * @param {string|null} type2
 * @param {string[]} types
 * @param {Record<string, Record<string, number>>} effectiveness
 */
export function findImmuneDualTypes(type1, type2, types, effectiveness) {
    const immuneCombinations = [];

    const isImmuneToAll = (defType) => {
        const d1 = getEffectiveness(type1, defType, effectiveness);
        const d2 = type2 ? getEffectiveness(type2, defType, effectiveness) : 0;
        const bestOutcome = type2 ? Math.max(d1, d2) : d1;
        return bestOutcome === 0;
    };

    for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
            const defType1 = types[i];
            const defType2 = types[j];

            const damage1 = getEffectiveness(type1, defType1, effectiveness) * getEffectiveness(type1, defType2, effectiveness);
            let damage2 = 0;
            if (type2) {
                damage2 = getEffectiveness(type2, defType1, effectiveness) * getEffectiveness(type2, defType2, effectiveness);
            }
            const pairBestOutcome = type2 ? Math.max(damage1, damage2) : damage1;

            if (pairBestOutcome === 0) {
                const d1AloneImmune = isImmuneToAll(defType1);
                const d2AloneImmune = isImmuneToAll(defType2);

                if (!d1AloneImmune && !d2AloneImmune) {
                    immuneCombinations.push([defType1, defType2]);
                }
            }
        }
    }
    return immuneCombinations;
}
