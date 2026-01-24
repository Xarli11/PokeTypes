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

        // Fetch ability descriptions
        const abilityPromises = data.abilities.map(async (entry) => {
            try {
                const abilityRes = await fetch(entry.ability.url);
                const abilityData = await abilityRes.json();
                const englishEntry = abilityData.effect_entries.find(e => e.language.name === 'en');
                // Prefer short_effect, fallback to effect, fallback to "No description available."
                entry.description = englishEntry ? (englishEntry.short_effect || englishEntry.effect) : 'No description available.';
            } catch (err) {
                console.error(`Failed to fetch description for ${entry.ability.name}`, err);
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
