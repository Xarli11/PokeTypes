// Lists the legal fields still pending (names only, never values). Reads the same
// POKETYPES_LEGAL JSON variable the build uses. Exit code 1 while anything is pending.
//   POKETYPES_LEGAL='{"controller":{...}}' npm run check:legal
// With --live <origin> it also checks the deployed URLs the CMP will point to (run it
// before publishing the message): every legal URL must answer 200 and be indexable.
//   npm run check:legal -- --live https://poketypes.app
import { buildLegal, legalStatus } from '../src/lib/legal.js';

let overrides = {};
try {
    overrides = JSON.parse(process.env.POKETYPES_LEGAL ?? '{}');
} catch {
    console.error('POKETYPES_LEGAL is not valid JSON.');
    process.exit(1);
}
const status = legalStatus(buildLegal(overrides));
console.log('Privacy policy (/privacy) missing:', status.privacyMissing.join(', ') || 'nothing');
console.log('LSSI decision (lssi.applies):', status.decisionMissing ? 'undecided' : status.noticeEnabled ? 'applies' : 'does not apply');
if (status.noticeEnabled) console.log('Legal notice (/legal) missing:', status.noticeMissing.join(', ') || 'nothing');
console.log(status.allReady ? 'READY to publish' : 'NOT ready: production keeps the legal pages hidden');

let liveOk = true;
const liveAt = process.argv.indexOf('--live');
if (liveAt > 0) {
    const origin = process.argv[liveAt + 1].replace(/\/$/, '');
    const urls = ['/privacy', ...(status.noticeEnabled ? ['/legal'] : []), '/ads.txt', '/icon-512.png'];
    for (const path of urls) {
        const res = await fetch(origin + path, { redirect: 'manual' });
        const body = path === '/privacy' || path === '/legal' ? await res.text() : '';
        const noindex = /<meta name="robots" content="[^"]*noindex/.test(body);
        const ok = res.status === 200 && !noindex;
        liveOk &&= ok;
        console.log(`${ok ? 'OK  ' : 'FAIL'} ${origin}${path} -> ${res.status}${noindex ? ' (noindex)' : ''}`);
    }
}
process.exit(status.allReady && liveOk ? 0 : 1);
