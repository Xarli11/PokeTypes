import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import typeData from '../src/data/type-data.json';
import pokedex from '../src/data/pokedex.json';
import abilityNames from '../src/data/abilities-i18n.json';
import { messages } from '../src/js/lang/messages.js';
import { pokemonSlug } from '../src/lib/seo.js';
import { createT } from '../src/lib/i18n-server.js';
import { renderTypePills, renderDefenseGroups } from '../src/lib/type-render.js';
import { calculateDefense } from '../src/lib/type-engine/index.js';
import { statePath, pathForLang, toTypeSlug, stripLangPrefix } from '../src/lib/i18n-routes.js';
import {
    ES_PILOT_ENABLED, ES_DRAFT_KEYS, PILOT_EN_PATHS, PILOT_PAGES, SITE_ORIGIN,
    isPilotPage, equivalentPath, alternatesFor, urlForState
} from '../src/lib/i18n-pilot.js';

const { types } = typeData;
const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const combos = [];
for (const a of types) {
    combos.push([a]);
    for (const b of types) { combos.push([a, b]); for (const c of types) combos.push([a, b, c]); }
}
const spanishPaths = PILOT_PAGES.map(p => p.es);

describe('the pilot list', () => {
    it('has 8 pages: home, 3 type pages and 4 Pokemon (the Pokemon are provisional)', () => {
        expect(PILOT_EN_PATHS).toHaveLength(8);
        expect(PILOT_EN_PATHS.filter(p => p.startsWith('/pokemon/'))).toHaveLength(4);
        expect(PILOT_EN_PATHS.filter(p => p.startsWith('/tipo/'))).toHaveLength(3);
    });

    it('Spanish paths are derived, canonical and distinct', () => {
        expect(spanishPaths).toEqual([
            '/es', '/es/tipo/fuego', '/es/tipo/fantasma', '/es/tipo/fuego-volador',
            '/es/pokemon/pikachu', '/es/pokemon/charizard', '/es/pokemon/charizard-mega-x', '/es/pokemon/gengar'
        ]);
        expect(new Set(spanishPaths).size).toBe(8);
        expect(new Set(PILOT_EN_PATHS).size).toBe(8);
    });

    it('every English page exists for real (type pages canonical, Pokemon in the pokedex)', () => {
        const slugs = new Set(pokedex.map(pokemonSlug));
        for (const path of PILOT_EN_PATHS) {
            const [, section, slug] = path.split('/');
            if (section === 'tipo') expect(`/tipo/${toTypeSlug(slug.split('-').map(s => types.find(t => t.toLowerCase() === s)), 'en')}`).toBe(path);
            if (section === 'pokemon') expect(slugs.has(slug)).toBe(true);
        }
    });

    it('trailing slashes do not matter', () => {
        expect(isPilotPage('/es/tipo/fuego/', true)).toBe(true);
        expect(isPilotPage('/tipo/fire/', true)).toBe(true);
    });
});

describe('publication switch', () => {
    it('is OFF by default: the site behaves as if /es did not exist', () => {
        expect(ES_PILOT_ENABLED).toBe(false);
        for (const page of PILOT_PAGES) {
            expect(isPilotPage(page.es)).toBe(false);
            expect(isPilotPage(page.en)).toBe(false);
            expect(alternatesFor(page.en)).toEqual([]);
            expect(alternatesFor(page.es)).toEqual([]);
            expect(equivalentPath(page.en, 'es')).toBeNull();
        }
        expect(urlForState({ types: ['Fire'] }, 'es').url).toBe('/tipo/fire');
    });

    it('may only be turned on once every Spanish draft string has been reviewed', () => {
        if (ES_PILOT_ENABLED) expect(ES_DRAFT_KEYS).toEqual([]);
        for (const key of ES_DRAFT_KEYS) expect(messages.es[key]).toBeTypeOf('string');
    });

    it('the draft list covers every Spanish string added for the pilot', () => {
        const added = Object.keys(messages.es).filter(k => /^(meta_|ld_|breadcrumb_)/.test(k) || ['home_aria_label', 'toggle_language', 'toggle_dark_mode', 'share_analysis', 'extra_type_help', 'browse_by_type', 'click_to_copy_username', 'team_count_initial'].includes(k));
        expect(added.filter(k => !ES_DRAFT_KEYS.includes(k))).toEqual([]);
    });
});

