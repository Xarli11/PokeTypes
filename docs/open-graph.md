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
| `/og/v1/default.png` | Home / fallback |
| `/og/v1/type/<slug>.png` | 1–3 types, e.g. `fire`, `dragon-flying` |
| `/og/v1/pokemon/<slug>.png` | One Pokémon/form |

### Versioning

The route carries a version segment (`v1`, from `src/lib/og/version.ts`'s
`OG_VERSION`) instead of a query param like `?v=1`. Valid cards get a
year-long **immutable** `Cache-Control` (see "Cache" below) — that's only
safe because the URL itself changes when a template does. Bump
`OG_VERSION` to `v2` and move `src/pages/og/v1/` to `src/pages/og/v2/`
whenever a card's layout, colors, or fonts change; old `v1` URLs keep
serving the old (still-cached, still-correct-for-what-they-are) pixels
forever, and every page's `og:image` picks up `v2` on its next deploy
because they're all built through `ogDefaultPath()`/`ogTypePath()`/
`ogPokemonPath()`, never a hand-written string. `tests/og/routes.test.js`
asserts these helpers match the actual routed file paths, so a version
bump that forgets to move the directory (or vice versa) fails the suite
instead of silently 404ing in production.

A query param (`?v=1`) would achieve the same cache-busting, but reads as
"arbitrary parameter" right next to a route design that otherwise
deliberately accepts no query strings at all (see "Security" below) — a
path segment stays consistent with that without needing any query-string
parsing in the endpoint.

### Security

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

**Licenses:** all three families ship under the SIL Open Font License 1.1.
The license text is copied verbatim next to each family's `.ttf` in
`src/lib/og/fonts/` (`Syne-OFL.txt`, `Outfit-OFL.txt`,
`JetBrainsMono-OFL.txt`) rather than only in a repo-root `LICENSE` — the
OFL's redistribution terms are per-font-file, so the license travels with
the specific binaries it covers. See `src/lib/og/fonts/SOURCE.md`
"Licensing" for why subsetting/re-instancing these weights is allowed
under OFL-1.1.

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

`Cache-Control: public, max-age=86400, s-maxage=31536000, immutable` on
every successful card (see `src/lib/og/cache.ts`). `immutable` is only
correct because the route is versioned (see "Versioning" above) — the
same `/og/v1/...` URL is guaranteed to keep meaning the same template
forever, so browsers and Cloudflare's edge never need to revalidate it.
Cloudflare honors `Cache-Control` on Worker/Pages Function responses the
same way it does static assets — no separate Cache API call needed.

This does not freeze rare within-version changes — a pokedex data
correction, or PokeAPI re-uploading a Pokémon's official artwork under the
same filename — those need a one-off Cloudflare cache purge for the
affected URL(s), same as any other long-cached asset. 404 fallbacks use a
short 5-minute cache instead, so a newly-added Pokémon or type combo isn't
stuck behind a stale 404.

## Cloudflare compatibility / nodejs_compat

The Cloudflare Workers runtime (`workerd`) has no native-binding support
and no Node built-ins unless the `nodejs_compat` compatibility flag is on.
This repo has no `wrangler.toml`/`wrangler.jsonc` — production is a
Git-integrated Cloudflare Pages project, and `nodejs_compat` is set in its
dashboard (Settings → Functions → Compatibility flags), invisible to the
repo. That's real configuration drift, investigated (not assumed) for
this hardening round:

**Do `@cf-wasm/satori`/`@cf-wasm/resvg` need it?** No — verified two ways:

1. Their `workerd` entrypoints (`node_modules/@cf-wasm/{satori,resvg}/dist/{workerd,satori,resvg}.js`)
   contain zero references to any `node:`-prefixed or bare Node built-in
   module (checked directly, not inferred).
2. An isolated Worker — just these two packages, no Astro, no Sharp, no
   `wrangler.toml` `compatibility_flags` at all — compiled and served a
   real PNG under `wrangler dev` with **no `nodejs_compat` flag set**.

**Tested without `nodejs_compat`:** `npm run build && npx wrangler pages
dev dist` (no flag) fails to even start — but the failure is `Could not
resolve "child_process"`/`"fs"` from `node_modules/detect-libc`, a
transitive dependency of **Sharp**, which `@astrojs/cloudflare` pulls in
for its built-in image service (`astro:assets`) regardless of whether
this app uses it. This is pre-existing and unrelated to the OG feature —
confirmed by the isolated-worker test above.

**Tested with `nodejs_compat`:** `npm run build && npx wrangler pages dev
dist --compatibility-flags=nodejs_compat` (now also `npm run cf:preview`)
builds and serves everything, OG routes included, correctly.

**Why no wrangler config was added:** Cloudflare's own docs are explicit
that once a `wrangler.toml`/`wrangler.jsonc` with `pages_build_output_dir`
exists, it becomes "the source of truth" for a Pages project and the
dashboard fields it covers become read-only — and that deploying one
built from guessed/local values "is very likely to be non-production."
The documented safe path is `wrangler pages download config
<PROJECT_NAME>` to pull the *actual* current dashboard config first, which
needs Cloudflare account access this session doesn't have. Adding a
config file blind — exactly what was asked not to do — risks silently
overriding whatever else is set on the dashboard (e.g. the `SESSION` KV
binding `@astrojs/cloudflare` already logs at build time) with an
incomplete guess.

