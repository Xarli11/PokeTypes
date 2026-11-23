import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import golden from './fixtures/type-render.golden.json';
import typeData from '../src/data/type-data.json';
import { calculateDefense, calculateOffense } from '../src/lib/type-engine/index.js';
import { messages } from '../src/js/lang/messages.js';
import { pill, pills, renderDefenseGroups, renderOffenseGroups, renderTypePills } from '../src/lib/type-render.js';

const { types, effectiveness, contrast } = typeData;

// The golden file holds SHA-256 hashes of the SSR defense/offense/pill markup
// produced by the helpers that used to be inlined (duplicated) in
// src/pages/tipo and src/pages/pokemon (develop @ a83bbd3), for every single
// type, every ordered dual-type pair and 4 triples. They prove the extracted
// module is byte-for-byte equivalent; do not regenerate them to make a
// markup change pass — a changed hash means the visible HTML changed.
function hashFor(t1, t2, t3) {
    const def = calculateDefense(t1, t2, types, effectiveness, t3);
    const off = calculateOffense(t1, t2, types, effectiveness, t3);
    const html = [
        renderDefenseGroups(def, contrast),
        renderOffenseGroups(off, contrast),
        renderTypePills([t1, t2, t3].filter(Boolean), contrast)
    ];
    return createHash('sha256').update(JSON.stringify(html)).digest('hex');
}

describe('type-render: equivalence with the previously inlined page helpers', () => {
    it('covers 18 singles + 306 ordered pairs + 4 triples', () => {
        expect(Object.keys(golden)).toHaveLength(18 + 18 * 17 + 4);
    });

    it.each(Object.keys(golden))('%s renders identical markup', key => {
        const [t1, t2 = null, t3 = null] = key.split('/');
        expect(hashFor(t1, t2, t3)).toBe(golden[key]);
    });
});

describe('type-render: labels', () => {
    it('default labels are the English messages (SSR pages are English)', () => {
        const def = calculateDefense('Fire', 'Flying', types, effectiveness);
        const html = renderDefenseGroups(def, contrast);
        for (const key of ['defense_critical', 'defense_weak', 'defense_immune', 'defense_resists', 'defense_neutral']) {
            expect(html).toContain(`>${messages.en[key]}<`);
        }
    });

    it('accepts another label provider without touching the markup structure', () => {
        const def = calculateDefense('Fire', 'Flying', types, effectiveness);
        const es = renderDefenseGroups(def, contrast, key => messages.es[key]);
        expect(es).toContain('>Crítico<');
        expect(es.replace(/>[^<>]+<\/div><div class="flex flex-col/g, '><')).toBe(
            renderDefenseGroups(def, contrast).replace(/>[^<>]+<\/div><div class="flex flex-col/g, '><')
        );
    });

    it('renders "None" for an empty type list and picks text colour from the contrast map', () => {
        expect(pills([], contrast)).toContain('>None<');
        expect(pill('Fire', contrast)).toContain('type-text-dark');
        expect(pill('Ghost', contrast)).toContain('type-text-light');
    });
});
