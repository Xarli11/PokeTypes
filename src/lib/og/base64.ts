// `Buffer` needs Cloudflare Workers' `nodejs_compat` flag, which this repo
// doesn't declare (no wrangler.toml — see docs/open-graph.md). `btoa` +
// `Uint8Array` are standard in both Node and workerd, so base64-encoding
// this way works without depending on a compat flag being set. Chunked to
// avoid a call-stack overflow from `String.fromCharCode(...bigArray)` on
// large artwork buffers.
const CHUNK_SIZE = 8192;

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
    }
    return btoa(binary);
}

export function toDataUri(buffer: ArrayBuffer, mimeType: string): string {
    return `data:${mimeType};base64,${arrayBufferToBase64(buffer)}`;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}
