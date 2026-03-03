const fs = require('fs');
const path = require('path');
const https = require('https');

const POKEDEX_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const ITEMS_URL = 'https://play.pokemonshowdown.com/data/items.json';
const OUTPUT_FILE = path.join(__dirname, '../src/data/pokedex.json');
const SEARCH_INDEX_FILE = path.join(__dirname, '../src/data/search-index.json');
const ITEMS_FILE = path.join(__dirname, '../src/data/items.json');

// Map Showdown names to valid PokeAPI IDs/Names
const API_NAME_MAP = {
    // ... (Keep existing map)
    'wormadam': 'wormadam-plant',
    'cherrim-sunshine': 'cherrim',
    'shellos': 'shellos',
    'shellos-west': 'shellos',
    'gastrodon': 'gastrodon',
    'gastrodon-west': 'gastrodon',
    'giratina': 'giratina-altered',
    'shaymin': 'shaymin-land',
    'arceus': 'arceus',
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
    'deoxys': 'deoxys-normal',
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
    'greninja-bond': 'greninja-battle-bond',
    'flabebe': 'flabebe',
    'meowstic': 'meowstic-male',
    'meowstic-f': 'meowstic-female',
    'meowstic-m-mega': 'meowstic-male',
    'meowstic-f-mega': 'meowstic-female',
    'aegislash': 'aegislash-shield',
    'pumpkaboo': 'pumpkaboo-average',
    'gourgeist': 'gourgeist-average',
    'zygarde': 'zygarde-50',
    'pikachu-alola': 'pikachu-alola-cap',
    'pichu-spiky-eared': 'pichu',
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
    'toxtricity': 'toxtricity-amped',
    'toxtricity-gmax': 'toxtricity-amped-gmax',
    'toxtricity-low-key-gmax': 'toxtricity-low-key-gmax',
    'eiscue': 'eiscue-ice',
    'indeedee': 'indeedee-male',
    'indeedee-f': 'indeedee-female',
    'morpeko': 'morpeko-full-belly',
    'urshifu': 'urshifu-single-strike',
    'urshifu-rapid-strike': 'urshifu-rapid-strike',
    'urshifu-gmax': 'urshifu-single-strike-gmax',
    'urshifu-rapid-strike-gmax': 'urshifu-rapid-strike-gmax',
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
    'gimmighoul': 'gimmighoul',
    'gimmighoul-chest': 'gimmighoul',
    'palafin': 'palafin-zero',
    'ogerpon': 'ogerpon',
    'ogerpon-teal-mask': 'ogerpon',
    'ogerpon-teal-tera': 'ogerpon',
    'ogerpon-wellspring': 'ogerpon-wellspring-mask',
    'ogerpon-wellspring-tera': 'ogerpon-wellspring-mask',
    'ogerpon-hearthflame': 'ogerpon-hearthflame-mask',
    'ogerpon-hearthflame-tera': 'ogerpon-hearthflame-mask',
    'ogerpon-cornerstone': 'ogerpon-cornerstone-mask',
    'ogerpon-cornerstone-tera': 'ogerpon-cornerstone-mask',
    'terapagos': 'terapagos',
    'terapagos-normal': 'terapagos',
    'tauros-paldea-combat': 'tauros-paldea-combat-breed',
    'tauros-paldea-blaze': 'tauros-paldea-blaze-breed',
    'tauros-paldea-aqua': 'tauros-paldea-aqua-breed',
    'venusaur-mega': 'venusaur-mega',
};

const UBER_NAMES = [
    'Arceus', 'Eternatus', 'Zacian', 'Zamazenta', 'Calyrex', 'Koraidon', 'Miraidon', 'Mewtwo',
    'Lugia', 'Ho-Oh', 'Rayquaza', 'Kyogre', 'Groudon', 'Dialga', 'Palkia', 'Giratina',
    'Reshiram', 'Zekrom', 'Kyurem', 'Xerneas', 'Yveltal', 'Solgaleo', 'Lunala', 'Necrozma',
    'Palafin-Hero'
];

