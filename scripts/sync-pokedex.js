const fs = require('fs');
const path = require('path');
const https = require('https');

const POKEDEX_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const OUTPUT_FILE = path.join(__dirname, '../data/pokedex.json');

// Map Showdown names (or intermediate processed names) to valid PokeAPI IDs/Names
const API_NAME_MAP = {
    // Gen 4
    'wormadam': 'wormadam-plant',
    'cherrim-sunshine': 'cherrim', // Battle-only
    'shellos': 'shellos', // West Sea is base
    'shellos-west': 'shellos',
    'gastrodon': 'gastrodon', // West Sea is base
    'gastrodon-west': 'gastrodon',
    'giratina': 'giratina-altered',
    'shaymin': 'shaymin-land',
    'arceus': 'arceus', // Base
    'arceus-bug': 'arceus',
    'arceus-dark': 'arceus',
    'arceus-dragon': 'arceus',
    'arceus-electric': 'arceus',
    'arceus-fairy': 'arceus',
    'arceus-fighting': 'arceus',
    'arceus-fire': 'arceus',
    'arceus-flying': 'arceus',
    'arceus-ghost': 'arceus',
    'arceus-grass': 'arceus',
    'arceus-ground': 'arceus',
    'arceus-ice': 'arceus',
    'arceus-poison': 'arceus',
    'arceus-psychic': 'arceus',
    'arceus-rock': 'arceus',
    'arceus-steel': 'arceus',
    'arceus-water': 'arceus',
    
    // Gen 3 / Deoxys
    'deoxys': 'deoxys-normal',
    
    // Gen 5
    'basculin': 'basculin-red-striped',
    'basculin-blue-striped': 'basculin-blue-striped',
    'darmanitan': 'darmanitan-standard',
    'darmanitan-zen': 'darmanitan-zen',
    'darmanitan-galar': 'darmanitan-galar-standard',
    'darmanitan-galar-zen': 'darmanitan-galar-zen',
    'tornadus': 'tornadus-incarnate',
    'thundurus': 'thundurus-incarnate',
    'landorus': 'landorus-incarnate',
    'keldeo': 'keldeo-ordinary',
    'meloetta': 'meloetta-aria',
    'genesect': 'genesect',
    'genesect-douse': 'genesect',
    'genesect-shock': 'genesect',
    'genesect-burn': 'genesect',
    'genesect-chill': 'genesect',
    
    // Gen 6
    'greninja-bond': 'greninja-battle-bond',
    'flabebe': 'flabebe', // PokeAPI: flabebe (red flower?)
    'meowstic': 'meowstic-male',
    'meowstic-f': 'meowstic-female',
    'meowstic-m-mega': 'meowstic-male', // Unofficial/Speculative
    'meowstic-f-mega': 'meowstic-female', // Unofficial/Speculative
    'aegislash': 'aegislash-shield',
    'pumpkaboo': 'pumpkaboo-average',
    'gourgeist': 'gourgeist-average',
    'zygarde': 'zygarde-50',
    
    // Gen 7
    'pikachu-alola': 'pikachu-alola-cap',
    'pichu-spiky-eared': 'pichu', // Not in API
    'oricorio': 'oricorio-baile',
    'rockruff-dusk': 'rockruff-own-tempo',
    'lycanroc': 'lycanroc-midday',
    'wishiwashi': 'wishiwashi-solo',
    'silvally': 'silvally',
    'silvally-bug': 'silvally',
    'silvally-dark': 'silvally',
    'silvally-dragon': 'silvally',
    'silvally-electric': 'silvally',
    'silvally-fairy': 'silvally',
    'silvally-fighting': 'silvally',
    'silvally-fire': 'silvally',
    'silvally-flying': 'silvally',
    'silvally-ghost': 'silvally',
    'silvally-grass': 'silvally',
    'silvally-ground': 'silvally',
    'silvally-ice': 'silvally',
    'silvally-poison': 'silvally',
    'silvally-psychic': 'silvally',
    'silvally-rock': 'silvally',
    'silvally-steel': 'silvally',
    'silvally-water': 'silvally',
    
    'minior': 'minior-red-meteor',
    'minior-meteor': 'minior-red-meteor',
    'mimikyu': 'mimikyu-disguised',
    'mimikyu-totem': 'mimikyu-totem-disguised', 
    'necrozma-dusk-mane': 'necrozma-dusk',
    'necrozma-dawn-wings': 'necrozma-dawn',
    
    // Gen 8
    'toxtricity': 'toxtricity-amped',
    'toxtricity-gmax': 'toxtricity-amped-gmax',
    'toxtricity-low-key-gmax': 'toxtricity-low-key-gmax', // Ensure explicit map if needed, usually works
    'eiscue': 'eiscue-ice',
    'indeedee': 'indeedee-male',
    'indeedee-f': 'indeedee-female',
    'morpeko': 'morpeko-full-belly',
    'urshifu': 'urshifu-single-strike',
    'urshifu-rapid-strike': 'urshifu-rapid-strike',
    'urshifu-gmax': 'urshifu-single-strike-gmax',
    'urshifu-rapid-strike-gmax': 'urshifu-rapid-strike-gmax',
    
    // Gen 9
    'basculegion': 'basculegion-male',
    'basculegion-f': 'basculegion-female',
    'enamorus': 'enamorus-incarnate',
    'oinkologne': 'oinkologne-male',
    'oinkologne-f': 'oinkologne-female',
    'maushold': 'maushold-family-of-four',
    'maushold-four': 'maushold-family-of-four', 
    'squawkabilly': 'squawkabilly-green-plumage',
    'tatsugiri': 'tatsugiri-curly',
    'dudunsparce': 'dudunsparce-two-segment',
    'dudunsparce-three-segment': 'dudunsparce-three-segment',
    'gimmighoul': 'gimmighoul', // Chest is base
    'gimmighoul-chest': 'gimmighoul',
    'palafin': 'palafin-zero',
    'ogerpon': 'ogerpon', // Teal Mask is base
    'ogerpon-teal-mask': 'ogerpon',
    'ogerpon-teal-tera': 'ogerpon', 
    'ogerpon-wellspring': 'ogerpon-wellspring-mask',
    'ogerpon-wellspring-tera': 'ogerpon-wellspring-mask', // Tera usually shares base form/sprite or no specific endpoint
    'ogerpon-hearthflame': 'ogerpon-hearthflame-mask',
    'ogerpon-hearthflame-tera': 'ogerpon-hearthflame-mask',
    'ogerpon-cornerstone': 'ogerpon-cornerstone-mask',
    'ogerpon-cornerstone-tera': 'ogerpon-cornerstone-mask',
    'terapagos': 'terapagos',
    'terapagos-normal': 'terapagos',
    
    // Regional Forms (if base name + suffix doesn't work automatically)
    'tauros-paldea-combat': 'tauros-paldea-combat-breed',
    'tauros-paldea-blaze': 'tauros-paldea-blaze-breed',
    'tauros-paldea-aqua': 'tauros-paldea-aqua-breed',
    
    // Megas (usually handled by replacement, but exceptions)
    'venusaur-mega': 'venusaur-mega', 
};

