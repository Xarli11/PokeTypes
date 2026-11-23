// The language selector (header). One implementation for the server (rendered
// into AppHeader) and the browser (re-rendered after the app changes the URL),
// so the text and the accessible name never differ between the two.
//
// - A page that exists in the other language: a real link (full navigation, so
//   HTML, metadata, canonical and URL stay in sync). hreflang/lang on the link.
// - A page that does not: a button that says so (aria-disabled); the visible
//   text stays "ES"/"EN", and its accessible name contains that text.
import { equivalentPath, ES_PILOT_ENABLED } from './i18n-pilot.js';
import { escapeText } from './i18n-server.js';

const CLASSES = 'icon-btn font-bold text-sm tracking-wide';

/**
 * @param {{ lang: string, pathname: string, t: (key: string) => string, enabled?: boolean }} options
 *   `lang` is the language of the page being shown; the selector offers the other one.
 */
export function renderLangSwitch({ lang, pathname, t, enabled = ES_PILOT_ENABLED }) {
    const other = lang === 'es' ? 'en' : 'es';
    const label = other.toUpperCase();
    const name = escapeText(t(other === 'es' ? 'switch_to_es' : 'switch_to_en'));
    const target = equivalentPath(pathname, other, enabled);

    if (target) {
        return `<a id="lang-toggle" class="${CLASSES}" href="${target}" hreflang="${other}" lang="${other}" aria-label="${name}">${label}</a>`;
    }
    const why = escapeText(t('spanish_unavailable'));
    return `<button id="lang-toggle" class="${CLASSES} opacity-60" type="button" aria-disabled="true" data-unavailable title="${why}" aria-label="${name} — ${why}">${label}</button>`;
}
