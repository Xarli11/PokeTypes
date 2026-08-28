// src/lib/type-engine/team.js
//
// Team-wide defensive analysis for the Team Builder ("pro mode"). Built
// entirely on the shared computeDefenseMap/applyDefensiveModifiers/
// classifyMultiplier primitives, so a Pokemon's ability and item modifiers
// are applied identically here and in the single-Pokemon Ability
// Interaction Checker (simulator.js) — there is only one engine, not two.

import { computeDefenseMap, computeDefenseMapIgnoringTypeImmunities } from './effectiveness.js';
import { applyDefensiveModifiers, getAbilityModifiers, getItemModifiers } from './modifiers.js';
import { classifyMultiplier } from './result.js';

/**
 * Raw (typing-only) vs effective (typing + that Pokemon's confirmed
 * ability/item modifiers) defense map for a single Pokemon. Kept
 * distinct so a future UI can show e.g. "Rock 2x, reduced by Solid Rock
 * -> effective 1.5x" without losing the original type matchup — see
 * docs/type-engine.md, "Raw vs effective".
 *
 * `context` is forwarded to applyDefensiveModifiers unchanged (see
 * modifiers.js for what it gates): omitting it — the default everywhere
 * in analyzeTeamDefense below — means no unconfirmed battle condition
 * (full HP, contact, ...) is ever assumed to hold.
 * @param {{ types: string[], ability?: string|null, item?: string|null }} pokemon
 * @param {string[]} allTypes
 * @param {Record<string, Record<string, number>>} effectiveness
 * @param {Record<string, boolean>} [context]
 * @returns {{ raw: Record<string, number>, effective: Record<string, number> }}
 */
export function getPokemonDefenseBreakdown(pokemon, allTypes, effectiveness, context = {}) {
    const [t1, t2 = null, t3 = null] = pokemon.types;
    const raw = computeDefenseMap(t1, t2, allTypes, effectiveness, t3);

    const modifiers = [
        ...getAbilityModifiers(pokemon.ability),
        ...getItemModifiers(pokemon.item)
    ];

    if (modifiers.length === 0) {
        return { raw, effective: raw };
    }

    const ignoringTypeImmunityMap = computeDefenseMapIgnoringTypeImmunities(t1, t2, allTypes, effectiveness, t3);
    const effective = applyDefensiveModifiers(raw, modifiers, allTypes, { context, ignoringTypeImmunityMap });

    return { raw, effective };
}

/**
 * For every type in `allTypes`, counts how many active team members are
 * weak to / resist / are immune to it, accounting for each member's
 * ability and held item — but never an unconfirmed battle condition
 * (full HP, a move making contact, ...), since Team Builder has no way
 * to know those. `matrix[type].weak/resist/immune` is therefore always
 * derived from: typing + the member's selected ability + selected item,
 * nothing else. See docs/type-engine.md, "Team result semantics".
 * @param {Array<object|null>} team
 * @param {string[]} allTypes
 * @param {Record<string, Record<string, number>>} effectiveness
 */
export function analyzeTeamDefense(team, allTypes, effectiveness) {
    const defenseMatrix = {};

    allTypes.forEach(type => {
        defenseMatrix[type] = {
            weak: 0,
            resist: 0,
            immune: 0,
            pokemonWeak: [],
            pokemonResist: [],
            pokemonImmune: []
        };
    });

    const activeMembers = team.filter(p => p !== null);

    activeMembers.forEach(pokemon => {
        const { effective } = getPokemonDefenseBreakdown(pokemon, allTypes, effectiveness);

        Object.entries(effective).forEach(([type, multiplier]) => {
            const bucket = defenseMatrix[type];
            if (!bucket) return;

            switch (classifyMultiplier(multiplier)) {
                case 'weak':
                    bucket.weak++;
                    bucket.pokemonWeak.push(pokemon.name);
                    break;
                case 'resist':
                    bucket.resist++;
                    bucket.pokemonResist.push(pokemon.name);
                    break;
                case 'immune':
                    bucket.immune++;
                    bucket.pokemonImmune.push(pokemon.name);
                    break;
                // 'neutral' contributes to none of the three tallies.
            }
        });
    });

    return {
        matrix: defenseMatrix,
        teamSize: activeMembers.length
    };
}

export function getThreatAlerts(analysis) {
    const alerts = [];
    const { matrix, teamSize } = analysis;

    if (teamSize === 0) return alerts;

    const HIGH_WEAKNESS_COUNT = Math.max(3, Math.ceil(teamSize / 2));

    Object.entries(matrix).forEach(([type, data]) => {
        if (data.weak >= HIGH_WEAKNESS_COUNT) {
            alerts.push({
                type: 'danger',
                messageType: type,
                count: data.weak,
                code: 'major_weakness'
            });
        }

        if (data.resist === 0 && data.immune === 0 && data.weak > 0) {
            alerts.push({
                type: 'warning',
                messageType: type,
                count: data.weak,
                code: 'no_switch_in'
            });
        }
    });

    return alerts;
}
