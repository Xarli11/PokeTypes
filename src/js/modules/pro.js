import { loadTeam, saveTeam, addPokemonToSlot, removePokemonFromSlot, setAbility, setNature, setItem, getTeam } from './team.js';
import { loadAppData } from './data.js';
import { analyzeTeamDefense, getThreatAlerts, analyzeTeamRoles } from './analysis.js';
import { createTypePill, getPokemonImageUrl, capitalizeWords, normalizeSearch } from './ui.js';
import { i18n } from './i18n.js';
import { initSimulator } from './simulator.js';
import { encodeTeamPayload, decodeTeamPayload } from '../../lib/share-team.js';
import { getPokemonDefenseBreakdown, formatMultiplierSymbol } from '../../lib/type-engine/index.js';

// State
let activeSlotIndex = -1;
let deleteSlotIndex = -1;
let allPokemon = [];
let contrastData = {};
let appData = null; 

const NATURES = [
    'hardy', 'lonely', 'brave', 'adamant', 'naughty',
    'bold', 'docile', 'relaxed', 'impish', 'lax',
    'timid', 'hasty', 'serious', 'jolly', 'naive',
    'modest', 'mild', 'quiet', 'bashful', 'rash',
    'calm', 'gentle', 'sassy', 'careful', 'quirky'
];

export async function initProMode() {
    setupModeToggling();

    try {
        appData = await loadAppData();
        allPokemon = appData.pokemonList;
        contrastData = appData.contrast;
        await restoreTeamFromURL();
        renderTeamGrid();
        initSimulator();
    } catch (e) {
        console.error("Pro mode init failed", e);
    }

    setupSearchModal();
    setupDeleteModal();
    setupMemberConfigModal();
}

export function refreshProView() {
    renderTeamGrid();
}

function setupModeToggling() {
    const simpleView = document.getElementById('view-simple');
    const proView = document.getElementById('view-pro');
    const toggleSimple = document.getElementById('toggle-simple');
    const togglePro = document.getElementById('toggle-pro');

    function setMode(mode) {
        if (mode === 'simple') {
            simpleView.classList.remove('hidden');
            proView.classList.add('hidden');

            toggleSimple.classList.add('mode-btn-active');
            togglePro.classList.remove('mode-btn-active');

            localStorage.setItem('poketypes_mode', 'simple');
        } else {
            simpleView.classList.add('hidden');
            proView.classList.remove('hidden');

            togglePro.classList.add('mode-btn-active');
            toggleSimple.classList.remove('mode-btn-active');

            localStorage.setItem('poketypes_mode', 'pro');
            renderTeamGrid();
        }
    }

    if (toggleSimple && togglePro) {
        toggleSimple.addEventListener('click', () => setMode('simple'));
        togglePro.addEventListener('click', () => setMode('pro'));

        const savedMode = localStorage.getItem('poketypes_mode') || 'simple';
        if (savedMode === 'pro') {
            setMode('pro');
        }
    }
}

