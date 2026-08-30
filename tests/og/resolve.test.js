import { describe, it, expect } from 'vitest';
import { resolveTypeSlug, resolvePokemonSlug, pokemonSlug } from '../../src/lib/og/resolve.js';

describe('resolveTypeSlug', () => {
    it('resolves a single type', () => {
        expect(resolveTypeSlug('fire')).toEqual(['Fire']);
    });

    it('resolves a dual type, case-insensitively', () => {
        expect(resolveTypeSlug('Dragon-FLYING')).toEqual(['Dragon', 'Flying']);
    });

    it('resolves a triple type', () => {
        expect(resolveTypeSlug('fire-flying-dragon')).toEqual(['Fire', 'Flying', 'Dragon']);
    });

    it('rejects an unknown type name', () => {
        expect(resolveTypeSlug('not-a-type')).toBeNull();
    });

    it('rejects a slug where only one part is invalid', () => {
        expect(resolveTypeSlug('fire-nope')).toBeNull();
    });

    it('rejects more than three parts', () => {
        expect(resolveTypeSlug('fire-water-grass-electric')).toBeNull();
    });

    it('rejects empty/missing input', () => {
        expect(resolveTypeSlug('')).toBeNull();
        expect(resolveTypeSlug(undefined)).toBeNull();
        expect(resolveTypeSlug(null)).toBeNull();
    });
});

describe('resolvePokemonSlug', () => {
    it('resolves a base species by name-derived slug', () => {
        const entry = resolvePokemonSlug('dragonite');
        expect(entry?.name).toBe('Dragonite');
        expect(entry?.id).toBe(149);
    });

    it('resolves a long Gmax form slug', () => {
        const entry = resolvePokemonSlug('urshifu-rapid-strike-gmax');
        expect(entry?.name).toBe('Urshifu-Rapid-Strike-Gmax');
    });

    it('resolves a form with parentheses in its display name via its apiName slug', () => {
        const entry = resolvePokemonSlug('tauros-paldea-blaze-breed');
        expect(entry?.name).toContain('Tauros');
        expect(pokemonSlug(entry)).toBe('tauros-paldea-blaze-breed');
    });

    it('rejects an unresolvable slug', () => {
        expect(resolvePokemonSlug('not-a-real-pokemon-xyz')).toBeNull();
    });

    it('rejects empty/missing input', () => {
        expect(resolvePokemonSlug('')).toBeNull();
        expect(resolvePokemonSlug(undefined)).toBeNull();
    });
});