const GIMMICK_FORMS = [
    '-Mega', 'Mega ', '-Gmax', 'Gmax ', '-Eternamax', '-Zen', '-Pirouette',
    '-School', '-Complete', '-Ash', '-Meteor', '-Busted', '-Gulping', '-Gorging',
    'Primal ', '-Primal'
];

console.log(`Downloading data from ${POKEDEX_URL}...`);

https.get(POKEDEX_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const showdownDex = JSON.parse(data);
            const fullDex = [];
            const searchIndex = [];

            for (const key in showdownDex) {
                const entry = showdownDex[key];
                if (entry.num <= 0) continue;
                if (entry.isNonstandard === 'CAP' || entry.isNonstandard === 'Custom') continue;
                if (isCosmetic(entry.name)) continue;

                const stats = entry.baseStats;
                const bst = stats ? (stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe) : 0;
                const rawSlug = toSlug(entry.name);

                // API Name
                let apiName = rawSlug;
                if (API_NAME_MAP[rawSlug]) {
                    apiName = API_NAME_MAP[rawSlug];
                } else if (apiName.includes('-totem')) {
                    apiName = apiName.replace('-totem', '');
                }

                // Sprite Slug
                let spriteSlug = rawSlug;
                if (spriteSlug.includes('-alola') && !spriteSlug.includes('-alolan')) spriteSlug = spriteSlug.replace('-alola', '-alolan');
                if (spriteSlug.includes('-galar') && !spriteSlug.includes('-galarian')) spriteSlug = spriteSlug.replace('-galar', '-galarian');
                if (spriteSlug.includes('-hisui') && !spriteSlug.includes('-hisuian')) spriteSlug = spriteSlug.replace('-hisui', '-hisuian');
                if (spriteSlug.includes('-paldea') && !spriteSlug.includes('-paldean')) spriteSlug = spriteSlug.replace('-paldea', '-paldean');
                if (spriteSlug.endsWith('-gmax')) spriteSlug = spriteSlug.replace('-gmax', '-gigantamax');
                if (spriteSlug === 'mimikyu-disguised') spriteSlug = 'mimikyu';
                if (spriteSlug === 'eiscue-ice') spriteSlug = 'eiscue';
                if (spriteSlug === 'morpeko-full-belly') spriteSlug = 'morpeko';
                if (spriteSlug === 'wishiwashi-solo') spriteSlug = 'wishiwashi';
                if (spriteSlug === 'minior-red-meteor') spriteSlug = 'minior-meteor';
                if (spriteSlug.startsWith('pikachu-') && spriteSlug !== 'pikachu-alolan' && !spriteSlug.includes('gmax')) spriteSlug = 'pikachu';

                // Tiers & Gimmicks
                const isUber = UBER_NAMES.some(u => entry.name.includes(u)) || bst >= 670;
                const isGimmick = GIMMICK_FORMS.some(g => entry.name.includes(g));

                const pokemonEntry = {
                    id: entry.num,
                    name: formatDisplayName(entry.name),
                    slug: rawSlug,
                    apiName: apiName,
                    spriteSlug: spriteSlug,
                    types: entry.types,
                    stats: entry.baseStats,
                    abilities: entry.abilities,
                    bst: bst,
                    isUber: isUber,
                    isGimmick: isGimmick
                };

                fullDex.push(pokemonEntry);

                // Lightweight search index
                searchIndex.push({
                    id: entry.num,
                    name: pokemonEntry.name,
                    slug: rawSlug,
                    types: entry.types,
                    spriteSlug: spriteSlug
                });
            }

            fullDex.sort((a, b) => a.id - b.id);
            searchIndex.sort((a, b) => a.id - b.id);

            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fullDex, null, 2));
            fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex, null, 2));
            
            console.log(`Successfully updated ${OUTPUT_FILE} (${fullDex.length} entries).`);
            console.log(`Successfully updated ${SEARCH_INDEX_FILE} (${searchIndex.length} entries).`);

            // Clean up old public/data duplicates if they exist
            const oldPublicData = path.join(__dirname, '../public/data/pokedex.json');
            if (fs.existsSync(oldPublicData)) {
                fs.unlinkSync(oldPublicData);
                console.log(`Removed duplicate file: ${oldPublicData}`);
            }

            // Now download Items
            downloadItems();

        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });
}).on('error', (err) => console.error('Error downloading data:', err));

