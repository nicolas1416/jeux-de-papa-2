'use strict';
/* ═══════════ Les jeux de Papa 2 : Relier, Bulles, Piratage, Flacons ═══════════ */
Object.assign(GAME_INFO, {
  flow: { name: 'Relier', win: 'Bravo Papa, tout le réseau est câblé\u202f!',
    rules: 'Relie chaque paire de points de la même couleur en traçant un tuyau du doigt, de case en case (pas en diagonale). Les tuyaux ne peuvent pas se croiser. Pour gagner, toutes les paires doivent être reliées et toutes les cases de la grille remplies. Pour corriger, repasse sur un tuyau ou repars d’un de ses points.' },
  bubble: { name: 'Bulles', win: 'Bravo Papa, quelle pluie de bulles\u202f!',
    rules: 'Le canon est au centre : touche l’écran (ou glisse le doigt) pour viser dans n’importe quelle direction, puis relâche pour tirer. Une bulle qui en touche au moins deux autres de sa couleur les fait toutes éclater, et les bulles qui ne tiennent plus au bord tombent. Touche le canon pour échanger avec la bulle suivante. Fais éclater assez de bulles avant la fin des tirs, sans laisser les bulles atteindre le canon.' },
  hack: { name: 'Piratage', win: 'Accès autorisé\u202f! Bravo Papa, tu es entré dans le système\u202f!',
    rules: 'Inspiré du piratage de terminal de GTA V. Une adresse IP rouge s’affiche en haut : retrouve ses quatre nombres, à la suite, dans la grille qui défile. Touche le premier des quatre nombres pour les sélectionner (en rouge), puis appuie sur « Connexion ». Une sélection fausse coûte 5 secondes. Pirate toutes les adresses avant la fin du chrono.' },
  bottles: { name: 'Flacons', win: 'Bravo Papa, chaque couleur est dans son flacon\u202f!',
    rules: 'Trie les couleurs : touche un flacon, puis un autre pour y verser le liquide du dessus. On ne peut verser que sur la même couleur ou dans un flacon vide, et chaque flacon contient 4 doses. Quand toutes les couleurs sont rangées chacune dans son flacon, c’est gagné. Plus tu avances, plus il y a de couleurs.' },
});

