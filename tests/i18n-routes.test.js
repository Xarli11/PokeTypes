import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import typeData from '../src/data/type-data.json';
import { messages } from '../src/js/lang/messages.js';
import { canonicalTypeSlug, parseTypeSlug, ogLocale, renderAlternateLinks } from '../src/lib/seo.js';
import {
    slugify, typeSlug, toTypeSlug, fromTypeSlug, resolveTypeRoute,
    stripLangPrefix, getLangFromPath, withLangPrefix, pathForLang, statePath, detectLang
} from '../src/lib/i18n-routes.js';

const { types } = typeData;
const SPANISH_SLUGS = {
    Normal: 'normal', Fire: 'fuego', Water: 'agua', Grass: 'planta', Electric: 'electrico', Ice: 'hielo',
    Fighting: 'lucha', Poison: 'veneno', Ground: 'tierra', Flying: 'volador', Psychic: 'psiquico', Bug: 'bicho',
    Rock: 'roca', Ghost: 'fantasma', Dragon: 'dragon', Steel: 'acero', Fairy: 'hada', Dark: 'siniestro'
};
const combos = [];
for (const a of types) {
    combos.push([a]);
    for (const b of types) {
        combos.push([a, b]);
        for (const c of types) combos.push([a, b, c]);
    }
}

describe('type slug table', () => {
    it('is built from the same 18 types, in the same order, as type-data.json', () => {
        expect(types.map(t => typeSlug(t, 'en'))).toEqual(types.map(t => t.toLowerCase()));
        expect(types).toHaveLength(18);
        expect(Object.keys(SPANISH_SLUGS)).toEqual(types);
    });

    it('Spanish slugs are the accent-free lowercase Spanish names (golden: changing one changes a URL)', () => {
        for (const type of types) expect(typeSlug(type, 'es')).toBe(SPANISH_SLUGS[type]);
    });

    it('comes from messages.es, so translation and slug cannot drift apart', () => {
        for (const type of types) expect(typeSlug(type, 'es')).toBe(slugify(messages.es[type.toLowerCase()]));
    });

    it('is a bijection: 18 distinct slugs per language, only [a-z0-9], no hyphen inside a name', () => {
        for (const lang of ['en', 'es']) {
            const slugs = types.map(t => typeSlug(t, lang));
            expect(new Set(slugs).size).toBe(18);
            slugs.forEach(s => expect(s).toMatch(/^[a-z0-9]+$/));
        }
    });

    it('a Spanish slug never equals the English name of a different type (alias is unambiguous)', () => {
        for (const type of types) {
            const asEnglish = types.find(t => t.toLowerCase() === typeSlug(type, 'es'));
            expect(asEnglish === undefined || asEnglish === type).toBe(true);
        }
    });

    it('slugify', () => {
        expect(slugify('Psíquico')).toBe('psiquico');
        expect(slugify('Eléctrico')).toBe('electrico');
        expect(slugify('Dragón')).toBe('dragon');
        expect(slugify('  Ni ñu / x ')).toBe('ni-nu-x');
    });

    it('unknown types have no slug', () => {
        expect(typeSlug('Cosmic', 'es')).toBeNull();
    });
});

