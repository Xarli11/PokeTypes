# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.24.1] - 2026-02-19

### Fixed
- **Visuals:** Corrected sprite handling for alternate forms (e.g., Arceus-Bug, Silvally-Type, Rotom-Appliance). They now display their specific form artwork instead of the base form, while still fetching data correctly.

## [2.24.0] - 2026-02-19

### Changed
- **Data:** Refined Pokémon forms logic to remove redundant entries (e.g., cosmetic Pikachu caps, Vivillon patterns, Alcremie sweets).
- **Data:** Consolidated Pumpkaboo and Gourgeist sizes into a single average form to declutter the list.
- **Data:** Kept all competitive forms that affect stats or types (G-Max, Totem, Deoxys, Kyurem, etc.).
- **Data:** Fixed "Mega Magearna" error in the database.

## [2.23.2] - 2026-02-14

### Fixed
- **i18n:** Implemented dynamic parameter replacement in the translation engine, fixing the Tactical Advisor showing raw templates like `{type}`.

## [2.23.1] - 2026-02-14

### Fixed
- **i18n:** Translated "Ability Interaction Checker" and related labels in the Simulator module.

## [2.23.0] - 2026-02-14

### Added
- **Pro Mode:** Introduced a new "Pro" view with a full 6-slot Team Builder.
- **Team Analysis:** Added comprehensive defensive coverage analysis, role breakdown (Sweeper, Wall, etc.), and threat alerts for the team.
- **Search:** Dedicated team builder search with instant results.

### Improved
- **Tactical Advisor:** Overhauled recommendation logic to account for Abilities (e.g., Levitate users are no longer flagged as weak to Ground).
- **Tactical Advisor:** Implemented "Uber Tier" filtering. God-tier Pokémon (Arceus, Rayquaza, etc.) are only suggested if the user is analyzing another Uber.
- **Scoring:** Adjusted the algorithm to heavily prioritize Immunities (x0) and 4x Resistances over raw Base Stats.

### Fixed
- **Advisor:** "Mega Rayquaza" and Primal forms no longer appear in standard recommendations due to improved exclusion filters.

## [2.22.8] - 2026-02-12

### Fixed
- **Data:** Refactored `scripts/sync-pokedex.js` to correctly map Showdown names to PokeAPI endpoints (e.g. `arceus-bug` -> `arceus`, `venusaur-gmax` support).
- **Data:** Updated `data/pokedex.json` with correct `apiName` fields, resolving 98+ API 404 errors.

## [2.22.7] - 2026-02-11

### Fixed
- **UI:** Enforced `whitespace-nowrap` on stat labels to definitively prevent line breaks on narrower screens.

## [2.22.6] - 2026-02-11

### Fixed
- **UI:** Increased the width of stat labels to ensure "Def. Esp" and other longer abbreviations display on a single line without wrapping.

## [2.22.5] - 2026-02-11

### Improved
- **UI:** Updated stat labels to be more professional and clear (e.g., "Sp. Atk" instead of "SpA", "Def. Esp" instead of "DefEsp").
- **UI:** Adjusted layout to accommodate longer stat names without truncation.

## [2.22.4] - 2026-02-11

### Fixed
- **Data Integrity:** Corrected the API mapping for **Maushold** (both family of 3 and 4). Stats and abilities should now load correctly for these Pokémon.

## [2.22.3] - 2026-02-11

### Improved
- **Tactical Advisor - Smart Scoring:** Completely overhauled the recommendation algorithm.
    - **Stat Weighting:** Stronger Pokémon (Higher Base Stats) are now prioritized within their tiers.
    - **Synergy Check:** Penalizes candidates that share weaknesses with the active Pokémon (e.g., won't suggest a Fire type if you are already weak to Water).
    - **Quality of Life:** Excluded battle-only forms (Zen Mode, Schooling, etc.) from being suggested as standalone teammates.

## [2.22.2] - 2026-02-11

### Improved
- **Tactical Advisor - Tiering:** Suggestions now respect the power level of the analyzed Pokémon.
    - **High Tier (>570 BST):** Suggests Legendaries, Paradox, and Pseudo-Legendaries.
    - **Mid Tier (420-570 BST):** Suggests fully evolved standard Pokémon.
    - **Low Tier (<420 BST):** Suggests Little Cup or NFE Pokémon.
- **Tactical Advisor - Coverage:** Recommended teammates are now scored based on how many *additional* weaknesses they resist, not just the primary threat.

## [2.22.1] - 2026-02-11

### Fixed
- **Localization:** Fixed an issue where ability names, descriptions, and stat labels would not update when switching languages.
- **Localization:** Added missing Spanish translations for "Hidden Ability" and stat abbreviations (PS, Atq, etc.).
- **User Experience:** The application now automatically refreshes the current Pokémon's details when the language is toggled.

## [2.22.0] - 2026-02-11

### Added
- **Performance - Smart Caching:** Implemented in-memory caching for Pokémon details and abilities.
    - Subsequent visits to the same Pokémon are now instant.
    - Global caching of ability data reduces redundant API calls (e.g., Starters sharing Overgrow/Blaze/Torrent).

## [2.21.2] - 2026-02-11

### Fixed
- **Wishiwashi & Palafin:** Corrected PokeAPI mappings (`wishiwashi-solo`, `palafin-zero`) to prevent detail loading failures.
- **Resilience:** Improved error handling in the details section. If the API fails, the Hero card (Image, Types, Name) remains visible instead of hiding the entire section.

### Added
- **Localization:** Added `stats_unavailable` translation key for English and Spanish.

## [2.21.1] - 2026-02-11

### Improved
- **Tactical Advisor:** Refined suggestion logic to verify that recommended Pokémon *actually* resist the threat, accounting for their dual typing (e.g., no longer suggests Galarian Moltres vs Fighting).

### Fixed
- **Image Handling:** Implemented a robust fallback system for Pokémon sprites: Showdown (Animated) -> PokemonDB (HQ Static) -> PokeAPI (Reliable) -> Local Placeholder (Pokeball).

### Added
- **Roadmap:** Added "Format & Generation Selection" to upcoming features.

## [2.21.0] - 2026-01-29
*Initial versions and previous features documented in ROADMAP.md.*