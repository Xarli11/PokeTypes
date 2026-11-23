// The part of the app state that lives in the URL: what is being analysed
// (a Pokemon or 1-3 types) and the view mode. Pure; used by main.js to build
// the URL it pushes and to restore the state on back/forward and on load.
import { statePath, stripLangPrefix, fromTypeSlug } from './i18n-routes.js';

export const MODES = ['simple', 'pro'];

/**
 * @param {{ pathname: string, search?: string }} location
 * @returns {{ lang: string, pokemonSlug: string|null, types: string[], mode: 'simple'|'pro' }}
 *   `types` are lowercase names as written in the URL (or from ?t1=&t2=&t3=);
 *   callers validate them against the real type list.
 */
export function parseAppLocation({ pathname, search = '' }) {
    const params = new URLSearchParams(search);
    const { lang, path } = stripLangPrefix(pathname);
    const [section, slug] = path.split('/').filter(Boolean);

    let pokemonSlug = params.get('p');
    let types = [params.get('t1'), params.get('t2'), params.get('t3')].filter(Boolean);

    if (section === 'pokemon' && slug) {
        pokemonSlug = slug;
    } else if (section === 'tipo' && slug) {
        types = (lang === 'es' && fromTypeSlug(slug, 'es')?.map(type => type.toLowerCase())) || slug.split('-');
    }

    return { lang, pokemonSlug: pokemonSlug || null, types, mode: params.get('mode') === 'pro' ? 'pro' : 'simple' };
}

/**
 * Path + query for a state. A Pokemon wins over types, as it always did.
 * The Team Builder only exists on the home page, so its URL is always
 * `/?mode=pro` (the calculator selection is not part of it and is restored from
 * the neighbouring history entries); every other state is a plain path.
 */
export function buildAppUrl({ pokemonSlug = null, types = [], mode = 'simple' }, lang = 'en') {
    if (mode === 'pro') return `${statePath({}, lang)}?mode=pro`;
    return statePath({ pokemonSlug, types }, lang);
}

/** Same URL with `mode` set (pro) or removed (simple); every other parameter is kept. */
export function withMode(href, mode) {
    const url = new URL(href);
    if (mode === 'pro') url.searchParams.set('mode', 'pro');
    else url.searchParams.delete('mode');
    return url.pathname + url.search + url.hash;
}