describe('combination slugs', () => {
    it('examples', () => {
        expect(toTypeSlug(['Fire'], 'es')).toBe('fuego');
        expect(toTypeSlug(['Flying', 'Fire'], 'es')).toBe('fuego-volador');
        expect(toTypeSlug(['Psychic', 'Fairy'], 'es')).toBe('psiquico-hada');
        expect(toTypeSlug(['Dark', 'Dragon', 'Electric'], 'es')).toBe('electrico-dragon-siniestro');
        expect(toTypeSlug(['Fire', 'Fire'], 'es')).toBe('fuego');
    });

    it.each(['en', 'es'])('round trip, %s: every 1-3 type input (%#) maps to a slug that parses back to the same set', lang => {
        for (const list of combos) {
            const slug = toTypeSlug(list, lang);
            const back = fromTypeSlug(slug, lang);
            expect(back).not.toBeNull();
            expect(new Set(back)).toEqual(new Set(list));
            expect(toTypeSlug(back, lang)).toBe(slug); // canonical slugs are fixed points
        }
    });

    it('every permutation of a combination yields the same canonical slug', () => {
        for (const a of types) for (const b of types) {
            expect(toTypeSlug([a, b], 'es')).toBe(toTypeSlug([b, a], 'es'));
            expect(toTypeSlug([a, b], 'en')).toBe(toTypeSlug([b, a], 'en'));
        }
        const perms = [['Water', 'Fire', 'Flying'], ['Flying', 'Water', 'Fire'], ['Fire', 'Flying', 'Water']];
        expect(new Set(perms.map(p => toTypeSlug(p, 'es'))).size).toBe(1);
    });

    it('English slugs are identical to the existing canonicalTypeSlug (English URLs do not change)', () => {
        for (const list of combos) expect(toTypeSlug(list, 'en')).toBe(canonicalTypeSlug(list, types));
    });

    it('English parsing accepts exactly what parseTypeSlug accepts (no Spanish leaks into English routes)', () => {
        for (const slug of ['fire', 'Fire-FLYING', 'fire-flying-water', 'fuego', 'fuego-volador', 'fire-garbage', '', 'a-b-c-d', 'fire/water']) {
            expect(fromTypeSlug(slug, 'en')).toEqual(parseTypeSlug(slug, types));
        }
        expect(fromTypeSlug('fuego', 'en')).toBeNull();
    });

    it('Spanish parsing accepts Spanish slugs, English aliases and mixes, case-insensitively', () => {
        expect(fromTypeSlug('fuego-volador', 'es')).toEqual(['Fire', 'Flying']);
        expect(fromTypeSlug('Fuego-VOLADOR', 'es')).toEqual(['Fire', 'Flying']);
        expect(fromTypeSlug('fire-flying', 'es')).toEqual(['Fire', 'Flying']);
        expect(fromTypeSlug('fuego-flying', 'es')).toEqual(['Fire', 'Flying']);
        expect(fromTypeSlug('psiquico', 'es')).toEqual(['Psychic']);
    });

    it.each(['', 'xyz', 'fuego-xyz', 'fuego-volador-agua-hada', 'fuego/agua', 'fuego--agua', '-fuego', 'psíquico'])(
        'rejects %j', slug => {
            expect(fromTypeSlug(slug, 'es')).toBeNull();
            expect(resolveTypeRoute(slug, 'es')).toBeNull();
        }
    );

    it('rejects missing input', () => {
        expect(fromTypeSlug(undefined, 'es')).toBeNull();
        expect(fromTypeSlug(null, 'en')).toBeNull();
    });
});

describe('resolveTypeRoute (what a /tipo route does with a slug)', () => {
    it('canonical slugs are served as they are', () => {
        expect(resolveTypeRoute('fuego-volador', 'es')).toEqual({ types: ['Fire', 'Flying'], slug: 'fuego-volador', redirect: false });
        expect(resolveTypeRoute('fire-flying', 'en')).toEqual({ types: ['Fire', 'Flying'], slug: 'fire-flying', redirect: false });
    });

    it.each([
        ['volador-fuego', 'fuego-volador'],      // permutation
        ['fuego-fuego', 'fuego'],                // duplicate
        ['Fuego-Volador', 'fuego-volador'],      // case
        ['fire-flying', 'fuego-volador'],        // English alias on a Spanish route
        ['flying-fuego', 'fuego-volador'],       // mixed alias + permutation
        ['agua-fuego-volador', 'fuego-agua-volador']
    ])('redirects %s -> %s (301)', (slug, canonical) => {
        const route = resolveTypeRoute(slug, 'es');
        expect(route.redirect).toBe(true);
        expect(route.slug).toBe(canonical);
        expect(resolveTypeRoute(canonical, 'es').redirect).toBe(false);
    });

    it('English routes behave like the existing page (permutation/duplicate/case -> 301, Spanish -> 404)', () => {
        expect(resolveTypeRoute('flying-fire', 'en')).toMatchObject({ slug: 'fire-flying', redirect: true });
        expect(resolveTypeRoute('fire-fire', 'en')).toMatchObject({ slug: 'fire', redirect: true });
        expect(resolveTypeRoute('Fire', 'en')).toMatchObject({ slug: 'fire', redirect: true });
        expect(resolveTypeRoute('fuego-volador', 'en')).toBeNull();
    });

    it('a redirect target is never itself redirected (no chains) for every input', () => {
        for (const lang of ['en', 'es']) for (const list of combos) {
            const slug = list.map(t => typeSlug(t, lang)).join('-');
            const first = resolveTypeRoute(slug, lang);
            expect(resolveTypeRoute(first.slug, lang).redirect).toBe(false);
        }
    });
});

