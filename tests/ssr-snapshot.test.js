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
const diff = (a, b, ...flags) => spawnSync(process.execPath, [script, 'diff', a, b, ...flags], { encoding: 'utf8' });

beforeAll(() => {
    dirs.root = mkdtempSync(join(tmpdir(), 'ssr-snapshot-'));
    dirs.a = make('a', { 'p1.html': 'one', 'p2.html': 'two' });
    dirs.same = make('same', { 'p1.html': 'one', 'p2.html': 'two' });
    dirs.missing = make('missing', { 'p1.html': 'one' });
    dirs.extra = make('extra', { 'p1.html': 'one', 'p2.html': 'two', 'p3.html': 'three' });
    dirs.changed = make('changed', { 'p1.html': 'one', 'p2.html': 'TWO' });
    dirs.empty = make('empty', {});
    dirs.hashA = make('hashA', { 'p.html': '<link href="/_astro/index.AbCdEf12.css">\n<p>\n   Hello\n</p>' });
    dirs.nameA = make('nameA', { 'p.html': '<script src="/_astro/index.astro_x.AbCdEf12.js"></script><p>Hi</p>' });
    dirs.nameB = make('nameB', { 'p.html': '<script src="/_astro/HomePage.astro_x.ZyXwVu98.js"></script><p>Hi</p>' });
    dirs.hashB = make('hashB', { 'p.html': '<link href="/_astro/index.ZyXwVu98.css"><p> Hello </p>' });
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

    it('--ignore-asset-hashes and --collapse-whitespace only forgive what they name', () => {
        expect(diff(dirs.hashA, dirs.hashB).status).toBe(1);
        expect(diff(dirs.hashA, dirs.hashB, '--ignore-asset-hashes').status).toBe(1);
        expect(diff(dirs.hashA, dirs.hashB, '--collapse-whitespace').status).toBe(1);
        expect(diff(dirs.hashA, dirs.hashB, '--ignore-asset-hashes', '--collapse-whitespace').status).toBe(0);
        // text changes are never forgiven
        expect(diff(dirs.a, dirs.changed, '--ignore-asset-hashes', '--collapse-whitespace').status).toBe(1);
    });

    it('--ignore-asset-names forgives a renamed chunk but not other changes', () => {
        expect(diff(dirs.nameA, dirs.nameB, '--ignore-asset-hashes').status).toBe(1);
        expect(diff(dirs.nameA, dirs.nameB, '--ignore-asset-names').status).toBe(0);
        expect(diff(dirs.a, dirs.changed, '--ignore-asset-names').status).toBe(1);
    });
});
