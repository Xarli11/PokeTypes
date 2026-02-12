const fs = require('fs');
const path = require('path');
const https = require('https');

const POKEDEX_FILE = path.join(__dirname, '../data/pokedex.json');
const FIXES_FILE = path.join(__dirname, '../data/image-fixes.json');
const CONCURRENCY = 20;

const pokedex = JSON.parse(fs.readFileSync(POKEDEX_FILE, 'utf8'));
const fixes = {};
const failures = [];

function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function findWorkingUrl(pokemon) {
    // 1. Current Strategy (PokemonDB Home Normal)
    const slug = pokemon.spriteSlug || pokemon.apiName;
    const primaryUrl = `https://img.pokemondb.net/sprites/home/normal/${slug}.png`;
    
    // Optimistic check first? No, we want to find FIXES for broken ones.
    if (await checkUrl(primaryUrl)) return null; 

    // console.log(`[404] ${pokemon.name} (${slug})`); // Verbose off

    // 2. Try Alternatives
    const candidates = [
        // Variation 1: Clean Name (remove suffixes completely) -> Base form fallback
        `https://img.pokemondb.net/sprites/home/normal/${slug.split('-')[0]}.png`,
        
        // Variation 2: apiName (sometimes different from spriteSlug)
        `https://img.pokemondb.net/sprites/home/normal/${pokemon.apiName}.png`,
        
        // Variation 3: ID based (PokeAPI) - almost always works for base forms
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
        
        // Variation 4: Special cases (replace - with nothing)
        `https://img.pokemondb.net/sprites/home/normal/${slug.replace(/-/g, '')}.png`
    ];

    // Specific logic for Megas/Gmax that don't exist -> Fallback to base
    if (pokemon.name.includes('Mega') || pokemon.name.includes('Gmax')) {
        const baseName = slug.replace(/-mega.*/, '').replace(/-gmax/, '').replace(/-gigantamax/, '');
        candidates.push(`https://img.pokemondb.net/sprites/home/normal/${baseName}.png`);
    }

    for (const url of candidates) {
        if (await checkUrl(url)) {
            // Found a working one!
            if (url.includes('pokemondb')) {
                // Extract slug manually without regex for safety
                const parts = url.split('/');
                const filename = parts[parts.length - 1];
                const newSlug = filename.replace('.png', '');
                return { type: 'slug', value: newSlug };
            } else {
                return { type: 'url', value: url };
            }
        }
    }

    return { type: 'failed' };
}

async function audit() {
    console.log(`Auditing images for ${pokedex.length} pokemon...`);
    
    let processed = 0;
    // We only process in batches to avoid socket exhaustion
    for (let i = 0; i < pokedex.length; i += CONCURRENCY) {
        const batch = pokedex.slice(i, i + CONCURRENCY);
        
        const results = await Promise.all(batch.map(async (p) => {
            const fix = await findWorkingUrl(p);
            return { p, fix };
        }));

        results.forEach(({ p, fix }) => {
            if (fix) {
                if (fix.type === 'failed') {
                    failures.push(p.name);
                } else {
                    // Save the fix
                    fixes[p.apiName] = fix;
                }
            }
        });

        process.stdout.write(`\rProgress: ${processed}/${pokedex.length} | Fixes Found: ${Object.keys(fixes).length} | Failed: ${failures.length}`);
    }

    console.log('\n\n--- Done ---');
    fs.writeFileSync(FIXES_FILE, JSON.stringify(fixes, null, 2));
    console.log(`Saved fixes to ${FIXES_FILE}`);
    if (failures.length > 0) {
        console.log('Still failing (fallback to Pokeball needed):', failures);
    }
}

audit();