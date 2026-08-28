// src/lib/share-team.js
//
// Pure encode/decode for the Team Builder's shareable team links (the
// `?team=...` query param). No DOM, no localStorage, no team.js state —
// safe to unit test directly. src/js/modules/pro.js wraps this with the
// browser-specific bits (reading window.location, applying the decoded
// team via team.js setters, clipboard).
//
// Tera policy (Sprint 1 — type-engine-correctness): Team Builder tracks a
// `teraType` per slot internally (team.js defaults it to the Pokemon's
// primary type), but there is no UI to set it to anything else and no
// analysis consumes it. Rather than share a field that always equals the
// primary type and can never be restored to a meaningfully different
// value, it is deliberately left out of this payload. Wiring it into a
// real "defensive typing after Terastallization" feature is Sprint 2 scope.

export const SHARE_PAYLOAD_VERSION = 1;

/**
 * @param {Array<object|null>} team - team.js team array (fixed length 6)
 * @returns {string} base64-encoded JSON payload safe to put in a URL query param
 */
export function encodeTeamPayload(team) {
    const compact = team.map(slot => {
        if (!slot) return null;
        return {
            id: slot.id,
            n: slot.apiName || slot.name,
            t: slot.types,
            a: slot.ability || null,
            nat: slot.nature || null,
            i: slot.item || null
        };
    });
    return btoa(unescape(encodeURIComponent(JSON.stringify({ v: SHARE_PAYLOAD_VERSION, team: compact }))));
}

/**
 * Decodes and validates a share payload. Never throws — returns null for
 * anything malformed, unparseable, or from an unsupported future version,
 * so a broken or tampered link can never break the app.
 * @param {string} encoded
 * @returns {Array<object|null>|null}
 */
export function decodeTeamPayload(encoded) {
    let payload;
    try {
        payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    } catch {
        return null;
    }

    // Backward compatible with pre-versioning links, which encoded a bare array.
    const isLegacy = Array.isArray(payload);
    const version = isLegacy ? 0 : Number(payload?.v ?? 0);
    const compact = isLegacy ? payload : payload?.team;

    if (!Number.isFinite(version) || version > SHARE_PAYLOAD_VERSION) return null;
    if (!Array.isArray(compact) || compact.length !== 6) return null;
    if (!compact.every(slot => slot === null || (typeof slot === 'object'))) return null;

    return compact;
}
