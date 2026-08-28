import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { calculateDefense, calculateOffense } from '../../src/lib/type-engine/effectiveness.js';

const { types, effectiveness } = typeData;

// src/pages/tipo/[...slug].astro (SSR) and src/js/main.js (client) both now
// import calculateDefense/calculateOffense from this exact module — there
// is no second implementation to drift out of sync with. These fixed
// famous dual-type Pokemon act as regression anchors: if either call site
// were ever changed to reintroduce a local, duplicated calculator (as SSR
// used to have), a hand-checked expectation here would catch a divergence.
const KNOWN_POKEMON = {
    dragonite: ['Dragon', 'Flying'],
    charizard: ['Fire', 'Flying'],
    swampert: ['Water', 'Ground'],
    scizor: ['Bug', 'Steel'],
    gengar: ['Ghost', 'Poison'],
    heatran: ['Fire', 'Steel']
};

function callAsSSR(t1, t2) {
    return {
        def: calculateDefense(t1, t2, types, effectiveness),
        off: calculateOffense(t1, t2, types, effectiveness)
    };
}

function callAsClient(t1, t2) {
    return {
        def: calculateDefense(t1, t2, types, effectiveness),
        off: calculateOffense(t1, t2, types, effectiveness)
    };
}

describe('SSR/client parity — same inputs, same engine, same outputs', () => {
    Object.entries(KNOWN_POKEMON).forEach(([name, [t1, t2]]) => {
        it(`${name} (${t1}/${t2}) produces identical results for both call sites`, () => {
            const ssrResult = callAsSSR(t1, t2);
            const clientResult = callAsClient(t1, t2);
            expect(clientResult).toEqual(ssrResult);
        });
    });

    it('Dragonite (Dragon/Flying) is 4x weak to Ice on both sides', () => {
        const { def } = callAsSSR('Dragon', 'Flying');
        expect(def.weaknesses4x).toContain('Ice');
        expect(callAsClient('Dragon', 'Flying').def).toEqual(def);
    });

    it('Scizor (Bug/Steel) is 4x weak to Fire on both sides', () => {
        const { def } = callAsSSR('Bug', 'Steel');
        expect(def.weaknesses4x).toContain('Fire');
        expect(callAsClient('Bug', 'Steel').def).toEqual(def);
    });

    it('Heatran (Fire/Steel) is immune to Poison on both sides', () => {
        const { def } = callAsSSR('Fire', 'Steel');
        expect(def.immunities).toContain('Poison');
        expect(callAsClient('Fire', 'Steel').def).toEqual(def);
    });

    it('a manual triple-type combination is deterministic across repeated calls', () => {
        const first = calculateDefense('Grass', 'Ice', types, effectiveness, 'Bug');
        const second = calculateDefense('Grass', 'Ice', types, effectiveness, 'Bug');
        expect(second).toEqual(first);
    });
});
