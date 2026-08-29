import type { APIRoute } from 'astro';
import { renderCardPng, pngResponse } from '../../../../lib/og/render.js';
import { buildPokemonCard } from '../../../../lib/og/cards/pokemon.js';
import { buildHomeCard } from '../../../../lib/og/cards/home.js';
import { resolvePokemonSlug } from '../../../../lib/og/resolve.js';
import { fetchArtworkDataUri } from '../../../../lib/og/artwork.js';
import { OG_CACHE_CONTROL } from '../../../../lib/og/cache.js';

// Only a slug that resolves against the local pokedex (same matching
// pokemon/[name].astro uses) ever reaches buildPokemonCard() — no
// arbitrary artwork URL or text can be injected via the slug (see
// docs/open-graph.md "Security").
export const GET: APIRoute = async ({ params }) => {
    const pokemon = resolvePokemonSlug(params.slug);

    if (!pokemon) {
        const png = await renderCardPng(buildHomeCard());
        return pngResponse(png, {
            status: 404,
            headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' },
        });
    }

    const artworkDataUri = await fetchArtworkDataUri(pokemon.id);
    const png = await renderCardPng(buildPokemonCard({
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types,
        artworkDataUri,
    }));

    return pngResponse(png, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': OG_CACHE_CONTROL,
        },
    });
};
