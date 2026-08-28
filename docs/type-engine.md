# Type Engine

Shared, pure Gen 9 type-effectiveness engine at `src/lib/type-engine/`.
Single source of truth for SSR (`src/pages/tipo/[...slug].astro`), the
browser client (`src/js/main.js` and friends), and the test suite
(`tests/type-engine/*.test.js`). No DOM access, no globals, no mutation of
inputs — every exported function is pure.

Related: `src/lib/share-team.js` (Team Builder share-link encode/decode,
tested in `tests/share-team.test.js`).

## Modules

| File | Exports | Purpose |
|---|---|---|
| `effectiveness.js` | `getEffectiveness`, `computeDefenseMap`, `calculateDefense`, `calculateOffense`, `findImmuneDualTypes` | Pure type-vs-type math. No abilities/items. |
| `modifiers.js` | `ABILITY_EFFECTIVENESS`, `ITEM_EFFECTIVENESS`, `getAbilityModifiers`, `getItemModifiers`, `getImmuneTypesFromModifiers`, `applyDefensiveModifiers` | Ability/item data + how it layers onto a defense map. |
| `result.js` | `MULTIPLIER_CATEGORIES`, `categorizeMultiplier`, `classifyMultiplier` | Centralizes multiplier buckets so no `=== 0.5` literals are scattered around. |
| `team.js` | `analyzeTeamDefense`, `getThreatAlerts` | Team Builder's per-type weak/resist/immune tallies. |
| `index.js` | re-exports everything above | Single import path for consumers. |

## Input model

- **Defending combination**: 1–3 type names (`type1`, `type2 \| null`, `type3 \| null`), e.g. `('Fire', 'Flying', null)`. The 3rd type simulates client-side effects like Forest's Curse / Trick-or-Treat — there is one code path for 1/2/3 types, not a separate "triple type" implementation.
- **Attacker roster**: `allTypes` — the 18 canonical Gen 9 types, from `src/data/type-data.json`.
- **Effectiveness table**: `effectiveness` — `{ [attackingType]: { [defendingType]: multiplier } }`, also from `type-data.json`. Verified against Smogon's reference chart by `scripts/verify-types.js` (`npm run` has no shortcut for it yet — run `node scripts/verify-types.js`).
- **Modifiers**: an array of `{ type, modifier, superEffectiveOnly?, blockNonSE?, description }`, from `getAbilityModifiers(name)` / `getItemModifiers(name)`, combined with `[...abilityMods, ...itemMods]`.

## Output model

`computeDefenseMap(type1, type2, allTypes, effectiveness, type3)` returns the
rawest shape: `{ [attackingType]: multiplier }` — a plain number per
attacking type, before any ability/item modifier. This is what
`applyDefensiveModifiers` operates on.

`calculateDefense(...)` (no modifiers) buckets that map into the shape the
UI renders directly:

```js
{
  weaknesses8x: string[], weaknesses4x: string[], weaknesses2x: string[],
  neutral: string[],
  resistances05x: string[], resistances025x: string[], resistances0125x: string[],
  immunities: string[]
}
```

`calculateOffense(...)` groups by the attacker's best available STAB
(`Math.max` across up to 3 own types, not a product):
`{ superEffective2x, neutral, notVeryEffective, noEffect }`.

Once modifiers are involved (Team Builder, Ability Interaction Checker),
exact values can fall off the standard ladder (e.g. Filter's `0.75×`
reduction of a 4× hit gives `3`). `classifyMultiplier` is used there
instead of `categorizeMultiplier` — it only checks the value's relationship
to 1 (`weak` / `neutral` / `resist` / `immune`), which is all
`analyzeTeamDefense`'s tallies need.

## Modifiers — three explicit kinds

1. **Immunity** — `modifier === 0`. Always wins, overriding any other value.
2. **Multiplier** — a plain number (`0.5`, `1.25`, `1.5`, `2`, ...), applied by direct multiplication.
3. **Conditional effect** — flagged explicitly, never guessed from the number:
   - `superEffectiveOnly: true` (Filter, Solid Rock, Prism Armor) — only scales a hit that is *already* ≥ 2× (super effective); neutral/resisted/immune hits are untouched.
   - `blockNonSE: true` (Wonder Guard) — zeroes anything that is *not* already ≥ 2×; super-effective hits pass through unchanged.

`type: 'Offensive'` entries (Transistor, Adaptability, Tinted Lens,
Galvanize, ...) describe a boost to the ability holder's own STAB, not
damage taken. `applyDefensiveModifiers` never matches them against a real
defending type, so they are always a no-op there by construction — they
exist purely for the descriptive text shown in `ui.js`
(`renderAbilityAlerts`) and `simulator.js`.

## Known assumptions / unsupported mechanics

- **Multiscale, Shadow Shield, Tera Shell** are "only at full HP" in the
  games. PokeTypes has no battle-state/HP concept, so wherever they're
  used they apply unconditionally (best-case, full-HP scenario).
- **Neutralizing Gas** (suppresses every other ability) and **Delta
  Stream** (removes a Flying-type's own weaknesses while its weather is
  active) need cross-ability/weather state PokeTypes doesn't track. Both
  are listed with a no-op modifier (`1`) rather than simulated.
- **Transistor** is 1.3× in Gen 9 (was hardcoded at the Gen 8 value, 1.5×
  — see `tests/type-engine/transistor.test.js` for the regression test).

## Tera policy (this sprint)

Team Builder slots track a `teraType` field internally (`src/js/modules/team.js`,
defaults to the Pokemon's primary type), but:

- there is no UI control to set it to anything else, and
- no analysis (`analyzeTeamDefense`, simulator) consumes it.

Rather than build out "defensive typing after Terastallization" without a
spec, or half-wire a field that always equals the primary type, Tera is
**deliberately excluded** from the share-link payload
(`src/lib/share-team.js`) this sprint — an absent feature instead of one
that silently produces misleading data. Wiring up a real Tera type
selector and having `analyzeTeamDefense` use it is Sprint 2 scope.

## Team Builder integration

`analyzeTeamDefense(team, allTypes, effectiveness)` (in `team.js`) computes
each active member's `computeDefenseMap`, applies that member's combined
ability + item modifiers via `applyDefensiveModifiers`, then classifies
each resulting multiplier with `classifyMultiplier` to tally
weak/resist/immune counts per type — the same modifier engine the
single-Pokemon Ability Interaction Checker (`simulator.js`) uses, so a
given ability behaves identically in both places. Output shape is
unchanged from before this sprint (`{ matrix, teamSize }`) so `pro.js`'s
rendering didn't need to change.

## SSR / client parity

`src/pages/tipo/[...slug].astro` and `src/js/main.js` both call
`calculateDefense` / `calculateOffense` from this module directly — there
is exactly one implementation, not two kept in sync by hand. The SSR page
also now parses all three optional slug segments (`/tipo/t1-t2-t3`),
matching what the client's URL router already supported.