console.log(`Downloading data from ${POKEDEX_URL}...`);

https.get(POKEDEX_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const showdownDex = JSON.parse(data);
            const cleanDex = [];

            for (const key in showdownDex) {
                const entry = showdownDex[key];

                // Skip non-standard/placeholder
                if (entry.num <= 0) continue;
                
                // Keep 'Past' (dexited mons) and 'Future' (if any)
                // Filter CAP, Custom
                if (entry.isNonstandard === 'CAP' || entry.isNonstandard === 'Custom') continue; 
                
                // Skip cosmetic forms that share types/stats (mostly)
                if (isCosmetic(entry.name)) continue;

                const originalName = entry.name;
                const stats = entry.baseStats;
                const bst = stats ? (stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe) : 0;

                // 1. Generate Basic Slug
                const rawSlug = toSlug(originalName);

                // 2. Determine API Name (for data fetching)
                let apiName = rawSlug;
                if (API_NAME_MAP[rawSlug]) {
                    apiName = API_NAME_MAP[rawSlug];
                } else {
                    // 3. Heuristic Fixes for API Name
                    if (apiName.includes('-totem')) {
                        apiName = apiName.replace('-totem', '');
                    }
                    // Gmax usually stays as is or is mapped manually
                }

                // 3. Determine Sprite Slug (for images) - Default to raw slug (specific form)
                let spriteSlug = rawSlug;
                
                // Fix Regional Forms suffixes for PokemonDB (alola -> alolan)
                // Use a regex to replace only if it's a suffix or followed by something, but simple replace is usually safe for these specific strings
                if (spriteSlug.includes('-alola') && !spriteSlug.includes('-alolan')) spriteSlug = spriteSlug.replace('-alola', '-alolan');
                if (spriteSlug.includes('-galar') && !spriteSlug.includes('-galarian')) spriteSlug = spriteSlug.replace('-galar', '-galarian');
                if (spriteSlug.includes('-hisui') && !spriteSlug.includes('-hisuian')) spriteSlug = spriteSlug.replace('-hisui', '-hisuian');
                if (spriteSlug.includes('-paldea') && !spriteSlug.includes('-paldean')) spriteSlug = spriteSlug.replace('-paldea', '-paldean');

                if (spriteSlug.endsWith('-gmax')) spriteSlug = spriteSlug.replace('-gmax', '-gigantamax');

                // Specific Sprite Fixes (PokemonDB naming vs Showdown)
                if (spriteSlug === 'mimikyu-disguised') spriteSlug = 'mimikyu'; // PokemonDB uses base for disguised
                if (spriteSlug === 'eiscue-ice') spriteSlug = 'eiscue';
                if (spriteSlug === 'morpeko-full-belly') spriteSlug = 'morpeko';
                if (spriteSlug === 'wishiwashi-solo') spriteSlug = 'wishiwashi';
                if (spriteSlug === 'minior-red-meteor') spriteSlug = 'minior-meteor'; 
                if (spriteSlug.startsWith('pikachu-') && spriteSlug !== 'pikachu-alolan') spriteSlug = 'pikachu'; // Most caps share base sprite or use very specific names? No, caps have sprites. 
                // Wait, user REMOVED cosmetic caps. So only Pikachu base remains. 
                // But Gmax Pikachu is distinct.
                
                // Clean up specific mappings that were ONLY for API but hurt Sprites
                // e.g. arceus-bug -> arceus (API) but arceus-bug (Sprite).
                // The new logic handles this automatically because spriteSlug starts as rawSlug.


                cleanDex.push({
                    id: entry.num,
                    name: formatDisplayName(entry.name), // Prettier name for UI
                    apiName: apiName,
                    spriteSlug: spriteSlug, // Use the processed slug!
                    types: entry.types,
                    stats: entry.baseStats, // Include full stats for analysis
                    abilities: entry.abilities, // Include abilities for dropdown (Optimization)
                    bst: bst
                });
            }

            cleanDex.sort((a, b) => a.id - b.id);

            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanDex, null, 2));
            console.log(`Successfully updated ${OUTPUT_FILE} with ${cleanDex.length} entries.`);

        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });

}).on('error', (err) => {
    console.error('Error downloading data:', err);
});

