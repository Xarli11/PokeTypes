import { getEffectiveness, getAbilityModifiers } from './calculator.js';
import { i18n } from './i18n.js';

const TYPE_COLORS = {
    Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Grass: '#7AC74C',
    Electric: '#F7D02C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1',
    Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
    Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Steel: '#B7B7CE',
    Fairy: '#D685AD', Dark: '#705746'
};

export function normalizeSearch(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/'/g, '')
        .trim();
}

export function createTypePill(type, contrastData) {
    const textColorClass = contrastData[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
    const translatedType = i18n.tType(type);
    return `<span class="type-pill bg-type-${type.toLowerCase()} ${textColorClass}">
        ${translatedType}
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

export function renderEffectivenessCard(cardElement, labelKey, typeList, noContentKey, iconType, contrastData) {
    let contentHTML = `
        <div class="label-group"> ${getEffectivenessIcon(iconType)} <span>${i18n.t(labelKey)}</span></div>
        <div class="type-pills-container">
    `;
    if (typeList.length) {
        contentHTML += typeList.map(type => createTypePill(type, contrastData)).join('');
    } else {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${i18n.t(noContentKey || 'none')}</span>`;
    }
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderSplitEffectivenessCard(cardElement, labelKey, x4List, x2List, noContentKey, iconType, contrastData, x8List = null) {
    let contentHTML = `<div class="label-group">${getEffectivenessIcon(iconType)} <span>${i18n.t(labelKey)}</span></div>`;
    contentHTML += `<div class="flex flex-col gap-4">`;

    if (x8List && x8List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-red-700 text-white font-black text-xs shadow-cyber-glow">x8</span>
            <div class="type-pills-container">${x8List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if (x4List && x4List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-red-600 text-white font-black text-xs">x4</span>
            <div class="type-pills-container">${x4List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if (x2List && x2List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-orange-500 text-white font-black text-xs">x2</span>
            <div class="type-pills-container">${x2List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if ((!x8List || !x8List.length) && (!x4List || !x4List.length) && (!x2List || !x2List.length)) {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${i18n.t(noContentKey || 'none')}</span>`;
    }
    
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderSplitResistanceCard(cardElement, labelKey, x025List, x05List, noContentKey, iconType, contrastData, x0125List = null) {
    let contentHTML = `<div class="label-group">${getEffectivenessIcon(iconType)} <span>${i18n.t(labelKey)}</span></div>`;
    contentHTML += `<div class="flex flex-col gap-4">`;

    if (x0125List && x0125List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-emerald-800 text-white font-black text-xs shadow-cyber-glow">x0.125</span>
            <div class="type-pills-container">${x0125List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if (x025List && x025List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-green-600 text-white font-black text-xs">x0.25</span>
            <div class="type-pills-container">${x025List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if (x05List && x05List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-xs">x0.5</span>
            <div class="type-pills-container">${x05List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if ((!x0125List || !x0125List.length) && (!x025List || !x025List.length) && (!x05List || !x05List.length)) {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${i18n.t(noContentKey || 'none')}</span>`;
    }
    
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderBadgedCard(cardElement, labelKey, typeList, noContentKey, iconType, badgeText, badgeColorClass, contrastData) {
    let contentHTML = `<div class="label-group">${getEffectivenessIcon(iconType)} <span>${i18n.t(labelKey)}</span></div>`;
    contentHTML += `<div class="flex flex-col gap-4">`;

    if (typeList && typeList.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="px-2 h-8 min-w-[2rem] flex items-center justify-center rounded-lg ${badgeColorClass} text-white font-black text-xs">${badgeText}</span>
            <div class="type-pills-container">${typeList.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    } else {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${i18n.t(noContentKey || 'none')}</span>`;
    }

    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderDualImmunities(container, labelKey, pairs, contrastData) {
    if (!pairs || pairs.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    let contentHTML = `<div class="label-group">
        <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>
        <span>${i18n.t(labelKey)}</span>
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
        const translatedType = i18n.tType(type);
        tableHTML += `<th class="bg-type-${type.toLowerCase()} ${textColorClass} !text-[10px] min-w-[40px]">${translatedType.substring(0, 3)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    types.forEach(attackingType => {
        const translatedAttacking = i18n.tType(attackingType);
        tableHTML += `<tr><td class="font-bold text-slate-700 text-left pr-4">${translatedAttacking}</td>`;
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
        let firstOptionKey = 'type_1';
        if (id === 'type2-select') firstOptionKey = 'type_2';
        if (id === 'type3-select') firstOptionKey = 'type_3';

        select.innerHTML = `<option value="" data-i18n="${firstOptionKey}">${i18n.t(firstOptionKey)}</option>`;

        types.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = i18n.tType(type);
            select.appendChild(opt);
        });
    });
}
/**
 * Centralized error handler for search suggestion images.
 * Provides a robust multi-stage fallback for HQ artwork.
 */
export function handleSearchImageError(img, id, name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const isVariety = slug.includes('-') && !['ho-oh', 'porygon-z', 'jangmo-o', 'hakamo-o', 'kommo-o', 'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu'].includes(slug);

    // Stage 1: Try Official Artwork by SLUG or ID depending on variety
    if (!img.dataset.stage || img.dataset.stage === '0') {
        img.dataset.stage = '1';
        if (isVariety) {
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${slug}.png`;
        } else {
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        }
        return;
    }
    
    // Stage 2: Try the other one (ID or SLUG)
    if (img.dataset.stage === '1') {
        img.dataset.stage = '2';
        if (isVariety) {
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        } else {
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${slug}.png`;
        }
        return;
    }
    
    // Stage 3: Final Fallback to Pokeball
    img.src = '/pokeball.png';
    img.onerror = null;
}

export function getPokemonImageUrl(p, imageFixes = {}) {
    const apiName = p.apiName || p.name?.toLowerCase();
    const fix = imageFixes[apiName];

    // Priority 1: Custom Fixes (Manual URLs or slugs)
    if (fix) {
        if (fix.type === 'slug' || fix.type === 'id') {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fix.value}.png`;
        } else if (fix.type === 'url') {
            return fix.value;
        }
    }

    // Prepare slugs for lookups
    const baseSlug = (p.apiName || p.slug || p.name?.toLowerCase() || '').replace(/\s+/g, '-');
    const cleanSlug = baseSlug.replace(/[^a-z0-9-]/g, '');

    // Priority 2: Official Artwork by ID
    if (p.id) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
    }

    // Priority 3: Official Artwork by Slug
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${cleanSlug}.png`;
}

export function renderPokemonHero(container, pokemon, contrastData, imageFixes = {}) {
    if (!pokemon) {
        container.innerHTML = '';
        container.style.background = '';
        return;
    }

    // Type-reactive gradient background
    const primaryColor = TYPE_COLORS[pokemon.types[0]] || '#6366f1';
    const secondaryColor = TYPE_COLORS[pokemon.types[1]] || primaryColor;
    container.style.background = pokemon.types[1]
        ? `linear-gradient(145deg, ${primaryColor}22 0%, ${secondaryColor}18 100%)`
        : `radial-gradient(ellipse at 65% 35%, ${primaryColor}30 0%, transparent 68%)`;

    const slug = pokemon.spriteSlug || pokemon.apiName;
    const fix = imageFixes[pokemon.apiName];
    
    const localizedName = i18n.t(pokemon.name.toLowerCase());
    const displayName = localizedName !== pokemon.name.toLowerCase() ? localizedName : capitalizeWords(pokemon.name);
    
    const typePills = pokemon.types.map(t => createTypePill(t, contrastData)).join('');

    const baseSlug = (pokemon.apiName || pokemon.slug || pokemon.name?.toLowerCase() || '').replace(/\s+/g, '-');
    const cleanSlug = baseSlug.replace(/[^a-z0-0-]/g, '');

    // Image Sources Strategy
    const officialArtById = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    const officialArtBySlug = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${cleanSlug}.png`;
    
    let primaryUrl = officialArtById;
    
    if (fix) {
        if (fix.type === 'slug' || fix.type === 'id') {
            primaryUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fix.value}.png`;
        } else {
            primaryUrl = fix.value;
        }
    }

    const sources = [
        primaryUrl,
        officialArtBySlug,
        '/pokeball.png'
    ];

    const contentHTML = `
        <div class="relative z-10 flex flex-col items-center gap-6 py-8 scale-in">
            <div class="relative group">
                <div class="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/10 rounded-full blur-3xl transform scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img id="pokemon-hero-img" 
                     src="${sources[0]}" 
                     alt="${displayName}" 
                     class="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-xl transform transition-transform duration-500 hover:scale-110"
                     onerror="this.src='${sources[1]}'; this.onerror=function(){this.src='${sources[2]}'; this.onerror=null;}">
            </div>
            
            <div class="text-center">
                <h3 class="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">${displayName}</h3>
                <div class="flex items-center justify-center gap-2 scale-110">
                    ${typePills}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = contentHTML;

    const img = container.querySelector('#pokemon-hero-img');
    let currentSourceIndex = 0;

    const tryNextSource = () => {
        currentSourceIndex++;
        if (currentSourceIndex < sources.length) {
            img.src = sources[currentSourceIndex];
        }
    };

    img.onerror = tryNextSource;
}

export function renderStats(container, stats) {
    if (!stats || !stats.length) {
        container.innerHTML = '';
        return;
    }

    const statNames = {
        'hp': i18n.t('stat_hp'),
        'attack': i18n.t('stat_atk'),
        'defense': i18n.t('stat_def'),
        'special-attack': i18n.t('stat_spa'),
        'special-defense': i18n.t('stat_spd'),
        'speed': i18n.t('stat_spe')
    };

    const contentHTML = stats.map(stat => {
        const val = stat.base_stat;
        let colorClass = 'bg-red-500';
        let targetWidth = Math.min((val / 255) * 100, 100);

        if (val >= 120) colorClass = 'bg-purple-500';
        else if (val >= 90) colorClass = 'bg-green-500';
        else if (val >= 60) colorClass = 'bg-yellow-500';

        return `
            <div class="flex items-center gap-3 text-sm">
                <span class="w-20 font-bold text-slate-500 dark:text-slate-400 text-right uppercase text-xs tracking-wider whitespace-nowrap">${statNames[stat.stat.name] || stat.stat.name}</span>
                <span class="w-8 font-mono font-bold text-slate-800 dark:text-cyber-neon text-right drop-shadow-md">${val}</span>
                <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full rounded-full ${colorClass} stat-bar shadow-cyber-glow" style="width: 0%" data-target-width="${targetWidth}%"></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = contentHTML;

    // Trigger animation after a tiny delay to allow DOM to render
    requestAnimationFrame(() => {
        setTimeout(() => {
            container.querySelectorAll('.stat-bar').forEach(bar => {
                bar.style.width = bar.dataset.targetWidth;
            });
        }, 50);
    });
}

export function renderAbilities(container, abilities) {
    if (!abilities || !abilities.length) {
        container.innerHTML = '';
        return;
    }

    const contentHTML = `
        <div class="flex items-center gap-2 mb-4 text-slate-400 dark:text-slate-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span class="text-xs font-black uppercase tracking-[0.2em]">${i18n.t('abilities')}</span>
        </div>
        <div class="grid grid-cols-1 gap-3">
            ${abilities.map(entry => {
                const name = entry.ability.displayName || capitalizeWords(entry.ability.name);
                const isHidden = entry.is_hidden;
                const description = entry.description || i18n.t('loading_desc');
                
                return `
                    <div class="group flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors shadow-sm">
                        <div class="flex items-center justify-between">
                            <span class="font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">${name}</span>
                            ${isHidden 
                                ? `<span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">${i18n.t('hidden')}</span>`
                                : ''}
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic font-medium">${description}</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = contentHTML;
}

export function renderCompetitiveData(container, data, pokemonName) {
    if (!data) {
        container.innerHTML = `<div class="text-center py-8 text-slate-400 italic">${i18n.t('comp_no_data') || 'No competitive data found'}</div>`;
        return;
    }

    const tier = data.tier || 'Untiered';
    const abilities = data.abilities ? Object.values(data.abilities).join(', ') : '---';
    const slug = pokemonName.toLowerCase().replace(/[^a-z0-0]/g, '');

    const tierColors = {
        'Uber': 'bg-red-500', 'OU': 'bg-emerald-500', 'UU': 'bg-blue-500',
        'RU': 'bg-amber-500', 'NU': 'bg-violet-500', 'PU': 'bg-slate-500',
        'LC': 'bg-pink-500', 'AG': 'bg-slate-900'
    };

    const tierColor = tierColors[tier] || 'bg-slate-400';

    container.innerHTML = `
        <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">${i18n.t('comp_analysis') || 'Strategic Analysis'}</h3>
                        <p class="text-xl font-black text-slate-900 dark:text-white">Smogon Tier & Meta</p>
                    </div>
                </div>
                
                <div class="inline-flex items-center gap-3 ${tierColor} px-4 py-2 rounded-xl text-white shadow-lg">
                    <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span class="font-black tracking-tight text-lg">${tier}</span>
                </div>
            </div>

            <div class="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20">
                <p class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">${i18n.t('comp_meta') || 'Meta Summary'}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    ${(i18n.t('comp_meta_desc') || 'This Pokemon is ranked in {tier}. Its most effective abilities are: {abilities}.')
                        .replace('{tier}', `<strong>${tier}</strong>`)
                        .replace('{abilities}', `<span class="text-emerald-600 dark:text-emerald-400 font-bold">${abilities}</span>`)}
                </p>
                
                <a href="https://www.smogon.com/dex/sv/pokemon/${slug}" target="_blank" class="inline-flex items-center gap-2 mt-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-emerald-100 dark:border-emerald-900/30">
                    ${i18n.t('comp_smogon_link') || 'Smogon Strategy'}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
        </div>
    `;
}

export function capitalizeWords(str) {
    return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function renderAbilityAlerts(container, abilities) {
    if (!abilities || !abilities.length) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    const alertsToRender = [];
    const seenKeys = new Set();

    abilities.forEach(entry => {
        const name = entry.ability.name;
        const displayName = entry.ability.displayName || capitalizeWords(name);
        const modifiers = getAbilityModifiers(name);
        
        modifiers.forEach(mod => {
            const key = `${mod.type}-${mod.modifier}-${name}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                alertsToRender.push({
                    abilityName: displayName,
                    description: mod.description,
                    type: mod.type,
                    modifier: mod.modifier
                });
            }
        });
    });

    if (alertsToRender.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    
    let contentHTML = `
        <div class="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-bold text-sm uppercase tracking-wide">${i18n.t('ability_considerations')}</span>
        </div>
    `;

    contentHTML += `<div class="grid gap-2">`;

    alertsToRender.forEach(alert => {
        contentHTML += `
            <div class="p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-sm text-slate-700 dark:text-slate-300">
                <span class="font-bold text-emerald-700 dark:text-emerald-300">${alert.abilityName}</span>: ${alert.description}
            </div>
        `;
    });

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

    const suggestedTypesHTML = advice.suggestedTypes.map(t => `<span class="font-bold text-slate-700 dark:text-slate-200">${i18n.tType(t)}</span>`).join('/');
    const suggestedMonsHTML = advice.suggestedPokemon.map(p => capitalizeWords(p.name)).join(', ');

    const threatTypeHTML = `<span class="font-bold text-red-200 border-b border-red-200/50">${i18n.tType(advice.threat)}</span>`;

    const contentHTML = `
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
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
                    <h3 class="font-bold uppercase tracking-wider text-xs text-emerald-100">${i18n.t('advisor_title')}</h3>
                </div>

                <p class="text-sm md:text-base leading-relaxed font-medium text-white/95">
                    ${i18n.t('advisor_weakness', { type: threatTypeHTML })} 
                    ${i18n.t('advisor_suggestion', { type: suggestedTypesHTML })}
                </p>
                
                <div class="mt-4 flex items-center gap-3 text-xs font-medium text-emerald-100 bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                    <span class="uppercase tracking-wide opacity-70">${i18n.t('advisor_recommended')}</span>
                    <span class="text-white">${suggestedMonsHTML}</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = contentHTML;
}