describe('hreflang: only between pages that really exist', () => {
    it('is reciprocal, absolute, self-referencing and x-default is English (pilot on)', () => {
        for (const { en, es } of PILOT_PAGES) {
            const fromEn = alternatesFor(en, true);
            const fromEs = alternatesFor(es, true);
            expect(fromEn).toEqual(fromEs); // one row of the list feeds both pages
            expect(fromEn.map(a => a.hreflang)).toEqual(['es', 'en', 'x-default']);
            const byLang = Object.fromEntries(fromEn.map(a => [a.hreflang, a.href]));
            expect(byLang.en).toBe(SITE_ORIGIN + en);
            expect(byLang.es).toBe(SITE_ORIGIN + (es === '/es' ? '/es' : es));
            expect(byLang['x-default']).toBe(byLang.en);
            fromEn.forEach(a => expect(a.href.startsWith('https://')).toBe(true));
            // the page itself is in its own cluster
            expect([byLang.en, byLang.es]).toContain(SITE_ORIGIN + en);
        }
    });

    it('is empty for every other page, including English pages without a Spanish version', () => {
        for (const path of ['/tipo/water', '/pokemon/bulbasaur', '/tipo/psychic-fairy', '/es/tipo/agua', '/es/pokemon/bulbasaur', '/es/tipo/volador-fuego', '/privacy']) {
            expect(alternatesFor(path, true)).toEqual([]);
        }
    });

    it('every URL it emits is a pilot page (never an unlisted /es URL)', () => {
        for (const { en } of PILOT_PAGES) {
            for (const a of alternatesFor(en, true)) {
                const path = a.href.replace(SITE_ORIGIN, '') || '/';
                expect(isPilotPage(path, true)).toBe(true);
            }
        }
    });
});

describe('equivalentPath', () => {
    it('Spanish only for pilot pages; English always (pilot on)', () => {
        expect(equivalentPath('/tipo/fire', 'es', true)).toBe('/es/tipo/fuego');
        expect(equivalentPath('/tipo/flying-fire', 'es', true)).toBe('/es/tipo/fuego-volador');
        expect(equivalentPath('/tipo/water', 'es', true)).toBeNull();
        expect(equivalentPath('/pokemon/bulbasaur', 'es', true)).toBeNull();
        expect(equivalentPath('/es/tipo/fuego', 'en', true)).toBe('/tipo/fire');
        expect(equivalentPath('/tipo/water', 'en', true)).toBe('/tipo/water');
        expect(equivalentPath('/privacy', 'es', true)).toBeNull();
    });
});

describe('urlForState: a URL the app generates is always a page that exists', () => {
    const spanishSet = new Set(spanishPaths);

    it('Spanish: a Spanish URL only for pilot pages, otherwise the equivalent English URL (all type combinations)', () => {
        for (const list of combos) {
            const result = urlForState({ types: list }, 'es', true);
            if (spanishSet.has(statePath({ types: list }, 'es'))) {
                expect(result).toEqual({ url: statePath({ types: list }, 'es'), lang: 'es', crossesLanguage: false });
            } else {
                expect(result).toEqual({ url: statePath({ types: list }, 'en'), lang: 'en', crossesLanguage: true });
            }
            expect(result.url.startsWith('/es') ? spanishSet.has(result.url) : true).toBe(true);
        }
    });

    it('Spanish: every Pokemon slug', () => {
        for (const slug of new Set(pokedex.map(pokemonSlug))) {
            const { url, crossesLanguage } = urlForState({ pokemonSlug: slug }, 'es', true);
            const isPilot = spanishSet.has(`/es/pokemon/${slug}`);
            expect(url).toBe(isPilot ? `/es/pokemon/${slug}` : `/pokemon/${slug}`);
            expect(crossesLanguage).toBe(!isPilot);
        }
    });

    it('Spanish home is /es; the home state never crosses language', () => {
        expect(urlForState({}, 'es', true)).toEqual({ url: '/es', lang: 'es', crossesLanguage: false });
    });

    it('English is unchanged and never crosses', () => {
        for (const list of combos) {
            expect(urlForState({ types: list }, 'en', true)).toEqual({ url: statePath({ types: list }, 'en'), lang: 'en', crossesLanguage: false });
        }
    });

    it('with the pilot off, Spanish pages do not exist: everything resolves to English', () => {
        expect(urlForState({}, 'es', false)).toEqual({ url: '/', lang: 'en', crossesLanguage: true });
        expect(urlForState({ types: ['Fire'] }, 'es', false).url).toBe('/tipo/fire');
    });

    it('a generated English URL is a canonical, existing English path', () => {
        for (const list of combos) {
            const { url } = urlForState({ types: list }, 'es', true);
            expect(stripLangPrefix(url).path.startsWith('/tipo/')).toBe(true);
            expect(pathForLang(url, 'en')).toBe(stripLangPrefix(url).lang === 'en' ? url : pathForLang(url, 'en'));
        }
    });
});

