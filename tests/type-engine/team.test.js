import { describe, it, expect } from 'vitest';
import typeData from '../../src/data/type-data.json';
import { analyzeTeamDefense, getThreatAlerts, getPokemonDefenseBreakdown } from '../../src/lib/type-engine/team.js';

const { types, effectiveness } = typeData;

function pokemon(overrides) {
    return { name: 'test-mon', types: ['Normal'], ability: null, item: null, ...overrides };
}

describe('analyzeTeamDefense — no modifiers (baseline)', () => {
    it('counts a single Fire/Flying member as weak to Rock', () => {
        const team = [pokemon({ name: 'charizard', types: ['Fire', 'Flying'] }), null, null, null, null, null];
        const { matrix, teamSize } = analyzeTeamDefense(team, types, effectiveness);
        expect(teamSize).toBe(1);
        expect(matrix.Rock.weak).toBe(1);
        expect(matrix.Rock.pokemonWeak).toEqual(['charizard']);
    });

    it('ignores null slots', () => {
        const team = [null, null, null, null, null, null];
        const { teamSize } = analyzeTeamDefense(team, types, effectiveness);
        expect(teamSize).toBe(0);
    });
});

// Regression coverage for the known analysis.js bug: previously, only
// modifier === 0 (hard immunities) were ever applied to team analysis —
// every other ability/item modifier (halving, doubling, conditional
// reductions) was silently ignored.
describe('analyzeTeamDefense — non-zero ability/item modifiers now apply', () => {
    it('Thick Fat halves a Fire weakness into neutral, removing it from the weak tally', () => {
        // Grass-type: Fire is 2x weak by typing alone.
        const withoutAbility = analyzeTeamDefense(
            [pokemon({ name: 'plain-grass', types: ['Grass'] }), null, null, null, null, null],
            types, effectiveness
        );
        expect(withoutAbility.matrix.Fire.weak).toBe(1);

        const withThickFat = analyzeTeamDefense(
            [pokemon({ name: 'thick-fat-grass', types: ['Grass'], ability: 'thick-fat' }), null, null, null, null, null],
            types, effectiveness
        );
        // 2x halved by Thick Fat -> 1x neutral: no longer weak, and not a resist either.
        expect(withThickFat.matrix.Fire.weak).toBe(0);
    });

    it('also works with the display-form ability name Team Builder actually stores (pokedex.json uses "Thick Fat", not "thick-fat")', () => {
        const withDisplayForm = analyzeTeamDefense(
            [pokemon({ name: 'thick-fat-grass', types: ['Grass'], ability: 'Thick Fat' }), null, null, null, null, null],
            types, effectiveness
        );
        expect(withDisplayForm.matrix.Fire.weak).toBe(0);
        expect(withDisplayForm.matrix.Fire.resist).toBe(0);
    });

    it('Heatproof turns neutral Fire damage into a resistance', () => {
        // Fire vs Normal is neutral (1x) by typing; Heatproof halves it to 0.5x.
        const team = [pokemon({ name: 'heatproof-mon', types: ['Normal'], ability: 'heatproof' }), null, null, null, null, null];
        const { matrix } = analyzeTeamDefense(team, types, effectiveness);
        expect(matrix.Fire.weak).toBe(0);
        expect(matrix.Fire.resist).toBe(1);
        expect(matrix.Fire.pokemonResist).toEqual(['heatproof-mon']);
    });

    it('Fluffy turns Fire neutral damage into a weakness', () => {
        const team = [pokemon({ name: 'fluffy-mon', types: ['Normal'], ability: 'fluffy' }), null, null, null, null, null];
        const { matrix } = analyzeTeamDefense(team, types, effectiveness);
        expect(matrix.Fire.weak).toBe(1);
    });

    it('Air Balloon grants a Ground immunity that shows up in the immune tally', () => {
        const team = [pokemon({ name: 'balloon-mon', types: ['Rock', 'Ground'], item: 'air-balloon' }), null, null, null, null, null];
        const { matrix } = analyzeTeamDefense(team, types, effectiveness);
        expect(matrix.Ground.immune).toBe(1);
        expect(matrix.Ground.weak).toBe(0);
    });

    it('Wonder Guard zeroes every non-super-effective attacking type', () => {
        const team = [pokemon({ name: 'wonder-mon', types: ['Normal'], ability: 'wonder-guard' }), null, null, null, null, null];
        const { matrix } = analyzeTeamDefense(team, types, effectiveness);
        // Fighting is 2x vs Normal by typing -> stays weak.
        expect(matrix.Fighting.weak).toBe(1);
        // Everything that was neutral/resisted/immune by typing becomes immune under Wonder Guard.
        expect(matrix.Water.immune).toBe(1);
        expect(matrix.Water.weak).toBe(0);
    });
});

