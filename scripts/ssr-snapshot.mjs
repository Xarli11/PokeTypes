// Proves a refactor did not change server-rendered HTML.
//   node scripts/ssr-snapshot.mjs capture <baseUrl> <outDir>   fetch every sitemap URL (+ a few redirect/404 cases)
//   node scripts/ssr-snapshot.mjs diff <dirA> <dirB>           byte-compare two captures
// Typical use: build the old commit, serve it (see CLAUDE.md "wrangler pages dev"),
// capture; build the new commit, capture; diff. Exit code 1 if anything differs.
import fs from 'node:fs';

const [cmd, a, b] = process.argv.slice(2);

if (cmd === 'capture') {
    fs.mkdirSync(b, { recursive: true });
    const xml = await (await fetch(`${a}/sitemap.xml`)).text();
    const paths = [...xml.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(m => m[1]);
    paths.push('/tipo/flying-fire', '/tipo/fire-fire', '/tipo/Fire', '/tipo/fire-flying/', '/tipo/foo', '/pokemon/zzz');
    let next = 0;
    const worker = async () => {
        while (next < paths.length) {
            const p = paths[next++];
            const res = await fetch(a + p, { redirect: 'manual' });
            fs.writeFileSync(`${b}/${encodeURIComponent(p)}.html`, `STATUS ${res.status} ${res.headers.get('location') || ''}\n${await res.text()}`);
        }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
    console.log(`captured ${paths.length} URLs into ${b}`);
} else if (cmd === 'diff') {
    const files = fs.readdirSync(a);
    const different = files.filter(f => !fs.existsSync(`${b}/${f}`) || fs.readFileSync(`${a}/${f}`, 'utf8') !== fs.readFileSync(`${b}/${f}`, 'utf8'));
    console.log(`${files.length - different.length}/${files.length} identical`);
    if (different.length) { console.log('different:', different.slice(0, 10).map(decodeURIComponent)); process.exit(1); }
} else {
    console.error('usage: capture <baseUrl> <outDir> | diff <dirA> <dirB>');
    process.exit(2);
}
