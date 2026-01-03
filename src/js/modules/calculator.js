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
        resistances: [],
        immunities: []
    };

    types.forEach(attackingType => {
        let modifier = getEffectiveness(attackingType, type1, effectiveness);
        if (type2) modifier *= getEffectiveness(attackingType, type2, effectiveness);

        if (modifier === 4) results.weaknesses4x.push(attackingType);
        else if (modifier === 2) results.weaknesses2x.push(attackingType);
        else if (modifier === 0.5 || modifier === 0.25) results.resistances.push(attackingType);
        else if (modifier === 0) results.immunities.push(attackingType);
    });

    return results;
}

export function calculateOffense(type1, type2, types, effectiveness) {
    const results = {
        superEffective2x: [],
        notVeryEffective: [],
        noEffect: []
    };

    types.forEach(defendingType => {
        let modifier = getEffectiveness(type1, defendingType, effectiveness);
        if (type2) modifier = Math.max(modifier, getEffectiveness(type2, defendingType, effectiveness));

        if (modifier >= 2) results.superEffective2x.push(defendingType);
        else if (modifier === 0.5) results.notVeryEffective.push(defendingType);
        else if (modifier === 0) results.noEffect.push(defendingType);
    });

    return results;
}

export function findImmuneDualTypes(type1, type2, types, effectiveness) {
    const immuneCombinations = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
            const defType1 = types[i];
            const defType2 = types[j];

            // Damage from Attacker Type 1
            const damage1 = getEffectiveness(type1, defType1, effectiveness) * getEffectiveness(type1, defType2, effectiveness);
            
            // Damage from Attacker Type 2 (if present)
            let damage2 = 0;
            if (type2) {
                damage2 = getEffectiveness(type2, defType1, effectiveness) * getEffectiveness(type2, defType2, effectiveness);
            }

            // If we have two types, we use the one that deals the most damage.
            // If the BEST we can do is still 0, then they are fully immune.
            const bestOutcome = type2 ? Math.max(damage1, damage2) : damage1;

            if (bestOutcome === 0) {
                immuneCombinations.push([defType1, defType2]);
            }
        }
    }
    return immuneCombinations;
}