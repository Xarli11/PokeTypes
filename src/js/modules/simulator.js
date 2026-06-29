// src/js/modules/simulator.js
import { getEffectiveness, getAbilityModifiers } from './calculator.js';
import { loadAppData, fetchPokemonDetails } from './data.js';
import { getPokemonImageUrl, createTypePill, capitalizeWords, normalizeSearch } from './ui.js';
import { i18n } from './i18n.js';

export async function initSimulator() {
    const container = document.querySelector('#view-pro');
    if (!container) return;

    // Create the Simulator Card
    const simulatorSection = document.createElement('section');
    simulatorSection.className = 'md:col-span-12 bento-card dark:bg-slate-800 dark:border-slate-700 !p-6 md:!p-8';
    simulatorSection.innerHTML = `
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            ${i18n.t('sim_title')}
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <!-- 1. Attacker -->
            <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">${i18n.t('sim_attack_type')}</label>
                <select id="sim-attack-type" class="bento-select w-full dark:bg-slate-900 dark:border-slate-700">
                    <!-- Populated by JS -->
                </select>
            </div>

            <!-- 2. Defender -->
            <div class="space-y-2 relative">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">${i18n.t('sim_defender')}</label>
                <input type="text" id="sim-defender-input" placeholder="${i18n.t('search_placeholder')}" class="search-input w-full dark:bg-slate-900 dark:border-slate-700 dark:placeholder-slate-500">
                <ul id="sim-defender-suggestions" class="hidden absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"></ul>
                
                <!-- Active Defender Display -->
                <div id="sim-defender-display" class="hidden mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                    <img id="sim-defender-img" src="" class="w-10 h-10 object-contain">
                    <div class="flex-1 min-w-0">
                        <div id="sim-defender-name" class="font-bold text-sm truncate dark:text-white"></div>
                        <div id="sim-defender-types" class="flex gap-1 scale-75 origin-left"></div>
                    </div>
                    <button id="sim-clear-defender" class="text-slate-400 hover:text-red-500">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <!-- 3. Ability -->
            <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">${i18n.t('abilities')}</label>
                <select id="sim-ability-select" class="bento-select w-full dark:bg-slate-900 dark:border-slate-700 disabled:opacity-50" disabled>
                    <option value="">${i18n.t('sim_select_pokemon')}</option>
                </select>
            </div>
        </div>

        <!-- Result -->
        <div id="sim-result-container" class="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hidden text-center">
            <div class="text-slate-400 text-sm mb-2 font-medium uppercase tracking-widest">${i18n.t('sim_effectiveness')}</div>
            <div id="sim-result-value" class="text-4xl md:text-5xl font-black mb-2 transition-all">1x</div>
            <div id="sim-result-text" class="text-slate-600 dark:text-slate-300 font-medium"></div>
        </div>
    `;

    container.appendChild(simulatorSection);

    // Initialize Data
    const appData = await loadAppData();
    const typeSelect = document.getElementById('sim-attack-type');
    
    // Populate Types
    appData.types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = i18n.tType(type); // Using translation helper if available or capitalize
        typeSelect.appendChild(option);
    });

    setupEventListeners(appData);
}

let selectedPokemon = null;

