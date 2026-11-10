// سودوكو بثلاثة أحجام: 4×4 و6×6 للصغار و9×9 الكلاسيكية، مع ملاحظات وتلميحات ومؤقت.
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';

addDict({
  ar: { sd_size: 'الحجم', sd_diff: 'الصعوبة', sd_easy: 'سهل', sd_mid: 'متوسط', sd_hard: 'صعب', sd_new: 'لعبة جديدة', sd_notes: 'ملاحظات', sd_hint: 'تلميح', sd_erase: 'امسح', sd_undo: 'تراجع', sd_check: 'أظهر الأخطاء',
    sd_win: 'أحسنت! حللت السودوكو في {t} 🎉', sd_mist: 'الأخطاء: {n}', sd_rules: 'املأ الشبكة بحيث يحتوي كل صف وكل عمود وكل مربع صغير على الأرقام مرة واحدة فقط.', sd_kids: '(للصغار)' },
  en: { sd_size: 'Size', sd_diff: 'Difficulty', sd_easy: 'Easy', sd_mid: 'Medium', sd_hard: 'Hard', sd_new: 'New game', sd_notes: 'Notes', sd_hint: 'Hint', sd_erase: 'Erase', sd_undo: 'Undo', sd_check: 'Show mistakes',
    sd_win: 'Solved in {t}! 🎉', sd_mist: 'Mistakes: {n}', sd_rules: 'Fill the grid so every row, column and box contains each number once.', sd_kids: '(kids)' },
});
const BOX = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
const R = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function ok(g, N, i, v) {
  const [bh, bw] = BOX[N], r = Math.floor(i / N), c = i % N;
  for (let k = 0; k < N; k++) { if (g[r * N + k] === v || g[k * N + c] === v) return false; }
  const r0 = r - r % bh, c0 = c - c % bw;
  for (let a = 0; a < bh; a++) for (let b = 0; b < bw; b++) if (g[(r0 + a) * N + c0 + b] === v) return false;
  return true;
}
function solve(g, N, count = false, limit = 2) {
  let sols = 0;
  const rec = () => {
    let best = -1, bestOpts = null;
    for (let i = 0; i < N * N; i++) if (!g[i]) { const o = []; for (let v = 1; v <= N; v++) if (ok(g, N, i, v)) o.push(v); if (!o.length) return false; if (!bestOpts || o.length < bestOpts.length) { best = i; bestOpts = o; if (o.length === 1) break; } }
    if (best < 0) { sols++; return !count || sols >= limit; }
    for (const v of count ? bestOpts : shuffle(bestOpts)) { g[best] = v; if (rec()) return true; g[best] = 0; }
    return false;
  };
  rec(); return sols;
}
export function generate(N, diff) {
  const sol = Array(N * N).fill(0); solve(sol, N);
  const puz = sol.slice();
  const target = { 4: [6, 8, 10], 6: [14, 18, 22], 9: [38, 48, 56] }[N][diff];
  let removed = 0;
  for (const i of shuffle([...Array(N * N).keys()])) {
    if (removed >= target) break;
    const v = puz[i]; puz[i] = 0;
    if (solve(puz.slice(), N, true, 2) !== 1) puz[i] = v; else removed++;
  }
  return { sol, puz };
}
export async function mount(root) {
  if (!document.getElementById('sd-css')) document.head.append(h('link', { id: 'sd-css', rel: 'stylesheet', href: new URL('./sudoku.css', import.meta.url).href }));
  const view = h('div', { class: 'sd' }); root.append(view);
  const cfg = { N: store.get('sd-N', 9), diff: store.get('sd-diff', 0) };
  let G, sel = -1, notesMode = false, hist = [], timer, t0, showErr = false, mist = 0, won = false;
  function start() {
    store.set('sd-N', cfg.N); store.set('sd-diff', cfg.diff);
    const { sol, puz } = generate(cfg.N, cfg.diff);
    G = { sol, fixed: puz.map(x => x > 0), cur: puz.slice(), notes: puz.map(() => []) };
    sel = -1; hist = []; mist = 0; won = false; t0 = Date.now(); clearInterval(timer); timer = setInterval(tickClock, 1000); draw();
  }
  const fmt = (ms) => { const s = Math.floor(ms / 1000); return num(Math.floor(s / 60)) + ':' + num(String(s % 60).padStart(2, '0')); };
  function tickClock() { const el = view.querySelector('.sd-clock'); if (el && !won) el.textContent = '⏱ ' + fmt(Date.now() - t0); }
  function put(v) {
    if (sel < 0 || G.fixed[sel] || won) return;
    hist.push({ i: sel, v: G.cur[sel], n: G.notes[sel].slice() });
    if (notesMode && v) { const n = G.notes[sel]; const k = n.indexOf(v); k >= 0 ? n.splice(k, 1) : n.push(v); }
    else { G.cur[sel] = G.cur[sel] === v ? 0 : v; G.notes[sel] = []; if (v && G.cur[sel] === v && v !== G.sol[sel]) { mist++; sound('error'); } else if (v) { sound('place'); clearNotes(sel, v); } }
    draw(); checkWin();
  }
  function clearNotes(i, v) { const N = cfg.N, [bh, bw] = BOX[N], r = Math.floor(i / N), c = i % N; for (let j = 0; j < N * N; j++) { const rr = Math.floor(j / N), cc = j % N; if (rr === r || cc === c || (Math.floor(rr / bh) === Math.floor(r / bh) && Math.floor(cc / bw) === Math.floor(c / bw))) { const k = G.notes[j].indexOf(v); if (k >= 0) G.notes[j].splice(k, 1); } } }
  function checkWin() { if (G.cur.every((v, i) => v === G.sol[i])) { won = true; clearInterval(timer); sound('win'); draw(); toast(t('sd_win', { t: fmt(Date.now() - t0) }), 'ok'); } }
  function draw() {
    const N = cfg.N, [bh, bw] = BOX[N];
    const selV = sel >= 0 ? G.cur[sel] : 0;
    const grid = h('div', { class: 'sd-grid n' + N, style: { '--n': N } }, G.cur.map((v, i) => {
      const r = Math.floor(i / N), c = i % N; const sr = Math.floor(sel / N), scl = sel % N;
      const peer = sel >= 0 && (r === sr || c === scl || (Math.floor(r / bh) === Math.floor(sr / bh) && Math.floor(c / bw) === Math.floor(scl / bw)));
      const wrong = v && v !== G.sol[i] && (showErr || true);
      const cls = 'sd-c' + (G.fixed[i] ? ' fixed' : '') + (i === sel ? ' sel' : peer ? ' peer' : '') + (v && v === selV ? ' same' : '') + (wrong && !G.fixed[i] ? ' bad' : '') + ((c + 1) % bw === 0 && c < N - 1 ? ' br' : '') + ((r + 1) % bh === 0 && r < N - 1 ? ' bb' : '');
      return h('button', { type: 'button', class: cls, onclick: () => { sel = i; draw(); } }, v ? num(v) : G.notes[i].length ? h('span', { class: 'sd-notes', style: { '--n': N } }, Array.from({ length: N }, (_, k) => h('i', {}, G.notes[i].includes(k + 1) ? num(k + 1) : ''))) : '');
    }));
    const counts = Array(N + 1).fill(0); G.cur.forEach((v, i) => { if (v && v === G.sol[i]) counts[v]++; });
    view.innerHTML = '';
    view.append(h('div', { class: 'sd-top' },
      h('div', { class: 'field' }, h('span', {}, t('sd_size')), seg([[4, '4×4 ' + t('sd_kids')], [6, '6×6'], [9, '9×9']], cfg.N, v => { cfg.N = +v; start(); })),
      h('div', { class: 'field' }, h('span', {}, t('sd_diff')), seg([[0, t('sd_easy')], [1, t('sd_mid')], [2, t('sd_hard')]], cfg.diff, v => { cfg.diff = +v; start(); })),
      h('button', { type: 'button', class: 'btn', onclick: start }, ico('refresh-cw', 16), t('sd_new'))),
      h('div', { class: 'sd-main' }, h('div', { class: 'sd-board' }, h('div', { class: 'sd-info' }, h('b', { class: 'sd-clock' }, '⏱ ' + fmt(Date.now() - t0)), h('span', {}, t('sd_mist', { n: num(mist) }))), grid),
        h('div', { class: 'sd-pad' },
          h('div', { class: 'sd-nums', style: { '--n': N } }, Array.from({ length: N }, (_, k) => h('button', { type: 'button', class: counts[k + 1] >= N ? 'done' : '', onclick: () => put(k + 1) }, num(k + 1)))),
          h('div', { class: 'sd-tools' },
            h('button', { type: 'button', class: 'btn ghost', onclick: () => { const u = hist.pop(); if (u) { G.cur[u.i] = u.v; G.notes[u.i] = u.n; draw(); } } }, ico('undo-2', 16), t('sd_undo')),
            h('button', { type: 'button', class: 'btn ghost', onclick: () => put(0) }, '⌫ ', t('sd_erase')),
            h('button', { type: 'button', class: 'btn ' + (notesMode ? '' : 'ghost'), onclick: () => { notesMode = !notesMode; draw(); } }, '✏️ ', t('sd_notes')),
            h('button', { type: 'button', class: 'btn ghost', onclick: () => { const cand = sel >= 0 && !G.fixed[sel] && G.cur[sel] !== G.sol[sel] ? sel : G.cur.findIndex((v, i) => !G.fixed[i] && v !== G.sol[i]); if (cand < 0) return; sel = cand; G.cur[cand] = G.sol[cand]; G.fixed[cand] = true; clearNotes(cand, G.sol[cand]); draw(); checkWin(); } }, ico('lightbulb', 16), t('sd_hint'))),
          h('p', { class: 'muted' }, t('sd_rules')))));
  }
  function seg(opts, val, on) { return h('div', { class: 'seg' }, opts.map(([v, l]) => h('button', { type: 'button', class: String(v) === String(val) ? 'on' : '', onclick: () => on(v) }, l))); }
  const onKey = (e) => { if (!view.isConnected) return; const n = parseInt(e.key, 10); if (n >= 1 && n <= cfg.N) put(n); else if (e.key === 'Backspace' || e.key === 'Delete') put(0); else if (e.key.startsWith('Arrow') && sel >= 0) { const N = cfg.N; const d = { ArrowUp: -N, ArrowDown: N, ArrowLeft: document.dir === 'rtl' ? 1 : -1, ArrowRight: document.dir === 'rtl' ? -1 : 1 }[e.key]; sel = Math.max(0, Math.min(N * N - 1, sel + d)); draw(); e.preventDefault(); } };
  window.addEventListener('keydown', onKey);
  start();
  return { unmount() { clearInterval(timer); window.removeEventListener('keydown', onKey); }, onLang() { draw(); } };
}
