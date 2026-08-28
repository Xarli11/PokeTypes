import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { getImmuneTypesFromModifiers, getAbilityModifiers } from '../../src/lib/type-engine/modifiers.js';

const { types } = typeData;

// Regression coverage for a confirmed bug: getImmuneTypesFromModifiers only
// checked `modifier === 0`, so Wonder Guard (`{ type: 'All', modifier: 0,
// blockNonSE: true }`) was read as "immune to all 18 types" — which is
// false. Wonder Guard blocks non-super-effective hits; super-effective
// moves still connect normally. Any caller trusting this helper (e.g.
// advisor.js filtering out "already handled" weaknesses) would have
// wrongly hidden a Wonder Guard Pokemon's real super-effective weaknesses.
describe('getImmuneTypesFromModifiers — Wonder Guard is NOT a blanket immunity', () => {
    it('returns an empty set for Wonder Guard, never "immune to every type"', () => {
        const immune = getImmuneTypesFromModifiers(getAbilityModifiers('wonder-guard'), types);
        expect(immune.size).toBe(0);
        expect(immune.has('Normal')).toBe(false);
        expect(immune.has('Fighting')).toBe(false);
    });

    it('still correctly reports a genuine unconditional immunity (Levitate)', () => {
        const immune = getImmuneTypesFromModifiers(getAbilityModifiers('levitate'), types);
        expect(immune).toEqual(new Set(['Ground']));
    });

    it('does not count a superEffectiveOnly modifier as an immunity either (Filter is 0.75x, not 0, but guard the shape anyway)', () => {
        const immune = getImmuneTypesFromModifiers(getAbilityModifiers('filter'), types);
        expect(immune.size).toBe(0);
    });

    it('does not count a battle-context-gated hard immunity as unconditional (defensive guard for future data)', () => {
        const gatedImmunity = [{ type: 'Water', modifier: 0, requiresContext: 'fullHp', contextValue: true }];
        const immune = getImmuneTypesFromModifiers(gatedImmunity, types);
        expect(immune.size).toBe(0);
    });
});