/* ═══════════ Relier les points (façon Flow) ═══════════ */
const FLOW_COLORS = ['#ff3b3b', '#2f7bff', '#2bd14f', '#ffd23a', '#ff8a1f', '#36d6e7', '#b45cff', '#ff5fb0', '#a8743a', '#e8ecf0', '#8cff3a', '#3a50c8'];
function flowGen(N, R) {
  for (let t = 0; t < 200; t++) {
    const path = zipPath(N, R), L = N * N, segs = [];
    const minLen = 3, maxLen = Math.max(5, Math.round(N * 1.3));
    let i = 0;
    while (i < L) {
      let len = minLen + Math.floor(R() * (maxLen - minLen + 1));
      if (L - i - len < minLen) len = L - i;
      segs.push(path.slice(i, i + len)); i += len;
    }
    if (segs.length <= FLOW_COLORS.length && segs.length >= Math.max(3, N - 1)) return segs;
  }
  return null;
}
MINIS.flow = {
  start(api) {
    const R = api.R, N = Math.min(9, 5 + Math.round(api.d * 4)), sol = flowGen(N, R), K = sol.length;
    const ui = LK.shell(api, 'flow', `Relie les <b>${K} paires</b> de couleurs et remplis <b>toutes les cases</b>, sans croiser les tuyaux.`);
    const ends = new Map(); sol.forEach((s, k) => { ends.set(s[0], k); ends.set(s[s.length - 1], k); });
    ui.board.style.setProperty('--n', N);
    ui.board.innerHTML = `<div class="lk-grid fl-grid"><svg class="fl-svg" viewBox="0 0 ${N} ${N}" preserveAspectRatio="none"></svg></div>`;
    const grid = ui.board.firstChild, svg = grid.firstChild, cells = [];
    for (let i = 0; i < N * N; i++) { const b = document.createElement('div'); b.className = 'lk-cell fl-cell'; b.dataset.i = i; grid.appendChild(b); cells.push(b); }
    let paths = sol.map(() => []), hints = 0, over = false, active = -1; const hist = [];
    const owner = () => { const o = new Array(N * N).fill(-1); paths.forEach((p, k) => p.forEach(i => { o[i] = k; })); return o; };
    const adj = (a, b) => (Math.abs(a - b) === 1 && Math.floor(a / N) === Math.floor(b / N)) || Math.abs(a - b) === N;
    const complete = k => { const p = paths[k]; return p.length >= 2 && ends.get(p[0]) === k && ends.get(p[p.length - 1]) === k && p[0] !== p[p.length - 1]; };
    function draw() {
      const o = owner(), pt = i => `${i % N + .5},${Math.floor(i / N) + .5}`;
      svg.innerHTML = paths.map((p, k) => p.length > 1 ? `<polyline points="${p.map(pt).join(' ')}" stroke="${FLOW_COLORS[k]}"/>` : '').join('')
        + [...ends].map(([i, k]) => `<circle cx="${i % N + .5}" cy="${Math.floor(i / N) + .5}" r=".32" fill="${FLOW_COLORS[k]}"/>`).join('');
      cells.forEach((b, i) => { b.style.background = o[i] >= 0 ? FLOW_COLORS[o[i]] + '33' : ''; });
      const done = paths.filter((_, k) => complete(k)).length;
      api.stat(`${done}/${K} liaisons`);
      return { done, filled: o.every(x => x >= 0) };
    }
    function check() {
      const { done, filled } = draw();
      if (done === K && filled) { over = true; Sound.complete(); LK.say(ui, 'Réseau parfait\u202f!'); api.win(LK.stars(hints), [{ label: 'Indices', value: hints }, { label: 'Grille', value: `${N}×${N}` }]); }
      else if (done === K) LK.say(ui, 'Toutes les couleurs sont reliées : il faut aussi remplir toutes les cases.', true);
    }
    // couper un autre tuyau qu’on traverse
    const cut = (k, i) => { const p = paths[k], at = p.indexOf(i); if (at >= 0) paths[k] = p.slice(0, at); };
    function step(i) {
      if (active < 0) return;
      const p = paths[active], last = p[p.length - 1];
      if (i === last) return;
      if (p.length >= 2 && i === p[p.length - 2]) { p.pop(); draw(); return; }
      if (p.includes(i)) { paths[active] = p.slice(0, p.indexOf(i) + 1); draw(); return; }
      if (!adj(last, i) || complete(active)) return;
      if (ends.has(i) && ends.get(i) !== active) return;
      const o = owner(); if (o[i] >= 0 && o[i] !== active) cut(o[i], i);
      paths[active].push(i);
      if (complete(active)) { Sound.found(); }
      draw();
    }
    grid.addEventListener('pointerdown', e => {
      if (over) return; const i = LK.cellAt(grid, e); if (i < 0) return; e.preventDefault();
      const o = owner();
      if (ends.has(i)) { hist.push(paths.map(p => p.slice())); active = ends.get(i); paths[active] = [i]; Sound.tap(); draw(); }
      else if (o[i] >= 0) { hist.push(paths.map(p => p.slice())); active = o[i]; paths[active] = paths[active].slice(0, paths[active].indexOf(i) + 1); Sound.tap(); draw(); }
      else active = -1;
      LK.say(ui, '');
    });
    grid.addEventListener('pointermove', e => { if (active < 0 || over) return; const i = LK.cellAt(grid, e); if (i >= 0) step(i); });
    window.addEventListener('pointerup', MINIS.flow._up = () => { if (active < 0) return; active = -1; check(); });
    ui.hint.addEventListener('click', () => {
      if (over) return;
      const k = sol.findIndex((s, j) => !(paths[j].length === s.length && (paths[j].every((x, q) => x === s[q]) || paths[j].every((x, q) => x === s[s.length - 1 - q]))));
      if (k < 0) return; hist.push(paths.map(p => p.slice()));
      const o = owner(); sol[k].forEach(i => { if (o[i] >= 0 && o[i] !== k) cut(o[i], i); });
      paths[k] = sol[k].slice(); hints++; Sound.hint();
      sol[k].forEach(i => { cells[i].classList.remove('hinted'); void cells[i].offsetWidth; cells[i].classList.add('hinted'); });
      LK.say(ui, ''); check();
    });
    ui.undo.addEventListener('click', () => { if (over || !hist.length) return; paths = hist.pop(); Sound.tap(); LK.say(ui, ''); draw(); });
    ui.clear.addEventListener('click', () => { if (over) return; hist.push(paths.map(p => p.slice())); paths = sol.map(() => []); Sound.tap(); LK.say(ui, ''); draw(); });
    draw();
  },
  stop() { if (MINIS.flow._up) window.removeEventListener('pointerup', MINIS.flow._up); },
};

