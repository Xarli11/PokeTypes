import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import pokedex from '../src/data/pokedex.json';
import { resolveEsRequest } from '../src/lib/es-routes.js';
import { renderLangSwitch } from '../src/lib/lang-switch.js';
import { noticeFor } from '../src/lib/lang-notice.js';
import { PILOT_PAGES, ES_PILOT_ENABLED, sitemapSpanishPaths, isPilotPage } from '../src/lib/i18n-pilot.js';
import { pokemonSlug } from '../src/lib/seo.js';
import { createT } from '../src/lib/i18n-server.js';
import { messages } from '../src/js/lang/messages.js';
import { GET as getSitemap } from '../src/pages/sitemap.xml.ts';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const ON = true;

describe('resolveEsRequest: switch OFF (the default)', () => {
    it('every /es request is a plain 404', () => {
        expect(ES_PILOT_ENABLED).toBe(false);
        for (const [kind, param, path] of [['home', undefined, '/es'], ['tipo', 'fuego', '/es/tipo/fuego'], ['pokemon', 'pikachu', '/es/pokemon/pikachu'], ['tipo', 'agua', '/es/tipo/agua']]) {
            expect(resolveEsRequest(kind, param, path)).toEqual({ status: 404, englishPath: null });
        }
    });
});

describe('resolveEsRequest: pilot ON', () => {
    const r = (kind, param, path) => resolveEsRequest(kind, param, path, ON);

    it('home: /es is served, /es/ redirects to /es', () => {
        expect(r('home', undefined, '/es')).toEqual({ status: 200 });
        expect(r('home', undefined, '/es/')).toEqual({ status: 301, location: '/es' });
    });

    it('the 3 pilot type pages are served', () => {
        for (const slug of ['fuego', 'fantasma', 'fuego-volador']) expect(r('tipo', slug, `/es/tipo/${slug}`)).toEqual({ status: 200 });
    });

    it.each([
        ['volador-fuego', '/es/tipo/fuego-volador'],  // permutation
        ['fuego-fuego', '/es/tipo/fuego'],            // duplicate
        ['Fuego-Volador', '/es/tipo/fuego-volador'],  // case
        ['fire-flying', '/es/tipo/fuego-volador'],    // English alias
        ['flying-fire', '/es/tipo/fuego-volador'],    // alias + permutation
        ['fire', '/es/tipo/fuego'],
        ['ghost', '/es/tipo/fantasma']
    ])('/es/tipo/%s -> 301 %s', (slug, canonical) => {
        expect(r('tipo', slug, `/es/tipo/${slug}`)).toEqual({ status: 301, location: canonical });
    });

    it('trailing slash on a pilot type page redirects to the canonical URL', () => {
        expect(r('tipo', 'fuego', '/es/tipo/fuego/')).toEqual({ status: 301, location: '/es/tipo/fuego' });
    });

    it('a valid type page that is not in the pilot is a 404 with a link to its English page, never a redirect to a 404', () => {
        expect(r('tipo', 'agua', '/es/tipo/agua')).toEqual({ status: 404, englishPath: '/tipo/water' });
        expect(r('tipo', 'volador-agua', '/es/tipo/volador-agua')).toEqual({ status: 404, englishPath: '/tipo/water-flying' });
        expect(r('tipo', 'water', '/es/tipo/water')).toEqual({ status: 404, englishPath: '/tipo/water' }); // alias of a non-pilot page
    });

    it('invalid type slugs are a 404 (no English equivalent)', () => {
        for (const slug of ['xyz', 'fuego-xyz', 'fuego-volador-agua-hada', 'psíquico', 'fuego--agua']) {
            const result = r('tipo', slug, `/es/tipo/${slug}`);
            expect(result.status).toBe(404);
            expect(result.englishPath ?? null).toBeNull();
        }
    });

    it('pilot Pokemon are served; uppercase and trailing slash redirect', () => {
        for (const slug of ['pikachu', 'charizard', 'charizard-mega-x', 'gengar']) {
            expect(r('pokemon', slug, `/es/pokemon/${slug}`)).toEqual({ status: 200 });
        }
        expect(r('pokemon', 'Pikachu', '/es/pokemon/Pikachu')).toEqual({ status: 301, location: '/es/pokemon/pikachu' });
        expect(r('pokemon', 'gengar', '/es/pokemon/gengar/')).toEqual({ status: 301, location: '/es/pokemon/gengar' });
    });

    it('every other Pokemon (and unknown slugs) is a 404; the existing ones link to their English page', () => {
        const pilot = new Set(PILOT_PAGES.map(p => p.es));
        let checked = 0;
        for (const slug of new Set(pokedex.map(pokemonSlug))) {
            if (pilot.has(`/es/pokemon/${slug}`)) continue;
            const result = r('pokemon', slug, `/es/pokemon/${slug}`);
            expect(result.status).toBe(404);
            expect(result.englishPath).toBe(`/pokemon/${slug}`);
            checked++;
        }
        expect(checked).toBe(new Set(pokedex.map(pokemonSlug)).size - 4);
        expect(r('pokemon', 'zzz', '/es/pokemon/zzz')).toEqual({ status: 404, englishPath: null });
    });

    it('no response is ever a redirect to a URL that is not a pilot page', () => {
        const probes = [['home', undefined, '/es/'], ['tipo', 'fire-flying', '/es/tipo/fire-flying'], ['tipo', 'agua-fuego', '/es/tipo/agua-fuego'], ['pokemon', 'PIKACHU', '/es/pokemon/PIKACHU'], ['tipo', 'fuego', '/es/tipo/fuego/']];
        for (const [kind, param, path] of probes) {
            const result = r(kind, param, path);
            if (result.status === 301) expect(isPilotPage(result.location, ON)).toBe(true);
        }
    });
});

