// Small pure helpers shared by the SEO-relevant routes so they can be unit tested.
import { messages } from '../js/lang/messages.js';

export function pokemonSlug(pokemon) {
    return (pokemon.apiName || pokemon.name).toLowerCase().replace(/\s+/g, '-');
}

// "/tipo/fire/" and "/tipo/fire" are the same document: advertise only one.
export function normalizePathname(pathname) {
    return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

// Resolves "fire-flying" to ['Fire', 'Flying']. Returns null when the slug is
// not made only of 1-3 known types, so malformed URLs 404 instead of rendering
// a duplicate of a valid page under a different address.
export function parseTypeSlug(slug, types) {
    if (!slug) return null;
    const parts = slug.split('-');
    if (parts.length > 3) return null;
    const resolved = parts.map(part => types.find(t => t.toLowerCase() === part.toLowerCase()));
    return resolved.every(Boolean) ? resolved : null;
}

// Stable URL slug for a combination of types. Defense (product) and offense
// (max) are symmetric, so "flying-fire" and "fire-flying" are the same page:
// types are de-duplicated and ordered as in the type chart (`allTypes`), which
// is also the order of the selectors. Single source for the page redirect, the
// canonical URL, the sitemap and the client-side URL sync.
export function canonicalTypeSlug(types, allTypes) {
    const wanted = new Set(types.map(t => t.toLowerCase()));
    return allTypes.filter(t => wanted.has(t.toLowerCase())).map(t => t.toLowerCase()).join('-');
}

const STAT_ROWS = [['hp', 'stat_hp'], ['atk', 'stat_atk'], ['def', 'stat_def'], ['spa', 'stat_spa'], ['spd', 'stat_spd'], ['spe', 'stat_spe']];

// `t` maps a messages.js key to a label; defaults to English like the SSR pages.
const english = key => messages.en[key];

// Same markup and thresholds as renderStats() in ui.js, with the bar already
// filled, so the stats exist in the HTML without waiting for PokeAPI.
export function renderStatsHtml(stats, t = english) {
    if (!stats) return '';
    return STAT_ROWS.map(([key, labelKey]) => {
        const label = t(labelKey);
        const val = stats[key];
        if (typeof val !== 'number') return '';
        let colorClass = 'bg-red-500';
        if (val >= 120) colorClass = 'bg-purple-500';
        else if (val >= 90) colorClass = 'bg-green-500';
        else if (val >= 60) colorClass = 'bg-yellow-500';
        const width = Math.min((val / 255) * 100, 100);
        return `<div class="flex items-center gap-3 text-sm"><span class="w-16 font-bold text-right uppercase text-xs tracking-wider whitespace-nowrap" style="color: var(--text-muted)">${label}</span><span class="w-8 font-mono font-bold text-right" style="color: var(--text)">${val}</span><div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: var(--border)"><div class="h-full rounded-full ${colorClass} stat-bar" style="width: ${width}%"></div></div></div>`;
    }).join('');
}

// Ability names from the local pokedex ({ "0": "Blaze", "H": "Solar Power" }).
// Descriptions stay client-side (PokeAPI), as before.
export function renderAbilitiesHtml(abilities, t = english) {
    if (!abilities) return '';
    return Object.entries(abilities).map(([key, name]) => {
        const badge = key === 'H'
            ? `<span class="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0" style="background: var(--border); color: var(--text-muted)">${t('hidden')}</span>`
            : '';
        return `<div class="flex flex-col gap-1 px-3 py-2.5 rounded-md" style="background: var(--surface-raised); border: 1px solid var(--border)"><div class="flex items-center justify-between gap-2"><span class="font-bold text-sm" style="color: var(--text)">${name}</span>${badge}</div></div>`;
    }).join('');
}
