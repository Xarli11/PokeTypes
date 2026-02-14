import { i18n } from './i18n.js?v=2.23.2';

const pokemonCache = new Map();
const abilityCache = new Map();
let appDataPromise = null;

export function loadAppData() {
    if (appDataPromise) return appDataPromise;

    appDataPromise = (async () => {
        try {
            const [typeDataResponse, pokedexResponse, abilitiesResponse, fixesResponse] = await Promise.all([
                fetch('data/type-data.json'),
                fetch('data/pokedex.json'),
                fetch('data/abilities-i18n.json'),
                fetch('data/image-fixes.json')
            ]);

            if (!typeDataResponse.ok || !pokedexResponse.ok) {
                throw new Error('Failed to load data files');
            }

            const typeData = await typeDataResponse.json();
            const pokedex = await pokedexResponse.json();
            const abilities = abilitiesResponse.ok ? await abilitiesResponse.json() : {};
            const imageFixes = fixesResponse.ok ? await fixesResponse.json() : {};

            return {
                pokemonList: pokedex,
                types: typeData.types,
                effectiveness: typeData.effectiveness,
                contrast: typeData.contrast,
                abilityMap: abilities,
                imageFixes: imageFixes
            };
        } catch (error) {
            console.error('Error loading data:', error);
            appDataPromise = null; // Reset on error so we can retry
            throw error;
        }
    })();

    return appDataPromise;
}

export async function fetchPokemonDetails(identifier) {
    if (!identifier) return null;
    
    const currentLang = i18n.currentLang;
    const cacheKey = `${identifier}-${currentLang}`;

    if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
    }

    let data;
    let isFallback = false;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if (!response.ok) throw new Error('Pokemon not found');
        data = await response.json();
    } catch (apiError) {
        // Fallback to local data
        const appData = await loadAppData();
        const localPokemon = appData.pokemonList.find(p => p.apiName === identifier || p.id == identifier);
        
        if (!localPokemon) return null;

        isFallback = true;
        
        // Construct partial data object
        data = {
            id: localPokemon.id,
            name: localPokemon.name, // Display name usually
            types: localPokemon.types.map(t => ({ type: { name: t.toLowerCase() } })),
            stats: localPokemon.stats ? [
                { base_stat: localPokemon.stats.hp, stat: { name: 'hp' } },
                { base_stat: localPokemon.stats.atk, stat: { name: 'attack' } },
                { base_stat: localPokemon.stats.def, stat: { name: 'defense' } },
                { base_stat: localPokemon.stats.spa, stat: { name: 'special-attack' } },
                { base_stat: localPokemon.stats.spd, stat: { name: 'special-defense' } },
                { base_stat: localPokemon.stats.spe, stat: { name: 'speed' } }
            ] : [],
            abilities: []
        };

        if (localPokemon.abilities) {
            Object.entries(localPokemon.abilities).forEach(([key, abilityName]) => {
                data.abilities.push({
                    is_hidden: key === 'H',
                    ability: {
                        name: abilityName.toLowerCase().replace(/ /g, '-'), // slug for i18n lookup
                        url: null, // Signal that we can't fetch details
                        displayName: i18n.tAbility(abilityName) // Use local translation
                    }
                });
            });
        }
    }

    if (isFallback) {
        // Process fallback abilities (just add description placeholder)
        data.abilities.forEach(entry => {
            // Try to find description in messages if manual
            const rawName = entry.ability.name;
            const spacedName = rawName.replace(/-/g, ' ');
            const manualDesc = i18n.t(`${rawName}_desc`);
            
            entry.description = manualDesc !== `${rawName}_desc` ? manualDesc : i18n.t('stats_unavailable');
        });
        
        pokemonCache.set(cacheKey, data);
        return data;
    }

    // Standard API Processing
    try {
        const abilityPromises = data.abilities.map(async (entry) => {
            try {
                let abilityData;
                const abilityUrl = entry.ability.url;

                if (abilityCache.has(abilityUrl)) {
                    abilityData = abilityCache.get(abilityUrl);
                } else {
                    const abilityRes = await fetch(abilityUrl);
                    abilityData = await abilityRes.json();
                    abilityCache.set(abilityUrl, abilityData);
                }

                // 1. Localize Name
                const nameEntry = abilityData.names.find(n => n.language.name === currentLang);
                if (nameEntry) {
                    entry.ability.displayName = nameEntry.name;
                } else {
                    entry.ability.displayName = capitalizeWords(entry.ability.name);
                }

                // 2. Localize Description
                let descEntry = abilityData.flavor_text_entries
                    .filter(f => f.language.name === currentLang)
                    .pop();

                if (!descEntry && abilityData.effect_entries) {
                    descEntry = abilityData.effect_entries.find(e => e.language.name === currentLang);
                }

                // Manual Override Check
                const rawName = abilityData.name.toLowerCase();
                const spacedName = rawName.replace(/-/g, ' ');
                
                const manualDesc = i18n.t(`${rawName}_desc`);
                const manualDescSpaced = i18n.t(`${spacedName}_desc`);
                
                let finalManualDesc = null;
                if (manualDesc !== `${rawName}_desc`) finalManualDesc = manualDesc;
                else if (manualDescSpaced !== `${spacedName}_desc`) finalManualDesc = manualDescSpaced;

                if (!descEntry && finalManualDesc) {
                    entry.description = finalManualDesc;
                } else if (descEntry) {
                    let text = descEntry.flavor_text || descEntry.short_effect || descEntry.effect;
                    entry.description = text.replace(/[\n\f]/g, ' ');
                } else {
                    // English Fallback
                    descEntry = abilityData.flavor_text_entries.find(f => f.language.name === 'en') || 
                                abilityData.effect_entries.find(e => e.language.name === 'en');
                    
                    if (descEntry) {
                        let text = descEntry.flavor_text || descEntry.short_effect || descEntry.effect;
                        entry.description = text.replace(/[\n\f]/g, ' ');
                    } else {
                        entry.description = 'No description available.';
                    }
                }

            } catch (err) {
                console.error(`Failed to fetch details for ${entry.ability.name}`, err);
                entry.description = 'Description unavailable.';
            }
            return entry;
        });

        await Promise.all(abilityPromises);
        
        pokemonCache.set(cacheKey, data);
        return data;

    } catch (error) {
        console.error('Error processing Pokemon details:', error);
        return null;
    }
}

function capitalizeWords(str) {
    return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}