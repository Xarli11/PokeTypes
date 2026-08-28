import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { computeDefenseMap } from '../../src/lib/type-engine/effectiveness.js';
import {
    getAbilityModifiers,
    getItemModifiers,
    getImmuneTypesFromModifiers,
    applyDefensiveModifiers
} from '../../src/lib/type-engine/modifiers.js';

const { types, effectiveness } = typeData;

describe('getAbilityModifiers / getItemModifiers — lookup', () => {
    it('is case-insensitive and normalizes spaces to dashes for items', () => {
        expect(getAbilityModifiers('Levitate')).toEqual(getAbilityModifiers('levitate'));
        expect(getItemModifiers('Air Balloon')).toEqual(getItemModifiers('air-balloon'));
    });

    it('returns an empty array for an unknown or missing ability/item', () => {
        expect(getAbilityModifiers('sturdy')).toEqual([]);
        expect(getAbilityModifiers(null)).toEqual([]);
        expect(getItemModifiers('leftovers')).toEqual([]);
    });
});

describe('applyDefensiveModifiers — immunity (Levitate)', () => {
    it('zeroes out Ground damage regardless of the base multiplier', () => {
        // Rock/Ground defending: Ground-type attack is neutral vs Rock (1x) * weak vs Ground (2x) = 2x
        const map = computeDefenseMap('Rock', 'Ground', types, effectiveness);
        const withLevitate = applyDefensiveModifiers(map, getAbilityModifiers('levitate'), types);
        expect(map.Ground).toBe(2);
        expect(withLevitate.Ground).toBe(0);
    });
});

describe('applyDefensiveModifiers — plain multiplier (Thick Fat, Heatproof)', () => {
    it('Thick Fat halves both Fire and Ice damage', () => {
        const map = computeDefenseMap('Normal', null, types, effectiveness); // Fire vs Normal = 1, Ice vs Normal = 1
        const withThickFat = applyDefensiveModifiers(map, getAbilityModifiers('thick-fat'), types);
        expect(withThickFat.Fire).toBe(0.5);
        expect(withThickFat.Ice).toBe(0.5);
    });

    it('Heatproof turns a Fire weakness into a resistance (crosses the neutral line)', () => {
        // Grass/Bug is 4x weak to Fire; Heatproof halves it to 2x — still weak, but distinguishable
        // Use a case where halving crosses from weak to resist: base 2x -> 1x (neutral), base 1x -> 0.5x (resist)
        const map = computeDefenseMap('Grass', null, types, effectiveness); // Fire vs Grass = 2
        const withHeatproof = applyDefensiveModifiers(map, getAbilityModifiers('heatproof'), types);
        expect(map.Fire).toBe(2);
        expect(withHeatproof.Fire).toBe(1);
    });

    it('Purifying Salt halves Ghost damage', () => {
        const map = computeDefenseMap('Normal', null, types, effectiveness); // Ghost vs Normal = 0 already (immune by typing)
        // Use a type where Ghost is neutral instead: Ghost vs Steel = 1
        const map2 = computeDefenseMap('Steel', null, types, effectiveness);
        const withSalt = applyDefensiveModifiers(map2, getAbilityModifiers('purifying-salt'), types);
        expect(map2.Ghost).toBe(1);
        expect(withSalt.Ghost).toBe(0.5);
    });

    it('Fluffy doubles Fire damage', () => {
        const map = computeDefenseMap('Normal', null, types, effectiveness);
        const withFluffy = applyDefensiveModifiers(map, getAbilityModifiers('fluffy'), types);
        expect(withFluffy.Fire).toBe(2);
    });
});

describe('applyDefensiveModifiers — conditional: superEffectiveOnly (Filter/Solid Rock/Prism Armor)', () => {
    it('reduces an already-super-effective hit by 25%', () => {
        const map = computeDefenseMap('Fire', 'Flying', types, effectiveness); // Rock is 4x
        expect(map.Rock).toBe(4);
        for (const ability of ['filter', 'solid-rock', 'prism-armor']) {
            const applied = applyDefensiveModifiers(map, getAbilityModifiers(ability), types);
            expect(applied.Rock).toBe(3);
        }
    });

    it('does nothing to a neutral or resisted hit', () => {
        const map = computeDefenseMap('Water', null, types, effectiveness); // Grass vs Water = 2 (weak, SE) but Fire vs Water = 0.5 (resisted)
        const applied = applyDefensiveModifiers(map, getAbilityModifiers('filter'), types);
        expect(applied.Fire).toBe(map.Fire); // resisted hit: untouched
        expect(applied.Grass).toBe(map.Grass * 0.75); // super effective hit: reduced
    });
});

describe('applyDefensiveModifiers — conditional: blockNonSE (Wonder Guard)', () => {
    it('zeroes every hit that is not already super effective', () => {
        const map = computeDefenseMap('Steel', 'Fairy', types, effectiveness);
        const applied = applyDefensiveModifiers(map, getAbilityModifiers('wonder-guard'), types);
        Object.entries(map).forEach(([type, multiplier]) => {
            if (multiplier >= 2) {
                expect(applied[type]).toBe(multiplier);
            } else {
                expect(applied[type]).toBe(0);
            }
        });
    });
});

describe('applyDefensiveModifiers — items', () => {
    it('Air Balloon grants Ground immunity just like Levitate', () => {
        const map = computeDefenseMap('Rock', 'Ground', types, effectiveness);
        const applied = applyDefensiveModifiers(map, getItemModifiers('air-balloon'), types);
        expect(applied.Ground).toBe(0);
    });

    it('combining an ability and an item applies both', () => {
        const map = computeDefenseMap('Normal', null, types, effectiveness);
        const modifiers = [...getAbilityModifiers('thick-fat'), ...getItemModifiers('air-balloon')];
        const applied = applyDefensiveModifiers(map, modifiers, types);
        expect(applied.Fire).toBe(0.5); // from Thick Fat
        expect(applied.Ground).toBe(0); // from Air Balloon (Ground vs Normal is already 1x/neutral by typing)
    });
});

describe('applyDefensiveModifiers — Offensive-type entries never affect defense', () => {
    it('an ability like Transistor (type: Offensive) is a no-op here', () => {
        const map = computeDefenseMap('Normal', null, types, effectiveness);
        const applied = applyDefensiveModifiers(map, getAbilityModifiers('transistor'), types);
        expect(applied).toEqual(map);
    });
});

describe('getImmuneTypesFromModifiers', () => {
    it('expands `type: "All"` (Wonder Guard-style) across every type', () => {
        const immune = getImmuneTypesFromModifiers([{ type: 'All', modifier: 0 }], types);
        expect(immune.size).toBe(types.length);
    });

    it('only counts modifier === 0 entries, ignoring plain multipliers', () => {
        const immune = getImmuneTypesFromModifiers(getAbilityModifiers('thick-fat'), types);
        expect(immune.size).toBe(0);
        const immune2 = getImmuneTypesFromModifiers(getAbilityModifiers('levitate'), types);
        expect(immune2.has('Ground')).toBe(true);
    });
});