describe('language in paths', () => {
    it('stripLangPrefix / getLangFromPath', () => {
        expect(stripLangPrefix('/es')).toEqual({ lang: 'es', path: '/' });
        expect(stripLangPrefix('/es/')).toEqual({ lang: 'es', path: '/' });
        expect(stripLangPrefix('/es/tipo/fuego')).toEqual({ lang: 'es', path: '/tipo/fuego' });
        expect(stripLangPrefix('/tipo/fire')).toEqual({ lang: 'en', path: '/tipo/fire' });
        expect(stripLangPrefix('/')).toEqual({ lang: 'en', path: '/' });
        // only a whole first segment is a language prefix
        expect(stripLangPrefix('/essay')).toEqual({ lang: 'en', path: '/essay' });
        expect(stripLangPrefix('/espanol/tipo/fuego')).toEqual({ lang: 'en', path: '/espanol/tipo/fuego' });
        expect(getLangFromPath('/es/pokemon/charizard')).toBe('es');
        expect(getLangFromPath('/pokemon/charizard')).toBe('en');
    });

    it('withLangPrefix leaves English untouched', () => {
        expect(withLangPrefix('/tipo/fire', 'en')).toBe('/tipo/fire');
        expect(withLangPrefix('/', 'en')).toBe('/');
        expect(withLangPrefix('/tipo/fuego', 'es')).toBe('/es/tipo/fuego');
        expect(withLangPrefix('/', 'es')).toBe('/es');
    });

    it('stripLangPrefix undoes withLangPrefix', () => {
        for (const path of ['/', '/tipo/fire', '/pokemon/charizard-mega-x']) {
            for (const lang of ['en', 'es']) expect(stripLangPrefix(withLangPrefix(path, lang))).toEqual({ lang, path });
        }
    });
});

describe('pathForLang (same page in the other language)', () => {
    it.each([
        ['/', 'es', '/es'],
        ['/es', 'en', '/'],
        ['/tipo/fire', 'es', '/es/tipo/fuego'],
        ['/tipo/fire-flying', 'es', '/es/tipo/fuego-volador'],
        ['/tipo/flying-fire', 'es', '/es/tipo/fuego-volador'],
        ['/es/tipo/psiquico-hada', 'en', '/tipo/psychic-fairy'],
        ['/es/tipo/volador-fuego', 'en', '/tipo/fire-flying'],
        ['/pokemon/charizard', 'es', '/es/pokemon/charizard'],
        ['/es/pokemon/charizard-mega-x', 'en', '/pokemon/charizard-mega-x'],
        ['/tipo/fire-flying/', 'es', '/es/tipo/fuego-volador'],
        ['/tipo/fire', 'en', '/tipo/fire']
    ])('%s -> %s = %s', (from, lang, expected) => {
        expect(pathForLang(from, lang)).toBe(expected);
    });

    it('returns null when there is no equivalent page', () => {
        expect(pathForLang('/privacy', 'es')).toBeNull();
        expect(pathForLang('/tipo/zzz', 'es')).toBeNull();
        expect(pathForLang('/es/tipo/fire-zzz', 'en')).toBeNull();
        expect(pathForLang('/tipo', 'es')).toBeNull();
        expect(pathForLang('/tipo/fire/extra', 'es')).toBeNull();
    });

    it('en -> es -> en returns the canonical English path for every combination', () => {
        for (const list of combos) {
            const en = `/tipo/${toTypeSlug(list, 'en')}`;
            const es = pathForLang(en, 'es');
            expect(es.startsWith('/es/tipo/')).toBe(true);
            expect(pathForLang(es, 'en')).toBe(en);
        }
    });
});

