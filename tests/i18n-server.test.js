import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { messages } from '../src/js/lang/messages.js';
import { createT, escapeText, isLang, LANGS, DEFAULT_LANG } from '../src/lib/i18n-server.js';
import { renderStatsHtml, renderAbilitiesHtml } from '../src/lib/seo.js';
import { pills } from '../src/lib/type-render.js';

const root = new URL('..', import.meta.url).pathname;
const walk = dir => readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
});
const params = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

describe('createT', () => {
    const en = createT('en');
    const es = createT('es');

    it('translates from the shared messages dictionary', () => {
        expect(en.t('reset_btn')).toBe(messages.en.reset_btn);
        expect(es.t('reset_btn')).toBe(messages.es.reset_btn);
        expect(es.t('fire')).toBe('Fuego');
    });

    it('substitutes {params} like the browser i18n does', () => {
        expect(en.t('type_page_h1', { type: 'Fire/Flying' })).toBe('Fire/Flying Type Weaknesses & Resistances');
        expect(es.t('type_page_h1', { type: 'Fuego' })).toBe('Debilidades y Resistencias del Tipo Fuego');
        expect(en.t('meta_pokemon_description', { name: 'Abra', types: 'Psychic' })).toBe(
            'Abra is a Psychic-type Pokemon. See its full weakness chart, resistances, immunities, base stats, and abilities. Gen 9 (Scarlet & Violet) type calculator.'
        );
    });

    it('"ssr_<key>" overrides "<key>" for the server only, and other languages fall back to "<key>"', () => {
        expect(messages.en.defense_breakdown).toBe('Defense Breakdown'); // what the browser shows after hydrating
        expect(en.t('defense_breakdown')).toBe('Defense'); // what the server has always rendered
        expect(messages.es.ssr_defense_breakdown).toBeUndefined();
        expect(es.t('defense_breakdown')).toBe(messages.es.defense_breakdown);
    });

    it('falls back to English for a missing key, then to the key itself; unknown languages become English', () => {
        expect(es.t('ssr_only_in_english_does_not_exist')).toBe('ssr_only_in_english_does_not_exist');
        expect(createT('fr').lang).toBe(DEFAULT_LANG);
        expect(createT('fr').t('reset_btn')).toBe(messages.en.reset_btn);
        expect(createT().lang).toBe('en');
    });

    it('h() escapes & < > for element content and leaves quotes and apostrophes alone', () => {
        expect(en.h('home_h1')).toBe('Pokemon Type Calculator &amp; Weakness Checker');
        expect(escapeText(`it's "ok" <b> &`)).toBe(`it's "ok" &lt;b&gt; &amp;`);
    });

    it('LANGS / isLang', () => {
        expect(LANGS).toEqual(['en', 'es']);
        expect(isLang('es')).toBe(true);
        expect(isLang('fr')).toBe(false);
    });
});

describe('English SSR text is exactly what the pages used to hard-code', () => {
    // Frozen copy of the literals that were inline in the .astro/.js files
    // before they moved to messages.js (develop @ 913b561). A change here is a
    // change to the HTML every visitor and crawler receives.
    const frozen = {
        ssr_brand_name: 'PokeTypes',
        defense_breakdown: 'Defense',
        offense_breakdown: 'Offense',
        home_aria_label: 'PokeTypes — Home',
        toggle_language: 'Toggle language',
        toggle_dark_mode: 'Toggle dark mode',
        share_analysis: 'Share Analysis',
        extra_type_help: 'Extra Type help',
        browse_by_type: 'Browse by type',
        click_to_copy_username: 'Click to copy username',
        team_count_initial: '0/6 Pokemon',
        search_placeholder: 'Search Pokemon...',
        none: 'None',
        hidden: 'Hidden',
        stat_hp: 'HP', stat_atk: 'Attack', stat_def: 'Defense', stat_spa: 'Sp. Atk', stat_spd: 'Sp. Def', stat_spe: 'Speed',
        meta_home_title: 'PokeTypes | Pokemon Type Calculator & Effectiveness Chart',
        meta_default_description: 'Instant Pokemon type calculator and effectiveness chart. Analyze weaknesses, resistances, and dual-type coverage for all 1,000+ Pokemon (Gen 9, Scarlet/Violet included).',
        meta_home_description: 'The most advanced Pokemon type calculator and effectiveness chart. Analyze weaknesses, resistances, and dual-type coverage for all 1,000+ Pokemon (Gen 9, Scarlet/Violet included).',
        meta_keywords: 'pokemon type calculator, pokemon weakness chart, type effectiveness, pokemon SV, Gen 9, dual type calculator, resistance checker, pokemon scarlet violet, pokedex type chart',
        ld_app_alternate_name: 'Pokemon Type Calculator',
        ld_app_description: 'Advanced Pokemon type calculator and effectiveness chart for Gen 9 (Scarlet & Violet). Check weaknesses, resistances, immunities and dual-type coverage instantly.',
        defense_critical: 'Critical', defense_weak: 'Weak', defense_immune: 'Immune', defense_resists: 'Resists',
        defense_strong_resists: 'Strong Resists', defense_neutral: 'Neutral',
        super_effective: 'Super Effective', not_very_effective: 'Not Very Effective', no_effect: 'No Effect'
    };
    const { t } = createT('en');

    it.each(Object.keys(frozen))('%s', key => {
        expect(t(key)).toBe(frozen[key]);
    });

    it('page meta templates', () => {
        expect(t('meta_type_title', { type: 'Fire/Flying' })).toBe('Fire/Flying Type Weaknesses, Resistances & Chart | PokeTypes');
        expect(t('meta_type_description', { type: 'Fire' })).toBe(
            'Fire type weakness chart: full effectiveness analysis, resistances, and immunities for Gen 9 (Scarlet & Violet). See every type that beats Fire and every type Fire beats.'
        );
        expect(t('meta_pokemon_title', { name: 'Abra' })).toBe('Abra Weaknesses, Resistances & Type Chart | PokeTypes');
        expect(t('breadcrumb_type', { type: 'Fire' })).toBe('Fire Type');
        expect(['ld_feature_1', 'ld_feature_2', 'ld_feature_3', 'ld_feature_4', 'ld_feature_5', 'ld_feature_6', 'ld_feature_7', 'ld_feature_8'].map(k => t(k))).toEqual([
            'Pokemon type weakness calculator', 'Dual-type coverage analysis', 'Team Builder with 6-slot roster', 'Gen 9 (Scarlet & Violet) support',
            '1,000+ Pokemon database', 'Mobile-friendly PWA', 'Interactive type chart', 'Tactical advisor'
        ]);
    });
});