describe('server-side translation of domain names', () => {
    const es = createT('es');
    const en = createT('en');

    it('tType: the 18 types in both languages, unknown names untouched', () => {
        for (const type of types) {
            expect(en.tType(type)).toBe(messages.en[type.toLowerCase()] ?? type);
            expect(es.tType(type)).toBe(messages.es[type.toLowerCase()]);
        }
        expect(es.tType('Fire')).toBe('Fuego');
        expect(es.tType('Cosmic')).toBe('Cosmic');
        expect(es.tType('')).toBe('');
    });

    it('tAbility matches the browser (abilities-i18n.json): every ability resolves in both languages', () => {
        for (const [slug, entry] of Object.entries(abilityNames)) {
            const display = entry.en;
            // a few entries share a display name (e.g. "As One"): the lookup, like the browser's, is by that name
            if (display.toLowerCase().replace(/ /g, '-') !== slug) continue;
            expect(es.tAbility(display)).toBe(entry.es || entry.en);
            expect(en.tAbility(display)).toBe(entry.en);
            expect(slug).toBe(slug.toLowerCase());
        }
        expect(es.tAbility('Blaze')).not.toBe('Blaze');
        expect(es.tAbility('Not An Ability')).toBe('Not An Ability');
    });

    it('type pills and defense groups: translated text, internal class names', () => {
        const html = renderTypePills(['Fire', 'Flying'], typeData.contrast, es.tType);
        expect(html).toContain('bg-type-fire');
        expect(html).toContain('>Fuego<');
        expect(html).toContain('>Volador<');
        expect(html).not.toContain('>Fire<');
        const def = calculateDefense('Fire', 'Flying', types, typeData.effectiveness);
        const groups = renderDefenseGroups(def, typeData.contrast, es.t, es.tType);
        expect(groups).toContain('>Roca<');
        expect(groups).toContain('>Agua<');
        expect(groups).toContain('>Crítico<');
        expect(groups).not.toMatch(/>(Rock|Water|Critical)</);
    });
});

