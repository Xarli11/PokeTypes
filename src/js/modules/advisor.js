import { getEffectiveness } from './calculator.js';
import { capitalizeWords } from './ui.js';

export function getTacticalAdvice(weaknesses4x, weaknesses2x, allTypes, effectiveness, pokemonList) {
    // 1. Identify the biggest threat
    let targetThreat = null;
    let threatMultiplier = 0;

    if (weaknesses4x && weaknesses4x.length > 0) {
        targetThreat = weaknesses4x[0]; // Focus on the first x4 weakness
        threatMultiplier = 4;
    } else if (weaknesses2x && weaknesses2x.length > 0) {
        targetThreat = weaknesses2x[0]; // Focus on the first x2 weakness
        threatMultiplier = 2;
    } else {
        return null; // No weaknesses? No advice needed (or you are Eelektross)
    }

    // 2. Find the perfect counter type (The "Shield & Sword" logic)
    // We want a type that:
    // A) Resists the Threat (Damage taken < 1)
    // B) Hits the Threat Super Effectively (Damage dealt > 1)
    
    const candidates = [];

    allTypes.forEach(myType => {
        // A) Does 'myType' resist 'targetThreat'?
        // attackingType = targetThreat, defendingType = myType
        const defenseMod = getEffectiveness(targetThreat, myType, effectiveness);
        
        // B) Does 'myType' hit 'targetThreat' hard?
        // attackingType = myType, defendingType = targetThreat
        const offenseMod = getEffectiveness(myType, targetThreat, effectiveness);

        if (defenseMod < 1 && offenseMod > 1) {
            candidates.push({ type: myType, score: 2 }); // Perfect Counter
        } else if (defenseMod < 1) {
            candidates.push({ type: myType, score: 1 }); // Defensive Switch-in only
        }
    });

    // Sort by score (Perfect counters first)
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length === 0) return null;

    // Pick top 2 candidate types
    const topTypes = candidates.slice(0, 2).map(c => c.type);

    // 3. Find Example Pokemon (High Stats)
    const suggestions = [];
    
    if (pokemonList && Array.isArray(pokemonList)) {
        topTypes.forEach(type => {
            const potentialPartners = pokemonList.filter(p => 
                p.types && p.types.includes(type) && 
                p.name && !p.name.includes('Mega') && 
                !p.name.includes('Gmax')
            );
            
            if (potentialPartners.length > 0) {
                // Shuffle
                const shuffled = potentialPartners.sort(() => 0.5 - Math.random());
                const example = shuffled[0];
                suggestions.push(example);
            }
        });
    }

    // 4. Construct the advice object
    return {
        threat: targetThreat,
        multiplier: threatMultiplier,
        suggestedTypes: topTypes,
        suggestedPokemon: suggestions // Can be empty, UI should handle it
    };
}
