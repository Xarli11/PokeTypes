# PokeTypes Roadmap 🚀

This document outlines the planned features, improvements, and future vision for the PokeTypes application.

## 📋 Upcoming Features

### 1. PokeAnalyzer (Pokemon Details) 🔍
Expand the application from a type calculator to a quick-reference tool for competitive and casual play.

*   **Phase 1: Base Stats & Abilities**
    *   Show HP, Attack, Defense, Sp. Atk, Sp. Def, and Speed.
    *   List available abilities (including Hidden Abilities).
    *   Implementation: Modal or expandable section when a Pokemon is selected.
*   **Phase 2: Visual Enhancements**
    *   Add stat bars (colored based on value).
    *   High-quality official artwork from PokeAPI.
*   **Phase 3: Learnsets (Long-term)**
    *   Display moves learned by leveling up, TMs, and Egg moves.
    *   *Note: This requires significant data optimization.*

### 2. Team Coverage Tool 🛡️
Analyze a full team of up to 6 Pokemon to identify shared weaknesses and type coverage gaps.

### 3. Move Effectiveness Calculator ⚔️
Input a specific move and see how it performs against different type combinations.

## 🛠️ Technical Improvements

*   **Data Optimization:** Split `pokedex.json` into smaller chunks or use a more efficient compression if it grows significantly with stats/moves.
*   **Advanced Caching:** Improve Service Worker logic to handle larger assets (images) more efficiently.
*   **Localization:** Support for Spanish, Japanese, and other languages for Pokemon names and UI elements.

---
*Last updated: January 21, 2026*
