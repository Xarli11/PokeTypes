import { getEffectiveness, getAbilityModifiers, formatMultiplierSymbol } from '../../lib/type-engine/index.js';
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

/**
 * `sizeClass` is an actual smaller pill variant (e.g. 'type-pill-sm'), not
 * a transform: scale() shrink — scaling only changes paint, not layout
 * box size, so a scaled-down pill row can still silently overflow its
 * (width-constrained) container and cause page-level horizontal scroll.
 * Found exactly this in the compact Team Builder slot (see global.css).
 */
export function createTypePill(type, contrastData, sizeClass = '') {
    const textColorClass = contrastData[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
    const translatedType = i18n.tType(type);
    return `<span class="type-pill ${sizeClass} bg-type-${type.toLowerCase()} ${textColorClass}">
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

/**
 * One row inside a defense/offense multiplier section: the multiplier
 * badge (always shown, never relying on color alone) plus the type pills
 * it applies to (each keeps its own type color).
 */
function multiplierRow(mult, severityClass, typeList, contrastData) {
    if (!typeList || !typeList.length) return '';
    return `
        <div class="flex items-start gap-3">
            <span class="mult-badge ${severityClass} shrink-0">${mult}</span>
            <div class="type-pills-container pt-1">${typeList.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>
    `;
}

function multiplierSection(titleKey, rowsHTML) {
    const rows = rowsHTML.filter(Boolean);
    if (!rows.length) return '';
    return `
        <div class="mb-4 last:mb-0">
            <div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted)">${i18n.t(titleKey)}</div>
            <div class="flex flex-col gap-2.5">${rows.join('')}</div>
        </div>
    `;
}

/**
 * Renders the full defensive matchup as ordered multiplier groups —
 * strongest weakness to hardest resistance — instead of four separate
 * cards. Defense is PokeTypes' top priority: this is the first thing a
 * user sees after selecting a Pokemon or type combination.
 * @param {HTMLElement} container
 * @param {ReturnType<import('../../lib/type-engine/index.js').calculateDefense>} def
 * @param {Record<string, string>} contrastData
 */
export function renderDefenseGroups(container, def, contrastData) {
    if (!container) return;

    const sections = [
        multiplierSection('defense_critical', [
            multiplierRow('8×', 'mult-critical', def.weaknesses8x, contrastData),
            multiplierRow('4×', 'mult-critical', def.weaknesses4x, contrastData)
        ]),
        multiplierSection('defense_weak', [
            multiplierRow('2×', 'mult-weak', def.weaknesses2x, contrastData)
        ]),
        multiplierSection('defense_immune', [
            multiplierRow('0×', 'mult-immune', def.immunities, contrastData)
        ]),
        multiplierSection('defense_resists', [
            multiplierRow('½×', 'mult-resist', def.resistances05x, contrastData)
        ]),
        multiplierSection('defense_strong_resists', [
            multiplierRow('¼×', 'mult-resist', def.resistances025x, contrastData),
            multiplierRow('⅛×', 'mult-resist', def.resistances0125x, contrastData)
        ]),
        multiplierSection('defense_neutral', [
            multiplierRow('1×', 'mult-neutral', def.neutral, contrastData)
        ])
    ].filter(Boolean);

    container.innerHTML = sections.length
        ? sections.join('')
        : `<span class="text-xs font-bold uppercase tracking-widest" style="color: var(--text-muted)">${i18n.t('none')}</span>`;
}

/**
 * Same multiplier-group language as renderDefenseGroups, but for
 * offensive coverage (best-move-wins across up to 3 attacking types).
 * Super effective first — it's the actionable half of offense.
 * @param {HTMLElement} container
 * @param {ReturnType<import('../../lib/type-engine/index.js').calculateOffense>} off
 * @param {string[][]} dualImmunityPairs - from findImmuneDualTypes
 * @param {Record<string, string>} contrastData
 */
export function renderOffenseGroups(container, off, dualImmunityPairs, contrastData) {
    if (!container) return;

    const sections = [
        multiplierSection('super_effective', [
            multiplierRow('2×+', 'mult-critical', off.superEffective2x, contrastData)
        ]),
        multiplierSection('neutral_offense', [
            multiplierRow('1×', 'mult-neutral', off.neutral, contrastData)
        ]),
        multiplierSection('not_very_effective', [
            multiplierRow('½×', 'mult-resist', off.notVeryEffective, contrastData)
        ]),
        multiplierSection('no_effect', [
            multiplierRow('0×', 'mult-immune', off.noEffect, contrastData)
        ])
    ].filter(Boolean);

    if (dualImmunityPairs && dualImmunityPairs.length) {
        const pairsHTML = dualImmunityPairs.map(pair => {
            const p1 = createTypePill(pair[0], contrastData, 'type-pill-sm');
            const p2 = createTypePill(pair[1], contrastData, 'type-pill-sm');
            return `<div class="flex items-center gap-1 px-2 py-1.5 rounded-md" style="background: var(--surface-raised); border: 1px solid var(--border)"><div class="flex flex-wrap gap-1">${p1}${p2}</div></div>`;
        }).join('');

        sections.push(`
            <div class="mb-4 last:mb-0">
                <div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted)">${i18n.t('walled_by_dual')}</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${pairsHTML}</div>
            </div>
        `);
    }

    container.innerHTML = sections.length
        ? sections.join('')
        : `<span class="text-xs font-bold uppercase tracking-widest" style="color: var(--text-muted)">${i18n.t('none')}</span>`;
}

export function generateTypeTable(containerId, types, effectiveness, contrastData) {
    const tableContainer = document.getElementById(containerId);
    if (!tableContainer) return;
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

/**
 * Compact "subject header" — just enough to identify what's being
 * analyzed (sprite, name, dex #, types, active ability if any). No hero
 * card, no big gradient glow: Defense is the star of this screen, not
 * the artwork.
 */
export function renderPokemonHero(container, pokemon, contrastData, imageFixes = {}) {
    if (!pokemon) {
        container.innerHTML = '';
        container.style.background = '';
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');

    const primaryColor = TYPE_COLORS[pokemon.types[0]] || '#6366f1';
    container.style.background = `linear-gradient(90deg, ${primaryColor}14 0%, transparent 70%)`;

    const fix = imageFixes[pokemon.apiName];

    const localizedName = i18n.t(pokemon.name.toLowerCase());
    const displayName = localizedName !== pokemon.name.toLowerCase() ? localizedName : capitalizeWords(pokemon.name);

    const typePills = pokemon.types.map(t => createTypePill(t, contrastData)).join('');

    const baseSlug = (pokemon.apiName || pokemon.slug || pokemon.name?.toLowerCase() || '').replace(/\s+/g, '-');
    const cleanSlug = baseSlug.replace(/[^a-z0-9-]/g, '');

    const officialArtById = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    const officialArtBySlug = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${cleanSlug}.png`;

    let primaryUrl = officialArtById;
    if (fix) {
        primaryUrl = (fix.type === 'slug' || fix.type === 'id')
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fix.value}.png`
            : fix.value;
    }

    const sources = [primaryUrl, officialArtBySlug, '/pokeball.png'];
    const dexNumber = pokemon.id ? `#${String(pokemon.id).padStart(4, '0')}` : '';

    container.innerHTML = `
        <div class="relative z-10 flex items-center gap-4 py-3 px-1 fade-in">
            <img id="pokemon-hero-img"
                 src="${sources[0]}"
                 alt="${displayName}"
                 loading="eager"
                 class="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
                 onerror="this.src='${sources[1]}'; this.onerror=function(){this.src='${sources[2]}'; this.onerror=null;}">
            <div class="min-w-0">
                <div class="flex items-baseline gap-2 flex-wrap">
                    <h3 class="text-xl sm:text-2xl font-black tracking-tight truncate" style="color: var(--text)">${displayName}</h3>
                    ${dexNumber ? `<span class="font-mono text-xs sm:text-sm shrink-0" style="color: var(--text-muted)">${dexNumber}</span>` : ''}
                </div>
                <div class="flex items-center gap-1.5 mt-1.5 flex-wrap" id="pokemon-hero-types">${typePills}</div>
            </div>
        </div>
    `;

    const img = container.querySelector('#pokemon-hero-img');
    let currentSourceIndex = 0;
    img.onerror = () => {
        currentSourceIndex++;
        if (currentSourceIndex < sources.length) img.src = sources[currentSourceIndex];
    };
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
                <span class="w-16 font-bold text-right uppercase text-xs tracking-wider whitespace-nowrap" style="color: var(--text-muted)">${statNames[stat.stat.name] || stat.stat.name}</span>
                <span class="w-8 font-mono font-bold text-right" style="color: var(--text)">${val}</span>
                <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: var(--border)">
                    <div class="h-full rounded-full ${colorClass} stat-bar" style="width: 0%" data-target-width="${targetWidth}%"></div>
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
        <div class="grid grid-cols-1 gap-2">
            ${abilities.map(entry => {
                const name = entry.ability.displayName || capitalizeWords(entry.ability.name);
                const isHidden = entry.is_hidden;
                const description = entry.description || i18n.t('loading_desc');

                return `
                    <div class="flex flex-col gap-1 px-3 py-2.5 rounded-md" style="background: var(--surface-raised); border: 1px solid var(--border)">
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-bold text-sm" style="color: var(--text)">${name}</span>
                            ${isHidden
                                ? `<span class="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0" style="background: var(--border); color: var(--text-muted)">${i18n.t('hidden')}</span>`
                                : ''}
                        </div>
                        <p class="text-xs leading-relaxed" style="color: var(--text-muted)">${description}</p>
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
        <div class="flex flex-col gap-6 animate-in fade-in">
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

/**
 * Ability considerations for the plain Calculator (no single ability is
 * "active" here — the base Defense/Offense numbers stay type-only). When
 * `pokemonTypes` + `effectiveness` are given, each unconditional modifier
 * shows its raw -> effective delta (e.g. "FIRE 2× → 1×") using the same
 * math as applyDefensiveModifiers, purely for information — it never
 * changes the primary Defense numbers above. Conditional modifiers
 * (`requiresContext`, e.g. Multiscale/Tera Shell/Fluffy's contact half)
 * are shown with an honest "requires X" note instead of a computed delta,
 * since PokeTypes has no way to confirm that condition here.
 */
export function renderAbilityAlerts(container, abilities, pokemonTypes = null, effectiveness = null) {
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
            if (seenKeys.has(key)) return;
            seenKeys.add(key);

            let delta = null;
            const isTypeSpecific = mod.type !== 'All' && mod.type !== 'Offensive';
            if (pokemonTypes && effectiveness && isTypeSpecific && !mod.requiresContext) {
                let raw = 1;
                pokemonTypes.forEach(t => { raw *= getEffectiveness(mod.type, t, effectiveness); });

                let effective;
                if (mod.blockNonSE) effective = raw < 2 ? 0 : raw;
                else if (mod.superEffectiveOnly) effective = raw >= 2 ? raw * mod.modifier : raw;
                else if (mod.modifier === 0) effective = 0;
                else effective = raw * mod.modifier;

                if (effective !== raw) delta = { raw, effective, type: mod.type };
            }

            alertsToRender.push({
                abilityName: displayName,
                description: i18n.t(mod.descriptionKey),
                requiresContext: mod.requiresContext,
                delta
            });
        });
    });

    if (alertsToRender.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const rows = alertsToRender.map(alert => {
        let deltaHTML = '';
        if (alert.delta) {
            deltaHTML = `
                <div class="flex items-center gap-2 mt-1.5 text-xs font-mono">
                    <span class="uppercase tracking-wide font-sans font-bold" style="color: var(--text-muted)">${i18n.tType(alert.delta.type)}</span>
                    <span style="color: var(--text-muted)">${formatMultiplierSymbol(alert.delta.raw)}</span>
                    <span aria-hidden="true">→</span>
                    <span class="font-bold" style="color: var(--accent)">${formatMultiplierSymbol(alert.delta.effective)}</span>
                </div>
            `;
        } else if (alert.requiresContext) {
            const noteKey = alert.requiresContext === 'fullHp' ? 'requires_full_hp' : 'requires_contact';
            deltaHTML = `<div class="mt-1.5 text-xs italic" style="color: var(--text-muted)">${i18n.t(noteKey)} — ${i18n.t('condition_not_confirmed')}</div>`;
        }

        return `
            <div class="px-3 py-2.5 rounded-md text-sm" style="background: var(--surface-raised); border: 1px solid var(--border); color: var(--text-muted)">
                <span class="font-bold" style="color: var(--text)">${alert.abilityName}</span>: ${alert.description}
                ${deltaHTML}
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="label-group">
            <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span>${i18n.t('ability_considerations')}</span>
        </div>
        <div class="grid gap-2">${rows}</div>
    `;
}

export function renderTacticalAdvice(container, advice) {
    if (!container) return;
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