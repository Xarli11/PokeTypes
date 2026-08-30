import { describe, it, expect } from 'vitest';
import { messages } from '../../src/js/lang/messages.js';

// Clear team button + confirmation modal — same pattern as
// tests/ui/i18n-redesign-keys.test.js: every new user-facing string must
// exist, and be actually translated, in both languages.
const CLEAR_TEAM_KEYS = ['pro_clear_team', 'confirm_clear_msg'];

describe('i18n — Clear team', () => {
    it.each(CLEAR_TEAM_KEYS)('"%s" exists in both en and es, and is translated (not just echoing the key)', (key) => {
        expect(messages.en[key], `en.${key}`).toBeTruthy();
        expect(messages.es[key], `es.${key}`).toBeTruthy();
        expect(messages.en[key]).not.toBe(key);
        expect(messages.es[key]).not.toBe(key);
    });

    it('es translations differ from en (not left copy-pasted in English)', () => {
        const untranslated = CLEAR_TEAM_KEYS.filter(key => messages.en[key] === messages.es[key]);
        expect(untranslated).toEqual([]);
    });

    it('EN copy matches the sprint spec exactly', () => {
        expect(messages.en.pro_clear_team).toBe('Clear team');
        expect(messages.en.confirm_clear_msg).toBe('Remove all Pokémon from this team?');
        expect(messages.en.btn_cancel).toBe('Cancel');
    });

    it('ES copy matches the sprint spec exactly', () => {
        expect(messages.es.pro_clear_team).toBe('Vaciar equipo');
        expect(messages.es.confirm_clear_msg).toBe('¿Quieres eliminar todos los Pokémon del equipo?');
        expect(messages.es.btn_cancel).toBe('Cancelar');
    });
});
