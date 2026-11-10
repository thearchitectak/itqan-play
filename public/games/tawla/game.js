// الطاولة (الزهر) بأنواعها الشائعة: العادة (بالضرب)، والمحبوسة (بالحبس)، والواحد والثلاثون (بلا ضرب ولا حبس).
import { h, t, addDict, sound, num, ico, is3d, gloss } from '../../assets/js/core.js';
import { tableGame, rnd, pick, dieFace } from '../../assets/js/gamekit.js';

addDict({
  ar: {
    tw_variant: 'نوع اللعب', tw_aada: 'العادة (بالضرب)', tw_mahbusa: 'المحبوسة', tw_31: 'الواحد والثلاثون', tw_target: 'تنتهي المباراة عند', tw_pts: '{n} نقاط', tw_31pts: '31 نقطة',
    tw_roll: 'ارمِ الزهر', tw_undo: 'تراجع', tw_pickFrom: 'اختر قطعة لتحريكها', tw_pickTo: 'اختر المكان', tw_noMoves: 'لا توجد حركة ممكنة', tw_bar: 'المضروبة', tw_off: 'المأكول',
    tw_gameEnd: 'انتهى الدور', tw_wins: '{name} أكل كل قطعه!', tw_mars: 'مارس! نقطتان', tw_getsN: '{name} يأخذ {n} نقطة', tw_next: 'الدور التالي', tw_waitNext: 'بانتظار صاحب الغرفة…', tw_match: 'المباراة',
    tw_rules: `<h4>الأساسيات</h4><ol><li>لكل لاعب 15 قطعة، وتتحرك قطع كل لاعب في اتجاه عكس الآخر حتى تصل إلى «البيت» (الربع الأخير)، ثم تبدأ «الأكل» أي إخراجها.</li>
<li>ترمي زهرين وتحرك قطعة أو قطعتين بعدد كل زهر. إن جاء «دبل» (مثل دوش 6-6) تلعب الرقم أربع مرات.</li>
<li>يجب أن تستخدم الزهرين إن أمكن، وإن أمكن واحد فقط فالأكبر.</li><li>لا تبدأ الأكل حتى تكون كل قطعك في بيتك.</li></ol>
<h4>العادة</h4><p>لا يجوز النزول على خانة فيها قطعتان أو أكثر للمنافس. إن نزلت على قطعة منفردة للمنافس «ضربتها» فتخرج إلى الوسط، ويجب عليه إدخالها قبل أي حركة أخرى. الفوز بنقطة، و«مارس» (قبل أن يأكل المنافس أي قطعة) بنقطتين.</p>
<h4>المحبوسة</h4><p>تبدأ القطع كلها في خانة واحدة. إن نزلت على قطعة منفردة للمنافس «حبستها» تحت قطعتك، فلا تتحرك حتى تغادر الخانة. النقاط مثل العادة.</p>
<h4>الواحد والثلاثون</h4><p>تبدأ القطع مثل المحبوسة، لكن لا يجوز النزول على أي خانة فيها قطعة للمنافس، فلا ضرب ولا حبس. الفائز يأخذ نقطة عن كل قطعة بقيت لمنافسه، والمباراة إلى 31 نقطة.</p>
<h4>ماذا تتعلم؟</h4><p>الجمع الذهني السريع، وحساب الاحتمالات، والتخطيط وإدارة المخاطرة.</p>`,
  },
  en: {
    tw_variant: 'Variant', tw_aada: 'Regular (hitting)', tw_mahbusa: 'Mahbousa (pinning)', tw_31: 'Thirty-one', tw_target: 'Match to', tw_pts: '{n} points', tw_31pts: '31 points',
    tw_roll: 'Roll', tw_undo: 'Undo', tw_pickFrom: 'Pick a checker', tw_pickTo: 'Pick a destination', tw_noMoves: 'No legal move', tw_bar: 'Bar', tw_off: 'Off',
    tw_gameEnd: 'Game over', tw_wins: '{name} bore off all checkers!', tw_mars: 'Gammon! 2 points', tw_getsN: '{name} scores {n}', tw_next: 'Next game', tw_waitNext: 'Waiting for the host…', tw_match: 'Match',
    tw_rules: `<ol><li>15 checkers each, moving in opposite directions to the home quarter, then bearing off.</li><li>Roll two dice; doubles are played four times. Use both dice if possible, otherwise the larger.</li></ol><p><b>Regular:</b> hit single checkers to the bar. <b>Mahbousa:</b> all start on one point; landing on a single opposing checker pins it. <b>31:</b> no landing on any opposing checker; the winner scores one point per opposing checker left, to 31.</p>`,
  },
});
const COLORS = ['#f5f0e1', '#5b3a1e'];
const SEATC = ['#d6b25e', '#5b3a1e'];

