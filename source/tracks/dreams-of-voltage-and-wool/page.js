// "Dreams of Voltage and Wool" — a rain-soaked neon city and an electric sheep, driven by the audio spectrum.
(function () {
  var canvas = document.getElementById('scene'), g = canvas.getContext('2d');
  var audio = document.getElementById('audio'), startBtn = document.getElementById('start');
  var timeEl = document.getElementById('time');
  var root = document.documentElement.style;
  var W, H, dpr = Math.min(devicePixelRatio, 2);
  var ctx, analyser, freq = new Uint8Array(256), wave = new Uint8Array(1024);
  var bass = 0, mid = 0, high = 0, kick = 0, lastBass = 0, t = 0;
  var rain = [], buildings = [], signs = [], wool = [], bolts = [];
  var fmt = function (s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン電気羊夢雨光';

  function resize() {
    W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
    build();
  }

  function build() {
    buildings = []; signs = []; rain = []; wool = [];
    // two layers of skyline
    [0.55, 1].forEach(function (depth, layer) {
      var x = 0;
      while (x < W) {
        var w = rnd(40, 140) * dpr, h = rnd(0.15, 0.55) * H * depth;
        var b = { x: x, w: w, h: h, layer: layer, windows: [] };
        for (var wy = H - h + 10 * dpr; wy < H - 10 * dpr; wy += 14 * dpr)
          for (var wx = x + 6 * dpr; wx < x + w - 8 * dpr; wx += 12 * dpr)
            if (Math.random() < 0.35) b.windows.push({ x: wx, y: wy, on: Math.random() < 0.6, hue: Math.random() < 0.7 ? 45 : 190, bin: Math.floor(Math.random() * 120) });
        buildings.push(b);
        if (layer === 1 && Math.random() < 0.35) {
          var len = 3 + Math.floor(Math.random() * 4), txt = '';
          for (var k = 0; k < len; k++) txt += KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
          signs.push({ x: x + w / 2, y: H - h + rnd(30, 120) * dpr, txt: txt, vertical: Math.random() < 0.5, hue: [330, 190, 50, 280][Math.floor(Math.random() * 4)], size: rnd(14, 28) * dpr, phase: Math.random() * 10, bin: Math.floor(rnd(20, 100)) });
        }
        x += w + rnd(2, 12) * dpr;
      }
    });
    for (var i = 0; i < 500; i++) rain.push(newDrop(true));
    // the electric sheep: wool particles on a body ellipse + head
    for (var j = 0; j < 420; j++) {
      var a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.5);
      wool.push({ a: a, r: r, jitter: Math.random() * 10, size: rnd(6, 16), part: j < 340 ? 'body' : 'head' });
    }
  }
  function newDrop(any) { return { x: Math.random() * W, y: any ? Math.random() * H : -20 * dpr, len: rnd(10, 30) * dpr, v: rnd(8, 18) * dpr }; }

  function setupAudio() {
    if (analyser) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    var src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.82;
    src.connect(analyser); analyser.connect(ctx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount); wave = new Uint8Array(analyser.fftSize);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: PIECE.title, artist: 'Roland Studer', album: 'Music' });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
    }
  }
  function band(a, b) { var s = 0; for (var i = a; i < b; i++) s += freq[i]; return s / (b - a) / 255; }

  function analyse() {
    if (!analyser || audio.paused) { bass *= 0.95; mid *= 0.95; high *= 0.95; kick *= 0.9; return; }
    analyser.getByteFrequencyData(freq); analyser.getByteTimeDomainData(wave);
    var b = band(2, 14), m = band(14, 100), h = band(100, 400);
    bass += (b - bass) * 0.4; mid += (m - mid) * 0.3; high += (h - high) * 0.3;
    if (b - lastBass > 0.1 && b > 0.5) { kick = 1; if (Math.random() < 0.6) bolt(); }
    lastBass = b; kick *= 0.88;
    root.setProperty('--bass', bass.toFixed(3)); root.setProperty('--mid', mid.toFixed(3));
    root.setProperty('--high', high.toFixed(3)); root.setProperty('--kick', kick.toFixed(3));
  }

  var progress = 0, shownProgress = 0, volume = 1, toast = '', toastT = 0;
  function sheepPos() {
    shownProgress += (progress - shownProgress) * 0.08;
    return { x: W * 0.12 + shownProgress * W * 0.76, y: H * 0.58 + Math.sin(t * 0.0011) * H * 0.04 - bass * 40 * dpr };
  }
  function say(msg) { toast = msg; toastT = 90; }

  function bolt() {
    var s = sheepPos(), pts = [], x = s.x + rnd(-60, 60) * dpr, y = 0;
    while (y < s.y - 60 * dpr) { pts.push([x, y]); x += rnd(-40, 40) * dpr; y += rnd(20, 60) * dpr; }
    pts.push([s.x, s.y - 50 * dpr]);
    bolts.push({ pts: pts, life: 1 });
  }

  function draw() {
    requestAnimationFrame(draw);
    t += 16; analyse();

    // sky
    var sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, 'hsl(' + (250 + high * 60) + ',60%,' + (3 + bass * 6) + '%)');
    sky.addColorStop(0.7, 'hsl(' + (320 + mid * 30) + ',70%,' + (8 + bass * 14) + '%)');
    sky.addColorStop(1, '#1a0520');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);

    // spectrum as a city-glow horizon behind the buildings
    if (analyser) {
      var n = 90, bw = W / n;
      for (var i = 0; i < n; i++) {
        var v = freq[Math.floor(Math.pow(i / n, 1.5) * 300)] / 255, hgt = v * v * H * 0.6;
        g.fillStyle = 'hsla(' + (300 + i * 1.2) + ',100%,55%,' + (0.08 + v * 0.25) + ')';
        g.fillRect(i * bw, H - hgt, bw, hgt);
      }
    }

    // buildings, back layer first; the city wakes up behind the sheep as the piece progresses
    var headX = W * 0.12 + shownProgress * W * 0.76;
    buildings.forEach(function (b) {
      var awake = b.x < headX ? 1 : 0.35;
      var dark = b.layer ? '#07030c' : '#120a1a';
      g.fillStyle = dark; g.fillRect(b.x, H - b.h, b.w, b.h);
      b.windows.forEach(function (w) {
        var flick = freq[w.bin] / 255;
        if (Math.random() < 0.002) w.on = !w.on;
        if (!w.on) return;
        g.fillStyle = 'hsla(' + w.hue + ',100%,' + (50 + flick * 40) + '%,' + (b.layer ? 0.9 : 0.45) * awake + ')';
        g.fillRect(w.x, w.y, 5 * dpr, 7 * dpr);
      });
    });

    // neon signs
    g.textAlign = 'center'; g.textBaseline = 'middle';
    signs.forEach(function (s) {
      var e = freq[s.bin] / 255, flick = Math.sin(t * 0.02 + s.phase) > 0.95 ? 0.2 : 1;
      if (s.x > headX) flick *= 0.25;
      g.font = 'bold ' + s.size + 'px "Noto Sans JP", sans-serif';
      g.shadowBlur = (10 + e * 40) * dpr; g.shadowColor = 'hsl(' + s.hue + ',100%,60%)';
      g.fillStyle = 'hsla(' + s.hue + ',100%,' + (70 + e * 30) + '%,' + flick + ')';
      if (s.vertical) s.txt.split('').forEach(function (c, k) { g.fillText(c, s.x, s.y + k * s.size * 1.1); });
      else g.fillText(s.txt, s.x, s.y);
    });
    g.shadowBlur = 0;

    // lightning bolts
    bolts = bolts.filter(function (b) { return b.life > 0; });
    bolts.forEach(function (b) {
      g.strokeStyle = 'rgba(190,240,255,' + b.life + ')'; g.lineWidth = (1 + b.life * 3) * dpr;
      g.shadowBlur = 30 * dpr; g.shadowColor = '#7df';
      g.beginPath(); b.pts.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke();
      b.life -= 0.06;
    });
    g.shadowBlur = 0;

    // the electric sheep
    var s = sheepPos(), scale = (1 + bass * 0.35) * dpr * Math.min(W / dpr / 900, 1.4);
    g.save(); g.translate(s.x, s.y);
    // legs: thin neon lines
    g.strokeStyle = 'hsla(190,100%,70%,0.9)'; g.lineWidth = 3 * dpr; g.shadowBlur = 15 * dpr; g.shadowColor = '#19f0ff';
    [-70, -30, 30, 70].forEach(function (lx) {
      var sway = Math.sin(t * (audio.paused ? 0.002 : 0.008) + lx) * 10 * (0.5 + mid);
      g.beginPath(); g.moveTo(lx * scale, 40 * scale); g.lineTo((lx + sway) * scale, 110 * scale); g.stroke();
    });
    // wool particles
    wool.forEach(function (p) {
      var jit = high * 14 * Math.sin(t * 0.01 + p.jitter);
      var cx = 0, cy = 0, rx = 130, ry = 80;
      if (p.part === 'head') { cx = 150; cy = -20; rx = 42; ry = 38; }
      var x = (cx + Math.cos(p.a) * rx * p.r + jit) * scale, y = (cy + Math.sin(p.a) * ry * p.r + jit) * scale;
      var hue = p.part === 'head' ? 200 : 300 + p.r * 40 + high * 60;
      g.fillStyle = 'hsla(' + hue + ',100%,' + (70 + bass * 25) + '%,' + (0.25 + (1 - p.r) * 0.5) + ')';
      g.beginPath(); g.arc(x, y, p.size * scale * (0.8 + mid * 0.6), 0, 7); g.fill();
    });
    // eye: glows red on kicks
    g.fillStyle = 'hsl(' + (kick > 0.3 ? 0 : 190) + ',100%,' + (60 + kick * 40) + '%)';
    g.shadowBlur = (10 + kick * 40) * dpr; g.shadowColor = kick > 0.3 ? '#f33' : '#19f0ff';
    g.beginPath(); g.arc(165 * scale, -28 * scale, 6 * scale, 0, 7); g.fill();
    // circuit veins
    g.strokeStyle = 'hsla(190,100%,80%,' + (0.2 + mid * 0.6) + ')'; g.lineWidth = 1.5 * dpr; g.shadowBlur = 8 * dpr;
    g.beginPath();
    for (var v = 0; v < 6; v++) { var a = v * 1.05 + t * 0.0003; g.moveTo(0, 0); g.lineTo(Math.cos(a) * 60 * scale, Math.sin(a) * 40 * scale); g.lineTo(Math.cos(a + 0.3) * 120 * scale, Math.sin(a + 0.3) * 70 * scale); }
    g.stroke(); g.shadowBlur = 0;
    g.restore();

    // oscilloscope reflected in the wet street
    if (analyser) {
      g.beginPath(); g.strokeStyle = 'rgba(255,45,149,' + (0.3 + bass * 0.6) + ')'; g.lineWidth = 2 * dpr;
      g.shadowBlur = 20 * dpr; g.shadowColor = '#ff2d95';
      for (var w = 0; w < wave.length; w += 4) {
        var x = w / wave.length * W, y = H * 0.93 + (wave[w] - 128) / 128 * H * 0.05;
        w ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke(); g.shadowBlur = 0;
    }

    // rain, more and faster with the highs
    var active = Math.floor(120 + high * 380 + (audio.paused ? 60 : 0));
    g.strokeStyle = 'rgba(170,220,255,0.35)'; g.lineWidth = 1 * dpr;
    g.beginPath();
    for (var r = 0; r < active; r++) {
      var d = rain[r]; d.y += d.v * (1 + high * 2); d.x -= d.v * 0.15;
      if (d.y > H) rain[r] = newDrop(false);
      g.moveTo(d.x, d.y); g.lineTo(d.x - d.len * 0.15, d.y - d.len);
    }
    g.stroke();

    if (toastT > 0) {
      toastT--; g.font = 'bold ' + 14 * dpr + 'px Orbitron, sans-serif'; g.textAlign = 'center';
      g.fillStyle = 'rgba(25,240,255,' + Math.min(1, toastT / 30) + ')'; g.shadowBlur = 20 * dpr; g.shadowColor = '#19f0ff';
      g.fillText(toast, W / 2, H * 0.5); g.shadowBlur = 0;
    }
    // wet-street reflection: blurred copy of the bottom of the frame
    g.save(); g.globalAlpha = 0.25 + bass * 0.2; g.translate(0, H * 1.96); g.scale(1, -1);
    g.drawImage(canvas, 0, H * 0.55, W, H * 0.45, 0, H * 0.96 - H * 0.45 * 0.3, W, H * 0.45 * 0.3);
    g.restore();
  }

  function start() {
    setupAudio(); if (ctx.state === 'suspended') ctx.resume();
    audio.play();
  }
  startBtn.addEventListener('click', start);
  var down = null, dragging = false;
  document.body.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a, button, .hud')) return;
    down = e.clientX; dragging = false;
  });
  document.body.addEventListener('pointermove', function (e) {
    if (down === null) return;
    if (!dragging && Math.abs(e.clientX - down) > 8) dragging = true;
    if (dragging && audio.duration) {
      var p = Math.min(1, Math.max(0, (e.clientX / innerWidth - 0.12) / 0.76));
      audio.currentTime = p * audio.duration; progress = p; say(fmt(audio.currentTime));
    }
  });
  document.body.addEventListener('pointerup', function (e) {
    if (down === null) return;
    var wasDrag = dragging; down = null; dragging = false;
    if (wasDrag) return;
    if (e.target.closest('a, button, .hud')) return;
    if (!analyser) return start();
    audio.paused ? audio.play() : audio.pause();
  });
  document.body.addEventListener('wheel', function (e) {
    e.preventDefault();
    volume = Math.min(1, Math.max(0, volume - Math.sign(e.deltaY) * 0.05));
    audio.volume = volume; say('VOL ' + Math.round(volume * 100));
  }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (e.key === ' ') { e.preventDefault(); if (!analyser) return start(); audio.paused ? audio.play() : audio.pause(); }
    if (e.key === 'ArrowRight') { audio.currentTime += 5; say('+5s'); }
    if (e.key === 'ArrowLeft') { audio.currentTime -= 5; say('-5s'); }
    if (e.key === 'ArrowUp') { volume = Math.min(1, volume + 0.1); audio.volume = volume; say('VOL ' + Math.round(volume * 100)); }
    if (e.key === 'ArrowDown') { volume = Math.max(0, volume - 0.1); audio.volume = volume; say('VOL ' + Math.round(volume * 100)); }
  });
  audio.addEventListener('play', function () { document.body.classList.add('playing'); });
  audio.addEventListener('pause', function () { document.body.classList.remove('playing'); });
  audio.addEventListener('ended', function () { say('THE END · CLICK TO PLAY AGAIN'); });
  audio.addEventListener('timeupdate', function () {
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
    if (audio.duration) progress = audio.currentTime / audio.duration;
  });
  window.addEventListener('resize', resize);
  resize(); draw();
})();
