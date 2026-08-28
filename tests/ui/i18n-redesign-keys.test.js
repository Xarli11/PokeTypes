import { describe, it, expect } from 'vitest';
import { messages } from '../../src/js/lang/messages.js';

// Sprint 2 redesign introduced several new user-facing surfaces (defense
// severity groups, the type selector popover, Team Defense/pressure
// alerts, the member configuration panel, the full type chart toggle,
// and the simulator's raw/effective breakdown). Every new string must
// exist in both `en` and `es` — this guards against a key being added to
// only one language and silently falling back to the raw key in the UI.
const REDESIGN_KEYS = [
    'defense_critical', 'defense_weak', 'defense_immune', 'defense_resists', 'defense_strong_resists', 'defense_neutral',
    'raw_matchup', 'effective_result', 'condition_not_confirmed', 'requires_full_hp', 'requires_contact',
    'choose_type', 'clear_selection',
    'show_full_chart', 'hide_full_chart',
    'team_defense_title', 'pressure_title', 'pressure_detail', 'configure_btn', 'member_config_title', 'close_btn', 'no_ability', 'no_item',
    'sim_raw_matchup', 'sim_ability_modifier', 'sim_effective_result'
];

describe('i18n — Sprint 2 redesign keys', () => {
    it.each(REDESIGN_KEYS)('"%s" exists in both en and es, and is translated (not just echoing the key)', (key) => {
        expect(messages.en[key], `en.${key}`).toBeTruthy();
        expect(messages.es[key], `es.${key}`).toBeTruthy();
        expect(messages.en[key]).not.toBe(key);
        expect(messages.es[key]).not.toBe(key);
    });

    it('es translations differ from en for these keys (not left copy-pasted in English)', () => {
        // "Neutral" is a legitimate Spanish word too (identical spelling) —
        // everything else here is prose that should never coincide.
        const expectedIdentical = new Set(['defense_neutral']);
        const untranslated = REDESIGN_KEYS.filter(key => !expectedIdentical.has(key) && messages.en[key] === messages.es[key]);
        expect(untranslated).toEqual([]);
    });
});