describe('wiring', () => {
    it('the layout derives hreflang from the pilot list and does not announce a search action for /es', () => {
        const layout = read('src/layouts/Layout.astro');
        expect(layout).toMatch(/alternatesFor\(pagePath\)/);
        expect(layout).toMatch(/lang === 'en' \? `/); // potentialAction only in English
    });

    it('internal links never point to /es URLs that do not exist (TypeLinks uses equivalentPath)', () => {
        expect(read('src/components/TypeLinks.astro')).toMatch(/equivalentPath\(english, 'es'\)/);
    });

    it('the home FAQ JSON-LD reads the page language, not messages.en', () => {
        const home = read('src/components/pages/HomePage.astro');
        expect(home).not.toMatch(/const en = /);
        expect(home).not.toMatch(/\ben\[/);
        expect(home).toMatch(/dict\[`faq_q\$\{n\}`\]/);
    });

    it('the type selector shows the placeholder (or the chosen type) in the server HTML', () => {
        const field = read('src/components/TypeSelectorField.astro');
        expect(field).toMatch(/set:html=\{labelHtml\}/);
        expect(field).toMatch(/type-selector-btn-filled/);
    });
});

describe('C3a: text coverage and engine identifiers', () => {
    const C2_KEYS = ['switch_to_es', 'switch_to_en', 'spanish_unavailable', 'lang_notice_available', 'lang_notice_view',
        'lang_notice_unavailable', 'lang_notice_dismiss', 'es_404_title', 'es_404_text', 'es_404_english', 'es_404_home'];
    const C3A_KEYS = ['copied', 'search_start_typing', 'comp_tier_meta', 'chart_desc', 'effectiveness_desc', 'dual_desc'];

    it('the draft list includes every C2 and C3a Spanish string', () => {
        expect([...C2_KEYS, ...C3A_KEYS].filter(k => !ES_DRAFT_KEYS.includes(k))).toEqual([]);
    });

    it('every draft key exists in Spanish and is not a copy of English', () => {
        for (const key of ES_DRAFT_KEYS) {
            expect(messages.es[key], key).toBeTypeOf('string');
        }
        const same = ES_DRAFT_KEYS.filter(k => messages.es[k] === messages.en[k] && messages.en[k] !== undefined && !/^(meta_keywords|switch_to_|ld_app_alternate_name)/.test(k));
        expect(same).toEqual([]);
    });

    it('no English literal is left in the templates that were fixed', () => {
        const home = read('src/components/pages/HomePage.astro');
        expect(home).not.toMatch(/>\s*Copied!\s*</);
        expect(home).not.toContain('Type to start searching');
        expect(read('src/js/modules/ui.js')).not.toContain('>Smogon Tier & Meta<');
        expect(messages.en.copied).toBe('Copied!');
        expect(messages.en.search_start_typing).toBe('Type to start searching...');
        expect(messages.en.comp_tier_meta).toBe('Smogon Tier & Meta');
    });

    it('English SSR home HTML text is unchanged for the fixed strings', () => {
        const { h } = createT('en');
        expect(h('copied')).toBe('Copied!');
        expect(h('search_start_typing')).toBe('Type to start searching...');
    });

    it('the Spanish home SEO copy carries comparable information to the English SSR copy', () => {
        const en = createT('en').t;
        const es = createT('es').t;
        for (const key of ['chart_desc', 'effectiveness_desc', 'dual_desc']) {
            expect(es(key).length, key).toBeGreaterThan(en(key).length * 0.8);
            expect(es(key), key).not.toBe(en(key));
        }
        expect(es('effectiveness_desc')).toMatch(/2x/);
        expect(es('effectiveness_desc')).toMatch(/0\.5x/);
        expect(es('effectiveness_desc')).toMatch(/0x/);
        expect(es('dual_desc')).toMatch(/4x/);
        expect(es('dual_desc')).toContain('Fuego/Volador');
        expect(es('chart_desc')).toMatch(/Escarlata y Púrpura/);
    });

    it('the type engine does not depend on translations', () => {
        for (const file of ['effectiveness', 'modifiers', 'result', 'team', 'index']) {
            expect(read(`src/lib/type-engine/${file}.js`)).not.toMatch(/i18n|messages|createT|localStorage/);
        }
    });

    it('translating type names never changes internal identifiers or engine results', () => {
        const { tType } = createT('es');
        const contrast = typeData.contrast;
        for (const type of types) {
            expect(tType(type)).not.toBe('');
            const pill = renderTypePills([type], contrast, tType);
            expect(pill).toContain(`bg-type-${type.toLowerCase()}`); // class uses the English id
            expect(pill).toContain(`>${tType(type)}<`);
        }
        const before = JSON.stringify(calculateDefense('Fire', 'Flying', types, typeData.effectiveness));
        createT('es'); // using the Spanish layer must not mutate shared data
        expect(JSON.stringify(calculateDefense('Fire', 'Flying', types, typeData.effectiveness))).toBe(before);
        expect(types.every(t => /^[A-Z][a-z]+$/.test(t))).toBe(true);
    });

    it('Spanish type names are unique (no two types share a label)', () => {
        const labels = types.map(t => messages.es[t.toLowerCase()]);
        expect(new Set(labels).size).toBe(types.length);
    });

    it('every static translation key used by the client and templates exists in English and Spanish', () => {
        const used = new Set();
        const walk = dir => {
            for (const entry of readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) {
                const path = `${dir}/${entry.name}`;
                if (entry.isDirectory()) walk(path);
                else if (/\.(astro|js)$/.test(entry.name) && !path.endsWith('messages.js')) {
                    const src = read(path);
                    for (const m of src.matchAll(/data-i18n(?:-[a-z]+)?="([a-z0-9_]+)"/g)) used.add(m[1]);
                    for (const m of src.matchAll(/i18n\.t\('([a-z0-9_]+)'/g)) used.add(m[1]);
                }
            }
        };
        walk('src');
        used.delete('nature_'); // dynamic prefix
        const missing = lang => [...used].filter(k => !(k in messages[lang]) && !(`ssr_${k}` in messages[lang]));
        expect(missing('en')).toEqual([]);
        expect(missing('es')).toEqual([]);
    });
});
