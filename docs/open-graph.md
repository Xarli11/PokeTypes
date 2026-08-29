# Open Graph / social cards

PokeTypes generates real 1200×630 PNG social preview images at request time,
server-side, on Cloudflare Workers. No PNGs are committed or built ahead of
time.

## Architecture

**satori → SVG → resvg → PNG**, both WASM-only (no native bindings), via
[`@cf-wasm/satori`](https://github.com/fineshopdesign/cf-wasm) and
[`@cf-wasm/resvg`](https://github.com/fineshopdesign/cf-wasm). These wrap
[satori](https://github.com/vercel/satori) (HTML/CSS-like tree → SVG) and
[resvg](https://github.com/RazrFalcon/resvg) (SVG → PNG) with conditional
package exports keyed on runtime (`workerd` for Cloudflare, `node` for
`astro dev`/tests) — the same import (`@cf-wasm/satori`, `@cf-wasm/resvg`)
resolves correctly in both without any manual WASM instantiation.

**Why not Sharp / build-time PNGs:**

- **Sharp** needs native bindings; Cloudflare Workers has no such runtime
  (confirmed by `wrangler pages dev --compatibility-flags=nodejs_compat`
  against this repo's own build: `detect-libc`, one of Sharp's transitive
  deps, pulls in `fs`/`child_process`, which don't exist in Workers even
  with `nodejs_compat`). This is also the adapter's own build-time warning
  ("Cloudflare does not support sharp at runtime"), pre-existing in this
  repo for `astro:assets` and unrelated to this feature.
- **~1,300 pre-generated PNGs at build time** would mean committing/
  deploying hundreds of MB of binaries, a much slower build, and manual
  regeneration on every pokedex/sprite change. A cacheable dynamic route
  scales to new Pokémon and type combinations with zero extra work.

**Validated, not assumed:** `npm run build` + `npx wrangler pages dev dist
--compatibility-flags=nodejs_compat` (the closest local equivalent to the
real Cloudflare Workers runtime) serves all three OG routes with identical
output to `astro dev` — confirms the `workerd` codepath actually works,
not just the Node one.

## Routes

| Route | Card |
|---|---|
| `/og/default.png` | Home / fallback |
| `/og/type/<slug>.png` | 1–3 types, e.g. `fire`, `dragon-flying` |
| `/og/pokemon/<slug>.png` | One Pokémon/form |

`<slug>` is only ever resolved against the app's own data
(`src/lib/og/resolve.ts` — the same `pokedex.json`/`type-data.json`
matching the real `/tipo/*` and `/pokemon/*` pages use), never interpreted
as a template, file path, or arbitrary URL. No endpoint accepts query
params. A slug that doesn't resolve gets **404** with the home card's PNG
as the body — never a broken image, and never a second, looser matching
path than the real pages use.

## Templates

`src/lib/og/cards/{home,type,pokemon}.ts` build a plain-object satori tree
(no JSX/React) from `src/lib/og/cards/chrome.ts`'s shared pieces (wordmark,
type pills, multiplier badges). Colors come from `src/lib/og/colors.ts`,
which mirrors `.bg-type-*` in `src/styles/global.css` — satori needs
literal inline colors, so this intentionally duplicates that palette;
keep them in sync if a type color ever changes.

Dark battle-tool identity always, no light/dark switching (crawlers have no
theme preference). Type card font size steps down for 3-type slugs.
Pokémon card name font size steps down by name length, and the name span
uses `width` (not `maxWidth`) + `wordBreak: 'break-word'` — a flex item's
default min-width is its content's intrinsic width, so `maxWidth` alone
does not stop an unbroken word (e.g. "DRAGONITE") from overflowing past
the artwork panel. No per-Pokémon hardcoded exceptions.

## Fonts

Syne (display), Outfit (UI), JetBrains Mono (multiplier badges) — static
weight instances, Latin-subset, ~230KB total, embedded as base64 string
constants at build time (`src/lib/og/fonts/data.generated.ts`, from
`src/lib/og/fonts/*.ttf`). No runtime font fetch: one less thing that can
fail or add latency per social-crawler hit. Regenerate via
`node scripts/generate-og-assets.mjs` after changing a font file — see
`src/lib/og/fonts/SOURCE.md` for where the `.ttf` sources come from and how
they were subsetted.

*(A direct `import font from './x.ttf?arraybuffer'` was tried first — this
project's Vite version only ships `?raw`/`?url`, not `?arraybuffer`, and
`?raw` corrupts binary data through UTF-8 decoding. The generated-base64
approach sidesteps the asset pipeline entirely.)*

## Artwork

Pokémon artwork is fetched from `raw.githubusercontent.com` (PokeAPI
sprites) at render time — the one external dependency in the whole system
— with a 3s timeout and try/catch (`src/lib/og/artwork.ts`). Any failure
(timeout, non-200, empty body, network error) falls back to the local
PokeTypes pokeball mark (`src/lib/og/pokeball.generated.ts`, generated from
a 512px downscale of `public/pokeball.png`), which has zero network
dependency of its own. A card can never fail to render because of the
artwork fetch.

The raw artwork URL is never published as `og:image` — it's square-ish
(~475×475), not 1200×630, and on a host this app doesn't control uptime
for. It's the *input* to the card's artwork panel, not the final image.

## Cache

`Cache-Control: public, max-age=86400, s-maxage=31536000,
stale-while-revalidate=86400` on every successful card (see
`src/lib/og/cache.ts`). Cloudflare's edge honors `Cache-Control` on Worker/
Pages Function responses the same way it does static assets — no separate
Cache API call needed. The same slug always produces the same pixels
between deploys, so a long `s-maxage` keeps repeat hits off the renderer
entirely.

**Known constraint:** because there's no content hash in the URL, a future
redesign of a card template won't reach already-cached URLs until the
`s-maxage` expires (up to a year) unless someone purges the Cloudflare
cache for `/og/*` after that deploy. 404 fallbacks use a short 5-minute
cache instead, so a newly-added Pokémon or type combo isn't stuck behind a
stale 404.

## Metadata integration

`src/layouts/Layout.astro` takes `image`, `imageAlt`, `imageType` (default
`image/png`), `imageWidth`/`imageHeight` (default `1200`/`630`) and emits
`og:image`, `og:image:secure_url`, `og:image:type`, `og:image:width/height`,
`og:image:alt`, and `twitter:image:alt` — never guessing at dimensions.
Default `image` is `/og/default.png` (previously `/og-image.png`, a file
that never existed in `public/` — confirmed 404 in production before this
change).

`/`, `/tipo/*`, `/pokemon/*` each pass their own `image`/`imageAlt` built
from the resolved slug — all SSR, so social crawlers (which don't run JS)
see the real values in the initial HTML.

## How to test

- `npm test` — `tests/og/*.test.js`: slug resolution, direct card
  rendering (PNG signature + exact 1200×630 via the IHDR chunk, no
  snapshot/image-diffing dependency), the artwork fallback (mocked
  `fetch`), the actual endpoint `GET` handlers (status codes, headers,
  valid/invalid/long slugs), and a source guard against re-introducing
  `/og-image.png` or a raw artwork URL as `og:image`.
- Manual: `npm run dev`, then `curl -s -o out.png localhost:4321/og/pokemon/dragonite.png`
  and inspect with `sips -g pixelWidth -g pixelHeight out.png`.
- Closest-to-production: `npm run build && npx wrangler pages dev dist
  --compatibility-flags=nodejs_compat`, then hit the same routes on
  `localhost:8788` — this runs the actual `workerd` runtime.

## Known constraints

- `twitter:site="@poketypesapp"` (pre-existing, not added by this sprint)
  could not be verified as belonging to this project — the public,
  unauthenticated Twitter oEmbed endpoint returns 404 for that handle.
  Left in place pending an explicit decision from the account owner (see
  sprint report).
- No wrangler.toml/wrangler.jsonc in this repo — Cloudflare Pages project
  settings (dashboard) are the only place `nodejs_compat` and the
  compatibility date are configured. Local validation had to pass
  `--compatibility-flags=nodejs_compat` explicitly to match.
- Pokémon card artwork is the *base species* sprite (by Pokédex number) —
  a specific form/costume may show its base form's art if PokeAPI has no
  distinct official-artwork asset for that form ID. Same behavior the old
  direct-artwork `og:image` already had.