function renderTeamGrid() {
    const team = loadTeam();
    const container = document.getElementById('team-grid');
    if (!container) return;

    // Update Counter
    const count = team.filter(p => p !== null).length;
    const counterEl = document.getElementById('team-count');
    if (counterEl) {
        const pokemonLabel = i18n.t('stat_hp') === 'PS' ? 'Pokémon' : 'Pokemon';
        counterEl.textContent = `${count}/6 ${pokemonLabel}`;
    }

    container.innerHTML = team.map((member, index) => {
        if (!member) {
            return `
            <div onclick="window.openSearchModal(${index})" class="team-slot-empty cursor-pointer panel border-dashed flex flex-col items-center justify-center h-28 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--text-muted)">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="mt-2 text-[10px] uppercase font-bold tracking-wider" style="color: var(--text-muted)">${i18n.t('pro_add_pokemon')}</span>
            </div>`;
        }

        const imageUrl = getPokemonImageUrl(member, appData?.imageFixes || {});
        const typePills = member.types.map(t => createTypePill(t, contrastData)).join('');
        const abilityLabel = member.ability ? i18n.tAbility(member.ability.toLowerCase().replace(/ /g, '-')) : i18n.t('no_ability');
        const itemLabel = member.item ? (appData?.items?.[member.item]?.[i18n.currentLang] || appData?.items?.[member.item]?.en) : i18n.t('no_item');

        return `
        <div class="team-slot-filled relative panel !p-2.5 flex items-center gap-2.5 h-24 transition-all group">
            <button onclick="window.openDeleteModal(event, ${index})" class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-white bg-red-500 hover:bg-red-600 transition-all z-10" title="${i18n.t('btn_remove')}" aria-label="${i18n.t('btn_remove')}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <img src="${imageUrl}" class="w-11 h-11 object-contain shrink-0" loading="lazy" alt="${member.name}">

            <div class="flex-1 min-w-0">
                <div class="font-bold text-xs truncate" style="color: var(--text)">${capitalizeWords(member.name)}</div>
                <div class="flex gap-1 mt-1 scale-90 origin-left">${typePills}</div>
                <div class="text-[10px] mt-1 truncate" style="color: var(--text-muted)" title="${abilityLabel} · ${itemLabel}">${abilityLabel} · ${itemLabel}</div>
            </div>

            <button onclick="window.openMemberConfig(${index})" class="icon-btn shrink-0" title="${i18n.t('configure_btn')}" aria-label="${i18n.t('configure_btn')} ${capitalizeWords(member.name)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>`;
    }).join('');

    renderTeamAnalysis(team);
}

