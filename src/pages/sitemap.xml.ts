import type { APIRoute } from 'astro';
import pokedex from '../data/pokedex.json';
import typeData from '../data/type-data.json';

const SITE = 'https://poketypes.app';

function url(path: string, priority: string, changefreq: string, lastmod?: string) {
    return `  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

export const GET: APIRoute = () => {
    const today = new Date().toISOString().split('T')[0];
    const entries: string[] = [];

    // Homepage
    entries.push(url('/', '1.0', 'weekly', today));

    // All 18 type pages — highest value after homepage
    typeData.types.forEach(type => {
        entries.push(url(`/tipo/${type.toLowerCase()}`, '0.9', 'monthly'));
    });

    // Common dual-type combinations (top coverage queries)
    const dualTypes: [string, string][] = [
        ['fire', 'flying'], ['water', 'flying'], ['dragon', 'flying'],
        ['steel', 'flying'], ['grass', 'poison'], ['water', 'ground'],
        ['fire', 'ground'], ['rock', 'ground'], ['ghost', 'dark'],
        ['fairy', 'steel'], ['dragon', 'steel'], ['water', 'ice'],
        ['psychic', 'fairy'], ['fighting', 'steel'], ['electric', 'steel'],
        ['ice', 'ground'], ['dark', 'fighting'], ['bug', 'steel'],
        ['normal', 'flying'], ['rock', 'water'],
    ];
    dualTypes.forEach(([t1, t2]) => {
        entries.push(url(`/tipo/${t1}-${t2}`, '0.8', 'monthly'));
    });

    // All Pokemon pages
    (pokedex as Array<{ name: string; apiName?: string }>).forEach(pokemon => {
        const slug = (pokemon.apiName || pokemon.name).toLowerCase().replace(/\s+/g, '-');
        entries.push(url(`/pokemon/${slug}`, '0.7', 'monthly'));
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries.join('\n')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
        },
    });
};
