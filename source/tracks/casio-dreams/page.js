// Casio Dreams – the Casiotone plays along.
// Keys light from notes.json (converted from the MIDI with tools/midi2json.py),
// synced to the audio clock so seeking and pausing just work.
(() => {
  const audio = document.getElementById('audio');
  const time = document.getElementById('time');
  const stopBtn = document.getElementById('stop');
  const keys = {};
  document.querySelectorAll('.casiotone .key').forEach(k => { keys[k.dataset.midi] = k; });
  const led = document.querySelector('#ct-led-beat');

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const offset = window.PIECE.offset || 0;   // seconds; negative makes the keys fire earlier than the sound
  const beat = 60 / window.PIECE.bpm;

  let notes = [];
  fetch(window.PIECE.notes).then(r => r.json()).then(d => { notes = d.notes; bassOnsets = notes.filter(n => n.i === 2).map(n => n.t); buildDecay(); });

  // ---- decay --------------------------------------------------------------
  // Three keys fall off while being played, at the same moments on every play.
  // Seeking backwards puts them back.
  const svg = document.querySelector('.casiotone');
  const schedule = [];           // { at, el, cls }

  function buildDecay() {
    const end = notes.reduce((m, n) => Math.max(m, n.t + n.d), 0);
    const hitsByKey = {};
    notes.forEach(n => (hitsByKey[n.n] = hitsByKey[n.n] || []).push(n.t));
    // only white keys fall – a missing black key just looks like a gap
    const played = Object.keys(hitsByKey).filter(m => keys[m] && keys[m].classList.contains('white')).sort((a, b) => a - b);
    // spread the three across the keyboard and the second half of the track
    [[0.5, 0.15], [0.68, 0.55], [0.86, 0.85]].forEach(([when, where], i) => {
      const midi = played[Math.min(played.length - 1, Math.round(where * (played.length - 1)))];
      const hits = hitsByKey[midi];
      const at = hits.reduce((best, t) => Math.abs(t - when * end) < Math.abs(best - when * end) ? t : best, hits[0]);
      keys[midi].style.setProperty('--dir', i % 2 ? -1 : 1);
      schedule.push({ at: at + 0.06, el: keys[midi], cls: 'gone' });
    });
  }

  function applyDecay(t) {
    for (const s of schedule) s.el.classList.toggle(s.cls, t >= s.at);
  }

  function press(kind, btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
  }

  svg.querySelector('#ct-btn-startstop').addEventListener('click', e => {
    press('startstop', e.currentTarget);
    if (audio.paused) audio.play(); else audio.pause();
  });
  audio.addEventListener('play', () => { document.body.classList.add('playing'); document.body.classList.remove('paused'); stopBtn.querySelector('.stop-label').textContent = 'Stop'; });
  audio.addEventListener('pause', () => { document.body.classList.remove('playing'); if (power === 'on' && !audio.ended) { document.body.classList.add('paused'); stopBtn.querySelector('.stop-label').textContent = 'Resume'; } });
  audio.addEventListener('timeupdate', () => { time.textContent = fmt(audio.currentTime); });

  // ---- power: the cable is finicky, the second try works ---------------
  let power = 'off';                         // off → failed → on
  svg.querySelector('#ct-slider-power .hit').addEventListener('click', e => { e.stopPropagation(); powerClick(); });
  // Until it is on, the whole instrument is the power switch – nobody should miss the track.
  svg.addEventListener('click', () => { if (power !== 'on') powerClick(); });
  stopBtn.addEventListener('click', () => { if (power !== 'on') return; if (audio.paused) audio.play(); else audio.pause(); });
  document.body.classList.add('off');
  // After the track has played once the instrument is dead. Every attempt fails with a remark.
  const brokenLines = ["it's broken.", "nothing.", "the cable finally gave up.", "some keys are missing anyway.", "no. it had one more in it, and that was it."];
  let brokenIdx = 0;
  const calloutRetry = document.querySelectorAll('.callout-retry');
  audio.addEventListener('ended', () => {
    power = 'dead';
    svg.classList.remove('on');
    svg.classList.add('dead', 'failed');
    document.body.classList.add('dead');
    calloutRetry.forEach(el => { el.textContent = brokenLines[0]; });
  });
  function brokenClick() {
    brokenIdx = (brokenIdx + 1) % brokenLines.length;
    calloutRetry.forEach(el => { el.textContent = brokenLines[brokenIdx]; });
    svg.classList.remove('flicker');
    document.querySelectorAll('.callout, .callout-m > *').forEach(c => { c.style.animation = 'none'; void c.getBoundingClientRect(); c.style.animation = ''; });
  }
  function powerClick() {
    if (power === 'dead') { brokenClick(); return; }
    if (power === 'on') { if (audio.paused) audio.play(); else audio.pause(); return; }
    if (power === 'off') {
      power = 'failed';
      svg.classList.add('flicker');
      setTimeout(() => { svg.classList.remove('flicker'); svg.classList.add('failed'); }, 900);
      return;
    }
    power = 'on';
    svg.classList.remove('failed');
    svg.classList.add('on');
    document.body.classList.remove('off');
    audio.play();
  }
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && power === 'on') { e.preventDefault(); if (audio.paused) audio.play(); else audio.pause(); }
  });

  // ---- comic squiggles out of the speaker on bass notes ------------------
  const squiggles = svg.querySelector('#ct-squiggles');
  const squiggleTpl = svg.querySelector('#ct-squiggle-template');
  let bassOnsets = [], lastSquiggleT = -1, bassIdx = 0;
  function squiggle() {
    const g = squiggleTpl.cloneNode(true);
    g.removeAttribute('id'); g.removeAttribute('opacity');
    g.classList.add('live');
    squiggles.appendChild(g);
    g.addEventListener('animationend', () => g.remove());
  }
  function bassFrame(t) {
    if (audio.paused) { lastSquiggleT = t; return; }
    while (bassIdx < bassOnsets.length && bassOnsets[bassIdx] <= t) { if (bassOnsets[bassIdx] > lastSquiggleT) squiggle(); bassIdx++; }
    if (t < lastSquiggleT) bassIdx = 0;   // seeked backwards
    lastSquiggleT = t;
  }

  const lit = new Set();
  let lastT = null;
  function frame() {
    const t = audio.currentTime - offset;
    // nothing moves while paused and the clock stands still
    if (audio.paused && t === lastT) { requestAnimationFrame(frame); return; }
    lastT = t;
    const now = new Set();
    for (const n of (power === 'dead' ? [] : notes)) {
      if (n.t > t) break;
      if (t < n.t + Math.max(n.d, 0.08)) {
        const k = keys[n.n];
        if (k) { now.add(k); k.dataset.inst = n.i; }
      }
    }
    for (const k of lit) if (!now.has(k)) { k.classList.remove('lit'); delete k.dataset.inst; }
    for (const k of now) if (!lit.has(k)) k.classList.add('lit');
    lit.clear(); now.forEach(k => lit.add(k));

    applyDecay(t);
    bassFrame(t);

    // tempo LED: blink on every beat while playing (erratic once it flickers)
    if (!audio.paused) {
      const phase = ((t % beat) + beat) % beat;
      const glitch = led.classList.contains('flicker') && Math.sin(t * 37) > 0.6;
      led.classList.toggle('on', phase < beat * 0.25 && !glitch);
    } else {
      led.classList.remove('on');
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
