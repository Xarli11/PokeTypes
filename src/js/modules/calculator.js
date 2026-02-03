export function getEffectiveness(attackingType, defendingType, typeEffectiveness) {
    const attackerEffects = typeEffectiveness[attackingType];
    if (attackerEffects && attackerEffects.hasOwnProperty(defendingType)) {
        return attackerEffects[defendingType];
    }
    return 1;
}

export function calculateDefense(type1, type2, types, effectiveness) {
    const results = {
        weaknesses4x: [],
        weaknesses2x: [],
        neutral: [],
        resistances05x: [],
        resistances025x: [],
        immunities: []
    };

    types.forEach(attackingType => {
        let modifier = getEffectiveness(attackingType, type1, effectiveness);
        if (type2) modifier *= getEffectiveness(attackingType, type2, effectiveness);

        if (modifier === 4) results.weaknesses4x.push(attackingType);
        else if (modifier === 2) results.weaknesses2x.push(attackingType);
        else if (modifier === 1) results.neutral.push(attackingType);
        else if (modifier === 0.5) results.resistances05x.push(attackingType);
        else if (modifier === 0.25) results.resistances025x.push(attackingType);
        else if (modifier === 0) results.immunities.push(attackingType);
    });

    return results;
}

export function calculateOffense(type1, type2, types, effectiveness) {
    const results = {
        superEffective2x: [],
        neutral: [],
        notVeryEffective: [],
        noEffect: []
    };

    types.forEach(defendingType => {
        let modifier = getEffectiveness(type1, defendingType, effectiveness);
        if (type2) modifier = Math.max(modifier, getEffectiveness(type2, defendingType, effectiveness));

        if (modifier >= 2) results.superEffective2x.push(defendingType);
        else if (modifier === 1) results.neutral.push(defendingType);
        else if (modifier === 0.5) results.notVeryEffective.push(defendingType);
        else if (modifier === 0) results.noEffect.push(defendingType);
    });

    return results;
}

export function findImmuneDualTypes(type1, type2, types, effectiveness) {
    const immuneCombinations = [];

    // Helper to check if a single defending type is immune to ALL attacker types
    const isImmuneToAll = (defType) => {
        const d1 = getEffectiveness(type1, defType, effectiveness);
        const d2 = type2 ? getEffectiveness(type2, defType, effectiveness) : 0;
        
        // If single type attacker: needs to be immune to type1 (d1 === 0)
        // If dual type attacker: needs to be immune to type1 AND type2 (d1 === 0 && d2 === 0)
        // Wait, "Totally Walled" means the attacker has NO moves that work.
        // So the defender must be immune to the BEST option.
        // If Attacker has Electric (0 vs Ground) and Normal (1 vs Ground). Max is 1. Ground is NOT immune to all.
        // If Attacker has Electric (0 vs Ground) and Poison (0.5 vs Ground). Max is 0.5.
        // We want cases where Max(Damage) is 0.
        
        const bestOutcome = type2 ? Math.max(d1, d2) : d1;
        return bestOutcome === 0;
    };

    for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
            const defType1 = types[i];
            const defType2 = types[j];

            // 1. Check strict immunity for the pair
            const damage1 = getEffectiveness(type1, defType1, effectiveness) * getEffectiveness(type1, defType2, effectiveness);
            let damage2 = 0;
            if (type2) {
                damage2 = getEffectiveness(type2, defType1, effectiveness) * getEffectiveness(type2, defType2, effectiveness);
            }
            const pairBestOutcome = type2 ? Math.max(damage1, damage2) : damage1;

            if (pairBestOutcome === 0) {
                // 2. Filter out redundant pairs (where one type alone is enough)
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
    'filter': [{ type: 'All', modifier: 0.75, description: 'Reduces Super Effective damage by 25%.' }],
    'solid-rock': [{ type: 'All', modifier: 0.75, description: 'Reduces Super Effective damage by 25%.' }],
    'prism-armor': [{ type: 'All', modifier: 0.75, description: 'Reduces Super Effective damage by 25%.' }],
    'wonder-guard': [{ type: 'All', modifier: 0, description: 'Immune to all non-Super Effective damage.' }],
    'multiscale': [{ type: 'All', modifier: 0.5, description: 'Halves damage when HP is full.' }],
    'shadow-shield': [{ type: 'All', modifier: 0.5, description: 'Halves damage when HP is full.' }],
    'tera-shell': [{ type: 'All', modifier: 0.5, description: 'All moves are Not Very Effective when HP is full.' }],
    'delta-stream': [{ type: 'Flying', modifier: 1, description: 'Removes weaknesses of Flying-type Pokemon.' }],
    'desolate-land': [{ type: 'Water', modifier: 0, description: 'Grants immunity to Water-type moves.' }],
    'primordial-sea': [{ type: 'Fire', modifier: 0, description: 'Grants immunity to Fire-type moves.' }],
    'tinted-lens': [{ type: 'Offensive', modifier: 2, description: 'Doubles damage of "Not Very Effective" moves.' }],
    'scrappy': [{ type: 'Offensive', modifier: 1, description: 'Allows Normal and Fighting moves to hit Ghost types.' }],
    'minds-eye': [{ type: 'Offensive', modifier: 1, description: 'Allows Normal and Fighting moves to hit Ghost types.' }]
};

export function getAbilityModifiers(abilityName) {
    if (!abilityName) return [];
    return ABILITY_EFFECTIVENESS[abilityName.toLowerCase()] || [];
}