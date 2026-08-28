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
 * For every type in `allTypes`, counts how many active team members are
 * weak to / resist / are immune to it, accounting for each member's
 * ability and held item.
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
        const t1 = pokemon.types[0];
        const t2 = pokemon.types[1] || null;

        const baseMap = computeDefenseMap(t1, t2, allTypes, effectiveness);

        const modifiers = [
            ...getAbilityModifiers(pokemon.ability),
            ...getItemModifiers(pokemon.item)
        ];

        const finalMap = modifiers.length > 0
            ? applyDefensiveModifiers(baseMap, modifiers, allTypes, {
                ignoringTypeImmunityMap: computeDefenseMapIgnoringTypeImmunities(t1, t2, allTypes, effectiveness)
            })
            : baseMap;

        Object.entries(finalMap).forEach(([type, multiplier]) => {
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
