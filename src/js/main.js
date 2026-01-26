import { loadAppData, fetchPokemonDetails } from './modules/data.js?v=2.11.3';
import { calculateDefense, calculateOffense, findImmuneDualTypes } from './modules/calculator.js?v=2.11.3';
import * as ui from './modules/ui.js?v=2.11.3';
import { initTheme } from './modules/theme.js?v=2.11.3';

let appData = null;

async function init() {
    try {
        initTheme(); // Initialize Dark/Light Mode
        appData = await loadAppData();
        
        ui.populateSelects(['type-select', 'type2-select'], appData.types);
        ui.generateTypeTable('type-table-container', appData.types, appData.effectiveness, appData.contrast);
        
        setupEventListeners();
    } catch (error) {
        console.error("Initialization failed:", error);
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
        if (pokemon.id) {
            try {
                // Show loading state or clear previous
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
        return;
    }

    section.classList.remove('hidden');
    
    // Treat same type selection as monotype
    if (t1 === t2) t2 = '';

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
    ui.renderEffectivenessCard(document.getElementById('resistances'), 'Resistances', def.resistances, 'None', 'resist', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('immunities'), 'Immunities', def.immunities, 'None', 'immune', appData.contrast);

    ui.renderEffectivenessCard(document.getElementById('super-effective'), 'Super Effective', off.superEffective2x, 'None', 'super', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('neutral-offense'), 'Neutral Damage', off.neutral, 'None', 'neutral', appData.contrast);
    ui.renderEffectivenessCard(document.getElementById('not-very-effective'), 'Not Very Effective', off.notVeryEffective, 'None', 'resist', appData.contrast);
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
