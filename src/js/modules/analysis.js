// src/js/modules/analysis.js
import { calculateDefense } from './calculator.js?v=2.22.8';

export function analyzeTeamDefense(team, allTypes, effectiveness) {
    // Initialize counters for all 18 types
    const defenseMatrix = {};
    
    allTypes.forEach(type => {
        defenseMatrix[type] = {
            weak: 0, // x2 or x4
            resist: 0, // x0.5 or x0.25
            immune: 0, // x0
            pokemonWeak: [],   // Names of weak pokemon
            pokemonResist: [], // Names of resistant pokemon
            pokemonImmune: []  // Names of immune pokemon
        };
    });

    const activeMembers = team.filter(p => p !== null);

    activeMembers.forEach(pokemon => {
        // Calculate defense for this pokemon
        const t1 = pokemon.types[0];
        const t2 = pokemon.types[1] || null;
        
        // TODO: Handle Tera Type override logic here later
        // If pokemon.teraActive && pokemon.teraType -> use just teraType
        
        const def = calculateDefense(t1, t2, allTypes, effectiveness);

        // Process Weaknesses (x4 and x2)
        [...def.weaknesses4x, ...def.weaknesses2x].forEach(type => {
            if (defenseMatrix[type]) {
                defenseMatrix[type].weak++;
                defenseMatrix[type].pokemonWeak.push(pokemon.name);
            }
        });

        // Process Resistances (x0.25 and x0.5)
        [...def.resistances025x, ...def.resistances05x].forEach(type => {
            if (defenseMatrix[type]) {
                defenseMatrix[type].resist++;
                defenseMatrix[type].pokemonResist.push(pokemon.name);
            }
        });

        // Process Immunities (x0)
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

    // Thresholds
    const HIGH_WEAKNESS_COUNT = Math.ceil(teamSize / 2); // e.g. 3 for team of 6

    Object.entries(matrix).forEach(([type, data]) => {
        // Alert: Major shared weakness
        if (data.weak >= HIGH_WEAKNESS_COUNT) {
            alerts.push({
                type: 'danger',
                messageType: type,
                count: data.weak,
                code: 'major_weakness'
            });
        }
        
        // Alert: Unresisted type (No resist, no immune, at least 1 weak?)
        // Or simply "No switch-in for X" (No resist/immune)
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
