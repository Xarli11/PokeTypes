import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchArtworkDataUri, FALLBACK_ARTWORK_DATA_URI } from '../../src/lib/og/artwork.js';

describe('fetchArtworkDataUri fallback', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('falls back when the artwork host returns a non-OK response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
        const result = await fetchArtworkDataUri(999999);
        expect(result).toBe(FALLBACK_ARTWORK_DATA_URI);
    });

    it('falls back when the fetch throws (network error / timeout)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
        const result = await fetchArtworkDataUri(149);
        expect(result).toBe(FALLBACK_ARTWORK_DATA_URI);
    });

    it('falls back on an empty (zero-byte) response body', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new ArrayBuffer(0), { status: 200 })));
        const result = await fetchArtworkDataUri(149);
        expect(result).toBe(FALLBACK_ARTWORK_DATA_URI);
    });

    it('the fallback is a local data URI, never a raw.githubusercontent.com URL', () => {
        expect(FALLBACK_ARTWORK_DATA_URI.startsWith('data:image/png;base64,')).toBe(true);
        expect(FALLBACK_ARTWORK_DATA_URI).not.toContain('raw.githubusercontent.com');
    });
});