// إحداثيات: abs من 1 إلى 24. اللاعب 0 يتحرك من 24 نحو 1، واللاعب 1 من 1 نحو 24.
const pc = (P, a) => P === 0 ? a : 25 - a; // رقم الخانة من منظور اللاعب
const ab = (P, q) => P === 0 ? q : 25 - q;

function initBoard(variant) {
  const pts = Array.from({ length: 25 }, () => ({ o: -1, n: 0, pin: -1 }));
  const put = (P, q, n) => { const a = ab(P, q); pts[a] = { o: P, n, pin: -1 }; };
  if (variant === 'aada') for (const P of [0, 1]) { put(P, 24, 2); put(P, 13, 5); put(P, 8, 3); put(P, 6, 5); }
  else for (const P of [0, 1]) put(P, 24, 15);
  return pts;
}
const clonePos = (s) => ({ pts: s.pts.map(p => ({ ...p })), bar: s.bar.slice(), off: s.off.slice() });
function allHome(pos, P) {
  if (pos.bar[P]) return false;
  for (let a = 1; a <= 24; a++) { const p = pos.pts[a]; if ((p.o === P && p.n > 0 && pc(P, a) > 6) || (p.pin === P && pc(P, a) > 6)) return false; }
  return true;
}
function canLand(variant, pos, P, a) {
  const p = pos.pts[a];
  if (p.n === 0 && p.pin < 0) return true;
  if (p.o === P) return true;
  if (variant === '31') return false;
  if (variant === 'aada') return p.n === 1;
  // المحبوسة: يمكن حبس قطعة منفردة غير محبوس تحتها شيء
  return p.n === 1 && p.pin < 0;
}
function singleMoves(variant, pos, P, d) {
  const res = [];
  if (variant === 'aada' && pos.bar[P]) { const a = ab(P, 25 - d); if (canLand(variant, pos, P, a)) res.push({ from: 'bar', to: a, d }); return res; }
  const home = allHome(pos, P);
  let maxQ = 0; if (home) for (let a = 1; a <= 24; a++) if (pos.pts[a].o === P && pos.pts[a].n > 0) maxQ = Math.max(maxQ, pc(P, a));
  for (let a = 1; a <= 24; a++) {
    const p = pos.pts[a]; if (p.o !== P || p.n === 0) continue;
    const q = pc(P, a), tq = q - d;
    if (tq >= 1) { const ta = ab(P, tq); if (canLand(variant, pos, P, ta)) res.push({ from: a, to: ta, d }); }
    else if (home && (tq === 0 || q === maxQ)) res.push({ from: a, to: 'off', d });
  }
  return res;
}
function doMove(variant, pos, P, m) {
  if (m.from === 'bar') pos.bar[P]--;
  else { const p = pos.pts[m.from]; p.n--; if (p.n === 0) { if (p.pin >= 0) { p.o = p.pin; p.n = 1; p.pin = -1; } else p.o = -1; } }
  if (m.to === 'off') { pos.off[P]++; return null; }
  const q = pos.pts[m.to]; let hit = null;
  if (q.n > 0 && q.o !== P) {
    if (variant === 'aada') { pos.bar[q.o]++; hit = 'hit'; q.o = P; q.n = 1; return hit; }
    if (variant === 'mahbusa') { q.pin = q.o; q.o = P; q.n = 1; return 'pin'; }
  }
  if (q.n === 0) { q.o = P; q.n = 1; } else q.n++;
  return hit;
}
// كل التسلسلات القانونية الكاملة (لفرض استخدام أكبر عدد ممكن من الزهر)
function sequences(variant, pos, P, dice, dedupe = true) {
  const out = []; let best = 0;
  const seen = new Set();
  const rec = (ps, rem, path) => {
    let any = false;
    const tried = new Set();
    for (let i = 0; i < rem.length; i++) {
      const d = rem[i]; if (tried.has(d)) continue; tried.add(d);
      for (const m of singleMoves(variant, ps, P, d)) {
        any = true;
        const np = { pts: ps.pts.map(x => ({ ...x })), bar: ps.bar.slice(), off: ps.off.slice() };
        doMove(variant, np, P, m);
        rec(np, rem.slice(0, i).concat(rem.slice(i + 1)), path.concat([m]));
      }
    }
    if (!any) {
      if (path.length > best) { best = path.length; out.length = 0; }
      if (path.length === best) {
        const key = JSON.stringify(ps.pts.map(x => [x.o, x.n, x.pin])) + ps.bar + ps.off;
        out.push({ path, pos: ps, key });
      }
    }
  };
  rec(pos, dice, []);
  // إن أمكن استخدام زهر واحد فقط من زهرين مختلفين فيجب الأكبر
  if (best === 1 && dice.length === 2 && dice[0] !== dice[1]) {
    const hi = Math.max(...dice); const withHi = out.filter(x => x.path[0].d === hi);
    if (withHi.length) out.splice(0, out.length, ...withHi);
  }
  if (!dedupe) return out;
  return out.filter(q => { if (seen.has(q.key)) return false; seen.add(q.key); return true; });
}
function legalFirst(s) {
  const P = s.turn;
  const seqs = sequences(s.variant, s, P, s.left, false);
  const firsts = []; const k = new Set();
  for (const q of seqs) { const m = q.path[0]; if (!m) continue; const key = m.from + '>' + m.to + ':' + m.d; if (!k.has(key)) { k.add(key); firsts.push(m); } }
  return firsts;
}

