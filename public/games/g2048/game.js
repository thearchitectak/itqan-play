// 2048: ادمج البلاطات المتساوية لتصل إلى 2048. وفيه وضع «مضاعفات» تبدأ فيه البلاطات من عدد تختاره (3 أو 5…) لتعلم جدول الضرب.
import { h, t, addDict, sound, num, ico, store } from '../../assets/js/core.js';
addDict({
  ar: { g2_score: 'النقاط', g2_best: 'الأفضل', g2_new: 'لعبة جديدة', g2_undo: 'تراجع', g2_base: 'البلاطات تبدأ من', g2_over: 'لا توجد حركة! النقاط: {n}', g2_win: 'وصلت إلى {n}! 🎉 تابع لتحطيم رقمك.', g2_help: 'اسحب أو استخدم الأسهم لتحريك كل البلاطات. البلاطتان المتساويتان تندمجان في بلاطة واحدة مجموعها ضعفهما.' },
  en: { g2_score: 'Score', g2_best: 'Best', g2_new: 'New game', g2_undo: 'Undo', g2_base: 'Tiles start at', g2_over: 'No moves! Score: {n}', g2_win: 'You reached {n}! 🎉 Keep going.', g2_help: 'Swipe or use arrow keys. Equal tiles merge into their sum.' },
});
const COL = ['#eee4da', '#ede0c8', '#f2b179', '#f59563', '#f67c5f', '#f65e3b', '#edcf72', '#edcc61', '#edc850', '#edc53f', '#edc22e', '#3c3a32'];
export async function mount(root) {
  if (!document.getElementById('g2-css')) document.head.append(h('link', { id: 'g2-css', rel: 'stylesheet', href: new URL('./g2048.css', import.meta.url).href }));
  const view = h('div', { class: 'g2' }); root.append(view);
  let base = store.get('g2-base', 2), b, score, prev, won, over, ids = 0;
  const N = 4;
  const best = () => store.get('g2-best-' + base, 0);
  function add() { const e = []; b.forEach((v, i) => { if (!v) e.push(i); }); if (!e.length) return; const i = e[Math.floor(Math.random() * e.length)]; b[i] = { v: Math.random() < .9 ? base : base * 2, id: ++ids, nw: true }; }
  function start() { b = Array(16).fill(null); score = 0; prev = null; won = false; over = false; add(); add(); draw(); }
  function move(dir) {
    if (over) return;
    const snap = { b: b.map(x => x && { ...x }), score };
    let moved = false; const target = base * 1024;
    for (let k = 0; k < N; k++) {
      const idx = Array.from({ length: N }, (_, j) => dir === 'L' ? k * N + j : dir === 'R' ? k * N + (N - 1 - j) : dir === 'U' ? j * N + k : (N - 1 - j) * N + k);
      const line = idx.map(i => b[i]).filter(Boolean).map(x => ({ ...x, nw: false, mg: false }));
      const out = [];
      for (let j = 0; j < line.length; j++) {
        if (j + 1 < line.length && line[j].v === line[j + 1].v) { const v = line[j].v * 2; out.push({ v, id: ++ids, mg: true }); score += v; if (v >= target && !won) { won = true; setTimeout(() => msg(t('g2_win', { n: num(v) })), 250); } j++; }
        else out.push(line[j]);
      }
      idx.forEach((i, j) => { const nv = out[j] || null; if ((b[i]?.v || 0) !== (nv?.v || 0) || (b[i] && nv && b[i].id !== nv.id)) moved = true; b[i] = nv; });
    }
    if (!moved) return;
    prev = snap; add(); sound('move');
    if (score > best()) store.set('g2-best-' + base, score);
    if (!canMove()) { over = true; setTimeout(() => msg(t('g2_over', { n: num(score) })), 300); sound('lose'); }
    draw();
  }
  function canMove() { for (let i = 0; i < 16; i++) { if (!b[i]) return true; const r = Math.floor(i / 4), c = i % 4; if (c < 3 && b[i + 1]?.v === b[i].v) return true; if (r < 3 && b[i + 4]?.v === b[i].v) return true; } return false; }
  function msg(m) { const el = view.querySelector('.g2-msg'); if (el) { el.textContent = m; el.classList.add('on'); } }
  function draw() {
    view.innerHTML = '';
    const lvl = (v) => Math.min(11, Math.round(Math.log2(v / base)));
    view.append(h('div', { class: 'g2-top' },
      h('div', { class: 'field' }, h('span', {}, t('g2_base')), h('div', { class: 'seg' }, [2, 3, 5, 7].map(x => h('button', { type: 'button', class: x === base ? 'on' : '', onclick: () => { base = x; store.set('g2-base', x); start(); } }, num(x))))),
      h('div', { class: 'g2-box' }, h('small', {}, t('g2_score')), h('b', {}, num(score))), h('div', { class: 'g2-box' }, h('small', {}, t('g2_best')), h('b', {}, num(best()))),
      h('button', { type: 'button', class: 'btn ghost', disabled: !prev, onclick: () => { if (prev) { b = prev.b; score = prev.score; prev = null; over = false; draw(); } } }, ico('undo-2', 16), t('g2_undo')),
      h('button', { type: 'button', class: 'btn', onclick: start }, ico('refresh-cw', 16), t('g2_new'))),
      h('div', { class: 'g2-board' }, Array.from({ length: 16 }, () => h('i')), b.map((x, i) => x ? h('div', { class: 'g2-t' + (x.nw ? ' nw' : '') + (x.mg ? ' mg' : ''), style: { '--r': Math.floor(i / 4), '--c': i % 4, background: COL[lvl(x.v)], color: lvl(x.v) < 2 ? '#776e65' : '#fff', fontSize: String(x.v).length > 3 ? '1.5em' : String(x.v).length > 2 ? '1.9em' : '2.3em' } }, num(x.v)) : null), h('div', { class: 'g2-msg' })),
      h('p', { class: 'muted center' }, t('g2_help')));
    const bd = view.querySelector('.g2-board'); let sx, sy;
    bd.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    bd.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U')); });
  }
  const onKey = (e) => { if (!view.isConnected) return; const d = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D' }[e.key]; if (d) { e.preventDefault(); move(d); } };
  window.addEventListener('keydown', onKey);
  start();
  return { unmount() { window.removeEventListener('keydown', onKey); }, onLang() { draw(); } };
}
