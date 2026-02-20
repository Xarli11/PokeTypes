import { loadAppData, fetchPokemonDetails } from './modules/data.js?v=2.24.1';
import { calculateDefense, calculateOffense, findImmuneDualTypes } from './modules/calculator.js?v=2.24.1';
import { getTacticalAdvice } from './modules/advisor.js?v=2.24.1';
import * as ui from './modules/ui.js?v=2.24.1';
import { initTheme } from './modules/theme.js?v=2.24.1';
import { initProMode, refreshProView } from './modules/pro.js?v=2.24.1';
import { i18n } from './modules/i18n.js?v=2.24.1';

let appData = null;
let currentPokemon = null;

async function init() {
    try {
        initTheme(); // Initialize Dark/Light Mode
        initProMode(); // Initialize Pro Mode Switcher
        
        // Initialize i18n
        updateLanguageToggle();
        i18n.updateDOM();

        appData = await loadAppData();
        i18n.setAbilityMap(appData.abilityMap);
        
        ui.populateSelects(['type-select', 'type2-select'], appData.types);
        ui.generateTypeTable('type-table-container', appData.types, appData.effectiveness, appData.contrast);
        
        setupEventListeners();
        
        // Initial state from URL
        await applyStateFromURL();
        
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

function updateLanguageToggle() {
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        // Show current language
        btn.textContent = i18n.currentLang.toUpperCase();
    }
}

function refreshUI() {
    if (!appData) return;

    // 1. Update static texts
    i18n.updateDOM();

    // 2. Regenerate Table
    ui.generateTypeTable('type-table-container', appData.types, appData.effectiveness, appData.contrast);

    // 3. Update Selects (preserve selection)
    const t1Select = document.getElementById('type-select');
    const t2Select = document.getElementById('type2-select');
    const t1Val = t1Select.value;
    const t2Val = t2Select.value;

    ui.populateSelects(['type-select', 'type2-select'], appData.types);
    t1Select.value = t1Val;
    t2Select.value = t2Val;

    // 4. Update Analysis Cards
    displayAnalysis(t1Val, t2Val);

    // 5. Update Pokemon Stats/Abilities if visible
    const statsSection = document.getElementById('pokemon-stats');
    if (currentPokemon && statsSection && !statsSection.classList.contains('hidden')) {
        // Re-fetch details to get updated translations (handled by data.js using i18n.currentLang)
        showPokemonDetails(currentPokemon);
    }

    // 6. Refresh Pro Mode View
    refreshProView();
}

function syncURLWithState(t1, t2, pokemonName) {
    const url = new URL(window.location);
    if (t1) url.searchParams.set('t1', t1.toLowerCase()); else url.searchParams.delete('t1');
    if (t2) url.searchParams.set('t2', t2.toLowerCase()); else url.searchParams.delete('t2');
    if (pokemonName) url.searchParams.set('p', pokemonName.toLowerCase()); else url.searchParams.delete('p');
    
    window.history.replaceState({}, '', url);
}

async function applyStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const t1 = params.get('t1');
    const t2 = params.get('t2');
    const p = params.get('p');

    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    const searchInput = document.getElementById('pokemon-search');

    if (p) {
        const pokemon = appData.pokemonList.find(item => item.name.toLowerCase() === p.toLowerCase());
        if (pokemon) {
            searchInput.value = ui.capitalizeWords(pokemon.name);
            typeSelect.value = pokemon.types[0] || '';
            type2Select.value = pokemon.types[1] || '';
            displayAnalysis(typeSelect.value, type2Select.value);
            await showPokemonDetails(pokemon);
            return;
        }
    }

    if (t1 || t2) {
        // Ensure types exist in appData (case insensitive match)
        const findType = (val) => appData.types.find(t => t.toLowerCase() === val?.toLowerCase());
        const validT1 = findType(t1);
        const validT2 = findType(t2);

        if (validT1) typeSelect.value = validT1;
        if (validT2) type2Select.value = validT2;
        
        displayAnalysis(typeSelect.value, type2Select.value);
    }
}

