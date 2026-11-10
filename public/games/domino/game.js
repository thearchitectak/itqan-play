// الدومينو بأنواعه: العادي بالسحب، والحبس بلا سحب، والأمريكاني (مضاعفات الخمسة مع «الشبرة» ذات الاتجاهات الأربعة)،
// والخمسات والثلاثات. للاعبين من 2 إلى 4، فرديًا أو فرقًا، على الجهاز نفسه أو ضد الكمبيوتر أو عبر الإنترنت.
import { h, t, addDict, sound, num, settings } from '../../assets/js/core.js';
import { tableGame, shuffle, pick } from '../../assets/js/gamekit.js';

addDict({
  ar: {
    dm_variant: 'نوع اللعب', dm_draw: 'عادي بالسحب', dm_block: 'حبس (بلا سحب)', dm_fives: 'أمريكاني (مضاعفات الخمسة)', dm_f3: 'خمسات وثلاثات',
    dm_face: 'شكل البلاطات', dm_pips: 'نقاط', dm_nums: 'أرقام ملونة', dm_math: 'مسائل حسابية (الدومينو الحسابي)', dm_mathHint: 'في الدومينو الحسابي يطابق اللاعب ناتج المسألة: نصف «2×3» يطابق «4+2».', dm_target: 'تنتهي اللعبة عند', dm_auto: 'حسب النوع (31 للأمريكاني)', dm_teams: 'طريقة اللعب لأربعة', dm_solo: 'كل لاعب لنفسه', dm_pairs: 'فريقان (كل اثنين متقابلين)',
    dm_pts: '{n} نقطة', dm_drawBtn: 'اسحب ورقة', dm_passBtn: 'مرّر الدور', dm_yourTurn: 'دورك: اختر ورقة', dm_mustDraw: 'لا ورقة تناسب، اسحب من الكومة', dm_mustPass: 'لا ورقة تناسب والكومة فارغة، مرّر',
    dm_pickEnd: 'اختر الطرف الذي تضعها فيه', dm_pile: 'الكومة', dm_round: 'الجولة {n}', dm_roundEnd: 'نهاية الجولة', dm_domino: '{name} أنهى أوراقه!', dm_blocked: 'اللعبة «قفلت»: لا أحد يستطيع اللعب',
    dm_gets: '{name} يأخذ {n} نقطة', dm_noPts: 'تعادل في الأرقام، لا نقاط', dm_next: 'الجولة التالية', dm_waitNext: 'بانتظار صاحب الغرفة…', dm_score: '+{n}', dm_left: 'باقي الأرقام',
    dm_mustStart: 'ابدأ بأكبر دوبل: {t}', dm_team: 'فريق {n}', dm_teamOf: 'فريق {a} و{b}', dm_target31: 'كل 5 = نقطة، واللعبة إلى 31',
    dm_rules: `<h4>الأساسيات</h4><ol><li>طقم الدومينو 28 ورقة من (0|0) إلى (6|6). توزّع 7 أوراق لكل لاعب (أو 5 في الأمريكاني والخمسات والثلاثات عند 3 أو 4 لاعبين).</li>
<li>تبدأ الجولة الأولى بصاحب أكبر «دوبل» ويلعبه، وفي الجولات التالية يبدأ الفائز بأي ورقة.</li>
<li>تضع في دورك ورقة يطابق أحد رقميها رقم أحد طرفي السلسلة. الدوبل يوضع عرضيًّا.</li></ol>
<h4>العادي بالسحب</h4><p>إن لم تجد ورقة مناسبة تسحب من الكومة حتى تجد، فإن فرغت الكومة تمرّر. من ينهي أوراقه أولًا يأخذ مجموع أرقام أوراق منافسيه.</p>
<h4>الحبس</h4><p>مثل العادي لكن بلا سحب: من لا يجد ورقة يمرّر. إن «قفلت» اللعبة ولم يستطع أحد اللعب، يفوز صاحب أقل مجموع.</p>
<h4>الأمريكاني (مضاعفات الخمسة)</h4><ol><li>الدوبل الأول يصبح «شبرة» تُلعب من <b>أربعة اتجاهات</b>: يمين ويسار أولًا، ثم أعلى وأسفل بعد أن يُلعب على جانبيه.</li>
<li>بعد كل ورقة تُجمع أرقام الأطراف المفتوحة، فإن كان المجموع من مضاعفات 5 تأخذ <b>نقطة عن كل 5</b> (10 = نقطتان، 15 = 3 نقاط…). الدوبل على الطرف يُحسب برقميه.</li>
<li>من ينهي أوراقه يأخذ أرقام منافسيه مقربة لأقرب 5 (كل 5 = نقطة). اللعبة إلى 31 نقطة (ويمكن تغيير الهدف).</li></ol>
<h4>الخمسات والثلاثات</h4><p>كالأمريكاني بلا شبرة: إن كان مجموع الطرفين من مضاعفات 5 تأخذ عدد الخمسات، وإن كان من مضاعفات 3 تأخذ عدد الثلاثات (15 = 5 + 3 = 8 نقاط). وتأخذ نقطة إضافية إن أنهيت أوراقك.</p>
<h4>الدومينو الحسابي</h4><p>اختر «مسائل حسابية» من شكل البلاطات: يظهر على كل نصف مسألة بدل النقاط، وتطابق النصفين إذا تساوى ناتجهما، فنصف «2×3» يطابق «4+2» و«12÷2».</p>
<h4>الفرق</h4><p>عند اللعب بأربعة يمكن اللعب فريقين: كل لاعبين متقابلين فريق واحد، ونقاطهما مشتركة.</p>
<h4>ماذا تتعلم؟</h4><p>الجمع السريع، ومضاعفات الأعداد، والتخطيط وتذكّر الأرقام التي لعبت.</p>`,
  },
  en: {
    dm_variant: 'Variant', dm_draw: 'Draw game', dm_block: 'Block (no drawing)', dm_fives: 'All Fives (American)', dm_f3: 'Fives & Threes',
    dm_face: 'Tile faces', dm_pips: 'Pips', dm_nums: 'Coloured numbers', dm_math: 'Maths problems (Math Dominoes)', dm_mathHint: 'In Math Dominoes, match results: “2×3” matches “4+2”.', dm_target: 'Play to', dm_auto: 'By variant (31 for All Fives)', dm_teams: 'Four-player mode', dm_solo: 'Every player alone', dm_pairs: 'Two teams (partners opposite)',
    dm_pts: '{n} points', dm_drawBtn: 'Draw a tile', dm_passBtn: 'Pass', dm_yourTurn: 'Your turn: pick a tile', dm_mustDraw: 'No tile fits — draw from the boneyard', dm_mustPass: 'No tile fits and the boneyard is empty — pass',
    dm_pickEnd: 'Choose the end to play on', dm_pile: 'Boneyard', dm_round: 'Round {n}', dm_roundEnd: 'End of round', dm_domino: '{name} is out of tiles!', dm_blocked: 'Blocked: nobody can play',
    dm_gets: '{name} scores {n}', dm_noPts: 'Tied pips — no points', dm_next: 'Next round', dm_waitNext: 'Waiting for the host…', dm_score: '+{n}', dm_left: 'Pips left',
    dm_mustStart: 'Start with the highest double: {t}', dm_team: 'Team {n}', dm_teamOf: 'Team {a} & {b}', dm_target31: 'Every 5 = 1 point, game to 31',
    dm_rules: `<ol><li>A double-six set (28 tiles). 7 tiles each (5 each in All Fives / Fives & Threes with 3–4 players).</li><li>The highest double opens the first round; later rounds are opened by the previous winner.</li><li>Match one end of the line with your tile. Doubles are placed crosswise.</li></ol><p><b>Draw:</b> draw until you can play; first out scores the opponents' pips. <b>Block:</b> no drawing; if blocked, lowest pips wins. <b>All Fives:</b> the first double is a four-way spinner; when the open ends total a multiple of 5 you score 1 point per 5; game to 31. <b>Fives & Threes:</b> score fives and threes of the end total.</p>`,
  },
});

