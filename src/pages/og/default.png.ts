import type { APIRoute } from 'astro';
import { renderCardPng, pngResponse } from '../../lib/og/render.js';
import { buildHomeCard } from '../../lib/og/cards/home.js';
import { OG_CACHE_CONTROL } from '../../lib/og/cache.js';

export const GET: APIRoute = async () => {
    const png = await renderCardPng(buildHomeCard());
    return pngResponse(png, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': OG_CACHE_CONTROL,
        },
    });
};
