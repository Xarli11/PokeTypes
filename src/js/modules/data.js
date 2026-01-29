import { i18n } from './i18n.js?v=2.18.3';

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

export async function fetchPokemonDetails(id) {
    if (!id) return null;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
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
                    entry.ability.name = nameEntry.name; // Override name with localized version
                }

                // 2. Localize Description
                // Try flavor_text first (usually better for UI), then effect_entries
                // We prefer entries from the latest generation if possible, but finding *any* in the language is priority
                let descEntry = abilityData.flavor_text_entries
                    .filter(f => f.language.name === currentLang)
                    .pop(); // Take the last one (usually most recent gen)

                if (!descEntry && abilityData.effect_entries) {
                    descEntry = abilityData.effect_entries.find(e => e.language.name === currentLang);
                }

                // Fallback to English if no entry in current language found
                if (!descEntry) {
                    descEntry = abilityData.flavor_text_entries.find(f => f.language.name === 'en') || 
                                abilityData.effect_entries.find(e => e.language.name === 'en');
                }

                if (descEntry) {
                    // flavor_text often has \n or \f characters, clean them up
                    let text = descEntry.flavor_text || descEntry.short_effect || descEntry.effect;
                    entry.description = text.replace(/[\n\f]/g, ' ');
                } else {
                    entry.description = 'No description available.';
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
