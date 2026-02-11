# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