function newGame(s) {
  s.pts = initBoard(s.variant); s.bar = [0, 0]; s.off = [0, 0];
  s.dice = null; s.left = []; s.phase = 'roll'; s.snap = null; s.last = null; s.msg = null; s.game++;
  if (s.starter == null) s.starter = rnd(2); else s.starter = 1 - s.starter;
  s.turn = s.starter;
}
function endTurn(s) { s.turn = 1 - s.turn; s.phase = 'roll'; s.left = []; s.snap = null; }
function finishGame(s, P) {
  const O = 1 - P;
  let pts;
  if (s.variant === '31') {
    pts = 15 - s.off[O];
  } else pts = s.off[O] === 0 ? 2 : 1;
  s.score[P] += pts;
  s.summary = { winner: P, pts, mars: s.variant !== '31' && s.off[O] === 0 };
  s.phase = s.score[P] >= s.target ? 'over' : 'gameEnd';
}

// تقييم الوضع للكمبيوتر
function evalPos(variant, pos, P) {
  const O = 1 - P; let v = 0;
  let pipP = pos.bar[P] * 25, pipO = pos.bar[O] * 25;
  for (let a = 1; a <= 24; a++) { const p = pos.pts[a]; if (p.n) { if (p.o === P) pipP += pc(P, a) * p.n; else pipO += pc(O, a) * p.n; } if (p.pin === P) pipP += pc(P, a); if (p.pin === O) pipO += pc(O, a); }
  v += (pipO - pipP) * 1.0 + pos.off[P] * 6 - pos.off[O] * 6;
  // نقاط مصنوعة ومكشوفة
  for (let a = 1; a <= 24; a++) {
    const p = pos.pts[a]; if (p.o !== P || !p.n) continue;
    const q = pc(P, a);
    if (p.n >= 2) v += q <= 6 ? 6 : q <= 12 ? 4 : 2;
    if (p.n === 1 && variant !== '31') {
      // خطر الضرب/الحبس: هل يوجد للخصم قطع خلفها ضمن مدى 12؟
      let danger = 0; for (let b = 1; b <= 24; b++) { const r = pos.pts[b]; if (r.o === O && r.n && pc(O, b) > pc(O, a)) { const dist = pc(O, b) - pc(O, a); if (dist <= 6) danger += 3; else if (dist <= 12) danger += 1; } }
      if (variant === 'aada' && pos.bar[O]) danger += 2;
      v -= danger * (variant === 'mahbusa' ? 2.5 : 1.8) * (q > 6 ? 1.2 : 1);
    }
    if (p.pin === O) v += 10 + pc(O, a) * 0.6;
  }
  for (let a = 1; a <= 24; a++) if (pos.pts[a].pin === P) v -= 12;
  if (variant === 'aada') v += pos.bar[O] * 8 - pos.bar[P] * 8;
  if (variant === '31') { // حجز الطريق أمام الخصم
    let block = 0; for (let a = 1; a <= 24; a++) if (pos.pts[a].o === P && pos.pts[a].n) block++;
    v += block * 1.5;
  }
  return v;
}

