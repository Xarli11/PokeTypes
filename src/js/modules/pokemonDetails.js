import { pokemonSlug } from '../../lib/seo.js';

// Same matching rules main.js always used for /pokemon/<slug>. Kept as a
// function so it can run against the search index first (fast) and the full
// pokedex second: the index has no apiName, so form slugs such as
// "charizard-mega-x" only resolve against the full pokedex.
export function findPokemonBySlug(list, slug) {
    const s = slug.toLowerCase();
    return list.find(item =>
        item.name.toLowerCase() === s ||
        (item.apiName && item.apiName.toLowerCase() === s) ||
        item.name.toLowerCase().replace(/\s+/g, '-') === s
    );
}

// The server-rendered stats/abilities block belongs to one Pokemon
// (data-ssr-slug). It may only be kept on screen for that same Pokemon.
export function ssrOwnedBy(container, pokemon) {
    return container.dataset.ssrSlug === pokemonSlug(pokemon);
}

// Responses can arrive out of order. Each load takes a ticket; only the
// latest ticket may write to the DOM.
export function createLatestGate() {
    let latest = 0;
    return {
        begin: () => ++latest,
        isLatest: (ticket) => ticket === latest
    };
}
