import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildLegal, legalStatus, legalAccess, legal } from '../src/lib/legal.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

// Placeholder values used only inside tests; they are not real data.
const complete = (extra = {}) => buildLegal({
    controller: { name: 'Test Person', contactEmail: 'owner@example.test' },
    legalBases: { hosting: 'x', calculator: 'x', analytics: 'x', advertising: 'x' },
    providers: Object.fromEntries(['google', 'cloudflare', 'pokeapi', 'github', 'showdown'].map(k => [k, { role: 'x', transfer: 'x' }])),
    retention: { analytics: 'x', serverLogs: 'x', consentRecord: 'x' },
    minors: { en: 'x', es: 'x' },
    supervisoryAuthority: 'x',
    lssi: { applies: false },
    ...extra
});

describe('no data is invented or committed', () => {
    it('every owner field defaults to null / undecided / false, so nothing is published by default', () => {
        const d = buildLegal();
        expect(d.controller).toEqual({ name: null, contactEmail: null });
        expect(d.lssi).toEqual({ applies: null, taxId: null, address: null, addressKind: null, addressLegallyConfirmed: false });
        expect(Object.values(d.legalBases)).toEqual([null, null, null, null]);
        expect(Object.values(d.providers).every(p => p.role === null && p.transfer === null)).toBe(true);
        expect(Object.values(d.retention)).toEqual([null, null, null]);
        expect(d.minors).toEqual({ en: null, es: null });
        expect(d.supervisoryAuthority).toBeNull();
    });

    it('the committed module and pages contain no email address, NIF-like id or alias used as identity', () => {
        for (const p of ['src/lib/legal.js', 'src/pages/privacy.astro', 'src/pages/legal.astro', 'src/components/LegalFooter.astro']) {
            const text = read(p);
            expect(text, p).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
            expect(text, p).not.toMatch(/\b\d{8}[A-Z]\b|\b[XYZ]\d{7}[A-Z]\b/);
        }
    });

    it('the runtime default (no injected overrides) is incomplete', () => {
        expect(legalStatus(legal).allReady).toBe(false);
    });
});

describe('legalStatus', () => {
    it('is incomplete with no data and names the missing fields, never values', () => {
        const s = legalStatus(buildLegal());
        expect(s.privacyReady).toBe(false);
        expect(s.decisionMissing).toBe(true);
        expect(s.privacyMissing).toContain('controller.name');
        expect(s.privacyMissing).toContain('providers.google.transfer');
        expect(s.privacyMissing).toContain('minors.en/es');
    });

    it('rejects a brand or alias as legal identity', () => {
        for (const name of ['PokeTypes', 'poketypes', ' Xarli11 ']) {
            expect(legalStatus(complete({ controller: { name, contactEmail: 'owner@example.test' } })).privacyMissing, name).toContain('controller.name');
        }
    });

    it('privacy is complete once every GDPR item is stated, independent of the LSSI decision', () => {
        const s = legalStatus(complete({ lssi: { applies: null } }));
        expect(s.privacyReady).toBe(true);
        expect(s.decisionMissing).toBe(true);
        expect(s.allReady).toBe(false);
    });

    it('LSSI not applicable: no legal notice is needed and everything is ready', () => {
        const s = legalStatus(complete());
        expect(s.noticeEnabled).toBe(false);
        expect(s.allReady).toBe(true);
    });

    it('LSSI applicable: NIF and address are required, and a non-residence address needs legal confirmation', () => {
        let s = legalStatus(complete({ lssi: { applies: true } }));
        expect(s.noticeMissing).toEqual(expect.arrayContaining(['lssi.taxId', 'lssi.address', 'lssi.addressKind']));
        s = legalStatus(complete({ lssi: { applies: true, taxId: 'x', address: 'x', addressKind: 'other' } }));
        expect(s.noticeMissing).toEqual(['lssi.addressLegallyConfirmed']);
        expect(s.allReady).toBe(false);
        s = legalStatus(complete({ lssi: { applies: true, taxId: 'x', address: 'x', addressKind: 'other', addressLegallyConfirmed: true } }));
        expect(s.allReady).toBe(true);
        s = legalStatus(complete({ lssi: { applies: true, taxId: 'x', address: 'x', addressKind: 'residence' } }));
        expect(s.allReady).toBe(true);
    });

    it('overrides merge deeply over the defaults and ignore unset keys', () => {
        const d = buildLegal({ providers: { google: { role: 'r' } } });
        expect(d.providers.google).toEqual({ role: 'r', transfer: null });
        expect(d.providers.github).toEqual({ role: null, transfer: null });
    });
});

describe('publication gate (legalAccess)', () => {
    it('production hosts get nothing while incomplete', () => {
        for (const host of ['poketypes.app', 'www.poketypes.app']) {
            const a = legalAccess(host, buildLegal());
            expect(a.privacyVisible, host).toBe(false);
            expect(a.noticeVisible, host).toBe(false);
        }
    });

    it('previews and localhost get a draft', () => {
        for (const host of ['localhost', 'feature-privacy-consent.poketypes.pages.dev']) {
            const a = legalAccess(host, buildLegal());
            expect(a.privacyVisible, host).toBe(true);
            expect(a.draft, host).toBe(true);
        }
    });

    it('production shows the privacy policy when complete, and the notice only when art. 10 applies and is complete', () => {
        expect(legalAccess('poketypes.app', complete()).privacyVisible).toBe(true);
        expect(legalAccess('poketypes.app', complete()).noticeVisible).toBe(false);
        const partial = complete({ lssi: { applies: true } });
        expect(legalAccess('poketypes.app', partial).noticeVisible).toBe(false);
        const full = complete({ lssi: { applies: true, taxId: 'x', address: 'x', addressKind: 'residence' } });
        expect(legalAccess('poketypes.app', full).noticeVisible).toBe(true);
    });
});

describe('wiring', () => {
    it('pages answer 404 through the gate and drafts are noindex', () => {
        const privacy = read('src/pages/privacy.astro');
        const notice = read('src/pages/legal.astro');
        expect(privacy).toContain("if (!access.privacyVisible) return Astro.rewrite('/404');");
        expect(notice).toContain("if (!access.noticeVisible) return Astro.rewrite('/404');");
        expect(privacy).toContain("'noindex, nofollow'");
        expect(notice).toContain("'noindex, nofollow'");
    });

    it('the build injects the owner data from the environment, not from Git', () => {
        const cfg = read('astro.config.mjs');
        expect(cfg).toContain('process.env.POKETYPES_LEGAL');
        expect(cfg).toContain('__LEGAL_OVERRIDES__');
    });

    it('LSSI identification lives in /legal, not in the privacy policy', () => {
        const privacy = read('src/pages/privacy.astro');
        expect(privacy).not.toMatch(/taxId|lssi\.address|NIF/);
        expect(read('src/pages/legal.astro')).toMatch(/LSSI-CE/);
    });
});