function renderTeamAnalysis(team) {
    const analysisSection = document.getElementById('pro-analysis-section');
    if (!analysisSection) return;

    if (team.every(p => p === null)) {
        analysisSection.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8">
                <p class="text-sm text-center max-w-sm" style="color: var(--text-muted)">${i18n.t('pro_analysis_placeholder')}</p>
            </div>`;
        return;
    }

    if (!appData) return;

    const analysis = analyzeTeamDefense(team, appData.types, appData.effectiveness);
    const alerts = getThreatAlerts(analysis);
    const roles = analyzeTeamRoles(team, appData.pokemonList);

    let html = `<div class="p-3 sm:p-4 text-left">`;

    // Threat pressure — deterministic, derived straight from analysis.matrix
    // for the types getThreatAlerts flagged. No inferred strategy/AI copy.
    if (alerts.length > 0) {
        html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">`;
        alerts.forEach(alert => {
            const data = analysis.matrix[alert.messageType];
            const pill = createTypePill(alert.messageType, contrastData);
            const isDanger = alert.type === 'danger';
            const accentVar = isDanger ? '--danger' : '--warning';

            html += `
                <div class="flex items-center gap-3 px-3 py-2.5 rounded-md" style="background: color-mix(in srgb, var(${accentVar}) 8%, transparent); border: 1px solid color-mix(in srgb, var(${accentVar}) 40%, transparent)">
                    <div class="scale-90 shrink-0">${pill}</div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs font-bold uppercase tracking-wide" style="color: var(${accentVar})">${i18n.t('pressure_title', { type: i18n.tType(alert.messageType) })}</div>
                        <div class="text-xs" style="color: var(--text-muted)">${i18n.t('pressure_detail', { weak: data.weak, resist: data.resist, immune: data.immune })}</div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    // Team Defense — Type / Weak / Resist / Immune, all 18 types, canonical order.
    html += `
        <div class="label-group">${i18n.t('team_defense_title')}</div>
        <div class="rounded-md overflow-hidden mb-5" style="border: 1px solid var(--border)">
            <div class="grid gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style="grid-template-columns: 1fr repeat(3, 2.5rem); color: var(--text-muted); border-bottom: 1px solid var(--border)">
                <span></span>
                <span class="text-center">${i18n.t('pro_weak')}</span>
                <span class="text-center">${i18n.t('pro_resist')}</span>
                <span class="text-center">${i18n.t('pro_immune')}</span>
            </div>
    `;
    appData.types.forEach((type, i) => {
        const data = analysis.matrix[type];
        const pill = createTypePill(type, contrastData);
        const isLast = i === appData.types.length - 1;
        const highlighted = data.weak >= 3;

        html += `
            <div class="grid gap-2 items-center px-3 py-1.5 text-sm" style="grid-template-columns: 1fr repeat(3, 2.5rem); ${isLast ? '' : 'border-bottom: 1px solid var(--border);'} ${highlighted ? 'background: color-mix(in srgb, var(--danger) 6%, transparent)' : ''}">
                <div class="scale-90 origin-left">${pill}</div>
                <span class="text-center font-mono font-bold" style="color: ${data.weak > 0 ? 'var(--danger)' : 'var(--text-muted)'}">${data.weak || '–'}</span>
                <span class="text-center font-mono font-bold" style="color: ${data.resist > 0 ? 'var(--success)' : 'var(--text-muted)'}">${data.resist || '–'}</span>
                <span class="text-center font-mono font-bold" style="color: var(--text-muted)">${data.immune || '–'}</span>
            </div>
        `;
    });
    html += `</div>`;

    // Team roles — secondary, compact, never competing visually with Team Defense.
    html += `
        <div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted)">${i18n.t('pro_roles_title')}</div>
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
            ${renderRoleCard('role_speedster', roles.role_speedster)}
            ${renderRoleCard('role_phys_sweeper', roles.role_phys_sweeper)}
            ${renderRoleCard('role_spec_sweeper', roles.role_spec_sweeper)}
            ${renderRoleCard('role_phys_wall', roles.role_phys_wall)}
            ${renderRoleCard('role_spec_wall', roles.role_spec_wall)}
        </div>

        <div class="flex justify-end pt-3" style="border-top: 1px solid var(--border)">
            <button id="share-team-btn" class="flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors" style="background: var(--surface-raised); border: 1px solid var(--border); color: var(--text)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                ${i18n.t('pro_share_team')}
            </button>
        </div>
    </div>`;

    analysisSection.innerHTML = html;

    document.getElementById('share-team-btn')?.addEventListener('click', shareTeamURL);
}

function renderRoleCard(key, count) {
    const dim = count === 0;
    return `
        <div class="flex flex-col items-center justify-center py-2 rounded-md" style="background: var(--surface-raised); border: 1px solid var(--border); ${dim ? 'opacity: 0.5' : ''}">
            <span class="text-base font-bold font-mono" style="color: var(--text)">${count}</span>
            <span class="text-[9px] font-bold text-center uppercase tracking-wide leading-tight px-1" style="color: var(--text-muted)">${i18n.t(key)}</span>
        </div>
    `;
}

// Global functions for onclick handlers
window.updateTeamAbility = (index, ability) => {
    setAbility(index, ability);
    renderTeamGrid();
    renderMemberConfigPreview(index);
};

window.updateTeamNature = (index, nature) => {
    setNature(index, nature);
    renderTeamAnalysis(loadTeam());
};

window.updateTeamItem = (index, item) => {
    setItem(index, item);
    renderTeamGrid();
    renderMemberConfigPreview(index);
};

// --- Member configuration modal (ability / nature / item) ---
// Moved out of the team slot card itself — a slot only shows a compact
// summary; editing happens here so slots stay small (see renderTeamGrid).

let configSlotIndex = -1;

function renderMemberConfigPreview(index) {
    const preview = document.getElementById('member-config-preview');
    if (!preview || !appData) return;

    const member = loadTeam()[index];
    if (!member) return;

    const { raw, effective } = getPokemonDefenseBreakdown(member, appData.types, appData.effectiveness);
    const diffs = appData.types.filter(type => raw[type] !== effective[type]);

    if (diffs.length === 0) {
        preview.innerHTML = '';
        preview.classList.add('hidden');
        return;
    }

    preview.classList.remove('hidden');
    preview.innerHTML = `
        <div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color: var(--text-muted)">${i18n.t('raw_matchup')} → ${i18n.t('effective_result')}</div>
        <div class="flex flex-col gap-1">
            ${diffs.map(type => `
                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="font-sans font-bold uppercase w-16 shrink-0" style="color: var(--text-muted)">${i18n.tType(type)}</span>
                    <span style="color: var(--text-muted)">${formatMultiplierSymbol(raw[type])}</span>
                    <span aria-hidden="true">→</span>
                    <span class="font-bold" style="color: var(--accent)">${formatMultiplierSymbol(effective[type])}</span>
                </div>
            `).join('')}
        </div>
    `;
}

window.openMemberConfig = (index) => {
    configSlotIndex = index;
    const member = loadTeam()[index];
    if (!member || !appData) return;

    const body = document.getElementById('member-config-body');
    const imageUrl = getPokemonImageUrl(member, appData.imageFixes || {});
    const typePills = member.types.map(t => createTypePill(t, contrastData)).join('');

    const abilityOptions = member.abilities
        ? Object.values(member.abilities).map(abilityName => {
            const selected = member.ability === abilityName ? 'selected' : '';
            const localizedAbility = i18n.tAbility(abilityName.toLowerCase().replace(/ /g, '-'));
            return `<option value="${abilityName}" ${selected}>${localizedAbility}</option>`;
        }).join('')
        : '';

    const natureOptions = NATURES.map(n => {
        const selected = member.nature === n ? 'selected' : '';
        return `<option value="${n}" ${selected}>${i18n.t('nature_' + n)}</option>`;
    }).join('');

    const currentLang = i18n.currentLang;
    const itemMap = appData.items || {};
    const itemEntries = Object.entries(itemMap)
        .map(([slug, names]) => ({ slug, name: names[currentLang] || names.en }))
        .sort((a, b) => a.name.localeCompare(b.name));
    const itemOptions = itemEntries.map(item => {
        const selected = member.item === item.slug ? 'selected' : '';
        return `<option value="${item.slug}" ${selected}>${item.name}</option>`;
    }).join('');

    body.innerHTML = `
        <div class="flex items-center gap-3 pb-3" style="border-bottom: 1px solid var(--border)">
            <img src="${imageUrl}" class="w-12 h-12 object-contain shrink-0" alt="${member.name}">
            <div class="min-w-0">
                <div class="font-bold text-sm truncate" style="color: var(--text)">${capitalizeWords(member.name)}</div>
                <div class="flex gap-1 mt-1">${typePills}</div>
            </div>
        </div>

        <div>
            <label class="text-xs font-bold uppercase tracking-wide block mb-1" style="color: var(--text-muted)" for="config-ability-select">${i18n.t('abilities')}</label>
            <select id="config-ability-select" class="search-input !py-2 !text-sm">${abilityOptions}</select>
        </div>

        <div>
            <label class="text-xs font-bold uppercase tracking-wide block mb-1" style="color: var(--text-muted)" for="config-nature-select">${i18n.t('pro_nature')}</label>
            <select id="config-nature-select" class="search-input !py-2 !text-sm">
                <option value="" ${!member.nature ? 'selected' : ''}>---</option>
                ${natureOptions}
            </select>
        </div>

        <div>
            <label class="text-xs font-bold uppercase tracking-wide block mb-1" style="color: var(--text-muted)" for="config-item-select">${i18n.t('pro_item')}</label>
            <select id="config-item-select" class="search-input !py-2 !text-sm">
                <option value="" ${!member.item ? 'selected' : ''}>---</option>
                ${itemOptions}
            </select>
        </div>

        <div id="member-config-preview" class="hidden"></div>
    `;

    document.getElementById('config-ability-select')?.addEventListener('change', (e) => window.updateTeamAbility(configSlotIndex, e.target.value));
    document.getElementById('config-nature-select')?.addEventListener('change', (e) => window.updateTeamNature(configSlotIndex, e.target.value));
    document.getElementById('config-item-select')?.addEventListener('change', (e) => window.updateTeamItem(configSlotIndex, e.target.value));

    renderMemberConfigPreview(index);

    const modal = document.getElementById('member-config-modal');
    const backdrop = document.getElementById('member-config-backdrop');
    const panel = document.getElementById('member-config-panel');

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95', 'translate-y-full');
        panel.classList.add('opacity-100', 'scale-100', 'translate-y-0');
    });
};

function setupMemberConfigModal() {
    const modal = document.getElementById('member-config-modal');
    const backdrop = document.getElementById('member-config-backdrop');
    const panel = document.getElementById('member-config-panel');
    const closeBtn = document.getElementById('close-member-config');
    if (!modal || !closeBtn) return;

    const closeModal = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
        panel.classList.add('opacity-0', 'scale-95', 'translate-y-full');
        setTimeout(() => {
            modal.classList.add('hidden');
            configSlotIndex = -1;
        }, 200);
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
}

window.openSearchModal = (index) => {
    activeSlotIndex = index;
    const modal = document.getElementById('search-modal');
    const backdrop = document.getElementById('search-backdrop');
    const panel = document.getElementById('search-panel');
    const input = document.getElementById('pro-search-input');
    
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
        input.focus();
    });
};

window.openDeleteModal = (e, index) => {
    e.stopPropagation();
    deleteSlotIndex = index;
    const modal = document.getElementById('delete-modal');
    const backdrop = document.getElementById('delete-backdrop');
    const panel = document.getElementById('delete-panel');
    
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
    });
}

function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const backdrop = document.getElementById('delete-backdrop');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    const panel = document.getElementById('delete-panel');

    if (!modal || !cancelBtn || !confirmBtn) return;

    const closeModal = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.remove('opacity-100', 'scale-100');
        panel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            deleteSlotIndex = -1;
        }, 200);
    };

    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    confirmBtn.addEventListener('click', () => {
        if (deleteSlotIndex > -1) {
            removePokemonFromSlot(deleteSlotIndex);
            renderTeamGrid();
        }
        closeModal();
    });
}

function setupSearchModal() {
    const modal = document.getElementById('search-modal');
    const backdrop = document.getElementById('search-backdrop');
    const closeBtn = document.getElementById('close-search-modal');
    const panel = document.getElementById('search-panel');
    const input = document.getElementById('pro-search-input');
    const resultsContainer = document.getElementById('pro-search-results');

    if (!modal || !closeBtn || !input || !resultsContainer) return;

    const closeModal = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.remove('opacity-100', 'scale-100');
        panel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            input.value = '';
            resultsContainer.innerHTML = `<div class="py-12 text-center text-slate-400 text-sm">${i18n.t('search_placeholder')}</div>`;
        }, 200);
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    input.addEventListener('input', (e) => {
        const query = normalizeSearch(e.target.value);
        if (!query) {
            resultsContainer.innerHTML = `<div class="py-12 text-center text-slate-400 text-sm">${i18n.t('search_placeholder')}</div>`;
            return;
        }

        const matches = allPokemon.map(p => {
            const localizedName = i18n.t(p.name.toLowerCase());
            const displayName = localizedName !== p.name.toLowerCase() ? localizedName : capitalizeWords(p.name);
            return {
                ...p,
                displayName,
                searchName: normalizeSearch(localizedName + " " + p.name)
            };
        }).filter(p => p.searchName.includes(query));

        matches.sort((a, b) => {
            const aStarts = a.displayName.toLowerCase().startsWith(query);
            const bStarts = b.displayName.toLowerCase().startsWith(query);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.id - b.id;
        });

        const topMatches = matches.slice(0, 20);

        if (topMatches.length === 0) {
            resultsContainer.innerHTML = `<div class="py-12 text-center text-slate-400 text-sm">${i18n.t('none')}</div>`;
        } else {
            resultsContainer.innerHTML = topMatches.map((p) => {
                const imageUrl = getPokemonImageUrl(p, appData?.imageFixes || {});
                const typePills = p.types.map(t => createTypePill(t, contrastData)).join('');
                
                return `
                    <div data-poke-name="${p.name}" 
                         class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-3 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors">
                        <img src="${imageUrl}" 
                             loading="lazy" 
                             class="w-10 h-10 object-contain"
                             onerror="handleSearchImageError(this, ${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                        <div class="flex-1">
                            <div class="font-bold text-slate-800 dark:text-white">${p.displayName}</div>
                            <div class="text-xs text-slate-400">#${p.id}</div>
                        </div>
                        <div class="flex gap-1 scale-90">
                            ${typePills}
                        </div>
                    </div>
                `;
            }).join('');
        }
    });

    resultsContainer.addEventListener('click', async (e) => {
        const item = e.target.closest('[data-poke-name]');
        if (!item) return;

        const name = item.dataset.pokeName;

        // Ensure we have the full pokedex data (with stats and abilities)
        // before adding to the slot
        const { loadPokedex } = await import('./data.js');
        const fullDex = await loadPokedex();
        const pokemon = fullDex.find(p => p.name === name);

        if (pokemon) {
            addPokemonToSlot(activeSlotIndex, pokemon);
            renderTeamGrid();
            closeModal();
        }
    });
}

// --- Share Team URL ---
// Payload encode/decode/validation lives in ../../lib/share-team.js (pure,
// unit tested). See that file for the Tera policy this sprint decided on.

function serializeTeam(team) {
    return encodeTeamPayload(team);
}

async function restoreTeamFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('team');
    if (!encoded) return;

    const compact = decodeTeamPayload(encoded);
    if (!compact) {
        console.error('Invalid or unsupported shared team link, ignoring');
        return;
    }

    try {
        const { loadPokedex } = await import('./data.js');
        const fullDex = await loadPokedex();

        compact.forEach((slot, index) => {
            if (!slot) return;
            const pokemon = fullDex.find(p => p.id === slot.id || (p.apiName || p.name) === slot.n);
            if (pokemon) {
                addPokemonToSlot(index, pokemon);
                if (slot.a) setAbility(index, slot.a);
                if (slot.nat) setNature(index, slot.nat);
                if (slot.i) setItem(index, slot.i);
            }
        });

        // Remove ?team param from URL without reload
        const url = new URL(window.location);
        url.searchParams.delete('team');
        window.history.replaceState({}, '', url);

        renderTeamGrid();
    } catch (e) {
        console.error('Failed to restore team from URL', e);
    }
}

async function shareTeamURL() {
    const btn = document.getElementById('share-team-btn');
    if (!btn) return;

    const team = loadTeam();
    const encoded = serializeTeam(team);

    // Always link to home page, regardless of current route
    const url = new URL(window.location.origin + '/');
    url.searchParams.set('team', encoded);
    url.searchParams.set('mode', 'pro');
    const shareUrl = url.toString();

    const original = btn.innerHTML;
    const showSuccess = () => {
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ${i18n.t('pro_share_copied')}`;
        btn.classList.add('bg-emerald-200', 'dark:bg-emerald-800');
        setTimeout(() => {
            const currentBtn = document.getElementById('share-team-btn');
            if (currentBtn) {
                currentBtn.innerHTML = original;
                currentBtn.classList.remove('bg-emerald-200', 'dark:bg-emerald-800');
            }
        }, 2000);
    };

    try {
        await navigator.clipboard.writeText(shareUrl);
        showSuccess();
    } catch {
        // Fallback for non-secure contexts
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand('copy');
            showSuccess();
        } catch {
            prompt(i18n.t('pro_share_team'), shareUrl);
        }
        document.body.removeChild(ta);
    }
}