const def = {
  id: 'tawla', name: { ar: 'الطاولة', en: 'Backgammon (Tawla)' }, counts: [2], colors: SEATC, botDelay: 750,
  options: () => [
    { key: 'variant', label: t('tw_variant'), choices: [['aada', t('tw_aada')], ['mahbusa', t('tw_mahbusa')], ['31', t('tw_31')]], def: 'aada', wide: true },
    { key: 'target', label: t('tw_target'), choices: [[3, t('tw_pts', { n: num(3) })], [5, t('tw_pts', { n: num(5) })], [7, t('tw_pts', { n: num(7) })]], def: 3, hint: t('tw_31pts') + ' — ' + t('tw_31') },
  ],
  rules: () => t('tw_rules'),
  init(players, o) {
    const s = { variant: o.variant || 'aada', players, score: [0, 0], game: 0, starter: null };
    s.target = s.variant === '31' ? 31 : (+o.target || 3);
    newGame(s); return s;
  },
  view(s, seat) { const v = { ...s }; delete v.snap; if (s.phase === 'move' && seat === s.turn) v.firsts = legalFirst(s); v.canUndo = !!s.snap && s.snap.left.length !== s.left.length; return v; },
  needs: (s) => s.phase === 'roll' || s.phase === 'move' ? [s.turn] : s.phase === 'gameEnd' ? [0] : [],
  apply(s, seat, a) {
    if (s.phase === 'gameEnd') { if (a.type !== 'next') return t('gk_err'); newGame(s); return null; }
    if (seat !== s.turn) return t('gk_err');
    const P = seat;
    if (a.type === 'roll') {
      if (s.phase !== 'roll') return t('gk_err');
      const d1 = 1 + rnd(6), d2 = 1 + rnd(6);
      s.dice = [d1, d2]; s.left = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]; s.rollId = (s.rollId || 0) + 1;
      s.snap = { ...clonePos(s), left: s.left.slice() };
      s.phase = 'move'; s.msg = null;
      if (!legalFirst(s).length) { s.msg = { seat: P, k: 'tw_noMoves' }; endTurn(s); }
      return null;
    }
    if (a.type === 'undo') {
      if (s.phase !== 'move' || !s.snap) return t('gk_err');
      const sn = s.snap; s.pts = sn.pts.map(x => ({ ...x })); s.bar = sn.bar.slice(); s.off = sn.off.slice(); s.left = sn.left.slice(); s.last = null; return null;
    }
    if (a.type !== 'move' || s.phase !== 'move') return t('gk_err');
    const m = legalFirst(s).find(x => String(x.from) === String(a.from) && String(x.to) === String(a.to) && (a.d == null || x.d === a.d));
    if (!m) return t('gk_err');
    const ev = doMove(s.variant, s, P, m);
    s.left.splice(s.left.indexOf(m.d), 1);
    s.last = { seat: P, from: m.from, to: m.to, ev };
    if (s.off[P] === 15) { finishGame(s, P); return null; }
    if (!s.left.length || !legalFirst(s).length) endTurn(s);
    return null;
  },
  bot(s, seat, lv) {
    if (s.phase === 'gameEnd') return { type: 'next' };
    if (s.phase === 'roll') return { type: 'roll' };
    const seqs = sequences(s.variant, s, seat, s.left);
    if (!seqs.length || !seqs[0].path.length) return null;
    let best = seqs[0];
    if (lv === 'easy') best = Math.random() < 0.8 ? pick(seqs) : best;
    if (lv !== 'easy' || best === seqs[0]) { let bv = -Infinity; for (const q of seqs) { const v = evalPos(s.variant, q.pos, seat) + Math.random() * 0.1; if (v > bv) { bv = v; best = q; } } }
    const m = best.path[0];
    return { type: 'move', from: m.from, to: m.to, d: m.d };
  },
  botDelay: (s) => s.phase === 'gameEnd' ? 3000 : s.phase === 'roll' ? 700 : 550,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const w = s.score[0] >= s.target ? 0 : 1;
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat,
      lines: [0, 1].map(i => ({ label: s.players[i].name, avatar: s.players[i].avatar, value: num(s.score[i]), color: SEATC[i] })) };
  },
  status(v, ui) {
    if (v.phase === 'gameEnd') return t('tw_gameEnd');
    if (v.phase === 'over') return t('gk_gameOver');
    if (!ui.myTurn) return t('gk_turnOf', { name: ui.name(v.turn) });
    return v.phase === 'roll' ? t('tw_roll') : t('tw_pickFrom');
  },
  render(el, v, ui) { renderTawla(el, v, ui); },
  preview() { const v = { variant: 'aada', pts: initBoard('aada'), bar: [0, 0], off: [0, 0] }; const svg = boardSvg(v, 0, null, []); return svg; },
};