const COLORS = ['#e53935', '#1e78d6', '#2e9d43', '#f2b705'];
const ALL = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) ALL.push([a, b]);
const pips = (tl) => tl[0] + tl[1];
const same = (x, y) => (x[0] === y[0] && x[1] === y[1]) || (x[0] === y[1] && x[1] === y[0]);
const isDbl = (tl) => tl[0] === tl[1];
const tname = (tl) => `${num(tl[0])}|${num(tl[1])}`;

// ---------- قواعد ----------
function teamOf(s, seat) { return s.teams ? seat % 2 : seat; }
function nTeams(s) { return s.teams ? 2 : s.n; }
function endsOf(s) {
  // يعيد قائمة الأطراف المفتوحة: { key, v, dbl }
  if (!s.root) return [];
  const r = s.root, out = [];
  const armEnd = (k, base) => { const arm = s.arms[k]; if (!arm.length) return { key: k, v: base, dbl: false, empty: true }; const last = arm[arm.length - 1]; return { key: k, v: last[1], dbl: last[0] === last[1] }; };
  if (s.spinner) {
    out.push(armEnd('E', r[0]), armEnd('W', r[0]));
    if (s.arms.E.length && s.arms.W.length) out.push(armEnd('N', r[0]), armEnd('S', r[0]));
  } else {
    out.push(armEnd('W', r[0]), armEnd('E', r[1]));
  }
  return out;
}
function countEnds(s) {
  const r = s.root; if (!r) return 0;
  let sum = 0;
  if (s.spinner) {
    const e = s.arms.E.length, w = s.arms.W.length;
    if (!e || !w) sum += r[0] * 2;
    for (const k of ['E', 'W', 'N', 'S']) { const arm = s.arms[k]; if (!arm.length) continue; const l = arm[arm.length - 1]; sum += l[0] === l[1] ? l[1] * 2 : l[1]; }
  } else {
    if (!s.arms.E.length && !s.arms.W.length) return isDbl(r) ? r[0] * 2 : r[0] + r[1];
    for (const [k, base] of [['W', r[0]], ['E', r[1]]]) { const arm = s.arms[k]; if (!arm.length) sum += isDbl(r) ? base * 2 : base; else { const l = arm[arm.length - 1]; sum += l[0] === l[1] ? l[1] * 2 : l[1]; } }
  }
  return sum;
}
function scoreFor(s, total) {
  if (s.variant === 'fives') return total > 0 && total % 5 === 0 ? total / 5 : 0;
  if (s.variant === 'f3') return (total > 0 && total % 5 === 0 ? total / 5 : 0) + (total > 0 && total % 3 === 0 ? total / 3 : 0);
  return 0;
}
function movesFor(s, hand) {
  const res = [];
  if (!s.root) {
    for (const tl of hand) if (!s.mustStart || same(tl, s.mustStart)) res.push({ tile: tl, end: 'C' });
    return res;
  }
  const ends = endsOf(s);
  for (const tl of hand) for (const e of ends) if (tl[0] === e.v || tl[1] === e.v) {
    // تجنب تكرار طرفين متماثلين للورقة نفسها حين يكون الطرفان فارغين متماثلين في الشبرة
    res.push({ tile: tl, end: e.key });
  }
  return res;
}
const canDraw = (s) => (s.variant === 'draw' || s.variant === 'fives') && s.pile.length > 0;

