// منطق البلوت الخالص (بلا واجهة): الورق، والشراء، والأكلات، والمشاريع، والحساب، والكمبيوتر.
export const SUITS = ['S', 'H', 'D', 'C'];
export const RANKS = ['7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUIT_SYM = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const SUIT_AR = { S: 'سبيت', H: 'هاص', D: 'ديمن', C: 'شريها' };
export const RANK_AR = { '7': '7', '8': '8', '9': '9', T: '10', J: 'ولد', Q: 'بنت', K: 'شايب', A: 'إكه' };
export const RANK_LBL = { '7': '7', '8': '8', '9': '9', T: '10', J: 'J', Q: 'Q', K: 'K', A: 'A' };
const ORDER_PLAIN = ['7', '8', '9', 'J', 'Q', 'K', 'T', 'A'];     // ترتيب القوة في الصن وغير الحكم
const ORDER_TRUMP = ['7', '8', 'Q', 'K', 'T', 'A', '9', 'J'];     // ترتيب القوة في الحكم
const PTS_PLAIN = { '7': 0, '8': 0, '9': 0, J: 2, Q: 3, K: 4, T: 10, A: 11 };
const PTS_TRUMP = { '7': 0, '8': 0, Q: 3, K: 4, T: 10, A: 11, '9': 14, J: 20 };
const SEQ = ['7', '8', '9', 'T', 'J', 'Q', 'K', 'A']; // الترتيب الطبيعي للمشاريع
export const rk = (c) => c[0], st = (c) => c[1];
export const team = (seat) => seat % 2;

export function deck() { const d = []; for (const s of SUITS) for (const r of RANKS) d.push(r + s); return d; }
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function power(c, trump) { return st(c) === trump ? 100 + ORDER_TRUMP.indexOf(rk(c)) : ORDER_PLAIN.indexOf(rk(c)); }
export function points(c, trump) { return st(c) === trump ? PTS_TRUMP[rk(c)] : PTS_PLAIN[rk(c)]; }
export function sortHand(hand, trump) {
  const so = trump ? [trump, ...SUITS.filter(s => s !== trump)] : SUITS;
  return hand.slice().sort((a, b) => so.indexOf(st(a)) - so.indexOf(st(b)) || power(b, trump) - power(a, trump));
}
export function trickWinner(trick, trump) {
  const led = st(trick[0].card); let best = trick[0];
  for (const p of trick.slice(1)) {
    const c = p.card, b = best.card;
    if (st(c) === trump && st(b) !== trump) best = p;
    else if (st(c) === st(b) && power(c, trump) > power(b, trump)) best = p;
    else if (st(c) === led && st(b) !== led && st(b) !== trump) best = p;
  }
  return best.seat;
}
// الأوراق المسموح لعبها
export function legalCards(hand, trick, trump, seat) {
  if (!trick.length) return hand.slice();
  const led = st(trick[0].card);
  const same = hand.filter(c => st(c) === led);
  const winner = trickWinner(trick, trump);
  const bestTrump = Math.max(-1, ...trick.filter(p => st(p.card) === trump).map(p => power(p.card, trump)));
  if (same.length) {
    if (led === trump) { const higher = same.filter(c => power(c, trump) > bestTrump); return higher.length ? higher : same; }
    return same;
  }
  if (!trump) return hand.slice();
  const trumps = hand.filter(c => st(c) === trump);
  if (!trumps.length) return hand.slice();
  if (team(winner) === team(seat)) return hand.slice(); // الشريك رابح: لست ملزمًا بالقطع
  const over = trumps.filter(c => power(c, trump) > bestTrump);
  return over.length ? over : trumps;
}

// ---------- المشاريع ----------
const PROJ_RANK = { sara: 1, fifty: 2, hundred: 3, four100: 4 };
export const PROJ_NAME = { sara: 'سرا', fifty: 'خمسين', hundred: 'مية', four100: 'أربعمية', baloot: 'بلوت' };
export const PROJ_NAME_EN = { sara: 'Sequence of 3', fifty: 'Fifty', hundred: 'Hundred', four100: 'Four hundred', baloot: 'Belote' };
export function findProjects(hand, mode) {
  const res = []; const used = new Set();
  // أربعة من نوع
  for (const r of ['A', 'T', 'K', 'Q', 'J']) {
    const four = hand.filter(c => rk(c) === r);
    if (four.length === 4) {
      if (r === 'A' && mode === 'sun') { res.push({ type: 'four100', cards: four, top: 'A' }); four.forEach(c => used.add(c)); }
      else if (r !== 'A' || mode === 'hokm') { res.push({ type: 'hundred', cards: four, top: r, four: true }); four.forEach(c => used.add(c)); }
    }
  }
  // المتسلسلات من النوع نفسه
  for (const s of SUITS) {
    const idx = hand.filter(c => st(c) === s && !used.has(c)).map(c => SEQ.indexOf(rk(c))).sort((a, b) => a - b);
    let run = [];
    const flush = () => {
      if (run.length >= 3) {
        const type = run.length >= 5 ? 'hundred' : run.length === 4 ? 'fifty' : 'sara';
        res.push({ type, cards: run.map(i => SEQ[i] + s), top: SEQ[run[run.length - 1]], len: run.length });
      }
      run = [];
    };
    for (const i of idx) { if (run.length && i !== run[run.length - 1] + 1) flush(); run.push(i); }
    flush();
  }
  return res;
}
export function projValue(p, mode) {
  const raw = { sara: 20, fifty: 50, hundred: 100, four100: 400 }[p.type];
  return mode === 'sun' ? raw / 5 : raw / 10; // بالنقاط النهائية
}
function projKey(p) { return PROJ_RANK[p.type] * 100 + SEQ.indexOf(p.top) * 10 + (p.len || 4); }

// ---------- تقييم اليد للشراء ----------
export function handStrength(hand, mode, suit) {
  if (mode === 'sun') {
    let v = 0;
    for (const c of hand) { if (rk(c) === 'A') v += 3; else if (rk(c) === 'T') { v += hand.includes('A' + st(c)) ? 2 : 1; } else if (rk(c) === 'K') v += 0.5; }
    return v;
  }
  let v = 0; const tr = hand.filter(c => st(c) === suit);
  for (const c of tr) v += { J: 3.5, '9': 2.5, A: 1.6, T: 1.2, K: .8, Q: .7, '8': .5, '7': .5 }[rk(c)];
  for (const c of hand) if (st(c) !== suit && rk(c) === 'A') v += 1;
  return v;
}

// ---------- الجولة ----------
export function newRound(s) {
  const d = shuffle(deck());
  s.hands = [0, 1, 2, 3].map(() => d.splice(0, 5));
  s.up = d.splice(0, 1)[0]; s.rest = d;
  s.phase = 'bid1'; s.bid = null; s.bidTurn = (s.dealer + 1) % 4; s.bidCount = 0; s.bidLog = [];
  s.trick = []; s.tricks = 0; s.raw = [0, 0]; s.taken = [0, 0]; s.lastTrick = null; s.projects = []; s.baloot = null; s.summary = null; s.declared = false; s.played = []; s.projWinner = null;
  s.round = (s.round || 0) + 1;
}
export function bidOptions(s, seat) {
  if (s.bidTurn !== seat) return [];
  const opts = ['pass'];
  if (s.phase === 'bid1') {
    if (!s.bid || s.bid.type === 'hokm') opts.push('sun');
    if (!s.bid) { opts.push('hokm'); if (s.bidCount >= 2) opts.push('ashkal'); }
  } else if (s.phase === 'bid2') {
    if (!s.bid || s.bid.type === 'hokm') opts.push('sun');
    if (!s.bid) for (const su of SUITS) if (su !== st(s.up)) opts.push('hokm:' + su);
  }
  return opts;
}
export function applyBid(s, seat, choice) {
  const opts = bidOptions(s, seat);
  if (!opts.includes(choice)) return false;
  s.bidLog.push({ seat, choice });
  if (choice === 'sun' || choice === 'ashkal') { s.bid = { type: 'sun', by: seat, ashkal: choice === 'ashkal' }; return startPlay(s), true; }
  if (choice === 'hokm') s.bid = { type: 'hokm', suit: st(s.up), by: seat };
  else if (choice.startsWith('hokm:')) s.bid = { type: 'hokm', suit: choice.slice(5), by: seat };
  s.bidCount++;
  s.bidTurn = (s.bidTurn + 1) % 4;
  if (s.bidCount >= 4) {
    if (s.bid) { startPlay(s); return true; }
    if (s.phase === 'bid1') { s.phase = 'bid2'; s.bidCount = 0; s.bidTurn = (s.dealer + 1) % 4; }
    else { s.dealer = (s.dealer + 1) % 4; s.redeals = (s.redeals || 0) + 1; newRound(s); s.flash = 'redeal'; }
  } else if (s.bid && s.bid.type === 'hokm' && s.phase === 'bid1') {
    // بعد الحكم يكمل الباقون فرصة الصن فقط حتى يعود الدور
  }
  return true;
}
function startPlay(s) {
  const b = s.bid;
  const taker = b.ashkal ? (b.by + 2) % 4 : b.by;
  s.hands[taker].push(s.up);
  let k = 0;
  for (let i = 0; i < 4; i++) { const need = 8 - s.hands[i].length; s.hands[i].push(...s.rest.slice(k, k + need)); k += need; }
  s.rest = [];
  s.mode = b.type; s.trump = b.type === 'hokm' ? b.suit : null;
  s.phase = 'play'; s.leader = (s.dealer + 1) % 4; s.turn = s.leader; s.trick = [];
  // المشاريع تُكتشف تلقائيًا وتُعلن في الأكلة الأولى
  s.projects = [];
  for (let i = 0; i < 4; i++) for (const p of findProjects(s.hands[i], s.mode)) s.projects.push({ ...p, seat: i });
  if (s.mode === 'hokm') for (let i = 0; i < 4; i++) if (s.hands[i].includes('K' + s.trump) && s.hands[i].includes('Q' + s.trump)) s.baloot = { seat: i };
}
export function playCard(s, seat, card) {
  if (s.phase !== 'play' || s.turn !== seat) return false;
  const hand = s.hands[seat];
  if (!hand.includes(card) || !legalCards(hand, s.trick, s.trump, seat).includes(card)) return false;
  hand.splice(hand.indexOf(card), 1);
  s.trick.push({ seat, card });
  (s.played ||= []).push(card);
  s.flash = null;
  if (s.trick.length < 4) { s.turn = (seat + 1) % 4; return true; }
  const w = trickWinner(s.trick, s.trump);
  const pts = s.trick.reduce((a, p) => a + points(p.card, s.trump), 0);
  s.raw[team(w)] += pts; s.taken[team(w)]++; s.tricks++;
  s.lastTrick = { cards: s.trick.slice(), winner: w };
  s.trick = []; s.leader = w; s.turn = w;
  if (s.tricks === 8) { s.raw[team(w)] += 10; endRound(s); }
  return true;
}
function endRound(s) {
  const mode = s.mode, buyer = team(s.bid.by);
  // المشاريع: يأخذها الفريق صاحب أعلى مشروع فقط
  let projPts = [0, 0];
  if (s.projects.length) {
    const best = s.projects.reduce((a, p) => projKey(p) > projKey(a) ? p : a);
    const bt = team(best.seat);
    for (const p of s.projects) if (team(p.seat) === bt) projPts[bt] += projValue(p, mode);
    s.projWinner = bt;
  }
  const balootPts = [0, 0]; if (s.baloot) balootPts[team(s.baloot.seat)] += 2;
  const conv = (raw) => mode === 'sun' ? Math.round(raw / 5) : Math.floor((raw + 4) / 10);
  let pts = [conv(s.raw[0]), conv(s.raw[1])];
  // تصحيح التقريب ليكون المجموع 26 في الصن و16 في الحكم
  const total = mode === 'sun' ? 26 : 16;
  if (pts[0] + pts[1] !== total) { const hi = s.raw[0] >= s.raw[1] ? 0 : 1; pts[1 - hi] = total - pts[hi]; }
  let kaboot = null;
  if (s.taken[0] === 8 || s.taken[1] === 8) { kaboot = s.taken[0] === 8 ? 0 : 1; pts = [0, 0]; pts[kaboot] = mode === 'sun' ? 44 : 25; }
  const tot = [pts[0] + projPts[0] + balootPts[0], pts[1] + projPts[1] + balootPts[1]];
  let lost = false;
  if (kaboot == null && tot[buyer] <= tot[1 - buyer]) {
    // «خسرانة»: يأخذ الفريق الآخر نقاط الجولة كاملة مع المشاريع
    lost = true;
    tot[1 - buyer] = total + projPts[0] + projPts[1] + balootPts[1 - buyer];
    tot[buyer] = balootPts[buyer];
  }
  s.scores[0] += tot[0]; s.scores[1] += tot[1];
  s.summary = { mode, trump: s.trump, buyer, raw: s.raw.slice(), pts, projPts, balootPts, tot, kaboot, lost, projects: s.projects.map(p => ({ type: p.type, seat: p.seat, cards: p.cards })), projWinner: s.projWinner };
  s.phase = s.scores.some(x => x >= s.target) && s.scores[0] !== s.scores[1] ? 'over' : 'roundEnd';
}
export function nextRound(s) { s.dealer = (s.dealer + 1) % 4; newRound(s); }

// ---------- الكمبيوتر ----------
export function botBid(s, seat, lv) {
  const opts = bidOptions(s, seat); const hand = s.hands[seat];
  const withUp = hand.concat([s.up]);
  const sun = handStrength(withUp, 'sun');
  const th = lv === 'easy' ? 1.3 : 1;
  if (opts.includes('sun') && sun >= 8.5 * th) return 'sun';
  if (s.phase === 'bid1' && opts.includes('hokm')) { if (handStrength(withUp, 'hokm', st(s.up)) >= 7 * th) return 'hokm'; }
  if (s.phase === 'bid2') {
    let best = null, bv = 0;
    for (const o of opts) if (o.startsWith('hokm:')) { const v = handStrength(hand, 'hokm', o.slice(5)); if (v > bv) { bv = v; best = o; } }
    if (best && bv >= 6.5 * th) return best;
    if (opts.includes('sun') && handStrength(hand, 'sun') >= 7 * th) return 'sun';
  }
  return 'pass';
}
export function botPlay(s, seat, lv) {
  const hand = s.hands[seat], tr = s.trump;
  const legal = legalCards(hand, s.trick, tr, seat);
  if (lv === 'easy' && Math.random() < .45) return legal[Math.floor(Math.random() * legal.length)];
  const low = (cs) => cs.slice().sort((a, b) => points(a, tr) - points(b, tr) || power(a, tr) - power(b, tr))[0];
  const high = (cs) => cs.slice().sort((a, b) => power(b, tr) - power(a, tr))[0];
  const played = new Set((s.played || []));
  if (!s.trick.length) {
    // ابدأ بأوراق رابحة مؤكدة: إكه النوع، أو ولد الحكم
    if (tr) { const j = 'J' + tr; if (legal.includes(j)) return j; }
    const sure = legal.filter(c => st(c) !== tr && (rk(c) === 'A' || (rk(c) === 'T' && played.has('A' + st(c)))));
    if (sure.length) return sure[0];
    return low(legal);
  }
  const w = trickWinner(s.trick, tr);
  const partnerWins = team(w) === team(seat);
  const last = s.trick.length === 3;
  const winning = legal.filter(c => trickWinner(s.trick.concat([{ seat, card: c }]), tr) === seat);
  if (partnerWins) {
    const pc = s.trick.find(p => p.seat === w).card;
    const strong = (st(pc) === tr && power(pc, tr) >= 106) || (st(pc) !== tr && rk(pc) === 'A') || last;
    if (strong) { const nonTrump = legal.filter(c => st(c) !== tr); const pool = nonTrump.length ? nonTrump : legal; return pool.slice().sort((a, b) => points(b, tr) - points(a, tr))[0]; }
    return low(legal);
  }
  if (winning.length) {
    if (last) return winning.slice().sort((a, b) => power(a, tr) - power(b, tr))[0];
    const big = winning.filter(c => rk(c) === 'A' || (st(c) === tr && (rk(c) === 'J' || rk(c) === '9')));
    if (big.length) return big[0];
    return high(winning);
  }
  return low(legal);
}
