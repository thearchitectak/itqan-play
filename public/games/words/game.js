// لعبة الكلمات: «من الحروف» (كوّن كلمات من حروف عشوائية لتملأ شبكة متقاطعة)، و«أكمل الفراغات» (كلمات متقاطعة بتعريفات وبعض الحروف ظاهرة).
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';
import { WORDS, CLUES } from './words.js';

addDict({
  ar: {
    wd_modeA: 'من الحروف', wd_modeAD: 'كوّن كلمات من الحروف لتملأ الشبكة', wd_modeB: 'أكمل الفراغات', wd_modeBD: 'كلمات متقاطعة بتعريفات وبعض الحروف ظاهرة',
    wd_level: 'المستوى {n}', wd_hint: 'تلميح', wd_shuffle: 'خلط', wd_clear: 'مسح', wd_found: 'أحسنت! وجدت «{w}»', wd_bonus: 'كلمة إضافية «{w}»! +5 ⭐', wd_already: 'وجدتها من قبل', wd_no: 'ليست ضمن الكلمات',
    wd_done: 'أكملت المستوى! 🎉', wd_next: 'المستوى التالي', wd_coins: 'نجوم', wd_noCoins: 'تحتاج 10 نجوم للتلميح', wd_across: 'أفقي', wd_down: 'رأسي', wd_check: 'تحقق', wd_reveal: 'اكشف حرفًا',
    wd_right: 'كل الإجابات صحيحة! 🎉', wd_wrongN: 'هناك {n} خانات خاطئة (ملونة بالأحمر)', wd_new: 'شبكة جديدة', wd_back: 'تغيير النوع', wd_tapHint: 'اضغط الحروف بالترتيب لتكوين كلمة، ثم اضغط ✔',
  },
  en: {
    wd_modeA: 'From letters', wd_modeAD: 'Make words from the letters to fill the grid', wd_modeB: 'Fill the blanks', wd_modeBD: 'A clued crossword with some letters shown',
    wd_level: 'Level {n}', wd_hint: 'Hint', wd_shuffle: 'Shuffle', wd_clear: 'Clear', wd_found: 'Great! You found “{w}”', wd_bonus: 'Bonus word “{w}”! +5 ⭐', wd_already: 'Already found', wd_no: 'Not one of the words',
    wd_done: 'Level complete! 🎉', wd_next: 'Next level', wd_coins: 'Stars', wd_noCoins: 'You need 10 stars for a hint', wd_across: 'Across', wd_down: 'Down', wd_check: 'Check', wd_reveal: 'Reveal a letter',
    wd_right: 'All correct! 🎉', wd_wrongN: '{n} cells are wrong (in red)', wd_new: 'New grid', wd_back: 'Change mode', wd_tapHint: 'Tap letters in order, then ✔',
  },
});
const R = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const letters = (w) => [...w];
const DICT = new Set(WORDS);