/* ═══════════ Bulles : canon au centre ═══════════ */
const BUBBLE_COLORS = [['#ff4a3d', '#ffb0a8', '#a01a12'], ['#3ad34a', '#b8ffb0', '#127a1e'], ['#2f6bff', '#a8c4ff', '#0d2a9a'], ['#ffd23a', '#fff2a8', '#a07a00'], ['#b45cff', '#e6c8ff', '#5a1a9a']];
MINIS.bubble = {
  start(api) {
    const R = api.R, d = api.d, nCol = d < .3 ? 3 : d < .7 ? 4 : 5;
    const maxShots = Math.round(26 - d * 4); let goal = 0;
    api.root.innerHTML = `<div class="bb-wrap"><canvas class="bb-cv"></canvas>
      <div class="bb-side"><p class="cd-label">Objectif</p><p class="cd-big bb-goal"></p><div class="cd-bar"><i></i></div>
      <p class="cd-label">Éclatées</p><p class="cd-big bb-popped">0</p><p class="cd-label">Tirs restants</p><p class="cd-big bb-shots">${maxShots}</p>
      <p class="cd-label">Suivante</p><div class="bb-next"></div></div></div>`;
    const cv = api.root.querySelector('.bb-cv'), cx = cv.getContext('2d'), wrap = api.root.querySelector('.bb-wrap');
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const box = wrap.getBoundingClientRect();
    const W = Math.max(320, Math.floor(box.width - 230)), H = Math.max(260, Math.floor(box.height - 20));
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cx.scale(DPR, DPR);
    const cols = 21 + Math.round(d * 6), r = W / (cols * 2 + 1), rowH = r * Math.sqrt(3), rows = Math.floor((H - 2 * r) / rowH) + 1;
    const offY = (H - ((rows - 1) * rowH + 2 * r)) / 2;
    const ncols = row => row % 2 ? cols - 1 : cols;
    const pos = (row, c) => [r + c * 2 * r + (row % 2 ? r : 0), offY + r + row * rowH];
    const CX = W / 2, CY = H / 2, clear = r * 5.2, danger = r * 2.6;
    const grid = []; for (let y = 0; y < rows; y++) grid.push(new Array(ncols(y)).fill(-1));
    const nbrs = (y, c) => {
      const o = y % 2 ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]] : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
      return o.map(([dy, dc]) => [y + dy, c + dc]).filter(([yy, cc]) => yy >= 0 && yy < rows && cc >= 0 && cc < ncols(yy));
    };
    // remplissage en grappes de couleurs, avec une clairière au centre
    for (let y = 0; y < rows; y++) for (let c = 0; c < ncols(y); c++) {
      const [x, yy] = pos(y, c); if (Math.hypot(x - CX, yy - CY) < clear) continue;
      const done = nbrs(y, c).filter(([a, b]) => grid[a][b] >= 0);
      grid[y][c] = done.length && R() < .58 ? grid[done[0][0]][done[0][1]] : Math.floor(R() * nCol);
    }
    // objectif : une part de toutes les bulles de la grille (de 20 % à 32 %)
    let total = 0; grid.forEach(row => row.forEach(v => { if (v >= 0) total++; }));
    goal = Math.round(total * (.2 + d * .12) / 5) * 5; api.root.querySelector('.bb-goal').textContent = `${goal} bulles`;
    const present = () => { const s = new Set(); grid.forEach(row => row.forEach(v => { if (v >= 0) s.add(v); })); return [...s]; };
    const pickColor = () => { const p = present(); return p.length ? p[Math.floor(R() * p.length)] : 0; };
    let cur = pickColor(), next = pickColor(), shots = maxShots, popped = 0, over = false, aim = -Math.PI / 2, aiming = false, ball = null;
    const falling = [], bursts = [];
    const nextEl = api.root.querySelector('.bb-next');
    function bubble(x, y, rad, k, alpha) {
      const [m, hi, lo] = BUBBLE_COLORS[k]; cx.save(); cx.globalAlpha = alpha == null ? 1 : alpha;
      const g = cx.createRadialGradient(x - rad * .35, y - rad * .4, rad * .1, x, y, rad); g.addColorStop(0, hi); g.addColorStop(.45, m); g.addColorStop(1, lo);
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, rad * .96, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.75)'; cx.beginPath(); cx.ellipse(x - rad * .35, y - rad * .45, rad * .25, rad * .15, -.6, 0, Math.PI * 2); cx.fill(); cx.restore();
    }
    function updateSide() {
      api.root.querySelector('.bb-popped').textContent = popped; api.root.querySelector('.bb-shots').textContent = shots;
      api.root.querySelector('.cd-bar i').style.width = Math.min(100, popped / goal * 100) + '%';
      nextEl.innerHTML = `<span style="background:radial-gradient(circle at 35% 30%, ${BUBBLE_COLORS[next][1]}, ${BUBBLE_COLORS[next][0]} 45%, ${BUBBLE_COLORS[next][2]})"></span>`;
      api.stat(`${popped} / ${goal}`);
    }
    // trajectoire : on avance par petits pas jusqu’à toucher une bulle ou le bord
    function trace(a) {
      let x = CX, y = CY; const dx = Math.cos(a) * r * .5, dy = Math.sin(a) * r * .5;
      for (let s = 0; s < 4000; s++) {
        x += dx; y += dy;
        if (x < r || x > W - r || y < offY + r || y > H - offY - r) return [x, y];
        for (let gy = 0; gy < rows; gy++) { const [, py] = pos(gy, 0); if (Math.abs(py - y) > 2 * r) continue; for (let c = 0; c < ncols(gy); c++) if (grid[gy][c] >= 0) { const [px] = pos(gy, c); if (Math.hypot(px - x, py - y) < r * 1.7) return [x, y]; } }
      }
      return [x, y];
    }
    function snap(x, y) {
      let best = null, bd = 1e9;
      for (let gy = 0; gy < rows; gy++) for (let c = 0; c < ncols(gy); c++) { if (grid[gy][c] >= 0) continue; const [px, py] = pos(gy, c), dd = Math.hypot(px - x, py - y); if (dd < bd) { bd = dd; best = [gy, c]; } }
      return best;
    }
    function settle(y0, c0, k) {
      grid[y0][c0] = k;
      // groupe de même couleur
      const seen = new Set([y0 + ',' + c0]), group = [[y0, c0]], st = [[y0, c0]];
      while (st.length) { const [a, b] = st.pop(); nbrs(a, b).forEach(([p, q]) => { const key = p + ',' + q; if (!seen.has(key) && grid[p][q] === k) { seen.add(key); group.push([p, q]); st.push([p, q]); } }); }
      let gained = 0;
      if (group.length >= 3) {
        group.forEach(([a, b]) => { const [x, y] = pos(a, b); bursts.push({ x, y, k, t: 0 }); grid[a][b] = -1; });
        gained += group.length; Sound.found();
        // bulles qui ne tiennent plus à aucun bord
        const anchored = new Set(), q = [];
        for (let a = 0; a < rows; a++) for (let b = 0; b < ncols(a); b++) if (grid[a][b] >= 0 && (a === 0 || a === rows - 1 || b === 0 || b === ncols(a) - 1)) { anchored.add(a + ',' + b); q.push([a, b]); }
        while (q.length) { const [a, b] = q.pop(); nbrs(a, b).forEach(([p, s]) => { const key = p + ',' + s; if (!anchored.has(key) && grid[p][s] >= 0) { anchored.add(key); q.push([p, s]); } }); }
        let drop = 0;
        for (let a = 0; a < rows; a++) for (let b = 0; b < ncols(a); b++) if (grid[a][b] >= 0 && !anchored.has(a + ',' + b)) { const [x, y] = pos(a, b); falling.push({ x, y, vx: (x - CX) * .01, vy: (y - CY) * .01, k: grid[a][b], t: 0 }); grid[a][b] = -1; drop++; }
        gained += drop;
        if (drop >= 10 && typeof Ach !== 'undefined') Ach.unlock('bubbledrop');
        if (gained >= 50 && typeof Ach !== 'undefined') Ach.unlock('bubble50');
        if (drop) api.tip(`${drop} bulle${drop > 1 ? 's' : ''} décrochée${drop > 1 ? 's' : ''}\u202f!`);
      } else Sound.tap();
      popped += gained;
      const [x, y] = pos(y0, c0);
      updateSide();
      if (popped >= goal) { over = true; Sound.complete(); api.win(shots >= 8 ? 3 : shots >= 3 ? 2 : 1, [{ label: 'Bulles', value: popped }, { label: 'Tirs restants', value: shots }]); }
      else if (grid[y0][c0] >= 0 && Math.hypot(x - CX, y - CY) < danger) { over = true; api.lose('Les bulles ont atteint le canon', 'Elles se sont trop rapprochées du centre. Retente ta chance\u202f!', 2200); }
      else if (shots <= 0) { over = true; api.lose('Plus de tirs', `Tu as fait éclater ${popped} bulles sur les ${goal} demandées. Encore un essai\u202f?`, 1500); }
      else if (!present().length) { over = true; Sound.complete(); api.win(3, [{ label: 'Bulles', value: popped }, { label: 'Tirs restants', value: shots }]); }
    }
    let swaps = 0;
    function shoot() {
      if (over || ball || paused) return; swaps = 0;
      shots--; const [tx, ty] = trace(aim); ball = { x: CX, y: CY, tx, ty, k: cur, a: aim }; cur = next; next = pickColor(); if (!present().includes(cur)) cur = pickColor(); updateSide();
    }
    function frame() {
      if (!api.root.isConnected) return;
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = 'rgba(255,255,255,.03)'; cx.beginPath(); cx.arc(CX, CY, clear, 0, Math.PI * 2); cx.fill();
      for (let y = 0; y < rows; y++) for (let c = 0; c < ncols(y); c++) if (grid[y][c] >= 0) { const [x, yy] = pos(y, c); bubble(x, yy, r, grid[y][c]); }
      // ligne de visée
      if (!over && !ball) {
        const [tx, ty] = trace(aim); cx.save(); cx.setLineDash([4, 8]); cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(CX, CY); cx.lineTo(tx, ty); cx.stroke(); cx.restore();
      }
      // canon
      cx.save(); cx.translate(CX, CY); cx.strokeStyle = 'rgba(56,200,245,.8)'; cx.lineWidth = 6; cx.beginPath(); cx.arc(0, 0, r * 2.1, 0, Math.PI * 2); cx.stroke();
      cx.rotate(aim); cx.fillStyle = '#ff4fa8'; cx.beginPath(); cx.moveTo(r * 3.2, 0); cx.lineTo(r * 2.4, -r * .6); cx.lineTo(r * 2.4, r * .6); cx.fill(); cx.restore();
      if (!ball && !over) bubble(CX, CY, r * 1.05, cur);
      if (ball) {
        const sp = r * 1.1, ang = Math.atan2(ball.ty - ball.y, ball.tx - ball.x), dist = Math.hypot(ball.tx - ball.x, ball.ty - ball.y);
        if (dist <= sp) { const s = snap(ball.tx, ball.ty); const b = ball; ball = null; if (s) settle(s[0], s[1], b.k); }
        else { ball.x += Math.cos(ang) * sp; ball.y += Math.sin(ang) * sp; bubble(ball.x, ball.y, r, ball.k); }
      }
      for (let i = falling.length - 1; i >= 0; i--) { const f = falling[i]; f.t++; f.x += f.vx * 3; f.y += f.vy * 3 + f.t * .35; bubble(f.x, f.y, r, f.k, Math.max(0, 1 - f.t / 45)); if (f.t > 45) falling.splice(i, 1); }
      for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i]; b.t++; bubble(b.x, b.y, r * (1 + b.t / 10), b.k, Math.max(0, 1 - b.t / 12)); if (b.t > 12) bursts.splice(i, 1); }
      requestAnimationFrame(frame);
    }
    const local = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * W / b.width, (e.clientY - b.top) * H / b.height]; };
    cv.addEventListener('pointerdown', e => {
      if (over || ball) return; const [x, y] = local(e);
      if (Math.hypot(x - CX, y - CY) < r * 2) { [cur, next] = [next, cur]; Sound.tap(); updateSide(); if (++swaps >= 8 && typeof Ach !== 'undefined') { Ach.unlock('egg_juggle'); React.say('oops', 'Arrête de jongler, tire\u202f!', true); swaps = 0; } return; }
      aiming = true; aim = Math.atan2(y - CY, x - CX); cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', e => { const [x, y] = local(e); if (Math.hypot(x - CX, y - CY) > r * 2) aim = Math.atan2(y - CY, x - CX); });
    cv.addEventListener('pointerup', () => { if (aiming) { aiming = false; shoot(); } });
    updateSide(); requestAnimationFrame(frame);
  },
};

