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
        return await response.json();
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}
