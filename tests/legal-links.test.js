import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildLegal, legalAccess } from '../src/lib/legal.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const providers = Object.fromEntries(['google', 'cloudflare', 'pokeapi', 'github', 'showdown'].map(k => [k, { role: 'x', transfer: 'x' }]));
const privacyComplete = {
    controller: { name: 'Test Person', contactEmail: 'owner@example.test' },
    legalBases: { hosting: 'x', calculator: 'x', analytics: 'x', advertising: 'x' },
    providers, retention: { analytics: 'x', serverLogs: 'x', consentRecord: 'x' },
    minors: { en: 'x', es: 'x' }, supervisoryAuthority: 'x'
};
const noticeComplete = { taxId: 'x', address: 'x', addressKind: 'residence' };

// Every data state, on every host: a visible legal page must never link to a page that answers 404.
describe('legal links never point to a page the gate hides', () => {
    const states = [];
    for (const privacy of [false, true]) {
        for (const applies of [null, false, true]) {
            for (const notice of [false, true]) {
                states.push({
                    label: `privacy=${privacy} applies=${applies} noticeData=${notice}`,
                    data: buildLegal({ ...(privacy ? privacyComplete : {}), lssi: { applies, ...(notice ? noticeComplete : {}) } })
                });
            }
        }
    }
    const hosts = ['poketypes.app', 'www.poketypes.app', 'localhost', 'x.poketypes.pages.dev'];

    it.each(states)('$label', ({ data }) => {
        for (const host of hosts) {
            const a = legalAccess(host, data);
            // /legal links to /privacy; /privacy links to /legal only when it is visible; the footer shows both only with privacy.
            if (a.noticeVisible) expect(a.privacyVisible, `${host}: /legal visible without /privacy`).toBe(true);
            if (a.production && !a.privacyVisible) expect(a.noticeVisible, host).toBe(false);
        }
    });

    it('the case that used to dangle: notice complete, privacy incomplete, production', () => {
        const data = buildLegal({ lssi: { applies: true, ...noticeComplete }, controller: { name: 'Test Person', contactEmail: 'owner@example.test' } });
        const a = legalAccess('poketypes.app', data);
        expect(a.status.noticeReady).toBe(true);
        expect(a.privacyVisible).toBe(false);
        expect(a.noticeVisible).toBe(false);
    });

    it('markup follows the gate: the footer shows /legal only inside the privacy block, and the pages link only to visible targets', () => {
        const footer = read('src/components/LegalFooter.astro');
        expect(footer.indexOf('{privacyVisible && (')).toBeLessThan(footer.indexOf('href="/legal"'));
        expect(footer).toContain('{noticeVisible && <a href="/legal"');
        expect(read('src/pages/privacy.astro')).toContain('{access.noticeVisible && <p');
    });
});
