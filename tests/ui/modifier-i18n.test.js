import { describe, it, expect } from 'vitest';
import { messages } from '../../src/js/lang/messages.js';
import { ABILITY_EFFECTIVENESS, ITEM_EFFECTIVENESS } from '../../src/lib/type-engine/modifiers.js';

// Every ability/item modifier entry in modifiers.js carries a
// `descriptionKey` instead of a hardcoded English string (see that
// file's header comment). This structural test walks the full catalog
// so that adding a new ability/item WITHOUT a translated description
// fails `npm test` immediately, instead of silently leaking raw English
// (or a raw i18n key) into the UI in production — exactly the bug this
// hotfix fixes for the existing catalog (found via Multiscale showing
// its description untranslated on Dragonite in Spanish).
function collectDescriptionKeys(catalog) {
    const keys = new Set();
    Object.values(catalog).forEach(entries => {
        entries.forEach(entry => {
            expect(entry.descriptionKey, `entry missing descriptionKey: ${JSON.stringify(entry)}`).toBeTruthy();
            keys.add(entry.descriptionKey);
        });
    });
    return keys;
}

describe('modifier i18n — structural coverage', () => {
    const abilityKeys = collectDescriptionKeys(ABILITY_EFFECTIVENESS);
    const itemKeys = collectDescriptionKeys(ITEM_EFFECTIVENESS);
    const allKeys = new Set([...abilityKeys, ...itemKeys]);

    it('found at least one descriptionKey per catalog (sanity check the catalogs are not empty)', () => {
        expect(abilityKeys.size).toBeGreaterThan(0);
        expect(itemKeys.size).toBeGreaterThan(0);
    });

    it.each([...allKeys])('"%s" has a real EN translation (not just echoing the key)', (key) => {
        expect(messages.en[key], `en.${key}`).toBeTruthy();
        expect(messages.en[key]).not.toBe(key);
    });

    it.each([...allKeys])('"%s" has a real ES translation (not just echoing the key)', (key) => {
        expect(messages.es[key], `es.${key}`).toBeTruthy();
        expect(messages.es[key]).not.toBe(key);
    });

    it('no ability/item modifier entry falls back to a hardcoded English `description` field', () => {
        const catalogs = [ABILITY_EFFECTIVENESS, ITEM_EFFECTIVENESS];
        catalogs.forEach(catalog => {
            Object.values(catalog).forEach(entries => {
                entries.forEach(entry => {
                    expect(entry.description, `unexpected hardcoded description: ${JSON.stringify(entry)}`).toBeUndefined();
                });
            });
        });
    });

    it('ES translations differ from EN (not left copy-pasted in English)', () => {
        const untranslated = [...allKeys].filter(key => messages.en[key] === messages.es[key]);
        expect(untranslated).toEqual([]);
    });
});

describe('modifier i18n — specific abilities/items (EN + ES)', () => {
    const abilityDescriptionKey = (slug) => ABILITY_EFFECTIVENESS[slug][0].descriptionKey;
    const itemDescriptionKey = (slug) => ITEM_EFFECTIVENESS[slug][0].descriptionKey;

    it('Multiscale EN', () => {
        expect(messages.en[abilityDescriptionKey('multiscale')]).toBe('Halves damage while the Pokémon is at full HP.');
    });
    it('Multiscale ES', () => {
        expect(messages.es[abilityDescriptionKey('multiscale')]).toBe('Reduce a la mitad el daño recibido mientras el Pokémon tenga todos sus PS.');
    });

    it('Thick Fat EN (Fire component)', () => {
        expect(messages.en[ABILITY_EFFECTIVENESS['thick-fat'][0].descriptionKey]).toBe('Halves damage from Fire-type moves.');
    });
    it('Thick Fat ES (Fire component)', () => {
        expect(messages.es[ABILITY_EFFECTIVENESS['thick-fat'][0].descriptionKey]).toBe('Reduce a la mitad el daño recibido de movimientos de tipo Fuego.');
    });

    it('Levitate EN', () => {
        expect(messages.en[abilityDescriptionKey('levitate')]).toBe('Grants immunity to Ground-type moves.');
    });
    it('Levitate ES', () => {
        expect(messages.es[abilityDescriptionKey('levitate')]).toBe('Otorga inmunidad a los movimientos de tipo Tierra.');
    });

    it('Solid Rock EN', () => {
        expect(messages.en[abilityDescriptionKey('solid-rock')]).toBe('Reduces damage from super-effective moves by 25%.');
    });
    it('Solid Rock ES', () => {
        expect(messages.es[abilityDescriptionKey('solid-rock')]).toBe('Reduce un 25 % el daño recibido de movimientos supereficaces.');
    });

    it('Fluffy EN (Fire component)', () => {
        expect(messages.en[ABILITY_EFFECTIVENESS['fluffy'][0].descriptionKey]).toBe('Doubles damage taken from Fire-type moves.');
    });
    it('Fluffy ES (Fire component)', () => {
        expect(messages.es[ABILITY_EFFECTIVENESS['fluffy'][0].descriptionKey]).toBe('Duplica el daño recibido de movimientos de tipo Fuego.');
    });
    it('Fluffy EN (contact component)', () => {
        expect(messages.en[ABILITY_EFFECTIVENESS['fluffy'][1].descriptionKey]).toBe('Halves damage from contact moves.');
    });
    it('Fluffy ES (contact component)', () => {
        expect(messages.es[ABILITY_EFFECTIVENESS['fluffy'][1].descriptionKey]).toBe('Reduce a la mitad el daño recibido de movimientos de contacto.');
    });

    it('Tera Shell EN', () => {
        expect(messages.en[abilityDescriptionKey('tera-shell')]).toBe('At full HP, moves that can hit the Pokémon become not very effective.');
    });
    it('Tera Shell ES', () => {
        expect(messages.es[abilityDescriptionKey('tera-shell')]).toBe('Mientras el Pokémon tenga todos sus PS, los movimientos que puedan golpearlo pasan a ser poco eficaces.');
    });

    it('Ring Target EN', () => {
        expect(messages.en[itemDescriptionKey('ring-target')]).toBe("Negates immunities caused by the holder's type, but not immunities granted by abilities or other effects.");
    });
    it('Ring Target ES', () => {
        expect(messages.es[itemDescriptionKey('ring-target')]).toBe('Anula las inmunidades causadas por el tipo del Pokémon, pero no las otorgadas por habilidades u otros efectos.');
    });

    it('Air Balloon EN', () => {
        expect(messages.en[itemDescriptionKey('air-balloon')]).toBe('Grants immunity to Ground-type moves while the item is active.');
    });
    it('Air Balloon ES', () => {
        expect(messages.es[itemDescriptionKey('air-balloon')]).toBe('Otorga inmunidad a los movimientos de tipo Tierra mientras el efecto del objeto esté activo.');
    });

    it('Transistor keeps the modern Gen 9 1.3x multiplier (unaffected by this i18n change)', () => {
        expect(ABILITY_EFFECTIVENESS['transistor'][0].modifier).toBe(1.3);
    });
});
