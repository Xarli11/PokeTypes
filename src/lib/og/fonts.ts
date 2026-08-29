// Font data is bundled into the SSR/Worker output at build time (as base64
// string constants — see scripts/generate-og-assets.mjs for why not a
// direct binary import) rather than fetched at request time: a remote font
// fetch is one more thing that can fail or add latency on every
// social-crawler hit, and these six files together are ~230KB, small
// enough to ship inline. See src/lib/og/fonts/SOURCE.md for provenance.
import { base64ToArrayBuffer } from './base64.js';
import {
    syneBold as syneBoldB64,
    syneExtraBold as syneExtraBoldB64,
    outfitRegular as outfitRegularB64,
    outfitSemiBold as outfitSemiBoldB64,
    outfitBold as outfitBoldB64,
    monoBold as monoBoldB64,
} from './fonts/data.generated.js';

const syneBold = base64ToArrayBuffer(syneBoldB64);
const syneExtraBold = base64ToArrayBuffer(syneExtraBoldB64);
const outfitRegular = base64ToArrayBuffer(outfitRegularB64);
const outfitSemiBold = base64ToArrayBuffer(outfitSemiBoldB64);
const outfitBold = base64ToArrayBuffer(outfitBoldB64);
const monoBold = base64ToArrayBuffer(monoBoldB64);

export const FONT_FAMILIES = {
    display: 'Syne',
    ui: 'Outfit',
    mono: 'JetBrains Mono',
} as const;

// satori's `fonts` option — one entry per (family, weight) combination
// used anywhere in src/lib/og/cards/*.
export const SATORI_FONTS = [
    { name: FONT_FAMILIES.display, data: syneBold, weight: 700 as const, style: 'normal' as const },
    { name: FONT_FAMILIES.display, data: syneExtraBold, weight: 800 as const, style: 'normal' as const },
    { name: FONT_FAMILIES.ui, data: outfitRegular, weight: 400 as const, style: 'normal' as const },
    { name: FONT_FAMILIES.ui, data: outfitSemiBold, weight: 600 as const, style: 'normal' as const },
    { name: FONT_FAMILIES.ui, data: outfitBold, weight: 700 as const, style: 'normal' as const },
    { name: FONT_FAMILIES.mono, data: monoBold, weight: 700 as const, style: 'normal' as const },
];
