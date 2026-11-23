import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = new URL('../scripts/ssr-snapshot.mjs', import.meta.url).pathname;
const dirs = {};

function make(name, files) {
    const dir = join(dirs.root, name);
    mkdirSync(dir);
    for (const [f, content] of Object.entries(files)) writeFileSync(join(dir, f), content);
    return dir;
}
const diff = (a, b) => spawnSync(process.execPath, [script, 'diff', a, b], { encoding: 'utf8' });

beforeAll(() => {
    dirs.root = mkdtempSync(join(tmpdir(), 'ssr-snapshot-'));
    dirs.a = make('a', { 'p1.html': 'one', 'p2.html': 'two' });
    dirs.same = make('same', { 'p1.html': 'one', 'p2.html': 'two' });
    dirs.missing = make('missing', { 'p1.html': 'one' });
    dirs.extra = make('extra', { 'p1.html': 'one', 'p2.html': 'two', 'p3.html': 'three' });
    dirs.changed = make('changed', { 'p1.html': 'one', 'p2.html': 'TWO' });
    dirs.empty = make('empty', {});
});

describe('ssr-snapshot diff', () => {
    it('passes (exit 0) when both captures are identical', () => {
        expect(diff(dirs.a, dirs.same).status).toBe(0);
    });

    it('fails when a file is missing from the second capture', () => {
        const r = diff(dirs.a, dirs.missing);
        expect(r.status).toBe(1);
        expect(r.stdout).toContain('missing in B (1)');
    });

    it('fails when the second capture has an extra file (reverse direction)', () => {
        const r = diff(dirs.a, dirs.extra);
        expect(r.status).toBe(1);
        expect(r.stdout).toContain('extra in B (1)');
    });

    it('fails when a common file differs', () => {
        const r = diff(dirs.a, dirs.changed);
        expect(r.status).toBe(1);
        expect(r.stdout).toContain('different (1)');
    });

    it('fails on an empty baseline instead of reporting a vacuous pass', () => {
        expect(diff(dirs.empty, dirs.empty).status).toBe(1);
    });
});
