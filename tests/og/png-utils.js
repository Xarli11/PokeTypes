// Minimal PNG IHDR reader — enough to assert width/height/signature
// without pulling in an image-decoding dependency just for tests.
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function isPng(bytes) {
    if (bytes.length < 8) return false;
    return PNG_SIGNATURE.every((byte, i) => bytes[i] === byte);
}

export function pngDimensions(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
        width: view.getUint32(16, false),
        height: view.getUint32(20, false),
    };
}
