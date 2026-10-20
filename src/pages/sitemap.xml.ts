import type { APIRoute } from 'astro';
import pokedex from '../data/pokedex.json';
import typeData from '../data/type-data.json';
import { pokemonSlug } from '../lib/seo.js';

const SITE = 'https://poketypes.app';

// No <lastmod>: the site has no per-page modification date, and stamping
// "today" on every request tells crawlers the page changed when it did not.
function url(path: string, priority: string, changefreq: string) {
    return `  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = () => {
    const entries: string[] = [];

    // Homepage
    entries.push(url('/', '1.0', 'weekly'));

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

    // All Pokemon pages. Several pokedex entries (Arceus plates, Totems...)
    // share one slug and therefore one page, so list each URL once.
    const slugs = new Set((pokedex as Array<{ name: string; apiName?: string }>).map(pokemonSlug));
    slugs.forEach(slug => {
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
