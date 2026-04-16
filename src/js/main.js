import { loadAppData, fetchPokemonDetails, fetchCompetitiveData } from './modules/data.js';
import { calculateDefense, calculateOffense, findImmuneDualTypes } from './modules/calculator.js';
import { getTacticalAdvice } from './modules/advisor.js';
import * as ui from './modules/ui.js';
import { initTheme } from './modules/theme.js';
import { initProMode, refreshProView } from './modules/pro.js';
import { i18n } from './modules/i18n.js';

let appData = null;
let currentPokemon = null;
let championsMode = localStorage.getItem('poketypes_champions_mode') === 'true';

async function init() {
    try {
        initTheme(); // Initialize Dark/Light Mode
        initProMode(); // Initialize Pro Mode Switcher
        initChampionsMode(); // Initialize Champions Mode Toggle
        
        // Expose centralized image error handler for inline use
        window.handleSearchImageError = ui.handleSearchImageError;
        
        // Initialize i18n
        updateLanguageToggle();
        i18n.updateDOM();

        appData = await loadAppData();
        i18n.setAbilityMap(appData.abilityMap);
        
        ui.populateSelects(['type-select', 'type2-select', 'type3-select'], appData.types);
        ui.generateTypeTable('type-table-container', appData.types, appData.effectiveness, appData.contrast);
        
        setupEventListeners();
        
        // Initial state from URL
        await applyStateFromURL();
        
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

function initChampionsMode() {
    const toggle = document.getElementById('champions-toggle');
    if (!toggle) return;

    if (championsMode) {
        toggle.classList.add('active');
    }

    toggle.addEventListener('click', () => {
        championsMode = !championsMode;
        localStorage.setItem('poketypes_champions_mode', championsMode);
        toggle.classList.toggle('active');
        refreshUI();
    });
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
    const t3Select = document.getElementById('type3-select');
    const t1Val = t1Select.value;
    const t2Val = t2Select.value;
    const t3Val = t3Select ? t3Select.value : '';

    ui.populateSelects(['type-select', 'type2-select', 'type3-select'], appData.types);
    t1Select.value = t1Val;
    t2Select.value = t2Val;
    if (t3Select) t3Select.value = t3Val;

    // 4. Update Analysis Cards
    displayAnalysis(t1Val, t2Val, t3Val);

    // 5. Update Pokemon Stats/Abilities if visible
    const statsSection = document.getElementById('pokemon-stats');
    if (currentPokemon && statsSection && !statsSection.classList.contains('hidden')) {
        // Re-fetch details to get updated translations (handled by data.js using i18n.currentLang)
        showPokemonDetails(currentPokemon);
    }

    // 6. Refresh Pro Mode View
    refreshProView();
}

function syncURLWithState(t1, t2, t3, pokemonObj) {
    const url = new URL(window.location);
    
    if (pokemonObj) {
        const slug = (pokemonObj.apiName || pokemonObj.name).toLowerCase().replace(/\s+/g, '-');
        url.pathname = `/pokemon/${slug}`;
        url.search = '';
    } else if (t1 || t2 || t3) {
        const types = [t1, t2, t3].filter(Boolean).map(t => t.toLowerCase());
        url.pathname = `/tipo/${types.join('-')}`;
        url.search = '';
    } else {
        url.pathname = '/';
        url.search = '';
    }
    
    window.history.pushState({}, '', url);
}

async function applyStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    
    let p = params.get('p');
    let t1 = params.get('t1');
    let t2 = params.get('t2');
    let t3 = params.get('t3');

    // Path-based detection
    if (pathParts[0] === 'pokemon' && pathParts[1]) {
        p = pathParts[1];
    } else if (pathParts[0] === 'tipo' && pathParts[1]) {
        const types = pathParts[1].split('-');
        t1 = types[0];
        t2 = types[1];
        t3 = types[2];
    }

    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    const type3Select = document.getElementById('type3-select');
    const searchInput = document.getElementById('pokemon-search');

    if (p) {
        const pokemon = appData.pokemonList.find(item => 
            item.name.toLowerCase() === p.toLowerCase() || 
            (item.apiName && item.apiName.toLowerCase() === p.toLowerCase()) ||
            (item.name.toLowerCase().replace(/\s+/g, '-') === p.toLowerCase())
        );
        if (pokemon) {
            const localizedName = i18n.t(pokemon.name.toLowerCase());
            searchInput.value = localizedName !== pokemon.name.toLowerCase() ? localizedName : ui.capitalizeWords(pokemon.name);
            
            typeSelect.value = pokemon.types[0] || '';
            type2Select.value = pokemon.types[1] || '';
            if (type3Select) type3Select.value = pokemon.types[2] || '';
            displayAnalysis(typeSelect.value, type2Select.value, type3Select ? type3Select.value : null);
            await showPokemonDetails(pokemon);
            return;
        }
    }

    if (t1 || t2 || t3) {
        const findType = (val) => appData.types.find(t => t.toLowerCase() === val?.toLowerCase());
        const validT1 = findType(t1);
        const validT2 = findType(t2);
        const validT3 = findType(t3);

        if (validT1) typeSelect.value = validT1;
        if (validT2) type2Select.value = validT2;
        if (validT3 && type3Select) type3Select.value = validT3;
        
        displayAnalysis(typeSelect.value, type2Select.value, type3Select ? type3Select.value : null);
    }
}

async function showPokemonDetails(pokemon) {
    const statsSection = document.getElementById('pokemon-stats');
    const statsContainer = document.getElementById('stats-container');
    const abilitiesContainer = document.getElementById('abilities-container');
    const alertsContainer = document.getElementById('ability-alerts');
    const competitiveSection = document.getElementById('competitive-section');
    const competitiveContainer = document.getElementById('competitive-container');

    if (!pokemon.id) {
        statsSection.classList.add('hidden');
        if (competitiveSection) competitiveSection.classList.add('hidden');
        return;
    }

    currentPokemon = pokemon;

    try {
        statsContainer.innerHTML = `<div class="text-center p-4 text-slate-400">${i18n.t('loading_stats')}</div>`;
        abilitiesContainer.innerHTML = '';
        if (alertsContainer) alertsContainer.innerHTML = '';
        
        statsSection.classList.remove('hidden');

        // Render Hero Card immediately (data is available locally)
        ui.renderPokemonHero(document.getElementById('pokemon-hero'), pokemon, appData.contrast, appData.imageFixes, appData.pokemonList);

        // Add Omni Mega Listener
        const megaBtn = document.getElementById('omni-mega-btn');
        if (megaBtn) {
            megaBtn.addEventListener('click', () => {
                const curName = pokemon.name.toLowerCase();
                const isMega = curName.includes('mega');
                
                let targetForm = null;
                
                if (isMega) {
                    // Try to find base form (e.g. "venusaur-mega" -> "venusaur")
                    const baseName = curName.split('-mega')[0];
                    targetForm = appData.pokemonList.find(p => p.name.toLowerCase() === baseName);
                } else {
                    // Try to find mega form
                    targetForm = appData.pokemonList.find(p => {
                        const pName = p.name.toLowerCase();
                        const pApi = p.apiName?.toLowerCase() || '';
                        return (pName === curName + '-mega') || 
                               (pName === curName + '-mega-y') || 
                               (pName === curName + '-mega-x') ||
                               (pApi === curName + 'mega') ||
                               (pApi === curName + 'megax') ||
                               (pApi === curName + 'megay');
                    });
                }
                
                if (targetForm) {
                    showPokemonDetails(targetForm);
                    updateUI(targetForm);
                    const searchInput = document.getElementById('pokemon-search');
                    const localizedName = i18n.t(targetForm.name.toLowerCase());
                    searchInput.value = localizedName !== targetForm.name.toLowerCase() ? localizedName : ui.capitalizeWords(targetForm.name);
                }
            });
        }

        // Fetch both Pokemon details and competitive data
        const [details, compData] = await Promise.all([
            fetchPokemonDetails(pokemon.apiName || pokemon.id),
            fetchCompetitiveData(pokemon.name)
        ]);

        if (details) {
            // Update Hero image with correct variety ID if it differs from local data
            if (details.id && details.id !== pokemon.id) {
                const heroImg = document.getElementById('pokemon-hero-img');
                if (heroImg) {
                    heroImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`;
                }
            }

            // FALLBACK: If details has no abilities but compData has, use compData abilities
            // This is common for custom Megas or non-standard forms
            if ((!details.abilities || details.abilities.length === 0) && compData && compData.abilities) {
                details.abilities = Object.entries(compData.abilities).map(([key, abilityName]) => {
                    return {
                        is_hidden: key === 'H',
                        ability: {
                            name: abilityName.toLowerCase().replace(/ /g, '-'),
                            displayName: i18n.tAbility(abilityName)
                        },
                        description: i18n.t(`${abilityName.toLowerCase().replace(/ /g, '-')}_desc`) || i18n.t('stats_unavailable')
                    };
                });
                
                // If description lookup failed (returned the key), set a generic one
                details.abilities.forEach(a => {
                    if (a.description === `${a.ability.name}_desc`) {
                        a.description = i18n.t('stats_unavailable');
                    }
                });
            }

            ui.renderStats(statsContainer, details.stats);
            ui.renderAbilities(abilitiesContainer, details.abilities);
            ui.renderAbilityAlerts(alertsContainer, details.abilities);
        } else {
            // If details fetch fails, keep Hero visible but show error in stats area
            statsContainer.innerHTML = `<div class="text-center p-4 text-slate-400 text-sm italic">${i18n.t('stats_unavailable') || 'Stats unavailable'}</div>`;
            abilitiesContainer.innerHTML = '';
        }

        // Render competitive data if available
        if (competitiveSection && competitiveContainer) {
            if (compData) {
                competitiveSection.classList.remove('hidden');
                ui.renderCompetitiveData(competitiveContainer, compData, pokemon.name);
            } else {
                competitiveSection.classList.add('hidden');
            }
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
    const type3Select = document.getElementById('type3-select');
    const resetButton = document.getElementById('reset-button');
    const statsSection = document.getElementById('pokemon-stats');
    const langToggle = document.getElementById('lang-toggle');

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Language Toggle
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = i18n.currentLang === 'es' ? 'en' : 'es';
            i18n.setLanguage(newLang);
            updateLanguageToggle();
            refreshUI();
        });
    }

    const updateUI = (pokemonObj = null) => {
        const t1 = typeSelect.value;
        const t2 = type2Select.value;
        const t3 = type3Select ? type3Select.value : null;
        displayAnalysis(t1, t2, t3);
        syncURLWithState(t1, t2, t3, pokemonObj || currentPokemon);
    };

    typeSelect.addEventListener('change', () => {
        searchInput.value = '';
        currentPokemon = null;
        statsSection.classList.add('hidden');
        updateUI();
    });
    type2Select.addEventListener('change', () => {
        searchInput.value = '';
        currentPokemon = null;
        statsSection.classList.add('hidden');
        updateUI();
    });
    if (type3Select) {
        type3Select.addEventListener('change', () => {
            // No borramos el searchInput ni ocultamos los stats si solo añadimos el tercer tipo
            updateUI();
        });
    }

    resetButton.addEventListener('click', () => {
        typeSelect.value = '';
        type2Select.value = '';
        if (type3Select) type3Select.value = '';
        searchInput.value = '';
        currentPokemon = null;
        statsSection.classList.add('hidden');
        displayAnalysis('', '', '');
        syncURLWithState('', '', '', null);
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
        let matches = appData.pokemonList.map(p => {
            // Check if we have a localized name for this pokemon (using its slug/name as key)
            const localizedName = i18n.t(p.name.toLowerCase());
            return {
                ...p,
                displayName: localizedName !== p.name.toLowerCase() ? localizedName : ui.capitalizeWords(p.name),
                searchName: (localizedName + " " + p.name).toLowerCase()
            };
        }).filter(p => p.searchName.includes(query));

        // 2. Filter by Champions Mode if active (Regulation M-A)
        if (championsMode) {
            matches = matches.filter(p => {
                // IDs 1-1025 are the base pool for Gen 1-9
                const isBaseLegal = p.id <= 1025;
                const isMega = p.name.toLowerCase().includes('mega');
                // Exclude some specific Gen 9 bans if needed (e.g. legendary trios or paradox if they were banned)
                // For now, based on Wolfey's video, most 1025 are legal except restricted.
                return isBaseLegal || isMega;
            });
        }

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
                             onerror="handleSearchImageError(this, ${p.id}, '${p.name.replace(/'/g, "\\'")}')">
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
        updateUI(pokemon);

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

function displayAnalysis(t1, t2, t3 = null) {
    const section = document.getElementById('type-details');
    const nameSpan = document.getElementById('selected-type-name');
    const abilityAlerts = document.getElementById('ability-alerts');
    
    // Always clear alerts when refreshing analysis (generic type analysis implies no specific abilities)
    if (abilityAlerts) {
        abilityAlerts.innerHTML = '';
        abilityAlerts.classList.add('hidden');
    }
    
    if (!t1 && !t2 && !t3) {
        section.classList.add('hidden');
        document.getElementById('tactical-advice').innerHTML = ''; // Clear advice
        document.getElementById('tactical-advice').classList.add('hidden');
        document.getElementById('share-btn').classList.add('hidden'); // Hide share button
        return;
    }

    section.classList.remove('hidden');
    
    // Treat same type selection as monotype
    if (t1 === t2) t2 = '';
    if (t1 === t3) t3 = '';
    if (t2 === t3) t3 = '';

    // If only t2 is selected but no t1
    if (!t1 && t2) { t1 = t2; t2 = ''; }
    if (!t1 && !t2 && t3) { t1 = t3; t3 = ''; }
    if (!t2 && t3) { t2 = t3; t3 = ''; }

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
    shareBtn.classList.add('text-emerald-600', 'bg-emerald-50');

    // Render Title Pills
    nameSpan.innerHTML = '';
    if (t1) nameSpan.innerHTML += ui.createTypePill(t1, appData.contrast);
    if (t2) {
        nameSpan.innerHTML += `<span class="text-slate-300 font-bold px-2">+</span>`;
        nameSpan.innerHTML += ui.createTypePill(t2, appData.contrast);
    }
    if (t3) {
        nameSpan.innerHTML += `<span class="text-slate-300 font-bold px-2">+</span>`;
        nameSpan.innerHTML += ui.createTypePill(t3, appData.contrast);
    }

    // Calculations
    const def = calculateDefense(t1, t2, appData.types, appData.effectiveness, t3);
    const off = calculateOffense(t1, t2, appData.types, appData.effectiveness, t3);
    const dualImmunities = findImmuneDualTypes(t1, t2, appData.types, appData.effectiveness);

    // Render Cards
    // Using translation keys: 'weaknesses', 'neutral_damage', 'resistances', 'immunities', 'super_effective', etc.
    ui.renderSplitEffectivenessCard(document.getElementById('weaknesses'), 'weaknesses', def.weaknesses4x, def.weaknesses2x, 'none', 'super', appData.contrast, def.weaknesses8x);
    ui.renderEffectivenessCard(document.getElementById('neutral-damage'), 'neutral_damage', def.neutral, 'none', 'neutral', appData.contrast);
    ui.renderSplitResistanceCard(document.getElementById('resistances'), 'resistances', def.resistances025x, def.resistances05x, 'none', 'resist', appData.contrast, def.resistances0125x);
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

        const advice = getTacticalAdvice(def.weaknesses4x, def.weaknesses2x, appData.types, appData.effectiveness, appData.pokemonList, relevantPokemon, def.weaknesses8x);
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