// Musique générative dynamique (batterie, basse, arpèges façon synthwave) et effets sonores, sans aucun fichier audio
'use strict';
const Sound = (() => {
  let ac = null, master, musicBus, sfxBus, verb, send, noise, timer = null;
  let musicVol = .6, sfxVol = .8;
  let mood = null, step = 0, nextT = 0, bar = 0;

  // Chaque ambiance : tempo, accords (une mesure chacun), motifs de batterie et de basse sur 16 doubles-croches
  const MOODS = {
    menu:    { bpm: 112, lead: 'square',   arp: 'up',   arpOn: 1,  cut: 2600, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bass: 'x..x..x.x..x..x.', chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 67]] },
    calm:    { bpm: 100, lead: 'triangle', arp: 'updown', arpOn: .8, cut: 2000, kick: 'x.......x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', bass: 'x...x...x..x....', chords: [[52, 56, 59, 64], [49, 52, 56, 61], [45, 49, 52, 57], [47, 51, 54, 59]] },
    bright:  { bpm: 124, lead: 'square',   arp: 'up',   arpOn: 1,  cut: 3200, kick: 'x...x...x...x...', snare: '....x.......x..x', hat: 'xxxxxxxxxxxxxxxx', bass: 'x.xx.x.xx.xx.x.x', chords: [[48, 52, 55, 60], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]] },
    dreamy:  { bpm: 104, lead: 'sine',     arp: 'down', arpOn: .9, cut: 2200, kick: 'x.....x...x.....', snare: '....x.......x...', hat: '..x...x...x...x.', bass: 'x.....x...x...x.', chords: [[50, 54, 57, 62], [47, 50, 54, 59], [43, 47, 50, 55], [45, 49, 52, 57]] },
    mystery: { bpm: 108, lead: 'sawtooth', arp: 'updown', arpOn: .9, cut: 1700, kick: 'x..x..x...x..x..', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', bass: 'xx..x.xx..x.x.x.', chords: [[50, 53, 57, 62], [46, 50, 53, 58], [43, 46, 50, 55], [45, 49, 52, 57]] },
    night:   { bpm: 100, lead: 'sawtooth', arp: 'up',   arpOn: .7, cut: 1500, kick: 'x.......x..x....', snare: '....x.......x...', hat: '..x...x...x...x.', bass: 'x..x..x...x..x..', chords: [[54, 57, 61, 66], [50, 54, 57, 62], [45, 49, 52, 57], [52, 56, 59, 64]] },
    space:   { bpm: 106, lead: 'triangle', arp: 'updown', arpOn: .9, cut: 2400, kick: 'x...x...x...x...', snare: '........x.......', hat: 'x.x.x.x.x.x.x.x.', bass: 'x...x.x.x...x.x.', chords: [[48, 55, 60, 64], [46, 53, 58, 62], [44, 51, 56, 60], [46, 53, 58, 65]] },
  };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function impulse(sec) {
    const len = ac.sampleRate * sec, b = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    return b;
  }
  function init() {
    if (ac) { if (ac.state === 'suspended' && !document.hidden) ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createDynamicsCompressor(); master.threshold.value = -14; master.ratio.value = 4; master.connect(ac.destination);
    musicBus = ac.createGain(); sfxBus = ac.createGain();
    verb = ac.createConvolver(); verb.buffer = impulse(2.2);
    const verbOut = ac.createGain(); verbOut.gain.value = .35;
    send = ac.createGain(); send.gain.value = .5;
    musicBus.connect(master); send.connect(verb); sfxBus.connect(master);
    const sfxSend = ac.createGain(); sfxSend.gain.value = .25; sfxBus.connect(sfxSend); sfxSend.connect(verb);
    verb.connect(verbOut); verbOut.connect(master);
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    setVolumes(musicVol, sfxVol);
    document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : ac.resume(); });
  }
  function setVolumes(m, s) {
    musicVol = m; sfxVol = s;
    if (!ac) return;
    musicBus.gain.setTargetAtTime(m * .5, ac.currentTime, .1);
    send.gain.setTargetAtTime(m * .22, ac.currentTime, .1);
    sfxBus.gain.setTargetAtTime(s * .75, ac.currentTime, .05);
  }

  function voice(freq, t, dur, opt) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = opt.wave || 'sine'; o.frequency.value = freq; if (opt.detune) o.detune.value = opt.detune;
    if (opt.slide) o.frequency.exponentialRampToValueAtTime(freq * opt.slide, t + dur);
    let node = o;
    if (opt.cut) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(opt.cut, t); f.Q.value = opt.q || .7; if (opt.env) f.frequency.exponentialRampToValueAtTime(Math.max(120, opt.cut * opt.env), t + dur); o.connect(f); node = f; }
    node.connect(g); g.connect(opt.bus); if (opt.send) g.connect(send);
    const a = opt.att || .005, peak = opt.gain || .2, rel = opt.rel || .1;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(0, t + Math.max(a, dur - rel), rel / 3);
    o.start(t); o.stop(t + dur + rel + .1);
  }
  function hit(t, opt) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; f.type = opt.type || 'highpass'; f.frequency.value = opt.freq; f.Q.value = opt.q || .7;
    g.gain.setValueAtTime(opt.gain, t); g.gain.exponentialRampToValueAtTime(.001, t + opt.dur);
    s.connect(f); f.connect(g); g.connect(opt.bus || musicBus); s.start(t, Math.random() * .5); s.stop(t + opt.dur + .05);
  }
  // ——— Batterie ———
  function kick(t, bus, k) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
    g.gain.setValueAtTime(k || .75, t); g.gain.exponentialRampToValueAtTime(.001, t + .32);
    o.connect(g); g.connect(bus || musicBus); o.start(t); o.stop(t + .35);
    hit(t, { freq: 3000, dur: .015, gain: .12, bus });
  }
  function snare(t) {
    hit(t, { type: 'bandpass', freq: 1900, q: .8, dur: .2, gain: .32 });
    hit(t + .012, { type: 'bandpass', freq: 1300, q: 1, dur: .12, gain: .2 });
    voice(190, t, .07, { bus: musicBus, wave: 'triangle', gain: .18, rel: .06, slide: .6 });
  }
  const hat = (t, open) => hit(t, { freq: 8500, dur: open ? .18 : .035, gain: open ? .09 : .07 });

  function schedule() {
    if (!ac || !mood) return;
    const M = MOODS[mood], sd = 60 / M.bpm / 4;
    while (nextT < ac.currentTime + .25) {
      const t = nextT, s = step % 16, ch = M.chords[bar % M.chords.length], section = Math.floor(bar / 4) % 4;
      // intro douce (2 mesures sans batterie complète), puis tout le groupe
      const full = bar >= 2;
      if (M.kick[s] === 'x' && (full || s % 8 === 0)) kick(t);
      if (full && M.snare[s] === 'x') snare(t);
      if (full && M.hat[s] === 'x') hat(t, s % 4 === 2 && section === 2);
      if (full && s === 15 && bar % 4 === 3) { snare(t); snare(t + sd / 2); }
      // basse pulsée avec octave
      if (M.bass[s] === 'x') {
        const n = ch[0] - 24 + (s % 4 === 2 ? 12 : 0);
        voice(hz(n), t, sd * 1.6, { bus: musicBus, wave: 'sawtooth', cut: 900, env: .3, q: 4, gain: .16, rel: .06 });
        voice(hz(n) / 2, t, sd * 1.6, { bus: musicBus, wave: 'sine', gain: .14, rel: .06 });
      }
      // accords en « stabs » qui pompent sur chaque temps
      if (s % 4 === 0) ch.forEach((n, i) => voice(hz(n), t + .02, sd * 3.2, { bus: musicBus, send: true, wave: 'sawtooth', cut: M.cut * .6, env: .4, gain: .028, att: .02, rel: .2, detune: i % 2 ? 8 : -8 }));
      // arpège rapide
      if (full && Math.random() < M.arpOn) {
        const seq = M.arp === 'down' ? [3, 2, 1, 0] : M.arp === 'updown' ? [0, 1, 2, 3, 2, 1] : [0, 1, 2, 3];
        const n = ch[seq[step % seq.length]] + 12 + (Math.floor(s / 8) % 2 && section % 2 ? 12 : 0);
        voice(hz(n), t, sd * .9, { bus: musicBus, send: true, wave: M.lead, cut: M.cut, env: .5, gain: M.lead === 'square' ? .035 : .05, rel: .08 });
      }
      // petite mélodie toutes les deux mesures
      if (full && bar % 2 === 1 && (s === 0 || s === 6 || s === 10 || s === 12) && Math.random() < .75) {
        const scale = [0, 2, 4, 7, 9], n = ch[0] + 12 + scale[Math.floor(Math.random() * scale.length)] + (Math.random() < .3 ? 12 : 0);
        voice(hz(n), t, sd * (s === 12 ? 4 : 2.5), { bus: musicBus, send: true, wave: 'triangle', gain: .07, att: .01, rel: .25 });
      }
      nextT += sd; step++; if (step % 16 === 0) bar++;
    }
  }
  function play(m) {
    init(); if (!ac || mood === m) return;
    mood = MOODS[m] ? m : 'menu'; step = 0; bar = 0; nextT = ac.currentTime + .1;
    if (!timer) timer = setInterval(schedule, 60);
  }
  function stop() { mood = null; }

  // ——— Effets ———
  function tap() {
    init(); if (!ac) return; const t = ac.currentTime;
    voice(1320, t, .05, { bus: sfxBus, wave: 'square', cut: 4000, gain: .05, rel: .04 });
    voice(660, t, .04, { bus: sfxBus, wave: 'sine', gain: .08, rel: .03 });
  }
  function found() {
    init(); if (!ac) return; const t = ac.currentTime;
    [[76, 0], [83, .06], [88, .12], [95, .18]].forEach(([n, d]) => {
      voice(hz(n), t + d, .22, { bus: sfxBus, wave: 'square', cut: 5000, gain: .07, rel: .15 });
      voice(hz(n), t + d, .4, { bus: sfxBus, wave: 'triangle', gain: .12, rel: .3 });
    });
    hit(t + .18, { freq: 7000, dur: .35, gain: .08, bus: sfxBus });
  }
  function wrong() {
    init(); if (!ac) return; const t = ac.currentTime;
    [0, .13].forEach(d => voice(150, t + d, .12, { bus: sfxBus, wave: 'square', cut: 900, gain: .14, rel: .05, slide: .7 }));
    voice(75, t, .3, { bus: sfxBus, wave: 'sine', gain: .2, rel: .1, slide: .8 });
  }
  function hint() {
    init(); if (!ac) return; const t = ac.currentTime;
    voice(500, t, .35, { bus: sfxBus, wave: 'sawtooth', cut: 3000, gain: .05, rel: .1, slide: 3 });
    [84, 88, 91].forEach((n, i) => voice(hz(n), t + .3 + i * .07, .5, { bus: sfxBus, wave: 'sine', gain: .1, rel: .4 }));
  }
  function complete() {
    init(); if (!ac) return; const t = ac.currentTime;
    kick(t, sfxBus, .6);
    [72, 76, 79, 84, 79, 84, 88].forEach((n, i) => voice(hz(n), t + i * .085, .2, { bus: sfxBus, wave: 'square', cut: 4500, gain: .06, rel: .1 }));
    [72, 76, 79, 84].forEach(n => voice(hz(n), t + .62, 1.3, { bus: sfxBus, wave: 'sawtooth', cut: 3000, env: .4, gain: .045, att: .01, rel: 1 }));
    voice(hz(48), t + .62, 1.2, { bus: sfxBus, wave: 'sine', gain: .2, rel: .8 });
    kick(t + .62, sfxBus, .7); hit(t + .62, { freq: 6000, dur: .8, gain: .1, bus: sfxBus });
  }
  function jingle() {
    init(); if (!ac) return; const t = ac.currentTime;
    [[72, 0], [76, .1], [79, .2], [84, .3], [83, .45], [84, .55], [88, .65]].forEach(([n, d]) => {
      voice(hz(n), t + d, .14, { bus: sfxBus, wave: 'square', cut: 3500, gain: .06, rel: .08 });
      voice(hz(n - 12), t + d, .14, { bus: sfxBus, wave: 'triangle', gain: .08, rel: .08 });
    });
    hit(t + .65, { freq: 7000, dur: .4, gain: .07, bus: sfxBus });
  }
  // montée de suspense avant la révélation (plus longue pour les objets rares)
  function riser(sec, strength) {
    init(); if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(220 + 900 * strength, t + sec);
    f.type = 'lowpass'; f.Q.value = 6; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5000, t + sec);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 + .05 * strength, t + sec);
    o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + sec + .05);
    const beats = Math.floor(sec * 6); for (let i = 0; i < beats; i++) { const tt = t + sec * (1 - Math.pow(1 - i / beats, 1.6)); hit(tt, { type: 'bandpass', freq: 1800, dur: .05, gain: .05 + .1 * i / beats, bus: sfxBus }); }
  }
  function boom(strength) {
    init(); if (!ac) return; const t = ac.currentTime;
    kick(t, sfxBus, .5 + .4 * strength);
    hit(t, { type: 'lowpass', freq: 1200, dur: .6, gain: .25 + .2 * strength, bus: sfxBus });
    hit(t, { freq: 5000, dur: .5, gain: .08, bus: sfxBus });
  }
  return { init, play, stop, setVolumes, found, wrong, hint, complete, tap, jingle, riser, boom };
})();
