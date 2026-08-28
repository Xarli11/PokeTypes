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
| `effectiveness.js` | `getEffectiveness`, `computeDefenseMap`, `computeDefenseMapIgnoringTypeImmunities`, `calculateDefense`, `calculateOffense`, `findImmuneDualTypes` | Pure type-vs-type math. No abilities/items. |
| `modifiers.js` | `ABILITY_EFFECTIVENESS`, `ITEM_EFFECTIVENESS`, `getAbilityModifiers`, `getItemModifiers`, `getImmuneTypesFromModifiers`, `applyDefensiveModifiers` | Ability/item data + how it layers onto a defense map. |
| `result.js` | `MULTIPLIER_CATEGORIES`, `categorizeMultiplier`, `classifyMultiplier` | Centralizes multiplier buckets so no `=== 0.5` literals are scattered around. |
| `team.js` | `analyzeTeamDefense`, `getThreatAlerts`, `getPokemonDefenseBreakdown` | Team Builder's per-type weak/resist/immune tallies, and a raw-vs-effective breakdown for a single Pokemon. |
| `index.js` | re-exports everything above | Single import path for consumers. |

## Input model

- **Defending combination**: 1–3 type names (`type1`, `type2 \| null`, `type3 \| null`), e.g. `('Fire', 'Flying', null)`. The 3rd type simulates client-side effects like Forest's Curse / Trick-or-Treat — there is one code path for 1/2/3 types, not a separate "triple type" implementation.
- **Attacker roster**: `allTypes` — the 18 canonical Gen 9 types, from `src/data/type-data.json`.
- **Effectiveness table**: `effectiveness` — `{ [attackingType]: { [defendingType]: multiplier } }`, also from `type-data.json`. Verified against Smogon's reference chart by `scripts/verify-types.js` (`npm run` has no shortcut for it yet — run `node scripts/verify-types.js`).
- **Modifiers**: an array of `{ type, modifier, superEffectiveOnly?, blockNonSE?, removesTypeImmunity?, forceValue?, requiresContext?, contextValue?, description }`, from `getAbilityModifiers(name)` / `getItemModifiers(name)`, combined with `[...abilityMods, ...itemMods]`.
- **Context** *(optional)*: `{ fullHp?: boolean, contact?: boolean }` passed as `options.context` to `applyDefensiveModifiers`. Gates the handful of modifiers that depend on battle state PokeTypes doesn't track by default — see "Battle context" below.
- **Ignoring-type-immunity map** *(optional)*: `options.ignoringTypeImmunityMap`, the result of `computeDefenseMapIgnoringTypeImmunities` for the same defending combination. Required for Ring Target (`removesTypeImmunity`) to have any effect — see "Ring Target" below.

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

## Modifiers — four explicit kinds