function deal(s) {
  const tiles = shuffle(ALL.map(x => x.slice()));
  const per = (s.variant === 'fives' || s.variant === 'f3') && s.n >= 3 ? 5 : 7;
  s.hands = Array.from({ length: s.n }, () => tiles.splice(0, per));
  s.pile = tiles;
  s.root = null; s.spinner = false; s.arms = { E: [], W: [], N: [], S: [] };
  s.passes = 0; s.last = null; s.flash = null; s.missing = Array.from({ length: s.n }, () => []);
  s.round++;
  if (s.round === 1 || s.starter == null) {
    // أكبر دوبل يبدأ، وإن لم يوجد فأثقل ورقة
    let best = null, who = 0;
    s.hands.forEach((hd, i) => hd.forEach(tl => { const key = (isDbl(tl) ? 100 : 0) + pips(tl) * 2 + tl[1] / 10; if (!best || key > best.key) best = { key, tl, i }; }));
    who = best.i; s.mustStart = best.tl.slice(); s.turn = who;
  } else { s.turn = s.starter; s.mustStart = null; }
  s.phase = 'play';
}
function place(s, tl, endKey) {
  if (!s.root) {
    s.root = tl[0] <= tl[1] ? tl.slice() : [tl[1], tl[0]];
    s.spinner = s.variant === 'fives' && isDbl(tl);
    return;
  }
  const e = endsOf(s).find(x => x.key === endKey);
  const inner = e.v, outer = tl[0] === inner ? tl[1] : tl[0];
  s.arms[endKey].push([inner, outer]);
}

function endRound(s, winnerSeat, blocked) {
  const handPips = s.hands.map(hd => hd.reduce((a, tl) => a + pips(tl), 0));
  const T = nTeams(s);
  const teamPips = Array(T).fill(0); handPips.forEach((p, i) => teamPips[teamOf(s, i)] += p);
  let wt = null;
  if (blocked) {
    const min = Math.min(...teamPips); const who = teamPips.map((p, i) => p === min ? i : -1).filter(i => i >= 0);
    wt = who.length === 1 ? who[0] : null;
  } else wt = teamOf(s, winnerSeat);
  let pts = 0;
  if (wt != null) {
    const other = teamPips.reduce((a, p, i) => i === wt ? a : a + p, 0);
    if (s.variant === 'fives') pts = Math.round(other / 5);
    else if (s.variant === 'f3') pts = 1;
    else pts = other;
    s.scores[wt] += pts;
    s.starter = blocked ? s.hands.map((hd, i) => i).filter(i => teamOf(s, i) === wt).sort((a, b) => handPips[a] - handPips[b])[0] : winnerSeat;
  }
  s.summary = { winnerSeat, blocked, wt, pts, handPips, hands: s.hands.map(hd => hd.map(x => x.slice())) };
  if (s.scores.some(x => x >= s.target)) { s.phase = 'over'; } else s.phase = 'roundEnd';
}

function nextTurn(s) { s.turn = (s.turn + 1) % s.n; }

