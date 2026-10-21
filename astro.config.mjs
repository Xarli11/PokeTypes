import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://poketypes.app',
  output: 'server',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    // Owner legal data comes from the environment at build time, never from Git
    // (see src/lib/legal.js). Unset means every legal field stays pending.
    define: {
      __LEGAL_OVERRIDES__: JSON.stringify(process.env.POKETYPES_LEGAL ?? '{}'),
    },
  },
});
