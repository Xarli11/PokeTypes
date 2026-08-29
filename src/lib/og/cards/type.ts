import type { SatoriNode } from '../render.js';
import { cardFrame, wordmark, typePillRow } from './chrome.js';
import { FONT_FAMILIES } from '../fonts.js';
import { CARD_BG, CARD_SURFACE, CARD_TEXT, CARD_TEXT_MUTED, typeColor } from '../colors.js';

// Programmatic by design — no per-combination artwork. The accent color(s)
// come straight from the type list, so this scales to every 1-3 type slug
// the /tipo/* route accepts without a template change.
export function buildTypeCard(types: string[]): SatoriNode {
    const typeName = types.join('/');
    const accent = typeColor(types[0]);
    // Font size shrinks a step past two types so a triple-type name still
    // clears the card's safe margins.
    const pillFontSize = types.length >= 3 ? 40 : 56;

    return cardFrame(
        {
            backgroundImage: `radial-gradient(circle at 12% 8%, ${CARD_SURFACE} 0%, ${CARD_BG} 55%)`,
            justifyContent: 'space-between',
        },
        [
            wordmark('md'),
            {
                type: 'div',
                props: {
                    style: { display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'flex-start' },
                    children: [
                        typePillRow(types, { fontSize: pillFontSize, gap: 18 }),
                        {
                            type: 'div',
                            props: {
                                style: { display: 'flex', flexDirection: 'column', gap: 10 },
                                children: [
                                    {
                                        type: 'span',
                                        props: {
                                            style: {
                                                fontFamily: FONT_FAMILIES.display,
                                                fontWeight: 800,
                                                fontSize: 46,
                                                color: CARD_TEXT,
                                            },
                                            children: `${typeName} Type`,
                                        },
                                    },
                                    {
                                        type: 'span',
                                        props: {
                                            style: {
                                                fontFamily: FONT_FAMILIES.ui,
                                                fontWeight: 500,
                                                fontSize: 30,
                                                color: CARD_TEXT_MUTED,
                                            },
                                            children: 'Weaknesses & Resistances',
                                        },
                                    },
                                ],
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
                        width: '100%',
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: accent,
                    },
                },
            },
        ],
    );
}
