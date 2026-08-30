import type { SatoriNode } from '../render.js';
import { cardFrame, wordmark, typePillRow } from './chrome.js';
import { FONT_FAMILIES } from '../fonts.js';
import { CARD_BG, CARD_SURFACE, CARD_TEXT, CARD_TEXT_MUTED, typeColor } from '../colors.js';

export type PokemonCardInput = {
    name: string;
    id: number;
    types: string[];
    artworkDataUri: string;
};

// Length-based, not name-based — no per-Pokémon exceptions (some official
// names run to 25 chars, e.g. "Urshifu-Rapid-Strike-Gmax"). Up to 13
// chars fits the 640px-wide column on one line at these sizes (verified
// by rendering the dataset's actual longest names at each step — see
// docs/open-graph.md "Templates"). Past that, two lines is expected and
// fine; the extra steps here exist so a 14-char name isn't rendered at
// the same shrunken size as a 25-char one — each step gives up a bit more
// size only once the previous one stops reliably holding a single line.
function nameFontSize(name: string): number {
    const length = name.length;
    if (length <= 8) return 64;
    if (length <= 13) return 52;
    if (length <= 17) return 38;
    if (length <= 22) return 32;
    return 28;
}

export function buildPokemonCard({ name, id, types, artworkDataUri }: PokemonCardInput): SatoriNode {
    const dexNumber = `#${String(id).padStart(4, '0')}`;
    const accent = typeColor(types[0]);

    return cardFrame(
        {
            backgroundImage: `radial-gradient(circle at 88% 50%, ${accent}22 0%, ${CARD_BG} 60%)`,
        },
        [
            {
                type: 'div',
                props: {
                    style: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 48 },
                    children: [
                        {
                            type: 'div',
                            props: {
                                // `width` (not `maxWidth`) on purpose: a flex
                                // item's default min-width is its content's
                                // intrinsic width, so a `maxWidth` alone does
                                // not stop an unbroken word (e.g. "DRAGONITE")
                                // from overflowing past the artwork panel.
                                style: { display: 'flex', flexDirection: 'column', gap: 22, width: 640 },
                                children: [
                                    {
                                        type: 'div',
                                        props: {
                                            // Tighter than the card's other gaps on purpose — the dex
                                            // number reads as part of the name group, not a separate
                                            // block, while staying visually secondary (muted color,
                                            // mono face, no weight/size competing with the name).
                                            style: { display: 'flex', flexDirection: 'column', gap: 4 },
                                            children: [
                                                {
                                                    type: 'span',
                                                    props: {
                                                        style: {
                                                            display: 'flex',
                                                            fontFamily: FONT_FAMILIES.display,
                                                            fontWeight: 800,
                                                            fontSize: nameFontSize(name),
                                                            lineHeight: 1.05,
                                                            color: CARD_TEXT,
                                                            width: '100%',
                                                            // Safety net for a single long word with no
                                                            // space/hyphen to wrap at — breaks mid-word
                                                            // rather than overflowing past the artwork.
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word',
                                                        },
                                                        children: name.toUpperCase(),
                                                    },
                                                },
                                                {
                                                    type: 'span',
                                                    props: {
                                                        style: {
                                                            display: 'flex',
                                                            fontFamily: FONT_FAMILIES.mono,
                                                            fontWeight: 700,
                                                            fontSize: 30,
                                                            lineHeight: 1,
                                                            letterSpacing: '0.02em',
                                                            color: CARD_TEXT_MUTED,
                                                        },
                                                        children: dexNumber,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    typePillRow(types, { fontSize: 26 }),
                                    {
                                        type: 'span',
                                        props: {
                                            style: {
                                                fontFamily: FONT_FAMILIES.ui,
                                                fontWeight: 500,
                                                fontSize: 28,
                                                color: CARD_TEXT_MUTED,
                                            },
                                            children: 'Weaknesses & Resistances',
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            type: 'div',
                            props: {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 380,
                                    height: 380,
                                    borderRadius: 32,
                                    backgroundColor: CARD_SURFACE,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    flexShrink: 0,
                                },
                                children: [
                                    {
                                        type: 'img',
                                        props: {
                                            src: artworkDataUri,
                                            width: 320,
                                            height: 320,
                                            style: { objectFit: 'contain' },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            wordmark('md'),
        ],
    );
}
