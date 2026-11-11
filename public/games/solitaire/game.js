// سوليتير (كلوندايك) على طريقة ويندوز: سحب وإفلات، نقر مزدوج، تراجع، تلميح، إكمال تلقائي، وتساقط الأوراق عند الفوز
import { h, tr, sound, num, store, toast } from '../../assets/js/core.js';
const L = (ar, en) => tr({ ar, en });
const SUITS = ['S', 'H', 'D', 'C'], SYM = { S: '♠', H: '♥', D: '♦', C: '♣' }, RL = [, 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const red = (c) => c.s === 'H' || c.s === 'D';
const FACE = { 11: '🤴', 12: '👸', 13: '🫅' };
const BACKS = [['blue', 'أزرق', 'Blue'], ['red', 'أحمر', 'Red'], ['green', 'أخضر', 'Green'], ['purple', 'بنفسجي', 'Purple']];

export async function mount(root) {
  if (!document.getElementById('sol-css')) document.head.append(h('link', { id: 'sol-css', rel: 'stylesheet', href: new URL('./solitaire.css', import.meta.url).href }));
  const cfg = store.get('sol-cfg', { draw: 1, back: 'blue' }), stats = store.get('sol-stats', { played: 0, won: 0, best: 0, bestT: 0 });
  const view = h('div', { class: 'sol' }); root.append(view);
  let G, hist, t0, timer, alive = true, drag = null, cw = 80, gap = 10, ox = 0, board, winning = false;

  function deal() {
    const d = []; SUITS.forEach(s => { for (let r = 1; r <= 13; r++) d.push({ r, s, up: false, id: s + r }); });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    G = { stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []], score: 0, moves: 0, passes: 0, won: false };
    for (let c = 0; c < 7; c++) for (let k = 0; k <= c; k++) { const x = d.pop(); x.up = k === c; G.tab[c].push(x); }
    G.stock = d; hist = []; t0 = 0; winning = false; stats.played++; store.set('sol-stats', stats); sound('notify'); draw();
  }
  const snap = () => { hist.push(JSON.stringify(G)); if (hist.length > 200) hist.shift(); };
  const tick = () => { if (!t0) t0 = Date.now(); };
  const elapsed = () => t0 ? Math.floor((Date.now() - t0) / 1000) : 0;
  const pile = (id) => { const [k, i] = id.split(':'); return k === 'w' ? G.waste : k === 's' ? G.stock : k === 'f' ? G.found[+i] : G.tab[+i]; };
  const canFound = (c, f) => f.length ? (f[f.length - 1].s === c.s && f[f.length - 1].r === c.r - 1) : c.r === 1;
  const canTab = (c, t) => t.length ? (t[t.length - 1].up && red(t[t.length - 1]) !== red(c) && t[t.length - 1].r === c.r + 1) : c.r === 13;

  // نقل مجموعة أوراق من كومة إلى أخرى مع حساب النقاط على طريقة ويندوز
  function move(from, idx, to, silent) {
    const src = pile(from), dst = pile(to), cards = src.slice(idx);
    if (!cards.length || !cards[0].up) return false;
    if (to[0] === 'f') { if (cards.length !== 1 || !canFound(cards[0], dst)) return false; }
    else if (to[0] === 't') { if (!canTab(cards[0], dst)) return false; } else return false;
    if (from === to) return false;
    snap(); tick();
    src.splice(idx); dst.push(...cards); G.moves++;
    if (to[0] === 'f') G.score += 10; else if (from[0] === 'w') G.score += 5; else if (from[0] === 'f') G.score = Math.max(0, G.score - 15);
    if (from[0] === 't' && src.length && !src[src.length - 1].up) { src[src.length - 1].up = true; G.score += 5; }
    if (!silent) sound(to[0] === 'f' ? 'capture' : 'place');
    checkWin(); return true;
  }
  function drawStock() {
    tick();
    if (!G.stock.length) {
      if (!G.waste.length) return;
      if (cfg.draw === 3 && G.passes >= 2 && false) return;
      snap(); G.stock = G.waste.reverse().map(c => ({ ...c, up: false })); G.waste = []; G.passes++; G.score = Math.max(0, G.score - (cfg.draw === 1 ? 100 : 20)); sound('move'); return draw();
    }
    snap(); for (let i = 0; i < cfg.draw && G.stock.length; i++) { const c = G.stock.pop(); c.up = true; G.waste.push(c); }
    G.moves++; sound('move'); draw();
  }
  // أفضل نقلة تلقائية لورقة (عند النقر أو النقر المزدوج)
  function autoMove(from, idx, foundOnly) {
    const src = pile(from), c = src[idx]; if (!c?.up) return false;
    if (idx === src.length - 1) for (let f = 0; f < 4; f++) if (from !== 'f:' + f && canFound(c, G.found[f])) return move(from, idx, 'f:' + f);
    if (foundOnly) return false;
    const order = [...Array(7).keys()].sort((a, b) => (G.tab[b].length > 0) - (G.tab[a].length > 0));
    for (const t of order) { if ('t:' + t === from) continue; if (c.r === 13 && from[0] === 't' && idx === 0) continue; if (canTab(c, G.tab[t])) return move(from, idx, 't:' + t); }
    return false;
  }
  function hintMove() {
    const tries = [];
    G.tab.forEach((t, i) => t.forEach((c, j) => { if (c.up) tries.push(['t:' + i, j]); }));
    if (G.waste.length) tries.push(['w', G.waste.length - 1]);
    for (const [from, idx] of tries) {
      const src = pile(from), c = src[idx];
      if (idx === src.length - 1) for (let f = 0; f < 4; f++) if (canFound(c, G.found[f])) return [from, idx, 'f:' + f];
      for (let t = 0; t < 7; t++) if ('t:' + t !== from && canTab(c, G.tab[t]) && !(c.r === 13 && idx === 0) && !(from[0] === 't' && idx > 0 && src[idx - 1].up && G.tab[t].length && false)) {
        if (from[0] === 't' && idx > 0 && src[idx - 1].up) continue; // نقلة لا تكشف شيئًا
        return [from, idx, 't:' + t];
      }
    }
    return G.stock.length || G.waste.length ? ['s'] : null;
  }
  function hint() {
    const m = hintMove(); if (!m) return toast(L('لا توجد نقلات متاحة — جرّب لعبة جديدة', 'No moves left — try a new game'), true);
    const sel = m[0] === 's' ? '.sol-stock' : `.sol-card[data-p="${m[0]}"][data-i="${m[1]}"]`;
    view.querySelectorAll(sel).forEach(e => { e.classList.remove('hint'); void e.offsetWidth; e.classList.add('hint'); });
    if (m[2]) { const t = view.querySelector(`.sol-slot[data-p="${m[2]}"]`); t?.classList.add('hint'); setTimeout(() => t?.classList.remove('hint'), 1200); }
  }
  const canAuto = () => !G.stock.length && !G.waste.length && G.tab.every(t => t.every(c => c.up));
  function autoFinish() {
    const step = () => {
      if (!alive || G.won) return;
      for (let i = 0; i < 7; i++) { const t = G.tab[i]; if (t.length && autoMove('t:' + i, t.length - 1, true)) { draw(); return setTimeout(step, 90); } }
    };
    step();
  }
  function checkWin() {
    if (G.found.every(f => f.length === 13) && !G.won) {
      G.won = true; const tsec = elapsed(), bonus = tsec > 30 ? Math.round(700000 / tsec) : 0; G.score += bonus;
      stats.won++; stats.best = Math.max(stats.best, G.score); if (!stats.bestT || tsec < stats.bestT) stats.bestT = tsec; store.set('sol-stats', stats);
      setTimeout(() => { sound('win'); cascade(bonus); }, 300);
    }
  }
  function undo() { if (!hist.length) return; G = JSON.parse(hist.pop()); G.score = Math.max(0, G.score - 2); sound('move'); draw(); }

  // ============ الرسم ============
  function cardNode(c, p, i) {
    const el = h('div', { class: 'sol-card' + (c.up ? (red(c) ? ' red' : '') : ' down back-' + cfg.back), 'data-p': p, 'data-i': i });
    if (c.up) el.append(h('span', { class: 'sol-tl' }, h('b', {}, RL[c.r]), h('i', {}, SYM[c.s])),
      c.r > 10 ? h('span', { class: 'sol-face' }, h('em', {}, FACE[c.r]), h('i', {}, SYM[c.s])) : h('span', { class: 'sol-mid' }, SYM[c.s]),
      h('span', { class: 'sol-br' }, h('b', {}, RL[c.r]), h('i', {}, SYM[c.s])));
    return el;
  }
  function layout() {
    const W = view.clientWidth || 360; gap = W < 500 ? 4 : 10; cw = Math.min(100, (W - gap * 8) / 7); ox = Math.max(0, (W - cw * 7 - gap * 8) / 2);
    view.style.setProperty('--cw', cw + 'px');
  }
  function draw() {
    if (!alive) return; layout();
    const ch = cw * 1.4, x = (i) => ox + gap + i * (cw + gap);
    view.innerHTML = '';
    view.append(h('div', { class: 'sol-bar' },
      h('div', { class: 'sol-stat' }, '🏆 ', L('النقاط', 'Score'), ' ', h('b', { class: 'sol-score' }, num(G.score))),
      h('div', { class: 'sol-stat' }, '⏱️ ', h('b', { class: 'sol-time' }, fmt(elapsed()))),
      h('div', { class: 'sol-stat' }, '🔁 ', L('النقلات', 'Moves'), ' ', h('b', {}, num(G.moves))),
      h('span', { class: 'grow' }),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { if (!G.moves || G.won || confirm(L('بدء توزيعة جديدة؟', 'Deal a new game?'))) deal(); } }, '🃏 ', L('توزيعة جديدة', 'New deal')),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: undo, disabled: !hist.length }, '↶ ', L('تراجع', 'Undo')),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: hint }, '💡 ', L('تلميح', 'Hint')),
      canAuto() && !G.won ? h('button', { type: 'button', class: 'btn sm sol-auto', onclick: autoFinish }, '⚡ ', L('إكمال تلقائي', 'Auto-finish')) : null,
      h('button', { type: 'button', class: 'btn ghost sm', onclick: options }, '⚙️')));
    board = h('div', { class: 'sol-board' }); view.append(board);
    const slot = (p, i, y, lbl) => h('div', { class: 'sol-slot', 'data-p': p, style: { left: x(i) + 'px', top: y + 'px' } }, lbl || '');
    // الصف العلوي
    const st = h('div', { class: 'sol-slot sol-stock', style: { left: x(0) + 'px', top: '0px' }, onclick: drawStock }, G.stock.length ? h('div', { class: 'sol-card down back-' + cfg.back }, h('small', { class: 'sol-cnt' }, num(G.stock.length))) : h('span', { class: 'sol-re' }, '↻'));
    board.append(st);
    board.append(slot('w', 1, 0));
    const wshow = G.waste.slice(-(cfg.draw === 3 ? 3 : 1));
    wshow.forEach((c, k) => { const i = G.waste.length - wshow.length + k, el = cardNode(c, 'w', i); el.style.left = (x(1) + k * cw * .22) + 'px'; el.style.top = '0px'; if (k < wshow.length - 1) el.classList.add('nodrag'); board.append(el); });
    for (let f = 0; f < 4; f++) {
      board.append(slot('f:' + f, 3 + f, 0, h('span', { class: 'sol-fs' }, 'A')));
      const fp = G.found[f]; if (fp.length) { const el = cardNode(fp[fp.length - 1], 'f:' + f, fp.length - 1); el.style.left = x(3 + f) + 'px'; el.style.top = '0px'; board.append(el); }
    }
    // الأعمدة
    const ty = ch + gap * 2; let maxH = 0;
    const room = Math.max(ch * 3, (innerHeight - 260) - ty);
    G.tab.forEach((t, i) => {
      board.append(slot('t:' + i, i, ty, h('span', { class: 'sol-fs' }, 'K')));
      const downs = t.filter(c => !c.up).length, ups = t.length - downs;
      let du = cw * .16, uu = cw * .32; const need = downs * du + Math.max(0, ups - 1) * uu;
      if (need > room - ch && ups > 1) uu = Math.max(cw * .2, (room - ch - downs * du) / (ups - 1));
      let y = ty;
      t.forEach((c, j) => { const el = cardNode(c, 't:' + i, j); el.style.left = x(i) + 'px'; el.style.top = y + 'px'; board.append(el); y += c.up ? uu : du; });
      maxH = Math.max(maxH, y - (t.length ? (t[t.length - 1].up ? uu : du) : 0) + ch);
    });
    board.style.height = Math.max(ty + ch, maxH) + gap + 'px';
    if (G.won) board.append(h('div', { class: 'sol-won' }, h('b', {}, '🎉 ', L('أحسنت! فزت باللعبة', 'You won!')), h('div', {}, L('النقاط: ', 'Score: '), num(G.score), ' · ', fmt(elapsed())), h('button', { type: 'button', class: 'btn', onclick: deal }, L('توزيعة جديدة', 'New deal'))));
  }
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function options() {
    const m = h('div', { class: 'sol-opts card' },
      h('b', {}, L('السحب من الكومة', 'Draw')), h('div', { class: 'row' }, [1, 3].map(n => h('button', { type: 'button', class: 'btn sm ' + (cfg.draw === n ? '' : 'ghost'), onclick: () => { cfg.draw = n; store.set('sol-cfg', cfg); m.remove(); deal(); } }, L(n === 1 ? 'ورقة واحدة (سهل)' : 'ثلاث أوراق (صعب)', n === 1 ? 'Draw one' : 'Draw three')))),
      h('b', {}, L('ظهر الأوراق', 'Card back')), h('div', { class: 'row' }, BACKS.map(([k, a, e]) => h('button', { type: 'button', class: 'sol-bk back-' + k + (cfg.back === k ? ' on' : ''), title: L(a, e), onclick: () => { cfg.back = k; store.set('sol-cfg', cfg); m.remove(); draw(); } }))),
      h('small', { class: 'muted' }, L(`لعبت ${num(stats.played)} · فزت ${num(stats.won)} · أعلى نقاط ${num(stats.best)}${stats.bestT ? ' · أسرع فوز ' + fmt(stats.bestT) : ''}`, `Played ${stats.played} · Won ${stats.won} · Best ${stats.best}`)),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => m.remove() }, L('إغلاق', 'Close')));
    view.querySelector('.sol-opts')?.remove(); view.append(m);
  }

  // ============ السحب والإفلات ============
  function down(e) {
    const el = e.target.closest('.sol-card'); if (!el || winning || G.won || el.classList.contains('down') || el.classList.contains('nodrag')) return;
    const p = el.dataset.p, i = +el.dataset.i, src = pile(p);
    if (p[0] !== 't' && i !== src.length - 1) return;
    const els = p[0] === 't' ? [...board.querySelectorAll(`.sol-card[data-p="${p}"]`)].filter(c => +c.dataset.i >= i) : [el];
    drag = { p, i, els, x: e.clientX, y: e.clientY, moved: false, t: Date.now() };
    el.setPointerCapture?.(e.pointerId);
  }
  function mv(e) {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) { drag.moved = true; drag.els.forEach(c => c.classList.add('drag')); }
    drag.els.forEach(c => { c.style.transform = `translate(${dx}px, ${dy}px)`; });
    e.preventDefault();
  }
  let lastTap = { id: '', t: 0 };
  function up(e) {
    if (!drag) return; const d = drag; drag = null;
    if (!d.moved) { // نقرة: نقلة تلقائية ذكية (النقر المزدوج يرسل إلى الأساس)
      const id = d.p + d.i, dbl = lastTap.id === id && Date.now() - lastTap.t < 350; lastTap = { id, t: Date.now() };
      if (autoMove(d.p, d.i, false)) { draw(); return; }
      if (dbl) toast(L('لا توجد نقلة لهذه الورقة', 'No move for this card'));
      shake(d.els); return;
    }
    const r = d.els[0].getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 3, br = board.getBoundingClientRect();
    const col = Math.round((cx - br.left - ox - gap - cw / 2) / (cw + gap)), top = cy - br.top < cw * 1.4 + gap;
    let to = null;
    if (col >= 0 && col < 7) { if (top) { if (col >= 3) to = 'f:' + (col - 3); } else to = 't:' + col; }
    if (to && move(d.p, d.i, to)) { draw(); return; }
    // إفلات في مكان غير صالح: جرّب أقرب كومة أخرى تقبل الورقة
    d.els.forEach(c => { c.classList.add('back'); c.style.transform = ''; c.classList.remove('drag'); }); sound('error');
  }
  function shake(els) { els.forEach(c => { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }); }
  view.addEventListener('pointerdown', down); view.addEventListener('pointermove', mv, { passive: false }); view.addEventListener('pointerup', up); view.addEventListener('pointercancel', () => { if (drag) { drag.els.forEach(c => { c.style.transform = ''; c.classList.remove('drag'); }); drag = null; } });

  // ============ احتفال الفوز: تساقط الأوراق كما في ويندوز ============
  function cascade(bonus) {
    winning = true; draw(); const br = board.getBoundingClientRect();
    const cv = h('canvas', { class: 'sol-fx' }); document.body.append(cv);
    const dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const ch = cw * 1.4, list = [];
    for (let r = 13; r >= 1; r--) for (let f = 0; f < 4; f++) list.push({ c: G.found[f][r - 1], x: br.left + ox + gap + (3 + f) * (cw + gap), y: br.top });
    let k = 0, cur = null, end = performance.now() + 26000;
    const paint = (c, X, Y) => {
      g.fillStyle = '#fff'; g.strokeStyle = '#94a3b8'; g.lineWidth = 1; g.beginPath(); g.roundRect(X, Y, cw, ch, cw * .08); g.fill(); g.stroke();
      g.fillStyle = red(c) ? '#c81e1e' : '#111827'; g.font = `700 ${cw * .26}px Georgia, serif`; g.textAlign = 'left'; g.textBaseline = 'top';
      g.fillText(RL[c.r], X + cw * .07, Y + cw * .06); g.font = `${cw * .22}px serif`; g.fillText(SYM[c.s], X + cw * .07, Y + cw * .34);
      g.font = `${cw * .55}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(SYM[c.s], X + cw / 2, Y + ch / 2);
    };
    const step = (now) => {
      if (!alive || now > end || !document.body.contains(cv)) { cv.remove(); winning = false; draw(); return; }
      if (!cur) { if (k >= list.length) { setTimeout(() => { cv.remove(); winning = false; draw(); }, 600); return; } const s = list[k++]; cur = { ...s, vx: (Math.random() < .5 ? -1 : 1) * (2 + Math.random() * 4), vy: -Math.random() * 6 }; }
      for (let n = 0; n < 2 && cur; n++) {
        cur.vy += .45; cur.x += cur.vx; cur.y += cur.vy;
        if (cur.y + ch > innerHeight) { cur.y = innerHeight - ch; cur.vy *= -.78; }
        paint(cur.c, cur.x, cur.y);
        if (cur.x < -cw || cur.x > innerWidth) cur = null;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cv.addEventListener('click', () => { cv.remove(); });
    if (bonus) toast(L(`مكافأة السرعة: +${num(bonus)}`, `Time bonus: +${bonus}`), 'ok');
  }

  timer = setInterval(() => { const el = view.querySelector('.sol-time'); if (el && G && !G.won) el.textContent = fmt(elapsed()); }, 1000);
  const onResize = () => { if (!drag) draw(); }; addEventListener('resize', onResize);
  deal();
  return { unmount() { alive = false; clearInterval(timer); removeEventListener('resize', onResize); document.querySelector('.sol-fx')?.remove(); }, onLang() { draw(); } };
}
