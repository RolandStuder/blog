# tools

Helper scripts for the full-page track experiences in `source/tracks/<slug>/`.
They run with plain Python 3, no packages needed.

## midi2json.py – generic MIDI → JSON

Parses a Standard MIDI File (format 0/1, tick timing, tempo map respected)
and turns it into note events in **seconds**.

```
python3 tools/midi2json.py in.mid            # summary per track: notes, channel, range, time span
python3 tools/midi2json.py in.mid out.json   # also write JSON
```

Output shape:

```json
{ "tracks": { "1": "Inst 1", "2": "Bass" },
  "notes":  [ { "t": 0.01, "d": 0.18, "n": 60, "v": 100, "c": 0, "tr": 1 }, ... ] }
```

`t` start, `d` duration (seconds), `n` MIDI note, `v` velocity, `c` channel, `tr` track index.
Notes are sorted by start time.

Tips for the export from Logic Pro: convert loops/aliases to regions first
(Edit → Convert → Loops to Regions) or the looped bars come out as empty
tracks. Joining regions per track gives one track per instrument instead of
one track per region.

## casio_dreams_notes.py – per-track mapping example

Regenerates `source/tracks/casio-dreams/notes.json` from `casio_dreams.mid`.
It shows the pattern for a new track:

1. run `midi2json.py` on the file to see track names and note ranges;
2. decide an octave shift per track so notes land on the drawn keys
   (the MT-140 SVG has 49 keys, MIDI 48–96, each `rect.key` carries `data-midi`);
3. give each track an index — that index becomes `data-inst` on lit keys and
   maps to a colour in `page.css`;
4. write the compact JSON `{ bpm, instruments: [...], notes: [{t, d, n, v, i}] }`.

`page.js` fetches that JSON and, on every animation frame, adds `.lit` to the
keys whose note is sounding at `audio.currentTime - offset` (`offset` comes
from the track's front matter, in seconds). Seeking and pausing need no extra
handling because everything keys off the audio clock.

To reuse for another track: copy `casio_dreams_notes.py`, change the paths,
track names, shifts and labels.
