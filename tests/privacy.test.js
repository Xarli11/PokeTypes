import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { messages } from '../src/js/lang/messages.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const layout = read('src/layouts/Layout.astro');

describe('ads.txt', () => {
    it('has exactly the AdSense DIRECT line for the publisher id used in Layout', () => {
        const pub = layout.match(/client=ca-(pub-\d+)/)[1];
        const lines = read('public/ads.txt').split(/\r?\n/).filter(Boolean);
        expect(lines).toEqual([`google.com, ${pub}, DIRECT, f08c47fec0942fa0`]);
    });
});

describe('Consent Mode v2 in Layout', () => {
    const at = s => layout.indexOf(s);

    it('declares consent default (all four signals denied) before the gtag loader and config', () => {
        const def = at("gtag('consent', 'default'");
        expect(def).toBeGreaterThan(-1);
        expect(def).toBeLessThan(at('googletagmanager.com/gtag/js'));
        expect(def).toBeLessThan(at("gtag('config', 'G-"));
        const block = layout.slice(def, layout.indexOf('});', def));
        for (const k of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) {
            expect(block).toMatch(new RegExp(`'${k}': 'denied'`));
        }
        expect(block).not.toMatch(/granted/);
    });

    it('consent updates only happen inside the CMP callback, never at page load', () => {
        const callback = layout.indexOf('CONSENT_MODE_DATA_READY');
        expect(callback).toBeGreaterThan(-1);
        const updates = [...layout.matchAll(/'consent',\s*'update'/g)].map(m => m.index);
        expect(updates.length).toBeGreaterThan(0);
        for (const at of updates) expect(at).toBeGreaterThan(callback);
    });

    it('prepares the CMP callback queue and does not enable Auto ads from code', () => {
        expect(layout).toContain('window.googlefc.callbackQueue');
        expect(layout).not.toMatch(/enable_page_level_ads|data-ad-client|google_ad_client/);
    });
});

describe('legal links', () => {
    it('every page that renders the app includes the footer, which links /privacy and the settings button', () => {
        for (const p of ['src/pages/index.astro', 'src/pages/pokemon/[name].astro', 'src/pages/tipo/[...slug].astro', 'src/pages/privacy.astro']) {
            expect(read(p), p).toContain('<LegalFooter />');
        }
        const footer = read('src/components/LegalFooter.astro');
        expect(footer).toContain('href="/privacy"');
        expect(footer).toContain('href="/privacy#cookies"');
        expect(footer).toContain('id="privacy-settings"');
        expect(footer).toContain('showRevocationMessage');
    });

    it('footer labels exist in en and es', () => {
        for (const k of ['footer_privacy', 'footer_cookies', 'footer_privacy_settings']) {
            expect(messages.en[k], `en.${k}`).toBeTruthy();
            expect(messages.es[k], `es.${k}`).toBeTruthy();
            if (k !== 'footer_cookies') expect(messages.es[k]).not.toBe(messages.en[k]);
        }
    });

    it('the CMP logo is an existing 512x512 PNG', () => {
        expect(existsSync(new URL('../public/icon-512.png', import.meta.url))).toBe(true);
        const png = readFileSync(new URL('../public/icon-512.png', import.meta.url));
        expect(png.subarray(1, 4).toString()).toBe('PNG');
        expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([512, 512]);
    });
});

describe('owner-only legal data', () => {
    it('pages mark pending fields visibly in both languages', () => {
        const privacy = read('src/pages/privacy.astro');
        expect(privacy).toContain('To be completed by the site owner');
        expect(privacy).toContain('Pendiente de completar por el titular');
    });
});