// ---------- الرسم ----------
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); parent?.append(e); return e; };
function slotX(i) { // i: 1..24 من منظور العارض
  if (i <= 6) return 13 - i; if (i <= 12) return 12 - i; if (i <= 18) return i - 13; return i - 12;
}
function boardSvg(v, viewer, sel, targets, onPoint) {
  const W = 15.4, H = 11;
  const svg = sv('svg', { viewBox: `-0.2 -0.2 ${W} ${H + 0.4}`, class: 'tw-svg' });
  const S = (tag, at, parent) => sv(tag, at, parent || svg);
  // تدرجات المثلثات وظل الإطار الداخلي (خشب حقيقي بمرشح عروق الخشب)
  const defs = S('defs', {});
  { const f = S('filter', { id: 'tw-wood', x: 0, y: 0, width: 1, height: 1 }, defs); S('feTurbulence', { type: 'fractalNoise', baseFrequency: '.18 3.2', numOctaves: 3, seed: 7, result: 't' }, f); S('feColorMatrix', { in: 't', type: 'matrix', values: '0 0 0 0 .22  0 0 0 0 .11  0 0 0 0 .03  0 0 0 -2.2 1.35', result: 'w' }, f); S('feComposite', { in: 'w', in2: 'SourceAlpha', operator: 'in', result: 'w2' }, f); const m = S('feMerge', {}, f); S('feMergeNode', { in: 'SourceGraphic' }, m); S('feMergeNode', { in: 'w2' }, m); }
  for (const [id, a, b] of [['tw-rt', '#c2533f', '#7f2a1d'], ['tw-gt', '#3f6b4f', '#1f3a29']]) for (const dir of ['t', 'b']) { const lg = S('linearGradient', { id: id + dir, x1: 0, y1: dir === 't' ? 0 : 1, x2: 0, y2: dir === 't' ? 1 : 0 }, defs); S('stop', { offset: 0, 'stop-color': a }, lg); S('stop', { offset: 1, 'stop-color': b }, lg); }
  const ig = S('radialGradient', { id: 'tw-in', cx: .5, cy: .5, r: .75 }, defs); S('stop', { offset: .6, 'stop-color': '#000', 'stop-opacity': 0 }, ig); S('stop', { offset: 1, 'stop-color': '#3b2412', 'stop-opacity': .35 }, ig);
  S('rect', { x: -0.2, y: -0.2, width: W, height: H + 0.4, rx: .35, fill: '#6b3f1d', filter: 'url(#tw-wood)' });
  S('rect', { x: 0, y: 0, width: 13, height: H, fill: '#e9d3a6', filter: 'url(#tw-wood)' });
  S('rect', { x: 6, y: 0, width: 1, height: H, fill: '#7c4a22', filter: 'url(#tw-wood)' });
  S('rect', { x: 13.2, y: 0, width: 1.8, height: H, rx: .2, fill: '#4a2b12', filter: 'url(#tw-wood)' });
  const view = (a) => viewer === 0 ? a : 25 - a; // رقم العرض
  for (let i = 1; i <= 24; i++) {
    const x = slotX(i), top = i > 12;
    const col = `url(#${(i % 2) ? 'tw-rt' : 'tw-gt'}${top ? 't' : 'b'})`;
    S('polygon', { points: top ? `${x},0 ${x + 1},0 ${x + .5},4.4` : `${x},${H} ${x + 1},${H} ${x + .5},${H - 4.4}`, fill: col, opacity: .95 });
  }
  S('rect', { x: 0, y: 0, width: 13, height: H, fill: 'url(#tw-in)', 'pointer-events': 'none' });
  const abs = (i) => viewer === 0 ? i : 25 - i;
  const ck = (cx, cy, P, extra = '') => { const g = S('g', { class: 'tw-ck ' + extra }); S('circle', { cx, cy, r: .45, fill: COLORS[P], stroke: P ? '#2d1a0b' : '#b9a77c', 'stroke-width': .06 }, g); S('circle', { cx, cy, r: .28, fill: 'none', stroke: P ? '#7a5434' : '#d9cfb3', 'stroke-width': .05 }, g); if (is3d()) S('circle', { cx, cy, r: .45, fill: gloss(svg) }, g); return g; };
  for (let i = 1; i <= 24; i++) {
    const a = abs(i), p = v.pts[a]; const x = slotX(i) + .5, top = i > 12;
    const stack = [];
    if (p.pin >= 0) stack.push({ P: p.pin, pinned: true });
    for (let k = 0; k < p.n; k++) stack.push({ P: p.o });
    const step = stack.length > 5 ? 4.0 / (stack.length - 1) : .92;
    stack.forEach((c, k) => {
      const cy = top ? .5 + k * step : H - .5 - k * step;
      const g = ck(x, cy, c.P, c.pinned ? 'pinned' : '');
      if (c.pinned) S('text', { x, y: cy + .17, 'text-anchor': 'middle', 'font-size': .45, fill: c.P ? '#fff' : '#111' }, g).textContent = '🔒';
    });
    if (stack.length > 5) S('text', { x, y: top ? 4.9 : H - 4.6, 'text-anchor': 'middle', 'font-size': .5, 'font-weight': 900, fill: '#3b2412' }).textContent = num(p.n);
    const hit = S('rect', { x: slotX(i), y: top ? 0 : H - 5.2, width: 1, height: 5.2, fill: 'transparent', class: 'tw-hit' });
    if (sel === a) S('rect', { x: slotX(i) + .04, y: top ? .02 : H - 5.18, width: .92, height: 5.16, rx: .1, class: 'tw-sel' });
    if (targets.includes(a)) S('rect', { x: slotX(i) + .04, y: top ? .02 : H - 5.18, width: .92, height: 5.16, rx: .1, class: 'tw-target' });
    if (onPoint) hit.addEventListener('click', () => onPoint(a));
    if (v.last && (v.last.to === a)) S('circle', { cx: x, cy: top ? .5 + Math.max(0, stack.length - 1) * Math.min(step, .92) : H - .5 - Math.max(0, stack.length - 1) * Math.min(step, .92), r: .52, fill: 'none', stroke: '#facc15', 'stroke-width': .07 });
  }
  // المضروبة في الوسط
  for (const P of [0, 1]) for (let k = 0; k < v.bar[P]; k++) { const mine = P === viewer; ck(6.5, mine ? H / 2 + .7 + k * .9 : H / 2 - .7 - k * .9, P, 'bar'); }
  if (onPoint && v.bar[viewer]) { const r = S('rect', { x: 6, y: H / 2, width: 1, height: H / 2, fill: 'transparent' }); r.addEventListener('click', () => onPoint('bar')); if (sel === 'bar') S('rect', { x: 6.04, y: H / 2, width: .92, height: H / 2 - .05, rx: .1, class: 'tw-sel' }); }
  // المأكول
  for (const P of [0, 1]) { const mine = P === viewer; for (let k = 0; k < v.off[P]; k++) S('rect', { x: 13.35, y: mine ? H - .35 - k * .33 : .05 + k * .33, width: 1.5, height: .28, rx: .06, fill: COLORS[P], stroke: '#000', 'stroke-width': .02 }); }
  if (targets.includes('off')) { const r = S('rect', { x: 13.25, y: H / 2, width: 1.7, height: H / 2 - .05, rx: .15, class: 'tw-target' }); if (onPoint) r.addEventListener('click', () => onPoint('off')); }
  void view;
  return svg;
}
let sel = null;
function renderTawla(el, v, ui) {
  const me = ui.seat < 0 ? 0 : ui.seat;
  const firsts = ui.myTurn && v.phase === 'move' ? (v.firsts || []) : [];
  if (sel != null && !firsts.some(m => String(m.from) === String(sel))) sel = null;
  if (v.bar[v.turn] && ui.myTurn && firsts.some(m => m.from === 'bar')) sel = 'bar';
  const targets = sel != null ? [...new Set(firsts.filter(m => String(m.from) === String(sel)).map(m => m.to))] : [];
  const onPoint = ui.myTurn && v.phase === 'move' ? (a) => {
    if (sel != null && targets.includes(a)) {
      const opts = firsts.filter(m => String(m.from) === String(sel) && m.to === a);
      const m = opts.sort((x, y) => x.d - y.d)[0];
      sound(m.to === 'off' ? 'capture' : 'move');
      const from = sel; sel = null; ui.act({ type: 'move', from, to: a, d: m.d }); return;
    }
    if (firsts.some(m => String(m.from) === String(a))) {
      sel = a;
      // إن كانت هناك وجهة واحدة فقط نحرك مباشرة
      const ts = [...new Set(firsts.filter(m => String(m.from) === String(a)).map(m => m.to))];
      if (ts.length === 1 && firsts.filter(m => String(m.from) === String(a)).length === 1) { const m = firsts.find(x => String(x.from) === String(a)); sel = null; sound('move'); ui.act({ type: 'move', from: a, to: m.to, d: m.d }); return; }
    } else sel = null;
    redraw();
  } : null;
  const svg = boardSvg(v, me, sel, targets, onPoint);
  const opp = 1 - me;
  const dbl = v.dice && v.dice[0] === v.dice[1];
  const dice = v.dice ? h('div', { class: 'tw-dice', key: v.rollId }, v.dice.map((d) => dieFace(d, (v.phase === 'move' && (dbl ? v.left.length : v.left.includes(d)) ? '' : ' used'))), dbl && v.phase === 'move' ? h('b', { class: 'tw-x' }, '×', num(v.left.length)) : null) : null;
  const center = h('div', { class: 'tw-ctl' },
    dice,
    ui.myTurn && v.phase === 'roll' ? h('button', { type: 'button', class: 'gk-bigbtn gk-pulse', style: { '--pc': SEATC[me] === '#d6b25e' ? '#b7791f' : '#5b3a1e' }, onclick: () => { sound('draw'); ui.act({ type: 'roll' }); } }, '🎲 ', t('tw_roll')) : null,
    ui.myTurn && v.phase === 'move' && v.canUndo ? h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { sel = null; ui.act({ type: 'undo' }); } }, ico('undo-2'), t('tw_undo')) : null,
    v.msg ? h('span', { class: 'tw-msg' }, ui.name(v.msg.seat), ': ', t(v.msg.k)) : null);
  const wrap = h('div', { class: 'tw-wrap' },
    h('div', { class: 'tw-top' }, ui.plate(opp, h('small', { class: 'tw-sc' }, num(v.score[opp]))), h('span', { class: 'tw-target-txt' }, t('tw_match'), ': ', num(v.target))),
    h('div', { class: 'tw-board' }, svg),
    h('div', { class: 'tw-bottom' }, ui.plate(me, h('small', { class: 'tw-sc' }, num(v.score[me]))), center));
  if (v.phase === 'gameEnd' && v.summary) {
    const S = v.summary;
    wrap.append(h('div', { class: 'tw-end' }, h('div', { class: 'dm-rcard tw-card' }, h('h3', {}, t('tw_wins', { name: ui.name(S.winner) })), S.mars ? h('p', { class: 'tw-mars' }, t('tw_mars')) : null,
      h('p', { class: 'dm-who' }, t('tw_getsN', { name: ui.name(S.winner), n: num(S.pts) })),
      h('p', {}, ui.name(0), ' ', num(v.score[0]), ' — ', num(v.score[1]), ' ', ui.name(1)),
      ui.needs.includes(me) ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('tw_next')) : h('p', { class: 'muted' }, t('tw_waitNext')))));
  }
  el.append(wrap);
  function redraw() { el.innerHTML = ''; renderTawla(el, v, ui); }
}

export async function mount(root, ctx) {
  if (!document.getElementById('tw-css')) document.head.append(h('link', { id: 'tw-css', rel: 'stylesheet', href: new URL('./tawla.css', import.meta.url).href }));
  if (!document.getElementById('dm-css')) document.head.append(h('link', { id: 'dm-css', rel: 'stylesheet', href: new URL('../domino/domino.css', import.meta.url).href }));
  sel = null;
  return tableGame(root, ctx, def);
}
export const _test = { def, sequences };