/* ═══════════ Piratage (inspiré du terminal de GTA V) ═══════════ */
MINIS.hack = {
  start(api) {
    const R = api.R, d = api.d, ROWS = 8, COLS = 10, L = ROWS * COLS;
    const rounds = 1 + Math.round(d * 2), speed = .45 + d * 1.15, total = Math.round(50 + rounds * 22 - d * 12), decoys = 2 + Math.round(d * 8);
    api.root.innerHTML = `<div class="hk-wrap"><div class="hk-head"><span class="hk-globe">🌐</span><div><b>CONNEXION À L’HÔTE</b><small>Compromettre la sécurité mondiale, un octet à la fois</small></div></div>
      <div class="hk-ip"></div><div class="hk-time">00:00:000</div><div class="hk-round"></div>
      <div class="hk-grid"></div><div class="hk-bar"><p class="hk-msg">Touche le premier nombre de l’adresse.</p><button class="btn hk-go">⏎ Connexion</button></div></div>`;
    const q = s => api.root.querySelector(s), gridEl = q('.hk-grid'), ipEl = q('.hk-ip'), timeEl = q('.hk-time'), msgEl = q('.hk-msg'), roundEl = q('.hk-round');
    const rowsEl = [], cellEls = [];
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div'); row.className = 'hk-row';
      const cellsRow = []; for (let c = 0; c <= COLS; c++) { const s = document.createElement('span'); s.className = 'hk-c'; s.dataset.r = r; s.dataset.c = c; row.appendChild(s); cellsRow.push(s); }
      gridEl.appendChild(row); rowsEl.push(row); cellEls.push(cellsRow);
    }
    const two = n => String(n).padStart(2, '0');
    let stream, target, at, sel = -1, offset = 0, left = total * 1000, done = 0, errors = 0, over = false, last = performance.now(), flash = 0;
    function newRound() {
      target = [0, 0, 0, 0].map(() => Math.floor(R() * 100));
      stream = Array.from({ length: L }, () => Math.floor(R() * 100));
      // fausses pistes : trois nombres sur quatre de la bonne adresse
      for (let k = 0; k < decoys; k++) {
        const p = Math.floor(R() * L), fake = target.slice(), miss = Math.floor(R() * 4);
        fake[miss] = (fake[miss] + 1 + Math.floor(R() * 98)) % 100; if (R() < .4) fake.reverse();
        fake.forEach((v, j) => { stream[(p + j) % L] = v; });
      }
      at = Math.floor(R() * L); target.forEach((v, j) => { stream[(at + j) % L] = v; });
      // la bonne adresse ne doit apparaître qu’une seule fois
      for (let p = 0; p < L; p++) if (p !== at && target.every((v, j) => stream[(p + j) % L] === v)) stream[(p + 1) % L] = (stream[(p + 1) % L] + 7) % 100;
      ipEl.textContent = target.map(two).join('.');
      roundEl.textContent = rounds > 1 ? `Adresse ${done + 1} sur ${rounds}` : '';
      sel = -1; api.stat(`${done}/${rounds} accès`);
    }
    function render() {
      const base = Math.floor(offset), frac = offset - base;
      for (let r = 0; r < ROWS; r++) {
        rowsEl[r].style.transform = `translateX(${-frac * 100 / (COLS + 1)}%)`;
        for (let c = 0; c <= COLS; c++) {
          const idx = ((base + r * COLS + c) % L + L) % L, el = cellEls[r][c];
          el.textContent = two(stream[idx]); el.dataset.idx = idx;
          const on = sel >= 0 && ((idx - sel + L) % L) < 4;
          el.classList.toggle('on', on);
        }
      }
    }
    function fmt(ms) { ms = Math.max(0, ms); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, x = Math.floor(ms % 1000); return `${two(m)}:${two(s)}:${String(x).padStart(3, '0')}`; }
    function tick(t) {
      if (!api.root.isConnected) return;
      const dt = Math.min(100, t - last); last = t;
      if (!over && !paused) {
        offset += speed * dt / 1000; left -= dt;
        if (left <= 0) { left = 0; over = true; msgEl.textContent = 'CONNEXION PERDUE'; api.root.querySelector('.hk-wrap').classList.add('fail'); api.lose('Connexion perdue', 'Le chrono est arrivé à zéro avant la fin du piratage. Retente ta chance\u202f!', 2400); }
      }
      timeEl.textContent = fmt(left); timeEl.classList.toggle('low', left < 10000);
      render(); requestAnimationFrame(tick);
    }
    gridEl.addEventListener('pointerdown', e => {
      const c = e.target.closest('.hk-c'); if (!c || over) return;
      sel = +c.dataset.idx; Sound.tap(); msgEl.textContent = 'Sélection prête : appuie sur « Connexion ».'; msgEl.className = 'hk-msg';
    });
    let ipTaps = 0;
    ipEl.addEventListener('click', () => { if (++ipTaps === 3 && typeof Ach !== 'undefined') { Ach.unlock('egg_ip'); React.say('hint', 'Adresse localisée : 127.0.0.1… c’est chez toi\u202f!', true); } });
    q('.hk-go').addEventListener('click', () => {
      if (over) return;
      if (sel < 0) { msgEl.textContent = 'Sélectionne d’abord le premier nombre de l’adresse.'; return; }
      const ok = target.every((v, j) => stream[(sel + j) % L] === v);
      const wrap = q('.hk-wrap'); wrap.classList.remove('ok', 'bad'); void wrap.offsetWidth;
      if (ok) {
        done++; Sound.found(); wrap.classList.add('ok'); msgEl.textContent = 'ACCÈS AUTORISÉ'; msgEl.className = 'hk-msg good';
        if (done >= rounds) { over = true; Sound.complete(); api.win(errors === 0 ? 3 : errors === 1 ? 2 : 1, [{ label: 'Erreurs', value: errors }, { label: 'Temps restant', value: `${Math.ceil(left / 1000)} s` }]); }
        else setTimeout(() => { if (!over) { newRound(); msgEl.textContent = 'Nouvelle adresse : trouve-la vite\u202f!'; msgEl.className = 'hk-msg'; } }, 900);
      } else {
        errors++; left -= 5000; Sound.wrong(); wrap.classList.add('bad'); msgEl.textContent = 'ACCÈS REFUSÉ : −5 secondes'; msgEl.className = 'hk-msg bad'; sel = -1;
      }
    });
    newRound(); requestAnimationFrame(t => { last = t; tick(t); });
  },
};

