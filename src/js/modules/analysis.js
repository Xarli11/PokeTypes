// src/js/modules/analysis.js
import { calculateDefense } from './calculator.js?v=2.22.8';

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