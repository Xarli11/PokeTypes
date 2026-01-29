import { loadAppData, fetchPokemonDetails } from './modules/data.js?v=2.17.4';
import { calculateDefense, calculateOffense, findImmuneDualTypes } from './modules/calculator.js?v=2.17.4';
import { getTacticalAdvice } from './modules/advisor.js?v=2.17.4';
import * as ui from './modules/ui.js?v=2.17.4';
import { initTheme } from './modules/theme.js?v=2.17.4';

let appData = null;

async function init() {
    try {
        initTheme(); // Initialize Dark/Light Mode
        appData = await loadAppData();
        
        ui.populateSelects(['type-select', 'type2-select'], appData.types);
        ui.generateTypeTable('type-table-container', appData.types, appData.effectiveness, appData.contrast);
        
        setupEventListeners();
        
        // Initial state from URL
        await applyStateFromURL();
        
    } catch (error) {
        console.error("Initialization failed:", error);
    }
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
    if (!pokemon.id) {
        statsSection.classList.add('hidden');
        return;
    }

    try {
        document.getElementById('stats-container').innerHTML = '<div class="text-center p-4 text-slate-400">Loading stats...</div>';
        document.getElementById('abilities-container').innerHTML = '';
        statsSection.classList.remove('hidden');

        const details = await fetchPokemonDetails(pokemon.id);
        if (details) {
            ui.renderStats(document.getElementById('stats-container'), details.stats);
            ui.renderAbilities(document.getElementById('abilities-container'), details.abilities);
            ui.renderAbilityAlerts(document.getElementById('ability-alerts'), details.abilities);
        } else {
            statsSection.classList.add('hidden');
        }
    } catch (err) {
        console.error('Error displaying details:', err);
        statsSection.classList.add('hidden');
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('pokemon-search');
    const suggestionsList = document.getElementById('suggestions');
    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    const resetButton = document.getElementById('reset-button');
    const statsSection = document.getElementById('pokemon-stats');

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

        const matches = appData.pokemonList.filter(p => p.name.toLowerCase().includes(query)).slice(0, 10);
        
        if (matches.length === 0) {
            suggestionsList.innerHTML = '<li class="p-4 text-slate-400 italic text-center">No results found</li>';
        } else {
            suggestionsList.innerHTML = matches.map((p, index) => {
                // Use PokeAPI sprites via raw.githubusercontent.com
                // p.id was added to pokedex.json by migration script
                const imageUrl = p.id 
                    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
                    : 'pokeball.png';

                const typePills = p.types.map(t => ui.createTypePill(t, appData.contrast)).join('');
                
                return `
                    <li data-name="${p.name}" data-index="${index}" class="suggestion-item flex items-center gap-4 !py-3">
                        <img src="${imageUrl}" 
                             alt="${p.name}" 
                             loading="lazy"
                             class="w-10 h-10 object-contain flex-shrink-0"
                             onerror="this.onerror=null; this.src='pokeball.png';">
                        <span class="flex-1 font-bold text-slate-700 dark:text-slate-200">${ui.capitalizeWords(p.name)}</span>
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
        
        searchInput.value = ui.capitalizeWords(pokemon.name);
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
    ui.renderSplitEffectivenessCard(document.getElementById('weaknesses'), 'Weak to', def.weaknesses4x, def.weaknesses2x, 'None', 'super', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('neutral-damage'), 'Neutral Damage', def.neutral, 'None', 'neutral', appData.contrast);
    ui.renderSplitResistanceCard(document.getElementById('resistances'), 'Resistances', def.resistances025x, def.resistances05x, 'None', 'resist', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('immunities'), 'Immunities', def.immunities, 'None', 'immune', appData.contrast);

    // AI Advisor
    try {
        const advice = getTacticalAdvice(def.weaknesses4x, def.weaknesses2x, appData.types, appData.effectiveness, appData.pokemonList);
        ui.renderTacticalAdvice(document.getElementById('tactical-advice'), advice);
    } catch (error) {
        console.error("AI Advisor error:", error);
        document.getElementById('tactical-advice').classList.add('hidden');
    }

    ui.renderBadgedCard(document.getElementById('super-effective'), 'Super Effective', off.superEffective2x, 'None', 'super', 'x2', 'bg-orange-500', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('neutral-offense'), 'Neutral Damage', off.neutral, 'None', 'neutral', appData.contrast);
    ui.renderBadgedCard(document.getElementById('not-very-effective'), 'Not Very Effective', off.notVeryEffective, 'None', 'resist', 'x0.5', 'bg-emerald-500', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('no-effect'), 'No Effect', off.noEffect, 'None', 'immune', appData.contrast);
    
    ui.renderDualImmunities(document.getElementById('dual-immunities'), 'Totally Walled By (Dual Types)', dualImmunities, appData.contrast);
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
