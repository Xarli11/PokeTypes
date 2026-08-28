import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { computeDefenseMap } from '../../src/lib/type-engine/effectiveness.js';
import { applyDefensiveModifiers, getAbilityModifiers } from '../../src/lib/type-engine/modifiers.js';

const { types, effectiveness } = typeData;

// A `requiresContext` gate only fires when the caller explicitly confirms
// the matching `contextValue` — an absent context key must never be
// treated as "condition met" (or "condition not met" in a way that
// applies some OTHER effect). This is what lets Team Builder's
// analyzeTeamDefense never assume "full HP" for Multiscale/Shadow
// Shield/Tera Shell, or "this move makes contact" for Fluffy.
describe('Multiscale / Shadow Shield — requiresContext: fullHp', () => {
    it('does not reduce damage when no context is given (Team Builder default)', () => {
        const base = computeDefenseMap('Dragon', 'Flying', types, effectiveness); // Ice is 4x
        expect(base.Ice).toBe(4);
        const result = applyDefensiveModifiers(base, getAbilityModifiers('multiscale'), types);
        expect(result.Ice).toBe(4);
    });

    it('does not reduce damage when fullHp is explicitly false', () => {
        const base = computeDefenseMap('Dragon', 'Flying', types, effectiveness);
        const result = applyDefensiveModifiers(base, getAbilityModifiers('multiscale'), types, { context: { fullHp: false } });
        expect(result.Ice).toBe(4);
    });

    it('halves damage only when fullHp is explicitly confirmed true', () => {
        const base = computeDefenseMap('Dragon', 'Flying', types, effectiveness);
        const result = applyDefensiveModifiers(base, getAbilityModifiers('multiscale'), types, { context: { fullHp: true } });
        expect(result.Ice).toBe(2);
    });

    it('Shadow Shield behaves identically to Multiscale', () => {
        const base = computeDefenseMap('Dragon', 'Flying', types, effectiveness);
        const withContext = applyDefensiveModifiers(base, getAbilityModifiers('shadow-shield'), types, { context: { fullHp: true } });
        const without = applyDefensiveModifiers(base, getAbilityModifiers('shadow-shield'), types);
        expect(withContext.Ice).toBe(2);
        expect(without.Ice).toBe(4);
    });
});

describe('Tera Shell — forces exactly 0.5x at full HP, not a ×0.5 multiply', () => {
    const teraShellMods = getAbilityModifiers('tera-shell');

    it.each([
        [4, 0.5],
        [2, 0.5],
        [1, 0.5],
        [0.5, 0.5]
    ])('base %sx becomes exactly 0.5x at full HP (not %s * 0.5)', (base, expected) => {
        const result = applyDefensiveModifiers({ X: base }, teraShellMods, ['X'], { context: { fullHp: true } });
        expect(result.X).toBe(expected);
    });

    it('leaves a natural immunity (0x) at 0x, never force-set to 0.5x', () => {
        const result = applyDefensiveModifiers({ X: 0 }, teraShellMods, ['X'], { context: { fullHp: true } });
        expect(result.X).toBe(0);
    });

    it('has no effect at all without fullHp confirmed', () => {
        const result = applyDefensiveModifiers({ X: 4 }, teraShellMods, ['X']);
        expect(result.X).toBe(4);
    });
});

describe('Fluffy — Fire boost is unconditional, contact-halving requires confirmed contact', () => {
    const fluffyMods = getAbilityModifiers('fluffy');

    it('Fire, contact confirmed false -> x2 (only the type-based half applies)', () => {
        const result = applyDefensiveModifiers({ Fire: 1 }, fluffyMods, ['Fire'], { context: { contact: false } });
        expect(result.Fire).toBe(2);
    });

    it('Fire, contact confirmed true -> both halves apply and cancel out to x1', () => {
        const result = applyDefensiveModifiers({ Fire: 1 }, fluffyMods, ['Fire'], { context: { contact: true } });
        expect(result.Fire).toBe(1);
    });

    it('non-Fire, contact confirmed true -> x0.5 (only the contact half applies)', () => {
        const result = applyDefensiveModifiers({ Water: 1 }, fluffyMods, ['Water'], { context: { contact: true } });
        expect(result.Water).toBe(0.5);
    });

    it('without contact info: Fire still shows its unconditional x2, non-Fire is untouched', () => {
        expect(applyDefensiveModifiers({ Fire: 1 }, fluffyMods, ['Fire']).Fire).toBe(2);
        expect(applyDefensiveModifiers({ Water: 1 }, fluffyMods, ['Water']).Water).toBe(1);
    });
});
