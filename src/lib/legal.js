// Controller data and legal-review inputs for /privacy. Everything that only the site
// owner can state is null on purpose: the page renders a visible "to be completed"
// marker instead of an invented value. Fill these in, and have the text reviewed,
// before the privacy policy URL is given to the CMP. Nothing here is collected or
// filled in automatically.
//
// A controller field set to `false` is not shown at all. Use that only when the owner's
// legal status (individual, self-employed, company, country) allows not publishing it;
// decide with legal advice. See docs/privacy-consent.md, "Owner identification".
export const legal = {
    lastUpdated: '2026-10-21',
    // Already public on the home page ("Email Me" button); confirm it is the
    // address to use for privacy requests.
    contactEmail: 'carlosgt2001@icloud.com',
    controller: {
        name: null,        // legal name or business name
        taxId: null,       // tax identification number, if the owner's status requires showing it
        address: null,     // postal address or other effective means of contact allowed for the status
        country: null      // country of establishment
    },
    // One legal basis per purpose, decided with legal advice (null = pending).
    legalBases: {
        hosting: null,
        calculator: null,
        analytics: null,
        advertising: null
    },
    // Role (controller / processor) and transfer safeguard per provider. No evidence has
    // been collected for any of them yet (null = pending).
    providers: {
        google: { role: null, transfer: null },
        cloudflare: { role: null, transfer: null },
        pokeapi: { role: null, transfer: null },
        github: { role: null, transfer: null },
        showdown: { role: null, transfer: null }
    },
    // Text for visitors under the age of digital consent, per language (null = pending).
    minors: { en: null, es: null },
    // GA4 data retention configured in the Analytics property (null = pending).
    analyticsRetention: null,
    supervisoryAuthority: null
};
