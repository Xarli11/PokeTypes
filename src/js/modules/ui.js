import { getEffectiveness, getAbilityModifiers } from './calculator.js';

export function createTypePill(type, contrastData) {
    const textColorClass = contrastData[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
    return `<span class="type-pill bg-type-${type.toLowerCase()} ${textColorClass}">
        ${type}
    </span>`;
}

export function getEffectivenessIcon(type) {
    switch (type) {
        case 'super': 
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>`;
        case 'resist':
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>`;
        case 'immune':
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>`;
        case 'neutral':
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>`;
        default:
            return '';
    }
}

export function renderEffectivenessCard(cardElement, labelText, typeList, noContentText, iconType, contrastData) {
    let contentHTML = `
        <div class="label-group"> ${getEffectivenessIcon(iconType)} <span>${labelText}</span></div>
        <div class="type-pills-container">
    `;
    if (typeList.length) {
        contentHTML += typeList.map(type => createTypePill(type, contrastData)).join('');
    } else {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${noContentText}</span>`;
    }
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderSplitEffectivenessCard(cardElement, labelText, x4List, x2List, noContentText, iconType, contrastData) {
    let contentHTML = `<div class="label-group">${getEffectivenessIcon(iconType)} <span>${labelText}</span></div>`;
    contentHTML += `<div class="flex flex-col gap-4">`;
    
    if (x4List && x4List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white font-black text-xs">x4</span>
            <div class="type-pills-container">${x4List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if (x2List && x2List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-black text-xs">x2</span>
            <div class="type-pills-container">${x2List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if ((!x4List || !x4List.length) && (!x2List || !x2List.length)) {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${noContentText}</span>`;
    }
    
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderDualImmunities(container, labelText, pairs, contrastData) {
    if (!pairs || pairs.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    let contentHTML = `<div class="label-group">
        <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>
        <span>${labelText}</span>
    </div>`;
    
    contentHTML += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">`;
    
    pairs.forEach(pair => {
        const p1 = createTypePill(pair[0], contrastData);
        const p2 = createTypePill(pair[1], contrastData);
        
        contentHTML += `
            <div class="flex items-center justify-center gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <div class="flex scale-90 -space-x-2">
                    ${p1}${p2}
                </div>
            </div>
        `;
    });
    
    contentHTML += `</div>`;
    container.innerHTML = contentHTML;
}

export function generateTypeTable(containerId, types, effectiveness, contrastData) {
    const tableContainer = document.getElementById(containerId);
    let tableHTML = '<table><thead><tr><th></th>';

    types.forEach(type => {
        const textColorClass = contrastData[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
        tableHTML += `<th class="bg-type-${type.toLowerCase()} ${textColorClass} !text-[10px] min-w-[40px]">${type.substring(0, 3)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    types.forEach(attackingType => {
        tableHTML += `<tr><td class="font-bold text-slate-700 text-left pr-4">${attackingType}</td>`;
        types.forEach(defendingType => {
            const modifier = getEffectiveness(attackingType, defendingType, effectiveness);
            let cellClass = 'interaction-1x';
            let cellText = '';

            if (modifier === 2) { cellClass = 'interaction-2x'; cellText = '2'; }
            else if (modifier === 0.5) { cellClass = 'interaction-05x'; cellText = '½'; }
            else if (modifier === 0) { cellClass = 'interaction-0x'; cellText = '0'; }

            tableHTML += `<td class="${cellClass}">${cellText}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

export function populateSelects(ids, types) {
    ids.forEach(id => {
        const select = document.getElementById(id);
        const originalFirstOption = select.options[0].text;
        select.innerHTML = `<option value="">${originalFirstOption}</option>`;
        types.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = type;
            select.appendChild(opt);
        });
    });
}


export function renderStats(container, stats) {
    if (!stats || !stats.length) {
        container.innerHTML = '';
        return;
    }

    // Map PokeAPI stat names to shorter display names
    const statNames = {
        'hp': 'HP',
        'attack': 'Atk',
        'defense': 'Def',
        'special-attack': 'SpA',
        'special-defense': 'SpD',
        'speed': 'Spe'
    };

    const contentHTML = stats.map(stat => {
        const val = stat.base_stat;
        let colorClass = 'bg-red-500';
        let width = Math.min((val / 255) * 100, 100);

        if (val >= 120) colorClass = 'bg-purple-500';
        else if (val >= 90) colorClass = 'bg-green-500';
        else if (val >= 60) colorClass = 'bg-yellow-500';

        return `
            <div class="flex items-center gap-3 text-sm">
                <span class="w-8 font-bold text-slate-500 dark:text-slate-400 text-right uppercase text-xs tracking-wider">${statNames[stat.stat.name] || stat.stat.name}</span>
                <span class="w-8 font-bold text-slate-800 dark:text-slate-200 text-right">${val}</span>
                <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full rounded-full ${colorClass} transition-all duration-500 ease-out" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = contentHTML;
}

export function renderAbilities(container, abilities) {
    if (!abilities || !abilities.length) {
        container.innerHTML = '';
        return;
    }

    const contentHTML = abilities.map(entry => {
        const name = capitalizeWords(entry.ability.name);
        const isHidden = entry.is_hidden;
        const description = entry.description || 'Loading description...';
        
        return `
            <div class="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-700 dark:text-slate-200">${name}</span>
                    ${isHidden 
                        ? `<span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400">Hidden</span>`
                        : ''}
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-snug">${description}</p>
            </div>
        `;
    }).join('');

    container.innerHTML = contentHTML;
}

export function capitalizeWords(str) {
    return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function renderAbilityAlerts(container, abilities) {
    // Debug logging
    console.log('renderAbilityAlerts called with:', abilities);

    if (!abilities || !abilities.length) {
        console.log('No abilities provided to renderAbilityAlerts');
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    const uniqueModifiers = new Map();

    abilities.forEach(entry => {
        const name = entry.ability.name;
        const modifiers = getAbilityModifiers(name);
        
        console.log(`Checking ability "${name}":`, modifiers);

        modifiers.forEach(mod => {
            // Create a unique key to avoid duplicates
            const key = `${mod.type}-${mod.modifier}-${name}`;
            if (!uniqueModifiers.has(key)) {
                uniqueModifiers.set(key, { ...mod, abilityName: capitalizeWords(name) });
            }
        });
    });

    console.log('Unique modifiers found:', uniqueModifiers.size);

    if (uniqueModifiers.size === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    console.log('Rendering ability alerts to container');
    
    // Header
    let contentHTML = `
        <div class="mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-bold text-sm uppercase tracking-wide">Ability Considerations</span>
        </div>
    `;

    contentHTML += `</div>`;
    container.innerHTML = contentHTML;
}

export function renderTacticalAdvice(container, advice) {
    if (!advice) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const suggestedTypesHTML = advice.suggestedTypes.map(t => `<span class="font-bold text-slate-700 dark:text-slate-200">${t}</span>`).join(' or ');
    const suggestedMonsHTML = advice.suggestedPokemon.map(p => capitalizeWords(p.name)).join(', ');

    const contentHTML = `
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
            <!-- Background Decoration -->
            <svg class="absolute -right-4 -bottom-8 w-32 h-32 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
            </svg>

            <div class="relative z-10">
                <div class="flex items-center gap-2 mb-3">
                    <span class="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <svg class="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </span>
                    <h3 class="font-bold uppercase tracking-wider text-xs text-indigo-100">Smart Tactical Advisor</h3>
                </div>

                <p class="text-sm md:text-base leading-relaxed font-medium text-white/95">
                    Huge weakness to <span class="font-bold text-red-200 border-b border-red-200/50">${advice.threat}</span> detected! 
                    Consider adding a ${suggestedTypesHTML} partner.
                </p>
                
                <div class="mt-4 flex items-center gap-3 text-xs font-medium text-indigo-100 bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                    <span class="uppercase tracking-wide opacity-70">Recommended:</span>
                    <span class="text-white">${suggestedMonsHTML}</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = contentHTML;
}
