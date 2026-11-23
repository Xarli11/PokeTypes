// Proves a refactor did not change server-rendered HTML.
//   node scripts/ssr-snapshot.mjs capture <baseUrl> <outDir>   fetch every sitemap URL (+ a few redirect/404 cases)
//   node scripts/ssr-snapshot.mjs diff <dirA> <dirB>           compare file sets (both directions) and bytes of common files
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
    // Compare the file SETS in both directions, then the contents of the common files.
    const listA = new Set(fs.readdirSync(a));
    const listB = new Set(fs.readdirSync(b));
    const missing = [...listA].filter(f => !listB.has(f));   // captured before, absent after
    const extra = [...listB].filter(f => !listA.has(f));     // absent before, captured after
    const changed = [...listA].filter(f => listB.has(f) && fs.readFileSync(`${a}/${f}`, 'utf8') !== fs.readFileSync(`${b}/${f}`, 'utf8'));
    const show = list => list.slice(0, 10).map(decodeURIComponent);
    console.log(`${listA.size - missing.length - changed.length}/${listA.size} identical (A: ${listA.size} files, B: ${listB.size} files)`);
    if (missing.length) console.log(`missing in B (${missing.length}):`, show(missing));
    if (extra.length) console.log(`extra in B (${extra.length}):`, show(extra));
    if (changed.length) console.log(`different (${changed.length}):`, show(changed));
    if (missing.length || extra.length || changed.length || listA.size === 0) process.exit(1);
} else {
    console.error('usage: capture <baseUrl> <outDir> | diff <dirA> <dirB>');
    process.exit(2);
}
