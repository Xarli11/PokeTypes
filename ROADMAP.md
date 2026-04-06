# PokeTypes Roadmap 🚀

This document outlines the planned features, improvements, and future vision for the PokeTypes application.

## 📋 Upcoming Features

### 1. 🛡️ Terastallization (Gen 9) 💎 (Priority)
Add a "Tera Type" toggle to Pokemon profiles. Dynamically update the defensive analysis and apply a "crystal/diamond" visual effect to the UI.

### 2. 📊 Team Radar Chart 📈 (UI/Visual)
Implement a high-tech hexagonal radar chart in the Team Builder to visualize balance (Phys. Offense, Spec. Offense, Speed, Bulk, Coverage).

### 3. 📸 Infographic Generator 📸
Generate a high-quality, shareable image of the current type analysis or team composition with elegant branding.

### 4. ✨ Dynamic Glow Effects ✨ (Aesthetics)
Add element-specific neon/glow shadows to type pills and cards (especially in Dark Mode) for a more futurist, high-end feel.

### 5. Move Effectiveness Calculator ⚔️
Input a specific move (e.g., Earthquake) and see how it performs against different type combinations.

### 3. PokeAnalyzer (Pokemon Details) 🔍
Expand the application from a type calculator to a quick-reference tool for competitive and casual play.

*   **Phase 3: Learnsets (Long-term)**
    *   Display moves learned by leveling up, TMs, and Egg moves.
    *   *Note: This requires significant data optimization.*

### 4. Team Coverage Tool 🛡️
Analyze a full team of up to 6 Pokemon to identify shared weaknesses and type coverage gaps.

### 5. Format & Generation Selection 🎮
Allow users to select a specific format (e.g., Gen 9 OU, National Dex) to filter Pokémon suggestions and adhere to specific banlists/mechanics.

## 🛠️ Technical Improvements

*   **Data Optimization:** Split `pokedex.json` into smaller chunks or use a more efficient compression if it grows significantly with stats/moves.
*   **Advanced Caching:** Improve Service Worker logic to handle larger assets (images) more efficiently.
*   **Localization:** Support for Spanish, Japanese, and other languages for Pokemon names and UI elements.

---
*Last updated: February 11, 2026*

## ✅ Recently Completed

*   **Share Button (v2.17.2):** Added native Web Share API integration for one-click analysis sharing on mobile and desktop.
*   **UI Consistency (v2.17.1):** Standardized multipliers to decimals (x0.5, x0.25) and unified badge styling across Defense and Offense cards.
*   **Dual Resistances Fix (v2.17.0):** Correctly distinguished between 0.5x (Resist) and 0.25x (Double Resist) damage modifiers in the UI.
*   **Tactical Advisor (v2.16.0):** Heuristic-based engine that suggests team partners to cover weaknesses, filtering by competitive stats (BST).
*   **Deep Linking & Shareable URLs (v2.13.0):** Automatic sync of application state with URL query parameters for easy sharing and persistence.
*   **Ability Effectiveness (v2.12.0):** Logic to detect and alert when abilities like Levitate or Thick Fat alter type effectiveness.
*   **PokeAnalyzer Phase 1 & 2 (v2.11.0):** Added Base Stats visualization (colored bars) and Abilities with descriptions.
*   **Dark Mode (v2.9.0):** Full theme support with system detection and manual toggle.
*   **Neutral Damage Analysis (v2.8.0):** Integrated 1x effectiveness in both defense and offense cards.
*   **SEO & Canonical Fixes (v2.7.2):** Resolved indexing issues and unified URL structures.
