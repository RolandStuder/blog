#!/usr/bin/env python3
"""Regenerate source/tracks/casio-dreams/notes.json from casio_dreams.mid.
Shifts each Logic track up by whole octaves onto the MT-140's 49 keys (MIDI 48-96)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__)); import midi2json as m
D = 'source/tracks/casio-dreams/'
division, tracks = m.parse(D + 'casio_dreams.mid')
notes, names, tempos = m.to_seconds(division, tracks)
order = ['Inst 23', 'Inst 1', 'Vintage Soul', 'Inst 24.4']   # index = colour in page.css
SHIFT = {'Vintage Soul': 12, 'Inst 23': 48, 'Inst 24.4': 12, 'Inst 1': 48}
LABEL = {'Inst 23': 'mid', 'Inst 1': 'arp', 'Vintage Soul': 'bass', 'Inst 24.4': 'lead'}
out = []
for n in notes:
    nm = names[n['tr']]; k = n['n'] + SHIFT[nm]; assert 48 <= k <= 96, (nm, k)
    out.append({'t': n['t'], 'd': n['d'], 'n': k, 'v': n['v'], 'i': order.index(nm)})
out.sort(key=lambda n: n['t'])
json.dump({'bpm': 152, 'instruments': [LABEL[o] for o in order], 'notes': out}, open(D + 'notes.json', 'w'), separators=(',', ':'))
for o in order:
    ks = [n for n in out if n['i'] == order.index(o)]
    print(f"{LABEL[o]:6} {len(ks):3} notes, keys {min(n['n'] for n in ks)}-{max(n['n'] for n in ks)}, until {max(n['t']+n['d'] for n in ks):.1f}s")