**What's here instead, so this isn't a hidden dependency:**

- This section, naming exactly what needs `nodejs_compat` (Sharp/
  `astro:assets`, not this feature) and why it isn't declared in-repo.
- `npm run cf:preview` (`package.json`) — `astro build` +
  `wrangler pages dev dist --compatibility-flags=nodejs_compat` as a
  named, discoverable command instead of a one-off flag someone has to
  already know to type.
- `wrangler` as a `devDependency`, so `cf:preview` doesn't silently
  `npx`-download a different version per contributor.
- **Action for whoever has Cloudflare dashboard access:** run `wrangler
  pages download config <project>` once to turn this into an explicit,
  version-controlled config — at that point `immutable`/anything else
  currently invisible to the repo becomes auditable too.

## Metadata integration

`src/layouts/Layout.astro` takes `image`, `imageAlt`, `imageType` (default
`image/png`), `imageWidth`/`imageHeight` (default `1200`/`630`) and emits
`og:image`, `og:image:secure_url`, `og:image:type`, `og:image:width/height`,
`og:image:alt`, and `twitter:image:alt` — never guessing at dimensions.
Default `image` is `/og/v1/default.png` (previously `/og-image.png`, a
file that never existed in `public/` — confirmed 404 in production before
this change).

No `twitter:site`: `@poketypesapp` returned 404 on Twitter's public,
unauthenticated oEmbed endpoint during this sprint's audit (a known real
account returned 200 for comparison), meaning it isn't a verified/owned
handle. Removed rather than publishing an unverifiable claim; add it back
once a real, owned handle exists. The rest of the Twitter Card tags
(`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`,
`twitter:image:alt`) are unaffected — `twitter:card=summary_large_image`
doesn't require `twitter:site` to render correctly on any platform that
supports it.

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
- Manual: `npm run dev`, then `curl -s -o out.png localhost:4321/og/v1/pokemon/dragonite.png`
  and inspect with `sips -g pixelWidth -g pixelHeight out.png`.
- Closest-to-production: `npm run cf:preview` (builds, then serves via
  `wrangler pages dev` with `nodejs_compat` on — see "Cloudflare
  compatibility" above), then hit the same routes on `localhost:8788` —
  this runs the actual `workerd` runtime.

## Forms (Mega, Gmax, Alolan, Hisuian, Galarian, Paldean, ...)

Audited, not fixed in this round — the artwork gap below is a real,
scoped follow-up, not a hidden one.

**What happens today, for every form:** name, dex number, and types are
always correct (they come straight from `pokedex.json`, same as the real
page) — but the artwork is always the **base species'** artwork, never a
form-specific one. Confirmed by rendering `og/v1/pokemon/charizard-mega-x.png`
and `og/v1/pokemon/pikachu-gmax.png`: both show the ordinary
Charizard/Pikachu artwork, not Mega Charizard X's recolor or Gmax
Pikachu's giant art. Category **A** (correct text/types, base artwork) —
never B (form-specific artwork) or C (pokeball fallback, which only fires
on an actual fetch failure, unrelated to form-ness) — for every one of
these forms today.

**Root cause:** `pokedex.json`'s `id` field is the *National Dex number*
for every entry, identical across all forms of a species (Mega Charizard
X, Charizard-Gmax, and base Charizard are all `id: 6`). `src/lib/og/artwork.ts`
fetches `.../official-artwork/${id}.png`, which is always the base
species' file.

**The fix already exists as data, just not wired into the OG renderer:**
`src/data/image-fixes.json` (255 entries, already used by the client-side
`getPokemonImageUrl()` in `src/js/modules/ui.js`) maps 194 form `apiName`s
to their real PokeAPI numeric artwork IDs (e.g. `charizard-mega-x` →
`10034`, `pikachu-gmax` → `10199`) — IDs that *do* have distinct official
artwork. The remaining 61 entries are `type: "slug"` fixes that
intentionally redirect a form with no real distinct art (e.g. hypothetical
Tauros/Eevee variants this app models) to a sensible base slug.

**Why not wired in now:** doing so correctly means porting
`getPokemonImageUrl()`'s 3-tier priority (fix → id → slug) into
`artwork.ts` and re-verifying the artwork-fetch-fallback path (timeout/
404/network-error) against it — a contained change, but a second review
pass in its own right, and this round's brief was explicit that form
artwork selection didn't need solving now. Left as a well-defined next
step: read `image-fixes.json` in `artwork.ts`, resolve
`fix.type === 'id' ? fix.value : pokemon.id` before building the artwork
URL, add a couple of `tests/og/artwork.test.js` cases pinning a known fix
(`charizard-mega-x` → `10034`) and a known non-fix (`charizard` → `6`).
