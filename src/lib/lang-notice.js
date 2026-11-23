// Discreet notice for visitors who have shown they want Spanish (a saved
// Spanish preference from before, or they just came from a Spanish page) while
// they are on an English page. Pure decision; main.js draws it.
import { equivalentPath, ES_PILOT_ENABLED } from './i18n-pilot.js';
import { pathForLang, getLangFromPath } from './i18n-routes.js';

/**
 * @returns {null | { kind: 'available', href: string } | { kind: 'unavailable' }}
 *   available: this page has a Spanish version (offer the link);
 *   unavailable: it is a page the app could translate but has no Spanish version yet.
 */
export function noticeFor({ pathname, storedLang, cameFromSpanish = false, dismissed = false, enabled = ES_PILOT_ENABLED }) {
    if (!enabled || dismissed) return null;
    if (getLangFromPath(pathname) !== 'en') return null;
    if (storedLang !== 'es' && !cameFromSpanish) return null;

    const href = equivalentPath(pathname, 'es', enabled);
    if (href) return { kind: 'available', href };
    return pathForLang(pathname, 'es') ? { kind: 'unavailable' } : null; // app pages only (not /privacy...)
}
