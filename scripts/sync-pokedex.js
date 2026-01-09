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
