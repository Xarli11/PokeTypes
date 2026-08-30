import { describe, it, expect, beforeEach } from 'vitest';

// team.js persists to localStorage; Vitest's default (Node) environment
// has no `localStorage` global, so it must be stubbed before import — see
// the same pattern in tests/ui/type-selector.test.js.
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k)
    };
}

const { loadTeam, addPokemonToSlot, setAbility, setNature, setItem, setTeraType, clearTeam, getTeam } =
    await import('../src/js/modules/team.js');

function samplePokemon(overrides = {}) {
    return {
        id: 6,
        name: 'Charizard',
        apiName: 'charizard',
        types: ['Fire', 'Flying'],
        spriteSlug: 'charizard',
        stats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
        abilities: { '0': 'Blaze', H: 'Solar Power' },
        ...overrides
    };
}

// team.js's `team` array is module-scope state (a deliberate singleton —
// see team.js), so every test starts from a known baseline the same way
// a fresh page load would: clear localStorage, then re-sync in-memory
// state from it via loadTeam().
beforeEach(() => {
    localStorage.removeItem('poketypes_team');
    loadTeam();
});

describe('clearTeam', () => {
    it('empties every slot back to null', () => {
        addPokemonToSlot(0, samplePokemon());
        addPokemonToSlot(3, samplePokemon({ id: 149, name: 'Dragonite', apiName: 'dragonite', types: ['Dragon', 'Flying'] }));

        clearTeam();

        expect(getTeam()).toEqual(new Array(6).fill(null));
    });

    it('drops per-slot config (ability/nature/item/tera) along with the member — nothing left over', () => {
        addPokemonToSlot(0, samplePokemon());
        setAbility(0, 'Solar Power');
        setNature(0, 'Timid');
        setItem(0, 'heavy-duty-boots');
        setTeraType(0, 'Dragon');

        clearTeam();

        // Re-adding the same species after a clear must not resurrect any
        // of the previous config — a fresh add() picks its own default
        // ability, and nature/item start unset (see addPokemonToSlot).
        addPokemonToSlot(0, samplePokemon());
        expect(getTeam()[0]).toMatchObject({ ability: 'Blaze', nature: null, item: null, teraType: 'Fire' });
    });

    it('persists the empty team, so a reload does not resurrect cleared members', () => {
        addPokemonToSlot(0, samplePokemon());
        clearTeam();

        // Simulate a reload: drop in-memory state and re-read from
        // localStorage exactly like loadTeam() does on page load.
        const persisted = JSON.parse(localStorage.getItem('poketypes_team'));
        expect(persisted).toEqual(new Array(6).fill(null));

        loadTeam();
        expect(getTeam()).toEqual(new Array(6).fill(null));
    });

    it('is safe to call on an already-empty team (idempotent, no throw)', () => {
        expect(() => clearTeam()).not.toThrow();
        expect(getTeam()).toEqual(new Array(6).fill(null));
    });

    it('is safe to call repeatedly in a row (double-confirm safety)', () => {
        addPokemonToSlot(0, samplePokemon());
        clearTeam();
        clearTeam();
        expect(getTeam()).toEqual(new Array(6).fill(null));
    });

    it('team is usable again after clearing — re-adding a Pokemon works', () => {
        addPokemonToSlot(0, samplePokemon());
        clearTeam();

        const added = addPokemonToSlot(2, samplePokemon({ name: 'Pikachu', apiName: 'pikachu', id: 25, types: ['Electric'] }));

        expect(added).toBe(true);
        expect(getTeam()[2]?.name).toBe('Pikachu');
        expect(getTeam().filter(Boolean)).toHaveLength(1);
    });
});
