import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { calculateDefense, calculateOffense } from '../../src/lib/type-engine/effectiveness.js';

const { types, effectiveness } = typeData;

// The client lets a 3rd type be added to simulate effects like Forest's
// Curse / Trick-or-Treat (see type3-select in main.js / [...slug].astro).
// The shared engine treats 1/2/3 types with the same calculateDefense
// function — no separate triple-type code path — so these just confirm
// the math actually reaches 8x / 0.125x / 0x when the table supports it.
describe('calculateDefense — triple type (3rd type support)', () => {
    it('reaches 8x when all three types are individually weak to the attacker', () => {
        // Fire is 2x vs Grass, 2x vs Ice, 2x vs Bug -> 2*2*2 = 8
        const def = calculateDefense('Grass', 'Ice', types, effectiveness, 'Bug');
        expect(def.weaknesses8x).toContain('Fire');
    });

    it('reaches 0.125x when all three types individually resist the attacker', () => {
        // Fire resists Fire, Water, and Dragon at 0.5x each -> 0.125
        const def = calculateDefense('Fire', 'Water', types, effectiveness, 'Dragon');
        expect(def.resistances0125x).toContain('Fire');
    });

    it('is immune (0x) as soon as any one of the three types blocks the attacker', () => {
        // Normal is blocked by Ghost alone; Rock/Steel are irrelevant to that immunity.
        const def = calculateDefense('Rock', 'Steel', types, effectiveness, 'Ghost');
        expect(def.immunities).toContain('Normal');
    });

    it('buckets every attacking type exactly once for a triple-type combo', () => {
        const def = calculateDefense('Grass', 'Ice', types, effectiveness, 'Bug');
        const total = def.weaknesses8x.length + def.weaknesses4x.length + def.weaknesses2x.length +
            def.neutral.length + def.resistances05x.length + def.resistances025x.length +
            def.resistances0125x.length + def.immunities.length;
        expect(total).toBe(types.length);
    });
});

describe('calculateOffense — triple type', () => {
    it('still uses best-move-wins (Math.max) across all three attacking types', () => {
        // Rock is resisted by Steel (0.5x), but Fire is neutral-ish; Grass is super effective vs Rock's usual foils.
        // Use Water/Fire/Rock attacker vs Ground: Water is 2x vs Ground -> max should be >= 2 regardless of the others.
        const off = calculateOffense('Rock', 'Fire', types, effectiveness, 'Water');
        expect(off.superEffective2x).toContain('Ground');
    });
});
