// src/js/modules/analysis.js
import { calculateDefense, getAbilityModifiers, getItemModifiers } from './calculator.js';

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
        
        const def = calculateDefense(t1, t2, allTypes, effectiveness);

        // Combined modifiers from Ability and Item
        const allMods = [
            ...getAbilityModifiers(pokemon.ability),
            ...getItemModifiers(pokemon.item)
        ];

        if (allMods.length > 0) {
            allMods.forEach(mod => {
                if (mod.modifier === 0) {
                    const typesToProcess = mod.type === 'All' ? allTypes : [mod.type];
                    
                    typesToProcess.forEach(type => {
                        // Remove from other buckets
                        def.weaknesses4x = def.weaknesses4x.filter(t => t !== type);
                        def.weaknesses2x = def.weaknesses2x.filter(t => t !== type);
                        def.neutral = def.neutral.filter(t => t !== type);
                        def.resistances05x = def.resistances05x.filter(t => t !== type);
                        def.resistances025x = def.resistances025x.filter(t => t !== type);
                        
                        // Add to immunities
                        if (!def.immunities.includes(type)) {
                            def.immunities.push(type);
                        }
                    });
                }
            });
        }

        [...def.weaknesses4x, ...def.weaknesses2x].forEach(type => {
            if (defenseMatrix[type]) {
                defenseMatrix[type].weak++;
                defenseMatrix[type].pokemonWeak.push(pokemon.name);
            }
        });

        [...def.resistances025x, ...def.resistances05x].forEach(type => {
            if (defenseMatrix[type]) {
                defenseMatrix[type].resist++;
                defenseMatrix[type].pokemonResist.push(pokemon.name);
            }
        });

        def.immunities.forEach(type => {
            if (defenseMatrix[type]) {
                defenseMatrix[type].immune++;
                defenseMatrix[type].pokemonImmune.push(pokemon.name);
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

export function analyzeTeamRoles(team, pokemonList) {
    const roles = {
        role_phys_sweeper: 0,
        role_spec_sweeper: 0,
        role_phys_wall: 0,
        role_spec_wall: 0,
        role_speedster: 0
    };

    team.filter(p => p).forEach(member => {
        const data = pokemonList.find(p => p.id === member.id && p.name === member.name);
        if (!data || !data.stats) return;
        
        let { hp, atk, def, spa, spd, spe } = data.stats;

        // Apply item modifiers to stats for role analysis
        if (member.item) {
            const itemSlug = member.item.toLowerCase().replace(/ /g, '-');
            if (itemSlug === 'assault-vest') spd *= 1.5;
            if (itemSlug === 'eviolite') {
                def *= 1.5;
                spd *= 1.5;
            }
        }

        // Simple heuristics based on modified base stats thresholds
        if (spe >= 100) roles.role_speedster++;
        
        if (atk >= 100 && atk >= spa) roles.role_phys_sweeper++;
        if (spa >= 100 && spa >= atk) roles.role_spec_sweeper++;
        
        if (def >= 100 && def >= spd) roles.role_phys_wall++;
        if (spd >= 100 && spd >= def) roles.role_spec_wall++;
    });
    
    return roles;
}