describe('language selector (server and browser share this code)', () => {
    const en = createT('en').t;
    const es = createT('es').t;
    const render = (lang, pathname) => renderLangSwitch({ lang, pathname, t: lang === 'es' ? es : en, enabled: ON });

    it('an English page with a Spanish version links to it (full navigation, hreflang)', () => {
        const html = render('en', '/tipo/fire-flying');
        expect(html).toContain('<a id="lang-toggle"');
        expect(html).toContain('href="/es/tipo/fuego-volador"');
        expect(html).toContain('hreflang="es"');
        expect(html).toContain('>ES</a>');
    });

    it('a Spanish page links to its English page', () => {
        const html = render('es', '/es/tipo/fuego');
        expect(html).toContain('href="/tipo/fire"');
        expect(html).toContain('hreflang="en"');
        expect(html).toContain('>EN</a>');
        expect(render('es', '/es')).toContain('href="/"');
    });

    it('an English page without a Spanish version never links to /es: it is a disabled button that says why', () => {
        for (const path of ['/tipo/water', '/pokemon/bulbasaur', '/tipo/water-flying']) {
            const html = render('en', path);
            expect(html).toContain('<button id="lang-toggle"');
            expect(html).toContain('aria-disabled="true"');
            expect(html).toContain('data-unavailable');
            expect(html).not.toContain('href=');
            expect(html).toContain(messages.en.spanish_unavailable);
        }
    });

    it('the accessible name contains the visible text (WCAG 2.5.3) in every state', () => {
        for (const [lang, path] of [['en', '/tipo/fire'], ['es', '/es/tipo/fuego'], ['en', '/tipo/water'], ['en', '/']]) {
            const html = render(lang, path);
            const label = html.match(/aria-label="([^"]*)"/)[1];
            const visible = html.match(/>([A-Z]{2})<\/(a|button)>/)[1];
            expect(label.startsWith(visible)).toBe(true);
        }
    });

    it('with the pilot off no page has a Spanish version', () => {
        const html = renderLangSwitch({ lang: 'en', pathname: '/tipo/fire', t: en, enabled: false });
        expect(html).toContain('data-unavailable');
    });
});

describe('language notice (English page, visitor who wants Spanish)', () => {
    const n = o => noticeFor({ enabled: ON, ...o });

    it('nothing for visitors without a Spanish signal, on Spanish pages, when dismissed or when the pilot is off', () => {
        expect(n({ pathname: '/tipo/water' })).toBeNull();
        expect(n({ pathname: '/tipo/water', storedLang: 'en' })).toBeNull();
        expect(n({ pathname: '/es/tipo/fuego', storedLang: 'es' })).toBeNull();
        expect(n({ pathname: '/tipo/water', storedLang: 'es', dismissed: true })).toBeNull();
        expect(noticeFor({ pathname: '/tipo/water', storedLang: 'es', enabled: false })).toBeNull();
    });

    it('a saved Spanish preference or coming from a Spanish page triggers it', () => {
        expect(n({ pathname: '/tipo/water', storedLang: 'es' })).toEqual({ kind: 'unavailable' });
        expect(n({ pathname: '/tipo/water', cameFromSpanish: true })).toEqual({ kind: 'unavailable' });
    });

    it('offers the Spanish version when there is one', () => {
        expect(n({ pathname: '/', storedLang: 'es' })).toEqual({ kind: 'available', href: '/es' });
        expect(n({ pathname: '/tipo/fire-flying', cameFromSpanish: true })).toEqual({ kind: 'available', href: '/es/tipo/fuego-volador' });
    });

    it('says nothing on pages the app does not translate (privacy page...)', () => {
        expect(n({ pathname: '/privacy', storedLang: 'es' })).toBeNull();
    });
});

describe('sitemap', () => {
    it('lists no Spanish URL while the pilot is off, and exactly the 8 pilot pages when on', async () => {
        const xml = await (await getSitemap({})).text();
        expect(xml).not.toContain('poketypes.app/es');
        expect(sitemapSpanishPaths()).toEqual([]);
        expect(sitemapSpanishPaths(ON)).toHaveLength(8);
        expect(sitemapSpanishPaths(ON)).toEqual(PILOT_PAGES.map(p => p.es));
    });
});

describe('wiring', () => {
    it('the three routes apply resolveEsRequest and answer 301/404 as decided', () => {
        for (const f of ['src/pages/es/index.astro', 'src/pages/es/tipo/[...slug].astro', 'src/pages/es/pokemon/[name].astro']) {
            const src = read(f);
            expect(src).toMatch(/resolveEsRequest\(/);
            expect(src).toMatch(/Astro\.redirect\(result\.location, 301\)/);
            expect(src).toMatch(/Astro\.rewrite\('\/404'\)/);
        }
    });

    it('the 404 page really answers 404 (not a soft 404) and has one <main>', () => {
        const page = read('src/components/pages/EsNotFound.astro');
        expect(page).toMatch(/Astro\.response\.status = 404/);
        expect((page.match(/<main>/g) || []).length).toBe(1);
    });

    it('the client does not use the legacy in-place language toggle when the pilot is on, and navigates (not pushState) across languages', () => {
        const main = read('src/js/main.js');
        expect(main).toMatch(/langToggle && !ES_PILOT_ENABLED/);
        expect(main).toMatch(/window\.location\.assign\(next\.url\)/);
        expect(main).toMatch(/urlForState\(state, 'es'\)/);
        expect(read('src/js/modules/i18n.js')).toMatch(/ES_PILOT_ENABLED \? getLangFromPath/);
    });

    it('with the pilot off the header still renders the original button', () => {
        expect(read('src/components/AppHeader.astro')).toMatch(/aria-label=\{t\('toggle_language'\)\}/);
    });
});
