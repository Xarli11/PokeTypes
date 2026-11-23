// Server-side translations for the SSR pages and components. Same dictionary
// as the browser (src/js/lang/messages.js), so there is one source of truth.
//
// Lookup order for `t(key)`: "ssr_<key>" (SSR-only override, see messages.js)
// -> "<key>" in the requested language -> the same key in English. The English
// fallback keeps a page renderable if a translation is missing; tests assert
// that every key the SSR layer uses exists in every language, so it never
// silently mixes languages in practice.
import { messages } from '../js/lang/messages.js';

export const LANGS = ['en', 'es'];
export const DEFAULT_LANG = 'en';

export function isLang(value) {
    return LANGS.includes(value);
}

/** Escapes text for use inside an HTML element: & < > only (quotes stay as written). */
export function escapeText(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * @param {string} lang
 * @returns {{ lang: string, t: (key: string, params?: Record<string, string|number>) => string, h: (key: string, params?: Record<string, string|number>) => string }}
 *   `t` returns the raw string; `h` returns it escaped for element content
 *   (use with `set:html` or inside template strings that build HTML).
 */
export function createT(lang = DEFAULT_LANG) {
    const language = isLang(lang) ? lang : DEFAULT_LANG;
    const dict = messages[language];

    const t = (key, params = {}) => {
        let value = dict[`ssr_${key}`] ?? dict[key] ?? messages[DEFAULT_LANG][`ssr_${key}`] ?? messages[DEFAULT_LANG][key] ?? key;
        for (const [name, replacement] of Object.entries(params)) {
            value = value.split(`{${name}}`).join(String(replacement));
        }
        return value;
    };
    const h = (key, params) => escapeText(t(key, params));

    return { lang: language, t, h };
}
