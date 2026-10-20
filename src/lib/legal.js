// Controller data and legal-review inputs for /privacy. Everything that only
// the site owner can state is null on purpose: the page renders a visible
// "to be completed" marker instead of an invented value. Fill these in (and
// have the text reviewed) before publishing the privacy policy URL to the CMP.
export const legal = {
    lastUpdated: '2026-10-21',
    // Already public on the home page ("Email Me" button); confirm it is the
    // address to use for privacy requests.
    contactEmail: 'carlosgt2001@icloud.com',
    controller: {
        name: null,        // full legal name or business name
        taxId: null,       // NIF/CIF or equivalent, if any
        address: null,     // postal address for notices
        country: null      // country of establishment
    },
    // One legal basis per purpose, decided with legal advice (null = pending).
    legalBases: {
        hosting: null,
        calculator: null,
        analytics: null,
        advertising: null
    },
    // GA4 data retention configured in the Analytics property (null = pending).
    analyticsRetention: null,
    supervisoryAuthority: null
};
