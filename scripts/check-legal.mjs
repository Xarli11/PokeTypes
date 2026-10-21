// Lists the legal fields still pending (names only, never values). Reads the same
// POKETYPES_LEGAL JSON variable the build uses. Exit code 1 while anything is pending.
//   POKETYPES_LEGAL='{"controller":{...}}' npm run check:legal
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
process.exit(status.allReady ? 0 : 1);
