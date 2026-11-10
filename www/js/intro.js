'use strict';
/* ═══════════ Vidéo d’introduction de la V2 : motion design en 3D + musique (environ 14 secondes) ═══════════ */
const Intro = (() => {
  const DUR = 14.2;
  let running = false, raf = 0, actx = null, onEnd = null, t0 = 0, closeTimer = 0;

  /* ——— Musique de la vidéo (synthétisée en direct, 128 BPM) ——— */
  function music(vol) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC || vol <= 0) return null;
    const ac = new AC(), out = ac.createGain(), comp = ac.createDynamicsCompressor();
    out.gain.value = .9 * vol; out.connect(comp); comp.connect(ac.destination);
    const verb = ac.createConvolver(), len = ac.sampleRate * 2.4, ib = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ib.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = ib; const wet = ac.createGain(); wet.gain.value = .35; verb.connect(wet); wet.connect(out);
    const nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const T = ac.currentTime + .08, hz = m => 440 * Math.pow(2, (m - 69) / 12), B = 60 / 128;
    const tone = (f, t, dur, o = {}) => {
      const os = ac.createOscillator(), g = ac.createGain(); os.type = o.wave || 'sawtooth'; os.frequency.setValueAtTime(f, T + t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, T + t + dur);
      if (o.det) os.detune.value = o.det;
      let n = os; if (o.cut) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = o.q || 1; fl.frequency.setValueAtTime(o.cut, T + t); if (o.cutTo) fl.frequency.exponentialRampToValueAtTime(o.cutTo, T + t + dur); os.connect(fl); n = fl; }
      n.connect(g); g.connect(out); if (o.wet) g.connect(verb);
      const a = o.att || .005, p = o.gain || .1, r = o.rel || .1;
      g.gain.setValueAtTime(0, T + t); g.gain.linearRampToValueAtTime(p, T + t + a); g.gain.setTargetAtTime(0, T + t + Math.max(a, dur - r), r / 3);
      os.start(T + t); os.stop(T + t + dur + r + .2);
    };
    const nz = (t, dur, o = {}) => {
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true;
      f.type = o.type || 'highpass'; f.frequency.setValueAtTime(o.freq || 6000, T + t); if (o.freqTo) f.frequency.exponentialRampToValueAtTime(o.freqTo, T + t + dur);
      g.gain.setValueAtTime(o.rise ? .001 : (o.gain || .1), T + t);
      if (o.rise) g.gain.exponentialRampToValueAtTime(o.gain || .1, T + t + dur); else g.gain.exponentialRampToValueAtTime(.001, T + t + dur);
      s.connect(f); f.connect(g); g.connect(out); if (o.wet) g.connect(verb); s.start(T + t); s.stop(T + t + dur + .05);
    };
    const kick = (t, k = .9) => { tone(150, t, .3, { wave: 'sine', to: 40, gain: k, rel: .2 }); nz(t, .02, { freq: 3000, gain: .15 }); };
    const clap = t => { nz(t, .18, { type: 'bandpass', freq: 1700, gain: .35 }); nz(t + .015, .12, { type: 'bandpass', freq: 1200, gain: .2 }); };
    const hat = (t, o) => nz(t, o ? .16 : .04, { freq: 8500, gain: o ? .1 : .08 });
    const chord = (t, notes, dur, g = .05) => notes.forEach((n, i) => { tone(hz(n), t, dur, { cut: 2600, cutTo: 900, gain: g, att: .02, rel: .5, det: i % 2 ? 9 : -9, wet: true }); });
    // 0 → 1,8 s : démarrage du système (nappe grave, petits bips, montée)
    tone(hz(33), 0, 1.9, { cut: 300, cutTo: 1200, gain: .18, att: .4, rel: .3 });
    for (let i = 0; i < 9; i++) tone(hz(84 + (i % 3) * 5), .1 + i * .17, .05, { wave: 'square', cut: 4000, gain: .035 });
    nz(.2, 1.6, { freq: 400, freqTo: 9000, gain: .16, rise: true });
    tone(hz(45), .4, 1.4, { to: hz(69), cut: 800, cutTo: 6000, gain: .06, att: .3 });
    // 1,8 s : impact, le logo arrive
    const D = 1.8; kick(D, 1.1); nz(D, 1.4, { freq: 4000, gain: .25, wet: true }); tone(hz(33), D, 1.6, { wave: 'sine', to: hz(28), gain: .35, rel: .6 });
    chord(D, [57, 64, 69, 72, 76], 2.2, .045);
    // 1,8 → 10,2 s : le groove (8 mesures) pendant le carrousel des jeux
    const PROG = [[45, [57, 60, 64, 69]], [41, [53, 57, 60, 65]], [48, [55, 60, 64, 67]], [43, [55, 59, 62, 67]]];
    for (let s = 0; s < 64; s++) {
      const t = D + s * B / 2, beat = s % 2 === 0, bar = Math.floor(s / 8), [root, ch] = PROG[bar % 4], start = s >= 8;
      if (t > 10.15) break;
      if (beat && (start || s % 4 === 0)) kick(t);
      if (start && s % 4 === 2) clap(t);
      if (start) hat(t + B / 4, s % 4 === 1); if (s >= 16) hat(t, false);
      tone(hz(root - 12 + (s % 2 ? 12 : 0)), t, B / 2 * .9, { cut: 900, cutTo: 300, q: 5, gain: .16, rel: .05 });
      if (s % 8 === 0 && start) chord(t, ch, B * 4, .035);
      if (s >= 12) { const arp = [0, 1, 2, 3, 2, 1, 3, 2]; tone(hz(ch[arp[s % 8]] + 12), t, B / 2 * .8, { wave: 'square', cut: 3200, gain: .03, rel: .06, wet: true }); }
      if (s >= 24 && s % 4 === 0) tone(hz(ch[3] + 24), t, B * .9, { wave: 'triangle', gain: .05, rel: .2, wet: true });
    }
    // 9,6 → 10,2 s : roulement de caisse claire + montée
    for (let i = 0; i < 12; i++) nz(9.6 + i * .05, .05, { type: 'bandpass', freq: 1700 + i * 80, gain: .08 + i * .02 });
    nz(8.6, 1.6, { freq: 600, freqTo: 10000, gain: .18, rise: true });
    // 10,2 s : grand final « Bienvenue »
    const F = 10.2; kick(F, 1.2); nz(F, 2.2, { freq: 3000, gain: .3, wet: true }); tone(hz(33), F, 2.4, { wave: 'sine', gain: .35, rel: 1 });
    chord(F, [57, 61, 64, 69, 73, 76], 3.6, .055);
    [69, 73, 76, 81, 85, 88].forEach((n, i) => tone(hz(n), F + .25 + i * .11, .5, { wave: 'square', cut: 5000, gain: .04, rel: .3, wet: true }));
    for (let i = 0; i < 6; i++) { kick(F + 1.4 + i * B, .7); hat(F + 1.4 + i * B + B / 2, true); }
    chord(F + 2.6, [57, 64, 69, 73, 76, 81], 1.4, .05); tone(hz(45), F + 2.6, 1.4, { wave: 'sine', gain: .3, rel: .6 }); kick(F + 2.6, 1);
    out.gain.setValueAtTime(.9 * vol, T + DUR - .9); out.gain.linearRampToValueAtTime(.0001, T + DUR);
    return ac;
  }

  /* ——— Décor animé : grille synthwave, soleil, étoiles et confettis ——— */
  function bg(cv, t, W, H) {
    const c = cv.getContext('2d'); c.clearRect(0, 0, W, H);
    const hzY = H * .58, show = Math.min(1, Math.max(0, (t - 1.7) / .5));
    const sky = c.createLinearGradient(0, 0, 0, hzY); sky.addColorStop(0, '#05030f'); sky.addColorStop(1, show ? '#2a0f4a' : '#05030f');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { const x = (i * 197.3) % W, y = (i * 83.7) % hzY, tw = .4 + .6 * Math.abs(Math.sin(t * 2 + i)); c.fillStyle = `rgba(255,255,255,${.5 * tw})`; c.fillRect(x, y, 1.6, 1.6); }
    if (!show) return;
    c.globalAlpha = show;
    // soleil rayé
    const sr = Math.min(W, H) * .2, sx = W / 2, sy = hzY - sr * .35;
    const sg = c.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, '#ffd36a'); sg.addColorStop(.6, '#ff4fa8'); sg.addColorStop(1, '#b45cff');
    c.save(); c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI * 2); c.clip(); c.fillStyle = sg; c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    c.fillStyle = '#2a0f4a'; for (let k = 0; k < 7; k++) { const yy = sy + sr * .1 + k * sr * .14; c.fillRect(sx - sr, yy, sr * 2, 2 + k * 1.6); } c.restore();
    c.shadowColor = '#ff4fa8'; c.shadowBlur = 60; c.beginPath(); c.arc(sx, sy, sr, Math.PI, 0); c.strokeStyle = 'rgba(255,79,168,.0)'; c.stroke(); c.shadowBlur = 0;
    // sol en grille qui défile
    const gg = c.createLinearGradient(0, hzY, 0, H); gg.addColorStop(0, '#12002a'); gg.addColorStop(1, '#05000f'); c.fillStyle = gg; c.fillRect(0, hzY, W, H - hzY);
    c.strokeStyle = 'rgba(56,200,245,.75)'; c.lineWidth = 1.6; c.shadowColor = '#38c8f5'; c.shadowBlur = 8;
    for (let i = -14; i <= 14; i++) { c.beginPath(); c.moveTo(W / 2 + i * 18, hzY); c.lineTo(W / 2 + i * W * .16, H); c.stroke(); }
    const sp = (t * .9) % 1;
    for (let k = 0; k < 14; k++) { const z = (k + sp) / 14, y = hzY + (H - hzY) * Math.pow(z, 2.2); c.globalAlpha = show * Math.min(1, z * 3); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.shadowBlur = 0; c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,79,168,.6)'; c.fillRect(0, hzY - 1, W, 2);
    // confettis du final
    if (t > 10.2) {
      const k = t - 10.2, cols = ['#39e58c', '#38c8f5', '#ff4fa8', '#ffd36a', '#b45cff'];
      for (let i = 0; i < 140; i++) {
        const a = (i * 2.399) % (Math.PI * 2), v = 260 + (i * 37) % 420, x = W / 2 + Math.cos(a) * v * k, y = H * .42 + Math.sin(a) * v * k * .7 + 260 * k * k;
        if (y > H + 20) continue; c.save(); c.translate(x, y); c.rotate(i + k * 6); c.fillStyle = cols[i % 5]; c.globalAlpha = Math.max(0, 1 - k / 3.6); c.fillRect(-5, -2.5, 10, 5); c.restore();
      }
    }
  }

  /* ——— Volume de la tablette : 50 % pendant la vidéo, puis retour au réglage d’avant ——— */
  let prevLevel = null;
  const papaAudio = () => {
    const C = window.Capacitor;
    if (!C || !(C.isNativePlatform && C.isNativePlatform())) return null;
    return (C.Plugins && C.Plugins.PapaAudio) || (C.registerPlugin && C.registerPlugin('PapaAudio')) || null;
  };
  function tabletVolume(pct) {
    const A = papaAudio(); if (!A) return;
    A.getVolume().then(r => { prevLevel = r.level; return A.setVolume({ percent: pct }); }).catch(() => {});
  }
  function restoreTablet() {
    const A = papaAudio(); if (!A || prevLevel === null) return;
    const lv = prevLevel; prevLevel = null; A.setVolume({ level: lv }).catch(() => {});
  }

  function build() {
    const el = document.createElement('div'); el.id = 'intro'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Vidéo de bienvenue');
    const games = GAME_ORDER.map(id => ({ id, name: GAME_INFO[id].name, ico: (typeof GAME_ICON !== 'undefined' && GAME_ICON[id]) || '🎮', img: (window.GAME_PREVIEWS || {})[id] || '' }));
    const papa = ($('#papa2-src') || $('#d-poup')).src;
    const title = 'LES JEUX DE PAPA';
    el.innerHTML = `<canvas class="in-bg"></canvas>
      <div class="in-boot"><p><span>&gt; démarrage de jeux_de_papa_v2.exe</span></p><p><span>&gt; chargement des 10 jeux… OK</span></p><p><span>&gt; installation des pièces pour papa… OK</span></p><div class="in-bar"><i></i></div></div>
      <div class="in-flash"></div>
      <div class="in-stage">
        <div class="in-logo"><span class="in-l1">Les jeux de</span><span class="in-l2">PAPA <b>2</b></span></div>
        <img class="in-papa" src="${papa}" alt="">
        <div class="in-ring-wrap"><div class="in-ring">${games.map((g, i) => `<div class="in-card" style="--i:${i}"><div class="in-card-in">${g.img ? `<img src="${g.img}" alt="">` : ''}<span class="in-ico">${g.ico}</span><b>${g.name}</b></div></div>`).join('')}</div></div>
        <div class="in-names">${games.map((g, i) => `<span style="--i:${i}">${g.ico} ${g.name}</span>`).join('')}</div>
        <div class="in-end"><p class="in-wel">Bienvenue dans</p><h1 class="in-title">${[...title].map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('')}</h1><p class="in-v2">VERSION 2</p>
          <button class="btn primary in-go">C’est parti&#8239;!</button></div>
      </div>
      <button class="in-skip">Passer ⏭</button>`;
    document.body.appendChild(el);
    return el;
  }

  function finish() {
    if (!running) return; running = false; cancelAnimationFrame(raf); clearTimeout(closeTimer);
    const el = $('#intro'); if (actx) { try { actx.close(); } catch (e) { } actx = null; }
    restoreTablet();
    if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 500); }
    const cb = onEnd; onEnd = null; if (cb) setTimeout(cb, 250);
  }

  function play(done) {
    if (running) return; running = true; onEnd = done;
    if (Sound.stop) Sound.stop();
    const el = build(), cv = el.querySelector('.in-bg');
    const size = () => { const d = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0); };
    size();
    // le son du jeu est forcé à 50 % pour la vidéo, quel que soit le réglage de la musique
    tabletVolume(50);
    try { actx = music(.5); } catch (e) { actx = null; }
    el.querySelector('.in-skip').addEventListener('click', e => { e.stopPropagation(); finish(); });
    el.querySelector('.in-go').addEventListener('click', e => { e.stopPropagation(); finish(); });
    t0 = performance.now();
    void el.offsetWidth; el.classList.add('on');
    const loop = now => { if (!running) return; const t = (now - t0) / 1000; bg(cv, t, innerWidth, innerHeight); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    closeTimer = setTimeout(finish, (DUR + .6) * 1000);
  }
  return { play, get running() { return running; } };
})();

// Premier clic sur « Jouer » au niveau 1 : on lance la vidéo, puis le niveau 1
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('#m-play'); if (!b || Save.d.introSeen || nextLevel() !== 1 || Intro.running) return;
  e.stopPropagation(); e.preventDefault();
  Save.d.introSeen = 1; Save.write(); Sound.init();
  Intro.play(() => { startLevel(1); });
}, true);
// Bouton dans les réglages pour revoir la vidéo
$('#set-intro').addEventListener('click', () => { Sound.tap(); Intro.play(() => { Sound.play('menu'); }); });