// Regression coverage: analyzeTeamDefense must never silently assume a
// battle condition (full HP, contact, ...) it can't actually know. A
// Multiscale/Shadow Shield/Tera Shell Pokemon's weak/resist/immune tally
// should reflect its RAW typing (Team Builder has no HP tracking), not a
// best-case "already at full HP" assumption.
describe('analyzeTeamDefense — never assumes an unconfirmed battle condition', () => {
    it('Multiscale does not hide a Dragon/Flying member\'s real Ice weakness', () => {
        const team = [pokemon({ name: 'dragonite', types: ['Dragon', 'Flying'], ability: 'multiscale' }), null, null, null, null, null];
        const { matrix } = analyzeTeamDefense(team, types, effectiveness);
        expect(matrix.Ice.weak).toBe(1);
    });

    it('Tera Shell does not force every matchup to Not Very Effective without confirmed full HP', () => {
        const team = [pokemon({ name: 'tera-shell-mon', types: ['Dragon', 'Flying'], ability: 'tera-shell' }), null, null, null, null, null];
        const { matrix } = analyzeTeamDefense(team, types, effectiveness);
        expect(matrix.Ice.weak).toBe(1);
    });
});

describe('getPokemonDefenseBreakdown — raw vs effective', () => {
    it('reports the same value for both when there is no ability/item', () => {
        const { raw, effective } = getPokemonDefenseBreakdown(pokemon({ types: ['Fire', 'Flying'] }), types, effectiveness);
        expect(effective).toEqual(raw);
    });

    it('keeps the original TYPE-only matchup visible alongside the ability-adjusted one (Solid Rock)', () => {
        const { raw, effective } = getPokemonDefenseBreakdown(
            pokemon({ types: ['Rock', 'Ground'], ability: 'solid-rock' }),
            types, effectiveness
        );
        // Water is 4x super effective vs Rock/Ground by typing alone...
        expect(raw.Water).toBe(4);
        // ...but Solid Rock softens any super-effective hit by 25%.
        expect(effective.Water).toBe(3);
    });

    it('accepts an explicit context for the conditional abilities (fullHp for Multiscale)', () => {
        const p = pokemon({ types: ['Dragon', 'Flying'], ability: 'multiscale' });
        const withoutContext = getPokemonDefenseBreakdown(p, types, effectiveness);
        const withFullHp = getPokemonDefenseBreakdown(p, types, effectiveness, { fullHp: true });
        expect(withoutContext.effective.Ice).toBe(4);
        expect(withFullHp.effective.Ice).toBe(2);
        expect(withFullHp.raw.Ice).toBe(4); // raw never changes regardless of context
    });
});

describe('getThreatAlerts', () => {
    it('flags a major weakness once enough team members share it', () => {
        const team = [
            pokemon({ name: 'a', types: ['Fire'] }),
            pokemon({ name: 'b', types: ['Fire'] }),
            pokemon({ name: 'c', types: ['Fire'] }),
            null, null, null
        ];
        const analysis = analyzeTeamDefense(team, types, effectiveness);
        const alerts = getThreatAlerts(analysis);
        expect(alerts.some(a => a.messageType === 'Water' && a.code === 'major_weakness')).toBe(true);
    });

    it('returns no alerts for an empty team', () => {
        const analysis = analyzeTeamDefense([null, null, null, null, null, null], types, effectiveness);
        expect(getThreatAlerts(analysis)).toEqual([]);
    });
});
