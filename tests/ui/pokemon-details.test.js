import { describe, it, expect } from 'vitest';
import pokedex from '../../src/data/pokedex.json';
import searchIndex from '../../src/data/search-index.json';
import { pokemonSlug } from '../../src/lib/seo.js';
import { findPokemonBySlug, ssrOwnedBy, createLatestGate } from '../../src/js/modules/pokemonDetails.js';

const slugs = [...new Set(pokedex.map(pokemonSlug))];

// Regression for /pokemon/<form-slug> pages (charizard-mega-x...) that never
// loaded details: on first paint main.js only has the search index, which has
// no apiName, so the lookup missed and was never retried.
describe('findPokemonBySlug', () => {
    it('misses form slugs on the search index but finds them on the full pokedex', () => {
        expect(findPokemonBySlug(searchIndex, 'charizard-mega-x')).toBeUndefined();
        expect(findPokemonBySlug(pokedex, 'charizard-mega-x')?.name).toBe('Mega Charizard X');
    });

    it('still resolves plain slugs from the search index (fast path unchanged)', () => {
        expect(findPokemonBySlug(searchIndex, 'charizard')?.name).toBe('Charizard');
        expect(findPokemonBySlug(searchIndex, 'Charizard')?.name).toBe('Charizard');
    });

    it('resolves every sitemap slug against the full pokedex to the entry the server rendered', () => {
        const wrong = slugs.filter(s => pokemonSlug(findPokemonBySlug(pokedex, s) ?? {}) !== s);
        expect(wrong).toEqual([]);
    });

    it('documents how many pages need the full pokedex (all of them must be resolvable there)', () => {
        const needFull = slugs.filter(s => !findPokemonBySlug(searchIndex, s));
        expect(needFull.length).toBeGreaterThan(0);
        expect(needFull.every(s => findPokemonBySlug(pokedex, s))).toBe(true);
    });

    it('returns undefined for unknown slugs', () => {
        expect(findPokemonBySlug(pokedex, 'not-a-pokemon')).toBeUndefined();
    });
});

describe('ssrOwnedBy', () => {
    const box = slug => ({ dataset: slug ? { ssrSlug: slug } : {} });
    const charizard = pokedex.find(p => p.name === 'Charizard');
    const blastoise = pokedex.find(p => p.name === 'Blastoise');
    const mega = pokedex.find(p => p.name === 'Mega Charizard X');

    it('keeps the server block only for the Pokemon it was rendered for', () => {
        expect(ssrOwnedBy(box('charizard'), charizard)).toBe(true);
        expect(ssrOwnedBy(box('charizard'), blastoise)).toBe(false);
    });

    it('matches forms by their apiName slug, like the server', () => {
        expect(ssrOwnedBy(box('charizard-mega-x'), mega)).toBe(true);
        expect(ssrOwnedBy(box('charizard-mega-x'), charizard)).toBe(false);
    });

    it('never matches once the marker is gone or on pages without server stats', () => {
        expect(ssrOwnedBy(box(), charizard)).toBe(false);
    });
});

describe('createLatestGate', () => {
    it('only the latest ticket may write', () => {
        const gate = createLatestGate();
        const first = gate.begin();
        const second = gate.begin();
        expect(gate.isLatest(first)).toBe(false);
        expect(gate.isLatest(second)).toBe(true);
    });

    it('out-of-order responses: the slow first request never overwrites the second', async () => {
        const gate = createLatestGate();
        let shown = null;
        const load = (name, delay) => {
            const ticket = gate.begin();
            return new Promise(resolve => setTimeout(resolve, delay)).then(() => {
                if (gate.isLatest(ticket)) shown = name;
            });
        };
        await Promise.all([load('Charizard', 30), load('Blastoise', 5)]);
        expect(shown).toBe('Blastoise');
    });

    it('a later request invalidates earlier ones even when they finish in order', async () => {
        const gate = createLatestGate();
        let shown = null;
        const a = gate.begin();
        const b = gate.begin();
        await Promise.resolve();
        if (gate.isLatest(a)) shown = 'A';
        if (gate.isLatest(b)) shown = 'B';
        expect(shown).toBe('B');
    });
});

// The initial load of a form page awaits the full pokedex (seconds on a slow
// network). main.js takes a ticket before waiting and every user selection or
// reset takes a newer one, so a late initial load can never override the user.
describe('initial load vs user actions (selectionGate semantics)', () => {
    it('the initial load keeps priority only while the user has done nothing', () => {
        const gate = createLatestGate();
        const initial = gate.begin();
        expect(gate.isLatest(initial)).toBe(true);
    });

    it('any user action invalidates a pending initial load', () => {
        const gate = createLatestGate();
        const initial = gate.begin();
        gate.begin(); // user picks another Pokemon / changes a type / presses reset
        expect(gate.isLatest(initial)).toBe(false);
    });

    it('a slow initial load that resolves after the user acted writes nothing', async () => {
        const gate = createLatestGate();
        const written = [];
        const initialLoad = (async () => {
            const ticket = gate.begin();
            await new Promise(resolve => setTimeout(resolve, 20));
            if (!gate.isLatest(ticket)) return;
            written.push('Mega Charizard X');
        })();
        await new Promise(resolve => setTimeout(resolve, 5));
        gate.begin();
        written.push('Blastoise');
        await initialLoad;
        expect(written).toEqual(['Blastoise']);
    });
});
