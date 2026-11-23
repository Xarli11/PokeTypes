// Display name of a Pokemon in a language. Names stay official (never invented): the only
// presentation rule is the Spanish spelling of Mega forms, "Mega-Charizard X" (hyphen).
// Display only: slugs, routes, canonicals and lookups keep using the internal name.
/** @param {string} name display name as in the Pokedex ("Mega Charizard X") @param {string} lang */
export function localizePokemonName(name, lang) {
    return lang === 'es' ? String(name).replace(/^Mega /, 'Mega-') : name;
}
