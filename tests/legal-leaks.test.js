import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildLegal, legalStatus, legalAccess } from '../src/lib/legal.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

// POKETYPES_LEGAL values must reach only the pages that legally show them: never logs, errors or
// extra public artifacts. Name, email, bases, roles and transfers appear on /privacy; NIF and
// address only on /legal.
describe('injected legal data does not leak', () => {
    it('legal.js and the legal pages never log, and swallow malformed JSON without echoing it', () => {
        for (const p of ['src/lib/legal.js', 'src/pages/privacy.astro', 'src/pages/legal.astro', 'src/components/LegalFooter.astro']) {
            expect(read(p), p).not.toMatch(/console\./);
        }
        expect(read('src/lib/legal.js')).toMatch(/catch \{\s*return \{\};/);
    });

    it('status and the draft banner expose field names only, never values', () => {
        const secret = 'SECRET-VALUE-7Q';
        const data = buildLegal({ controller: { name: 'PokeTypes', contactEmail: secret }, lssi: { applies: true, taxId: secret, address: secret, addressKind: 'other' } });
        const out = JSON.stringify(legalStatus(data)) + JSON.stringify(legalAccess('localhost', data).status);
        expect(out).not.toContain(secret);
        expect(out).toContain('controller.name');
        expect(read('scripts/check-legal.mjs')).not.toMatch(/console\.\w+\([^)]*(controller|lssi|legalBases|providers)\.(?!applies)/);
    });

    it('the NIF and address are rendered only by /legal, which exists only when art. 10 applies', () => {
        for (const p of ['src/pages/privacy.astro', 'src/components/LegalFooter.astro', 'src/layouts/Layout.astro', 'src/pages/index.astro']) {
            expect(read(p), p).not.toMatch(/lssi\.(taxId|address)/);
        }
        expect(read('src/pages/legal.astro')).toMatch(/lssi\.taxId|lssi\.address/);
    });

    it('the overrides are compiled into the server bundle only: no module that ships to the browser imports legal.js', () => {
        for (const p of ['src/js/main.js', 'src/js/modules/analytics.js', 'src/js/modules/ui.js', 'src/js/modules/pro.js']) {
            expect(read(p), p).not.toMatch(/lib\/legal/);
        }
    });
});
