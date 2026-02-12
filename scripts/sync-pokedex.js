const fs = require('fs');
const path = require('path');
const https = require('https');

const POKEDEX_URL = 'https://play.pokemonshowdown.com/data/pokedex.json';
const OUTPUT_FILE = path.join(__dirname, '../data/pokedex.json');

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

            // Helper function to format names
            const formatName = (name) => {
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
                    // Handle specific Paldean forms if they have extra suffixes (like Tauros)
                    if (name.includes('-Blaze')) return `Paldean ${name.replace('-Paldea-Blaze', '')} (Blaze)`;
                    if (name.includes('-Aqua')) return `Paldean ${name.replace('-Paldea-Aqua', '')} (Aqua)`;
                    return `Paldean ${name.replace('-Paldea', '')}`;
                }
                // Cosmetic or other forms usually kept as is or cleaned up differently
                // For now, let's just return the name or swap simple hyphens if needed
                // But generally Showdown names are okay otherwise.
                return name; 
            };

            // Iterate over all keys in the showdown dex
            for (const key in showdownDex) {
                const entry = showdownDex[key];

                // Skip non-standard/placeholder entries (negative IDs are usually CAP or glitches)
                if (entry.num <= 0) continue;

                // Skip cosmetic costume forms
                // Pikachu costumes: Cosplay, Rock-Star, Belle, Pop-Star, PhD, Libre, Caps (Original, Hoenn, etc.)
                const name = entry.name;
                const isCosmeticPikachu = name.startsWith('Pikachu-') && (
                    name.includes('Cosplay') || name.includes('Rock-Star') || 
                    name.includes('Belle') || name.includes('Pop-Star') || 
                    name.includes('PhD') || name.includes('Libre') || 
                    name.includes('Original') || name.includes('Hoenn') || 
                    name.includes('Sinnoh') || name.includes('Unova') || 
                    name.includes('Kalos') || name.includes('Alola') || 
                    name.includes('Partner') || name.includes('Starter') || 
                    name.includes('World')
                );

                // Other cosmetic forms (Vivillon patterns, Alcremie flavors, Minior colors, Furfrou trims)
                // We keep base forms (usually just "Vivillon", "Alcremie", etc. in Showdown data, 
                // but sometimes Showdown lists "Vivillon-Meadow" as base? Let's check.)
                // Actually Showdown has base entries usually.
                
                const isCosmeticVivillon = name.startsWith('Vivillon-') && !name.includes('Gmax'); // Vivillon doesn't have Gmax but just to be safe
                const isCosmeticAlcremie = name.startsWith('Alcremie-') && !name.includes('Gmax');
                const isCosmeticMinior = name.startsWith('Minior-') && !name.includes('Meteor'); // Keep Meteor as it changes stats significantly (shields down mechanic)
                const isCosmeticFurfrou = name.startsWith('Furfrou-'); 
                
                // More cosmetic/same-type forms
                const isCosmeticFloette = name.includes('Floette-Eternal'); 
                const isCosmeticTatsugiri = name.startsWith('Tatsugiri-') || name.includes('Mega Tatsugiri-'); // Cleaning up variants
                const isCosmeticSquawkabilly = name.startsWith('Squawkabilly-');
                // Lycanroc forms share pure Rock type. Showdown base "Lycanroc" is usually Midday.
                const isCosmeticLycanroc = name === 'Lycanroc-Midnight' || name === 'Lycanroc-Dusk';
                // Toxtricity Low-Key shares Electric/Poison.
                const isCosmeticToxtricity = name.includes('Toxtricity-Low-Key');

                // Additional Cosmetic Forms (Fix for empty data entries)
                const isCosmeticBurmy = name === 'Burmy-Sandy' || name === 'Burmy-Trash'; // Wormadam is functional, Burmy is not
                const isCosmeticShellos = name.includes('Shellos-East');
                const isCosmeticGastrodon = name.includes('Gastrodon-East');
                const isCosmeticDeerling = name.startsWith('Deerling-') && name !== 'Deerling';
                const isCosmeticSawsbuck = name.startsWith('Sawsbuck-') && name !== 'Sawsbuck';
                const isCosmeticBasculin = name === 'Basculin-Blue-Striped'; // White-Striped is functional (Hisui)
                const isCosmeticMagearna = name === 'Magearna-Original';
                const isCosmeticSinistea = name.includes('Antique');
                const isCosmeticPolteageist = name.includes('Antique');
                const isCosmeticMaushold = name.includes('Family-of-Three'); // Four is base
                const isCosmeticDudunsparce = name.includes('Three-Segment'); // Two is base
                const isCosmeticKeldeo = name === 'Keldeo-Resolute'; // Same stats/type, just moves
                const isCosmeticZarude = name === 'Zarude-Dada';
                const isCosmeticPoltchageist = name.includes('Artisan');
                const isCosmeticSinistcha = name.includes('Masterpiece');
                const isCosmeticXerneas = name === 'Xerneas-Neutral'; // Active mode is cosmetic

                // Exclude specific cosmetic forms
                if (isCosmeticPikachu || isCosmeticVivillon || isCosmeticAlcremie || isCosmeticMinior || 
                    isCosmeticFurfrou || isCosmeticFloette || isCosmeticTatsugiri || 
                    isCosmeticSquawkabilly || isCosmeticLycanroc || isCosmeticToxtricity ||
                    isCosmeticBurmy || isCosmeticShellos || isCosmeticGastrodon || 
                    isCosmeticDeerling || isCosmeticSawsbuck || isCosmeticBasculin ||
                    isCosmeticMagearna || isCosmeticSinistea || isCosmeticPolteageist ||
                    isCosmeticMaushold || isCosmeticDudunsparce || isCosmeticKeldeo ||
                    isCosmeticZarude || isCosmeticPoltchageist || isCosmeticSinistcha ||
                    isCosmeticXerneas) {
                    continue;
                }

                // Map to our project format:
                // { "id": number, "name": string, "types": string[], "bst": number }
                
                const stats = entry.baseStats;
                const bst = stats ? (stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe) : 0;

                // Generate PokeAPI-friendly slug
                let apiName = entry.name.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[\.\']/g, '') // Remove dots and apostrophes (Mr. Mime -> mr-mime, Farfetch'd -> farfetchd)
                    .replace(/[^a-z0-9-]/g, ''); // Remove any other special chars just in case

                // Handle specific edge cases if needed
                if (apiName === 'mimikyu-busted') apiName = 'mimikyu-busted'; // PokeAPI: mimikyu-busted
                if (apiName === 'mimikyu') apiName = 'mimikyu-disguised'; // PokeAPI: mimikyu-disguised (often default)
                // Actually PokeAPI uses 'mimikyu-disguised' as default form usually, but 'mimikyu' might redirect or be valid.
                // Let's stick to simple slugification first. Showdown 'Mimikyu' -> 'mimikyu'.
                
                // Specific fix for "Nidoran M" and "Nidoran F" if Showdown uses symbols
                if (entry.name === 'Nidoran-M') apiName = 'nidoran-m';
                if (entry.name === 'Nidoran-F') apiName = 'nidoran-f';
                
                // Fix for Maushold (PokeAPI uses 'maushold-family-of-four')
                if (apiName === 'maushold') apiName = 'maushold-family-of-four';
                if (apiName === 'maushold-four') apiName = 'maushold-family-of-four';

                // Generate PokemonDB-friendly sprite slug
                let spriteSlug = apiName;
                if (spriteSlug.endsWith('-gmax')) spriteSlug = spriteSlug.replace('-gmax', '-gigantamax');
                if (spriteSlug.includes('-alola')) spriteSlug = spriteSlug.replace('-alola', '-alolan');
                if (spriteSlug.includes('-galar')) spriteSlug = spriteSlug.replace('-galar', '-galarian');
                if (spriteSlug.includes('-hisui')) spriteSlug = spriteSlug.replace('-hisui', '-hisuian');
                if (spriteSlug.includes('-paldea')) spriteSlug = spriteSlug.replace('-paldea', '-paldean');

                cleanDex.push({
                    id: entry.num,
                    name: formatName(entry.name),
                    apiName: apiName,
                    spriteSlug: spriteSlug,
                    types: entry.types,
                    bst: bst
                });
            }

            // Sort by ID to keep it tidy (though not strictly necessary)
            // Entries with same ID (megas/forms) will stay relatively grouped if the object iteration order allows, 
            // but sorting by ID ensures base form -> alternate forms usually.
            cleanDex.sort((a, b) => a.id - b.id);

            // Write to file
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanDex, null, 2));
            console.log(`Successfully updated ${OUTPUT_FILE} with ${cleanDex.length} entries.`);

            // Quick verify check for Z-A content
            const zaCheck = cleanDex.filter(p => p.name.includes('Mega Raichu') || p.name.includes('Mega Charizard'));
            console.log('Sample Z-A/Mega Check:', zaCheck.length > 0 ? 'Found entries' : 'No entries found', zaCheck.slice(0, 3));

        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });

}).on('error', (err) => {
    console.error('Error downloading data:', err);
});
