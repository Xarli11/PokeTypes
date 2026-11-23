// Language-aware URL model: deterministic, bidirectional maps between internal
// type names ("Fire"), their Spanish names ("Fuego") and URL slugs ("fuego"),
// and between English and Spanish paths. Pure; no DOM, no Astro.
//
// English URLs are the existing ones and never change:
//   /tipo/fire-flying      /pokemon/charizard      /
// Spanish URLs (not served yet) mirror them under /es with Spanish type slugs:
//   /es/tipo/fuego-volador /es/pokemon/charizard   /es
// Pokemon use the official names, so their slug is the same in both languages.
import { messages } from '../js/lang/messages.js';

export const DEFAULT_LANG = 'en';
export const LANG_PREFIX = { es: '/es' };

// Same names and order as `types` in src/data/type-data.json (a test keeps them in
// sync). Duplicated on purpose: importing the JSON here would ship the whole
// effectiveness table to the browser a second time.
const TYPES = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground',
    'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Fairy', 'Dark'
];

/** "Psíquico" -> "psiquico": strip diacritics, lowercase, non-alphanumerics -> "-". */
export function slugify(text) {
    return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const SLUGS = {
    en: Object.fromEntries(TYPES.map(type => [type, type.toLowerCase()])),
    es: Object.fromEntries(TYPES.map(type => [type, slugify(messages.es[type.toLowerCase()])]))
};
const TYPE_BY_SLUG = {
    en: Object.fromEntries(Object.entries(SLUGS.en).map(([type, slug]) => [slug, type])),
    es: Object.fromEntries(Object.entries(SLUGS.es).map(([type, slug]) => [slug, type]))
};

const language = lang => (lang === 'es' ? 'es' : 'en');

/** Slug of one type: ("Fire", "es") -> "fuego". */
export function typeSlug(type, lang = DEFAULT_LANG) {
    return SLUGS[language(lang)][type] ?? null;
}

/**
 * Canonical slug of a combination. Types are de-duplicated and ordered as in the
 * type chart (the same order for every language and for the existing English
 * URLs), so every permutation maps to one URL: ["Flying","Fire"], "es" -> "fuego-volador".
 */
export function toTypeSlug(types, lang = DEFAULT_LANG) {
    const wanted = new Set(types.map(t => String(t).toLowerCase()));
    return TYPES.filter(t => wanted.has(t.toLowerCase())).map(t => SLUGS[language(lang)][t]).join('-');
}

/**
 * Internal type names for a slug, or null if it is not 1-3 known types.
 * English accepts English names only (unchanged behaviour). Spanish accepts
 * Spanish slugs and, as aliases, English names ("fuego-flying"), case-insensitive;
 * the result is meant to be redirected to the canonical slug.
 */
export function fromTypeSlug(slug, lang = DEFAULT_LANG) {
    if (!slug) return null;
    const parts = String(slug).toLowerCase().split('-');
    if (parts.length > 3) return null;
    const resolved = parts.map(part => (language(lang) === 'es'
        ? TYPE_BY_SLUG.es[part] ?? TYPE_BY_SLUG.en[part]
        : TYPE_BY_SLUG.en[part]));
    return resolved.every(Boolean) ? resolved : null;
}

/**
 * What a /tipo route should do with a slug: `null` -> 404; otherwise the
 * internal types, the canonical slug and whether the request must be
 * 301-redirected to it (permutation, duplicate, alias, different case).
 */
export function resolveTypeRoute(slug, lang = DEFAULT_LANG) {
    const parsed = fromTypeSlug(slug, lang);
    if (!parsed) return null;
    const canonical = toTypeSlug(parsed, lang);
    return { types: canonical.split('-').map(s => TYPE_BY_SLUG[language(lang)][s]), slug: canonical, redirect: slug !== canonical };
}

// ── Paths ───────────────────────────────────────────────────────────────────

/** "/es/tipo/fuego" -> { lang: "es", path: "/tipo/fuego" }; "/essay" is not Spanish. */
export function stripLangPrefix(pathname) {
    for (const [lang, prefix] of Object.entries(LANG_PREFIX)) {
        if (pathname === prefix || pathname === `${prefix}/`) return { lang, path: '/' };
        if (pathname.startsWith(`${prefix}/`)) return { lang, path: pathname.slice(prefix.length) };
    }
    return { lang: DEFAULT_LANG, path: pathname };
}

export function getLangFromPath(pathname) {
    return stripLangPrefix(pathname).lang;
}

/** ("/tipo/fuego", "es") -> "/es/tipo/fuego"; ("/", "es") -> "/es"; English is unprefixed. */
export function withLangPrefix(path, lang) {
    const prefix = LANG_PREFIX[lang];
    if (!prefix) return path;
    return path === '/' ? prefix : `${prefix}${path}`;
}

/**
 * The same page in another language, or null if it has no equivalent
 * (unknown route, invalid type slug). Input and output are canonical paths.
 *   ("/tipo/fire-flying", "es") -> "/es/tipo/fuego-volador"
 *   ("/es/pokemon/charizard", "en") -> "/pokemon/charizard"
 */
export function pathForLang(pathname, targetLang) {
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const { lang, path } = stripLangPrefix(clean);
    if (path === '/') return withLangPrefix('/', targetLang);
    const [, section, slug, ...rest] = path.split('/');
    if (rest.length || !slug) return null;
    if (section === 'pokemon') return withLangPrefix(`/pokemon/${slug}`, targetLang);
    if (section === 'tipo') {
        const types = fromTypeSlug(slug, lang);
        return types ? withLangPrefix(`/tipo/${toTypeSlug(types, targetLang)}`, targetLang) : null;
    }
    return null;
}

/**
 * Path for the app state shown in the browser (what history.pushState gets):
 * a Pokemon, a type combination or the home page.
 */
export function statePath({ pokemonSlug, types = [] }, lang = DEFAULT_LANG) {
    if (pokemonSlug) return withLangPrefix(`/pokemon/${pokemonSlug}`, lang);
    if (types.length) return withLangPrefix(`/tipo/${toTypeSlug(types, lang)}`, lang);
    return withLangPrefix('/', lang);
}

/**
 * Language for the page being shown. A localized URL (/es/...) decides by
 * itself; every other URL keeps the long-standing behaviour: the language the
 * visitor saved (localStorage), English by default.
 */
export function detectLang(pathname, stored) {
    const fromPath = getLangFromPath(pathname || '/');
    if (fromPath !== DEFAULT_LANG) return fromPath;
    return stored === 'es' || stored === 'en' ? stored : DEFAULT_LANG;
}
