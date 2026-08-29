// Bump this — and the src/pages/og/v1 -> v2 directory rename to match —
// whenever a card *template* changes (layout, colors, fonts). The route
// itself is what's versioned, not a query param: valid cards are served
// with a year-long immutable cache (see cache.ts), and a URL is the only
// cache key Cloudflare/browsers/social crawlers have. Without a version
// segment, a redesign would be invisible to anyone who already has the
// old pixels cached until that cache expires. A ?v=1 query string would
// achieve the same thing but reads as "arbitrary param" at a glance next
// to the slug-only route design this feature deliberately keeps (see
// docs/open-graph.md "Security") — a path segment stays consistent with
// that and needs no query-string parsing.
export const OG_VERSION = 'v1';

export function ogDefaultPath(): string {
    return `/og/${OG_VERSION}/default.png`;
}

export function ogTypePath(slug: string): string {
    return `/og/${OG_VERSION}/type/${slug}.png`;
}

export function ogPokemonPath(slug: string): string {
    return `/og/${OG_VERSION}/pokemon/${slug}.png`;
}
