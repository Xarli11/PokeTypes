// What the Spanish routes (/es, /es/tipo/*, /es/pokemon/*) answer for a request.
// Pure, so the whole decision table is unit tested; the .astro routes only apply it.
//
//   { status: 200 }                       render the page
//   { status: 301, location }             permanent redirect to the canonical URL
//   { status: 404, englishPath }          not found; englishPath = the equivalent English
//                                          page (or null) so the 404 can link to it
//
// Order: switch off -> 404 for everything; a Spanish URL is only ever served,
// or redirected to, when it is one of the pilot pages. Nothing redirects to a
// page that would itself be a 404.
import pokedex from '../data/pokedex.json';
import { resolveTypeRoute, withLangPrefix, pathForLang } from './i18n-routes.js';
import { ES_PILOT_ENABLED, isPilotPage } from './i18n-pilot.js';
import { pokemonSlug } from './seo.js';

const POKEMON_SLUGS = new Set(pokedex.map(pokemonSlug));

const OK = { status: 200 };
const notFound = (pathname, enabled) => ({
    status: 404,
    englishPath: enabled && /^\/es(\/|$)/.test(pathname) ? pathForLang(pathname.replace(/\/+$/, '') || '/es', 'en') : null
});

/**
 * @param {'home'|'tipo'|'pokemon'} kind
 * @param {string|undefined} param slug / name
 * @param {string} pathname as requested
 * @param {boolean} [enabled]
 * @returns {{ status: number, location?: string, englishPath?: string | null }}
 */
export function resolveEsRequest(kind, param, pathname, enabled = ES_PILOT_ENABLED) {
    if (!enabled) return { status: 404, englishPath: null };

    if (kind === 'home') {
        return pathname === '/es' ? OK : { status: 301, location: '/es' }; // "/es/" -> "/es"
    }

    if (kind === 'tipo') {
        const route = resolveTypeRoute(param, 'es');
        if (!route) return notFound(pathname, enabled);
        const canonical = withLangPrefix(`/tipo/${route.slug}`, 'es');
        if (!isPilotPage(canonical, enabled)) return notFound(pathname, enabled);
        // Redirect when the slug is not canonical (permutation, duplicate, case, English alias) or the path has a trailing slash.
        return route.redirect || pathname !== canonical ? { status: 301, location: canonical } : OK;
    }

    if (kind === 'pokemon') {
        const slug = String(param ?? '').toLowerCase();
        if (!POKEMON_SLUGS.has(slug)) return { status: 404, englishPath: null }; // no such Pokemon in English either
        const canonical = withLangPrefix(`/pokemon/${slug}`, 'es');
        if (!isPilotPage(canonical, enabled)) return notFound(pathname, enabled);
        return pathname !== canonical ? { status: 301, location: canonical } : OK;
    }

    return notFound(pathname, enabled);
}
