// أربعة في صف: أسقط أقراصك في الأعمدة، وأول من يصل أربعة متتالية أفقيًا أو رأسيًا أو قطريًا يفوز.
import { h, t, addDict, sound, num, is3d, gloss } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';

addDict({
  ar: { c4_name: 'أربعة في صف', c4_draw: 'تعادل! امتلأت اللوحة.', c4_drop: 'اختر عمودًا لإسقاط قرصك', c4_size: 'حجم اللوحة', c4_classic: 'كلاسيكي 7×6', c4_big: 'كبير 9×7',
    c4_rules: '<ol><li>يتناوب اللاعبان على إسقاط قرص في أحد الأعمدة، فيستقر القرص في أدنى خانة فارغة.</li><li>الفائز أول من يصنع <b>أربعة أقراص متتالية</b> من لونه أفقيًا أو رأسيًا أو قطريًا.</li><li>إن امتلأت اللوحة دون فائز فالنتيجة تعادل.</li></ol><h4>ماذا تتعلم؟</h4><p>التخطيط المسبق، وتوقع حركة المنافس، والتفكير في أكثر من تهديد في الوقت نفسه.</p>' },
  en: { c4_name: 'Connect Four', c4_draw: 'Draw! The board is full.', c4_drop: 'Pick a column to drop your disc', c4_size: 'Board size', c4_classic: 'Classic 7×6', c4_big: 'Big 9×7',
    c4_rules: '<ol><li>Players take turns dropping a disc into a column; it falls to the lowest empty cell.</li><li>The first to make <b>four in a row</b> — horizontally, vertically or diagonally — wins.</li><li>If the board fills up, it is a draw.</li></ol>' },
});
const COLORS = ['#e53935', '#f2b705'];

function winLine(b, W, H, r, c) {
  const p = b[r][c]; if (p < 0) return null;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [[r, c]];
    for (const s of [1, -1]) { let rr = r + dr * s, cc = c + dc * s; while (rr >= 0 && rr < H && cc >= 0 && cc < W && b[rr][cc] === p) { line.push([rr, cc]); rr += dr * s; cc += dc * s; } }
    if (line.length >= 4) return line;
  }
  return null;
}
const dropRow = (b, H, c) => { for (let r = H - 1; r >= 0; r--) if (b[r][c] < 0) return r; return -1; };

// تقييم بسيط بالبحث (Minimax) للكمبيوتر
function score(b, W, H, me) {
  let s = 0; const op = 1 - me;
  const lines = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const cells = []; for (let k = 0; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= H || cc < 0 || cc >= W) break; cells.push(b[rr][cc]); }
    if (cells.length === 4) lines.push(cells);
  }
  for (const L of lines) { const m = L.filter(x => x === me).length, o = L.filter(x => x === op).length; if (m && !o) s += [0, 1, 6, 40, 10000][m]; if (o && !m) s -= [0, 1, 7, 50, 10000][o]; }
  const mid = Math.floor(W / 2); for (let r = 0; r < H; r++) if (b[r][mid] === me) s += 3;
  return s;
}
function search(b, W, H, turn, me, depth, alpha, beta) {
  const moves = [...Array(W).keys()].sort((a, c) => Math.abs(a - (W - 1) / 2) - Math.abs(c - (W - 1) / 2)).filter(c => dropRow(b, H, c) >= 0);
  if (!moves.length) return [0, null];
  if (depth === 0) return [score(b, W, H, me), null];
  let best = turn === me ? -Infinity : Infinity, bestC = moves[0];
  for (const c of moves) {
    const r = dropRow(b, H, c); b[r][c] = turn;
    let v;
    if (winLine(b, W, H, r, c)) v = (turn === me ? 1 : -1) * (100000 + depth);
    else v = search(b, W, H, 1 - turn, me, depth - 1, alpha, beta)[0];
    b[r][c] = -1;
    if (turn === me) { if (v > best) { best = v; bestC = c; } alpha = Math.max(alpha, v); }
    else { if (v < best) { best = v; bestC = c; } beta = Math.min(beta, v); }
    if (beta <= alpha) break;
  }
  return [best, bestC];
}

