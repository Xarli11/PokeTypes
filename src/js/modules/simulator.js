// src/js/modules/simulator.js
import { getEffectiveness, getAbilityModifiers, applyDefensiveModifiers, formatMultiplierSymbol, classifySeverity } from '../../lib/type-engine/index.js';
import { loadAppData, fetchPokemonDetails } from './data.js';
import { getPokemonImageUrl, createTypePill, capitalizeWords, normalizeSearch } from './ui.js';
import { i18n } from './i18n.js';

export async function initSimulator() {
    const container = document.querySelector('#view-pro');
    if (!container) return;

    // Create the Simulator Card
    const simulatorSection = document.createElement('section');
    simulatorSection.className = 'panel';
    simulatorSection.innerHTML = `
        <div class="label-group">${i18n.t('sim_title')}</div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <!-- 1. Attacker -->
            <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted)">${i18n.t('sim_attack_type')}</label>
                <select id="sim-attack-type" class="search-input w-full !py-2.5">
                    <!-- Populated by JS -->
                </select>
            </div>

            <!-- 2. Defender -->
            <div class="space-y-1.5 relative">
                <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted)">${i18n.t('sim_defender')}</label>
                <input type="text" id="sim-defender-input" placeholder="${i18n.t('search_placeholder')}" class="search-input w-full !py-2.5" autocomplete="off">
                <ul id="sim-defender-suggestions" class="hidden absolute z-50 w-full mt-1 max-h-60 overflow-y-auto"></ul>

                <!-- Active Defender Display -->
                <div id="sim-defender-display" class="hidden mt-2 p-2 rounded-md flex items-center gap-3" style="background: var(--surface-raised); border: 1px solid var(--border)">
                    <img id="sim-defender-img" src="" class="w-10 h-10 object-contain">
                    <div class="flex-1 min-w-0">
                        <div id="sim-defender-name" class="font-bold text-sm truncate" style="color: var(--text)"></div>
                        <div id="sim-defender-types" class="flex flex-wrap gap-1"></div>
                    </div>
                    <button id="sim-clear-defender" class="icon-btn" type="button">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <!-- 3. Ability -->
            <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted)">${i18n.t('abilities')}</label>
                <select id="sim-ability-select" class="search-input w-full !py-2.5 disabled:opacity-50" disabled>
                    <option value="">${i18n.t('sim_select_pokemon')}</option>
                </select>
            </div>
        </div>

        <!-- Result -->
        <div id="sim-result-container" class="mt-5 p-4 rounded-md hidden" style="background: var(--surface-raised); border: 1px solid var(--border)">
            <div class="flex flex-wrap items-center gap-4">
                <div class="text-center">
                    <div class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-muted)">${i18n.t('sim_raw_matchup')}</div>
                    <div id="sim-raw-value" class="mult-badge mult-neutral">1×</div>
                </div>
                <div id="sim-modifier-arrow" class="hidden text-lg" style="color: var(--text-muted)" aria-hidden="true">→</div>
                <div id="sim-effective-wrap" class="hidden text-center">
                    <div class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-muted)">${i18n.t('sim_effective_result')}</div>
                    <div id="sim-result-value" class="mult-badge mult-neutral">1×</div>
                </div>
            </div>
            <div id="sim-result-text" class="mt-3 text-sm" style="color: var(--text-muted)"></div>
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
    simEffectiveness = appData.effectiveness;
}

let selectedPokemon = null;
let simEffectiveness = null;

/**
 * Re-renders the ability <select> labels and the current result's
 * ability description in the active language, without a new PokeAPI
 * fetch (reuses the already-cached `defenderDetails`). The language
 * toggle re-runs displayAnalysis/refreshProView but never re-invoked
 * initSimulator, so without this the Ability Interaction Checker kept
 * showing whichever language was active when a defender was selected —
 * found via QA toggling EN/ES with a defender already picked.
 */
export function refreshSimulatorLanguage() {
    // The attack-type options never change (always all 18 types), so
    // relabeling each option's textContent in place — rather than
    // rebuilding the <select> — keeps the current selection intact for
    // free and doesn't depend on a defender being picked yet.
    const attackSelect = document.getElementById('sim-attack-type');
    if (attackSelect) {
        Array.from(attackSelect.options).forEach(opt => {
            opt.textContent = i18n.tType(opt.value);
        });
    }

    if (!selectedPokemon) return;

    const abilitySelect = document.getElementById('sim-ability-select');
    if (abilitySelect && defenderDetails?.abilities) {
        const currentValue = abilitySelect.value;
        abilitySelect.innerHTML = defenderDetails.abilities.map(a => {
            const name = i18n.tAbility(a.ability.name);
            return `<option value="${a.ability.name}">${name}</option>`;
        }).join('');
        abilitySelect.value = currentValue;
    }

    if (attackSelect && abilitySelect && !abilitySelect.disabled && simEffectiveness) {
        runSimulation(attackSelect.value, selectedPokemon, abilitySelect.value, simEffectiveness);
    }
}

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
                <li data-name="${p.name}" class="flex items-center gap-3">
                    <img src="${getPokemonImageUrl(p, appData.imageFixes)}" class="w-8 h-8 object-contain"
                         onerror="handleSearchImageError(this, ${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                    <span class="text-sm font-bold" style="color: var(--text)">${p.displayName}</span>
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
    document.getElementById('sim-defender-types').innerHTML = pokemon.types.map(t => createTypePill(t, appData.contrast, 'type-pill-sm')).join('');

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
    const rawValueEl = document.getElementById('sim-raw-value');
    const arrowEl = document.getElementById('sim-modifier-arrow');
    const effectiveWrapEl = document.getElementById('sim-effective-wrap');
    const resultValue = document.getElementById('sim-result-value');
    const resultText = document.getElementById('sim-result-text');

    resultContainer.classList.remove('hidden');

    // 1. Base type effectiveness (raw matchup)
    const rawModifier = getEffectiveness(attackType, pokemon.types[0], effectiveness) *
        (pokemon.types[1] ? getEffectiveness(attackType, pokemon.types[1], effectiveness) : 1);
    let modifier = rawModifier;

    // 2. Ability modifier — same engine as Team Builder (applyDefensiveModifiers),
    // so a single ability behaves identically here and in analysis.js. The
    // simulator has no full-HP/contact input yet, so `context` stays empty:
    // any Multiscale/Shadow Shield/Tera Shell/Fluffy-contact component is
    // never assumed to apply (see modifiers.js "Battle context").
    const abilityMods = getAbilityModifiers(abilityName);
    let abilityTriggered = null;
    let conditionalNote = null;

    if (abilityMods.length > 0) {
        const defensiveMods = abilityMods.filter(m => m.type === 'All' || m.type.toLowerCase() === attackType.toLowerCase());

        if (defensiveMods.length > 0) {
            modifier = applyDefensiveModifiers({ [attackType]: rawModifier }, defensiveMods, [attackType])[attackType];

            // Describe whichever matching modifier could plausibly explain
            // the (possibly unchanged) number: an unconditional one, or a
            // conditional one whose flag is actually relevant right now.
            abilityTriggered = defensiveMods.find(mod => {
                if (mod.requiresContext) return false; // never confirmed here
                if (mod.blockNonSE) return rawModifier <= 1;
                if (mod.superEffectiveOnly) return rawModifier >= 2;
                return true;
            }) || null;

            // A conditional modifier (Multiscale/Tera Shell/Fluffy's contact
            // half/...) never applies here — be honest about why the number
            // didn't reflect it, instead of pretending the condition holds.
            const unconfirmed = defensiveMods.find(mod => mod.requiresContext);
            if (unconfirmed) {
                const noteKey = unconfirmed.requiresContext === 'fullHp' ? 'requires_full_hp' : 'requires_contact';
                conditionalNote = `${i18n.t(noteKey)} — ${i18n.t('condition_not_confirmed')}`;
            }
        }

        // Show offensive ability description even if it doesn't affect the multiplier
        if (!abilityTriggered) {
            const offensiveMod = abilityMods.find(m => m.type === 'Offensive');
            if (offensiveMod) abilityTriggered = { ...offensiveMod, offensiveOnly: true };
        }
    }

    // 3. Render raw -> effective breakdown
    const changed = modifier !== rawModifier;
    rawValueEl.textContent = formatMultiplierSymbol(rawModifier);
    rawValueEl.className = `mult-badge ${classifySeverity(rawModifier)}`;

    arrowEl.classList.toggle('hidden', !changed);
    effectiveWrapEl.classList.toggle('hidden', !changed);
    if (changed) {
        resultValue.textContent = formatMultiplierSymbol(modifier);
        resultValue.className = `mult-badge ${classifySeverity(modifier)}`;
    }

    // 4. Render description + damage estimate
    let descHTML = '';
    const abilityDisplayName = i18n.tAbility(abilityName);
    if (abilityTriggered && !abilityTriggered.offensiveOnly) {
        descHTML += `<p class="mb-1"><span class="font-bold" style="color: var(--text)">${abilityDisplayName}</span>: ${i18n.t(abilityTriggered.descriptionKey)}</p>`;
    } else if (abilityTriggered?.offensiveOnly) {
        descHTML += `<p class="mb-1" style="color: var(--warning)"><span class="font-bold">${abilityDisplayName}</span>: ${i18n.t(abilityTriggered.descriptionKey)}</p>`;
    } else {
        descHTML += `<p class="mb-1">${i18n.t('sim_standard_effectiveness')}</p>`;
    }

    if (conditionalNote) {
        descHTML += `<p class="italic mt-1">${conditionalNote}</p>`;
    }

    const estimate = estimateDamageRange(pokemon, modifier);
    if (estimate) {
        descHTML += `<p class="text-xs mt-1" style="color: var(--text-muted)">${i18n.t('sim_damage_estimate').replace('{min}', estimate.minPct).replace('{max}', estimate.maxPct)}</p>`;
    }

    resultText.innerHTML = descHTML;
}
