// Manual browser check for the Spanish pilot (needs a build with ES_PILOT_ENABLED = true in src/lib/i18n-pilot.js).
//   npm i --no-save puppeteer-core
//   (edit the switch locally, do NOT commit it) npm run build && npx wrangler pages dev dist --port 4399 --compatibility-date=2025-01-01 --compatibility-flag=nodejs_compat
//   node scripts/manual/es-pilot-check.mjs [http://localhost:4399]
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:4399';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const results = [];
const wait = ms => new Promise(r => setTimeout(r, ms));
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> ${detail}`}`); };

async function open(path, { before } = {}) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    if (before) await page.evaluateOnNewDocument(before);
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    await wait(800);
    return { page, ctx };
}
const settle = async page => { await page.waitForNetworkIdle({ idleTime: 600, timeout: 10000 }).catch(() => {}); await wait(600); };
const pick = async (page, id, value) => {
    await page.evaluate((id, value) => { const s = document.getElementById(id); s.value = value; s.dispatchEvent(new Event('change', { bubbles: true })); }, id, value);
    await settle(page);
};
const snap = page => page.evaluate(() => ({
    url: location.pathname + location.search,
    lang: document.documentElement.lang,
    h1: (document.querySelector('h1')?.textContent || '').trim(),
    sw: document.getElementById('lang-toggle')?.outerHTML.slice(0, 200),
    swHref: document.getElementById('lang-toggle')?.getAttribute('href'),
    swDisabled: document.getElementById('lang-toggle')?.getAttribute('aria-disabled') === 'true',
    notice: document.getElementById('lang-notice')?.textContent.trim() || null,
    noticeHref: document.querySelector('#lang-notice a')?.getAttribute('href') || null,
    storedLang: localStorage.getItem('poketypes_lang'),
    intent: sessionStorage.getItem('poketypes_es_intent'),
    t1: document.getElementById('type-select')?.value
}));

