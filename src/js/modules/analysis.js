// src/js/modules/analysis.js
//
// Team-wide defense analysis now lives in the shared type engine
// (src/lib/type-engine/team.js) so the Team Builder applies ability/item
// modifiers with the exact same logic as the single-Pokemon Ability
// Interaction Checker (simulator.js). Re-exported here so pro.js doesn't
// need to know where the engine lives.
export { analyzeTeamDefense, getThreatAlerts } from '../../lib/type-engine/team.js';

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

        // Thresholds calibrated to competitive benchmarks:
        // Speedster ≥95 spe (outspeeds unboosted base-100 with +nature)
        // Sweepers ≥110 atk/spa (genuinely threatening, e.g. Garchomp 130, Gengar 130)
        // Walls ≥100 def/spd with ≥65 hp to distinguish walls from frail defenders
        if (spe >= 95) roles.role_speedster++;

        if (atk >= 110 && atk >= spa) roles.role_phys_sweeper++;
        if (spa >= 110 && spa >= atk) roles.role_spec_sweeper++;

        if (def >= 100 && hp >= 65) roles.role_phys_wall++;
        if (spd >= 100 && hp >= 65) roles.role_spec_wall++;
    });
    
    return roles;
}