/* ═══════════ Flacons : tri des couleurs ═══════════ */
const LIQUIDS = ['#ff3b3b', '#2f7bff', '#ffd23a', '#2bd14f', '#b45cff', '#ff8a1f', '#ff5fb0', '#36d6e7', '#8a5a2a', '#e8ecf0'];
const CAP = 4;
function bottleMoves(st) {
  const out = [];
  st.forEach((a, i) => {
    if (!a.length) return; const top = a[a.length - 1];
    let run = 0; for (let k = a.length - 1; k >= 0 && a[k] === top; k--) run++;
    if (run === CAP) return;
    st.forEach((b, j) => {
      if (i === j || b.length >= CAP) return;
      if (b.length && b[b.length - 1] !== top) return;
      if (!b.length && run === a.length) return;
      out.push([i, j, Math.min(run, CAP - b.length)]);
    });
  });
  return out;
}
const bottlesSolved = st => st.every(a => !a.length || (a.length === CAP && a.every(x => x === a[0])));
function bottlesSolve(start, budget) {
  const seen = new Set(), key = st => st.map(a => a.join(',')).sort().join('|');
  let nodes = 0; const path = [];
  function dfs(st) {
    if (bottlesSolved(st)) return true;
    if (++nodes > budget) return false;
    const k = key(st); if (seen.has(k)) return false; seen.add(k);
    for (const [i, j, n] of bottleMoves(st)) {
      const nx = st.map(a => a.slice()); for (let t = 0; t < n; t++) nx[j].push(nx[i].pop());
      path.push([i, j]); if (dfs(nx)) return true; path.pop();
    }
    return false;
  }
  return dfs(start.map(a => a.slice())) ? path : null;
}
MINIS.bottles = {
  start(api) {
    const R = api.R, d = api.d, K = Math.min(LIQUIDS.length, 3 + Math.round(d * 7));
    let st, sol;
    for (let t = 0; t < 60; t++) {
      const units = []; for (let k = 0; k < K; k++) for (let j = 0; j < CAP; j++) units.push(k);
      for (let i = units.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [units[i], units[j]] = [units[j], units[i]]; }
      st = []; for (let k = 0; k < K; k++) st.push(units.slice(k * CAP, k * CAP + CAP)); st.push([], []);
      if (st.some(a => a.length === CAP && a.every(x => x === a[0]))) continue;
      sol = bottlesSolve(st, 60000); if (sol) break;
    }
    const ui = LK.shell(api, 'bottles', `Range les <b>${K} couleurs</b> : une seule couleur par flacon, 4 doses chacun.`);
    ui.clear.innerHTML = '↺ Recommencer';
    const startState = st.map(a => a.slice());
    ui.board.innerHTML = '<div class="bt-shelf"></div>'; const shelf = ui.board.firstChild;
    let selected = -1, busy = false, over = false, hints = 0, moves = 0, plan = sol ? { key: JSON.stringify(st), moves: sol.slice() } : null; const hist = [];
    function render() {
      shelf.innerHTML = st.map((a, i) => `<button class="bt ${i === selected ? 'sel' : ''} ${a.length === CAP && a.every(x => x === a[0]) ? 'full' : ''}" data-b="${i}">
        <span class="bt-cap"></span><span class="bt-glass">${a.map(k => `<i style="--c:${LIQUIDS[k]}"></i>`).join('')}</span></button>`).join('');
      shelf.style.setProperty('--per-row', Math.min(st.length, st.length > 8 ? Math.ceil(st.length / 2) : st.length));
      api.stat(`${st.filter(a => a.length === CAP && a.every(x => x === a[0])).length}/${K} flacons`);
    }
    async function pour(i, j) {
      const a = st[i], b = st[j]; if (!a.length || b.length >= CAP || (b.length && b[b.length - 1] !== a[a.length - 1])) return false;
      busy = true; hist.push(st.map(x => x.slice())); moves++;
      const els = shelf.querySelectorAll('.bt'), src = els[i], dst = els[j], rs = src.getBoundingClientRect(), rd = dst.getBoundingClientRect();
      const dx = rd.left - rs.left + (rd.left > rs.left ? -rs.width * .55 : rs.width * .55), dy = rd.top - rs.top - rs.height * .45;
      src.style.transition = 'transform .32s ease'; src.style.zIndex = 5; src.style.transform = `translate(${dx}px, ${dy}px) rotate(${rd.left > rs.left ? 70 : -70}deg)`;
      Sound.tap(); await sleep(340);
      const top = a[a.length - 1]; let n = 0; while (a.length && a[a.length - 1] === top && b.length < CAP) { b.push(a.pop()); n++; }
      dst.querySelector('.bt-glass').innerHTML = b.map(k => `<i style="--c:${LIQUIDS[k]}"></i>`).join('');
      src.querySelector('.bt-glass').innerHTML = a.map(k => `<i style="--c:${LIQUIDS[k]}"></i>`).join('');
      dst.classList.add('pouring'); await sleep(320);
      src.style.transform = ''; await sleep(320); src.style.zIndex = ''; src.style.transition = '';
      selected = -1; render(); busy = false;
      if (b.length === CAP && b.every(x => x === b[0])) Sound.found();
      if (bottlesSolved(st)) { over = true; Sound.complete(); LK.say(ui, 'Tout est trié\u202f!'); api.win(LK.stars(hints), [{ label: 'Coups', value: moves }, { label: 'Indices', value: hints }, { label: 'Couleurs', value: K }]); }
      return true;
    }
    shelf.addEventListener('click', async e => {
      const b = e.target.closest('.bt'); if (!b || busy || over) return; const i = +b.dataset.b;
      if (selected < 0) { if (!st[i].length) return; selected = i; Sound.tap(); render(); LK.say(ui, ''); return; }
      if (selected === i) { selected = -1; render(); return; }
      const ok = await pour(selected, i);
      if (!ok) { Sound.wrong(); LK.say(ui, 'On ne peut verser que sur la même couleur ou dans un flacon vide.', true); const el = shelf.querySelectorAll('.bt')[i]; el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); selected = -1; render(); }
    });
    ui.hint.addEventListener('click', async () => {
      if (busy || over) return;
      // on garde le plan de résolution tant que Papa suit les indices
      const key = JSON.stringify(st);
      if (!plan || plan.key !== key || !plan.moves.length) { const p = bottlesSolve(st, 150000); plan = p ? { key, moves: p } : null; }
      if (!plan) { LK.say(ui, 'Impasse\u202f! Annule quelques coups ou recommence.', true); Sound.wrong(); return; }
      hints++; Sound.hint(); LK.say(ui, 'Regarde ce versement…');
      selected = -1; const [i, j] = plan.moves.shift(); await pour(i, j); plan.key = JSON.stringify(st);
    });
    let undos = 0;
    ui.undo.addEventListener('click', () => { if (busy || over || !hist.length) return; st = hist.pop(); selected = -1; Sound.tap(); LK.say(ui, ''); render(); if (++undos === 10 && typeof Ach !== 'undefined') { Ach.unlock('egg_undo'); React.say('hint', 'Retour vers le futur\u202f!', true); } });
    ui.clear.addEventListener('click', () => { if (busy || over) return; hist.push(st.map(x => x.slice())); st = startState.map(a => a.slice()); selected = -1; Sound.tap(); LK.say(ui, ''); render(); });
    render();
  },
};
