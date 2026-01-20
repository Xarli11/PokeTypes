# PokeTypes

**PokeTypes** is a modern, interactive web application designed for Pokémon trainers to quickly analyze type effectiveness. It serves as a comprehensive calculator and chart for understanding weaknesses, resistances, and immunities, supporting data up to the 9th Generation (Scarlet & Violet).

## Project Overview

The project is a client-side web application built with vanilla JavaScript and Tailwind CSS. It is designed to be lightweight, fast, and installable as a Progressive Web App (PWA).

### Key Features

*   **Type Calculator:** Analyze single and dual-type Pokémon defense and offense.
*   **Pokémon Search:** Search for Pokémon by name, including Mega Evolutions and regional forms.
*   **Interactive Chart:** A visual grid showing type interactions.
*   **PWA Support:** Installable on mobile and desktop with offline capabilities.
*   **Responsive Design:** Optimized for all screen sizes using Tailwind CSS.

### Tech Stack

*   **Frontend:** HTML5, CSS3 (Tailwind CSS), JavaScript (ES Modules).
*   **Styling:** Tailwind CSS (configured in `tailwind.config.js`).
*   **Data:** JSON files (`data/pokedex.json`, `data/type-data.json`) storing Pokémon and type information.
*   **Build Tooling:** npm scripts for CSS compilation and local development.

## Building and Running

The project uses `npm` for dependency management and scripts.

### Prerequisites

*   Node.js and npm installed.

### Installation

```bash
npm install
```

### Development Commands

*   **Start Development Server:**
    Runs a live-reload server and watches for CSS changes.
    ```bash
    npm run dev
    ```

*   **Build CSS:**
    Compiles and minifies Tailwind CSS for production.
    ```bash
    npm run build
    ```

*   **Release:**
    Updates version numbers across files and manages git tags (requires a version argument).
    ```bash
    npm run release <version>
    ```

## Project Structure

*   **`src/`**: Source code for the application.
    *   **`js/`**: JavaScript modules (`main.js` entry point, `modules/` for logic).
    *   **`input.css`**: Tailwind CSS entry file.
*   **`data/`**: JSON data files for Pokémon stats and type effectiveness.
*   **`scripts/`**: Utility scripts for maintenance (e.g., releasing versions, syncing data).
*   **`index.html`**: Main entry point for the web application.
*   **`sw.js`**: Service Worker for PWA functionality (caching, offline support).
*   **`tailwind.config.js`**: Tailwind CSS configuration.

## Development Conventions

*   **Modular JavaScript:** Code is organized into ES modules (`import`/`export`) in `src/js/modules/` to separate concerns (UI, data loading, calculation logic).
*   **Tailwind CSS:** Styling is primarily done via utility classes in HTML and `src/input.css`.
*   **PWA First:** The application is built to be offline-first using a Service Worker (`sw.js`). Ensure cache versions are updated during releases.
*   **Data Driven:** Core application logic relies on structured data in the `data/` directory.

### Programming Style

*   **Logic Organization:** Prefer grouping related logic within descriptive files (e.g., `ui.js`, `calculator.js`, `data.js`) rather than having many tiny files.
*   **Styling:** Utility-first approach using **Tailwind CSS**. Avoid complex custom CSS unless strictly necessary.
*   **Documentation:** Use a balanced approach: write self-documenting code (clear variable and function names) but support it with JSDoc or comments for complex logic.
*   **Error Handling:** Use **`try/catch`** blocks for asynchronous operations and critical logic to ensure robustness and facilitate debugging.
*   **Frontend Philosophy:** Focus on functionality and performance; the project prioritizes interactive utility over complex frontend framework patterns.

## Data Maintenance

The project includes utility scripts in the `scripts/` directory to manage data integrity:

*   **`node scripts/sync-pokedex.js`**: Fetches the latest Pokémon data (including Megas and regional forms) from Pokémon Showdown and normalizes it into `data/pokedex.json`. Run this when new Pokémon/forms are released.
*   **`node scripts/verify-types.js`**: Validates the local type effectiveness data (`data/type-data.json`) against Smogon's standard to ensure 100% accuracy in calculations.

## Git Workflow & Contribution

The project follows a strict **Gitflow** strategy combined with **Conventional Commits**.

### Branching Strategy

*   **`main`**: Production-ready code. Contains version tags (e.g., `v2.7.1`).
*   **`develop`**: Integration branch. All features and fixes are merged here first.
*   **Feature Branches**: Created from `develop`.
    *   Format: `feature/description-of-feature`
*   **Fix Branches**: Created from `develop` (for dev bugs).
    *   Format: `fix/description-of-bug`
*   **Hotfix Branches**: Created from `main` (for production bugs).
    *   Format: `hotfix/description-of-emergency`
*   **Release Branches**: Created from `develop` to prepare for production.
    *   Format: `release/vX.Y.Z`

### Workflow Steps

1.  **Start Work:**
    *   Checkout `develop`.
    *   Create a new branch: `git checkout -b feature/my-cool-feature`.
2.  **Commit:**
    *   Use **Conventional Commits**: `type(scope): subject`.
    *   Examples: `feat: add dark mode`, `fix: correct type chart calculation`, `chore: update dependencies`.
3.  **Merge to Develop:**
    *   Switch to `develop`: `git checkout develop`.
    *   Merge with a commit: `git merge --no-ff feature/my-cool-feature`.
    *   Push to remote: `git push origin develop`.
4.  **Release Process:**
    *   Create a release branch from `develop`: `git checkout -b release/vX.Y.Z`.
    *   Run the release script: `npm run release X.Y.Z`.
        *   *This script updates `package.json`, `sw.js`, `index.html`, commits changes, and tags the commit.*
    *   Merge to `main`:
        *   `git checkout main`
        *   `git merge --no-ff release/vX.Y.Z`
    *   Merge back to `develop` (to keep version sync):
        *   `git checkout develop`
        *   `git merge --no-ff release/vX.Y.Z`
    *   Push everything: `git push origin main develop --tags`.

## Marketing & Growth

A marketing strategy document is available in `docs/Estrategia_Marketing.md` (or may have been moved to the parent directory), outlining plans for SEO, community engagement (Nuzlocke), and social media content.