1. **Immunity** — `modifier === 0`, no other flags. Always wins, overriding any other value, applied in its own stage before anything else (see `applyDefensiveModifiers`'s "stage 1" internally).
2. **Multiplier** — a plain number (`0.5`, `1.25`, `1.5`, `2`, ...), applied by direct multiplication.
3. **Conditional effect** — flagged explicitly, never guessed from the number:
   - `superEffectiveOnly: true` (Filter, Solid Rock, Prism Armor) — only scales a hit that is *already* ≥ 2× (super effective); neutral/resisted/immune hits are untouched.
   - `blockNonSE: true` (Wonder Guard) — zeroes anything that is *not* already ≥ 2×; super-effective hits pass through unchanged. **Not** a blanket immunity to all 18 types — see `getImmuneTypesFromModifiers` below.
   - `removesTypeImmunity: true` (Ring Target) — see "Ring Target" below.
4. **Battle-context-gated** — `requiresContext: 'fullHp' | 'contact'` + `contextValue: boolean`. Only applied when the caller's `options.context[requiresContext] === contextValue` *exactly*; an absent context key never matches `true` or `false`. `forceValue: true` additionally means "set the multiplier to exactly `modifier`" instead of multiplying by it (needed for Tera Shell — see below).

`type: 'Offensive'` entries (Transistor, Adaptability, Tinted Lens,
Galvanize, ...) describe a boost to the ability holder's own STAB, not
damage taken. `applyDefensiveModifiers` never matches them against a real
defending type, so they are always a no-op there by construction — they
exist purely for the descriptive text shown in `ui.js`
(`renderAbilityAlerts`) and `simulator.js`.

## Ring Target: type immunity vs ability/item immunity

Ring Target (`removesTypeImmunity: true`) negates immunities that come
from **typing** (Ghost immune to Normal, Ground immune to Electric, Flying
immune to Ground, ...). It must never undo an immunity granted by an
**ability or another item** (Levitate, Volt Absorb, Flash Fire, Air
Balloon, ...) — those are separate mechanics that stay in effect
regardless.

`applyDefensiveModifiers` handles this with two tracked stages before the
general one: stage 1 applies every unconditional ability/item immunity and
records which types it touched; stage 2 then lets Ring Target restore a
type *only if* it was immune purely by typing (`defenseMap[type] === 0` in
the original, pre-modifier map) *and* stage 1 didn't also zero it out.

Restoring a negated immunity isn't just "set it to 1x" — a dual/triple-type
defender's *other* type(s) might independently be weak or resistant to the
same attacker, and negating only the immune half must reveal that.
`computeDefenseMapIgnoringTypeImmunities` (effectiveness.js) computes this
correctly per type-component: e.g. Ground/Flying is immune to Electric only
via its Ground half, but Flying alone is actually 2× weak to Electric —
Ring Target reveals that 2×, not a flat neutral. This map must be passed in
as `options.ignoringTypeImmunityMap`; without it, `removesTypeImmunity`
entries are a documented no-op rather than a guess.

## Battle context

A handful of real abilities only apply under a condition PokeTypes has no
general way to track: current HP (Multiscale, Shadow Shield, Tera Shell)
or whether the incoming move makes contact (Fluffy). Rather than silently
assume the condition holds — or doesn't — those entries are gated behind
`requiresContext` + `contextValue`, checked against an optional
`options.context` object (e.g. `{ fullHp: true }`) passed to
`applyDefensiveModifiers`. The default everywhere in this codebase
(`analyzeTeamDefense`, the Ability Interaction Checker) is an empty
context, so these effects stay informational-only until a real HP/contact
input exists — this is *why* `analyzeTeamDefense`'s weak/resist/immune
counts never assume "full HP".

- **Multiscale / Shadow Shield** (`requiresContext: 'fullHp'`): halve
  damage, only when `fullHp: true` is confirmed.
- **Tera Shell** (`requiresContext: 'fullHp'`, `forceValue: true`): at
  full HP, forces any connecting hit to *exactly* 0.5× — it is not a flat
  ×0.5 multiply (a 4× hit would otherwise incorrectly stay super effective
  at 2×). A natural immunity (0×) is left at 0×.
- **Fluffy**: modeled as two entries. The Fire ×2 has no
  `requiresContext` — it only depends on the attacking type, which is
  always known, so it stays unconditional. The all-types ×0.5 contact
  reduction requires `contact: true` to be confirmed; when it is, both
  entries apply together (a confirmed-contact Fire hit nets out to ×1 —
  the two effects cancel).

## Known assumptions / unsupported mechanics

- **Neutralizing Gas** (suppresses every other ability) and **Delta
  Stream** (removes a Flying-type's own weaknesses while its weather is
  active) need cross-ability/weather state PokeTypes doesn't track at all
  (not even as an opt-in context flag, unlike full HP/contact above). Both
  are listed with a no-op modifier (`1`) rather than simulated.
- **Transistor** is 1.3× in Gen 9 (was hardcoded at the Gen 8 value, 1.5×
  — see `tests/type-engine/transistor.test.js` for the regression test).

## getImmuneTypesFromModifiers — unconditional immunities only

Used by `advisor.js` to filter out types a Pokemon is truly always immune
to before picking its biggest threat. Only counts `modifier === 0` entries
with **none** of the conditional flags (`blockNonSE`, `superEffectiveOnly`,
`requiresContext`) — it used to check `modifier === 0` alone, which misread
Wonder Guard (`blockNonSE: true`) as an immunity to all 18 types. Wonder
Guard blocks non-super-effective hits only; its actual weaknesses still
connect normally.

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
ability + item modifiers via `applyDefensiveModifiers` (with an empty
`context`, and `computeDefenseMapIgnoringTypeImmunities` wired in for Ring
Target), then classifies each resulting multiplier with
`classifyMultiplier` to tally weak/resist/immune counts per type — the
same modifier engine the single-Pokemon Ability Interaction Checker
(`simulator.js`) uses, so a given ability behaves identically in both
places. Output shape is unchanged from before this sprint (`{ matrix,
teamSize }`) so `pro.js`'s rendering didn't need to change.

## Team result semantics

`matrix[type].weak` / `.resist` / `.immune` (and the `pokemonWeak` /
`pokemonResist` / `pokemonImmune` name lists) represent the **effective**
matchup derived from exactly:

> typing + the member's selected ability + the member's selected item

and **nothing else** — no unconfirmed battle condition (full HP, a move
making contact, weather, ...) is ever assumed. A team with a Multiscale
Dragonite still counts it as weak to Ice; a Tera Shell Pokemon's matchups
aren't flattened to Not Very Effective by default. This is what makes the
counts stable for Sprint 2's UI (e.g. "Ice: 3 weak / 1 resist / 0 immune")
— they don't silently change based on an assumption the engine made.

## Raw vs effective

`getPokemonDefenseBreakdown(pokemon, allTypes, effectiveness, context?)`
(in `team.js`) returns `{ raw, effective }` for a single Pokemon:

- `raw` — `computeDefenseMap` for its typing alone, no modifiers.
- `effective` — `raw` with its ability/item modifiers applied (via the
  same `applyDefensiveModifiers` call `analyzeTeamDefense` makes
  internally, with whatever `context` is passed through).

`analyzeTeamDefense` uses only `effective` for its tallies, but keeping
`raw` available separately (rather than discarding it) is what lets a
future UI show *why* a number changed — e.g. "Rock 2×, reduced by Solid
Rock → effective 1.5×" — instead of only ever showing the post-modifier
result with no way to recover the original type matchup.

## SSR / client parity

`src/pages/tipo/[...slug].astro` and `src/js/main.js` both call
`calculateDefense` / `calculateOffense` from this module directly — there
is exactly one implementation, not two kept in sync by hand. The SSR page
also now parses all three optional slug segments (`/tipo/t1-t2-t3`),
matching what the client's URL router already supported.
