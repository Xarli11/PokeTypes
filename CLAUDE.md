# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Astro dev server (localhost:4321)
npm run build      # Build for production (Cloudflare output)
npm run preview    # Preview production build locally
npm run release X.Y.Z  # Bump version across files and create git tag
```

Utility scripts (run with `node scripts/<name>`):
- `sync-pokedex.cjs` — Fetch latest Pokémon data from Smogon/Showdown into `src/data/pokedex.json`
- `sync-abilities.js` — Sync ability i18n data
- `verify-types.js` — Validate `src/data/type-data.json` against Smogon's type chart

No automated test suite exists. After changes, provide manual test cases with expected outcomes.

## Architecture

**Stack**: Astro 5 (SSR, server output) + Tailwind CSS 4 + vanilla JS ES modules, deployed to Cloudflare Workers via `@astrojs/cloudflare`.

### Data flow

1. On load, `src/js/main.js` calls `loadAppData()` from `data.js`, which fetches `/api/app-data.json` (types, contrast map, searchIndex, abilityMap, imageFixes, items).
2. The full pokedex (`/api/pokedex.json`) is fetched lazily in the background to keep initial load fast.
3. Both API routes are Astro endpoints in `src/pages/api/` that import from `src/data/*.json` at build time.
4. User interactions trigger `displayAnalysis()` in `main.js`, which calls `calculator.js` for effectiveness math, `advisor.js` for tactical suggestions, and `ui.js` for DOM rendering.

### Module responsibilities

| Module | Purpose |
|--------|---------|
| `main.js` | App entry point; event listeners, URL state sync, orchestration |
| `modules/calculator.js` | `calculateDefense`, `calculateOffense`, `findImmuneDualTypes` — pure math |
| `modules/data.js` | API fetching with in-memory caching; PokéAPI proxy calls for stats/abilities |
| `modules/ui.js` | All DOM rendering (cards, pills, hero, stats, suggestions) |
| `modules/i18n.js` | ES/EN translations via `src/js/lang/messages.js`; `localStorage` persistence |
| `modules/advisor.js` | Tactical advice generation given weaknesses and Pokémon roster |
| `modules/pro.js` | "Team Builder" pro mode toggle and view |
| `modules/simulator.js` | Battle simulation logic |
| `modules/team.js` | Team composition management |
| `modules/theme.js` | Dark/light mode with `localStorage` and system preference detection |

### URL routing

- `/` — Home (type selector)
- `/tipo/<type1>[-type2][-type3]` — Pre-selected type combination
- `/pokemon/<name-slug>` — Pre-selected Pokémon (e.g. `/pokemon/charizard`)
- State is synced via `window.history.pushState` without full navigation

### Data files (`src/data/`)

- `type-data.json` — `types[]`, `effectiveness{}`, `contrast{}` (text contrast per type)
- `pokedex.json` — Full Pokémon list with types, IDs, apiName, forms
- `search-index.json` — Lighter list used for initial search before full pokedex loads
- `abilities-i18n.json` — Ability name translations
- `image-fixes.json` — Overrides for broken Pokémon sprite URLs
- `items.json` — Item data for Team Builder

## Conventions

- **Styling**: Tailwind utility classes in `.astro` files; avoid custom CSS unless strictly necessary.
- **Translations**: All user-facing strings go through `i18n.t('key')`. Add new keys to both `en` and `es` in `src/js/lang/messages.js`. HTML elements use `data-i18n="key"` and are updated by `i18n.updateDOM()`.
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
3. Run `npm run release X.Y.Z` (updates `package.json`, commits, tags)
4. Merge to `main` and back to `develop` with `--no-ff`
5. `git push origin main develop --tags`
6. `gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."`

Do not delete feature or release branches after merging.

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
