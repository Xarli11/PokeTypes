/* global __LEGAL_OVERRIDES__ */
// Owner-only legal data for /privacy and /legal.
//
// Nothing here is real data and nothing is filled in automatically: every field the owner
// must state starts as null. Private or personal values must NOT be committed. They are
// injected at build time from a JSON string in the POKETYPES_LEGAL environment variable
// (Cloudflare Pages build variable, or a local shell variable), merged over these defaults
// by astro.config.mjs. See docs/privacy-consent.md, "Owner data and publication gate".
//
// Publication gate: on the production hostnames the legal pages answer 404 and the footer
// legal links are hidden until legalStatus() reports them complete. Elsewhere (previews,
// localhost) they render as noindex drafts with the missing fields marked.

export const PRODUCTION_HOSTS = ['poketypes.app', 'www.poketypes.app'];

const DEFAULTS = {
    lastUpdated: '2026-10-21',
    controller: {
        name: null,         // legal identity of the natural person. A brand or alias (PokeTypes, Xarli11) is not valid.
        contactEmail: null  // contact for privacy requests (the address shown on the home page is only a candidate)
    },
    // LSSI-CE art. 10 identification. `applies` is a decision for the owner with advice:
    // true = publish the legal notice, false = not applicable (no economic activity), null = undecided.
    lssi: {
        applies: null,
        taxId: null,        // NIF, when art. 10 applies
        address: null,      // domicile or establishment address, when art. 10 applies
        addressKind: null,  // 'residence' | 'establishment' | 'other'
        addressLegallyConfirmed: false // must be true for anything other than 'residence'
    },
    // One legal basis per purpose, decided with legal advice.
    legalBases: { hosting: null, calculator: null, analytics: null, advertising: null },
    // Role (controller / processor) and international-transfer safeguard per provider.
    providers: {
        google: { role: null, transfer: null },
        cloudflare: { role: null, transfer: null },
        pokeapi: { role: null, transfer: null },
        github: { role: null, transfer: null },
        showdown: { role: null, transfer: null }
    },
    retention: { analytics: null, serverLogs: null, consentRecord: null },
    // Text for visitors under the age of digital consent, per language.
    minors: { en: null, es: null },
    supervisoryAuthority: null
};

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function merge(base, extra) {
    const out = { ...base };
    for (const [key, value] of Object.entries(extra ?? {})) {
        out[key] = isPlainObject(value) && isPlainObject(base[key]) ? merge(base[key], value) : value;
    }
    return out;
}

export const buildLegal = (overrides = {}) => merge(DEFAULTS, overrides);

function injectedOverrides() {
    try {
        return typeof __LEGAL_OVERRIDES__ === 'string' ? JSON.parse(__LEGAL_OVERRIDES__) : {};
    } catch {
        return {}; // malformed value: stay incomplete (fail closed) instead of breaking every page
    }
}

export const legal = buildLegal(injectedOverrides());

const filled = v => typeof v === 'string' && v.trim() !== '';
const BRAND_ALIAS = /^(poketypes|xarli11)$/i;

/** Names of the missing or invalid fields (never their values). */
export function legalStatus(data = legal) {
    const privacyMissing = [];
    const noticeMissing = [];
    const need = (list, ok, key) => { if (!ok) list.push(key); };

    const nameOk = filled(data.controller.name) && !BRAND_ALIAS.test(data.controller.name.trim());
    need(privacyMissing, nameOk, 'controller.name');
    need(privacyMissing, filled(data.controller.contactEmail), 'controller.contactEmail');
    for (const k of Object.keys(DEFAULTS.legalBases)) need(privacyMissing, filled(data.legalBases[k]), `legalBases.${k}`);
    for (const k of Object.keys(DEFAULTS.providers)) {
        need(privacyMissing, filled(data.providers[k].role), `providers.${k}.role`);
        need(privacyMissing, filled(data.providers[k].transfer), `providers.${k}.transfer`);
    }
    for (const k of Object.keys(DEFAULTS.retention)) need(privacyMissing, filled(data.retention[k]), `retention.${k}`);
    need(privacyMissing, filled(data.minors.en) && filled(data.minors.es), 'minors.en/es');
    need(privacyMissing, filled(data.supervisoryAuthority), 'supervisoryAuthority');

    const decisionMissing = data.lssi.applies === null || data.lssi.applies === undefined;
    if (data.lssi.applies === true) {
        need(noticeMissing, nameOk, 'controller.name');
        need(noticeMissing, filled(data.controller.contactEmail), 'controller.contactEmail');
        need(noticeMissing, filled(data.lssi.taxId), 'lssi.taxId');
        need(noticeMissing, filled(data.lssi.address), 'lssi.address');
        need(noticeMissing, ['residence', 'establishment', 'other'].includes(data.lssi.addressKind), 'lssi.addressKind');
        need(noticeMissing, data.lssi.addressKind === 'residence' || data.lssi.addressLegallyConfirmed === true, 'lssi.addressLegallyConfirmed');
    }

    const privacyReady = privacyMissing.length === 0;
    const noticeEnabled = data.lssi.applies === true;
    const noticeReady = noticeEnabled && noticeMissing.length === 0;
    return {
        privacyMissing, noticeMissing, decisionMissing, privacyReady, noticeEnabled, noticeReady,
        allReady: privacyReady && !decisionMissing && (!noticeEnabled || noticeReady)
    };
}

export const isProductionHost = hostname => PRODUCTION_HOSTS.includes(hostname);

/** What a request may show: production hosts only get complete pages, other hosts get drafts. */
export function legalAccess(hostname, data = legal) {
    const status = legalStatus(data);
    const production = isProductionHost(hostname);
    return {
        status,
        production,
        privacyVisible: !production || status.privacyReady,
        noticeVisible: status.noticeEnabled && (!production || status.noticeReady),
        draft: !status.allReady
    };
}