// ---------- الكمبيوتر ----------
function botMove(s, seat, lv) {
  const hand = s.hands[seat];
  const moves = movesFor(s, hand);
  if (!moves.length) return canDraw(s) ? { type: 'draw' } : { type: 'pass' };
  if (lv === 'easy') { const m = pick(moves); return { type: 'play', tile: m.tile, end: m.end }; }
  const nextOpp = (seat + 1) % s.n;
  let best = null, bv = -Infinity;
  for (const m of moves) {
    const sim = JSON.parse(JSON.stringify({ root: s.root, spinner: s.spinner, arms: s.arms, variant: s.variant }));
    place(sim, m.tile, m.end);
    let v = 0;
    const gain = scoreFor(sim, countEnds(sim));
    v += gain * 30;
    v += pips(m.tile) * 1.5 + (isDbl(m.tile) ? 4 : 0);
    // تنويع: احتفظ بأرقام متنوعة في يدك
    const rest = hand.filter(x => !same(x, m.tile));
    const vals = new Set(rest.flatMap(x => x));
    v += vals.size * 1.2;
    // الأطراف الجديدة: هل يستطيع الخصم التالي اللعب عليها؟ (من الأرقام التي مرّر عليها سابقًا)
    const ends = endsOf(sim).map(e => e.v);
    if (ends.every(x => s.missing[nextOpp].includes(x))) v += 12;
    // في الفرق لا تحبس شريكك
    if (s.teams) { const partner = (seat + 2) % 4; if (ends.every(x => s.missing[partner].includes(x))) v -= 8; }
    // في الأمريكاني تجنب ترك مجموع يسهل على الخصم تحويله لخمسة
    if (s.variant === 'fives' || s.variant === 'f3') { const tot = countEnds(sim); for (let d = 0; d <= 6; d++) if (scoreFor(sim, tot + d) >= 2) v -= 2; }
    if (v > bv) { bv = v; best = m; }
  }
  return { type: 'play', tile: best.tile, end: best.end };
}

