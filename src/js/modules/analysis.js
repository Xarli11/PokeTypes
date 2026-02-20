// src/js/modules/analysis.js
import { calculateDefense, getAbilityModifiers } from './calculator.js?v=2.24.0';

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

        // Apply Ability Overrides
        if (pokemon.ability) {
            const mods = getAbilityModifiers(pokemon.ability);
            mods.forEach(mod => {
                if (mod.modifier === 0) {
                    // Immunity!
                    // Check if the type matches specific type OR 'All' (Wonder Guard, etc - though Wonder Guard is complex)
                    // For now, handle specific type immunities (Levitate, Flash Fire, etc)
                    
                    // Logic: If mod.type is 'Ground' and modifier is 0
                    // Remove 'Ground' from weaknesses/neutral/resists lists in 'def'
                    // Add 'Ground' to 'def.immunities'
                    
                    const typesToProcess = mod.type === 'All' ? allTypes : [mod.type];
                    
                    typesToProcess.forEach(type => {
                        // Remove from other lists
                        def.weaknesses4x = def.weaknesses4x.filter(t => t !== type);
                        def.weaknesses2x = def.weaknesses2x.filter(t => t !== type);
                        def.neutral = def.neutral.filter(t => t !== type);
                        def.resistances05x = def.resistances05x.filter(t => t !== type);
                        def.resistances025x = def.resistances025x.filter(t => t !== type);
                        
                        // Add to immunities if not already there
                        if (!def.immunities.includes(type)) {
                            def.immunities.push(type);
                        }
                    });
                } else {
                    // Handle non-immunity modifiers (e.g. Thick Fat 0.5x, Fluffy 2x)
                    // This is harder because we need to shift them between arrays.
                    // E.g. Thick Fat vs Fire. 
                    // If Fire was in Weaknesses4x -> 2x.
                    // If Fire was in Weaknesses2x -> 1x (Neutral).
                    // If Fire was in Neutral -> 0.5x (Resist).
                    // This requires recalculating the multiplier or shifting.
                    
                    // Simplified: We skip complex partial modifiers for the MVP coverage matrix 
                    // unless specifically requested, as recalculating "buckets" is tricky without raw values.
                    // But user asked for Levitate (Immunity), which is handled above.
                    // Let's stick to Immunities for now as they are the most impactful for "Coverage".
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
        
        const s = data.stats;
        // Simple heuristics based on base stats thresholds
        // Speedster: Fast
        if (s.spe >= 100) roles.role_speedster++;
        
        // Attackers: High offensive stat
        if (s.atk >= 100 && s.atk >= s.spa) roles.role_phys_sweeper++;
        if (s.spa >= 100 && s.spa >= s.atk) roles.role_spec_sweeper++;
        
        // Walls: High defensive stat
        if (s.def >= 100 && s.def >= s.spd) roles.role_phys_wall++;
        if (s.spd >= 100 && s.spd >= s.def) roles.role_spec_wall++;
    });
    
    return roles;
}