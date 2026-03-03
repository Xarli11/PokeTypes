import type { APIRoute } from 'astro';
import pokedex from '../../data/pokedex.json';
import searchIndex from '../../data/search-index.json';
import typeData from '../../data/type-data.json';
import abilities from '../../data/abilities-i18n.json';
import imageFixes from '../../data/image-fixes.json';
import itemsList from '../../data/items.json';

export const GET: APIRoute = async () => {
  const data = {
    searchIndex,
    types: typeData.types,
    effectiveness: typeData.effectiveness,
    contrast: typeData.contrast,
    abilityMap: abilities,
    imageFixes: imageFixes,
    items: itemsList
    // We can also include the full pokedex here or serve it separately 
    // depending on if we want one big request or two.
    // For now, let's keep the full pokedex separate to keep initial load fast.
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};
