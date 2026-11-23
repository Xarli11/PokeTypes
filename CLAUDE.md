# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Astro dev server (localhost:4321)
npm run build        # Production build (Cloudflare output in dist/)
npm test             # Vitest, single run (CI runs this)
npm run test:watch   # Vitest watch mode
npm run check        # astro check (TypeScript diagnostics; CI runs this)
```

CI (`.github/workflows/ci.yml`, Node 22) runs `npm run check`, `npm test`, `npm run build` on push/PR to `main` and `develop`.

- `npm run preview` does **not** work: `@astrojs/cloudflare` doesn't support Astro's preview command. To serve a production build locally: `npm run build && npx wrangler pages dev dist --port 4399 --compatibility-date=2025-01-01 --compatibility-flag=nodejs_compat`.
- `npm run release X.Y.Z` points at `scripts/release.cjs`, which **does not exist** in the repo. Bump `package.json`, `public/sw.js` `CACHE_NAME` and `CHANGELOG.md` by hand (see Release process).

Utility scripts (run with `node scripts/<name>`):
- `sync-pokedex.cjs` — fetch Pokémon data from Smogon/Showdown into `src/data/pokedex.json`, `search-index.json`, `items.json`
- `sync-abilities.js` — sync ability i18n data
- `audit-ability-descriptions.mjs` — abilities with no Spanish description (PokéAPI text or manual `<name>_desc`); `--pilot` limits it to the pilot Pokémon (network)
- `verify-types.js` — validate `src/data/type-data.json` against Smogon's type chart (no npm alias)
- `audit-images.js` — check sprite URLs / `image-fixes.json`
- `ssr-snapshot.mjs` — `capture <baseUrl> <dir>` / `diff <dirA> <dirB>`: compare (file sets in both directions + bytes; optional `--ignore-asset-hashes`, `--ignore-asset-names`, `--collapse-whitespace`) the server-rendered HTML of every sitemap URL between two builds (use it to prove a refactor changed nothing)

## Tests

Vitest suite in `tests/` (29 files, ~882 tests, Node environment — no DOM, no browser). Pure logic is tested directly; DOM-heavy modules only through their pure helpers.

- `tests/type-engine/*` — effectiveness, modifiers (abilities/items), battle context, Ring Target, triple type, team analysis, SSR/client parity.
- `tests/seo.test.js` — sitemap, robots.txt, `seo.js` helpers, SSR stats/abilities HTML.
- `tests/a11y-seo-regression.test.js` — WCAG contrast of type pills/status colours (computed from `global.css` + `type-data.json`), `<main>` landmark per page, heading levels, 24 px touch target, no `og-image.png` references, one canonical `/tipo/` URL per type combination.
- `tests/type-render.test.js` — SSR markup is byte-equivalent (SHA-256 golden in `tests/fixtures/`) to the helpers that used to be inlined in the pages, for every single/dual type and 4 triples.
- `tests/i18n-server.test.js`, `tests/i18n-routes.test.js` — SSR translations (frozen English literals, key coverage, no hard-coded English) and the slug/path model (golden slug table, exhaustive round-trip, permutations, aliases, redirects, English URLs unchanged).
- `tests/app-state.test.js` — URL/state model and wiring of back/forward. Browser behaviour: `scripts/manual/history-check.mjs` (22 checks; needs `npm i --no-save puppeteer-core` and a local `wrangler pages dev`).
- `tests/i18n-pilot.test.js` — pilot list, publication switch (default OFF), hreflang reciprocity/existence, `urlForState` over every type combination and Pokémon slug, server-side type/ability translation.
- `tests/es-routes.test.js` — the `/es` decision table (switch off and on), selector, notice, sitemap, wiring. Browser check of the pilot: `scripts/manual/es-pilot-check.mjs` (28 checks; needs a local build with the switch on — never commit that).
- `tests/share-team.test.js`, `tests/team-clear.test.js`, `tests/ui/*` — share links, team state, i18n keys, selectors, analytics, form-page details.

`localStorage` is not defined in Node: modules that import `i18n.js` need a stub before import (see `tests/ui/type-selector.test.js`). There are no e2e, accessibility or performance automated tests; Lighthouse/axe checks are run manually. After changes, still provide manual test cases with expected outcomes.

## Architecture

**Stack**: Astro 5 (SSR, `output: 'server'`) + Tailwind CSS 4 + vanilla JS ES modules, deployed to Cloudflare Pages/Workers via `@astrojs/cloudflare`. Runtime dependencies are minimal (astro, adapter, sitemap, tailwind).

### Rendering model

- `/tipo/*` and `/pokemon/*` are **server-rendered**: thin routes (`src/pages/tipo/[...slug].astro`, `src/pages/pokemon/[name].astro`, `src/pages/index.astro`) resolve the request (redirects, 404) and render `src/components/pages/{TypePage,PokemonPage,HomePage}.astro`, which take a `lang` prop: title, meta, canonical, JSON-LD, defense/offense groups and (for Pokémon) base stats and ability names are in the HTML. `/` is a mostly client-rendered shell.
- The same `src/js/main.js` then hydrates every page: selectors, search, URL state, Team Builder, language toggle. With the Spanish pilot switched off (`ES_PILOT_ENABLED = false`, the default) language is **client-side only** (`localStorage`) and SSR HTML is always English; `/es/*` is a 404. With it on, the URL decides the language (`/es/...` Spanish, everything else English) and the 8 pilot pages get hreflang; analyses outside the pilot navigate to their English URL.
- `/tipo/<slug>` has **one URL per combination**: `canonicalTypeSlug()` (`src/lib/seo.js`) orders types as in the type chart and de-duplicates; any other spelling 301-redirects. Unknown slugs → 404 (`Astro.rewrite('/404')`).

### Data flow

1. On load, `main.js` calls `loadAppData()` (`modules/data.js`) → `/api/app-data.json` (types, contrast map, searchIndex, abilityMap, imageFixes, items).
2. Full pokedex (`/api/pokedex.json`) loads lazily in the background. Both endpoints are Astro routes in `src/pages/api/` importing `src/data/*.json`; `robots.txt` allows exactly these two under `/api/`.
3. Stats/ability descriptions come from PokéAPI / Showdown at runtime (`data.js`); stats and ability names are already in the SSR HTML for `/pokemon/*`.
4. User actions → `displayAnalysis()` in `main.js` → type engine → `ui.js` rendering.

### Type engine (`src/lib/type-engine/`) — single source of truth

Pure, no DOM; used by SSR pages, client and tests. See `docs/type-engine.md`.
`effectiveness.js` (defense/offense maps, `calculateDefense`, `calculateOffense`, `findImmuneDualTypes`), `modifiers.js` (ability/item modifiers, battle context, Ring Target), `result.js` (multiplier buckets), `team.js` (`analyzeTeamDefense`, `getThreatAlerts`, `getPokemonDefenseBreakdown`), `index.js` (re-exports). Gen 9 chart only.

### Other shared code

| Path | Purpose |
|---|---|
| `src/lib/i18n-server.js` | `createT(lang)` → `{ t, h, tType, tAbility }` for SSR: same dictionary as the browser (`messages.js`); `ssr_<key>` overrides `<key>` for server HTML only; falls back to English. Pages/components take a `lang` prop (always `'en'` today) |
| `src/lib/i18n-routes.js` | Language-aware URLs: type slug maps (`typeSlug`, `toTypeSlug`, `fromTypeSlug`, `resolveTypeRoute` → canonical slug + redirect flag), `/es` prefix helpers (`stripLangPrefix`, `withLangPrefix`, `pathForLang`), `statePath` (URL shown by the app), `detectLang`. Spanish slugs derive from `messages.es` (accent-free). No `/es/` routes exist yet |
| `src/lib/i18n-pilot.js` | The Spanish pilot: `PILOT_EN_PATHS` (single list → Spanish paths derived), `ES_PILOT_ENABLED` (**false**: publication switch), `ES_DRAFT_KEYS` (Spanish strings pending human review; must be empty to enable), `alternatesFor` (hreflang, only between existing pages), `equivalentPath`, `urlForState` (never a `/es` URL that does not exist). Provisional Pokémon until Search Console data |
| `src/lib/es-routes.js` | Decision table for `/es`, `/es/tipo/*`, `/es/pokemon/*`: 200 / 301 / 404 (+ English equivalent for the 404 page). Only pilot pages exist; nothing redirects to a 404. `src/pages/es/**` apply it |
| `src/lib/lang-switch.js`, `src/lib/lang-notice.js` | Language selector markup (server and browser share it: link to the existing equivalent page, or a disabled button saying there is none) and the dismissible notice for visitors who want Spanish. Only active when `ES_PILOT_ENABLED` |
| `src/lib/app-state.js` | URL ↔ app state: `parseAppLocation` (types, Pokémon, mode, lang), `buildAppUrl`, `withMode`. Team Builder URL is `/?mode=pro`. `main.js` pushes entries with `pushState` (never the URL already shown) and restores on `popstate` |
| `src/lib/type-render.js` | Pure SSR HTML for defense/offense groups and type pills (shared by `/tipo/*` and `/pokemon/*`; `t` label provider defaults to English) |
| `src/lib/seo.js` | `pokemonSlug`, `normalizePathname`, `parseTypeSlug`, `canonicalTypeSlug`, SSR stats/abilities HTML |
| `src/lib/share-team.js` | Team Builder share-link encode/decode (`?team=…&mode=pro`, versioned payload) |
| `src/layouts/Layout.astro` | `<head>`: canonical (`canonicalPath` prop), OG/Twitter, GA4, AdSense, base JSON-LD |
| `src/components/` | `AppHeader` (header, lang/theme/mode buttons), `TypeSelectorField`, `ControlPanel` (search + type selectors + reset), `ShareButton`, `TypeLinks` (crawlable links to the 18 type pages) |
| `src/pages/sitemap.xml.ts` | Sitemap: home, 18 types, 20 dual types (canonical order), every distinct `/pokemon/` slug; no `lastmod` |

### Client modules (`src/js/modules/`)

| Module | Purpose |
|---|---|
| `main.js` (in `src/js/`) | Entry point; events, URL state (`history.pushState`), orchestration |
| `data.js` | API fetching + caching; PokéAPI/Showdown calls |
| `ui.js` | All DOM rendering (pills, groups, hero, stats, competitive panel, advisor) |
| `i18n.js` + `lang/messages.js` | EN/ES strings, `localStorage` (`poketypes_lang`), `data-i18n` + `updateDOM()` |
| `pro.js`, `team.js`, `analysis.js` | Team Builder view, team state (`localStorage` `poketypes_team`), role analysis |
| `simulator.js` | Ability Interaction Checker |
| `advisor.js` | Tactical suggestions for weaknesses |
| `typeSelector.js`, `typeSelection.js` | Type picker (bottom sheet on mobile) and selection normalization |
| `pokemonDetails.js` | Form-page helpers: slug lookup, SSR-ownership guard, latest-response gate |
| `a11y.js` | Focus trap and ref-counted scroll lock for overlays |
| `analytics.js` | `trackEvent` wrapper over GA4 (see `docs/analytics-events.md`) |
| `theme.js` | Dark/light via `localStorage` + system preference |

### URL routing

- `/` — Home · `/tipo/<t1>[-t2][-t3]` — type combination (canonical order) · `/pokemon/<slug>` — Pokémon or form (e.g. `charizard-mega-x`)
- `?mode=pro&team=<base64>` — Team Builder share link (no dedicated route)
- State syncs with `history.pushState` without full navigation.

### Data files

- `src/data/` (the ones the app imports): `type-data.json` (`types[]`, `effectiveness{}`, `contrast{}` = text colour per type chosen for WCAG contrast), `pokedex.json` (1.3k entries; ~1,276 distinct slugs), `search-index.json`, `abilities-i18n.json`, `image-fixes.json`, `items.json`.
- `public/data/*.json` are stale, unused copies — don't edit them.

## Conventions

- **Styling**: Tailwind utility classes in `.astro` files; avoid custom CSS unless strictly necessary.
- **Translations**: All user-facing strings go through `i18n.t('key')` in the browser and `createT(lang)` (`src/lib/i18n-server.js`) in `.astro` files/SSR helpers — never hard-code English in a template (`tests/i18n-server.test.js` fails if known literals reappear or a used key is missing in a language). Add new keys to both `en` and `es` in `src/js/lang/messages.js`. HTML elements use `data-i18n="key"` and are updated by `i18n.updateDOM()`.
- **Accessibility**: type pill text colour comes from `contrast` in `type-data.json`; if you change a type colour in `global.css` or a status colour token, `tests/a11y-seo-regression.test.js` enforces WCAG AA (4.5:1). Keep one `<main>` per page and don't skip heading levels.
- **Type names**: Always capitalized (`Fire`, not `fire`) when stored; use `ui.capitalizeWords()` for display, `type.toLowerCase()` for lookups.
- **Offense calc**: Uses `Math.max` across types (best move wins), not multiplication.
- **Defense calc**: Uses multiplication across types (both types must resist).

## Git Workflow

Gitflow + Conventional Commits:

- **Branches**: `main` (production) → `develop` (integration) → `feature/*`, `fix/*`, `hotfix/*`
- **Feature work**: branch from `develop`, merge back with `--no-ff` and an explicit commit message
- **Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` prefixes

**Release process** (only when explicitly requested by user):
1. Create `release/vX.Y.Z` from `develop`
2. Update `CHANGELOG.md`
3. Bump version in `package.json` and `public/sw.js` by hand (`npm run release` is broken, see Commands), commit, tag `vX.Y.Z`
4. Merge to `main` and back to `develop` with `--no-ff`
5. `git push origin main develop --tags`
6. `gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."`

Do not delete feature or release branches after merging.

**Service worker cache version**: `public/sw.js`'s `CACHE_NAME` (e.g. `poketypes-v2.39.2`) is a plain string manually kept in sync with `package.json`'s version — nothing bumps it automatically. Update it as part of every release; if it's left stale, `activate`'s cleanup won't drop the previous deploy's cache (harmless — old entries just linger until the version finally changes — but stale cached responses can persist longer than intended for offline users).

## Protocols

### Ponytail — minimal code

Before writing any code, walk this ladder and stop at the first rung that holds:

1. Does this need to exist? → no: skip it (YAGNI)
2. Already in this codebase? → reuse it, don't rewrite
3. Stdlib / browser does it? → use it
4. Installed dependency does it? → use it
5. One line? → one line
6. Only then: the minimum that works

Read the code the change touches and trace the real flow *before* picking a rung — lazy about the solution, never about reading. Never cut input validation, data-loss handling, security, or accessibility.

### Caveman — minimal output

Reply in compressed prose: drop filler, use fragments, cut preamble. Keep full technical accuracy. Code, paths, and error strings stay exact. Respect the user's language (Spanish stays Spanish).

- No "Sure! I'd be happy to…", no trailing summaries, no restating the question.
- One sentence update &gt; one paragraph explanation.
- Levels (if needed): `lite` (drop filler only) · `full` (default, fragments) · `ultra` (telegraphic).
