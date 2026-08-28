import { describe, it, expect } from 'vitest';
import { encodeTeamPayload, decodeTeamPayload, SHARE_PAYLOAD_VERSION } from '../src/lib/share-team.js';

function emptyTeam() {
    return new Array(6).fill(null);
}

function sampleSlot(overrides = {}) {
    return {
        id: 6,
        apiName: 'charizard',
        name: 'charizard',
        types: ['Fire', 'Flying'],
        ability: 'blaze',
        nature: 'timid',
        item: 'heavy-duty-boots',
        ...overrides
    };
}

describe('encodeTeamPayload / decodeTeamPayload — round trip', () => {
    it('round-trips a populated team slot', () => {
        const team = emptyTeam();
        team[0] = sampleSlot();

        const decoded = decodeTeamPayload(encodeTeamPayload(team));

        expect(decoded).not.toBeNull();
        expect(decoded[0]).toEqual({
            id: 6,
            n: 'charizard',
            t: ['Fire', 'Flying'],
            a: 'blaze',
            nat: 'timid',
            i: 'heavy-duty-boots'
        });
        expect(decoded[1]).toBeNull();
    });

    it('always encodes the current payload version', () => {
        const encoded = encodeTeamPayload(emptyTeam());
        const raw = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        expect(raw.v).toBe(SHARE_PAYLOAD_VERSION);
    });

    it('never includes a teraType field (Sprint 1 Tera policy: not shareable yet)', () => {
        const team = emptyTeam();
        team[0] = sampleSlot();
        const encoded = encodeTeamPayload(team);
        const raw = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        expect(raw.team[0]).not.toHaveProperty('tera');
    });
});

describe('decodeTeamPayload — backward compatibility with pre-versioning links', () => {
    it('accepts a bare 6-element array (the old, unversioned wire format)', () => {
        const bareArray = [{ id: 1, n: 'bulbasaur', t: ['Grass', 'Poison'], a: null, nat: null, i: null }, null, null, null, null, null];
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(bareArray))));

        const decoded = decodeTeamPayload(encoded);
        expect(decoded).toEqual(bareArray);
    });
});

describe('decodeTeamPayload — safety against malformed/tampered links', () => {
    it('returns null for garbage base64/JSON instead of throwing', () => {
        expect(decodeTeamPayload('not-valid-base64-or-json!!!')).toBeNull();
    });

    it('returns null when the decoded array is not exactly length 6', () => {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, team: [null, null] }))));
        expect(decodeTeamPayload(encoded)).toBeNull();
    });

    it('returns null for a payload claiming a newer, unsupported version', () => {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ v: SHARE_PAYLOAD_VERSION + 1, team: emptyTeam() }))));
        expect(decodeTeamPayload(encoded)).toBeNull();
    });

    it('returns null when a slot entry is not an object or null', () => {
        const badTeam = ['not-an-object', null, null, null, null, null];
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, team: badTeam }))));
        expect(decodeTeamPayload(encoded)).toBeNull();
    });
});
