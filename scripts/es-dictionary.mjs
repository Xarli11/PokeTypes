// Spanish dictionary for editorial review, generated from the REAL dictionary (src/js/lang/messages.js).
//   node scripts/es-dictionary.mjs           write docs/i18n/es-dictionary.csv
//   node scripts/es-dictionary.mjs --check   exit 1 if the file differs from the dictionary (tests run this too)
// review_status is never "approved" here: a string in ES_DRAFT_KEYS is "pending-review"; any other string is
// "unreviewed". Approval is a human decision recorded by removing the key from ES_DRAFT_KEYS in its own PR.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { messages } from '../src/js/lang/messages.js';
import { ES_DRAFT_KEYS } from '../src/lib/i18n-pilot.js';

const root = new URL('../', import.meta.url);
const OUT = new URL('docs/i18n/es-dictionary.csv', root);

/** Keys referenced literally in src/ (data-i18n, i18n.t('k'), t('k'), h('k'), descriptionKey/labelKey strings). Dynamic keys are not detected. */
export function keysUsedInSource() {
    const used = new Set();
    const walk = dir => {
        for (const entry of readdirSync(new URL(dir, root), { withFileTypes: true })) {
            const path = `${dir}${entry.name}`;
            if (entry.isDirectory()) walk(`${path}/`);
            else if (/\.(astro|js|ts)$/.test(entry.name) && !path.endsWith('lang/messages.js')) {
                const src = readFileSync(new URL(path, root), 'utf8');
                for (const m of src.matchAll(/data-i18n(?:-[a-z]+)?="([a-z0-9_]+)"/g)) used.add(m[1]);
                for (const m of src.matchAll(/\b(?:i18n\.t|t|h)\(\s*'([a-z0-9_]+)'/g)) used.add(m[1]);
                for (const m of src.matchAll(/(?:descriptionKey|labelKey|titleKey)\s*:\s*'([a-z0-9_]+)'/g)) used.add(m[1]);
                for (const m of src.matchAll(/'((?:role|modifier|meta|ld|faq|es_404|lang_notice)_[a-z0-9_]+)'/g)) used.add(m[1]);
            }
        }
    };
    walk('src/');
    return used;
}

const cell = value => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function buildCsv() {
    const draft = new Set(ES_DRAFT_KEYS);
    const used = keysUsedInSource();
    const keys = [...new Set([...Object.keys(messages.en), ...Object.keys(messages.es)])].sort();
    const rows = [['key', 'en', 'es', 'in_draft_registry', 'used_in_code', 'review_status']];
    for (const key of keys) {
        const base = key.replace(/^ssr_/, '');
        rows.push([
            key, messages.en[key] ?? '', messages.es[key] ?? '',
            draft.has(key) ? 'yes' : 'no',
            used.has(key) || used.has(base) ? 'yes' : 'no',
            draft.has(key) ? 'pending-review' : 'unreviewed'
        ]);
    }
    return rows.map(r => r.map(cell).join(',')).join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const csv = buildCsv();
    if (process.argv.includes('--check')) {
        let current = '';
        try { current = readFileSync(OUT, 'utf8'); } catch { /* missing */ }
        if (current !== csv) { console.error('docs/i18n/es-dictionary.csv is out of date: run node scripts/es-dictionary.mjs'); process.exit(1); }
        console.log('es-dictionary.csv is in sync');
    } else {
        writeFileSync(OUT, csv);
        console.log(`wrote ${OUT.pathname} (${csv.split('\n').length - 2} keys)`);
    }
}
