import type { SatoriNode } from '../render.js';
import { cardFrame, wordmark, typePillRow, multiplierBadge, purposeLine } from './chrome.js';
import { FONT_FAMILIES } from '../fonts.js';
import { CARD_BG, CARD_SURFACE_RAISED, CARD_TEXT, SEVERITY_WEAK, SEVERITY_RESIST, SEVERITY_IMMUNE } from '../colors.js';

const ACCENT_TYPES = ['Fire', 'Water', 'Dragon', 'Electric'];

export function buildHomeCard(): SatoriNode {
    return cardFrame(
        {
            backgroundImage: `linear-gradient(135deg, ${CARD_SURFACE_RAISED} 0%, ${CARD_BG} 62%)`,
            justifyContent: 'space-between',
        },
        [
            wordmark('lg'),
            {
                type: 'div',
                props: {
                    style: { display: 'flex', flexDirection: 'column', gap: 20 },
                    children: [
                        {
                            type: 'span',
                            props: {
                                style: {
                                    fontFamily: FONT_FAMILIES.display,
                                    fontWeight: 800,
                                    fontSize: 76,
                                    lineHeight: 1.05,
                                    color: CARD_TEXT,
                                },
                                children: 'Pokemon Type Calculator',
                            },
                        },
                        purposeLine,
                    ],
                },
            },
            {
                type: 'div',
                props: {
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                    children: [
                        typePillRow(ACCENT_TYPES, { fontSize: 22 }),
                        {
                            type: 'div',
                            props: {
                                style: { display: 'flex', gap: 14 },
                                children: [
                                    multiplierBadge('2×', SEVERITY_WEAK),
                                    multiplierBadge('½×', SEVERITY_RESIST),
                                    multiplierBadge('0×', SEVERITY_IMMUNE),
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    );
}
