// Server-side translations for the SSR pages and components. Same dictionary
// as the browser (src/js/lang/messages.js), so there is one source of truth.
//
// Lookup order for `t(key)`: "ssr_<key>" (SSR-only override, see messages.js)
// -> "<key>" in the requested language -> the same key in English. The English
// fallback keeps a page renderable if a translation is missing; tests assert
// that every key the SSR layer uses exists in every language, so it never
// silently mixes languages in practice.
import { messages } from '../js/lang/messages.js';
import abilityNames from '../data/abilities-i18n.json';

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
 * @returns {{ lang: string, t, h, tType: (type: string) => string, tAbility: (name: string) => string }}
 *   `t` returns the raw string; `h` returns it escaped for element content
 *   (use with `set:html` or inside template strings that build HTML).
 *   `tType` / `tAbility` translate domain names the way the browser does
 *   (i18n.tType / i18n.tAbility): unknown names are returned unchanged.
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

    const tType = type => {
        if (!type) return '';
        const key = String(type).toLowerCase();
        return dict[key] ?? type;
    };
    const tAbility = name => {
        if (!name) return '';
        const entry = abilityNames[String(name).toLowerCase().replace(/ /g, '-')];
        return entry ? (entry[language] || entry.en || name) : name;
    };

    return { lang: language, t, h, tType, tAbility };
}
