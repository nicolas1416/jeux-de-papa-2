'use strict';
/* ═══════════ Les pièces pour papa : 100 composants et éléments de setup pour monter un PC ═══════════ */
const PC = (() => {
  const S = b => `<svg class="pc-ico" viewBox="0 0 64 64" aria-hidden="true">${b}</svg>`;
  const INK = '#0d1015', RGB = ['#ff3b3b', '#ff8a1f', '#ffd23a', '#2bd14f', '#36d6e7', '#2f7bff', '#b45cff'];
  const rainbow = (x, y, w, h) => RGB.map((c, i) => `<rect x="${x + i * w / 7}" y="${y}" width="${w / 7 + .3}" height="${h}" fill="${c}"/>`).join('');
  const ring = c => c === 'rgb' ? RGB[5] : c;
  return {
    cpu: c => S(`<g fill="#d8b040">${[...Array(6)].map((_, i) => `<rect x="${14 + i * 7}" y="6" width="3" height="7"/><rect x="${14 + i * 7}" y="51" width="3" height="7"/><rect x="6" y="${14 + i * 7}" width="7" height="3"/><rect x="51" y="${14 + i * 7}" width="7" height="3"/>`).join('')}</g>
      <rect x="11" y="11" width="42" height="42" rx="4" fill="#2a2f36" stroke="${INK}" stroke-width="2"/><rect x="17" y="17" width="30" height="30" rx="3" fill="#c8ced6"/>
      <rect x="21" y="35" width="22" height="5" rx="1" fill="${c}"/><path d="M21 21h8l-8 8z" fill="${c}"/>`),
    ram: (c, rgb) => S(`${rgb ? rainbow(6, 12, 52, 6) : ''}<rect x="4" y="${rgb ? 17 : 15}" width="56" height="${rgb ? 21 : 23}" rx="2" fill="${c}" stroke="${INK}" stroke-width="2"/>
      ${[...Array(6)].map((_, i) => `<rect x="${9 + i * 8.5}" y="27" width="6" height="8" fill="#14171c"/>`).join('')}
      <rect x="4" y="38" width="56" height="8" fill="#1d6a3a" stroke="${INK}" stroke-width="2"/><g fill="#d8b040">${[...Array(13)].map((_, i) => `<rect x="${7 + i * 4}" y="41" width="2.4" height="5"/>`).join('')}</g><rect x="30" y="40" width="3" height="7" fill="${INK}"/>`),
    gpu: (c, fans) => S(`<rect x="2" y="18" width="5" height="30" fill="#c8ced6" stroke="${INK}" stroke-width="1.5"/><rect x="16" y="46" width="28" height="5" fill="#d8b040"/>
      <rect x="6" y="16" width="56" height="31" rx="5" fill="#22262c" stroke="${INK}" stroke-width="2"/><path d="M6 22h56" stroke="${c}" stroke-width="3"/>
      ${fans ? [...Array(fans)].map((_, i) => { const x = fans === 1 ? 34 : fans === 2 ? 22 + i * 24 : 16 + i * 16.5; const r = fans === 3 ? 7.4 : 9.5; return `<circle cx="${x}" cy="33" r="${r}" fill="#101318" stroke="${c}" stroke-width="2"/><circle cx="${x}" cy="33" r="${r * .3}" fill="${c}"/><path d="M${x - r * .8} ${33}h${r * 1.6}M${x} ${33 - r * .8}v${r * 1.6}" stroke="#4a5058" stroke-width="1.5"/>`; }).join('')
        : `<rect x="14" y="26" width="40" height="15" rx="4" fill="${c}" opacity=".85"/><circle cx="20" cy="33" r="3" fill="#e8f4ff"/><circle cx="48" cy="33" r="3" fill="#e8f4ff"/>`}`),
    m2: c => S(`<rect x="4" y="24" width="56" height="16" rx="2" fill="#15181d" stroke="${INK}" stroke-width="2"/><rect x="10" y="27" width="24" height="10" rx="1" fill="${c}"/>
      <rect x="38" y="28" width="9" height="8" fill="#2a2f36"/><rect x="49" y="28" width="6" height="8" fill="#2a2f36"/><g fill="#d8b040">${[...Array(5)].map((_, i) => `<rect x="${55}" y="${26 + i * 2.6}" width="5" height="1.6"/>`).join('')}</g><circle cx="7" cy="32" r="2" fill="#c8ced6"/>`),
    ssd: c => S(`<rect x="12" y="6" width="40" height="52" rx="4" fill="#2a2f36" stroke="${INK}" stroke-width="2"/><rect x="16" y="12" width="32" height="24" rx="2" fill="${c}"/>
      <text x="32" y="29" font-size="10" font-weight="800" font-family="sans-serif" text-anchor="middle" fill="#fff">SSD</text><rect x="18" y="50" width="28" height="4" fill="#d8b040"/>`),
    hdd: c => S(`<rect x="10" y="4" width="44" height="56" rx="4" fill="#c8ced6" stroke="${INK}" stroke-width="2"/><circle cx="32" cy="27" r="17" fill="#e8ecf0" stroke="#8a939c" stroke-width="2"/>
      <circle cx="32" cy="27" r="4" fill="#8a939c"/><path d="M48 50 L36 30" stroke="${c}" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="50" r="3.5" fill="#4a5058"/>`),
    psu: c => S(`<rect x="5" y="10" width="54" height="44" rx="4" fill="#22262c" stroke="${INK}" stroke-width="2"/><circle cx="28" cy="32" r="16" fill="#101318" stroke="#4a5058" stroke-width="2"/>
      ${[...Array(5)].map((_, i) => `<path d="M${16 + i * 6} 22v20" stroke="#4a5058" stroke-width="1.5"/>`).join('')}<rect x="48" y="16" width="7" height="10" rx="1" fill="#0a0c10" stroke="#4a5058"/><rect x="47" y="40" width="9" height="8" rx="1" fill="${c}"/>`),
    fan: c => S(`<rect x="5" y="5" width="54" height="54" rx="9" fill="#16191e" stroke="${INK}" stroke-width="2"/>
      ${c === 'rgb' ? RGB.map((col, i) => `<path d="M32 32 L${32 + 23 * Math.cos(i * .9)} ${32 + 23 * Math.sin(i * .9)} A23 23 0 0 1 ${32 + 23 * Math.cos(i * .9 + .9)} ${32 + 23 * Math.sin(i * .9 + .9)}z" fill="${col}"/>`).join('') + '<circle cx="32" cy="32" r="19" fill="#16191e"/>' : `<circle cx="32" cy="32" r="22" fill="none" stroke="${c}" stroke-width="4"/>`}
      ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="32" cy="21" rx="6" ry="11" fill="#7a838c" transform="rotate(${a} 32 32)"/>`).join('')}<circle cx="32" cy="32" r="6" fill="#2a2f36" stroke="${ring(c)}" stroke-width="2"/>
      ${[[10, 10], [54, 10], [10, 54], [54, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#4a5058"/>`).join('')}`),
    aircooler: c => S(`${[...Array(11)].map((_, i) => `<rect x="20" y="${7 + i * 4}" width="36" height="2.2" fill="${c}"/>`).join('')}<rect x="20" y="6" width="36" height="46" fill="none" stroke="${INK}" stroke-width="2"/>
      <rect x="6" y="10" width="16" height="40" rx="3" fill="#22262c" stroke="${INK}" stroke-width="2"/><circle cx="14" cy="30" r="6" fill="none" stroke="#38c8f5" stroke-width="2"/><path d="M28 52v8M38 52v8M48 52v8" stroke="#c8783a" stroke-width="3"/>`),
    aio: (c, n) => S(`<rect x="4" y="6" width="56" height="${n === 3 ? 20 : 20}" rx="3" fill="#22262c" stroke="${INK}" stroke-width="2"/>
      ${[...Array(n)].map((_, i) => { const x = n === 3 ? 13.5 + i * 18.5 : 18 + i * 28; return `<circle cx="${x}" cy="16" r="${n === 3 ? 7.5 : 8.5}" fill="#101318" stroke="${c}" stroke-width="2.4"/>`; }).join('')}
      <path d="M22 26 C22 40 26 44 28 48 M42 26 C42 40 38 44 36 48" stroke="#2a2f36" stroke-width="4" fill="none"/><circle cx="32" cy="52" r="10" fill="#14171c" stroke="${c}" stroke-width="3"/><circle cx="32" cy="52" r="4" fill="${c}"/>`),
    waterblock: c => S(`<rect x="12" y="12" width="40" height="40" rx="7" fill="rgba(220,240,255,.35)" stroke="#c8ced6" stroke-width="3"/><circle cx="32" cy="32" r="12" fill="${c}"/><circle cx="32" cy="32" r="6" fill="#e8f8ff" opacity=".8"/>
      <rect x="18" y="4" width="8" height="9" rx="2" fill="#2a2f36"/><rect x="38" y="4" width="8" height="9" rx="2" fill="#2a2f36"/>`),
    pump: c => S(`<rect x="20" y="4" width="24" height="54" rx="10" fill="rgba(220,240,255,.25)" stroke="#c8ced6" stroke-width="3"/><rect x="23" y="22" width="18" height="33" rx="7" fill="${c}"/>
      <rect x="22" y="4" width="20" height="6" rx="2" fill="#2a2f36"/><circle cx="29" cy="34" r="2" fill="#fff" opacity=".7"/><circle cx="35" cy="44" r="1.5" fill="#fff" opacity=".7"/>`),
    tubes: c => S(`<path d="M6 14 H40 a10 10 0 0 1 10 10 V58" fill="none" stroke="rgba(220,240,255,.55)" stroke-width="9" stroke-linecap="round"/><path d="M6 14 H40 a10 10 0 0 1 10 10 V58" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
      <path d="M6 34 H22 a6 6 0 0 1 6 6 V58" fill="none" stroke="rgba(220,240,255,.55)" stroke-width="9" stroke-linecap="round"/><path d="M6 34 H22 a6 6 0 0 1 6 6 V58" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`),
    coolant: c => S(`<rect x="26" y="4" width="12" height="8" rx="2" fill="#2a2f36"/><path d="M24 12h16l4 8v34a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V20z" fill="rgba(220,240,255,.3)" stroke="#c8ced6" stroke-width="2.5"/>
      <path d="M21 28h22v26a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3z" fill="${c}"/><rect x="24" y="34" width="16" height="10" rx="1" fill="#fff" opacity=".85"/>`),
    thermal: () => S(`<rect x="8" y="26" width="38" height="12" rx="3" fill="#e8ecf0" stroke="${INK}" stroke-width="2"/><rect x="10" y="28" width="26" height="8" fill="#9aa3ad"/>
      <path d="M46 29h8l4 3-4 3h-8z" fill="#c8ced6" stroke="${INK}" stroke-width="1.5"/><rect x="2" y="24" width="6" height="16" rx="1" fill="#4a5058"/>`),
    mobo: c => S(`<rect x="6" y="6" width="52" height="52" rx="2" fill="#14181d" stroke="${INK}" stroke-width="2"/><path d="M10 14h14M10 18h10M40 52h14M30 30h8v12" stroke="${c}" stroke-width="1.6" fill="none"/>
      <rect x="20" y="12" width="16" height="16" fill="#c8ced6"/><rect x="40" y="10" width="3" height="22" fill="${c}"/><rect x="46" y="10" width="3" height="22" fill="${c}"/>
      <rect x="10" y="38" width="30" height="4" fill="#2a2f36"/><rect x="10" y="46" width="30" height="4" fill="#2a2f36"/><rect x="9" y="22" width="8" height="12" fill="#22262c"/>`),
    tower: c => S(`<rect x="14" y="3" width="38" height="58" rx="3" fill="#16191e" stroke="${INK}" stroke-width="2"/><rect x="18" y="7" width="30" height="50" rx="2" fill="rgba(120,160,200,.15)" stroke="#4a5058"/>
      ${[16, 31, 46].map((y, i) => `<circle cx="33" cy="${y}" r="6.5" fill="none" stroke="${c === 'rgb' ? RGB[i * 2 + 1] : c}" stroke-width="2.5"/>`).join('')}<rect x="14" y="58" width="6" height="3" fill="#4a5058"/><rect x="46" y="58" width="6" height="3" fill="#4a5058"/>`),
    cable: c => S(`${[0, 7, 14].map(o => `<path d="M6 ${20 + o} C20 ${4 + o} 44 ${40 + o} 58 ${24 + o}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M6 ${20 + o} C20 ${4 + o} 44 ${40 + o} 58 ${24 + o}" fill="none" stroke="#000" stroke-width="5" stroke-dasharray="1 3" opacity=".25"/>`).join('')}
      <rect x="2" y="16" width="8" height="24" rx="2" fill="#2a2f36"/><rect x="54" y="20" width="8" height="24" rx="2" fill="#2a2f36"/>`),
    strip: () => S(`<rect x="4" y="26" width="56" height="12" rx="3" fill="#1a1d22" stroke="${INK}" stroke-width="2"/>${RGB.map((c, i) => `<circle cx="${9 + i * 7.6}" cy="32" r="3" fill="${c}"/><circle cx="${9 + i * 7.6}" cy="32" r="6" fill="${c}" opacity=".25"/>`).join('')}`),
    rgbctrl: c => S(`<rect x="12" y="16" width="40" height="32" rx="5" fill="#22262c" stroke="${INK}" stroke-width="2"/>${RGB.slice(0, 6).map((col, i) => `<rect x="${16 + i * 5.6}" y="22" width="3.5" height="6" fill="${col}"/>`).join('')}
      <circle cx="32" cy="38" r="5" fill="${c}"/><path d="M4 30h8M52 30h8" stroke="#4a5058" stroke-width="3"/>`),
    card: (c, label) => S(`<rect x="2" y="12" width="5" height="34" fill="#c8ced6" stroke="${INK}" stroke-width="1.5"/><rect x="6" y="14" width="50" height="28" rx="2" fill="#1d4a30" stroke="${INK}" stroke-width="2"/>
      <rect x="24" y="42" width="24" height="5" fill="#d8b040"/><rect x="12" y="19" width="14" height="14" fill="#14171c"/><rect x="30" y="20" width="22" height="12" rx="2" fill="${c}"/>
      <text x="41" y="29" font-size="7" font-weight="800" font-family="sans-serif" text-anchor="middle" fill="#fff">${label}</text>${label === 'WiFi' ? '<path d="M4 12V2M4 2l-2 3M4 2l2 3" stroke="#4a5058" stroke-width="2"/>' : ''}`),
    kb: c => S(`<rect x="3" y="18" width="58" height="28" rx="4" fill="#1a1d22" stroke="${INK}" stroke-width="2"/>${c === 'rgb' ? rainbow(4, 44, 56, 3) : ''}
      ${[0, 1, 2].map(r => [...Array(r === 2 ? 3 : 9)].map((_, i) => r === 2 ? `<rect x="${i === 1 ? 18 : i ? 46 : 8}" y="38" width="${i === 1 ? 26 : 8}" height="5" rx="1" fill="${c === 'rgb' ? RGB[i * 2] : c}"/>` : `<rect x="${7 + i * 5.7}" y="${22 + r * 8}" width="4.4" height="5" rx="1" fill="${c === 'rgb' ? RGB[(i + r) % 7] : c}"/>`).join('')).join('')}`),
    mouse: c => S(`<path d="M32 4 C32 4 32 12 34 14" stroke="#4a5058" stroke-width="2" fill="none"/><path d="M18 30 a14 18 0 0 1 28 0 v12 a14 16 0 0 1 -28 0z" fill="#1a1d22" stroke="${INK}" stroke-width="2"/>
      <path d="M32 13v17M18 30h28" stroke="#4a5058" stroke-width="1.5"/><rect x="30" y="18" width="4" height="8" rx="2" fill="${c}"/><path d="M20 48 a12 12 0 0 0 24 0" stroke="${c}" stroke-width="2.5" fill="none"/>`),
    mat: c => S(`<rect x="3" y="14" width="58" height="36" rx="5" fill="#16191e" stroke="${c}" stroke-width="3"/><path d="M10 40 q12 -14 22 -4 t22 -10" stroke="${c}" stroke-width="2" fill="none" opacity=".6"/><path d="M46 22 a5 6 0 0 1 10 0 v4 a5 6 0 0 1 -10 0z" fill="#2a2f36"/>`),
    curved: c => S(`<path d="M4 12 Q32 6 60 12 V40 Q32 34 4 40z" fill="#0d1015" stroke="#4a5058" stroke-width="2"/><path d="M8 15 Q32 10 56 15 V37 Q32 32 8 37z" fill="${c}" opacity=".85"/><path d="M28 39v12M20 54h24" stroke="#4a5058" stroke-width="4" stroke-linecap="round"/>`),
    desk: c => S(`<rect x="4" y="28" width="56" height="7" rx="2" fill="#22262c" stroke="${INK}" stroke-width="2"/><rect x="4" y="34" width="56" height="2" fill="${c}"/><path d="M10 35v22M54 35v22M6 57h10M48 57h10" stroke="#2a2f36" stroke-width="4"/>
      <rect x="20" y="10" width="24" height="16" rx="2" fill="#0d1015" stroke="#4a5058" stroke-width="2"/><rect x="22" y="12" width="20" height="12" fill="${c}" opacity=".7"/>`),
    arm: c => S(`<rect x="34" y="8" width="26" height="18" rx="2" fill="#0d1015" stroke="#4a5058" stroke-width="2"/><rect x="36" y="10" width="22" height="14" fill="${c}" opacity=".7"/>
      <path d="M10 58V40l14-10 12-8" stroke="#8a939c" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="40" r="4" fill="#4a5058"/><circle cx="24" cy="30" r="4" fill="#4a5058"/><rect x="2" y="56" width="20" height="5" rx="2" fill="#2a2f36"/>`),
    hub: c => S(`<rect x="8" y="22" width="48" height="20" rx="6" fill="#22262c" stroke="${INK}" stroke-width="2"/>${[0, 1, 2, 3].map(i => `<rect x="${14 + i * 10}" y="28" width="7" height="4" fill="#0a0c10" stroke="${c}"/>`).join('')}
      <circle cx="50" cy="38" r="1.6" fill="${c}"/><path d="M8 32 C2 32 2 48 10 52" stroke="#2a2f36" stroke-width="3" fill="none"/>`),
  };
})();

const PIECES = [
  // Processeurs
  [PC.cpu('#38c8f5'), 'Processeur 4 cœurs', 'Le Débutant'], [PC.cpu('#39e58c'), 'Processeur 6 cœurs', 'Juste Ce Qu’il Faut'], [PC.cpu('#ffd36a'), 'Processeur 8 cœurs', 'Le Polyvalent'],
  [PC.cpu('#ff4fa8'), 'Processeur 16 cœurs', 'Bête de Course'], [PC.cpu('#b46cff'), 'Processeur 24 cœurs', 'Le Cerveau'], [PC.cpu('#ff3b3b'), 'Processeur overclocké', 'Chauffe Qui Peut'],
  // Cartes graphiques
  [PC.gpu('#38c8f5', 1), 'Carte graphique compacte', 'Petit Format'], [PC.gpu('#39e58c', 2), 'Carte graphique double ventilo', 'Le Jumeau'], [PC.gpu('#ff3b3b', 3), 'Carte graphique triple ventilo', 'Trois Turbines'],
  [PC.gpu('#e8ecf0', 3), 'Carte graphique blanche', 'Édition Neige'], [PC.gpu('#b46cff', 3), 'Carte graphique RGB', 'Arc-en-Ciel'], [PC.gpu('#ffd36a', 2), 'Carte graphique d’occasion', 'Seconde Vie'],
  [PC.gpu('#ff8a1f', 3), 'Carte graphique ray tracing', 'Reflets Parfaits'], [PC.gpu('#36d6e7', 0), 'Carte graphique watercoolée', 'Toujours au Frais'],
  // Mémoire
  [PC.ram('#2a2f36'), 'Barrette de RAM 8 Go', 'Le Strict Minimum'], [PC.ram('#1d4fa8'), 'Barrette de RAM 16 Go', 'Bon Élève'], [PC.ram('#c81a1a'), 'Barrette de RAM 32 Go', 'Mille Onglets'],
  [PC.ram('#7a2ab8'), 'Barrette de RAM 64 Go', 'Mémoire d’Éléphant'], [PC.ram('#2a2f36', true), 'Barrette de RAM RGB', 'Discothèque'], [PC.ram('#e8ecf0', true), 'Barrette de RAM blanche', 'Flocon'],
  // Stockage
  [PC.m2('#38c8f5'), 'SSD NVMe 1 To', 'Éclair'], [PC.m2('#ff4fa8'), 'SSD NVMe 2 To', 'Turbo'], [PC.m2('#ffd36a'), 'SSD NVMe 4 To', 'Ludothèque Géante'],
  [PC.ssd('#39e58c'), 'SSD SATA', 'Le Fiable'], [PC.hdd('#38c8f5'), 'Disque dur 2 To', 'Grattouille'], [PC.hdd('#ff8a1f'), 'Disque dur 8 To', 'L’Archiviste'],
  ['💾', 'Disquette de secours', 'Souvenir 1,44 Mo'], ['🧊', 'Dissipateur M.2', 'Coup de Froid'],
  // Cartes mères
  [PC.mobo('#38c8f5'), 'Carte mère ATX', 'La Grande Base'], [PC.mobo('#39e58c'), 'Carte mère micro-ATX', 'Format Malin'], [PC.mobo('#ff4fa8'), 'Carte mère mini-ITX', 'Mini Mais Costaud'], [PC.mobo('#ff3b3b'), 'Carte mère gaming', 'Centrale RGB'],
  // Alimentation
  [PC.psu('#39e58c'), 'Alimentation 650 W', 'La Sage'], [PC.psu('#ffd36a'), 'Alimentation 850 W', 'Or Massif'], [PC.psu('#ff3b3b'), 'Alimentation 1200 W', 'Centrale Nucléaire'], [PC.cable('#ff4fa8'), 'Kit de câbles gainés', 'Spaghettis de Luxe'],
  // Refroidissement
  [PC.fan('#38c8f5'), 'Ventilateur 120 mm', 'Petite Brise'], [PC.fan('#ff4fa8'), 'Ventilateur 140 mm', 'Grand Vent'], [PC.fan('rgb'), 'Ventilateur RGB', 'Tourbillon Disco'],
  [PC.aircooler('#c8ced6'), 'Ventirad', 'Tour de Glace'], [PC.aio('#38c8f5', 2), 'Watercooling AIO 240', 'Le Frais'], [PC.aio('#b46cff', 3), 'Watercooling AIO 360', 'Banquise'],
  [PC.waterblock('#36d6e7'), 'Waterblock processeur', 'Bloc de Glace'], [PC.pump('#ff4fa8'), 'Réservoir et pompe', 'Cœur Liquide'], [PC.tubes('#38c8f5'), 'Tuyauterie rigide', 'Plomberie Fine'],
  [PC.coolant('#b46cff'), 'Liquide de refroidissement', 'Potion Violette'], [PC.thermal(), 'Pâte thermique', 'Dentifrice du PC'], ['❄️', 'Radiateur 480 mm', 'Pôle Nord'],
  // Boîtier et montage
  [PC.tower('#38c8f5'), 'Boîtier moyen tour', 'La Maison'], [PC.tower('#ff4fa8'), 'Boîtier vitré', 'La Vitrine'], [PC.tower('rgb'), 'Boîtier aquarium', 'L’Aquarium'],
  [PC.strip(), 'Bande LED RGB', 'Guirlande Geek'], [PC.rgbctrl('#39e58c'), 'Contrôleur RGB', 'Chef d’Orchestre'], ['🔩', 'Boîte de vis', 'Toujours Une de Trop'],
  ['🪛', 'Tournevis aimanté', 'Fidèle Assistant'], ['⚡', 'Bracelet antistatique', 'Anti-Zap'],
  // Cartes d’extension
  [PC.card('#38c8f5', 'WiFi'), 'Carte Wi-Fi', 'Antennes Magiques'], [PC.card('#ffd36a', 'SON'), 'Carte son', 'Haute Fidélité'], [PC.card('#ff3b3b', 'REC'), 'Carte d’acquisition', 'Studio de Stream'], [PC.card('#39e58c', 'LAN'), 'Carte réseau', 'L’Autoroute'],
  // Périphériques
  ['⌨️', 'Clavier mécanique', 'Clic-Clac Royal'], [PC.kb('rgb'), 'Clavier RGB', 'Arc-en-Touches'], ['🖱️', 'Souris gaming', 'Viseur Précis'], [PC.mouse('#38c8f5'), 'Souris sans fil', 'Liberté'],
  [PC.mat('#ff4fa8'), 'Tapis de souris XXL', 'Terrain de Foot'], ['🎧', 'Casque gaming', 'Bulle Sonore'], ['🎙️', 'Micro de streaming', 'La Voix'], ['📷', 'Webcam', 'Œil du Stream'],
  ['🖥️', 'Écran 27 pouces', 'Fenêtre sur le Jeu'], [PC.curved('#2f7bff'), 'Écran incurvé', 'Panoramique'], ['📺', 'Second écran', 'Le Copilote'], ['🔊', 'Enceinte', 'Boum-Boum'],
  ['🎮', 'Manette', 'Pouces Agiles'], ['🕹️', 'Joystick d’arcade', 'Rétro Power'], ['🥽', 'Casque de réalité virtuelle', 'Autre Monde'], ['🎛️', 'Panneau de raccourcis', 'Boutons Magiques'],
  // Setup du bureau
  [PC.desk('#38c8f5'), 'Bureau gaming', 'QG de Papa'], ['🪑', 'Chaise gamer', 'Le Trône'], ['💡', 'Lampe de bureau', 'Idée Lumineuse'], [PC.arm('#39e58c'), 'Bras d’écran', 'Bras Articulé'],
  ['🪝', 'Support de casque', 'Le Crochet'], ['🪴', 'Plante de bureau', 'Coin Vert'], ['☕', 'Tasse de café', 'Carburant'], ['🥤', 'Canette énergisante', 'Nuit Blanche'],
  ['🍕', 'Pizza de LAN', 'Quatre Fromages'], ['🔌', 'Multiprise', 'Tout Branché'], [PC.hub('#36d6e7'), 'Hub USB', 'La Pieuvre'], ['📶', 'Routeur Wi-Fi', 'Cinq Barres'],
  ['🔋', 'Onduleur', 'Anti-Coupure'], ['🖨️', 'Imprimante', 'Bourrage Papier'], ['🤖', 'Figurine robot', 'Le Gardien'], ['👾', 'Néon Space Invader', 'Lumière Rétro'],
  ['🗒️', 'Bloc de Post-it', 'Pense-Bête'], ['⏰', 'Horloge de bureau', 'Encore Une Partie'], ['📚', 'Étagère de manuels', 'Bibliothèque Tech'],
  // Logiciels
  ['🪟', 'Système d’exploitation', 'Les Fenêtres'], ['🐧', 'Distribution Linux', 'Le Pingouin'], ['🛡️', 'Antivirus', 'Garde du Corps'], ['💿', 'CD de pilotes', 'Galette d’Installation'], ['🔑', 'Clé de jeu vidéo', 'Le Sésame'],
];
const PIECES_BONUS = [
  [PC.gpu('#ffd36a', 3), 'Carte graphique édition or', 'Trésor Graphique'], [PC.cpu('#ffd36a'), 'Processeur prototype', 'Échantillon Secret'], [PC.ram('#ffd36a', true), 'RAM plaquée or', 'Mémoire en Or'],
  [PC.tower('#ffd36a'), 'Boîtier collector', 'Pièce de Musée'], [PC.kb('#ffd36a'), 'Clavier en titane doré', 'Frappe Royale'], [PC.fan('#ffd36a'), 'Ventilateur doré', 'Brise d’Or'],
  [PC.cpu('#36d6e7'), 'Puce quantique', 'Le Qubit'], ['🛸', 'Refroidissement à l’azote', 'Givre Extrême'], [PC.m2('#ffd36a'), 'SSD de l’espace', 'Vitesse Lumière'],
  ['🏆', 'Trophée d’overclocking', 'Record du Monde'], ['🧬', 'Carte mère expérimentale', 'ADN du PC'], ['🎒', 'Sac de papa', 'Souvenir de la V1'],
];
// on remplace le contenu de la collection de la V1
ANIMALS.length = 0; PIECES.forEach(p => ANIMALS.push(p));
BONUS.length = 0; PIECES_BONUS.forEach(p => BONUS.push(p));
FEMININE.clear();
['Carte graphique compacte', 'Carte graphique double ventilo', 'Carte graphique triple ventilo', 'Carte graphique blanche', 'Carte graphique RGB', 'Carte graphique d’occasion', 'Carte graphique ray tracing', 'Carte graphique watercoolée',
  'Barrette de RAM 8 Go', 'Barrette de RAM 16 Go', 'Barrette de RAM 32 Go', 'Barrette de RAM 64 Go', 'Barrette de RAM RGB', 'Barrette de RAM blanche', 'Disquette de secours',
  'Carte mère ATX', 'Carte mère micro-ATX', 'Carte mère mini-ITX', 'Carte mère gaming', 'Alimentation 650 W', 'Alimentation 850 W', 'Alimentation 1200 W',
  'Tuyauterie rigide', 'Pâte thermique', 'Bande LED RGB', 'Boîte de vis', 'Carte Wi-Fi', 'Carte son', 'Carte d’acquisition', 'Carte réseau', 'Souris gaming', 'Souris sans fil', 'Webcam', 'Enceinte', 'Manette',
  'Chaise gamer', 'Lampe de bureau', 'Plante de bureau', 'Tasse de café', 'Canette énergisante', 'Pizza de LAN', 'Multiprise', 'Imprimante', 'Figurine robot', 'Horloge de bureau', 'Étagère de manuels', 'Distribution Linux', 'Clé de jeu vidéo'].forEach(n => FEMININE.add(n));
ELISION.clear();
['Alimentation 650 W', 'Alimentation 850 W', 'Alimentation 1200 W', 'Écran 27 pouces', 'Écran incurvé', 'Enceinte', 'Étagère de manuels', 'Antivirus', 'Onduleur', 'Imprimante', 'Horloge de bureau'].forEach(n => ELISION.add(n));
