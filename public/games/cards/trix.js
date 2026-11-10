// التريكس (الممالك): أربعة لاعبين، لكل لاعب مملكة من 5 عقود يختار ترتيبها: الشايب الكبة، والبنات، والديناري، واللطوش، والتريكس.
import { h, t, addDict, num, sound } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import { deck, shuffle, sortHand, SUITS, SYM, st, rk, rv, red, trickWinner, trickTable, roundCard, loadCss, resetLast, botAvoid, cardEl } from './common.js';
addDict({
  ar: {
    tx_king: 'الشايب الكبة', tx_kingD: '−75 لمن يأخذ شايب الكبة', tx_queens: 'البنات', tx_queensD: '−25 لكل بنت', tx_diamonds: 'الديناري', tx_diamondsD: '−10 لكل ورقة ديناري', tx_ltoosh: 'اللطوش', tx_ltooshD: '−15 لكل أكلة', tx_trex: 'التريكس', tx_trexD: '+200 و+150 و+100 و+50 حسب الترتيب',
    tx_choose: 'اختر العقد التالي في مملكتك', tx_kingdom: 'مملكة {name}', tx_contract: 'العقد', tx_double: 'هل تريد أن تُدبِل؟', tx_doubleD: 'إن أخذ غيرك الورقة المدبولة خسر ضعفها وكسبتَ نصفها، وإن أخذتها أنت خسرت ضعفها.',
    tx_noDouble: 'لا أريد', tx_doIt: 'دبِّل المحدد', tx_waitDouble: 'بانتظار قرار الدبل…', tx_doubled: 'مدبول', tx_mode: 'طول اللعبة', tx_one: 'مملكة واحدة', tx_full: 'أربع ممالك (20 جولة)', tx_dbl: 'الدبل',
    tx_on: 'مسموح', tx_off: 'بلا دبل', tx_noHeartLead: 'لا يجوز أن تبدأ بالكبة إلا إن لم يكن معك غيرها', tx_mustKing: 'يجب أن ترمي شايب الكبة لأن النوع الملعوب ليس معك', tx_trexHint: 'العب ولدًا (J) لتبدأ نوعًا، أو ورقة تلي طرف صف موجود', tx_passed: 'لا يملك {name} ورقة مناسبة، فمرّر', tx_dealPts: 'نقاط الجولة', tx_finish: 'الترتيب',
    tx_rules: `<h4>الفكرة</h4><p>أربعة لاعبين، كل لاعب لنفسه، و52 ورقة (13 لكل لاعب). صاحب <b>سبعة الكبة</b> في التوزيع الأول يبدأ أول «مملكة»، ثم تنتقل المملكة إلى اللاعب الذي على يمينه.</p>
<p>في كل مملكة 5 عقود، يختار صاحبها ترتيبها جولة بعد جولة، ويبدأ اللعب في كل عقد:</p>
<ol><li><b>الشايب الكبة</b>: من يأخذه يخسر 75. لا يجوز البدء بالكبة إلا إن لم يكن معك غيرها، ومن ليس معه النوع الملعوب وكان معه الشايب الكبة وجب أن يرميه. تنتهي الجولة حين يؤخذ.</li>
<li><b>البنات</b>: كل بنت تأخذها = −25.</li><li><b>الديناري</b>: كل ورقة ديناري تأخذها = −10.</li><li><b>اللطوش</b>: كل أكلة تأخذها = −15.</li>
<li><b>التريكس</b>: لا أكلات فيه؛ يبدأ صاحب المملكة، ويضع كل لاعب في دوره ولدًا (J) ليفتح صف نوع جديد، أو ورقة تلي طرف صف موجود صعودًا (Q ثم K ثم A) أو نزولًا (10 ثم 9 … حتى 2). ومن لا يملك ورقة مناسبة يمرّر. الأول الذي تنتهي أوراقه يكسب 200، ثم 150، ثم 100، ثم 50.</li></ol>
<h4>قواعد الأكلات</h4><p>يجب أن تلعب من النوع الملعوب إن كان معك، ويأخذ الأكلة أعلى ورقة منه. لا يوجد حكم. ترتيب القوة: الآس ثم الشايب ثم البنت ثم الولد ثم 10 … 2.</p>
<h4>الدبل (اختياري)</h4><p>في عقد الشايب وعقد البنات يمكن لصاحب الورقة أن يكشفها «مدبولة»: إن أخذها غيره خسر الآخذ الضعف (150 للشايب و50 للبنت) وكسب صاحبها النصف (75 أو 25). وإن أخذها صاحبها خسر الضعف.</p>
<p>مجموع نقاط كل مملكة دون دبل صفر، والفائز صاحب أعلى مجموع في النهاية.</p>`,
  },
  en: { tx_king: 'King of Hearts', tx_kingD: '−75 for taking K♥', tx_queens: 'Queens', tx_queensD: '−25 per queen', tx_diamonds: 'Diamonds', tx_diamondsD: '−10 per diamond', tx_ltoosh: 'Tricks', tx_ltooshD: '−15 per trick', tx_trex: 'Trex', tx_trexD: '+200/150/100/50 by finishing order', tx_choose: 'Choose the next contract', tx_kingdom: "{name}'s kingdom", tx_contract: 'Contract', tx_double: 'Double?', tx_doubleD: 'If someone else takes a doubled card they lose double and you gain half.', tx_noDouble: 'No', tx_doIt: 'Double selected', tx_waitDouble: 'Waiting for doubling…', tx_doubled: 'Doubled', tx_mode: 'Length', tx_one: 'One kingdom', tx_full: 'Four kingdoms (20 deals)', tx_dbl: 'Doubling', tx_on: 'On', tx_off: 'Off', tx_noHeartLead: "You can't lead hearts unless you only have hearts", tx_mustKing: 'Void in suit: you must play K♥', tx_trexHint: 'Play a jack to open a suit, or a card next to a row end', tx_passed: '{name} has no move and passes', tx_dealPts: 'Deal points', tx_finish: 'Finish', tx_rules: '<p>Kingdoms of five contracts: King of Hearts, Queens, Diamonds, Tricks (penalties) and Trex (layout, +200/150/100/50). Highest total wins.</p>' },
});
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706'];
const CONTRACTS = ['king', 'queens', 'diamonds', 'ltoosh', 'trex'];
const CIC = { king: '🤴🏻♥', queens: '👸', diamonds: '♦', ltoosh: '🃏', trex: '🪜' };
const J = 9; // رتبة الولد
function deal(s) {
  const d = shuffle(deck()); s.hands = [0, 1, 2, 3].map(i => sortHand(d.slice(i * 13, i * 13 + 13)));
  if (s.owner == null) s.owner = s.hands.findIndex(x => x.includes('7H'));
  s.phase = 'choose'; s.contract = null; s.trick = []; s.lastTrick = null; s.taken = [[], [], [], []]; s.tricksN = [0, 0, 0, 0];
  s.doubled = {}; s.dblDone = [true, true, true, true]; s.layout = { S: null, H: null, D: null, C: null }; s.finish = []; s.summary = null; s.log = null;
}
function danger(s) {
  const C = s.contract;
  return (c) => C === 'king' ? (c === 'KH' ? 100 : st(c) === 'H' ? 2 : 0) : C === 'queens' ? (rk(c) === 'Q' ? 25 : rk(c) === 'K' || rk(c) === 'A' ? 3 : 0) : C === 'diamonds' ? (st(c) === 'D' ? 10 + rv(c) : 0) : rv(c) + 1;
}
function legal(s, seat) {
  const hand = s.hands[seat];
  if (s.contract === 'trex') return hand.filter(c => trexOk(s, c));
  if (!s.trick.length) { if (s.contract === 'king') { const nh = hand.filter(c => st(c) !== 'H'); return nh.length ? nh : hand.slice(); } return hand.slice(); }
  const same = hand.filter(c => st(c) === st(s.trick[0].card)); if (same.length) return same;
  if (s.contract === 'king' && hand.includes('KH')) return ['KH'];
  return hand.slice();
}
function trexOk(s, c) { const L = s.layout[st(c)], r = rv(c); return L ? r === L.lo - 1 || r === L.hi + 1 : r === J; }
const doubleCards = (s, seat) => s.contract === 'king' ? s.hands[seat].filter(c => c === 'KH') : s.contract === 'queens' ? s.hands[seat].filter(c => rk(c) === 'Q') : [];
function finishDeal(s) {
  const p = [0, 0, 0, 0], C = s.contract;
  if (C === 'trex') s.finish.forEach((seat, i) => { p[seat] += [200, 150, 100, 50][i]; });
  else for (let i = 0; i < 4; i++) for (const c of s.taken[i]) {
    if (C === 'diamonds' && st(c) === 'D') p[i] -= 10;
    if ((C === 'king' && c === 'KH') || (C === 'queens' && rk(c) === 'Q')) {
      const v = C === 'king' ? 75 : 25, d = s.doubled[c];
      if (d == null) p[i] -= v; else { p[i] -= v * 2; if (d !== i) p[d] += v; }
    }
  }
  if (C === 'ltoosh') for (let i = 0; i < 4; i++) p[i] -= 15 * s.tricksN[i];
  for (let i = 0; i < 4; i++) s.scores[i] += p[i];
  s.done[s.owner].push(C);
  s.summary = { contract: C, pts: p, finish: s.finish.slice() };
  s.deals++;
  s.phase = s.deals >= s.total ? 'over' : 'dealEnd';
}
function trexAdvance(s) {
  for (let k = 0; k < 4; k++) {
    s.turn = (s.turn + 1) % 4;
    if (!s.hands[s.turn].length) continue;
    if (legal(s, s.turn).length) return;
    s.log = t('tx_passed', { name: s.players[s.turn].name });
  }
}
const def = {
  id: 'trix', name: { ar: 'التريكس', en: 'Trix' }, counts: [4], hidden: true, colors: COLORS,
  options: () => [
    { key: 'len', label: t('tx_mode'), choices: [['one', t('tx_one')], ['full', t('tx_full')]], def: 'one' },
    { key: 'dbl', label: t('tx_dbl'), choices: [['on', t('tx_on')], ['off', t('tx_off')]], def: 'on' }],
  rules: () => t('tx_rules'),
  init(players, o) { const s = { players, scores: [0, 0, 0, 0], owner: null, done: [[], [], [], []], deals: 0, total: o.len === 'full' ? 20 : 5, dbl: o.dbl !== 'off' }; deal(s); return s; },
  view(s, seat) {
    return { ...s, hands: undefined, hand: s.hands[seat], counts: s.hands.map(x => x.length), taken: s.taken.map(x => x.filter(c => danger({ contract: s.contract })(c) >= 10 || s.contract === 'diamonds' && st(c) === 'D')),
      legal: (s.phase === 'play' || s.phase === 'trex') && s.turn === seat ? legal(s, seat) : [], dblCards: s.phase === 'double' && !s.dblDone[seat] ? doubleCards(s, seat) : [] };
  },
  needs(s) { return s.phase === 'choose' ? [s.owner] : s.phase === 'double' ? [0, 1, 2, 3].filter(i => !s.dblDone[i]) : s.phase === 'play' || s.phase === 'trex' ? [s.turn] : s.phase === 'dealEnd' ? [0] : []; },
  apply(s, seat, a) {
    s.log = null;
    if (s.phase === 'dealEnd') {
      if (a.type !== 'next') return t('gk_err');
      if (s.done[s.owner].length >= 5) s.owner = (s.owner + 1) % 4;
      deal(s); return null;
    }
    if (s.phase === 'choose') {
      if (a.type !== 'contract' || !CONTRACTS.includes(a.c) || s.done[s.owner].includes(a.c)) return t('gk_err');
      s.contract = a.c; s.turn = s.owner;
      if (a.c === 'trex') { s.phase = 'trex'; if (!legal(s, s.turn).length) trexAdvance(s); return null; }
      if (s.dbl && (a.c === 'king' || a.c === 'queens')) { s.dblDone = [0, 1, 2, 3].map(i => !doubleCards(s, i).length); if (!s.dblDone.every(Boolean)) { s.phase = 'double'; return null; } }
      s.phase = 'play'; return null;
    }
    if (s.phase === 'double') {
      if (a.type !== 'double' || s.dblDone[seat]) return t('gk_err');
      for (const c of a.cards || []) if (doubleCards(s, seat).includes(c)) s.doubled[c] = seat;
      s.dblDone[seat] = true; if (s.dblDone.every(Boolean)) s.phase = 'play'; return null;
    }
    if (s.phase === 'trex') {
      if (a.type !== 'play' || !legal(s, seat).includes(a.card)) return t('tx_trexHint');
      const su = st(a.card), r = rv(a.card); s.hands[seat] = s.hands[seat].filter(c => c !== a.card);
      const L = s.layout[su]; if (!L) s.layout[su] = { lo: r, hi: r }; else if (r < L.lo) L.lo = r; else L.hi = r;
      if (!s.hands[seat].length) s.finish.push(seat);
      if (s.finish.length >= 3) { for (let i = 0; i < 4; i++) if (!s.finish.includes(i)) s.finish.push(i); finishDeal(s); return null; }
      trexAdvance(s); return null;
    }
    if (s.phase === 'play') {
      const L = legal(s, seat);
      if (a.type !== 'play' || !L.includes(a.card)) return s.contract === 'king' && L[0] === 'KH' && L.length === 1 ? t('tx_mustKing') : s.contract === 'king' && !s.trick.length ? t('tx_noHeartLead') : t('cx_follow');
      s.hands[seat] = s.hands[seat].filter(c => c !== a.card); s.trick.push({ seat, card: a.card });
      if (s.trick.length < 4) { s.turn = (seat + 1) % 4; return null; }
      const w = trickWinner(s.trick, null); s.taken[w].push(...s.trick.map(p => p.card)); s.tricksN[w]++;
      s.lastTrick = { cards: s.trick, winner: w }; s.trick = []; s.turn = w;
      const all = s.taken.flat(), C = s.contract;
      const end = !s.hands[0].length || (C === 'king' && all.includes('KH')) || (C === 'queens' && all.filter(c => rk(c) === 'Q').length === 4) || (C === 'diamonds' && all.filter(c => st(c) === 'D').length === 13);
      if (end) finishDeal(s);
      return null;
    }
    return t('gk_err');
  },
  bot(s, seat, lv) {
    if (s.phase === 'dealEnd') return { type: 'next' };
    if (s.phase === 'choose') {
      const hd = s.hands[seat], left = CONTRACTS.filter(c => !s.done[seat].includes(c));
      const hearts = hd.filter(c => st(c) === 'H').length, q = hd.filter(c => rk(c) === 'Q').length, dh = hd.filter(c => st(c) === 'D' && rv(c) >= 8).length, high = hd.filter(c => rv(c) >= 10).length;
      const sc = { king: hd.includes('KH') ? (hearts >= 4 ? 2 : -3) : 3, queens: 2 - q, diamonds: 2 - dh, ltoosh: 3 - high, trex: hd.filter(c => rv(c) >= 7 && rv(c) <= 11).length - 3 };
      return { type: 'contract', c: left.sort((a, b) => sc[b] - sc[a])[0] };
    }
    if (s.phase === 'double') { const cs = doubleCards(s, seat).filter(c => s.hands[seat].filter(x => st(x) === st(c)).length >= 4); return { type: 'double', cards: lv === 'easy' ? [] : cs }; }
    const L = legal(s, seat);
    if (s.phase === 'trex') {
      const hd = s.hands[seat]; const sc = (c) => (hd.some(x => st(x) === st(c) && Math.abs(rv(x) - rv(c)) === 1) ? 2 : 0) - (rv(c) === J ? 1 : 0) + Math.random() * .5;
      return { type: 'play', card: L.sort((a, b) => sc(b) - sc(a))[0] };
    }
    return { type: 'play', card: botAvoid(s.hands[seat], s.trick, L, danger(s), lv) };
  },
  botDelay: (s) => s.phase === 'dealEnd' ? 4500 : s.phase === 'double' || s.phase === 'choose' ? 900 : s.phase === 'play' && !s.trick.length && s.lastTrick ? 1300 : 750,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const order = [0, 1, 2, 3].sort((a, b) => s.scores[b] - s.scores[a]); const w = order[0];
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat, lines: order.map(k => ({ label: s.players[k].name, value: num(s.scores[k]), color: COLORS[k] })) };
  },
  status(v, ui) {
    if (v.phase === 'choose') return ui.myTurn ? t('tx_choose') : t('gk_turnOf', { name: ui.name(v.owner) });
    if (v.phase === 'double') return ui.myTurn ? t('tx_double') : t('tx_waitDouble');
    if (v.phase === 'dealEnd') return t('cx_round');
    return (v.contract ? t('tx_' + v.contract) + ' — ' : '') + (ui.myTurn ? t('cx_play') : t('gk_turnOf', { name: ui.name(v.turn) }));
  },
  render(el, v, ui) { renderTrix(el, v, ui); },
};
let dsel = new Set();
function renderTrix(el, v, ui) {
  let center = null, bar = null;
  if (v.phase === 'choose') {
    center = h('div', { class: 'cx-mid' }, h('div', { class: 'cx-panel' }, h('b', {}, '👑 ', t('tx_kingdom', { name: ui.name(v.owner) })),
      h('div', { class: 'cx-contracts' }, CONTRACTS.map(c => h('button', { type: 'button', class: v.done[v.owner].includes(c) ? 'done' : '', disabled: !ui.myTurn || v.done[v.owner].includes(c), onclick: () => ui.act({ type: 'contract', c }) },
        h('span', { style: { fontSize: '22px' } }, CIC[c]), t('tx_' + c), h('small', {}, t('tx_' + c + 'D')))))));
  } else if (v.phase === 'double') {
    center = h('div', { class: 'cx-mid' }, h('div', { class: 'cx-panel' }, h('b', {}, CIC[v.contract], ' ', t('tx_' + v.contract)), h('small', {}, v.dblCards.length ? t('tx_doubleD') : t('tx_waitDouble'))));
    if (v.dblCards.length && ui.myTurn) bar = h('div', { class: 'cx-btns' }, v.dblCards.map(c => h('button', { type: 'button', class: 'bg-pick' + (dsel.has(c) ? ' ok' : ''), onclick: () => { dsel.has(c) ? dsel.delete(c) : dsel.add(c); el.innerHTML = ''; renderTrix(el, v, ui); } }, cardEl(c, { cls: 'mini' }))),
      h('button', { type: 'button', class: 'bl-bid bl-bid-hokm', disabled: !dsel.size, onclick: () => { const c = [...dsel]; dsel = new Set(); ui.act({ type: 'double', cards: c }); } }, t('tx_doIt')),
      h('button', { type: 'button', class: 'bl-bid', onclick: () => { dsel = new Set(); ui.act({ type: 'double', cards: [] }); } }, t('tx_noDouble')));
  } else if (v.phase === 'trex' || (v.phase === 'dealEnd' && v.contract === 'trex')) {
    center = h('div', { class: 'cx-mid' }, h('div', { class: 'cx-layout' }, SUITS.map(su => {
      const L = v.layout[su];
      return h('div', { class: 'cx-lrow' }, h('b', { style: { width: '20px', color: red(su) ? '#fca5a5' : '#fff' } }, SYM[su]),
        Array.from({ length: 13 }, (_, r) => L && r >= L.lo && r <= L.hi ? cardEl('23456789TJQKA'[r] + su) : h('div', { class: 'slot' })));
    })), v.log ? h('small', { class: 'cx-flash' }, v.log) : null);
  }
  const score = h('div', {}, v.contract ? h('div', { class: 'bl-modeb' }, CIC[v.contract], ' ', t('tx_' + v.contract)) : null,
    [0, 1, 2, 3].map(i => h('div', { class: 'bl-srow', style: { borderColor: COLORS[i] } }, h('span', {}, i === v.owner ? '👑 ' : '', ui.name(i)), h('b', {}, num(v.scores[i])))),
    h('small', {}, num(v.deals + (v.phase === 'dealEnd' ? 0 : 1)), ' / ', num(v.total)));
  let overlay = null;
  if (v.phase === 'dealEnd' && v.summary) overlay = roundCard(t('tx_' + v.summary.contract), [0, 1, 2, 3].map(i => ui.name(i)), [[t('tx_dealPts'), ...v.summary.pts], [t('cx_total'), ...v.scores]], ui);
  const dbl = Object.keys(v.doubled || {});
  trickTable(el, v, ui, {
    n: 4, legal: new Set(v.legal), dimOthers: ui.myTurn && (v.phase === 'play' || v.phase === 'trex'), onPlay: (c) => { sound('place'); ui.act({ type: 'play', card: c }); }, cls: 'purple', lastBtn: v.phase === 'play',
    tag: (s) => h('span', {}, v.phase === 'play' && v.taken[s].length ? h('span', { class: 'cx-badge red' }, v.contract === 'ltoosh' ? num(v.tricksN[s]) : num(v.taken[s].length)) : null,
      v.phase === 'trex' && v.finish.includes(s) ? h('span', { class: 'cx-badge gold' }, '#', num(v.finish.indexOf(s) + 1)) : null,
      dbl.filter(c => v.doubled[c] === s).map(c => h('span', { class: 'cx-badge gold' }, '×2 ', c[0] === 'K' ? '🤴🏻' : '👸', SYM[c[1]]))),
    center, bar, score, overlay,
  });
}
export async function mount(root, ctx) { loadCss(); resetLast(); dsel = new Set(); return tableGame(root, ctx, def); }
export const _test = { def };
