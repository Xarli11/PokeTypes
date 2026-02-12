// src/js/modules/team.js

const TEAM_SIZE = 6;
let team = new Array(TEAM_SIZE).fill(null);

export function loadTeam() {
    const saved = localStorage.getItem('poketypes_team');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Ensure fixed size and valid array
            if (Array.isArray(parsed) && parsed.length === TEAM_SIZE) {
                team = parsed;
            } else {
                // Migrate or reset if format is wrong
                team = new Array(TEAM_SIZE).fill(null);
            }
        } catch (e) {
            console.error("Failed to load team", e);
            team = new Array(TEAM_SIZE).fill(null);
        }
    }
    return team;
}

export function saveTeam() {
    localStorage.setItem('poketypes_team', JSON.stringify(team));
}

export function addPokemonToSlot(index, pokemonData) {
    if (index < 0 || index >= TEAM_SIZE) return false;

    // Minimal data structure for the team member
    team[index] = {
        id: pokemonData.id,
        name: pokemonData.name, // Display name
        apiName: pokemonData.apiName, // For API calls
        types: pokemonData.types, // Array of strings
        spriteSlug: pokemonData.spriteSlug, // For images
        teraType: pokemonData.types[0], // Default Tera to primary type
        ability: null, // Placeholder for future ability selector
        nature: null,
        item: null
    };
    
    saveTeam();
    return true;
}

export function removePokemonFromSlot(index) {
    if (index >= 0 && index < TEAM_SIZE) {
        team[index] = null;
        saveTeam();
        return true;
    }
    return false;
}

export function getTeam() {
    return team;
}

export function setTeraType(index, type) {
    if (team[index]) {
        team[index].teraType = type;
        saveTeam();
    }
}
