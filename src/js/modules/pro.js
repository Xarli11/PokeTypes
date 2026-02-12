import { loadTeam, addPokemonToSlot, removePokemonFromSlot, setAbility } from './team.js?v=2.22.8';
import { loadAppData } from './data.js?v=2.22.8';
import { analyzeTeamDefense, getThreatAlerts, analyzeTeamRoles } from './analysis.js?v=2.22.8';
import { createTypePill, getPokemonImageUrl, capitalizeWords } from './ui.js?v=2.22.8';
import { i18n } from './i18n.js?v=2.22.8';
import { initSimulator } from './simulator.js?v=2.22.8';

// State
let activeSlotIndex = -1;
let deleteSlotIndex = -1;
let allPokemon = [];
let contrastData = {};
let appData = null; 

export async function initProMode() {
    setupModeToggling();

    try {
        appData = await loadAppData();
        allPokemon = appData.pokemonList;
        contrastData = appData.contrast;
        renderTeamGrid();
        initSimulator(); 
    } catch (e) {
        console.error("Pro mode init failed", e);
    }

    setupSearchModal();
    setupDeleteModal();
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
            
            toggleSimple.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
            toggleSimple.classList.remove('text-slate-500', 'hover:text-slate-700');
            
            togglePro.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
            togglePro.classList.add('text-slate-500', 'hover:text-slate-700');
            
            localStorage.setItem('poketypes_mode', 'simple');
        } else {
            simpleView.classList.add('hidden');
            proView.classList.remove('hidden');
            
            togglePro.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
            togglePro.classList.remove('text-slate-500', 'hover:text-slate-700');
            
            toggleSimple.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
            toggleSimple.classList.add('text-slate-500', 'hover:text-slate-700');
            
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
    const counterEl = document.querySelector('#view-pro span.text-slate-500');
    if (counterEl) counterEl.textContent = `${count}/6 Pokemon`;

    container.innerHTML = team.map((member, index) => {
        if (!member) {
            return `
            <div onclick="window.openSearchModal(${index})" class="team-slot-empty cursor-pointer bento-card dark:bg-slate-800 dark:border-slate-700 border-dashed border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 flex flex-col items-center justify-center h-52 md:h-60 transition-all group relative">
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <span class="mt-2 text-xs font-bold text-slate-400 group-hover:text-indigo-500">${i18n.t('pro_add_pokemon')}</span>
            </div>`;
        } else {
            const imageUrl = getPokemonImageUrl(member);
            const typePills = member.types.map(t => createTypePill(t, contrastData)).join('');
            
            // Ability Dropdown Logic
            let abilitySelectHTML = '';
            if (member.abilities) {
                const options = Object.values(member.abilities).map(ability => {
                    const selected = member.ability === ability ? 'selected' : '';
                    const localizedAbility = i18n.tAbility(ability);
                    return `<option value="${ability}" ${selected}>${localizedAbility}</option>`;
                }).join('');
                
                abilitySelectHTML = `
                    <div class="mt-auto pt-3 w-full px-1">
                        <select onchange="window.updateTeamAbility(${index}, this.value)" class="w-full text-[10px] uppercase font-bold tracking-wider py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 border-none focus:ring-0 text-slate-500 dark:text-slate-400 truncate cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors appearance-none text-center">
                            ${options}
                        </select>
                    </div>
                `;
            }

            return `
            <div class="team-slot-filled relative bento-card dark:bg-slate-800 dark:border-slate-700 p-4 flex flex-col items-center h-52 md:h-60 group">
                <button onclick="window.openDeleteModal(event, ${index})" class="absolute -top-2 -right-2 p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all z-10" title="${i18n.t('btn_remove')}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <img src="${imageUrl}" class="w-20 h-20 object-contain mt-1 mb-2" loading="lazy" alt="${member.name}">
                
                <div class="text-center w-full flex-1 flex flex-col">
                    <div class="font-bold text-slate-800 dark:text-white text-sm truncate px-1">${member.name}</div>
                    <div class="flex justify-center gap-1 mt-1 flex-wrap scale-75 origin-top">
                        ${typePills}
                    </div>
                    ${abilitySelectHTML}
                </div>
            </div>`;
        }
    }).join('');

    renderTeamAnalysis(team);
}