function downloadItems() {
    // PokeAPI endpoint for items with the 'holdable' attribute
    const POKEAPI_ITEMS_URL = 'https://pokeapi.co/api/v2/item-attribute/holdable/';
    
    console.log(`Downloading holdable items from PokeAPI...`);
    https.get(POKEAPI_ITEMS_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                const cleanItems = [];

                if (response.items && Array.isArray(response.items)) {
                    response.items.forEach(item => {
                        // Format the name: "choice-band" -> "Choice Band"
                        const formattedName = item.name
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        
                        cleanItems.push(formattedName);
                    });
                }

                // Add some specific competitive items that might not be strictly "holdable" in the base API
                // but are crucial (like Mega Stones, Z-Crystals, or specific forms items if missing)
                const extraItems = ['Eviolite', 'Booster Energy', 'Rusty Sword', 'Rusty Shield'];
                extraItems.forEach(extra => {
                    if (!cleanItems.includes(extra)) cleanItems.push(extra);
                });

                // Sort alphabetically
                cleanItems.sort((a, b) => a.localeCompare(b));

                fs.writeFileSync(ITEMS_FILE, JSON.stringify(cleanItems, null, 2));
                console.log(`Successfully updated ${ITEMS_FILE} (${cleanItems.length} entries).`);
            } catch (error) {
                console.error('Error parsing Items JSON from PokeAPI:', error);
            }
        });
    }).on('error', (err) => console.error('Error downloading items:', err));
}

function toSlug(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[\."]/g, '').replace(/[^a-z0-9-]/g, '');
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
    if (n.startsWith('Pikachu-') && !n.includes('Gmax') && n !== 'Pikachu-Alola') return true;
    if (n.startsWith('Vivillon-') && n !== 'Vivillon') return true;
    if (n.startsWith('Flabebe-') && n !== 'Flabebe') return true;
    if (n.startsWith('Floette-') && n !== 'Floette-Eternal') return true;
    if (n.startsWith('Furfrou-') && n !== 'Furfrou') return true;
    if (n.startsWith('Minior-') && !n.includes('Meteor')) return true;
    if (n.startsWith('Alcremie-') && !n.includes('Gmax')) return true;
    if (n.startsWith('Deerling-') && n !== 'Deerling') return true;
    if (n.startsWith('Sawsbuck-') && n !== 'Sawsbuck') return true;
    if (n.startsWith('Tatsugiri-') && n !== 'Tatsugiri') return true;
    if (n.startsWith('Squawkabilly-') && n !== 'Squawkabilly') return true;
    if (n.startsWith('Maushold-') && n !== 'Maushold') return true;
    if (n.startsWith('Dudunsparce-') && n !== 'Dudunsparce') return true;
    if (n === 'Zarude-Dada' || n.includes('-Antique') || n.includes('-Artisan') || n.includes('-Masterpiece')) return true;
    if (n === 'Xerneas-Neutral' || n.startsWith('Cramorant-') || n.startsWith('Morpeko-') || n === 'Eiscue-Noice') return true;
    if (n.startsWith('Burmy-') || n.startsWith('Shellos-') || n.startsWith('Gastrodon-') || n.startsWith('Magearna-') || n === 'Pichu-Spiky-eared') return true;
    if (n.startsWith('Pumpkaboo-') && n !== 'Pumpkaboo') return true;
    if (n.startsWith('Gourgeist-') && n !== 'Gourgeist') return true;
    return false;
}