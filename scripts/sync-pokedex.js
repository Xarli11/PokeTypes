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

                // Exclude specific cosmetic forms
                if (isCosmeticPikachu || isCosmeticVivillon || isCosmeticAlcremie || isCosmeticMinior || 
                    isCosmeticFurfrou || isCosmeticFloette || isCosmeticTatsugiri || 
                    isCosmeticSquawkabilly || isCosmeticLycanroc || isCosmeticToxtricity) {
                    continue;
                }

                // Map to our project format:
                // { "id": number, "name": string, "types": string[] }
                
                cleanDex.push({
                    id: entry.num,
                    name: formatName(entry.name),
                    types: entry.types
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
