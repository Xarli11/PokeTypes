// src/js/modules/analytics.js
//
// Minimal, dependency-free wrapper around the GA4 gtag() function already
// loaded by Layout.astro. This is intentionally NOT an analytics platform —
// it's a single trackEvent() call plus a short, documented event taxonomy
// (see docs/analytics-events.md) covering the handful of product actions
// worth measuring. Before this module existed, gtag('config', ...) ran on
// every page load but nothing else was ever tracked — see docs/analytics-events.md
// for the full audit.
//
// Design constraints (deliberate, do not "improve" without re-reading these):
//   - Never throws, never blocks the UI, no-ops silently if gtag isn't
//     available (dev/test environments, ad-blockers, gtag.js failing to
//     load) — a failed measurement must never break the product.
//   - No dependency added; reuses the existing gtag()/dataLayer already
//     wired up in Layout.astro.
//   - No personally identifiable information is ever sent: no user IDs, no
//     free-text search queries, no emails. Every parameter is either a
//     bounded enum (mode, source, language, share context/method) or a
//     Pokémon/type name already public in the URL structure.
//   - De-duplication is each call site's responsibility (a single event
//     name can mean different things at different call sites — e.g.
//     type_calculate must not refire on a language-only re-render), not
//     something this generic wrapper can decide on its own.

export function trackEvent(name, params = {}) {
    try {
        if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
        window.gtag('event', name, params);
    } catch (e) {
        // Analytics must never break the app.
    }
}
