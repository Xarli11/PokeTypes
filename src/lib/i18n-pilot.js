// The Spanish pilot: which pages exist in Spanish, and everything derived from that.
// ONE list drives the routes (200 vs 404), the sitemap, hreflang, the language
// selector, internal links and the client's URL generation, so a URL under /es
// is only ever produced, linked or announced when it really exists.
import { pathForLang, stripLangPrefix, statePath, DEFAULT_LANG } from './i18n-routes.js';

// Publication switch. While false the site behaves as if /es did not exist
// (404, no sitemap entries, no hreflang, legacy language toggle). It is turned on
// in its own PR, after the Spanish copy has been reviewed (see ES_DRAFT_KEYS).
export const ES_PILOT_ENABLED = false;

export const SITE_ORIGIN = 'https://poketypes.app';

// English canonical paths of the pages that also exist in Spanish. Their Spanish
// paths are derived (Spanish type slugs, `/es` prefix), never typed by hand.
// The four Pokemon are PROVISIONAL until current Search Console data is available.
export const PILOT_EN_PATHS = [
    '/',
    '/tipo/fire',
    '/tipo/ghost',
    '/tipo/fire-flying',
    '/pokemon/pikachu',
    '/pokemon/charizard',
    '/pokemon/charizard-mega-x',
    '/pokemon/gengar'
];

// Spanish strings written for the pilot that a person still has to review. Empty
// before ES_PILOT_ENABLED can be true (tests enforce it).
export const ES_DRAFT_KEYS = [
    'meta_home_title', 'meta_home_description', 'meta_default_description', 'meta_keywords',
    'meta_type_title', 'meta_type_description', 'meta_pokemon_title', 'meta_pokemon_description',
    'breadcrumb_type', 'ld_app_alternate_name', 'ld_app_description',
    'ld_feature_1', 'ld_feature_2', 'ld_feature_3', 'ld_feature_4', 'ld_feature_5', 'ld_feature_6', 'ld_feature_7', 'ld_feature_8',
    'home_aria_label', 'toggle_language', 'toggle_dark_mode', 'share_analysis', 'extra_type_help',
    'browse_by_type', 'click_to_copy_username', 'team_count_initial',
    // C2: language selector, notice and Spanish 404
    'switch_to_es', 'switch_to_en', 'spanish_unavailable',
    'lang_notice_available', 'lang_notice_view', 'lang_notice_unavailable', 'lang_notice_dismiss',
    'es_404_title', 'es_404_text', 'es_404_english', 'es_404_home',
    // C3a: new keys and rewritten home SEO copy
    'copied', 'search_start_typing', 'comp_tier_meta',
    'chart_desc', 'effectiveness_desc', 'dual_desc'
];

const normalize = pathname => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);

function pilotPairs() {
    return PILOT_EN_PATHS.map(en => ({ en, es: pathForLang(en, 'es') }));
}
export const PILOT_PAGES = pilotPairs();

/** Is this exact canonical path (either language) one of the pilot pages? Always false while the pilot is off. */
export function isPilotPage(pathname, enabled = ES_PILOT_ENABLED) {
    if (!enabled) return false;
    const path = normalize(pathname);
    return PILOT_PAGES.some(page => page.en === path || page.es === path);
}

/**
 * The same page in `targetLang` IF it exists: English pages always exist; a
 * Spanish page only when it is a pilot page. Otherwise null.
 */
export function equivalentPath(pathname, targetLang, enabled = ES_PILOT_ENABLED) {
    const path = normalize(pathname);
    const target = pathForLang(path, targetLang);
    if (!target) return null;
    if (targetLang === DEFAULT_LANG) return enabled || stripLangPrefix(path).lang === DEFAULT_LANG ? target : null;
    return isPilotPage(target, enabled) ? target : null;
}

/**
 * hreflang alternates for a canonical page path: only for pilot pages (so only
 * between pages that really exist), absolute, with itself included and
 * x-default pointing at English. [] for everything else.
 */
export function alternatesFor(pathname, enabled = ES_PILOT_ENABLED) {
    const path = normalize(pathname);
    if (!isPilotPage(path, enabled)) return [];
    const page = PILOT_PAGES.find(p => p.en === path || p.es === path);
    return [
        { hreflang: 'es', href: SITE_ORIGIN + (page.es === '/' ? '' : page.es) },
        { hreflang: 'en', href: SITE_ORIGIN + page.en },
        { hreflang: 'x-default', href: SITE_ORIGIN + page.en }
    ];
}

/**
 * The URL the app may put in the address bar for a state. In Spanish, a state
 * with a Spanish page gets it; any other state gets the equivalent English URL,
 * which always exists, so the URL can be reloaded and shared. `crossesLanguage`
 * tells the caller the document language no longer matches the URL (it must
 * navigate instead of pushState).
 */
export function urlForState(state, lang, enabled = ES_PILOT_ENABLED) {
    const wanted = statePath(state, lang);
    if (lang === DEFAULT_LANG) return { url: wanted, lang, crossesLanguage: false };
    if (isPilotPage(wanted, enabled)) return { url: wanted, lang, crossesLanguage: false };
    return { url: statePath(state, DEFAULT_LANG), lang: DEFAULT_LANG, crossesLanguage: true };
}

/** Spanish URLs for the sitemap: the pilot pages, and nothing while the pilot is off. */
export function sitemapSpanishPaths(enabled = ES_PILOT_ENABLED) {
    return enabled ? PILOT_PAGES.map(page => page.es) : [];
}
