import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import typeData from '../src/data/type-data.json';
import { canonicalTypeSlug, parseTypeSlug } from '../src/lib/seo.js';
import { GET as getSitemap } from '../src/pages/sitemap.xml.ts';

const root = new URL('..', import.meta.url).pathname;
const read = rel => readFileSync(join(root, rel), 'utf8');
const { types, contrast } = typeData;

// ── WCAG helpers ────────────────────────────────────────────────────────────
const lum = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

describe('type pill contrast (WCAG AA, small bold text = 4.5:1)', () => {
    const css = read('src/styles/global.css');
    const textColor = { dark: css.match(/\.type-text-dark\s*\{\s*color:\s*(#[0-9a-f]{6})/i)[1], light: css.match(/\.type-text-light\s*\{\s*color:\s*(#[0-9a-f]{6})/i)[1] };

    it.each(types)('%s: text colour chosen by the contrast map is readable', type => {
        const bg = css.match(new RegExp(`\\.bg-type-${type.toLowerCase()}\\s*\\{\\s*background-color:\\s*(#[0-9a-f]{6})`, 'i'))[1];
        expect(ratio(bg, textColor[contrast[type]])).toBeGreaterThanOrEqual(4.5);
    });

    it('covers every type and uses only dark|light', () => {
        expect(Object.keys(contrast).sort()).toEqual([...types].sort());
        Object.values(contrast).forEach(v => expect(['dark', 'light']).toContain(v));
    });

    it('light-theme status colours stay readable on their 14% tinted badges', () => {
        const light = read('src/styles/global.css').split('.dark {')[0];
        const get = n => light.match(new RegExp(`--${n}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
        const mix = (fg, pct) => { // fg over white at pct, like color-mix(..., transparent) on a white panel
            const c = [1, 3, 5].map(i => Math.round(parseInt(fg.slice(i, i + 2), 16) * pct + 255 * (1 - pct)));
            return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
        };
        for (const n of ['warning', 'success', 'danger']) expect(ratio(get(n), mix(get(n), 0.14))).toBeGreaterThanOrEqual(4.5);
    });

    it('dark-theme muted text and danger colour stay readable on their tinted backgrounds', () => {
        const dark = read('src/styles/global.css').split('.dark {')[1];
        const muted = dark.match(/--text-muted:\s*(#[0-9a-f]{6})/i)[1];
        const danger = dark.match(/--danger:\s*(#[0-9a-f]{6})/i)[1];
        expect(ratio(muted, '#292f3a')).toBeGreaterThanOrEqual(4.5); // badge on --border tint
        expect(ratio(danger, '#301c25')).toBeGreaterThanOrEqual(4.5); // .mult-critical tint
    });
});

describe('landmarks and headings', () => {
    it.each(['src/pages/index.astro', 'src/pages/tipo/[...slug].astro', 'src/pages/pokemon/[name].astro'])(
        '%s has exactly one <main> that contains the page content, after the header',
        file => {
            const src = read(file);
            expect((src.match(/<main[\s>]/g) || []).length).toBe(1);
            expect((src.match(/<\/main>/g) || []).length).toBe(1);
            expect(src.indexOf('<AppHeader')).toBeLessThan(src.indexOf('<main'));
            expect(src).toMatch(/<main>[\s\S]*id="view-simple"[\s\S]*<\/main>/);
        }
    );

    it('injected panels use <h2> (never skip from the page <h1> to an <h3>)', () => {
        const ui = read('src/js/modules/ui.js');
        expect(ui).toMatch(/<h2[^>]*>\$\{i18n\.t\('advisor_title'\)\}<\/h2>/);
        expect(ui).toMatch(/<h2[^>]*>\$\{i18n\.t\('comp_analysis'\)/);
        expect(ui).not.toMatch(/<h3[^>]*>\$\{i18n\.t\('advisor_title'\)/);
    });
});

describe('touch targets', () => {
    it('type help badge is at least 24x24 CSS px (WCAG 2.2 target size)', () => {
        const css = read('src/styles/global.css');
        const rule = css.match(/\.type-selector-help summary\s*\{[^}]*\}/)[0];
        expect(rule).toMatch(/\bw-6\b/);
        expect(rule).toMatch(/\bh-6\b/);
    });
});

describe('social image references', () => {
    it('never references the non-existent /og-image.png', () => {
        const walk = dir => readdirSync(dir).flatMap(f => {
            const p = join(dir, f);
            return statSync(p).isDirectory() ? walk(p) : [p];
        });
        const offenders = [...walk(join(root, 'src')), ...walk(join(root, 'public'))]
            .filter(f => /\.(astro|js|ts|json|html|webmanifest)$/.test(f))
            .filter(f => readFileSync(f, 'utf8').includes('og-image.png'));
        expect(offenders).toEqual([]);
    });

    it('the default og:image in Layout exists in /public', () => {
        const m = read('src/layouts/Layout.astro').match(/image\s*=\s*"(\/[^"]+)"/);
        expect(m).not.toBeNull();
        expect(existsSync(join(root, 'public', m[1]))).toBe(true);
    });
});

describe('one URL per type combination', () => {
    it('canonicalTypeSlug orders by type chart, lowercases and de-duplicates', () => {
        expect(canonicalTypeSlug(['Flying', 'Fire'], types)).toBe('fire-flying');
        expect(canonicalTypeSlug(['Fire', 'Flying'], types)).toBe('fire-flying');
        expect(canonicalTypeSlug(['Fire', 'Fire'], types)).toBe('fire');
        expect(canonicalTypeSlug(['Water', 'Fire', 'Flying'], types)).toBe('fire-water-flying');
    });

    it('every permutation of a combination maps to the same slug', () => {
        const perms = [['Rock', 'Ground'], ['Ground', 'Rock']];
        const slugs = perms.map(p => canonicalTypeSlug(p, types));
        expect(new Set(slugs).size).toBe(1);
        expect(slugs[0]).toBe('ground-rock');
    });

    it('is a fixed point: re-parsing a canonical slug yields the same slug', () => {
        for (const a of types) for (const b of types) {
            const slug = canonicalTypeSlug([a, b], types);
            expect(canonicalTypeSlug(parseTypeSlug(slug, types), types)).toBe(slug);
        }
    });

    it('type effectiveness is order independent (why one URL is enough)', async () => {
        const { calculateDefense, calculateOffense } = await import('../src/lib/type-engine/index.js');
        const { effectiveness } = typeData;
        for (const a of types) for (const b of types) {
            if (a === b) continue;
            expect(calculateDefense(a, b, types, effectiveness)).toEqual(calculateDefense(b, a, types, effectiveness));
            expect(calculateOffense(a, b, types, effectiveness)).toEqual(calculateOffense(b, a, types, effectiveness));
        }
    });

    it('every /tipo/ URL in the sitemap is already canonical (no redirect targets)', async () => {
        const xml = await (await getSitemap({})).text();
        const slugs = [...xml.matchAll(/<loc>https:\/\/poketypes\.app\/tipo\/([^<]+)<\/loc>/g)].map(m => m[1]);
        expect(slugs.length).toBeGreaterThan(18);
        for (const slug of slugs) expect(canonicalTypeSlug(parseTypeSlug(slug, types), types)).toBe(slug);
    });

    it('the /tipo page redirects non-canonical slugs with a 301', () => {
        const page = read('src/pages/tipo/[...slug].astro');
        expect(page).toMatch(/slug !== canonicalSlug\) return Astro\.redirect\(`\/tipo\/\$\{canonicalSlug\}`, 301\)/);
    });

    it('client URL sync builds paths with statePath, whose English slugs equal canonicalTypeSlug (tests/i18n-routes.test.js)', () => {
        expect(read('src/js/main.js')).toMatch(/statePath\(\{/);
    });
});
