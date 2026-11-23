import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import typeData from '../src/data/type-data.json';
import { parseAppLocation, buildAppUrl, withMode } from '../src/lib/app-state.js';
import { statePath } from '../src/lib/i18n-routes.js';

const { types } = typeData;
const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const split = url => { const [pathname, search = ''] = url.split('?'); return { pathname, search: search ? `?${search}` : '' }; };

describe('parseAppLocation', () => {
    it('home', () => {
        expect(parseAppLocation({ pathname: '/', search: '' })).toEqual({ lang: 'en', pokemonSlug: null, types: [], mode: 'simple' });
    });

    it('type pages, any number of types', () => {
        expect(parseAppLocation({ pathname: '/tipo/fire' })).toMatchObject({ types: ['fire'], pokemonSlug: null });
        expect(parseAppLocation({ pathname: '/tipo/fire-flying-water' })).toMatchObject({ types: ['fire', 'flying', 'water'] });
    });

    it('Pokemon pages, including form slugs', () => {
        expect(parseAppLocation({ pathname: '/pokemon/charizard-mega-x' })).toMatchObject({ pokemonSlug: 'charizard-mega-x', types: [] });
    });

    it('mode comes from ?mode=pro only', () => {
        expect(parseAppLocation({ pathname: '/', search: '?mode=pro' }).mode).toBe('pro');
        expect(parseAppLocation({ pathname: '/', search: '?mode=simple' }).mode).toBe('simple');
        expect(parseAppLocation({ pathname: '/tipo/fire', search: '?mode=pro&team=abc' })).toMatchObject({ mode: 'pro', types: ['fire'] });
    });

    it('keeps reading the legacy ?p= and ?t1=&t2= links', () => {
        expect(parseAppLocation({ pathname: '/', search: '?p=abra' }).pokemonSlug).toBe('abra');
        expect(parseAppLocation({ pathname: '/', search: '?t1=fire&t2=water' }).types).toEqual(['fire', 'water']);
    });

    it('understands /es URLs (prefix and Spanish slugs)', () => {
        expect(parseAppLocation({ pathname: '/es/tipo/fuego-volador' })).toMatchObject({ lang: 'es', types: ['fire', 'flying'] });
        expect(parseAppLocation({ pathname: '/es' })).toMatchObject({ lang: 'es', types: [], pokemonSlug: null });
    });
});

describe('buildAppUrl', () => {
    it('matches statePath, and adds only ?mode=pro', () => {
        expect(buildAppUrl({})).toBe('/');
        expect(buildAppUrl({ mode: 'pro' })).toBe('/?mode=pro');
        expect(buildAppUrl({ types: ['Flying', 'Fire'] })).toBe('/tipo/fire-flying');
        expect(buildAppUrl({ types: ['Fire'], mode: 'pro' })).toBe('/?mode=pro'); // Team Builder lives on the home page
        expect(buildAppUrl({ pokemonSlug: 'abra', types: ['Psychic'] })).toBe('/pokemon/abra');
        expect(buildAppUrl({ types: ['Fire'] }, 'es')).toBe('/es/tipo/fuego');
    });

    it('English output equals statePath for every combination (URLs do not change)', () => {
        for (const a of types) for (const b of [null, ...types]) {
            const list = [a, b].filter(Boolean);
            expect(buildAppUrl({ types: list })).toBe(statePath({ types: list }));
        }
    });
});

describe('parse(build(state)) round trip', () => {
    const states = [
        { pokemonSlug: null, types: [], mode: 'simple' },
        { pokemonSlug: null, types: [], mode: 'pro' },
        { pokemonSlug: 'charizard', types: [], mode: 'simple' },
        { pokemonSlug: 'charizard-mega-x', types: [], mode: 'pro' },
        ...types.flatMap(a => [{ pokemonSlug: null, types: [a], mode: 'simple' }, { pokemonSlug: null, types: [a, 'Flying'], mode: 'pro' }]),
        { pokemonSlug: null, types: ['Fire', 'Flying', 'Water'], mode: 'simple' }
    ];

    it.each(['en', 'es'])('is lossless (%s)', lang => {
        for (const state of states) {
            const parsed = parseAppLocation(split(buildAppUrl(state, lang)));
            expect(parsed.lang).toBe(lang);
            expect(parsed.mode).toBe(state.mode);
            if (state.mode === 'pro') {
                expect(parsed.pokemonSlug).toBeNull(); // Team Builder URL carries no selection
                expect(parsed.types).toEqual([]);
                continue;
            }
            expect(parsed.pokemonSlug).toBe(state.pokemonSlug);
            // types come back lowercase and in canonical (type chart) order
            expect(new Set(parsed.types)).toEqual(new Set(state.pokemonSlug ? [] : state.types.map(t => t.toLowerCase())));
        }
    });
});

describe('withMode', () => {
    it('sets and removes ?mode=pro keeping the path and the other parameters', () => {
        expect(withMode('https://poketypes.app/tipo/fire', 'pro')).toBe('/tipo/fire?mode=pro');
        expect(withMode('https://poketypes.app/tipo/fire?mode=pro', 'simple')).toBe('/tipo/fire');
        expect(withMode('https://poketypes.app/?team=abc', 'pro')).toBe('/?team=abc&mode=pro');
        expect(withMode('https://poketypes.app/?team=abc&mode=pro', 'simple')).toBe('/?team=abc');
        expect(withMode('https://poketypes.app/', 'simple')).toBe('/');
    });
});

describe('wiring (browser behaviour is checked by scripts/manual/history-check.mjs)', () => {
    const main = read('src/js/main.js');

    it('a popstate handler restores state and mode (the remembered mode follows what is shown)', () => {
        expect(main).toMatch(/addEventListener\('popstate', restoreFromHistory\)/);
        const handler = main.slice(main.indexOf('async function restoreFromHistory'), main.indexOf('async function applyStateFromURL'));
        expect(handler).toMatch(/setViewMode\(state\.mode\)/);
        expect(handler).not.toMatch(/localStorage/); // only pro.js persists the mode
    });

    it('user mode switches add a history entry; the initial load only replaces', () => {
        expect(main).toMatch(/poketypes:modechange/);
        expect(main).toMatch(/replaceState/);
        expect(read('src/js/modules/pro.js')).toMatch(/notify: true/);
    });

    it('asks the server for the right page when this document cannot render the restored state', () => {
        expect(main).toMatch(/needsHomePage/);
        expect(main).toMatch(/window\.location\.reload\(\)/);
    });

    it('never pushes the URL that is already shown', () => {
        expect(main).toMatch(/target !== window\.location\.pathname \+ window\.location\.search/);
    });
});