function toSlug(name) {
    return name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[\."]/g, '')
        .replace(/[^a-z0-9-]/g, '');
}

function formatDisplayName(name) {
    if (name.includes('-Mega')) {
        if (name.endsWith('-X')) return `Mega ${name.replace('-Mega-X', '')} X`;
        if (name.endsWith('-Y')) return `Mega ${name.replace('-Mega-Y', '')} Y`;
        return `Mega ${name.replace('-Mega', '')}`;
    }
    if (name.includes('-Primal')) return `Primal ${name.replace('-Primal', '')}`;
    if (name.includes('-Alola')) return `Alolan ${name.replace('-Alola', '')}`;
    if (name.includes('-Galar')) return `Galarian ${name.replace('-Galar', '')}`;
    if (name.includes('-Hisui')) return `Hisuian ${name.replace('-Hisui', '')}`;
    if (name.includes('-Paldea')) {
        if (name.includes('-Blaze')) return `Paldean ${name.replace('-Paldea-Blaze', '')} (Blaze)`;
        if (name.includes('-Aqua')) return `Paldean ${name.replace('-Paldea-Aqua', '')} (Aqua)`;
        return `Paldean ${name.replace('-Paldea', '')}`;
    }
    return name;
}

function isCosmetic(name) {
    const n = name;
    
    // 1. Strictly Cosmetic Forms (No Stat/Type Changes)
    if (n.startsWith('Pikachu-') && !n.includes('Gmax') && n !== 'Pikachu-Alola') return true; 
    // Note: Pikachu-Alola doesn't exist as a form, it's Raichu-Alola. Pikachu-Alola-Cap etc are cosmetic.
    // Wait, Pikachu Gmax exists. Keep it? Yes.
    
    if (n.startsWith('Vivillon-') && n !== 'Vivillon') return true;
    if (n.startsWith('Flabebe-') && n !== 'Flabebe') return true;
    if (n.startsWith('Floette-') && n !== 'Floette-Eternal') return true; // Eternal has unique stats
    if (n.startsWith('Furfrou-') && n !== 'Furfrou') return true;
    if (n.startsWith('Minior-') && !n.includes('Meteor')) return true; // Meteor forms (Red, Blue etc) are cosmetic. Minior-Meteor is the base for Shields Down?
    // Actually Minior has "Minior" (Shields Up) and "Minior-Meteor" (Shields Down) ?? No, usually Base and Core.
    // Showdown has Minior-Red, etc. We filter colors.
    
    if (n.startsWith('Alcremie-') && !n.includes('Gmax')) return true;
    if (n.startsWith('Deerling-') && n !== 'Deerling') return true;
    if (n.startsWith('Sawsbuck-') && n !== 'Sawsbuck') return true;
    if (n.startsWith('Tatsugiri-') && n !== 'Tatsugiri') return true; 
    if (n.startsWith('Squawkabilly-') && n !== 'Squawkabilly') return true;
    if (n.startsWith('Maushold-') && n !== 'Maushold') return true; 
    if (n.startsWith('Dudunsparce-') && n !== 'Dudunsparce') return true; 
    
    // 2. Specific Bug Fixes / Non-Standard
    if (n === 'Zarude-Dada') return true; // Cosmetic
    if (n.includes('Polteageist-Antique')) return true;
    if (n.includes('Sinistea-Antique')) return true;
    if (n.includes('Poltchageist-Artisan')) return true;
    if (n.includes('Sinistcha-Masterpiece')) return true;
    if (n === 'Xerneas-Neutral') return true; // Active mode is cosmetic
    if (n.startsWith('Cramorant-') && n !== 'Cramorant') return true; // Gulping/Gorging are in-battle forms
    if (n.startsWith('Morpeko-') && n !== 'Morpeko') return true; // Hangry is in-battle
    if (n === 'Eiscue-Noice') return true; // Noice face is in-battle
    if (n.startsWith('Burmy-') && n !== 'Burmy') return true; // Burmy forms are cosmetic (unlike Wormadam)
    if (n.startsWith('Shellos-') && n !== 'Shellos') return true;
    if (n.startsWith('Gastrodon-') && n !== 'Gastrodon') return true;
    if (n.startsWith('Magearna-') && n !== 'Magearna') return true; // Magearna-Original is cosmetic. "Mega" is error.
    if (n === 'Pichu-Spiky-eared') return true; // Non-standard

    // 3. Keep Everything Else (Gmax, Totem, Deoxys, Kyurem, Keldeo, etc.)
    // Pumpkaboo/Gourgeist sizes: User requested to REMOVE them (Small, Large, Super).
    // Base form "Pumpkaboo" (Average) remains.
    if (n.startsWith('Pumpkaboo-') && n !== 'Pumpkaboo') return true;
    if (n.startsWith('Gourgeist-') && n !== 'Gourgeist') return true;
    
    return false;
}