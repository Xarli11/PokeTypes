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
