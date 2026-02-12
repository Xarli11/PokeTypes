import { getEffectiveness } from './calculator.js?v=2.22.2';
import { capitalizeWords } from './ui.js?v=2.22.2';

export function getTacticalAdvice(weaknesses4x, weaknesses2x, allTypes, effectiveness, pokemonList, activePokemon = null) {
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

    // 3. Find Example Pokemon with Dynamic Tiering
    const suggestions = [];
    
    // Define Tiers
    const TIERS = {
        HIGH: { min: 570, label: 'High' }, // Legendaries, Paradox, Pseudos
        MID: { min: 420, max: 570, label: 'Mid' }, // Fully Evolved, Strong NFEs
        LOW: { max: 420, label: 'Low' } // LC, Weak NFEs
    };

    // Determine Active Tier
    let activeTier = 'MID'; // Default for Type-only analysis
    if (activePokemon && activePokemon.bst) {
        if (activePokemon.bst >= TIERS.HIGH.min) activeTier = 'HIGH';
        else if (activePokemon.bst <= TIERS.LOW.max) activeTier = 'LOW';
        else activeTier = 'MID';
    } else {
        // If just analyzing types (no specific pokemon), assume competitive standard (Mid-High)
        activeTier = 'MID'; 
    }

    if (pokemonList && Array.isArray(pokemonList)) {
        topTypes.forEach(type => {
            // Base filter: Type match, basic form validity
            const baseFilter = p => 
                p.types && p.types.includes(type) && 
                p.name && !p.name.includes('Gmax');

            // Strategy: Try to find match in the SAME tier first.
            let candidates = [];
            
            // Helper to get candidates by tier
            const getByTier = (tier) => {
                return pokemonList.filter(p => {
                    if (!baseFilter(p)) return false;
                    const bst = p.bst || 0;
                    if (tier === 'HIGH') return bst >= TIERS.HIGH.min;
                    if (tier === 'MID') return bst >= TIERS.MID.min && bst < TIERS.MID.max;
                    if (tier === 'LOW') return bst < TIERS.LOW.max;
                    return false;
                });
            };

            // 1. Try Same Tier
            candidates = getByTier(activeTier);

            // 2. Fallback logic
            if (candidates.length === 0) {
                if (activeTier === 'HIGH') candidates = getByTier('MID'); // Uber -> OU
                else if (activeTier === 'MID') candidates = [...getByTier('HIGH'), ...getByTier('LOW')]; // OU -> Uber/UU
                else if (activeTier === 'LOW') candidates = getByTier('MID'); // LC -> PU/NU
            }

            // FILTER & SCORE: 
            // 1. Must resist the main threat.
            // 2. Bonus points for resisting other weaknesses (coverage).
            if (candidates.length > 0) {
                const secondaryThreats = [...(weaknesses4x || []), ...(weaknesses2x || [])].filter(t => t !== targetThreat);
                
                const scoredCandidates = candidates.map(p => {
                    let score = 0;
                    
                    // check main threat resistance
                    let mainDef = 1;
                    p.types.forEach(t => mainDef *= getEffectiveness(targetThreat, t, effectiveness));
                    if (mainDef >= 1) return null; // Discard if doesn't resist main threat
                    
                    // score secondary coverage
                    secondaryThreats.forEach(secThreat => {
                        let secDef = 1;
                        p.types.forEach(t => secDef *= getEffectiveness(secThreat, t, effectiveness));
                        if (secDef < 1) score++;
                    });
                    
                    return { pokemon: p, score: score };
                }).filter(c => c !== null);

                // Sort by Score DESC, then Random
                candidates = scoredCandidates
                    .sort((a, b) => {
                        if (b.score !== a.score) return b.score - a.score;
                        return 0.5 - Math.random();
                    })
                    .map(c => c.pokemon);
            }

            if (candidates.length > 0) {
                // Pick the top one after scoring
                suggestions.push(candidates[0]);
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