describe('dictionary invariants', () => {
    const enKeys = Object.keys(messages.en);

    it('every English key has a Spanish translation, except SSR-only overrides', () => {
        const missing = enKeys.filter(k => !k.startsWith('ssr_') && !(k in messages.es));
        expect(missing).toEqual([]);
    });

    it('every "ssr_<key>" override has a base "<key>" in the same language', () => {
        for (const lang of LANGS) {
            const orphans = Object.keys(messages[lang]).filter(k => k.startsWith('ssr_') && !(k.slice(4) in messages[lang]));
            expect(orphans).toEqual([]);
        }
    });

    it('English and Spanish use the same {placeholders}', () => {
        const mismatched = enKeys.filter(k => k in messages.es && JSON.stringify(params(messages.en[k])) !== JSON.stringify(params(messages.es[k])));
        expect(mismatched).toEqual([]);
    });
});

describe('every key the SSR layer uses exists in every language', () => {
    const files = [
        ...walk(join(root, 'src/pages')), ...walk(join(root, 'src/components')),
        join(root, 'src/layouts/Layout.astro'), join(root, 'src/lib/type-render.js'), join(root, 'src/lib/seo.js')
    ].filter(f => /\.(astro|js|ts)$/.test(f));

    const used = new Set();
    for (const f of files) {
        const src = readFileSync(f, 'utf8');
        for (const m of src.matchAll(/\b[th]\(\s*['"]([a-z0-9_]+)['"]/g)) used.add(m[1]);
        for (const m of src.matchAll(/\b(?:placeholderKey|tooltipKey)="([a-z0-9_]+)"/g)) used.add(m[1]);
    }
    ['stat_hp', 'stat_atk', 'stat_def', 'stat_spa', 'stat_spd', 'stat_spe'].forEach(k => used.add(k)); // via STAT_ROWS in seo.js

    it('finds a realistic number of keys (guards the scan itself)', () => {
        expect(used.size).toBeGreaterThan(40);
    });

    it.each(LANGS)('%s', lang => {
        const missing = [...used].filter(k => !(`ssr_${k}` in messages[lang]) && !(k in messages[lang]));
        expect(missing).toEqual([]);
    });
});

describe('no English literals left in SSR templates', () => {
    const sources = [
        'src/pages/index.astro', 'src/pages/tipo/[...slug].astro', 'src/pages/pokemon/[name].astro',
        'src/components/AppHeader.astro', 'src/components/ControlPanel.astro', 'src/components/ShareButton.astro',
        'src/components/TypeLinks.astro', 'src/components/TypeSelectorField.astro', 'src/layouts/Layout.astro',
        'src/lib/type-render.js', 'src/lib/seo.js'
    ].map(f => [f, readFileSync(join(root, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '')]);

    const literals = [
        'Browse by type', 'Share Analysis', 'Toggle language', 'Toggle dark mode', 'Extra Type help', 'Click to copy username',
        'Search Pokemon...', 'Weaknesses, Resistances', 'Mastering the Pokemon Type Chart', 'Frequently Asked Questions',
        'Pokemon type weakness calculator', 'Mobile-friendly PWA', '>Hidden<', '>None<', '>Critical<', '>Base Stats<'
    ];

    it.each(sources)('%s', (_file, src) => {
        for (const literal of literals) expect(src).not.toContain(literal);
    });
});

describe('render helpers accept a label provider', () => {
    const es = createT('es').t;

    it('stats and abilities labels', () => {
        const stats = renderStatsHtml({ hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 }, es);
        expect(stats).toContain('>PS<');
        expect(stats).toContain('>At. Esp<');
        const abilities = renderAbilitiesHtml({ 0: 'Blaze', H: 'Solar Power' }, es);
        expect(abilities).toContain('>Oculta<');
    });

    it('empty list label', () => {
        expect(pills([], {}, es)).toContain('>Ninguno<');
    });
});
