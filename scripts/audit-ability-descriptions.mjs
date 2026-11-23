// Lists abilities whose Spanish description is missing, i.e. the client would show the English fallback
// (src/js/modules/data.js: manual `<ability>_desc` message -> PokeAPI flavor/effect text in the language -> English).
// Reads PokeAPI (network). Usage: node scripts/audit-ability-descriptions.mjs [--pilot] [--json]
//   --pilot  only the abilities of the Spanish pilot Pokemon
import { readFileSync } from 'node:fs';
import { messages } from '../src/js/lang/messages.js';
import { PILOT_EN_PATHS } from '../src/lib/i18n-pilot.js';
import { abilitySlugsOf } from '../src/lib/seo.js';

const root = new URL('../', import.meta.url);
const read = f => JSON.parse(readFileSync(new URL(f, root), 'utf8'));
const abilityNames = read('src/data/abilities-i18n.json');
const pokedex = read('src/data/pokedex.json');
const args = new Set(process.argv.slice(2));

let slugs = Object.keys(abilityNames);
if (args.has('--pilot')) {
    slugs = abilitySlugsOf(pokedex, PILOT_EN_PATHS.filter(p => p.startsWith('/pokemon/')).map(p => p.slice(9)));
}

const hasText = (data, lang) =>
    data.flavor_text_entries?.some(f => f.language.name === lang) || data.effect_entries?.some(e => e.language.name === lang);

async function audit(slug) {
    const manual = messages.es[`${slug}_desc`] !== undefined;
    let api = null;
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/ability/${slug}`);
        if (!res.ok) return { slug, manual, api: `HTTP ${res.status}` };
        const data = await res.json();
        api = { es: hasText(data, 'es'), en: hasText(data, 'en') };
    } catch (err) { return { slug, manual, api: `error: ${err.message}` }; }
    return { slug, manual, api };
}

const rows = [];
const queue = [...slugs];
await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) rows.push(await audit(queue.shift()));
}));
rows.sort((a, b) => a.slug.localeCompare(b.slug));

const missing = rows.filter(r => !r.manual && r.api && typeof r.api === 'object' && !r.api.es);
const failed = rows.filter(r => typeof r.api === 'string');
if (args.has('--json')) {
    console.log(JSON.stringify({ total: rows.length, missingEs: missing.map(r => r.slug), failed }, null, 2));
} else {
    console.log(`abilities: ${rows.length} | manual es: ${rows.filter(r => r.manual).length} | PokeAPI es: ${rows.filter(r => r.api?.es).length} | missing es: ${missing.length} | lookup failed: ${failed.length}`);
    missing.forEach(r => console.log('  missing es:', r.slug));
    failed.forEach(r => console.log('  failed:', r.slug, r.api));
}
