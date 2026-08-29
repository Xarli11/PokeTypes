// Exercises the actual Astro endpoint handlers (og/v1/default.png.ts,
// og/v1/type/[slug].png.ts, og/v1/pokemon/[slug].png.ts) directly —
// they're plain `GET({ params })` functions, so no Astro server/dev
// instance is needed to call them.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET as defaultGET } from '../../src/pages/og/v1/default.png.ts';
import { GET as typeGET } from '../../src/pages/og/v1/type/[slug].png.ts';
import { GET as pokemonGET } from '../../src/pages/og/v1/pokemon/[slug].png.ts';
import { ogDefaultPath, ogTypePath, ogPokemonPath } from '../../src/lib/og/version.ts';
import { isPng, pngDimensions } from './png-utils.js';

async function readPng(response) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(isPng(bytes)).toBe(true);
    return bytes;
}

describe('OG_VERSION path helpers', () => {
    it('match the actual routed file locations under src/pages/og/', () => {
        // A version bump only works if the path helpers (used by
        // Layout/tipo/pokemon to build og:image) and the directory Astro
        // actually routes from stay in lockstep.
        expect(ogDefaultPath()).toBe('/og/v1/default.png');
        expect(ogTypePath('fire')).toBe('/og/v1/type/fire.png');
        expect(ogPokemonPath('dragonite')).toBe('/og/v1/pokemon/dragonite.png');
    });
});

describe('GET /og/v1/default.png', () => {
    it('returns a 200 PNG with a versioned, immutable cache header', async () => {
        const res = await defaultGET({ params: {} });
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('image/png');
        expect(res.headers.get('cache-control')).toContain('public');
        expect(res.headers.get('cache-control')).toContain('immutable');
        const bytes = await readPng(res);
        expect(pngDimensions(bytes)).toEqual({ width: 1200, height: 630 });
    });
});

describe('GET /og/v1/type/[slug].png', () => {
    it('returns a 200 PNG for a valid dual-type slug', async () => {
        const res = await typeGET({ params: { slug: 'dragon-flying' } });
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('image/png');
        await readPng(res);
    });

    it('returns 404 with a clean fallback PNG for an invalid slug', async () => {
        const res = await typeGET({ params: { slug: 'not-a-real-type' } });
        expect(res.status).toBe(404);
        expect(res.headers.get('content-type')).toBe('image/png');
        await readPng(res);
    });
});

describe('GET /og/v1/pokemon/[slug].png', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns a 200 PNG for a valid slug (artwork fetch mocked)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
        const res = await pokemonGET({ params: { slug: 'dragonite' } });
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('image/png');
        const bytes = await readPng(res);
        expect(pngDimensions(bytes)).toEqual({ width: 1200, height: 630 });
    });

    it('returns a 200 PNG for a long Gmax-form slug', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
        const res = await pokemonGET({ params: { slug: 'urshifu-rapid-strike-gmax' } });
        expect(res.status).toBe(200);
        await readPng(res);
    });

    it('returns 404 with a clean fallback PNG for an invalid slug', async () => {
        const res = await pokemonGET({ params: { slug: 'not-a-real-pokemon-xyz' } });
        expect(res.status).toBe(404);
        expect(res.headers.get('content-type')).toBe('image/png');
        await readPng(res);
    });

    it('still returns a 200 PNG when the artwork fetch throws', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
        const res = await pokemonGET({ params: { slug: 'charizard' } });
        expect(res.status).toBe(200);
        await readPng(res);
    });
});