describe('statePath (URL shown by the app)', () => {
    // Behaviour of syncURLWithState in main.js before this change, kept verbatim as the reference.
    const legacy = ({ pokemonSlug, types: list = [] }) =>
        pokemonSlug ? `/pokemon/${pokemonSlug}` : list.length ? `/tipo/${canonicalTypeSlug(list, types)}` : '/';

    it('English is identical to the previous behaviour for home, every Pokemon slug shape and every combination', () => {
        expect(statePath({})).toBe(legacy({}));
        expect(statePath({ pokemonSlug: 'charizard-mega-x' })).toBe(legacy({ pokemonSlug: 'charizard-mega-x' }));
        for (const list of combos) expect(statePath({ types: list })).toBe(legacy({ types: list }));
        expect(statePath({ pokemonSlug: 'abra', types: ['Psychic'] })).toBe('/pokemon/abra'); // a Pokemon wins, as before
    });

    it('Spanish keeps the prefix and uses Spanish slugs', () => {
        expect(statePath({}, 'es')).toBe('/es');
        expect(statePath({ pokemonSlug: 'abra' }, 'es')).toBe('/es/pokemon/abra');
        expect(statePath({ types: ['Flying', 'Fire'] }, 'es')).toBe('/es/tipo/fuego-volador');
    });
});

describe('detectLang (which language a page uses)', () => {
    it('English URLs keep the saved language, exactly as before', () => {
        expect(detectLang('/', null)).toBe('en');
        expect(detectLang('/tipo/fire', 'es')).toBe('es');
        expect(detectLang('/pokemon/abra', 'en')).toBe('en');
        expect(detectLang('/', 'fr')).toBe('en');
        expect(detectLang(undefined, 'es')).toBe('es');
    });

    it('a /es URL decides by itself, whatever was saved', () => {
        expect(detectLang('/es', 'en')).toBe('es');
        expect(detectLang('/es/tipo/fuego', null)).toBe('es');
    });
});

describe('hreflang and locale helpers', () => {
    it('ogLocale', () => {
        expect(ogLocale('en')).toBe('en_US');
        expect(ogLocale('es')).toBe('es_ES');
        expect(ogLocale('fr')).toBe('en_US');
        expect(ogLocale(undefined)).toBe('en_US');
    });

    it('renderAlternateLinks emits nothing without alternates (English pages stay as they are)', () => {
        expect(renderAlternateLinks()).toBe('');
        expect(renderAlternateLinks([])).toBe('');
    });

    it('renderAlternateLinks emits one tag per alternate', () => {
        const html = renderAlternateLinks([
            { hreflang: 'es', href: 'https://poketypes.app/es/tipo/fuego' },
            { hreflang: 'en', href: 'https://poketypes.app/tipo/fire' },
            { hreflang: 'x-default', href: 'https://poketypes.app/tipo/fire' }
        ]);
        expect(html.match(/<link /g)).toHaveLength(3);
        expect(html).toContain('<link rel="alternate" hreflang="x-default" href="https://poketypes.app/tipo/fire">');
    });
});

describe('wiring', () => {
    const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

    it('no /es routes exist yet', () => {
        expect(() => readFileSync(new URL('../src/pages/es/index.astro', import.meta.url))).toThrow();
    });

    it('the language layer is used by the client and the layout', () => {
        expect(read('src/js/main.js')).toMatch(/statePath\(/);
        expect(read('src/js/modules/i18n.js')).toMatch(/detectLang\(/);
        expect(read('src/layouts/Layout.astro')).toMatch(/renderAlternateLinks/);
        expect(read('src/layouts/Layout.astro')).toMatch(/ogLocale\(lang\)/);
    });
});