// ---------- التخطيط الهندسي للسلسلة ----------
// كل ورقة = مربعان (1×1) بمركزين c1 (الداخلي) و c2 (الخارجي)
function layout(v, aspect = 1.6) {
  const tiles = [], targets = {};
  if (!v.root) return { tiles, targets, box: [-3, -2, 6, 4] };
  const r = v.root;
  const rootCross = isDbl(r);
  if (rootCross) tiles.push({ c1: [0, -0.5], c2: [0, 0.5], a: r[0], b: r[1], root: true });
  else tiles.push({ c1: [-0.5, 0], c2: [0.5, 0], a: r[0], b: r[1], root: true });
  const half = rootCross ? 0.5 : 1;
  const L = Math.max(4.5, Math.min(v.spinner ? 10.5 : 12.5, aspect * 5.5 + (v.spinner ? 0 : 1.5))), LV = v.spinner ? Math.max(3.5, Math.min(6, 6 / aspect)) : 4.5;
  const arms = v.spinner
    ? { E: { p: [half, 0], d: [1, 0], t: [0, 1], lim: L, snake: false }, W: { p: [-half, 0], d: [-1, 0], t: [0, -1], lim: L, snake: false }, N: { p: [0, -1], d: [0, -1], t: [-1, 0], lim: LV, snake: false }, S: { p: [0, 1], d: [0, 1], t: [1, 0], lim: LV, snake: false } }
    : { E: { p: [half, 0], d: [1, 0], t: [0, 1], lim: L, snake: true }, W: { p: [-half, 0], d: [-1, 0], t: [0, -1], lim: L, snake: true } };
  const add = (p, q, k) => [p[0] + q[0] * k, p[1] + q[1] * k];
  // خطوة واحدة على ذراع: تعيد موضع الورقة والحالة التالية (دالة خالصة)
  const step = (A, st, tl) => {
    const { p, d, t, turned } = st;
    const dbl = tl[0] === tl[1];
    const len = dbl ? 1 : 2;
    const proj = (pt) => d[0] ? pt[0] * d[0] : pt[1] * d[1];
    const limit = turned && !A.snake ? Infinity : A.lim;
    if (!dbl && proj(add(p, d, len)) > limit) {
      const res = { c1: add(p, d, 0.5), c2: add(add(p, d, 0.5), t, 1) };
      const next = A.snake ? { p: add(p, t, 1), d: [-d[0], -d[1]], t, turned: true } : { p: add(add(p, d, 0.5), t, 1.5), d: t, t: d, turned: true };
      return [res, next];
    }
    const res = dbl ? { c1: add(add(p, d, 0.5), t, -0.5), c2: add(add(p, d, 0.5), t, 0.5), cross: true } : { c1: add(p, d, 0.5), c2: add(p, d, 1.5) };
    return [res, { p: add(p, d, len), d, t, turned }];
  };
  for (const k of Object.keys(arms)) {
    const A = arms[k]; let st = { p: A.p, d: A.d, t: A.t, turned: false };
    for (const tl of (v.arms[k] || [])) { const [g, nx] = step(A, st, tl); tiles.push({ ...g, a: tl[0], b: tl[1], arm: k }); st = nx; }
    const fin = st;
    targets[k] = (tl) => step(A, fin, tl)[0];
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const tl of tiles) for (const c of [tl.c1, tl.c2]) { x0 = Math.min(x0, c[0] - .5); y0 = Math.min(y0, c[1] - .5); x1 = Math.max(x1, c[0] + .5); y1 = Math.max(y1, c[1] + .5); }
  x0 -= 2.4; y0 -= 2.4; x1 += 2.4; y1 += 2.4;
  return { tiles, targets, box: [x0, y0, x1 - x0, y1 - y0] };
}

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); parent?.append(e); return e; };
const PIP = { 0: [], 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
const PIPC = ['#111', '#111', '#111', '#111', '#111', '#111', '#111'];
// الدومينو الحسابي: كل نصف يعرض مسألة ناتجها رقم النصف
const EXPR = { 0: ['3−3', '0×4', '5−5', '7−7'], 1: ['4−3', '1×1', '6−5', '9÷9'], 2: ['1+1', '6÷3', '8−6', '2×1'], 3: ['1+2', '9÷3', '6−3', '12÷4'], 4: ['2×2', '1+3', '8÷2', '9−5'], 5: ['2+3', '10÷2', '9−4', '15÷3'], 6: ['2×3', '4+2', '12÷2', '9−3'] };
let FACE = 'pips';
export function setFace(f) { FACE = f || 'pips'; }
function drawTile(g, c1, c2, a, b, cls = '') {
  const x = Math.min(c1[0], c2[0]) - 0.5, y = Math.min(c1[1], c2[1]) - 0.5, w = Math.abs(c1[0] - c2[0]) + 1, hh = Math.abs(c1[1] - c2[1]) + 1;
  const grp = sv('g', { class: 'dm-tile ' + cls }, g);
  sv('rect', { x: x + .04, y: y + .04, width: w - .08, height: hh - .08, rx: .14, class: 'dm-face' }, grp);
  const vert = Math.abs(c1[0] - c2[0]) < .01;
  if (vert) sv('line', { x1: x + .18, x2: x + w - .18, y1: (c1[1] + c2[1]) / 2, y2: (c1[1] + c2[1]) / 2, class: 'dm-div' }, grp);
  else sv('line', { y1: y + .18, y2: y + hh - .18, x1: (c1[0] + c2[0]) / 2, x2: (c1[0] + c2[0]) / 2, class: 'dm-div' }, grp);
  [[c1, a], [c2, b]].forEach(([c, n], hi) => {
    if (FACE === 'pips' || (FACE === 'math' && cls.includes('ghost') && false)) { for (const [px, py] of PIP[n] || []) sv('circle', { cx: c[0] + px * .25, cy: c[1] + py * .25, r: .085, fill: PIPC[n] }, grp); return; }
    const txt = FACE === 'nums' ? String(n) : EXPR[n][(a * 7 + b * 3 + hi * 5) % 4];
    const tx = sv('text', { x: c[0], y: c[1] + (FACE === 'nums' ? .2 : .1), 'text-anchor': 'middle', 'font-size': FACE === 'nums' ? .6 : (txt.length > 3 ? .27 : .32), 'font-weight': 800, fill: FACE === 'nums' ? ['#64748b', '#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#be185d'][n] : '#1e3a8a', direction: 'ltr', style: 'font-family: system-ui' }, grp); tx.textContent = txt;
  });
  return grp;
}
function tileSvg(tl, { vertical = true, cls = '' } = {}) {
  const svg = sv('svg', { viewBox: vertical ? '-0.5 -0.5 1 2' : '-0.5 -0.5 2 1', class: 'dm-hsvg ' + cls });
  drawTile(svg, [0, 0], vertical ? [0, 1] : [1, 0], tl[0], tl[1]);
  return svg;
}

// ---------- التعريف ----------
const def = {
  id: 'domino', name: { ar: 'الدومينو', en: 'Dominoes' }, counts: [2, 3, 4], defaultCount: 2, hidden: true, colors: COLORS, botDelay: 1000,
  options: () => [
    { key: 'variant', label: t('dm_variant'), choices: [['draw', t('dm_draw')], ['block', t('dm_block')], ['fives', t('dm_fives')], ['f3', t('dm_f3')]], def: 'draw', wide: true, rerender: true },
    { key: 'target', label: t('dm_target'), choices: [['auto', t('dm_auto')], [31, t('dm_pts', { n: num(31) })], [61, t('dm_pts', { n: num(61) })], [101, t('dm_pts', { n: num(101) })], [151, t('dm_pts', { n: num(151) })]], def: 'auto' },
    { key: 'face', label: t('dm_face'), choices: [['pips', t('dm_pips')], ['nums', t('dm_nums')], ['math', t('dm_math')]], def: 'pips', wide: true, hint: t('dm_mathHint') },
    { key: 'teams', label: t('dm_teams'), choices: [['solo', t('dm_solo')], ['pairs', t('dm_pairs')]], def: 'solo' },
  ],
  teams: (n, o) => n === 4 && o.teams === 'pairs' ? [0, 1, 0, 1] : null,
  rules: () => t('dm_rules'),
  init(players, o) {
    const variant = o.variant || 'draw';
    let target = (o.target !== 'auto' && +o.target) || (variant === 'fives' ? 31 : variant === 'f3' ? 61 : 101);
    const s = { face: o.face || 'pips', variant, target, players, n: players.length, teams: players.length === 4 && o.teams === 'pairs', round: 0, starter: null, scores: [] };
    s.scores = Array(nTeams(s)).fill(0);
    deal(s);
    return s;
  },
  view(s, seat) {
    const v = { ...s, hands: undefined, pile: undefined, me: seat, hand: seat >= 0 ? s.hands[seat] : [], counts: s.hands.map(x => x.length), pileN: s.pile.length };
    v.canDraw = canDraw(s);
    if (s.phase === 'play' && seat === s.turn) v.moves = movesFor(s, s.hands[seat]);
    if (s.phase !== 'play') v.summary = s.summary;
    delete v.missing;
    return v;
  },
  needs(s) { if (s.phase === 'play') return [s.turn]; if (s.phase === 'roundEnd') return [0]; return []; },
  apply(s, seat, a) {
    if (s.phase === 'roundEnd') { if (a.type !== 'next') return t('gk_err'); deal(s); return null; }
    if (s.phase !== 'play' || seat !== s.turn) return t('gk_err');
    const hand = s.hands[seat];
    s.flash = null;
    if (a.type === 'draw') {
      if (!canDraw(s) || movesFor(s, hand).length) return t('gk_err');
      hand.push(s.pile.pop()); s.last = { type: 'draw', seat };
      return null;
    }
    if (a.type === 'pass') {
      if (movesFor(s, hand).length || canDraw(s)) return t('gk_err');
      s.missing[seat].push(...endsOf(s).map(e => e.v));
      s.passes++; s.last = { type: 'pass', seat };
      if (s.passes >= s.n) { endRound(s, null, true); return null; }
      nextTurn(s); return null;
    }
    if (a.type !== 'play' || !Array.isArray(a.tile)) return t('gk_err');
    const idx = hand.findIndex(x => same(x, a.tile)); if (idx < 0) return t('gk_err');
    const ok = movesFor(s, hand).some(m => same(m.tile, a.tile) && m.end === (s.root ? a.end : 'C'));
    if (!ok) return s.mustStart ? t('dm_mustStart', { t: tname(s.mustStart) }) : t('gk_err');
    const tl = hand.splice(idx, 1)[0];
    place(s, tl, a.end);
    s.mustStart = null; s.passes = 0;
    const gain = scoreFor(s, countEnds(s));
    s.last = { type: 'play', seat, tile: tl, end: s.root && s.arms[a.end]?.length ? a.end : 'C', gain };
    if (gain) { s.scores[teamOf(s, seat)] += gain; s.flash = { seat, gain }; if (s.scores[teamOf(s, seat)] >= s.target) { s.summary = { winnerSeat: seat, pts: 0, handPips: s.hands.map(hd => hd.reduce((x, y) => x + pips(y), 0)), hands: s.hands, byScore: true, wt: teamOf(s, seat) }; s.phase = 'over'; return null; } }
    if (!hand.length) { endRound(s, seat, false); return null; }
    nextTurn(s);
    return null;
  },
  bot(s, seat, lv) { if (s.phase === 'roundEnd') return { type: 'next' }; return botMove(s, seat, lv); },
  botDelay: (s) => s.phase === 'roundEnd' ? 3500 : 1000,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const T = nTeams(s);
    const best = Math.max(...s.scores); const wt = s.scores.indexOf(best);
    const names = (team) => s.teams ? t('dm_teamOf', { a: s.players[team].name, b: s.players[team + 2].name }) : s.players[team].name;
    const lines = Array.from({ length: T }, (_, i) => i).sort((a, b) => s.scores[b] - s.scores[a]).map(i => ({ label: names(i), value: num(s.scores[i]), color: COLORS[i], avatar: s.teams ? null : s.players[i].avatar }));
    const mine = seat >= 0 ? teamOf(s, seat) : -1;
    return { title: mine === wt ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: names(wt) }), lines, win: mine === wt };
  },
  status(v, ui) {
    if (v.phase === 'roundEnd') return t('dm_roundEnd');
    if (v.phase === 'over') return t('gk_gameOver');
    if (!ui.myTurn) return t('gk_turnOf', { name: ui.name(v.turn) });
    if (v.moves?.length) return v.mustStart ? t('dm_mustStart', { t: tname(v.mustStart) }) : t('dm_yourTurn');
    return v.canDraw ? t('dm_mustDraw') : t('dm_mustPass');
  },
  render(el, v, ui) { renderDomino(el, v, ui); },
  preview() {
    setFace('pips');
    const v = { root: [6, 6], spinner: true, arms: { E: [[6, 3], [3, 3], [3, 5]], W: [[6, 1], [1, 4]], N: [[6, 2]], S: [] } };
    const svg = sv('svg', { class: 'dm-prev' }); const L = layout(v);
    svg.setAttribute('viewBox', L.box.join(' '));
    sv('rect', { x: L.box[0], y: L.box[1], width: L.box[2], height: L.box[3], fill: '#0f6b4b' }, svg);
    for (const tl of L.tiles) drawTile(svg, tl.c1, tl.c2, tl.a, tl.b);
    return svg;
  },
};

