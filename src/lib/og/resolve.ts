// Shared slug → data resolution for both the real pages (tipo/[...slug],
// pokemon/[name]) and their OG image routes, so an OG card can only ever
// be generated for a slug the app itself already considers valid — no
// separate/looser matching for the image endpoint (see docs/open-graph.md
// "Security").
import pokedex from '../../data/pokedex.json';
import typeData from '../../data/type-data.json';

export type PokedexEntry = {
    id: number;
    name: string;
    apiName?: string;
    types: string[];
};

const TYPES = typeData.types as string[];

export function resolveTypeSlug(slug: string | undefined | null): string[] | null {
    if (!slug) return null;
    const parts = slug.split('-');
    if (parts.length === 0 || parts.length > 3) return null;

    const findType = (s: string) => TYPES.find(t => t.toLowerCase() === s.toLowerCase());
    const resolved = parts.map(findType);
    if (resolved.some(t => !t)) return null;

    return resolved as string[];
}

export function pokemonSlug(entry: PokedexEntry): string {
    return (entry.apiName || entry.name).toLowerCase().replace(/\s+/g, '-');
}

export function resolvePokemonSlug(slug: string | undefined | null): PokedexEntry | null {
    if (!slug) return null;
    const entry = (pokedex as PokedexEntry[]).find(p => pokemonSlug(p) === slug);
    return entry || null;
}
