import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';

// Renders the real pages through Astro's dev server and inspects the final HTML. /privacy and /legal are
// the CMP privacy policy URL: Google requires them to carry no ad tags, no scripts that need consent and
// no Funding Choices message tag. The calculator must keep all of them.
const complete = {
    controller: { name: 'Test Person', contactEmail: 'owner@example.test' },
    legalBases: { hosting: 'x', calculator: 'x', analytics: 'x', advertising: 'x' },
    providers: Object.fromEntries(['google', 'cloudflare', 'pokeapi', 'github', 'showdown'].map(k => [k, { role: 'x', transfer: 'x' }])),
    retention: { analytics: 'x', serverLogs: 'x', consentRecord: 'x' },
    minors: { en: 'x', es: 'x' }, supervisoryAuthority: 'x',
    lssi: { applies: true, taxId: 'x', address: 'x', addressKind: 'residence' }
};

const freePort = () => new Promise((resolve, reject) => {
    const s = createServer();
    s.on('error', reject);
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
});

let server, base;
const html = {};

beforeAll(async () => {
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    // Separate process: the dev server must not share Vitest's module graph. Owner data comes from the build variable.
    server = spawn(process.execPath, ['node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', String(port)], {
        env: { ...process.env, POKETYPES_LEGAL: JSON.stringify(complete) }, stdio: 'ignore'
    });
    for (let i = 0; i < 100; i++) {
        try { if ((await fetch(base + '/privacy')).status) break; } catch { await new Promise(r => setTimeout(r, 500)); }
    }
    for (const path of ['/', '/privacy', '/legal']) {
        const res = await fetch(base + path);
        expect(res.status, path + (res.status === 200 ? '' : ' ' + (await res.clone().text()).slice(0, 1500))).toBe(200);
        html[path] = await res.text();
    }
}, 120000);

afterAll(() => {
    server?.kill();
});

const GOOGLE_TAGS = /adsbygoogle|googlesyndication|googletagmanager|googlefc|fundingchoices|gtag\(|dataLayer|ca-pub-|__tcfapi|showRevocationMessage/i;

describe.each(['/privacy', '/legal'])('%s final HTML carries no Google tags', path => {
    it('has no AdSense, Funding Choices, Analytics or consent script anywhere', () => {
        expect(html[path]).not.toMatch(GOOGLE_TAGS);
    });

    it('has no script or resource hint pointing at Google', () => {
        const refs = [...html[path].matchAll(/<(?:script|link|iframe|img)\b[^>]*?\b(?:src|href)="(https?:[^"]+)"/gi)].map(m => m[1]);
        expect(refs.filter(u => /google|doubleclick|gstatic/i.test(u))).toEqual([]);
    });

    it('keeps local fonts, the theme script and the icons', () => {
        expect(html[path]).toContain('href="/fonts/syne-latin.woff2"');
        expect(html[path]).toContain('href="/fonts/outfit-latin.woff2"');
        expect(html[path]).toContain("localStorage.theme");
        expect(html[path]).toContain('href="/icon-192.png"');
        expect(html[path]).not.toContain('fonts.googleapis.com');
    });

    it('has no CMP settings button (nothing to reopen without the CMP)', () => {
        expect(html[path]).not.toContain('id="privacy-settings"');
    });
});

describe('legal links still work', () => {
    const hrefs = page => [...html[page].matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)].map(m => m[1]);

    it('/privacy links to /, /legal and its own cookies section; the anchors exist', () => {
        const links = hrefs('/privacy');
        expect(links).toContain('/');
        expect(links).toContain('/legal');
        expect(links).toContain('/privacy#cookies');
        expect(html['/privacy']).toContain('id="cookies"');
        expect(html['/privacy']).toContain('id="cookies-es"');
    });

    it('/legal links to /, /privacy and the cookies section', () => {
        const links = hrefs('/legal');
        expect(links).toContain('/');
        expect(links).toContain('/privacy');
        expect(links).toContain('/privacy#cookies');
    });

    it('every internal legal link answers 200', async () => {
        for (const page of ['/privacy', '/legal']) {
            for (const href of new Set(hrefs(page).map(h => h.split('#')[0]))) {
                if (!['/', '/privacy', '/legal'].includes(href)) continue;
                expect((await fetch(base + href)).status, `${page} -> ${href}`).toBe(200);
            }
        }
    });
});

describe('the calculator and the other pages are unchanged', () => {
    it('the home page keeps AdSense, the consent mode script, the CMP queue and the settings button', () => {
        const home = html['/'];
        expect(home).toContain('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5778743399428042');
        expect(home).toContain("gtag('consent', 'default'");
        expect(home).toContain('CONSENT_MODE_DATA_READY');
        expect(home).toContain('ga-disable-G-9D59NL7KTH');
        expect(home).toContain('id="privacy-settings"');
        expect(home).toContain('showRevocationMessage');
        expect(home).toContain('rel="dns-prefetch" href="https://pagead2.googlesyndication.com"');
    });

    it('the home page does not request gtag.js statically', () => {
        expect(html['/']).not.toMatch(/<script[^>]*src="https:\/\/www\.googletagmanager\.com/);
    });
});
