// src/js/modules/typeSelection.js
//
// Pure normalization of a raw (t1, t2, t3) type selection into what
// displayAnalysis() actually analyzes and renders. Extracted verbatim from
// main.js (no behavior change) so it's importable in tests without a DOM —
// main.js itself does module-level document/navigator access that would
// break a direct import in Vitest's default (non-jsdom) environment.
//
// Analytics correctness depends on this running BEFORE anything reports
// what was calculated: a raw selection like Fire+Fire, or Fire+Water+Fire,
// must be described as the monotype/dual-type it's actually treated as, not
// as the pre-normalization selection.
export function normalizeTypeSelection(t1, t2, t3) {
    // Treat same type selection as monotype
    if (t1 === t2) t2 = '';
    if (t1 === t3) t3 = '';
    if (t2 === t3) t3 = '';

    // If only t2 (or only t3) is selected but no t1
    if (!t1 && t2) { t1 = t2; t2 = ''; }
    if (!t1 && !t2 && t3) { t1 = t3; t3 = ''; }
    if (!t2 && t3) { t2 = t3; t3 = ''; }

    return { t1, t2, t3 };
}