async function showPokemonDetails(pokemon) {
    const statsSection = document.getElementById('pokemon-stats');
    const statsContainer = document.getElementById('stats-container');
    const abilitiesContainer = document.getElementById('abilities-container');
    const alertsContainer = document.getElementById('ability-alerts');

    if (!pokemon.id) {
        statsSection.classList.add('hidden');
        return;
    }

    currentPokemon = pokemon;

    try {
        statsContainer.innerHTML = `<div class="text-center p-4 text-slate-400">${i18n.t('loading_stats')}</div>`;
        abilitiesContainer.innerHTML = '';
        if (alertsContainer) alertsContainer.innerHTML = '';
        
        statsSection.classList.remove('hidden');

        // Render Hero Card immediately (data is available locally)
        ui.renderPokemonHero(document.getElementById('pokemon-hero'), pokemon, appData.contrast, appData.imageFixes);

        const details = await fetchPokemonDetails(pokemon.apiName || pokemon.id);
        
        if (details) {
            ui.renderStats(statsContainer, details.stats);
            ui.renderAbilities(abilitiesContainer, details.abilities);
            ui.renderAbilityAlerts(alertsContainer, details.abilities);
        } else {
            // If details fetch fails, keep Hero visible but show error in stats area
            statsContainer.innerHTML = `<div class="text-center p-4 text-slate-400 text-sm italic">${i18n.t('stats_unavailable') || 'Stats unavailable'}</div>`;
            abilitiesContainer.innerHTML = '';
        }
    } catch (err) {
        console.error('Error displaying details:', err);
        // Even on error, keep Hero visible if possible
        statsContainer.innerHTML = `<div class="text-center p-4 text-slate-400 text-sm italic">${i18n.t('stats_unavailable') || 'Stats unavailable'}</div>`;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('pokemon-search');
    const suggestionsList = document.getElementById('suggestions');
    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    const resetButton = document.getElementById('reset-button');
    const statsSection = document.getElementById('pokemon-stats');
    const langToggle = document.getElementById('lang-toggle');

    // Language Toggle
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = i18n.currentLang === 'es' ? 'en' : 'es';
            i18n.setLanguage(newLang);
            updateLanguageToggle();
            refreshUI();
        });
    }

    const updateUI = () => {
        const t1 = typeSelect.value;
        const t2 = type2Select.value;
        displayAnalysis(t1, t2);
        syncURLWithState(t1, t2, searchInput.value);
    };

    typeSelect.addEventListener('change', () => {
        searchInput.value = '';
        statsSection.classList.add('hidden');
        updateUI();
    });
    type2Select.addEventListener('change', () => {
        searchInput.value = '';
        statsSection.classList.add('hidden');
        updateUI();
    });

    resetButton.addEventListener('click', () => {
        typeSelect.value = '';
        type2Select.value = '';
        searchInput.value = '';
        statsSection.classList.add('hidden');
        displayAnalysis('', '');
        syncURLWithState('', '', '');
    });

    // Search Logic
    let activeIndex = -1;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        activeIndex = -1;
        if (!query) {
            suggestionsList.classList.add('hidden');
            return;
        }

        // 1. Get matches with localization support
        const matches = appData.pokemonList.map(p => {
            // Check if we have a localized name for this pokemon (using its slug/name as key)
            const localizedName = i18n.t(p.name.toLowerCase());
            return {
                ...p,
                displayName: localizedName !== p.name.toLowerCase() ? localizedName : ui.capitalizeWords(p.name),
                searchName: (localizedName + " " + p.name).toLowerCase()
            };
        }).filter(p => p.searchName.includes(query));

        // ... (sorting omitted for brevity) ...

        const topMatches = matches.slice(0, 10);
        
        if (topMatches.length === 0) {
            suggestionsList.innerHTML = '<li class="p-4 text-slate-400 italic text-center">' + i18n.t('none') + '</li>';
        } else {
            suggestionsList.innerHTML = topMatches.map((p, index) => {
                // Use centralized image URL logic
                const imageUrl = ui.getPokemonImageUrl(p, appData.imageFixes);

                const typePills = p.types.map(t => ui.createTypePill(t, appData.contrast)).join('');
                
                return `
                    <li data-name="${p.name}" data-index="${index}" class="suggestion-item flex items-center gap-4 !py-3">
                        <img src="${imageUrl}" 
                             alt="${p.displayName}" 
                             loading="lazy"
                             class="w-10 h-10 object-contain flex-shrink-0"
                             onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png';">
                        <span class="flex-1 font-bold text-slate-700 dark:text-slate-200">${p.displayName}</span>
                        <div class="flex gap-1 scale-90 origin-right">
                            ${typePills}
                        </div>
                    </li>`;
            }).join('');
        }
        suggestionsList.classList.remove('hidden');
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsList.querySelectorAll('.suggestion-item');
        if (suggestionsList.classList.contains('hidden') || !items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            updateActiveSuggestion(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            updateActiveSuggestion(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex > -1) {
                items[activeIndex].click();
            }
        } else if (e.key === 'Escape') {
            suggestionsList.classList.add('hidden');
        }
    });

    function updateActiveSuggestion(items) {
        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add('bg-indigo-50', 'dark:bg-indigo-900/40', 'text-indigo-600', 'dark:text-indigo-300');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('bg-indigo-50', 'dark:bg-indigo-900/40', 'text-indigo-600', 'dark:text-indigo-300');
            }
        });
    }

    suggestionsList.addEventListener('click', async (e) => {
        const li = e.target.closest('li');
        if (!li || !li.hasAttribute('data-name')) return;

        const name = li.getAttribute('data-name');
        const pokemon = appData.pokemonList.find(p => p.name === name);
        
        // Use localized name for the input field
        const localizedName = i18n.t(pokemon.name.toLowerCase());
        searchInput.value = localizedName !== pokemon.name.toLowerCase() ? localizedName : ui.capitalizeWords(pokemon.name);
        
        typeSelect.value = pokemon.types[0] || '';
        type2Select.value = pokemon.types[1] || '';
        
        suggestionsList.classList.add('hidden');
        updateUI();

        // Fetch and display details
        await showPokemonDetails(pokemon);
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.classList.add('hidden');
        }
    });

    // Contact/Discord Logic
    const discordBtn = document.getElementById('discord-btn');
    const discordTooltip = document.getElementById('discord-tooltip');
    
    if (discordBtn && discordTooltip) {
        discordBtn.addEventListener('click', () => {
            const username = 'xarli11';
            navigator.clipboard.writeText(username).then(() => {
                discordTooltip.classList.remove('opacity-0');
                setTimeout(() => {
                    discordTooltip.classList.add('opacity-0');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }

    // Share Button Logic
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const url = window.location.href;
            const title = "PokeTypes Analysis";
            const text = "Check out this Pokemon type analysis!";

            if (navigator.share) {
                try {
                    await navigator.share({ title, text, url });
                } catch (err) {
                    console.log('Share canceled or failed:', err);
                }
            } else {
                // Fallback: Copy to clipboard
                try {
                    await navigator.clipboard.writeText(url);
                    
                    // Visual feedback
                    const originalContent = shareBtn.innerHTML;
                    const originalClass = shareBtn.className;
                    
                    shareBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    `;
                    shareBtn.classList.remove('text-indigo-600', 'bg-indigo-50', 'dark:text-indigo-400', 'dark:bg-indigo-900/30');
                    shareBtn.classList.add('text-green-600', 'bg-green-100', 'dark:text-green-400', 'dark:bg-green-900/30');
                    
                    setTimeout(() => {
                        shareBtn.innerHTML = originalContent;
                        shareBtn.className = originalClass;
                    }, 2000);
                    
                } catch (err) {
                    console.error('Failed to copy URL:', err);
                }
            }
        });
    }
}

function displayAnalysis(t1, t2) {
    const section = document.getElementById('type-details');
    const nameSpan = document.getElementById('selected-type-name');
    const abilityAlerts = document.getElementById('ability-alerts');
    
    // Always clear alerts when refreshing analysis (generic type analysis implies no specific abilities)
    if (abilityAlerts) {
        abilityAlerts.innerHTML = '';
        abilityAlerts.classList.add('hidden');
    }
    
    if (!t1 && !t2) {
        section.classList.add('hidden');
        document.getElementById('tactical-advice').innerHTML = ''; // Clear advice
        document.getElementById('tactical-advice').classList.add('hidden');
        document.getElementById('share-btn').classList.add('hidden'); // Hide share button
        return;
    }

    section.classList.remove('hidden');
    
    // Treat same type selection as monotype
    if (t1 === t2) t2 = '';

    // Show share button
    const shareBtn = document.getElementById('share-btn');
    shareBtn.classList.remove('hidden');
    // Reset visual feedback if any
    shareBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    `;
    shareBtn.classList.remove('text-green-600', 'bg-green-100');
    shareBtn.classList.add('text-indigo-600', 'bg-indigo-50');

    // Render Title Pills
    nameSpan.innerHTML = ui.createTypePill(t1, appData.contrast);
    if (t2) {
        nameSpan.innerHTML += `<span class="text-slate-300 font-bold px-2">+</span>`;
        nameSpan.innerHTML += ui.createTypePill(t2, appData.contrast);
    }

    // Calculations
    const def = calculateDefense(t1, t2, appData.types, appData.effectiveness);
    const off = calculateOffense(t1, t2, appData.types, appData.effectiveness);
    const dualImmunities = findImmuneDualTypes(t1, t2, appData.types, appData.effectiveness);

    // Render Cards
    // Using translation keys: 'weaknesses', 'neutral_damage', 'resistances', 'immunities', 'super_effective', etc.
    ui.renderSplitEffectivenessCard(document.getElementById('weaknesses'), 'weaknesses', def.weaknesses4x, def.weaknesses2x, 'none', 'super', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('neutral-damage'), 'neutral_damage', def.neutral, 'none', 'neutral', appData.contrast);
    ui.renderSplitResistanceCard(document.getElementById('resistances'), 'resistances', def.resistances025x, def.resistances05x, 'none', 'resist', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('immunities'), 'immunities', def.immunities, 'none', 'immune', appData.contrast);

    // AI Advisor
    try {
        // Use currentPokemon for context-aware suggestions (Tiering)
        // If analysis is just types (no pokemon selected), currentPokemon might be null or mismatch, 
        // but displayAnalysis logic ensures we use what we have or null.
        const relevantPokemon = (currentPokemon && 
                                (currentPokemon.types.includes(ui.capitalizeWords(t1)) || 
                                 (t2 && currentPokemon.types.includes(ui.capitalizeWords(t2))))) 
                                ? currentPokemon : null;

        const advice = getTacticalAdvice(def.weaknesses4x, def.weaknesses2x, appData.types, appData.effectiveness, appData.pokemonList, relevantPokemon);
        ui.renderTacticalAdvice(document.getElementById('tactical-advice'), advice);
    } catch (error) {
        console.error("AI Advisor error:", error);
        document.getElementById('tactical-advice').classList.add('hidden');
    }

    ui.renderBadgedCard(document.getElementById('super-effective'), 'super_effective', off.superEffective2x, 'none', 'super', 'x2', 'bg-orange-500', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('neutral-offense'), 'neutral_offense', off.neutral, 'none', 'neutral', appData.contrast);
    ui.renderBadgedCard(document.getElementById('not-very-effective'), 'not_very_effective', off.notVeryEffective, 'none', 'resist', 'x0.5', 'bg-emerald-500', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('no-effect'), 'no_effect', off.noEffect, 'none', 'immune', appData.contrast);
    
    ui.renderDualImmunities(document.getElementById('dual-immunities'), 'walled_by_dual', dualImmunities, appData.contrast);
}

document.addEventListener('DOMContentLoaded', init);

// Register Service Worker with Auto-Update
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
            // Force an update check immediately to bypass stale cache
            registration.update();
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}