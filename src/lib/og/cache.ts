// Card content only changes when this route's code/data is redeployed —
// the same slug always produces the same pixels in between. Cloudflare's
// edge honors Cache-Control on Worker/Pages Function responses the same
// way it does for static assets (no separate Cache API call needed), so a
// long s-maxage keeps repeat social-crawler and browser hits off the
// renderer entirely. See docs/open-graph.md "Cache strategy" for the
// tradeoff this implies (a redesign needs a Cloudflare cache purge to
// reach already-cached URLs sooner than a year).
export const OG_CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400';
