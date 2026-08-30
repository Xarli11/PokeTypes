import { describe, it, expect } from 'vitest';
import { renderCardPng, OG_WIDTH, OG_HEIGHT } from '../../src/lib/og/render.js';
import { buildHomeCard } from '../../src/lib/og/cards/home.js';
import { buildTypeCard } from '../../src/lib/og/cards/type.js';
import { buildPokemonCard } from '../../src/lib/og/cards/pokemon.js';
import { FALLBACK_ARTWORK_DATA_URI } from '../../src/lib/og/artwork.js';
import { isPng, pngDimensions } from './png-utils.js';

describe('renderCardPng', () => {
    it('renders the home card as a real 1200x630 PNG', async () => {
        const png = await renderCardPng(buildHomeCard());
        expect(png.length).toBeGreaterThan(0);
        expect(isPng(png)).toBe(true);
        expect(pngDimensions(png)).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
    });

    it('renders a dual-type card', async () => {
        const png = await renderCardPng(buildTypeCard(['Dragon', 'Flying']));
        expect(isPng(png)).toBe(true);
        expect(pngDimensions(png)).toEqual({ width: 1200, height: 630 });
    });

    it('renders a triple-type card without throwing', async () => {
        const png = await renderCardPng(buildTypeCard(['Fire', 'Flying', 'Dragon']));
        expect(isPng(png)).toBe(true);
    });

    it('renders a Pokemon card using the local fallback artwork', async () => {
        const png = await renderCardPng(buildPokemonCard({
            name: 'Dragonite',
            id: 149,
            types: ['Dragon', 'Flying'],
            artworkDataUri: FALLBACK_ARTWORK_DATA_URI,
        }));
        expect(isPng(png)).toBe(true);
        expect(pngDimensions(png)).toEqual({ width: 1200, height: 630 });
    });

    it('renders a very long/hyphenated Pokemon name without throwing', async () => {
        const png = await renderCardPng(buildPokemonCard({
            name: 'Urshifu-Rapid-Strike-Gmax',
            id: 892,
            types: ['Fighting', 'Water'],
            artworkDataUri: FALLBACK_ARTWORK_DATA_URI,
        }));
        expect(isPng(png)).toBe(true);
        expect(pngDimensions(png)).toEqual({ width: 1200, height: 630 });
    });
});