// 1. entering a Spanish page: Spanish UI from the URL, nothing written to localStorage
{
    const { page, ctx } = await open('/es');
    const s = await snap(page);
    check('1a /es: html lang es, Spanish heading', s.lang === 'es' && /Calculadora/.test(s.h1), JSON.stringify(s));
    check('1b visiting /es writes nothing to localStorage', s.storedLang === null, JSON.stringify(s));
    check('1c selector is a link to the English home', s.swHref === '/', s.sw);
    check('1d Spanish placeholders in the page', await page.evaluate(() => document.getElementById('pokemon-search').placeholder === 'Buscar Pokémon...'));
    await ctx.close();
}
// 2. inside the pilot: pushState to Spanish URLs; selector follows the URL
{
    const { page, ctx } = await open('/es');
    await pick(page, 'type-select', 'Fire');
    let s = await snap(page); check('2a Fuego -> /es/tipo/fuego (no reload), selector -> /tipo/fire', s.url === '/es/tipo/fuego' && s.swHref === '/tipo/fire' && s.lang === 'es', JSON.stringify(s));
    await pick(page, 'type2-select', 'Flying');
    s = await snap(page); check('2b + Volador -> /es/tipo/fuego-volador', s.url === '/es/tipo/fuego-volador' && s.swHref === '/tipo/fire-flying', JSON.stringify(s));
    await page.goBack(); await settle(page);
    s = await snap(page); check('2c back -> /es/tipo/fuego', s.url === '/es/tipo/fuego' && s.t1 === 'Fire', JSON.stringify(s));
    await ctx.close();
}
// 3. leaving the pilot: full navigation to the English page, which says it has no Spanish version
{
    const { page, ctx } = await open('/es');
    await pick(page, 'type-select', 'Water');
    await settle(page);
    const s = await snap(page);
    check('3a Agua (not in the pilot) -> English URL /tipo/water, English document', s.url === '/tipo/water' && s.lang === 'en', JSON.stringify(s));
    check('3b the English page tells (in Spanish) there is no Spanish version', /aún no está disponible en español/.test(s.notice || ''), JSON.stringify(s));
    check('3c selector is the "not available" button, not a link to /es', s.swDisabled && !s.swHref, s.sw);
    check('3d localStorage language untouched', s.storedLang === null, JSON.stringify(s));
    await page.goBack(); await settle(page);
    const b = await snap(page); check('3e back -> /es again', b.url === '/es' && b.lang === 'es', JSON.stringify(b));
    await ctx.close();
}
// 4. English -> Spanish through the selector
{
    const { page, ctx } = await open('/');
    await pick(page, 'type-select', 'Fire');
    let s = await snap(page); check('4a English /tipo/fire: selector links to /es/tipo/fuego', s.url === '/tipo/fire' && s.swHref === '/es/tipo/fuego', JSON.stringify(s));
    await pick(page, 'type-select', 'Water');
    s = await snap(page); check('4b /tipo/water: selector becomes the disabled button', s.swDisabled && !s.swHref, s.sw);
    await page.click('#lang-toggle'); await wait(300);
    check('4c clicking it explains why (live note), no navigation', await page.evaluate(() => /not available/i.test(document.getElementById('lang-note')?.textContent || '') && location.pathname === '/tipo/water'));
    await pick(page, 'type-select', 'Fire');
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#lang-toggle')]);
    s = await snap(page); check('4d click -> full navigation to /es/tipo/fuego, Spanish document', s.url === '/es/tipo/fuego' && s.lang === 'es', JSON.stringify(s));
    await ctx.close();
}
// 5. legacy preference: the URL decides the language, the notice offers Spanish
{
    const { page, ctx } = await open('/', { before: () => localStorage.setItem('poketypes_lang', 'es') });
    const s = await snap(page);
    check('5a saved Spanish + English URL: page stays English (no mixed language)', s.lang === 'en' && /Pokemon Type Calculator/.test(s.h1), JSON.stringify(s));
    check('5b discreet notice offers /es', s.noticeHref === '/es', JSON.stringify(s));
    await page.click('#lang-notice button'); await wait(300);
    check('5c notice can be dismissed', await page.evaluate(() => !document.getElementById('lang-notice')));
    const { page: p2, ctx: c2 } = await open('/tipo/water', { before: () => localStorage.setItem('poketypes_lang', 'es') });
    const s2 = await snap(p2);
    check('5d saved Spanish on a page without Spanish: English page + "not available" notice', s2.lang === 'en' && /aún no está disponible/.test(s2.notice || ''), JSON.stringify(s2));
    await ctx.close(); await c2.close();
}
// 6. no notice for visitors with no Spanish signal
{
    const { page, ctx } = await open('/tipo/water');
    const s = await snap(page); check('6 plain English visitor: no notice', s.notice === null && s.lang === 'en', JSON.stringify(s));
    await ctx.close();
}
// 7. Team Builder in Spanish: /es?mode=pro, back works
{
    const { page, ctx } = await open('/es');
    await page.click('#toggle-pro'); await wait(500);
    let s = await snap(page); check('7a Equipo: /es?mode=pro', s.url === '/es?mode=pro', JSON.stringify(s));
    await page.goBack(); await settle(page);
    s = await snap(page); check('7b back -> /es', s.url === '/es', JSON.stringify(s));
    await ctx.close();
}
// 8. Pokemon search: pilot Pokemon stay Spanish, others go to English
{
    const { page, ctx } = await open('/es');
    await page.type('#pokemon-search', 'pikachu'); await wait(600); await page.click('#suggestions li'); await settle(page);
    let s = await snap(page); check('8a Pikachu -> /es/pokemon/pikachu (same document)', s.url === '/es/pokemon/pikachu' && s.lang === 'es', JSON.stringify(s));
    await ctx.close();
    const o = await open('/es');
    await o.page.type('#pokemon-search', 'bulbasaur'); await wait(600); await o.page.click('#suggestions li'); await settle(o.page);
    s = await snap(o.page); check('8b Bulbasaur (not in the pilot) -> /pokemon/bulbasaur, English page', s.url === '/pokemon/bulbasaur' && s.lang === 'en', JSON.stringify(s));
    await o.ctx.close();
}
// 9. reset on a server-rendered Spanish page goes to the Spanish home
{
    const { page, ctx } = await open('/es/tipo/fuego');
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#reset-button')]);
    const s = await snap(page); check('9 reset on /es/tipo/fuego -> /es', s.url === '/es' && s.lang === 'es', JSON.stringify(s));
    await ctx.close();
}
// 10. server-rendered Spanish page hydrates in Spanish, and a type change leaves the pilot correctly
{
    const { page, ctx } = await open('/es/tipo/fuego');
    const s = await snap(page); check('10a /es/tipo/fuego: Spanish heading after hydration', /Fuego/.test(s.h1) && s.lang === 'es', JSON.stringify(s));
    await pick(page, 'type-select', 'Water'); await settle(page);
    const w = await snap(page); check('10b picking Agua there -> /tipo/water (English page)', w.url === '/tipo/water' && w.lang === 'en', JSON.stringify(w));
    await ctx.close();
}
await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
