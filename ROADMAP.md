# PokeTypes Roadmap 🚀

This document outlines the planned features, improvements, and future vision for the PokeTypes application.

## 📋 Upcoming Features

### 1. Deep Linking & Shareable URLs 🔗 (Priority)
Allow users to share specific analyses and maintain state on refresh.
*   **Functionality:** Sync selected types or Pokemon with the URL query parameters (e.g., `?t1=fire&t2=flying` or `?pokemon=gengar`).
*   **User Benefit:** Easy sharing via Discord/WhatsApp and persistent state when reloading.

### 2. PokeAnalyzer (Pokemon Details) 🔍
Expand the application from a type calculator to a quick-reference tool for competitive and casual play.

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
*Last updated: January 29, 2026*

## ✅ Recently Completed

*   **Dual Resistances Fix (v2.17.0):** Correctly distinguished between 0.5x (Resist) and 0.25x (Double Resist) damage modifiers in the UI.
*   **Tactical Advisor (v2.16.0):** Heuristic-based engine that suggests team partners to cover weaknesses, filtering by competitive stats (BST).
*   **Deep Linking & Shareable URLs (v2.13.0):** Automatic sync of application state with URL query parameters for easy sharing and persistence.
*   **Ability Effectiveness (v2.12.0):** Logic to detect and alert when abilities like Levitate or Thick Fat alter type effectiveness.
*   **PokeAnalyzer Phase 1 & 2 (v2.11.0):** Added Base Stats visualization (colored bars) and Abilities with descriptions.
*   **Dark Mode (v2.9.0):** Full theme support with system detection and manual toggle.
*   **Neutral Damage Analysis (v2.8.0):** Integrated 1x effectiveness in both defense and offense cards.
*   **SEO & Canonical Fixes (v2.7.2):** Resolved indexing issues and unified URL structures.
