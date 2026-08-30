// Shared building blocks for every card template — kept tiny on purpose
// (see sprint brief: no glassmorphism, no blobs, no gradients-as-identity).
// satori only understands flexbox layout, so every multi-child node below
// declares `display: 'flex'` explicitly.
import type { SatoriNode } from '../render.js';
import { FONT_FAMILIES } from '../fonts.js';
import { FALLBACK_ARTWORK_DATA_URI } from '../artwork.js';
import { CARD_TEXT, CARD_TEXT_MUTED, typeColor, typeTextColor } from '../colors.js';

export function wordmark(size: 'lg' | 'md' = 'md'): SatoriNode {
    const iconSize = size === 'lg' ? 40 : 32;
    const fontSize = size === 'lg' ? 30 : 24;
    return {
        type: 'div',
        props: {
            style: { display: 'flex', alignItems: 'center', gap: 12 },
            children: [
                {
                    type: 'img',
                    props: {
                        src: FALLBACK_ARTWORK_DATA_URI,
                        width: iconSize,
                        height: iconSize,
                        style: { objectFit: 'contain' },
                    },
                },
                {
                    type: 'span',
                    props: {
                        style: {
                            fontFamily: FONT_FAMILIES.display,
                            fontWeight: 800,
                            fontSize,
                            letterSpacing: '0.02em',
                            color: CARD_TEXT,
                        },
                        children: 'POKETYPES',
                    },
                },
            ],
        },
    };
}

export function typePill(type: string, opts: { fontSize?: number; padX?: number; padY?: number } = {}): SatoriNode {
    const { fontSize = 26, padX = 22, padY = 10 } = opts;
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: typeColor(type),
                color: typeTextColor(type),
                fontFamily: FONT_FAMILIES.ui,
                fontWeight: 700,
                fontSize,
                padding: `${padY}px ${padX}px`,
                borderRadius: 999,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
            },
            children: type,
        },
    };
}

export function typePillRow(types: string[], opts?: { fontSize?: number; gap?: number }): SatoriNode {
    return {
        type: 'div',
        props: {
            style: { display: 'flex', alignItems: 'center', gap: opts?.gap ?? 14 },
            children: types.map(t => typePill(t, { fontSize: opts?.fontSize })),
        },
    };
}

export function multiplierBadge(label: string, color: string): SatoriNode {
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_FAMILIES.mono,
                fontWeight: 700,
                fontSize: 24,
                color,
                backgroundColor: `${color}26`,
                border: `2px solid ${color}59`,
                borderRadius: 12,
                padding: '8px 18px',
            },
            children: label,
        },
    };
}

// 96px safe margin on every side keeps content clear of the crop/rounding
// that Discord, WhatsApp, and X apply to their preview thumbnails.
export function cardFrame(background: SatoriNode['props']['style'], children: SatoriNode[]): SatoriNode {
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '1200px',
                height: '630px',
                padding: '72px',
                fontFamily: FONT_FAMILIES.ui,
                color: CARD_TEXT,
                ...background,
            },
            children,
        },
    };
}

export const purposeLine: SatoriNode = {
    type: 'span',
    props: {
        style: {
            fontFamily: FONT_FAMILIES.ui,
            fontWeight: 500,
            fontSize: 26,
            color: CARD_TEXT_MUTED,
            letterSpacing: '0.02em',
        },
        children: 'Weaknesses · Resistances · Team Analysis',
    },
};
