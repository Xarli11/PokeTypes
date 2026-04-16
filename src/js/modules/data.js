import { i18n } from './i18n.js';

const pokemonCache = new Map();
const abilityCache = new Map();
let appDataPromise = null;
let pokedexPromise = null;

export function loadAppData() {
    if (appDataPromise) return appDataPromise;

    appDataPromise = (async () => {
        try {
            const [appRes, championsRes] = await Promise.all([
                fetch('/api/app-data.json'),
                fetch('/data/champions-meta.json').catch(() => null)
            ]);

            if (!appRes.ok) throw new Error('Failed to load app data');
            const data = await appRes.json();
            const championsMeta = championsRes && championsRes.ok ? await championsRes.json() : null;

            // Start loading full pokedex in background
            loadPokedex();

            return {
                ...data,
                championsMeta,
                // Fallback for code expecting pokemonList immediately (like search)
                // Search will use searchIndex if available, otherwise will wait for pokedex
                pokemonList: data.searchIndex || [] 
            };
        } catch (error) {
            console.error('Error loading app data:', error);
            appDataPromise = null;
            throw error;
        }
    })();

    return appDataPromise;
}

export function loadPokedex() {
    if (pokedexPromise) return pokedexPromise;

    pokedexPromise = (async () => {
        try {
            const response = await fetch('/api/pokedex.json');
            if (!response.ok) throw new Error('Failed to load pokedex');
            const fullList = await response.json();
            
            // Update the appData cache if it exists
            if (appDataPromise) {
                const appData = await appDataPromise;
                appData.pokemonList = fullList;
            }
            
            return fullList;
        } catch (error) {
            console.error('Error loading pokedex:', error);
            pokedexPromise = null;
            throw error;
        }
    })();

    return pokedexPromise;
}

let showdownPokedexPromise = null;

export async function fetchCompetitiveData(pokemonName) {
    if (!showdownPokedexPromise) {
        showdownPokedexPromise = (async () => {
            try {
                const res = await fetch('https://play.pokemonshowdown.com/data/pokedex.json');
                if (!res.ok) throw new Error('Failed to fetch Showdown Pokedex');
                return await res.json();
            } catch (e) {
                console.error('Error loading competitive data:', e);
                showdownPokedexPromise = null;
                return null;
            }
        })();
    }

    const pokedex = await showdownPokedexPromise;
    if (!pokedex) return null;

    // Multi-strategy slugging for Showdown lookup
    const strategies = [];
    
    // 1. Direct cleanup (e.g. "Mega Froslass" -> "megafroslass")
    strategies.push(pokemonName.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // 2. Species+Form strategy (e.g. "Mega Froslass" -> "froslassmega")
    if (pokemonName.toLowerCase().includes('mega')) {
        const species = pokemonName.toLowerCase().replace('mega', '').trim();
        strategies.push(species + 'mega');
    }
    
    // 3. Hyphenated strategy if pokemonName is actually an apiName (e.g. "froslass-mega" -> "froslassmega")
    strategies.push(pokemonName.toLowerCase().replace(/-/g, '').replace(/[^a-z0-9]/g, ''));

    for (const slug of strategies) {
        if (pokedex[slug]) return pokedex[slug];
    }

    return null;
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

        // Try to merge with Showdown data for abilities if missing
        const showdownData = await fetchCompetitiveData(localPokemon.name);
        const sourceAbilities = localPokemon.abilities || showdownData?.abilities;

        if (sourceAbilities) {
            Object.entries(sourceAbilities).forEach(([key, abilityName]) => {
                const abilitySlug = abilityName.toLowerCase().replace(/ /g, '-');
                data.abilities.push({
                    is_hidden: key === 'H',
                    ability: {
                        name: abilitySlug,
                        url: `https://pokeapi.co/api/v2/ability/${abilitySlug}`,
                        displayName: i18n.tAbility(abilityName)
                    }
                });
            });
        }
    }

    // Standard API Processing (ALWAYS run if we have abilities, even in fallback mode)
    try {
        if (!data.abilities || data.abilities.length === 0) {
            pokemonCache.set(cacheKey, data);
            return data;
        }

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
                const findDesc = (lang) => {
                    const flavor = abilityData.flavor_text_entries.find(f => f.language.name === lang);
                    if (flavor) return flavor.flavor_text || flavor.text;
                    const effect = abilityData.effect_entries.find(e => e.language.name === lang);
                    if (effect) return effect.short_effect || effect.effect;
                    return null;
                };

                let text = findDesc(currentLang);
                
                // Manual Override Check
                const rawName = abilityData.name.toLowerCase();
                const manualDesc = i18n.t(`${rawName}_desc`);
                const finalManualDesc = manualDesc !== `${rawName}_desc` ? manualDesc : null;

                if (finalManualDesc) {
                    entry.description = finalManualDesc;
                } else if (text) {
                    entry.description = text.replace(/[\n\f]/g, ' ');
                } else {
                    // English Fallback
                    const englishText = findDesc('en');
                    if (englishText) {
                        entry.description = englishText.replace(/[\n\f]/g, ' ');
                    } else {
                        entry.description = i18n.t('stats_unavailable');
                    }
                }

            } catch (err) {
                console.error(`Failed to fetch details for ${entry.ability.name}`, err);
                entry.description = i18n.t('stats_unavailable');
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