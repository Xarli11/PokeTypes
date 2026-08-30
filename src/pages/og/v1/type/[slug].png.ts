import type { APIRoute } from 'astro';
import { renderCardPng, pngResponse } from '../../../../lib/og/render.js';
import { buildTypeCard } from '../../../../lib/og/cards/type.js';
import { buildHomeCard } from '../../../../lib/og/cards/home.js';
import { resolveTypeSlug } from '../../../../lib/og/resolve.js';
import { OG_CACHE_CONTROL } from '../../../../lib/og/cache.js';

// Only slugs that resolve to real type names via resolveTypeSlug() ever
// reach buildTypeCard() — no arbitrary query params, no unbounded slug
// text reaches the renderer (see docs/open-graph.md "Security").
export const GET: APIRoute = async ({ params }) => {
    const types = resolveTypeSlug(params.slug);

    if (!types) {
        const png = await renderCardPng(buildHomeCard());
        return pngResponse(png, {
            status: 404,
            headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' },
        });
    }

    const png = await renderCardPng(buildTypeCard(types));
    return pngResponse(png, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': OG_CACHE_CONTROL,
        },
    });
};
