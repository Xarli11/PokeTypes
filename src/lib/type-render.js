// Pure HTML builders for the server-rendered type analysis (defense/offense
// groups and type pills) shared by /tipo/* and /pokemon/*. Output is plain
// strings so it can be unit tested without Astro.
import { messages } from '../js/lang/messages.js';

const MULT_LABELS = { '8': '8×', '4': '4×', '2': '2×', '1': '1×', '05': '½×', '025': '¼×', '0125': '⅛×', '0': '0×' };

// `t` maps a messages.js key to a label. Defaults to English: the SSR pages are
// English-only today.
const english = key => messages.en[key];

export function pill(type, contrast) {
    const tc = contrast[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
    return `<span class="type-pill bg-type-${type.toLowerCase()} ${tc}">${type}</span>`;
}

export function pills(list, contrast) {
    return list.length
        ? list.map(type => pill(type, contrast)).join('')
        : `<span class="text-xs font-bold uppercase tracking-widest" style="color: var(--text-muted)">None</span>`;
}

function multRow(mult, severityClass, typeList, contrast) {
    if (!typeList.length) return '';
    return `<div class="flex items-start gap-3"><span class="mult-badge ${severityClass} shrink-0">${MULT_LABELS[mult]}</span><div class="type-pills-container pt-1">${pills(typeList, contrast)}</div></div>`;
}

function section(title, rows) {
    const filtered = rows.filter(Boolean);
    if (!filtered.length) return '';
    return `<div class="mb-4 last:mb-0"><div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted)">${title}</div><div class="flex flex-col gap-2.5">${filtered.join('')}</div></div>`;
}

/** @param def result of calculateDefense */
export function renderDefenseGroups(def, contrast, t = english) {
    const row = (mult, cls, list) => multRow(mult, cls, list, contrast);
    return [
        section(t('defense_critical'), [row('8', 'mult-critical', def.weaknesses8x), row('4', 'mult-critical', def.weaknesses4x)]),
        section(t('defense_weak'), [row('2', 'mult-weak', def.weaknesses2x)]),
        section(t('defense_immune'), [row('0', 'mult-immune', def.immunities)]),
        section(t('defense_resists'), [row('05', 'mult-resist', def.resistances05x)]),
        section(t('defense_strong_resists'), [row('025', 'mult-resist', def.resistances025x), row('0125', 'mult-resist', def.resistances0125x)]),
        section(t('defense_neutral'), [row('1', 'mult-neutral', def.neutral)])
    ].filter(Boolean).join('');
}

/** @param off result of calculateOffense */
export function renderOffenseGroups(off, contrast, t = english) {
    const row = (mult, cls, list) => multRow(mult, cls, list, contrast);
    return [
        section(t('super_effective'), [row('2', 'mult-critical', off.superEffective2x)]),
        section(t('defense_neutral'), [row('1', 'mult-neutral', off.neutral)]),
        section(t('not_very_effective'), [row('05', 'mult-resist', off.notVeryEffective)]),
        section(t('no_effect'), [row('0', 'mult-immune', off.noEffect)])
    ].filter(Boolean).join('');
}

export function renderTypePills(types, contrast) {
    return types.map(type => pill(type, contrast)).join('');
}
