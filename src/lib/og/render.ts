// Core PNG renderer shared by every OG route: build a plain-object node
// tree (satori's non-JSX format — no React/JSX build step needed), turn it
// into SVG with satori, then rasterize with resvg. Both libraries are
// WASM-only (no native bindings), which is what makes this work on
// Cloudflare Workers — see docs/open-graph.md for why Sharp was rejected.
//
// `@cf-wasm/satori` and `@cf-wasm/resvg` ship conditional exports keyed on
// runtime ("workerd" for Cloudflare, "node" for `astro dev`/tests/CI), so
// importing the package root lets the bundler/runtime pick the right one
// automatically — no manual WASM instantiation here.
import { satori } from '@cf-wasm/satori';
import { Resvg } from '@cf-wasm/resvg';
import { SATORI_FONTS } from './fonts.js';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type SatoriNode = {
    type: string;
    props: {
        style?: Record<string, string | number>;
        children?: SatoriNode | SatoriNode[] | string | (SatoriNode | string)[];
        [key: string]: unknown;
    };
};

export async function renderCardPng(tree: SatoriNode): Promise<Uint8Array> {
    const svg = await satori(tree as never, {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts: SATORI_FONTS,
    });

    const resvg = await Resvg.async(svg, {
        fitTo: { mode: 'width', value: OG_WIDTH },
    });
    return resvg.render().asPng();
}

// `Response`'s BodyInit type (as seen by this project's TS lib target)
// doesn't include `Uint8Array` even though it's spec-valid and works fine
// at runtime — one cast here instead of one per route.
export function pngResponse(png: Uint8Array, init: ResponseInit): Response {
    return new Response(png as unknown as BodyInit, init);
}