let picked = null; // الورقة التي اختارها اللاعب وينتظر اختيار الطرف
function renderDomino(el, v, ui) {
  setFace(v.face);
  const me = ui.seat, n = v.n;
  const wrap = h('div', { class: 'dm-wrap' + (n === 2 ? ' two' : '') });
  // المنافسون
  const others = []; for (let k = 1; k < n; k++) others.push((me + k) % n);
  const posOf = (s) => { const r = (s - me + n) % n; if (n === 2) return 'top'; if (n === 3) return r === 1 ? 'right' : 'left'; return ['bottom', 'right', 'top', 'left'][r]; };
  for (const s of others) {
    const backs = h('div', { class: 'dm-backs' }, Array.from({ length: v.counts[s] }, () => h('i')));
    wrap.append(h('div', { class: 'dm-opp dm-' + posOf(s) }, ui.plate(s, h('small', { class: 'dm-cnt' }, num(v.counts[s]))), backs,
      v.teams ? h('small', { class: 'dm-teamtag', style: { '--pc': COLORS[teamOf(v, s)] } }, t('dm_team', { n: num(teamOf(v, s) + 1) })) : null,
      v.last?.seat === s && v.last.type === 'pass' ? h('span', { class: 'dm-bubble' }, t('dm_passBtn')) : null,
      v.last?.seat === s && v.last.type === 'draw' ? h('span', { class: 'dm-bubble' }, '🂠 +1') : null,
      v.flash?.seat === s ? h('span', { class: 'dm-gain' }, t('dm_score', { n: num(v.flash.gain) })) : null));
  }
  // الطاولة
  const portrait = el.clientWidth < el.clientHeight;
  const L = layout(v, portrait ? Math.max(.55, el.clientWidth / Math.max(1, el.clientHeight - 260)) : Math.max(1, (el.clientWidth - 200) / Math.max(1, el.clientHeight - 230)));
  const svg = sv('svg', { class: 'dm-table', viewBox: L.box.join(' '), preserveAspectRatio: 'xMidYMid meet' });
  const mySel = picked && v.hand.some(x => same(x, picked)) && ui.myTurn ? picked : null;
  const moves = ui.myTurn ? (v.moves || []) : [];
  L.tiles.forEach((tl) => drawTile(svg, tl.c1, tl.c2, tl.a, tl.b));
  // إبراز آخر ورقة ملعوبة
  if (v.last?.type === 'play') {
    const k = v.last.end; const arm = k === 'C' ? null : v.arms[k];
    const armTiles = L.tiles.filter(y => y.arm === k);
    const idx = k === 'C' ? 0 : L.tiles.indexOf(armTiles[arm.length - 1]);
    const tl = L.tiles[idx]; if (tl) { const x = Math.min(tl.c1[0], tl.c2[0]) - .55, y = Math.min(tl.c1[1], tl.c2[1]) - .55; sv('rect', { x, y, width: Math.abs(tl.c1[0] - tl.c2[0]) + 1.1, height: Math.abs(tl.c1[1] - tl.c2[1]) + 1.1, rx: .2, class: 'dm-lastbox' }, svg); }
  }
  if (mySel) {
    const ends = moves.filter(m => same(m.tile, mySel)).map(m => m.end);
    for (const k of ends) {
      if (k === 'C') continue;
      if (!L.targets[k]) continue;
      const e = endsOf(v).find(x => x.key === k);
      const inner = e.v, outer = mySel[0] === inner ? mySel[1] : mySel[0];
      const tg = L.targets[k]([inner, outer]);
      const g = drawTile(svg, tg.c1, tg.c2, inner, outer, 'ghost');
      sv('rect', { x: Math.min(tg.c1[0], tg.c2[0]) - .6, y: Math.min(tg.c1[1], tg.c2[1]) - .6, width: Math.abs(tg.c1[0] - tg.c2[0]) + 1.2, height: Math.abs(tg.c1[1] - tg.c2[1]) + 1.2, rx: .25, class: 'dm-hit' }, g);
      g.addEventListener('click', () => { picked = null; sound('place'); ui.act({ type: 'play', tile: mySel, end: k }); });
    }
  }
  const total = v.root ? countEnds(v) : 0;
  const center = h('div', { class: 'dm-center' }, svg,
    (v.variant === 'fives' || v.variant === 'f3') && v.root ? h('span', { class: 'dm-sum' }, '∑ ', num(total)) : null,
    v.flash?.seat === me ? h('span', { class: 'dm-gain me' }, t('dm_score', { n: num(v.flash.gain) })) : null);
  wrap.append(center);
  // اللوحة الجانبية: النقاط والكومة
  const T = v.teams ? 2 : n;
  wrap.append(h('div', { class: 'dm-score' },
    h('div', { class: 'dm-sh' }, h('b', {}, t('dm_round', { n: num(v.round) })), h('small', {}, '🎯 ', num(v.target))),
    Array.from({ length: T }, (_, i) => h('div', { class: 'dm-srow', style: { '--pc': COLORS[i] } }, h('span', { class: 'grow' }, v.teams ? t('dm_team', { n: num(i + 1) }) : (v.players[i].avatar + ' ' + v.players[i].name)), h('b', {}, num(v.scores[i])))),
    v.variant === 'draw' || v.variant === 'fives' ? h('div', { class: 'dm-pile' }, '🁫 ', t('dm_pile'), ': ', h('b', {}, num(v.pileN))) : null));
  // يدي
  const playable = new Set(moves.map(m => tname(m.tile)));
  const handEl = h('div', { class: 'dm-hand' }, v.hand.map(tl => {
    const can = playable.has(tname(tl));
    const btn = h('button', { type: 'button', class: 'dm-htile' + (can ? ' can' : '') + (mySel && same(mySel, tl) ? ' sel' : ''), disabled: !can },
      tileSvg(tl));
    if (can) btn.addEventListener('click', () => {
      const ends = moves.filter(m => same(m.tile, tl));
      const uniq = [...new Set(ends.map(m => m.end))];
      // إن تطابقت الأطراف في القيمة والشكل اختر الأول تلقائيًا
      if (uniq.length === 1) { picked = null; sound('place'); ui.act({ type: 'play', tile: tl, end: uniq[0] }); return; }
      picked = tl; renderAgain();
    });
    return btn;
  }));
  const acts = h('div', { class: 'dm-acts' });
  if (ui.myTurn && v.phase === 'play' && !moves.length) {
    acts.append(v.canDraw ? h('button', { type: 'button', class: 'gk-bigbtn gk-pulse', onclick: () => { sound('draw'); ui.act({ type: 'draw' }); } }, '🁫 ', t('dm_drawBtn'))
      : h('button', { type: 'button', class: 'gk-bigbtn gk-pulse', style: { '--pc': '#64748b' }, onclick: () => ui.act({ type: 'pass' }) }, t('dm_passBtn')));
  }
  if (mySel) acts.append(h('span', { class: 'dm-hint' }, t('dm_pickEnd')));
  wrap.append(h('div', { class: 'dm-me' }, h('div', { class: 'dm-mebar' }, ui.plate(me), v.teams ? h('small', { class: 'dm-teamtag', style: { '--pc': COLORS[teamOf(v, me)] } }, t('dm_team', { n: num(teamOf(v, me) + 1) })) : null, acts), handEl));
  // ملخص الجولة
  if (v.phase === 'roundEnd' && v.summary) {
    const S = v.summary;
    const title = S.blocked ? t('dm_blocked') : t('dm_domino', { name: ui.name(S.winnerSeat) });
    const who = S.wt == null ? t('dm_noPts') : t('dm_gets', { name: v.teams ? t('dm_team', { n: num(S.wt + 1) }) : v.players[S.wt].name, n: num(S.pts) });
    wrap.append(h('div', { class: 'dm-roundend' }, h('div', { class: 'dm-rcard' },
      h('h3', {}, title), h('p', { class: 'dm-who' }, who),
      h('div', { class: 'dm-rhands' }, S.hands.map((hd, i) => h('div', { class: 'dm-rrow', style: { '--pc': COLORS[i] } }, h('span', {}, v.players[i].avatar, ' ', v.players[i].name), h('span', { class: 'dm-mini' }, hd.map(x => tileSvg(x, { vertical: false, cls: 'mini' }))), h('b', {}, num(S.handPips[i]))))),
      ui.needs.includes(me) ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('dm_next')) : h('p', { class: 'muted' }, ui.online ? t('dm_waitNext') : '…'))));
  }
  el.append(wrap);
  function renderAgain() { el.innerHTML = ''; renderDomino(el, v, ui); }
}

export async function mount(root, ctx) {
  if (!document.getElementById('dm-css')) document.head.append(h('link', { id: 'dm-css', rel: 'stylesheet', href: new URL('./domino.css', import.meta.url).href }));
  picked = null;
  return tableGame(root, ctx, def);
}
export const _test = { def, layout, endsOf, countEnds, movesFor };
