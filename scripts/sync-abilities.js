const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_FILE = path.join(__dirname, '../data/abilities-i18n.json');
const API_URL = 'https://pokeapi.co/api/v2/ability?limit=1000';

console.log(`Fetching ability list from ${API_URL}...`);

// Simple mapping structure: { "levitate": { "es": "Levitación", "en": "Levitate" } }
// To avoid fetching 300+ urls individually (which is slow), we might check if there's a bulk way.
// PokeAPI doesn't have a bulk localized endpoint for all abilities in one go without GraphQL.
// But we can try to be smart. 
// Actually, fetching 300 urls is acceptable for a build script run occasionally. 
// We will use a batch queue.

const abilityMap = {};

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function syncAbilities() {
    try {
        const listData = await fetchUrl(API_URL);
        const results = listData.results;
        console.log(`Found ${results.length} abilities. Fetching details...`);

        // Process in chunks to avoid rate limiting
        const CHUNK_SIZE = 20;
        let processed = 0;

        for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);
            const promises = chunk.map(item => fetchUrl(item.url).then(details => {
                const key = item.name; // slug
                const names = {};
                
                details.names.forEach(n => {
                    if (n.language.name === 'es') names.es = n.name;
                    if (n.language.name === 'en') names.en = n.name;
                });

                // Fallback
                if (!names.en) names.en = details.name; 
                
                // Store using the Showdown/slug format (lowercase, hyphens)
                abilityMap[key] = names;
            }).catch(e => console.error(`Error fetching ${item.name}:`, e.message)));

            await Promise.all(promises);
            processed += chunk.length;
            process.stdout.write(`\rProcessed: ${processed}/${results.length}`);
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(abilityMap, null, 2));
        console.log(`\nSuccessfully saved ability translations to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

syncAbilities();
