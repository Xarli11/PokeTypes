import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import pokedex from '../src/data/pokedex.json';
import typeData from '../src/data/type-data.json';
import { GET as getSitemap } from '../src/pages/sitemap.xml.ts';
import {
    pokemonSlug,
    normalizePathname,
    parseTypeSlug,
    renderStatsHtml,
    renderAbilitiesHtml
} from '../src/lib/seo.js';

const { types } = typeData;

describe('sitemap.xml', async () => {
    const xml = await (await getSitemap({})).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

    it('lists every URL once', () => {
        expect(new Set(locs).size).toBe(locs.length);
    });

    it('covers home, 18 types, 20 dual types and every distinct pokemon slug', () => {
        const slugs = new Set(pokedex.map(pokemonSlug));
        expect(locs.length).toBe(1 + types.length + 20 + slugs.size);
        expect(locs).toContain('https://poketypes.app/');
        expect(locs).toContain('https://poketypes.app/pokemon/arceus');
    });

    it('does not emit a request-time <lastmod>', () => {
        expect(xml).not.toContain('<lastmod>');
    });
});

describe('robots.txt', () => {
    const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');

    it('keeps /api/ closed except the two files the pages need to render', () => {
        expect(robots).toMatch(/^Disallow: \/api\/$/m);
        expect(robots).toMatch(/^Allow: \/api\/app-data\.json$/m);
        expect(robots).toMatch(/^Allow: \/api\/pokedex\.json$/m);
    });

    it('still advertises the sitemap', () => {
        expect(robots).toContain('Sitemap: https://poketypes.app/sitemap.xml');
    });
});

describe('normalizePathname', () => {
    it('drops trailing slashes but keeps the root', () => {
        expect(normalizePathname('/tipo/fire/')).toBe('/tipo/fire');
        expect(normalizePathname('/tipo/fire')).toBe('/tipo/fire');
        expect(normalizePathname('/')).toBe('/');
    });
});

describe('parseTypeSlug', () => {
    it('resolves 1 to 3 known types, case-insensitively', () => {
        expect(parseTypeSlug('fire', types)).toEqual(['Fire']);
        expect(parseTypeSlug('Fire-FLYING', types)).toEqual(['Fire', 'Flying']);
        expect(parseTypeSlug('fire-flying-water', types)).toEqual(['Fire', 'Flying', 'Water']);
    });

    it.each(['', 'xyz', 'fire-garbage', 'fire-flying-water-grass', 'fire/water'])(
        'rejects %j so it 404s instead of duplicating a valid page',
        slug => {
            expect(parseTypeSlug(slug, types)).toBeNull();
        }
    );

    it('rejects a missing slug', () => {
        expect(parseTypeSlug(undefined, types)).toBeNull();
    });
});

describe('server-rendered stats and abilities', () => {
    const charizard = pokedex.find(p => p.name === 'Charizard');

    it('renders all six base stats from the local pokedex', () => {
        const html = renderStatsHtml(charizard.stats);
        for (const label of ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']) {
            expect(html).toContain(`>${label}<`);
        }
        expect(html).toContain('>109<');
        expect(html).toContain('bg-green-500');
    });

    it('lists ability names and marks the hidden one', () => {
        const html = renderAbilitiesHtml(charizard.abilities);
        expect(html).toContain('Blaze');
        expect(html).toContain('Solar Power');
        expect(html.match(/>Hidden</g)).toHaveLength(1);
    });

    it('returns an empty string when data is missing', () => {
        expect(renderStatsHtml(undefined)).toBe('');
        expect(renderAbilitiesHtml(undefined)).toBe('');
    });

    it('has stats for every pokedex entry', () => {
        const missing = pokedex.filter(p => !renderStatsHtml(p.stats));
        expect(missing).toEqual([]);
    });
});
