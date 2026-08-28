import { describe, it, expect } from 'vitest';
import { ABILITY_EFFECTIVENESS, getAbilityModifiers } from '../../src/lib/type-engine/modifiers.js';

describe('Transistor regression', () => {
    it('boosts Electric-type moves by the modern Gen 9 value (1.3x), not the old 1.5x', () => {
        const [mod] = getAbilityModifiers('transistor');
        expect(mod.modifier).toBe(1.3);
    });

    it('is registered as an Offensive-only modifier (never changes incoming damage)', () => {
        const [mod] = ABILITY_EFFECTIVENESS['transistor'];
        expect(mod.type).toBe('Offensive');
    });
});
