import { getEffectiveness, getAbilityModifiers } from './calculator.js?v=2.23.1';
import { capitalizeWords } from './ui.js?v=2.23.1';

export function getTacticalAdvice(weaknesses4x, weaknesses2x, allTypes, effectiveness, pokemonList, activePokemon = null) {
    // Filter weaknesses based on abilities (e.g. Levitate)
    let relevantWeaknesses4x = [...(weaknesses4x || [])];
    let relevantWeaknesses2x = [...(weaknesses2x || [])];

    if (activePokemon && activePokemon.abilities) {
        const abilities = Object.values(activePokemon.abilities);
        const immuneTypes = new Set();

        abilities.forEach(abilityName => {
            const modifiers = getAbilityModifiers(abilityName);
            modifiers.forEach(mod => {
                if (mod.modifier === 0) {
                    immuneTypes.add(mod.type);
                }
            });
        });

        relevantWeaknesses4x = relevantWeaknesses4x.filter(t => !immuneTypes.has(t));
        relevantWeaknesses2x = relevantWeaknesses2x.filter(t => !immuneTypes.has(t));
    }

    // 1. Identify the biggest threat
    let targetThreat = null;
    let threatMultiplier = 0;

    if (relevantWeaknesses4x.length > 0) {
        targetThreat = relevantWeaknesses4x[0]; // Focus on the first x4 weakness
        threatMultiplier = 4;
    } else if (relevantWeaknesses2x.length > 0) {
        targetThreat = relevantWeaknesses2x[0]; // Focus on the first x2 weakness
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

    // 3. Find Example Pokemon with Smart Scoring
    const suggestions = [];
    
    // Define Tiers (Adjusted for better quality)
    const TIERS = {
        HIGH: { min: 560, label: 'High' }, // Legends, Paradox, Pseudos
        MID: { min: 450, max: 560, label: 'Mid' }, // Strong Standards (Starters, etc.)
        LOW: { max: 450, label: 'Low' } // Niche, NFE, LC
    };

    // Determine Active Tier
    let activeTier = 'MID'; 
    let activeWeaknesses = [];
    
    if (activePokemon) {
        if (activePokemon.bst) {
            if (activePokemon.bst >= TIERS.HIGH.min) activeTier = 'HIGH';
            else if (activePokemon.bst <= TIERS.LOW.max) activeTier = 'LOW';
            else activeTier = 'MID';
        }
        
        // Calculate Active Pokemon's weaknesses for penalty logic
        // We need to know what the active pokemon is weak to, to check for shared weaknesses
        // We can infer this from the passed `weaknesses4x` and `weaknesses2x` lists
        // Note: Using filtered lists to avoid penalizing negated weaknesses
        activeWeaknesses = [...(relevantWeaknesses4x || []), ...(relevantWeaknesses2x || [])];
    } 

    // Exclude battle-only forms, Megas, and other non-standard forms
    const EXCLUDED_FORMS = [
        '-Mega', '-Gmax', '-Eternamax', 
        '-Zen', '-Pirouette', '-Resolute', '-Sunshine', '-Rainy', '-Snowy', 
        '-Sunny', '-Castform', '-Primal', '-Origin', '-Therian', '-Sky',
        '-School', '-Complete', '-Ash', '-Hero', '-Blade'
    ];
    // Note: Some forms like 'Therian', 'Origin', 'Sky' might be competitive standard.
    // However, 'Zen' is definitely battle-only. 
    // Let's be specific to avoid excluding valid forms like Landorus-Therian if possible.
    // For now, let's target the problematic ones reported: Zen.
    
    const STRICT_EXCLUSIONS = [
        '-Mega', 'Mega ', 
        '-Gmax', 'Gmax ',
        '-Eternamax', 
        '-Zen', '-Pirouette', '-School', '-Complete', '-Ash', 
        '-Meteor', '-Busted', '-Gulping', '-Gorging',
        'Primal ', '-Primal'
    ];

    const UBER_NAMES = [
        'Arceus', 'Eternatus', 'Zacian', 'Zamazenta', 'Calyrex', 'Koraidon', 'Miraidon', 'Mewtwo', 
        'Lugia', 'Ho-Oh', 'Rayquaza', 'Kyogre', 'Groudon', 'Dialga', 'Palkia', 'Giratina', 
        'Reshiram', 'Zekrom', 'Kyurem', 'Xerneas', 'Yveltal', 'Solgaleo', 'Lunala', 'Necrozma'
    ];

    if (pokemonList && Array.isArray(pokemonList)) {
        topTypes.forEach(type => {
            // Determine if active pokemon is Uber-tier (BST >= 670)
            const isActiveUber = activePokemon && (activePokemon.bst || 0) >= 670;

            // Base filter: Type match, basic form validity
            const baseFilter = p => {
                // Always exclude gimmicks
                if (STRICT_EXCLUSIONS.some(ex => p.name.includes(ex))) return false;
                
                // If active is NOT Uber, exclude Uber candidates
                if (!isActiveUber && UBER_NAMES.some(uber => p.name.includes(uber))) return false;

                return p.types && p.types.includes(type) && p.name;
            };

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

            // 1. Get Candidates (Try Same Tier -> Fallback)
            let candidates = getByTier(activeTier);
            if (candidates.length === 0) {
                if (activeTier === 'HIGH') candidates = getByTier('MID');
                else if (activeTier === 'MID') candidates = [...getByTier('HIGH'), ...getByTier('LOW')];
                else if (activeTier === 'LOW') candidates = getByTier('MID');
            }

            // 2. SMART SCORING ALGORITHM
            if (candidates.length > 0) {
                const secondaryThreats = activeWeaknesses.filter(t => t !== targetThreat);
                
                const scoredCandidates = candidates.map(p => {
                    let score = 0;
                    
                    // A. Main Threat Resistance (Mandatory Check, Weighted)
                    let mainDef = 1;
                    p.types.forEach(t => mainDef *= getEffectiveness(targetThreat, t, effectiveness));
                    
                    if (mainDef >= 1) return null; // Discard if doesn't resist main threat
                    
                    score += 100; // Base score for being a counter
                    
                    // Boost for hard counters (Immunity is King)
                    if (mainDef === 0) score += 60; 
                    else if (mainDef <= 0.25) score += 40; 

                    // B. Coverage Bonus (Resisting other weaknesses of the active mon)
                    secondaryThreats.forEach(secThreat => {
                        let secDef = 1;
                        p.types.forEach(t => secDef *= getEffectiveness(secThreat, t, effectiveness));
                        if (secDef < 1) score += 20;
                        if (secDef <= 0.25) score += 5; // Slight bonus for hard resist
                    });

                    // C. Stat Weight (BST)
                    // 600 BST -> +120 pts
                    // 400 BST -> +80 pts
                    // Difference of 40 pts helps break ties between Magcargo and Heatran
                    score += ((p.bst || 400) / 5);

                    // D. Shared Weakness Penalty (Synergy Check)
                    // If the candidate is ALSO weak to what the Active mon is weak to, that's bad.
                    if (activePokemon) {
                        activeWeaknesses.forEach(weakness => {
                            let candidateDef = 1;
                            p.types.forEach(t => candidateDef *= getEffectiveness(weakness, t, effectiveness));
                            
                            if (candidateDef > 1) {
                                score -= 20; // Shared weakness penalty
                                if (candidateDef >= 4) score -= 30; // Shared x4 weakness is VERY bad
                            }
                        });
                    }

                    return { pokemon: p, score: score };
                }).filter(c => c !== null);

                // Sort by Score DESC
                candidates = scoredCandidates
                    .sort((a, b) => b.score - a.score)
                    .map(c => c.pokemon);
            }

            if (candidates.length > 0) {
                // Pick the absolute best match
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
