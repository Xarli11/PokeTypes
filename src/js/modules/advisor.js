import { getEffectiveness, getAbilityModifiers } from './calculator.js';
import { capitalizeWords } from './ui.js';
import { loadPokedex } from './data.js';

export async function getTacticalAdvice(weaknesses4x, weaknesses2x, allTypes, effectiveness, pokemonList, activePokemon = null) {
    // If pokemonList is the searchIndex (small), load the full pokedex for stats
    let fullList = pokemonList;
    if (fullList && fullList.length > 0 && !fullList[0].stats) {
        fullList = await loadPokedex();
    }

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
        return null; // No weaknesses? No advice needed
    }

    // 2. Find the perfect counter type
    const candidates = [];

    allTypes.forEach(myType => {
        const defenseMod = getEffectiveness(targetThreat, myType, effectiveness);
        const offenseMod = getEffectiveness(myType, targetThreat, effectiveness);

        if (defenseMod < 1 && offenseMod > 1) {
            candidates.push({ type: myType, score: 2 }); // Perfect Counter
        } else if (defenseMod < 1) {
            candidates.push({ type: myType, score: 1 }); // Defensive Switch-in only
        }
    });

    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length === 0) return null;

    const topTypes = candidates.slice(0, 2).map(c => c.type);

    // 3. Find Example Pokemon with Smart Scoring
    const suggestions = [];
    
    const TIERS = {
        HIGH: { min: 560, label: 'High' }, 
        MID: { min: 450, max: 560, label: 'Mid' }, 
        LOW: { max: 450, label: 'Low' } 
    };

    let activeTier = 'MID'; 
    let activeWeaknesses = [];
    
    if (activePokemon) {
        if (activePokemon.bst) {
            if (activePokemon.bst >= TIERS.HIGH.min) activeTier = 'HIGH';
            else if (activePokemon.bst <= TIERS.LOW.max) activeTier = 'LOW';
            else activeTier = 'MID';
        }
        activeWeaknesses = [...(relevantWeaknesses4x || []), ...(relevantWeaknesses2x || [])];
    } 

    if (fullList && Array.isArray(fullList)) {
        topTypes.forEach(type => {
            const isActiveUber = activePokemon && activePokemon.isUber;

            const baseFilter = p => {
                // Always exclude gimmicks (Mega, Gmax, etc.) unless it's a specific competitive form handled in sync
                if (p.isGimmick) return false;
                
                // If active is NOT Uber, exclude Ubers
                if (!isActiveUber && p.isUber) return false;

                return p.types && p.types.includes(type) && p.name;
            };

            const getByTier = (tier) => {
                return fullList.filter(p => {
                    if (!baseFilter(p)) return false;
                    const bst = p.bst || 0;
                    if (tier === 'HIGH') return bst >= TIERS.HIGH.min;
                    if (tier === 'MID') return bst >= TIERS.MID.min && bst < TIERS.MID.max;
                    if (tier === 'LOW') return bst < TIERS.LOW.max;
                    return false;
                });
            };

            let candidates = getByTier(activeTier);
            if (candidates.length === 0) {
                if (activeTier === 'HIGH') candidates = getByTier('MID');
                else if (activeTier === 'MID') candidates = [...getByTier('HIGH'), ...getByTier('LOW')];
                else if (activeTier === 'LOW') candidates = getByTier('MID');
            }

            if (candidates.length > 0) {
                const secondaryThreats = activeWeaknesses.filter(t => t !== targetThreat);
                
                const scoredCandidates = candidates.map(p => {
                    let score = 0;
                    let mainDef = 1;
                    p.types.forEach(t => mainDef *= getEffectiveness(targetThreat, t, effectiveness));
                    
                    if (mainDef >= 1) return null; 
                    
                    score += 100; 
                    if (mainDef === 0) score += 60; 
                    else if (mainDef <= 0.25) score += 40; 

                    secondaryThreats.forEach(secThreat => {
                        let secDef = 1;
                        p.types.forEach(t => secDef *= getEffectiveness(secThreat, t, effectiveness));
                        if (secDef < 1) score += 20;
                        if (secDef <= 0.25) score += 5;
                    });

                    score += ((p.bst || 400) / 5);

                    if (activePokemon) {
                        activeWeaknesses.forEach(weakness => {
                            let candidateDef = 1;
                            p.types.forEach(t => candidateDef *= getEffectiveness(weakness, t, effectiveness));
                            
                            if (candidateDef > 1) {
                                score -= 20; 
                                if (candidateDef >= 4) score -= 30; 
                            }
                        });
                    }

                    return { pokemon: p, score: score };
                }).filter(c => c !== null);

                candidates = scoredCandidates
                    .sort((a, b) => b.score - a.score)
                    .map(c => c.pokemon);
            }

            if (candidates.length > 0) {
                suggestions.push(candidates[0]);
            }
        });
    }

    return {
        threat: targetThreat,
        multiplier: threatMultiplier,
        suggestedTypes: topTypes,
        suggestedPokemon: suggestions 
    };
}
