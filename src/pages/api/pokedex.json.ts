import type { APIRoute } from 'astro';
import pokedex from '../../data/pokedex.json';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(pokedex), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};
