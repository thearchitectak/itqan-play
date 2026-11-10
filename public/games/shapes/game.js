// ألغاز الأشكال: املأ الشكل بقطع ملونة بعد تدويرها وقلبها. كل لغز يتولد عشوائيًا وله حل مضمون.
import { h, t, addDict, sound, num, ico, store } from '../../assets/js/core.js';
addDict({
  ar: { sh_level: 'المستوى {n}', sh_rot: 'دوّر', sh_flip: 'اقلب', sh_new: 'لغز جديد', sh_reset: 'ابدأ من جديد', sh_win: 'أكملت الشكل! 🎉', sh_next: 'المستوى التالي', sh_help: 'اختر قطعة، ودوّرها أو اقلبها، ثم اضغط مكانها في الشكل. اضغط قطعة موضوعة لإعادتها.', sh_hint: 'تلميح' },
  en: { sh_level: 'Level {n}', sh_rot: 'Rotate', sh_flip: 'Flip', sh_new: 'New puzzle', sh_reset: 'Restart', sh_win: 'Shape complete! 🎉', sh_next: 'Next level', sh_help: 'Pick a piece, rotate or flip it, then tap where it goes. Tap a placed piece to take it back.', sh_hint: 'Hint' },
});
const PAL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#a16207', '#64748b', '#84cc16'];
const R = (n) => Math.floor(Math.random() * n);
const norm = (cells) => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const rot = (cells) => norm(cells.map(([x, y]) => [-y, x]));
const flip = (cells) => norm(cells.map(([x, y]) => [-x, y]));
// شكل الهدف: مستطيل أو شكل منحوت حسب المستوى
function region(level) {
  const W = Math.min(4 + Math.floor(level / 2), 8), H = Math.min(3 + Math.floor(level / 3), 6);
  const cells = new Set(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cells.add(x + ',' + y);
  if (level > 2) { // نحذف بعض الزوايا ليصبح الشكل أجمل
    for (let k = 0; k < Math.min(level - 2, 4); k++) { const c = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]][k]; cells.delete(c[0] + ',' + c[1]); }
  }
  return { W, H, cells };
}
function partition(reg, level) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const owner = new Map(); const pieces = []; const list = [...reg.cells];
    const nb = (k) => { const [x, y] = k.split(',').map(Number); return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => (x + dx) + ',' + (y + dy)).filter(c => reg.cells.has(c)); };
    let ok = true;
    for (const start of list.sort(() => Math.random() - .5)) {
      if (owner.has(start)) continue;
      const size = level < 3 ? 3 + R(2) : 4 + R(2);
      const p = [start]; owner.set(start, pieces.length);
      while (p.length < size) { const fr = p.flatMap(nb).filter(c => !owner.has(c)); if (!fr.length) break; const c = fr[R(fr.length)]; owner.set(c, pieces.length); p.push(c); }
      pieces.push(p);
    }
    // نرفض القطع الصغيرة جدًا
    if (pieces.some(p => p.length < 3)) { ok = false; }
    if (ok) return pieces.map(p => p.map(k => k.split(',').map(Number)));
  }
  return null;
}
export async function mount(root) {
  if (!document.getElementById('sh-css')) document.head.append(h('link', { id: 'sh-css', rel: 'stylesheet', href: new URL('./shapes.css', import.meta.url).href }));
  const view = h('div', { class: 'sh' }); root.append(view);
  let level = store.get('sh-level', 1), P, sel = null, hover = null, won = false;
  function make() {
    let pieces = null, reg;
    while (!pieces) { reg = region(level); pieces = partition(reg, level); }
    P = { reg, pieces: pieces.map((cells, i) => { let s = norm(cells); const sol = { cells: s, at: [Math.min(...cells.map(c => c[0])), Math.min(...cells.map(c => c[1]))] }; for (let k = R(4); k > 0; k--) s = rot(s); if (R(2)) s = flip(s); return { id: i, shape: s, color: PAL[i % PAL.length], placed: null, sol }; }) };
    sel = null; won = false; draw();
  }
  const cellsAt = (shape, ax, ay) => shape.map(([x, y]) => [x + ax, y + ay]);
  const occupied = () => { const m = new Map(); for (const p of P.pieces) if (p.placed) for (const [x, y] of cellsAt(p.shape, ...p.placed)) m.set(x + ',' + y, p); return m; };
  const fits = (p, ax, ay) => { const occ = occupied(); return cellsAt(p.shape, ax, ay).every(([x, y]) => P.reg.cells.has(x + ',' + y) && (!occ.has(x + ',' + y) || occ.get(x + ',' + y) === p)); };
  function place(x, y) {
    if (sel == null) { const p = occupied().get(x + ',' + y); if (p) { p.placed = null; sel = p.id; sound('move'); draw(); } return; }
    const p = P.pieces[sel];
    // نجرب أن تكون الخانة المضغوطة أي خلية من القطعة
    const tries = p.shape.map(([cx, cy]) => [x - cx, y - cy]);
    const at = tries.find(([ax, ay]) => fits(p, ax, ay));
    if (!at) { sound('error'); return; }
    p.placed = at; sel = null; sound('place');
    if (occupied().size === P.reg.cells.size) { won = true; sound('win'); level++; store.set('sh-level', level); }
    draw();
  }
  function draw() {
    const { W, H, cells } = P.reg; const occ = occupied();
    view.innerHTML = '';
    const ghost = new Set(); if (sel != null && hover) { const p = P.pieces[sel]; const at = p.shape.map(([cx, cy]) => [hover[0] - cx, hover[1] - cy]).find(([ax, ay]) => fits(p, ax, ay)); if (at) cellsAt(p.shape, ...at).forEach(([x, y]) => ghost.add(x + ',' + y)); }
    const board = h('div', { class: 'sh-board', style: { '--w': W, '--h': H } });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = x + ',' + y; const inR = cells.has(k); const p = occ.get(k);
      const c = h('button', { type: 'button', class: 'sh-c' + (inR ? '' : ' out') + (ghost.has(k) ? ' ghost' : ''), disabled: !inR, style: p ? { background: p.color } : ghost.has(k) ? { background: P.pieces[sel].color } : null,
        onclick: () => place(x, y), onpointerenter: () => { if (sel != null && (!hover || hover[0] !== x || hover[1] !== y)) { hover = [x, y]; draw(); } } });
      board.append(c);
    }
    const mini = (p) => { const w = Math.max(...p.shape.map(c => c[0])) + 1, hh = Math.max(...p.shape.map(c => c[1])) + 1; const g = h('div', { class: 'sh-mini', style: { '--w': w, '--h': hh } }); for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) g.append(h('i', { style: p.shape.some(c => c[0] === x && c[1] === y) ? { background: p.color } : null })); return g; };
    const tray = h('div', { class: 'sh-tray' }, P.pieces.filter(p => !p.placed).map(p => h('button', { type: 'button', class: 'sh-piece' + (sel === p.id ? ' sel' : ''), onclick: () => { sel = sel === p.id ? null : p.id; draw(); } }, mini(p))));
    const sp = sel != null ? P.pieces[sel] : null;
    view.append(h('div', { class: 'sh-top' }, h('b', {}, t('sh_level', { n: num(level) })),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { P.pieces.forEach(p => p.placed = null); sel = null; won = false; draw(); } }, t('sh_reset')),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { const p = P.pieces.find(p => !p.placed); if (!p) return; const occ2 = occupied(); if (cellsAt(p.sol.cells, ...p.sol.at).some(([x, y]) => occ2.has(x + ',' + y))) { P.pieces.forEach(q => q.placed = null); } p.shape = p.sol.cells; p.placed = p.sol.at; if (occupied().size === P.reg.cells.size) { won = true; level++; store.set('sh-level', level); } draw(); } }, ico('lightbulb', 15), t('sh_hint')),
      h('button', { type: 'button', class: 'btn sm', onclick: make }, ico('refresh-cw', 15), t('sh_new'))),
      h('div', { class: 'sh-main' }, h('div', { class: 'sh-left' }, board, won ? h('div', { class: 'ck-res ok' }, t('sh_win'), h('button', { type: 'button', class: 'btn', onclick: make }, t('sh_next'))) : null),
        h('div', { class: 'sh-right' }, sp ? h('div', { class: 'sh-ctl' }, mini(sp), h('button', { type: 'button', class: 'btn', onclick: () => { sp.shape = rot(sp.shape); sound('move'); draw(); } }, '⟳ ', t('sh_rot')), h('button', { type: 'button', class: 'btn ghost', onclick: () => { sp.shape = flip(sp.shape); sound('move'); draw(); } }, '⇋ ', t('sh_flip'))) : null,
          tray, h('p', { class: 'muted' }, t('sh_help')))));
  }
  const onKey = (e) => { if (!view.isConnected || sel == null) return; if (e.key === 'r' || e.key === 'ر') { P.pieces[sel].shape = rot(P.pieces[sel].shape); draw(); } if (e.key === 'f' || e.key === 'ب') { P.pieces[sel].shape = flip(P.pieces[sel].shape); draw(); } };
  window.addEventListener('keydown', onKey);
  make();
  return { unmount() { window.removeEventListener('keydown', onKey); }, onLang() { draw(); } };
}