// ---------- مولّد الكلمات المتقاطعة ----------
export function buildCrossword(words, maxTries = 30) {
  let best = null;
  for (let tr = 0; tr < maxTries; tr++) {
    const list = tr === 0 ? words.slice().sort((a, b) => b.length - a.length) : [words.slice().sort((a, b) => b.length - a.length)[0], ...shuffle(words.slice().sort((a, b) => b.length - a.length).slice(1))];
    const cells = new Map(); const placed = [];
    const key = (x, y) => x + ',' + y;
    const put = (w, x, y, dir) => { letters(w).forEach((ch, i) => cells.set(key(dir ? x : x + i, dir ? y + i : y), ch)); placed.push({ w, x, y, dir }); };
    const can = (w, x, y, dir) => {
      const L = letters(w); let cross = 0;
      const get = (a, b) => cells.get(key(a, b));
      const bx = dir ? x : x - 1, by = dir ? y - 1 : y, ax = dir ? x : x + L.length, ay = dir ? y + L.length : y;
      if (get(bx, by) || get(ax, ay)) return -1;
      for (let i = 0; i < L.length; i++) {
        const cx = dir ? x : x + i, cy = dir ? y + i : y; const c = get(cx, cy);
        if (c) { if (c !== L[i]) return -1; cross++; continue; }
        // الجيران الجانبيون يجب أن يكونوا فارغين
        if (dir ? (get(cx - 1, cy) || get(cx + 1, cy)) : (get(cx, cy - 1) || get(cx, cy + 1))) return -1;
      }
      return cross;
    };
    put(list[0], 0, 0, 0);
    for (const w of list.slice(1)) {
      let opt = null;
      for (const p of placed) {
        const PL = letters(p.w), WL = letters(w);
        for (let i = 0; i < PL.length; i++) for (let j = 0; j < WL.length; j++) if (PL[i] === WL[j]) {
          const dir = 1 - p.dir;
          const x = p.dir ? p.x - j : p.x + i, y = p.dir ? p.y + i : p.y - j;
          const c = can(w, dir ? x : x, dir ? y : y, dir);
          if (c > 0 && (!opt || c > opt.c || (c === opt.c && Math.random() < .3))) opt = { x, y, dir, c };
        }
      }
      if (opt) put(w, opt.x, opt.y, opt.dir);
    }
    if (!best || placed.length > best.placed.length) best = { placed, cells };
    if (placed.length === words.length) break;
  }
  // تطبيع الإحداثيات
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of best.cells.keys()) { const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const W = x1 - x0 + 1, H = y1 - y0 + 1;
  const grid = Array.from({ length: H }, () => Array(W).fill(null));
  for (const [k, ch] of best.cells) { const [x, y] = k.split(',').map(Number); grid[y - y0][x - x0] = ch; }
  const placed = best.placed.map(p => ({ ...p, x: p.x - x0, y: p.y - y0 }));
  // ترقيم الكلمات
  const starts = [...new Set(placed.map(p => p.y * 1000 + p.x))].sort((a, b) => a - b);
  placed.forEach(p => p.n = starts.indexOf(p.y * 1000 + p.x) + 1);
  return { W, H, grid, placed };
}
const cellsOf = (p) => letters(p.w).map((_, i) => [p.dir ? p.x : p.x + i, p.dir ? p.y + i : p.y]);

// ---------- مستويات «من الحروف» ----------
function subWords(base) {
  const cnt = {}; for (const c of base) cnt[c] = (cnt[c] || 0) + 1;
  return [...new Set(WORDS)].filter(w => w.length >= 3 && w.length <= base.length && (() => { const c2 = { ...cnt }; for (const ch of w) { if (!c2[ch]) return false; c2[ch]--; } return true; })());
}
function makeLevel(level) {
  const minLen = level < 4 ? 4 : level < 10 ? 5 : 6;
  let bestBase = null, bestSubs = [];
  const cands = shuffle([...new Set(WORDS)].filter(w => w.length >= minLen && w.length <= minLen + 1));
  for (const b of cands.slice(0, 120)) { const s = subWords(b); if (s.length > bestSubs.length) { bestBase = b; bestSubs = s; } if (bestSubs.length >= 6) break; }
  const want = Math.min(bestSubs.length, 3 + Math.min(5, Math.floor(level / 2)));
  const chosen = [bestBase, ...shuffle(bestSubs.filter(w => w !== bestBase)).slice(0, want - 1)];
  const cw = buildCrossword(chosen);
  return { base: bestBase, letters: shuffle(letters(bestBase)), cw, all: bestSubs };
}

