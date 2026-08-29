// The route itself is versioned (/og/v1/... — see version.ts), not just
// long-cached: a template change bumps OG_VERSION and gets a brand new
// URL, so a year-long *immutable* cache on the old URL is safe — nobody
// who already has v1 cached needs to see a v2 redesign at that same URL,
// because a redesign is never served from that URL again. Cloudflare's
// edge honors Cache-Control on Worker/Pages Function responses the same
// way it does for static assets (no separate Cache API call needed).
//
// This does NOT freeze pokedex data corrections or a re-uploaded PokeAPI
// artwork within v1 — those are rare enough to handle with a one-off
// Cloudflare cache purge, same as before versioning. See
// docs/open-graph.md "Cache strategy".
export const OG_CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000, immutable';