function setupEventListeners(appData) {
    const attackSelect = document.getElementById('sim-attack-type');
    const defenderInput = document.getElementById('sim-defender-input');
    const suggestions = document.getElementById('sim-defender-suggestions');
    const abilitySelect = document.getElementById('sim-ability-select');
    const clearBtn = document.getElementById('sim-clear-defender');

    const updateSimulation = () => {
        if (!selectedPokemon) {
            document.getElementById('sim-result-container').classList.add('hidden');
            return;
        }
        
        const attackType = attackSelect.value;
        const abilityName = abilitySelect.value;
        
        runSimulation(attackType, selectedPokemon, abilityName, appData.effectiveness);
    };

    attackSelect.addEventListener('change', updateSimulation);
    abilitySelect.addEventListener('change', updateSimulation);

    // Search Logic (Localized)
    defenderInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            suggestions.classList.add('hidden');
            return;
        }

        const normalizedQuery = normalizeSearch(query);
        const matches = appData.pokemonList.map(p => {
            const localizedName = i18n.t(p.name.toLowerCase());
            const displayName = localizedName !== p.name.toLowerCase() ? localizedName : capitalizeWords(p.name);
            return {
                ...p,
                displayName,
                searchName: normalizeSearch(localizedName + " " + p.name)
            };
        }).filter(p => p.searchName.includes(normalizedQuery))
          .sort((a, b) => a.id - b.id)
          .slice(0, 10);

        if (matches.length > 0) {
            suggestions.innerHTML = matches.map(p => `
                <li data-name="${p.name}" class="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <img src="${getPokemonImageUrl(p, appData.imageFixes)}" class="w-8 h-8 object-contain" 
                         onerror="handleSearchImageError(this, ${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                    <span class="text-sm font-bold dark:text-white">${p.displayName}</span>
                </li>
            `).join('');
            suggestions.classList.remove('hidden');
        } else {
            suggestions.classList.add('hidden');
        }
    });

    suggestions.addEventListener('click', async (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        
        const name = li.dataset.name;
        const pokemon = appData.pokemonList.find(p => p.name === name);
        
        selectDefender(pokemon, appData);
        suggestions.classList.add('hidden');
        defenderInput.value = '';
    });

    clearBtn.addEventListener('click', () => {
        selectedPokemon = null;
        document.getElementById('sim-defender-display').classList.add('hidden');
        document.getElementById('sim-defender-input').classList.remove('hidden');
        document.getElementById('sim-defender-input').focus();
        
        abilitySelect.innerHTML = `<option value="">${i18n.t('sim_select_pokemon')}</option>`;
        abilitySelect.disabled = true;
        
        document.getElementById('sim-result-container').classList.add('hidden');
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!defenderInput.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.add('hidden');
        }
    });
}

let defenderDetails = null;

async function selectDefender(pokemon, appData) {
    selectedPokemon = pokemon;
    defenderDetails = null;

    // UI Update
    document.getElementById('sim-defender-input').classList.add('hidden');
    document.getElementById('sim-defender-display').classList.remove('hidden');
    const defenderImg = document.getElementById('sim-defender-img');
    defenderImg.src = getPokemonImageUrl(pokemon, appData.imageFixes);
    defenderImg.onerror = function() {
        this.src = '/pokeball.png';
        this.onerror = null;
    };
    document.getElementById('sim-defender-name').textContent = capitalizeWords(pokemon.name);
    document.getElementById('sim-defender-types').innerHTML = pokemon.types.map(t => createTypePill(t, appData.contrast)).join('');

    // Fetch Abilities + Stats
    const abilitySelect = document.getElementById('sim-ability-select');
    abilitySelect.innerHTML = `<option>${i18n.t('loading_stats')}</option>`;
    abilitySelect.disabled = true;

    try {
        const details = await fetchPokemonDetails(pokemon.apiName || pokemon.id);
        defenderDetails = details;

        if (details && details.abilities) {
            abilitySelect.innerHTML = details.abilities.map(a => {
                const name = i18n.tAbility(a.ability.name);
                return `<option value="${a.ability.name}">${name}</option>`;
            }).join('');
            abilitySelect.disabled = false;

            const event = new Event('change');
            abilitySelect.dispatchEvent(event);
        } else {
            abilitySelect.innerHTML = `<option value="">${i18n.t('none')}</option>`;
        }
    } catch (e) {
        console.error(e);
        abilitySelect.innerHTML = `<option value="">Error</option>`;
    }
}

function parseStats(rawStats) {
    if (!rawStats) return null;
    // PokeAPI array format: [{base_stat: N, stat: {name: 'hp'}}, ...]
    if (Array.isArray(rawStats)) {
        const map = {};
        rawStats.forEach(s => {
            const name = s.stat?.name;
            if (name === 'hp') map.hp = s.base_stat;
            else if (name === 'defense') map.def = s.base_stat;
            else if (name === 'special-defense') map.spd = s.base_stat;
        });
        return Object.keys(map).length ? map : null;
    }
    // Already normalized object format {hp, def, spd, ...}
    return rawStats;
}

