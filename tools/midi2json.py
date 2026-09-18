#!/usr/bin/env python3
"""Convert a Standard MIDI File into compact JSON note events (seconds).
Usage: midi2json.py in.mid out.json   (or omit out.json for a summary)"""
import sys, json, struct
from collections import defaultdict

def read_vlq(b, i):
    v = 0
    while True:
        c = b[i]; i += 1
        v = (v << 7) | (c & 0x7f)
        if not c & 0x80: return v, i

def parse(path):
    b = open(path, 'rb').read()
    assert b[:4] == b'MThd'
    fmt, ntracks, division = struct.unpack('>HHH', b[8:14])
    assert not division & 0x8000, 'SMPTE timing not supported'
    i = 14
    tracks = []
    for _ in range(ntracks):
        assert b[i:i+4] == b'MTrk'
        ln = struct.unpack('>I', b[i+4:i+8])[0]; i += 8
        data = b[i:i+ln]; i += ln
        j = 0; t = 0; status = 0; evs = []
        while j < len(data):
            d, j = read_vlq(data, j); t += d
            c = data[j]
            if c == 0xFF:
                typ = data[j+1]; ln2, j = read_vlq(data, j+2)
                payload = data[j:j+ln2]; j += ln2
                if typ == 0x51: evs.append((t, 'tempo', struct.unpack('>I', b'\0' + payload)[0]))
                elif typ == 0x03: evs.append((t, 'name', payload.decode('latin1')))
            elif c in (0xF0, 0xF7):
                ln2, j = read_vlq(data, j+1); j += ln2
            else:
                if c & 0x80: status = c; j += 1
                hi = status & 0xF0; ch = status & 0x0F
                if hi in (0xC0, 0xD0): d1 = data[j]; j += 1
                else: d1, d2 = data[j], data[j+1]; j += 2
                if hi == 0x90 and d2 > 0: evs.append((t, 'on', ch, d1, d2))
                elif hi == 0x80 or (hi == 0x90 and d2 == 0): evs.append((t, 'off', ch, d1))
        tracks.append(evs)
    return division, tracks

def to_seconds(division, tracks):
    tempos = sorted([(e[0], e[2]) for tr in tracks for e in tr if e[1] == 'tempo']) or [(0, 500000)]
    if tempos[0][0] != 0: tempos.insert(0, (0, 500000))
    def sec(tick):
        s = 0.0; last_t, us = tempos[0]
        for tt, u in tempos[1:]:
            if tt >= tick: break
            s += (tt - last_t) * us / 1e6 / division; last_t, us = tt, u
        return s + (tick - last_t) * us / 1e6 / division
    notes = []
    for ti, tr in enumerate(tracks):
        name = next((e[2] for e in tr if e[1] == 'name'), f'track{ti}')
        open_ = {}
        for e in tr:
            if e[1] == 'on':
                open_.setdefault((e[2], e[3]), []).append((e[0], e[4]))
            elif e[1] == 'off' and open_.get((e[2], e[3])):
                st, vel = open_[(e[2], e[3])].pop(0)
                notes.append({'t': round(sec(st), 4), 'd': round(sec(e[0]) - sec(st), 4), 'n': e[3], 'v': vel, 'c': e[2], 'tr': ti})
    notes.sort(key=lambda n: n['t'])
    names = {ti: next((e[2] for e in tr if e[1] == 'name'), f'track{ti}') for ti, tr in enumerate(tracks)}
    return notes, names, tempos

if __name__ == '__main__':
    division, tracks = parse(sys.argv[1])
    notes, names, tempos = to_seconds(division, tracks)
    if len(sys.argv) > 2:
        json.dump({'tracks': names, 'notes': notes}, open(sys.argv[2], 'w'), separators=(',', ':'))
    print(f'division={division} tempos={[(t, round(60e6/u,2)) for t,u in tempos]}')
    for ti, nm in names.items():
        ns = [n for n in notes if n['tr'] == ti]
        if ns:
            chans = sorted({n['c'] for n in ns}); lo = min(n['n'] for n in ns); hi = max(n['n'] for n in ns)
            print(f'track {ti} "{nm}": {len(ns)} notes, ch {chans}, range {lo}-{hi}, {ns[0]["t"]:.2f}s .. {max(n["t"]+n["d"] for n in ns):.2f}s')
