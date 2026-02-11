import { i18n } from './i18n.js?v=2.21.1';

export async function loadAppData() {
    try {
        const [typeDataResponse, pokedexResponse] = await Promise.all([
            fetch('data/type-data.json'),
            fetch('data/pokedex.json')
        ]);

        if (!typeDataResponse.ok || !pokedexResponse.ok) {
            throw new Error('Failed to load data files');
        }

        const typeData = await typeDataResponse.json();
        const pokedex = await pokedexResponse.json();

        return {
            pokemonList: pokedex,
            types: typeData.types,
            effectiveness: typeData.effectiveness,
            contrast: typeData.contrast
        };
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

export async function fetchPokemonDetails(identifier) {
    if (!identifier) return null;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if (!response.ok) throw new Error('Pokemon not found');
        const data = await response.json();

        // Fetch ability descriptions and localized names
        const abilityPromises = data.abilities.map(async (entry) => {
            try {
                const abilityRes = await fetch(entry.ability.url);
                const abilityData = await abilityRes.json();
                const currentLang = i18n.currentLang;

                // 1. Localize Name
                // PokeAPI names array: [{ name: "Stench", language: { name: "en" } }, ...]
                const nameEntry = abilityData.names.find(n => n.language.name === currentLang);
                if (nameEntry) {
                    entry.ability.displayName = nameEntry.name; // Store localized name separately
                } else {
                    entry.ability.displayName = capitalizeWords(entry.ability.name); // Fallback
                }

                // 2. Localize Description
                // Try flavor_text first (usually better for UI), then effect_entries
                let descEntry = abilityData.flavor_text_entries
                    .filter(f => f.language.name === currentLang)
                    .pop();

                if (!descEntry && abilityData.effect_entries) {
                    descEntry = abilityData.effect_entries.find(e => e.language.name === currentLang);
                }

                // NEW: Check manual translation in messages.js if API fails for current lang
                // Try both hyphenated and space versions
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
                    // Fallback to English API
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
        return data;

    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}

function capitalizeWords(str) {
    return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
