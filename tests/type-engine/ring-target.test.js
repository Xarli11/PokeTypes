import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { computeDefenseMap, computeDefenseMapIgnoringTypeImmunities } from '../../src/lib/type-engine/effectiveness.js';
import { applyDefensiveModifiers, getAbilityModifiers, getItemModifiers } from '../../src/lib/type-engine/modifiers.js';

const { types, effectiveness } = typeData;

function applyRingTarget(t1, t2, extraModifiers = []) {
    const base = computeDefenseMap(t1, t2, types, effectiveness);
    const ignoringTypeImmunityMap = computeDefenseMapIgnoringTypeImmunities(t1, t2, types, effectiveness);
    const modifiers = [...extraModifiers, ...getItemModifiers('ring-target')];
    return applyDefensiveModifiers(base, modifiers, types, { ignoringTypeImmunityMap });
}

// Regression coverage for the confirmed bug: ring-target used to be
// `{ type: 'All', modifier: 1 }`, and applyDefensiveModifiers multiplied
// (0 * 1 = 0), so Ring Target never actually removed a type immunity.
describe('Ring Target — negates TYPE-based immunities', () => {
    it('lets a Normal-type move hit a Ghost holder', () => {
        expect(computeDefenseMap('Ghost', null, types, effectiveness).Normal).toBe(0);
        expect(applyRingTarget('Ghost', null).Normal).toBe(1);
    });

    it('lets an Electric-type move hit a Ground holder', () => {
        expect(computeDefenseMap('Ground', null, types, effectiveness).Electric).toBe(0);
        expect(applyRingTarget('Ground', null).Electric).toBe(1);
    });

    it('lets a Ground-type move hit a Flying holder', () => {
        expect(computeDefenseMap('Flying', null, types, effectiveness).Ground).toBe(0);
        expect(applyRingTarget('Flying', null).Ground).toBe(1);
    });

    it('reveals the OTHER type\'s real matchup instead of naively resetting to neutral', () => {
        // Ground/Flying is immune to Electric only via its Ground half;
        // Flying itself is actually weak (2x) to Electric. Ring Target
        // must surface that 2x, not just flip the immunity to a flat 1x.
        const base = computeDefenseMap('Ground', 'Flying', types, effectiveness);
        expect(base.Electric).toBe(0);
        expect(applyRingTarget('Ground', 'Flying').Electric).toBe(2);
    });

    it('without an ignoringTypeImmunityMap, Ring Target is a documented no-op rather than a guess', () => {
        const base = computeDefenseMap('Ghost', null, types, effectiveness);
        const result = applyDefensiveModifiers(base, getItemModifiers('ring-target'), types);
        expect(result.Normal).toBe(0);
    });
});

describe('Ring Target — never negates an ABILITY/ITEM immunity', () => {
    it('still respects Levitate\'s Ground immunity even while holding Ring Target', () => {
        const withLevitateAndRingTarget = applyRingTarget('Flying', null, getAbilityModifiers('levitate'));
        expect(withLevitateAndRingTarget.Ground).toBe(0);
    });

    it('never clears an ability immunity for a type that has no natural immunity to begin with', () => {
        // Electric vs plain Normal is neutral (1x) by typing alone — Volt
        // Absorb is the only reason it's 0 here. Ring Target must leave it.
        expect(computeDefenseMap('Normal', null, types, effectiveness).Electric).toBe(1);
        const result = applyRingTarget('Normal', null, getAbilityModifiers('volt-absorb'));
        expect(result.Electric).toBe(0);
    });
});