function renderTeamAnalysis(team) {
    const analysisSection = document.getElementById('pro-analysis-section');
    if (!analysisSection) return;

    if (team.every(p => p === null)) {
        analysisSection.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 opacity-60">
                <div class="p-3 rounded-full bg-slate-100 dark:bg-slate-700 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p class="text-slate-400 text-sm text-center max-w-sm">${i18n.t('pro_analysis_placeholder')}</p>
            </div>`;
        return;
    }

    if (!appData) return;

    const analysis = analyzeTeamDefense(team, appData.types, appData.effectiveness);
    const alerts = getThreatAlerts(analysis);
    const roles = analyzeTeamRoles(team, appData.pokemonList);

    let html = `
        <div class="p-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                ${i18n.t('pro_defense_coverage')}
            </h2>
    `;

    // Alerts
    if (alerts.length > 0) {
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">`;
        alerts.forEach(alert => {
            const localizedType = i18n.tType(alert.messageType);
            const typePill = createTypePill(alert.messageType, contrastData);
            const colorClass = alert.type === 'danger' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
            const icon = alert.type === 'danger' 
                ? '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
                : '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
            
            let message = "";
            if (alert.code === 'major_weakness') {
                message = i18n.t('alert_weakness').replace('{count}', alert.count).replace('{type}', localizedType);
            } else {
                message = i18n.t('alert_no_resist').replace('{type}', localizedType);
            }

            html += `
                <div class="flex items-center gap-3 p-3 rounded-xl border ${colorClass}">
                    ${icon}
                    <span class="flex-1 font-medium text-sm">${message}</span>
                    <div class="scale-75 origin-right">${typePill}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    // Matrix Grid
    html += `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">`;
    appData.types.forEach(type => {
        const data = analysis.matrix[type];
        const pill = createTypePill(type, contrastData); 
        
        let cardClass = "bg-slate-50 dark:bg-slate-900/50";
        if (data.weak >= 3) cardClass = "bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800";
        else if (data.weak > 0 && data.resist === 0 && data.immune === 0) cardClass = "bg-orange-50 dark:bg-orange-900/20";
        
        html += `
            <div class="flex flex-col gap-2 p-3 rounded-xl ${cardClass}">
                <div class="flex justify-between items-center mb-1">
                    <div class="scale-75 origin-left">${pill}</div>
                </div>
                
                <div class="flex justify-between text-xs font-bold">
                    <div class="flex flex-col items-center flex-1" title="${i18n.t('explanation_weak')}">
                        <span class="text-red-500 mb-0.5">${i18n.t('pro_weak')}</span>
                        <span class="${data.weak > 0 ? 'text-red-600 dark:text-red-400 text-lg' : 'text-slate-300'}">${data.weak || '-'}</span>
                    </div>
                    <div class="flex flex-col items-center flex-1 border-l border-r border-slate-200 dark:border-slate-700" title="${i18n.t('explanation_resist')}">
                        <span class="text-emerald-500 mb-0.5">${i18n.t('pro_resist')}</span>
                        <span class="${data.resist > 0 ? 'text-emerald-600 dark:text-emerald-400 text-lg' : 'text-slate-300'}">${data.resist || '-'}</span>
                    </div>
                    <div class="flex flex-col items-center flex-1" title="${i18n.t('explanation_immune')}">
                        <span class="text-slate-400 mb-0.5">${i18n.t('pro_immune')}</span>
                        <span class="${data.immune > 0 ? 'text-slate-600 dark:text-slate-300 text-lg' : 'text-slate-300'}">${data.immune || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    // Role Breakdown Section
    html += `
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 border-t border-slate-100 dark:border-slate-700 pt-6">
            ${i18n.t('pro_roles_title')}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            ${renderRoleCard('role_speedster', roles.role_speedster, 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300')}
            ${renderRoleCard('role_phys_sweeper', roles.role_phys_sweeper, 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300')}
            ${renderRoleCard('role_spec_sweeper', roles.role_spec_sweeper, 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300')}
            ${renderRoleCard('role_phys_wall', roles.role_phys_wall, 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300')}
            ${renderRoleCard('role_spec_wall', roles.role_spec_wall, 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300')}
        </div>
    </div>`;

    analysisSection.innerHTML = html;
}

function renderRoleCard(key, count, colorClass) {
    const opacity = count > 0 ? 'opacity-100' : 'opacity-40 grayscale';
    return `
        <div class="flex flex-col items-center justify-center p-3 rounded-xl ${colorClass} ${opacity} transition-all">
            <span class="text-2xl font-black mb-1">${count}</span>
            <span class="text-xs font-bold text-center uppercase tracking-wide leading-tight">${i18n.t(key)}</span>
        </div>
    `;
}

// Global functions for onclick handlers
window.updateTeamAbility = (index, ability) => {
    setAbility(index, ability);
    // No need to re-render grid, just maybe analysis?
    // But analysis currently doesn't use ability yet (that's complex).
    // Just keeping state consistent.
};

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
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            resultsContainer.innerHTML = `<div class="py-12 text-center text-slate-400 text-sm">${i18n.t('search_placeholder')}</div>`;
            return;
        }

        const matches = allPokemon.map(p => {
            const localizedName = i18n.t(p.name.toLowerCase());
            return {
                ...p,
                displayName: localizedName !== p.name.toLowerCase() ? localizedName : capitalizeWords(p.name),
                searchName: (localizedName + " " + p.name).toLowerCase()
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
                const imageUrl = getPokemonImageUrl(p);
                const typePills = p.types.map(t => createTypePill(t, contrastData)).join('');
                
                return `
                    <div data-poke-name="${p.name}" 
                         class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-3 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors">
                        <img src="${imageUrl}" 
                             loading="lazy" 
                             class="w-10 h-10 object-contain"
                             onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png'">
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

    resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('[data-poke-name]');
        if (!item) return;
        
        const name = item.dataset.pokeName;
        const pokemon = allPokemon.find(p => p.name === name);
        
        if (pokemon) {
            addPokemonToSlot(activeSlotIndex, pokemon);
            renderTeamGrid();
            closeModal();
        }
    });
}
