// Static source guards against the exact regression this sprint fixed:
// og:image pointing at a non-existent /og-image.png, or at
// raw.githubusercontent.com directly. Cheap and specific — not a
// rendering test, just "did the wiring change back".
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const read = (relativePath) => readFileSync(path.join(rootDir, relativePath), 'utf-8');

describe('Layout.astro default social image', () => {
    it('defaults to the local /og/default.png route, not the missing /og-image.png', () => {
        const source = read('src/layouts/Layout.astro');
        expect(source).toContain(`image = "/og/default.png"`);
        expect(source).not.toContain('/og-image.png');
    });

    it('declares og:image:type, og:image:alt, and og:image:secure_url', () => {
        const source = read('src/layouts/Layout.astro');
        expect(source).toMatch(/og:image:type/);
        expect(source).toMatch(/og:image:alt/);
        expect(source).toMatch(/og:image:secure_url/);
        expect(source).toMatch(/twitter:image:alt/);
    });
});

describe('pokemon/[name].astro social image', () => {
    it('passes the local /og/pokemon/ route to Layout, not the raw artwork URL', () => {
        const source = read('src/pages/pokemon/[name].astro');
        expect(source).toMatch(/const ogImage = `\/og\/pokemon\/\$\{slug\}\.png`/);
        expect(source).toMatch(/<Layout[^>]*image=\{ogImage\}/);
    });
});

describe('tipo/[...slug].astro social image', () => {
    it('passes the local /og/type/ route to Layout', () => {
        const source = read('src/pages/tipo/[...slug].astro');
        expect(source).toMatch(/const ogImage = `\/og\/type\/\$\{slug\}\.png`/);
        expect(source).toMatch(/<Layout[^>]*image=\{ogImage\}/);
    });
});