function estimateDamageRange(pokemon, typeModifier) {
    const raw = defenderDetails?.stats || pokemon.stats;
    const stats = parseStats(raw);
    if (!stats || typeModifier === 0) return null;

    const { hp, def, spd } = stats;
    if (!hp || (!def && !spd)) return null;

    // Defender HP: base stat → typical lv100 value (252 EVs in HP, 31 IVs)
    const hpStat = 2 * hp + 204;
    // Defender def/spd: 0 EV spread (no investment assumed for attacker-perspective calc)
    const defStat = 2 * Math.min(def || 999, spd || 999) + 36;

    // Reference attacker: base 100 Atk/SpA with 252 EVs, neutral nature → 299 stat
    const atkStat = 299;
    const bp = 100;

    // Standard Gen 3+ damage formula (level 100)
    const rawDmg = Math.floor(Math.floor(Math.floor(2 * 100 / 5 + 2) * atkStat * bp / defStat) / 50 + 2);
    const dmgWithMod = rawDmg * typeModifier;

    const minPct = Math.round((dmgWithMod * 0.85) / hpStat * 100);
    const maxPct = Math.round(dmgWithMod / hpStat * 100);

    return { minPct, maxPct };
}

function runSimulation(attackType, pokemon, abilityName, effectiveness) {
    const resultContainer = document.getElementById('sim-result-container');
    const resultValue = document.getElementById('sim-result-value');
    const resultText = document.getElementById('sim-result-text');

    resultContainer.classList.remove('hidden');

    // 1. Base type effectiveness
    let modifier = getEffectiveness(attackType, pokemon.types[0], effectiveness);
    if (pokemon.types[1]) modifier *= getEffectiveness(attackType, pokemon.types[1], effectiveness);

    // 2. Ability modifier — respects superEffectiveOnly and blockNonSE flags
    const abilityMods = getAbilityModifiers(abilityName);
    let abilityTriggered = null;

    if (abilityMods.length > 0) {
        const mod = abilityMods.find(m => m.type.toLowerCase() === attackType.toLowerCase() || m.type === 'All');

        if (mod) {
            if (mod.blockNonSE) {
                // Wonder Guard: blocks non-SE moves, SE moves pass through
                if (modifier <= 1) {
                    modifier = 0;
                    abilityTriggered = mod;
                }
            } else if (mod.superEffectiveOnly && modifier <= 1) {
                // Filter / Solid Rock / Prism Armor: only reduces SE damage
                // No effect on neutral or resisted moves
            } else if (mod.modifier === 0) {
                modifier = 0;
                abilityTriggered = mod;
            } else {
                modifier *= mod.modifier;
                abilityTriggered = mod;
            }
        }

        // Show offensive ability description even if it doesn't affect the multiplier
        if (!abilityTriggered) {
            const offensiveMod = abilityMods.find(m => m.type === 'Offensive');
            if (offensiveMod) abilityTriggered = { ...offensiveMod, offensiveOnly: true };
        }
    }

    // 3. Render multiplier
    let colorClass = 'text-slate-800 dark:text-white';
    if (modifier >= 2) colorClass = 'text-red-500';
    else if (modifier === 0) colorClass = 'text-slate-400';
    else if (modifier < 1) colorClass = 'text-emerald-500';

    resultValue.className = `text-4xl md:text-5xl font-black mb-2 transition-all ${colorClass}`;
    resultValue.textContent = `${modifier}x`;

    // 4. Render description + damage estimate
    let descHTML = '';
    if (abilityTriggered && !abilityTriggered.offensiveOnly) {
        descHTML += `<p class="mb-1"><span class="font-bold">${capitalizeWords(abilityName.replace(/-/g, ' '))}</span>: ${abilityTriggered.description}</p>`;
    } else if (abilityTriggered?.offensiveOnly) {
        descHTML += `<p class="mb-1 text-amber-600 dark:text-amber-400"><span class="font-bold">${capitalizeWords(abilityName.replace(/-/g, ' '))}</span>: ${abilityTriggered.description}</p>`;
    } else {
        descHTML += `<p class="mb-1">${i18n.t('sim_standard_effectiveness')}</p>`;
    }

    const estimate = estimateDamageRange(pokemon, modifier);
    if (estimate) {
        descHTML += `<p class="text-xs text-slate-400 mt-1">${i18n.t('sim_damage_estimate').replace('{min}', estimate.minPct).replace('{max}', estimate.maxPct)}</p>`;
    }

    resultText.innerHTML = descHTML;
}
