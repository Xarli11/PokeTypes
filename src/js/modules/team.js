// src/js/modules/team.js

const TEAM_SIZE = 6;
let team = new Array(TEAM_SIZE).fill(null);

export function loadTeam() {
    const saved = localStorage.getItem('poketypes_team');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length === TEAM_SIZE) {
                team = parsed;
            } else {
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

    // Get default ability (first one available)
    let defaultAbility = null;
    if (pokemonData.abilities) {
        defaultAbility = pokemonData.abilities['0'] || Object.values(pokemonData.abilities)[0];
    }

    team[index] = {
        id: pokemonData.id,
        name: pokemonData.name,
        apiName: pokemonData.apiName,
        types: pokemonData.types,
        spriteSlug: pokemonData.spriteSlug,
        stats: pokemonData.stats, // Save stats for easier analysis
        abilities: pokemonData.abilities, // Save potential abilities list
        teraType: pokemonData.types[0],
        ability: defaultAbility, // Selected ability
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

export function setAbility(index, ability) {
    if (team[index]) {
        team[index].ability = ability;
        saveTeam();
    }
}