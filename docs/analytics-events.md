# Analytics Events

PokeTypes loads GA4 (`gtag.js`, measurement ID `G-9D59NL7KTH`) in `Layout.astro`
and, until Sprint 4, only ever called `gtag('config', ...)` — no product usage
was measured beyond GA4's automatic pageview/Enhanced Measurement events.

All custom events now go through a single wrapper, `trackEvent(name, params)`
in `src/js/modules/analytics.js`. It never throws, no-ops silently if `gtag`
isn't available (dev, tests, ad-blockers), and adds no dependency. See that
file's header comment for the full design rationale.

**Privacy:** no parameter ever carries a user ID, free-text search query, or
any other PII. Every parameter is a bounded enum (a mode, a source, a share
method, a language code) or a Pokémon/type name already public in the site's
own URL structure.

**`language`** is always `'en'` or `'es'` as a parameter, never a suffix on
the event name (i.e. never `pokemon_select_es`) — the language is a
dimension of every event, not a different event.

**De-duplication** is each call site's responsibility, not `trackEvent()`'s —
see each event's "Trigger" column below for exactly when (and when *not*) it
fires.

## Events

| Event | Trigger | Parameters | Meaning |
|---|---|---|---|
| `pokemon_search` | Calculator search input, debounced 600ms after the user stops typing (fires once per pause, not per keystroke) — only when the query is non-empty. | `has_results: boolean`, `language` | A user typed something meaningful into the Calculator's Pokémon search. Doesn't imply they picked a result — see `pokemon_select` for that. |
| `pokemon_select` | A Pokémon is actually chosen: clicking (or Enter-selecting) a Calculator search suggestion, or a Simulator (Ability Interaction Checker) defender suggestion. **Not** fired for Team Builder adds (see `team_member_add`, which is the more specific event for that action) or for state restored from a shared URL on page load (not a live user action). | `pokemon` (name), `source: 'search' \| 'simulator'`, `mode: 'calculator' \| 'team_builder'`, `language` | The user settled on a specific Pokémon somewhere other than the Team Builder. |
| `type_calculate` | `displayAnalysis(t1, t2, t3)` runs with at least one real type selected, and the exact combination differs from the last one tracked. Fires **after** `normalizeTypeSelection()` (`typeSelection.js`) collapses duplicate selections (e.g. Fire+Fire, or Fire+Water+Fire) into the monotype/dual-type actually analyzed — the event always describes the real matchup, never a raw pre-normalization selection. Re-renders of the *same* (already-normalized) combo (e.g. a language toggle re-running `displayAnalysis` with unchanged types) do **not** refire it. | `type_1`, `type_2`, `type_3` (each a type name or `null`), `type_count` (1–3), `language` | A genuinely new type matchup was analyzed — single, dual, or triple. |
| `mode_change` | The user clicks the Calculator↔Team Builder toggle **and** it actually changes the active mode. The initial-load restore from `localStorage` (`poketypes_mode`) is deliberately excluded — that's state restoration, not a change. | `from_mode`, `to_mode` (`'simple' \| 'pro'`), `language` | A real, user-initiated switch between the two top-level views. |
| `team_member_add` | A Pokémon is picked from the Team Builder's search-modal results and actually lands in a slot. | `pokemon` (name), `slot` (0–5), `team_size` (count of filled slots *after* the add), `language` | Team roster growth — lets you see typical team-building depth (do people usually stop at 1–2, or fill all 6?). |
| `share` | Fires only when the share action actually completes — `navigator.share()` resolving (not when the user cancels the native share sheet) or a clipboard-copy actually succeeding — never on button render or click alone. | `context: 'analysis' \| 'team'`, `share_method: 'native' \| 'clipboard'`, `language` | `analysis` = the Calculator/Pokémon/type-page share button; `team` = the Team Builder's "Share Team" button. Unified into one event with a `context` parameter rather than two separate `team_share`/`analysis_share` events — same underlying action (encode current state into a URL and hand it off), differing only in which state, which is exactly what a parameter is for. |

## Not implemented (documented, not built)

Deliberately out of scope for this taxonomy (kept short on purpose — see the
Sprint 4 brief for why):

- Per-keystroke search tracking (contaminates data, no signal beyond what
  the debounced `pokemon_search` already gives).
- Team member *removal* or ability/item/nature *configuration* — no event
  requested for these; add them the same way (a `trackEvent()` call at the
  point the action actually completes) if a future need is confirmed by data,
  not by assumption.
- Simulator "attack type selected" / ability-interaction-result events —
  `pokemon_select` already captures the meaningful "which Pokémon are you
  testing" moment there; the rest is exploration within that, not a new
  top-level action.

## How to add a new event later

1. Confirm the trigger is a real, discrete user action — not a re-render, not
   a page-load restore, not a keystroke.
2. Pick parameters that are bounded enums or already-public identifiers —
   never free text, never anything personal.
3. Call `trackEvent('event_name', { ... })` at the exact point the action
   completes (not when a button is merely rendered or clicked-and-then-
   possibly-cancelled).
4. Add a row to the table above and, if the trigger has any subtlety (dedup,
   exclusions), say so explicitly — that's the part that goes stale silently
   otherwise.
