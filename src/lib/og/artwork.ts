// Pokémon artwork is the one external dependency in card rendering
// (raw.githubusercontent.com). It must never be able to break a card: a
// slow or failing fetch falls back to the local PokeTypes pokeball mark,
// which is bundled at build time (zero network dependency of its own).
import { pokeballPngBase64 } from './pokeball.generated.js';
import { toDataUri } from './base64.js';

const ARTWORK_FETCH_TIMEOUT_MS = 3000;

export const FALLBACK_ARTWORK_DATA_URI = `data:image/png;base64,${pokeballPngBase64}`;

// `id` is the Pokédex number of the *base* species (satori just needs a
// picture, not a perfectly form-accurate sprite) — same source
// pokemon/[name].astro already used directly as og:image.
export async function fetchArtworkDataUri(id: number): Promise<string> {
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(ARTWORK_FETCH_TIMEOUT_MS) });
        if (!response.ok) return FALLBACK_ARTWORK_DATA_URI;
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength === 0) return FALLBACK_ARTWORK_DATA_URI;
        return toDataUri(buffer, response.headers.get('content-type') || 'image/png');
    } catch {
        return FALLBACK_ARTWORK_DATA_URI;
    }
}
