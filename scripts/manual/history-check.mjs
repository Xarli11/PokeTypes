// Manual browser check for back/forward (issue #35). Not part of CI: needs a browser.
//   npm i --no-save puppeteer-core
//   npm run build && npx wrangler pages dev dist --port 4399 --compatibility-date=2025-01-01 --compatibility-flag=nodejs_compat
//   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/manual/history-check.mjs [http://localhost:4399]
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:4399';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const results = [];
const wait = ms => new Promise(r => setTimeout(r, ms));
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> ${detail}`}`); };

async function open(path, { delayPokeApi = 0, before } = {}) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    if (before) await page.evaluateOnNewDocument(before);
    if (delayPokeApi) {
        await page.setRequestInterception(true);
        page.on('request', req => (/pokeapi\.co|pokemonshowdown/.test(req.url()) ? setTimeout(() => req.continue(), delayPokeApi) : req.continue()));
    }
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    await wait(800);
    return { page, ctx };
}
const pick = async (page, id, value) => {
    await page.evaluate((id, value) => { const s = document.getElementById(id); s.value = value; s.dispatchEvent(new Event('change', { bubbles: true })); }, id, value);
    await wait(500);
};
const snap = page => page.evaluate(() => ({
    url: location.pathname + location.search,
    t1: document.getElementById('type-select').value,
    t2: document.getElementById('type2-select').value,
    search: document.getElementById('pokemon-search').value,
    pills: [...document.querySelectorAll('#selected-type-name .type-pill')].map(e => e.textContent.trim()).join('+'),
    hero: !document.getElementById('pokemon-hero').classList.contains('hidden'),
    stats: !document.getElementById('pokemon-stats').classList.contains('hidden'),
    empty: !!document.getElementById('empty-state') && !document.getElementById('empty-state').classList.contains('hidden'),
    pro: document.getElementById('view-pro')?.classList.contains('hidden') === false, // /tipo/* and /pokemon/* pages have no Team Builder
    mode: localStorage.getItem('poketypes_mode')
}));
// back/forward may be a pushState step or a full document load (another page): wait for both.
const settle = async page => { await page.waitForNetworkIdle({ idleTime: 600, timeout: 10000 }).catch(() => {}); await wait(500); };
const back = async page => { await page.goBack(); await settle(page); };
const forward = async page => { await page.goForward(); await settle(page); };
const reload = async page => { await page.reload({ waitUntil: 'networkidle0' }); await wait(800); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. types: Fire -> Fire+Flying, back, forward
{
    const { page, ctx } = await open('/');
    await pick(page, 'type-select', 'Fire'); await pick(page, 'type2-select', 'Flying');
    let s = await snap(page); check('1a /tipo/fire-flying shown', s.url === '/tipo/fire-flying' && s.pills.includes('Flying'), JSON.stringify(s));
    await back(page); s = await snap(page);
    check('1b back -> /tipo/fire, only Fire selected and analysed', s.url === '/tipo/fire' && s.t1 === 'Fire' && s.t2 === '' && s.pills === 'Fire', JSON.stringify(s));
    await back(page); s = await snap(page);
    check('1c back -> home: empty state, nothing selected', s.url === '/' && s.t1 === '' && s.empty, JSON.stringify(s));
    await forward(page); await forward(page); s = await snap(page);
    check('1d forward x2 -> /tipo/fire-flying again', s.url === '/tipo/fire-flying' && s.t1 === 'Fire' && s.t2 === 'Flying' && s.pills.includes('Flying'), JSON.stringify(s));
    await ctx.close();
}
// 2. Pokemon: search Charizard, back, forward (slow PokeAPI to expose races)
{
    const { page, ctx } = await open('/', { delayPokeApi: 1500 });
    await page.type('#pokemon-search', 'charizard'); await wait(600);
    await page.click('#suggestions li'); await wait(300);
    let s = await snap(page); check('2a /pokemon/charizard, hero visible', /^\/pokemon\/charizard/.test(s.url) && s.hero, JSON.stringify(s));
    await back(page); await wait(2500); s = await snap(page);
    check('2b back (while details were loading) -> home, hero+stats hidden, search empty', s.url === '/' && !s.hero && !s.stats && s.search === '' && s.empty, JSON.stringify(s));
    await forward(page); await wait(2500); s = await snap(page);
    check('2c forward -> Charizard hero, types Fire/Flying, search field filled', s.hero && s.t1 === 'Fire' && s.t2 === 'Flying' && /charizard/i.test(s.search), JSON.stringify(s));
    await ctx.close();
}
// 3. Pokemon -> types-only: the Pokemon must not linger
{
    const { page, ctx } = await open('/');
    await page.type('#pokemon-search', 'charizard'); await wait(600); await page.click('#suggestions li'); await wait(1500);
    await pick(page, 'type-select', 'Water'); // changing a type leaves the Pokemon
    let s = await snap(page); check('3a types change drops the Pokemon', s.url.startsWith('/tipo/') && !s.hero, JSON.stringify(s));
    await back(page); await wait(1500); s = await snap(page);
    check('3b back -> Charizard again (URL, hero, types)', /^\/pokemon\/charizard/.test(s.url) && s.hero && s.t1 === 'Fire', JSON.stringify(s));
    await forward(page); await wait(800); s = await snap(page);
    check('3c forward -> types only, no hero, no stats', s.url.startsWith('/tipo/') && !s.hero && !s.stats && s.search === '', JSON.stringify(s));
    await ctx.close();
}
// 4. mode switch is a history entry; back/forward/reload agree
{
    const { page, ctx } = await open('/');
    await pick(page, 'type-select', 'Fire');
    await page.click('#toggle-pro'); await wait(600);
    let s = await snap(page); check('4a Team Builder: URL is /?mode=pro', s.url === '/?mode=pro' && s.pro, JSON.stringify(s));
    await back(page); s = await snap(page); check('4b back -> Calculator, URL without mode', s.url === '/tipo/fire' && !s.pro && s.pills === 'Fire', JSON.stringify(s));
    await reload(page); s = await snap(page); check('4c reload after back shows the same (Calculator, Fire; server-rendered /tipo/fire)', !s.pro && s.t1 === 'Fire' && s.url === '/tipo/fire', JSON.stringify(s));
    await forward(page); s = await snap(page); // after the reload above this document is the server-rendered /tipo/fire page: it must hand over to the home page
    check('4d forward -> Team Builder (server sends the home page)', s.pro && s.url === '/?mode=pro', JSON.stringify(s));
    await reload(page); s = await snap(page); check('4e reload shows Team Builder', s.pro && s.url === '/?mode=pro', JSON.stringify(s));
    await ctx.close();
}
// 5. loading ?mode=pro (shared link) does not add an entry; saved mode is reflected in the URL
{
    const { page, ctx } = await open('/?mode=pro');
    const len = await page.evaluate(() => history.length);
    let s = await snap(page); check('5a /?mode=pro opens Team Builder', s.pro && s.url === '/?mode=pro', JSON.stringify(s));
    const ctx2 = await browser.createBrowserContext(); const p2 = await ctx2.newPage();
    await p2.evaluateOnNewDocument(() => localStorage.setItem('poketypes_mode', 'pro'));
    await p2.goto(BASE + '/', { waitUntil: 'networkidle0' }); await wait(800);
    const s2 = await snap(p2); const len2 = await p2.evaluate(() => history.length);
    check('5b saved mode=pro: URL normalised with replaceState (no extra entry)', s2.pro && s2.url === '/?mode=pro' && len2 === 2, JSON.stringify({ s2, len2 }));
    check('5c loading ?mode=pro adds no history entry', len === 2, String(len));
    await ctx.close(); await ctx2.close();
}
// 6. SSR page: back to the server-rendered entry restores its analysis
{
    const { page, ctx } = await open('/tipo/fire');
    await pick(page, 'type2-select', 'Flying');
    let s = await snap(page); check('6a /tipo/fire -> fire-flying', s.url === '/tipo/fire-flying', JSON.stringify(s));
    await back(page); s = await snap(page);
    check('6b back -> /tipo/fire entry: Fire only', s.url === '/tipo/fire' && s.t2 === '' && s.pills === 'Fire', JSON.stringify(s));
    await ctx.close();
}
// 7. selecting the same thing twice does not stack identical entries
{
    const { page, ctx } = await open('/');
    await pick(page, 'type-select', 'Fire'); const n1 = await page.evaluate(() => history.length);
    await pick(page, 'type-select', 'Fire'); const n2 = await page.evaluate(() => history.length);
    check('7 re-selecting the same state adds no entry', n1 === n2, `${n1} vs ${n2}`);
    await ctx.close();
}
// 8. reload on a pushState entry, then back to the home entry: the server-rendered page hands over to the home page
{
    const { page, ctx } = await open('/');
    await pick(page, 'type-select', 'Fire');
    await reload(page);
    await back(page);
    const s = await snap(page);
    check('8 reload on /tipo/fire then back -> home with empty state', s.url === '/' && s.empty && s.t1 === '', JSON.stringify(s));
    await ctx.close();
}
await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