const def = {
  id: 'connect4', name: { ar: 'أربعة في صف', en: 'Connect Four' }, counts: [2], colors: COLORS,
  levels: [['easy', t('gk_easy')], ['mid', t('gk_mid')], ['hard', t('gk_hard')]],
  options: () => [{ key: 'size', label: t('c4_size'), choices: [['7', t('c4_classic')], ['9', t('c4_big')]], def: '7' }],
  rules: () => t('c4_rules'),
  init(players, o) { const W = o.size === '9' ? 9 : 7, H = o.size === '9' ? 7 : 6; return { W, H, b: Array.from({ length: H }, () => Array(W).fill(-1)), turn: 0, win: null, line: null, last: null, draw: false, players, starter: 0 }; },
  view: (s) => s,
  needs: (s) => (s.win != null || s.draw) ? [] : [s.turn],
  apply(s, seat, a) {
    const c = a.col | 0; if (c < 0 || c >= s.W) return t('gk_err');
    const r = dropRow(s.b, s.H, c); if (r < 0) return t('gk_err');
    s.b[r][c] = seat; s.last = [r, c];
    const line = winLine(s.b, s.W, s.H, r, c);
    if (line) { s.win = seat; s.line = line; }
    else if (s.b[0].every(x => x >= 0)) s.draw = true;
    else s.turn = 1 - seat;
    return null;
  },
  bot(s, seat, lv) {
    const b = s.b.map(r => r.slice());
    if (lv === 'easy' && Math.random() < 0.5) { const ok = [...Array(s.W).keys()].filter(c => dropRow(b, s.H, c) >= 0); return { col: ok[Math.floor(Math.random() * ok.length)] }; }
    return { col: search(b, s.W, s.H, seat, seat, lv === 'hard' ? 6 : 3, -Infinity, Infinity)[1] };
  },
  over: (s) => s.win != null || s.draw,
  result(s, seat) {
    if (s.draw) return { title: t('gk_gameOver'), big: t('c4_draw') };
    return { title: s.win === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[s.win].name }), win: s.win === seat };
  },
  status(v, ui) { if (v.win != null) return t('gk_winner', { name: ui.name(v.win) }); if (v.draw) return t('c4_draw'); return ui.myTurn ? t('c4_drop') : t('gk_turnOf', { name: ui.name(v.turn) }); },
  render(el, v, ui) {
    const { W, H } = v;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W * 10 + 4} ${H * 10 + 14}`); svg.setAttribute('class', 'c4-svg');
    const add = (tag, at, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); parent.append(e); return e; };
    const hole = add('defs', {}); { const lg = add('linearGradient', { id: 'c4g', x1: 0, y1: 0, x2: 0, y2: 1 }, hole); add('stop', { offset: 0, 'stop-color': '#3b7bff' }, lg); add('stop', { offset: .5, 'stop-color': '#1e5bd6' }, lg); add('stop', { offset: 1, 'stop-color': '#163f9e' }, lg); } const mask = add('mask', { id: 'c4m' }, hole); add('rect', { x: 0, y: 0, width: W * 10 + 4, height: H * 10 + 14, fill: '#fff' }, mask);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) add('circle', { cx: c * 10 + 7, cy: r * 10 + 17, r: 4.1, fill: '#000' }, mask);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (v.b[r][c] >= 0) {
      const isLast = v.last && v.last[0] === r && v.last[1] === c;
      const g = add('g', { class: isLast ? 'c4-drop' : '', style: `--fall:${-(r + 1) * 10 - 6}px` });
      add('circle', { cx: c * 10 + 7, cy: r * 10 + 17, r: 4.4, fill: COLORS[v.b[r][c]] }, g);
      add('circle', { cx: c * 10 + 7, cy: r * 10 + 17, r: 3, fill: 'none', stroke: 'rgba(0,0,0,.18)', 'stroke-width': .6 }, g);
      if (is3d()) add('circle', { cx: c * 10 + 7, cy: r * 10 + 17, r: 4.4, fill: gloss(svg) }, g);
    }
    add('rect', { x: 0, y: 10, width: W * 10 + 4, height: H * 10 + 4, rx: 3, fill: 'url(#c4g)', mask: 'url(#c4m)', class: 'c4-frame' });
    // حواف الثقوب: ظل داخلي ولمعة تعطي البلاستيك سماكة
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { add('circle', { cx: c * 10 + 7, cy: r * 10 + 17, r: 4.35, fill: 'none', stroke: '#0b2f80', 'stroke-width': .55 }); add('path', { d: `M ${c * 10 + 3.3} ${r * 10 + 19} A 4.3 4.3 0 0 0 ${c * 10 + 10.7} ${r * 10 + 19}`, fill: 'none', stroke: 'rgba(255,255,255,.45)', 'stroke-width': .5 }); }
    if (v.line) for (const [r, c] of v.line) add('circle', { cx: c * 10 + 7, cy: r * 10 + 17, r: 4.6, fill: 'none', stroke: '#fff', 'stroke-width': 1, class: 'c4-win' });
    const can = ui.myTurn && v.win == null && !v.draw;
    for (let c = 0; c < W; c++) {
      const full = dropRow(v.b, H, c) < 0;
      const col = add('g', { class: 'c4-col' + (can && !full ? ' can' : '') });
      add('rect', { x: c * 10 + 2, y: 0, width: 10, height: H * 10 + 14, fill: 'transparent' }, col);
      add('circle', { cx: c * 10 + 7, cy: 5, r: 3.8, fill: COLORS[ui.seat] || '#999', class: 'c4-ghost' }, col);
      if (can && !full) col.addEventListener('click', () => { sound('place'); ui.act({ col: c }); });
    }
    el.append(h('div', { class: 'c4-wrap' },
      h('div', { class: 'c4-side' }, ui.plate(0, h('span', { class: 'c4-dot', style: { background: COLORS[0] } })), ui.plate(1, h('span', { class: 'c4-dot', style: { background: COLORS[1] } }))),
      svg));
  },
  preview() { const d = h('div', { class: 'c4-prev' }); return d; },
};
delete def.preview;

export async function mount(root, ctx) {
  if (!document.getElementById('c4-css')) document.head.append(h('link', { id: 'c4-css', rel: 'stylesheet', href: new URL('./c4.css', import.meta.url).href }));
  return tableGame(root, ctx, def);
}