export async function mount(root, ctx) {
  if (!document.getElementById('wd-css')) document.head.append(h('link', { id: 'wd-css', rel: 'stylesheet', href: new URL('./words.css', import.meta.url).href }));
  const view = h('div', { class: 'wd' }); root.append(view);
  let mode = null;
  const st = { coins: store.get('wd-coins', 30), level: store.get('wd-level', 1) };
  const save = () => { store.set('wd-coins', st.coins); store.set('wd-level', st.level); };

  function home() {
    mode = null; view.innerHTML = '';
    view.append(h('div', { class: 'wd-modes' },
      h('button', { type: 'button', class: 'wd-mode a', onclick: () => modeA() }, h('span', { class: 'wd-art' }, ['ق', 'ل', 'م'].map(c => h('i', {}, c))), h('b', {}, t('wd_modeA')), h('small', {}, t('wd_modeAD')), h('em', {}, t('wd_level', { n: num(st.level) }))),
      h('button', { type: 'button', class: 'wd-mode b', onclick: () => modeB() }, h('span', { class: 'wd-art' }, ['ب', '', 'ر'].map(c => h('i', { class: c ? '' : 'e' }, c))), h('b', {}, t('wd_modeB')), h('small', {}, t('wd_modeBD')))));
  }
  function gridEl(cw, show, opts = {}) {
    const g = h('div', { class: 'wd-grid', style: { '--w': cw.W, '--h': cw.H } });
    for (let y = 0; y < cw.H; y++) for (let x = cw.W - 1; x >= 0; x--) {
      const ch = cw.grid[y][x];
      if (!ch) { g.append(h('i', { class: 'wd-void' })); continue; }
      const num0 = cw.placed.find(p => p.x === x && p.y === y);
      g.append(opts.cell ? opts.cell(x, y, ch, num0) : h('span', { class: 'wd-cell' + (show(x, y) ? ' on' : '') }, show(x, y) ? ch : ''));
    }
    return g;
  }

  // ================= من الحروف =================
  function modeA() {
    mode = 'A';
    const L = makeLevel(st.level);
    const found = new Set(), revealed = new Set(), bonus = new Set();
    let pickSeq = [];
    const draw = () => {
      view.innerHTML = '';
      const show = (x, y) => revealed.has(x + ',' + y) || L.cw.placed.some(p => found.has(p.w) && cellsOf(p).some(([a, b]) => a === x && b === y));
      const word = pickSeq.map(i => L.letters[i]).join('');
      const N = L.letters.length;
      const wheel = h('div', { class: 'wd-wheel', style: { '--n': N } }, L.letters.map((c, i) => {
        const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
        return h('button', { type: 'button', class: 'wd-l' + (pickSeq.includes(i) ? ' on' : ''), style: { left: 50 + Math.cos(ang) * 36 + '%', top: 50 + Math.sin(ang) * 36 + '%' }, onclick: () => { if (pickSeq.includes(i)) { if (pickSeq[pickSeq.length - 1] === i) pickSeq.pop(); } else pickSeq.push(i); sound('move'); draw(); } }, c);
      }), h('button', { type: 'button', class: 'wd-ok', disabled: word.length < 2, onclick: submit }, '✔'));
      view.append(h('div', { class: 'wd-play' },
        h('div', { class: 'wd-bar' }, h('button', { type: 'button', class: 'btn ghost sm', onclick: home }, ico('chevron-right', 16), t('wd_back')), h('b', {}, t('wd_level', { n: num(st.level) })), h('span', { class: 'wd-coins' }, '⭐ ', num(st.coins))),
        h('div', { class: 'wd-gridbox' }, gridEl(L.cw, show)),
        h('div', { class: 'wd-current' }, word || h('small', {}, t('wd_tapHint'))),
        wheel,
        h('div', { class: 'wd-acts' },
          h('button', { type: 'button', class: 'btn ghost', onclick: () => { shuffle(L.letters); pickSeq = []; draw(); } }, ico('shuffle', 16), t('wd_shuffle')),
          h('button', { type: 'button', class: 'btn ghost', onclick: () => { pickSeq = []; draw(); } }, t('wd_clear')),
          h('button', { type: 'button', class: 'btn', onclick: hint }, ico('lightbulb', 16), t('wd_hint'), ' (10⭐)')),
        bonus.size ? h('div', { class: 'wd-bonus' }, '⭐ ', [...bonus].join(' · ')) : null));
    };
    const submit = () => {
      const w = pickSeq.map(i => L.letters[i]).join(''); pickSeq = [];
      const target = L.cw.placed.find(p => p.w === w);
      if (target) { if (found.has(w)) toast(t('wd_already')); else { found.add(w); sound('win'); toast(t('wd_found', { w }), 'ok'); st.coins += 2; } }
      else if (DICT.has(w) && L.all.includes(w)) { if (bonus.has(w)) toast(t('wd_already')); else { bonus.add(w); st.coins += 5; sound('notify'); toast(t('wd_bonus', { w }), 'ok'); } }
      else { sound('error'); toast(t('wd_no'), true); }
      save(); draw();
      if (L.cw.placed.every(p => found.has(p.w) || cellsOf(p).every(([x, y]) => revealed.has(x + ',' + y)))) setTimeout(done, 500);
    };
    const hint = () => {
      if (st.coins < 10) { toast(t('wd_noCoins'), true); return; }
      const p = L.cw.placed.find(p => !found.has(p.w) && cellsOf(p).some(([x, y]) => !revealed.has(x + ',' + y)));
      if (!p) return;
      const c = cellsOf(p).find(([x, y]) => !revealed.has(x + ',' + y)); revealed.add(c[0] + ',' + c[1]);
      st.coins -= 10; save();
      if (cellsOf(p).every(([x, y]) => revealed.has(x + ',' + y))) found.add(p.w);
      draw();
      if (L.cw.placed.every(p => found.has(p.w))) setTimeout(done, 500);
    };
    const done = () => {
      st.level++; st.coins += 5; save(); sound('win');
      view.querySelector('.wd-play')?.append(h('div', { class: 'wd-win' }, h('div', { class: 'wd-wincard' }, h('h2', {}, t('wd_done')), h('p', {}, '+5 ⭐'), h('button', { type: 'button', class: 'btn gk-go', onclick: modeA }, t('wd_next')))));
    };
    draw();
  }

  // ================= أكمل الفراغات =================
  function modeB() {
    mode = 'B';
    const pool = shuffle(CLUES.filter(([w]) => w.length >= 3 && w.length <= 7)).slice(0, 14);
    const cw = buildCrossword(pool.map(x => x[0]));
    const clue = Object.fromEntries(pool);
    const given = new Set();
    // نظهر نحو ثلث الحروف، مع حرف واحد على الأقل في كل كلمة
    for (const p of cw.placed) { const cs = cellsOf(p); const c = cs[R(cs.length)]; given.add(c[0] + ',' + c[1]); }
    for (let y = 0; y < cw.H; y++) for (let x = 0; x < cw.W; x++) if (cw.grid[y][x] && Math.random() < .22) given.add(x + ',' + y);
    const typed = {}; let sel = null, dir = 0; const wrong = new Set();
    const alpha = [...new Set(cw.placed.map(p => p.w).join(''))];
    const extra = shuffle('ابتثجحخدذرزسشصضطظعغفقكلمنهوية'.split('').filter(c => !alpha.includes(c))).slice(0, Math.max(0, 16 - alpha.length));
    const keys = shuffle(alpha.concat(extra));
    const wordAt = (x, y, d) => cw.placed.find(p => p.dir === d && cellsOf(p).some(([a, b]) => a === x && b === y));
    const draw = () => {
      view.innerHTML = '';
      const activeWord = sel ? (wordAt(sel[0], sel[1], dir) || wordAt(sel[0], sel[1], 1 - dir)) : null;
      const inActive = (x, y) => activeWord && cellsOf(activeWord).some(([a, b]) => a === x && b === y);
      const g = gridEl(cw, null, { cell: (x, y, ch, n0) => {
        const k = x + ',' + y, isGiven = given.has(k);
        return h('button', { type: 'button', class: 'wd-cell in' + (isGiven ? ' given' : '') + (sel && sel[0] === x && sel[1] === y ? ' sel' : inActive(x, y) ? ' act' : '') + (wrong.has(k) ? ' bad' : ''),
          onclick: () => { if (sel && sel[0] === x && sel[1] === y) dir = 1 - dir; else { sel = [x, y]; if (!wordAt(x, y, dir)) dir = 1 - dir; } draw(); } },
          n0 ? h('sup', {}, num(n0.n)) : null, isGiven ? ch : (typed[k] || ''));
      } });
      const clist = (d) => h('div', { class: 'wd-clues' }, h('b', {}, d ? '⬇ ' + t('wd_down') : '⬅ ' + t('wd_across')),
        cw.placed.filter(p => p.dir === d).sort((a, b) => a.n - b.n).map(p => h('button', { type: 'button', class: 'wd-clue' + (activeWord === p ? ' on' : ''), onclick: () => { sel = [p.x, p.y]; dir = d; draw(); } }, h('span', {}, num(p.n)), ' ', clue[p.w], h('small', {}, ' (', num(p.w.length), ')'))));
      view.append(h('div', { class: 'wd-play b' },
        h('div', { class: 'wd-bar' }, h('button', { type: 'button', class: 'btn ghost sm', onclick: home }, ico('chevron-right', 16), t('wd_back')), h('b', {}, t('wd_modeB')),
          h('button', { type: 'button', class: 'btn ghost sm', onclick: modeB }, ico('refresh-cw', 15), t('wd_new'))),
        h('div', { class: 'wd-bmain' }, h('div', { class: 'wd-gridbox' }, g), h('div', { class: 'wd-cluebox' }, clist(0), clist(1))),
        h('div', { class: 'wd-keys' }, keys.map(c => h('button', { type: 'button', onclick: () => type(c) }, c)), h('button', { type: 'button', class: 'del', onclick: () => type(null) }, '⌫')),
        h('div', { class: 'wd-acts' }, h('button', { type: 'button', class: 'btn', onclick: check }, ico('check', 16), t('wd_check')), h('button', { type: 'button', class: 'btn ghost', onclick: revealOne }, ico('lightbulb', 16), t('wd_reveal')))));
    };
    const advance = (back) => {
      if (!sel) return; const w = wordAt(sel[0], sel[1], dir); if (!w) return;
      const cs = cellsOf(w); const i = cs.findIndex(([a, b]) => a === sel[0] && b === sel[1]);
      const n = cs[i + (back ? -1 : 1)]; if (n) sel = n;
    };
    const type = (c) => {
      if (!sel) return; const k = sel[0] + ',' + sel[1];
      if (c == null) { if (!typed[k] || given.has(k)) advance(true); const k2 = sel[0] + ',' + sel[1]; if (!given.has(k2)) delete typed[k2]; wrong.delete(k2); draw(); return; }
      if (!given.has(k)) { typed[k] = c; wrong.delete(k); }
      sound('move'); advance(false); draw();
    };
    const check = () => {
      wrong.clear(); let empty = 0;
      for (let y = 0; y < cw.H; y++) for (let x = 0; x < cw.W; x++) { const ch = cw.grid[y][x]; if (!ch) continue; const k = x + ',' + y; if (given.has(k)) continue; if (!typed[k]) empty++; else if (typed[k] !== ch) wrong.add(k); }
      draw();
      if (!wrong.size && !empty) { sound('win'); toast(t('wd_right'), 'ok'); }
      else if (wrong.size) { sound('error'); toast(t('wd_wrongN', { n: num(wrong.size) }), true); }
    };
    const revealOne = () => {
      const cands = []; for (let y = 0; y < cw.H; y++) for (let x = 0; x < cw.W; x++) { const ch = cw.grid[y][x]; const k = x + ',' + y; if (ch && !given.has(k) && typed[k] !== ch) cands.push(k); }
      const k = sel && cands.includes(sel[0] + ',' + sel[1]) ? sel[0] + ',' + sel[1] : cands[R(cands.length)]; if (!k) return;
      given.add(k); wrong.delete(k); draw();
    };
    const onKey = (e) => { if (mode !== 'B' || !view.isConnected) return; if (e.key === 'Backspace') { type(null); e.preventDefault(); } else if (/^[ء-ي]$/.test(e.key)) type(e.key); };
    window.addEventListener('keydown', onKey); cleanup = () => window.removeEventListener('keydown', onKey);
    draw();
  }
  let cleanup = () => { };
  home();
  return { unmount() { cleanup(); }, onLang() { if (!mode) home(); } };
}
