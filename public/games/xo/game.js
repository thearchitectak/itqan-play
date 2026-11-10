// إكس-أو: الكلاسيكية 3×3، والمطوّرة 5×5 (أربعة في صف)، والعملاقة 7×7 (خمسة في صف).
import { h, t, addDict, sound } from '../../assets/js/core.js';
import { tableGame, pick } from '../../assets/js/gamekit.js';

addDict({
  ar: { xo_size: 'حجم اللوحة', xo_3: 'كلاسيكية 3×3', xo_5: 'مطوّرة 5×5 (أربعة في صف)', xo_7: 'عملاقة 7×7 (خمسة في صف)', xo_draw: 'تعادل!', xo_pick: 'اختر خانة',
    xo_rules: '<ol><li>يضع كل لاعب رمزه (X أو O) في خانة فارغة بالتناوب.</li><li>في اللوحة الكلاسيكية يفوز من يكمل 3 في صف أفقيًا أو رأسيًا أو قطريًا، وفي 5×5 أربعة، وفي 7×7 خمسة.</li><li>يتناوب اللاعبان على البدء في كل جولة.</li></ol><h4>ماذا تتعلم؟</h4><p>التفكير المسبق، وصنع تهديدين في وقت واحد، وسد طريق المنافس.</p>' },
  en: { xo_size: 'Board', xo_3: 'Classic 3×3', xo_5: 'Advanced 5×5 (four in a row)', xo_7: 'Giant 7×7 (five in a row)', xo_draw: 'Draw!', xo_pick: 'Pick a cell',
    xo_rules: '<ol><li>Take turns placing your mark in an empty cell.</li><li>Get 3 in a row on 3×3, 4 on 5×5, or 5 on 7×7.</li></ol>' },
});
const COLORS = ['#2563eb', '#e11d48'];
const MARK = ['✕', '◯'];
function lineAt(b, N, K, i) {
  const p = b[i]; if (p < 0) return null; const r = Math.floor(i / N), c = i % N;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const L = [i];
    for (const s of [1, -1]) { let rr = r + dr * s, cc = c + dc * s; while (rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr * N + cc] === p) { L.push(rr * N + cc); rr += dr * s; cc += dc * s; } }
    if (L.length >= K) return L;
  }
  return null;
}
const MEMO = new Map();
function minimax(b, turn, me, depth) {
  const key = b.join(',') + turn + me;
  if (MEMO.has(key)) { const [v, i] = MEMO.get(key); return [v > 0 ? v - depth : v < 0 ? v + depth : 0, i]; }
  const r = minimax0(b, turn, me, depth);
  MEMO.set(key, [r[0] > 0 ? r[0] + depth : r[0] < 0 ? r[0] - depth : 0, r[1]]);
  return r;
}
function minimax0(b, turn, me, depth) {
  for (let i = 0; i < 9; i++) if (b[i] >= 0 && lineAt(b, 3, 3, i)) return [b[i] === me ? 10 - depth : depth - 10, -1];
  const empty = b.map((x, i) => x < 0 ? i : -1).filter(i => i >= 0);
  if (!empty.length) return [0, -1];
  let best = turn === me ? -99 : 99, bi = empty[0];
  for (const i of empty) { b[i] = turn; const [v] = minimax(b, 1 - turn, me, depth + 1); b[i] = -1; if (turn === me ? v > best : v < best) { best = v; bi = i; } }
  return [best, bi];
}
function heur(b, N, K, me) {
  // يختار الخانة الأعلى قيمة: فوز، سد فوز، ثم بناء خطوط
  const empty = b.map((x, i) => x < 0 ? i : -1).filter(i => i >= 0);
  for (const who of [me, 1 - me]) for (const i of empty) { b[i] = who; const w = lineAt(b, N, K, i); b[i] = -1; if (w) return i; }
  let best = -1, bv = -Infinity;
  for (const i of empty) {
    let v = 0; const r = Math.floor(i / N), c = i % N;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) for (let off = -(K - 1); off <= 0; off++) {
      let mine = 0, opp = 0, ok = true;
      for (let k = 0; k < K; k++) { const rr = r + dr * (off + k), cc = c + dc * (off + k); if (rr < 0 || rr >= N || cc < 0 || cc >= N) { ok = false; break; } const x = b[rr * N + cc]; if (x === me) mine++; else if (x === 1 - me) opp++; }
      if (!ok) continue; if (!opp) v += [1, 4, 20, 120, 900][mine] || 900; if (!mine) v += [1, 3, 15, 100, 700][opp] || 700;
    }
    v -= (Math.abs(r - (N - 1) / 2) + Math.abs(c - (N - 1) / 2)) * .3;
    if (v > bv) { bv = v; best = i; }
  }
  return best;
}
const def = {
  id: 'xo', name: { ar: 'إكس-أو', en: 'Tic-Tac-Toe' }, counts: [2], colors: COLORS, botDelay: 600,
  options: () => [{ key: 'size', label: t('xo_size'), choices: [['3', t('xo_3')], ['5', t('xo_5')], ['7', t('xo_7')]], def: '3', wide: true }],
  rules: () => t('xo_rules'),
  init(players, o) { const N = +o.size || 3; return { N, K: N === 3 ? 3 : N === 5 ? 4 : 5, b: Array(N * N).fill(-1), turn: 0, win: null, line: null, draw: false, players, score: [0, 0], round: 1, starter: 0, last: -1 }; },
  view: (s) => s,
  needs: (s) => s.win != null || s.draw ? (s.round < 5 && !s.final ? [0] : []) : [s.turn],
  apply(s, seat, a) {
    if (s.win != null || s.draw) { if (a.type !== 'next') return t('gk_err'); s.b.fill(-1); s.win = null; s.line = null; s.draw = false; s.starter = 1 - s.starter; s.turn = s.starter; s.round++; s.last = -1; return null; }
    const i = a.i | 0; if (s.b[i] !== -1) return t('gk_err');
    s.b[i] = seat; s.last = i;
    const L = lineAt(s.b, s.N, s.K, i);
    if (L) { s.win = seat; s.line = L; s.score[seat]++; }
    else if (s.b.every(x => x >= 0)) s.draw = true;
    else s.turn = 1 - seat;
    if ((s.win != null || s.draw) && (s.round >= 5 || s.score.some(x => x >= 3))) s.final = true;
    return null;
  },
  bot(s, seat, lv) {
    if (s.win != null || s.draw) return { type: 'next' };
    const empty = s.b.map((x, i) => x < 0 ? i : -1).filter(i => i >= 0);
    if (lv === 'easy' && Math.random() < .5) return { i: pick(empty) };
    if (s.N === 3) return { i: minimax(s.b.slice(), seat, seat, 0)[1] };
    return { i: heur(s.b.slice(), s.N, s.K, seat) };
  },
  botDelay: (s) => s.win != null || s.draw ? 2200 : 600,
  over: (s) => !!s.final,
  result(s, seat) {
    const w = s.score[0] === s.score[1] ? null : s.score[0] > s.score[1] ? 0 : 1;
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: w == null ? t('xo_draw') : t('gk_winner', { name: s.players[w].name }), win: w == null ? undefined : w === seat,
      lines: [0, 1].map(i => ({ label: MARK[i] + ' ' + s.players[i].name, value: s.score[i], color: COLORS[i] })) };
  },
  status(v, ui) { if (v.win != null) return t('gk_winner', { name: ui.name(v.win) }); if (v.draw) return t('xo_draw'); return ui.myTurn ? t('xo_pick') : t('gk_turnOf', { name: ui.name(v.turn) }); },
  render(el, v, ui) {
    const N = v.N;
    const grid = h('div', { class: 'xo-grid', style: { '--n': N } }, v.b.map((x, i) => {
      const can = ui.myTurn && x < 0 && v.win == null && !v.draw;
      return h('button', { type: 'button', class: 'xo-cell' + (v.line?.includes(i) ? ' win' : '') + (i === v.last ? ' last' : ''), disabled: !can, style: x >= 0 ? { color: COLORS[x] } : null,
        onclick: can ? () => { sound('place'); ui.act({ i }); } : null }, x >= 0 ? MARK[x] : can ? h('span', { class: 'xo-ghost', style: { color: COLORS[ui.seat] } }, MARK[ui.seat]) : '');
    }));
    const next = (v.win != null || v.draw) && !v.final && ui.needs.includes(ui.seat) ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('dm_next')) : null;
    el.append(h('div', { class: 'xo-wrap' },
      h('div', { class: 'xo-score' }, [0, 1].map(i => ui.plate(i, h('b', { class: 'xo-sc', style: { background: COLORS[i] } }, MARK[i], ' ', v.score[i])))),
      grid, next));
  },
};
export async function mount(root, ctx) {
  if (!document.getElementById('xo-css')) document.head.append(h('link', { id: 'xo-css', rel: 'stylesheet', href: new URL('./xo.css', import.meta.url).href }));
  return tableGame(root, ctx, def);
}
export const _test = { def };
