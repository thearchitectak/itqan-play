// الطرنيب: أربعة لاعبين في فريقين، مزايدة من 7 إلى 13 أكلة، والفائز بالمزايدة يختار الطرنيب (الحكم).
import { h, t, addDict, num, sound } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import { deck, shuffle, sortHand, SUITS, SYM, st, rv, red, trickWinner, followable, trickTable, roundCard, loadCss, resetLast, botWin } from './common.js';
addDict({
  ar: {
    tn_bid: 'المزايدة', tn_pass: 'بَس', tn_yourBid: 'دورك في المزايدة: كم أكلة يأخذ فريقك؟', tn_choose: 'اختر الطرنيب', tn_trump: 'الطرنيب', tn_by: 'الطلب: {n} — {name}', tn_redeal: 'مرّر الجميع، أعيد التوزيع.',
    tn_made: 'نجح الطلب! ✅', tn_fail: 'لم يتحقق الطلب ❌', tn_kaboot: 'كبوت! أخذ الفريق الأكلات الثلاث عشرة 🎉', tn_need: 'المطلوب', tn_got: 'المأخوذ', tn_round: 'نقاط الجولة',
    tn_rules: `<h4>الفكرة</h4><p>أربعة لاعبين، كل شريكين متقابلين. 52 ورقة، لكل لاعب 13 ورقة. ترتيب القوة من الآس (الأعلى) إلى الاثنين.</p>
<h4>المزايدة</h4><ol><li>تبدأ من يمين الموزع، وكل لاعب يطلب عددًا من الأكلات بين <b>7 و13</b> يتعهد فريقه بأخذه، أو يقول «بَس» فيخرج من المزايدة.</li><li>يجب أن يكون كل طلب أعلى من السابق، وتنتهي المزايدة حين يمرر الثلاثة الآخرون.</li><li>إن مرر الجميع يعاد التوزيع.</li><li>صاحب أعلى طلب يختار نوع <b>الطرنيب</b>، ويبدأ اللعب.</li></ol>
<h4>اللعب</h4><ul><li>يجب أن تلعب من النوع الملعوب أولًا إن كان معك، وإلا فالعب ما شئت؛ ويمكنك أن «تطرنب» أي تقطع بورقة طرنيب.</li><li>يأخذ الأكلة أعلى طرنيب فيها، وإلا أعلى ورقة من النوع الملعوب أولًا. ومن يأخذ الأكلة يبدأ التي بعدها.</li></ul>
<h4>الحساب</h4><ul><li>إن حقق الفريق المزايد طلبه أو زاد عليه: يكسب عدد الأكلات التي أخذها، ولا يكسب الفريق الآخر شيئًا.</li><li>إن لم يحققه: يُخصم منه رقم طلبه، ويكسب الفريق الآخر عدد أكلاته.</li><li><b>الكبوت</b> (الأكلات الثلاث عشرة): 16 نقطة، و26 إن كان الطلب 13. وإن طلب 13 ولم يحققها يُخصم منه 16.</li><li>يفوز أول فريق يصل إلى الهدف (31 أو 41 أو 61).</li></ul>`,
  },
  en: { tn_bid: 'Bidding', tn_pass: 'Pass', tn_yourBid: 'Your bid: how many tricks will your team take?', tn_choose: 'Choose trump', tn_trump: 'Trump', tn_by: 'Bid: {n} — {name}', tn_redeal: 'Everyone passed — redealing.', tn_made: 'Contract made ✅', tn_fail: 'Contract failed ❌', tn_kaboot: 'All 13 tricks! 🎉', tn_need: 'Bid', tn_got: 'Taken', tn_round: 'Round points', tn_rules: '<p>Partnerships, bid 7–13 tricks, the winner names trump. Make it: score your tricks (opponents 0). Fail: lose your bid, opponents score their tricks. All 13: 16 (26 if bid). First to the target wins.</p>' },
});
const COLORS = ['#0f766e', '#b91c1c', '#0f766e', '#b91c1c'];
const team = (s) => s % 2;
function deal(s) {
  const d = shuffle(deck()); s.hands = [0, 1, 2, 3].map(i => sortHand(d.slice(i * 13, i * 13 + 13)));
  s.dealer = (s.dealer + 1) % 4; s.phase = 'bid'; s.bidTurn = (s.dealer + 1) % 4; s.bid = null; s.passed = [false, false, false, false]; s.bidLog = [];
  s.trump = null; s.trick = []; s.lastTrick = null; s.tricks = [0, 0]; s.played = []; s.summary = null;
}
function nextBidder(s) { let k = s.bidTurn; for (let i = 0; i < 4; i++) { k = (k + 1) % 4; if (!s.passed[k]) return k; } return -1; }
function trumpScore(hand, su) { const c = hand.filter(x => st(x) === su); return c.length * 2 + c.reduce((a, x) => a + Math.max(0, rv(x) - 8), 0); }
function estimate(hand) {
  const best = SUITS.slice().sort((a, b) => trumpScore(hand, b) - trumpScore(hand, a))[0];
  let e = 0;
  for (const su of SUITS) {
    const c = hand.filter(x => st(x) === su).map(rv);
    if (c.includes(12)) e += 1; if (c.includes(11) && c.length >= 2) e += .75; if (c.includes(10) && c.length >= 3) e += .4;
    if (su === best && c.length > 3) e += (c.length - 3) * .85;
    if (su !== best && c.length <= 1) e += .5;
  }
  return { e, best };
}
const def = {
  id: 'tarneeb', name: { ar: 'الطرنيب', en: 'Tarneeb' }, counts: [4], hidden: true, colors: COLORS,
  options: () => [{ key: 'target', label: t('cx_target'), choices: [[31, num(31)], [41, num(41)], [61, num(61)]], def: 41 }],
  teams: () => [0, 1, 0, 1],
  rules: () => t('tn_rules'),
  init(players, o) { const s = { players, scores: [0, 0], target: +o.target || 41, dealer: 3 }; deal(s); return s; },
  view(s, seat) { return { ...s, hands: undefined, hand: s.hands[seat], counts: s.hands.map(x => x.length), legal: s.phase === 'play' && s.turn === seat ? followable(s.hands[seat], s.trick) : [] }; },
  needs(s) { return s.phase === 'bid' ? [s.bidTurn] : s.phase === 'trump' ? [s.bid.by] : s.phase === 'play' ? [s.turn] : s.phase === 'roundEnd' ? [0] : []; },
  apply(s, seat, a) {
    s.flash = null;
    if (s.phase === 'roundEnd') { if (a.type !== 'next') return t('gk_err'); deal(s); return null; }
    if (s.phase === 'bid') {
      if (a.type !== 'bid') return t('gk_err');
      if (a.n === 'pass') s.passed[seat] = true;
      else { const n = +a.n; if (!(n >= 7 && n <= 13 && n > (s.bid?.n || 6))) return t('gk_err'); s.bid = { n, by: seat }; }
      s.bidLog.push({ seat, n: a.n });
      const active = s.passed.filter(x => !x).length;
      if (!s.bid && active === 0) { s.flash = t('tn_redeal'); deal(s); s.flash = t('tn_redeal'); return null; }
      if (s.bid && (active === 1 || s.bid.n === 13)) { s.phase = 'trump'; return null; }
      s.bidTurn = nextBidder(s); return null;
    }
    if (s.phase === 'trump') { if (a.type !== 'trump' || !SUITS.includes(a.suit)) return t('gk_err'); s.trump = a.suit; s.phase = 'play'; s.turn = s.bid.by; return null; }
    if (s.phase === 'play') {
      if (a.type !== 'play' || !followable(s.hands[seat], s.trick).includes(a.card)) return t('cx_follow');
      s.hands[seat] = s.hands[seat].filter(c => c !== a.card); s.trick.push({ seat, card: a.card }); s.played.push(a.card);
      if (s.trick.length < 4) { s.turn = (seat + 1) % 4; return null; }
      const w = trickWinner(s.trick, s.trump); s.tricks[team(w)]++; s.lastTrick = { cards: s.trick, winner: w }; s.trick = []; s.turn = w;
      if (!s.hands[0].length) score(s);
      return null;
    }
    return t('gk_err');
  },
  bot(s, seat, lv) {
    if (s.phase === 'roundEnd') return { type: 'next' };
    if (s.phase === 'bid') {
      const { e } = estimate(s.hands[seat]); const want = Math.floor(e + (lv === 'easy' ? 2 : 2.6) + (Math.random() - .5));
      const min = (s.bid?.n || 6) + 1; const forced = !s.bid && s.passed.filter(x => x).length === 3;
      if (forced) return { type: 'bid', n: Math.max(7, Math.min(13, want)) };
      if (s.bid && team(s.bid.by) === team(seat) && want < s.bid.n + 2) return { type: 'bid', n: 'pass' };
      return want >= min && min <= 13 ? { type: 'bid', n: min } : { type: 'bid', n: 'pass' };
    }
    if (s.phase === 'trump') return { type: 'trump', suit: estimate(s.hands[seat]).best };
    return { type: 'play', card: botWin(s.hands[seat], s.trick, s.trump, seat, (seat + 2) % 4, lv, s.played) };
  },
  botDelay: (s) => s.phase === 'roundEnd' ? 4500 : s.phase === 'play' && !s.trick.length && s.lastTrick ? 1300 : 800,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const w = s.scores[0] > s.scores[1] ? 0 : 1; const tn = (k) => t('cx_team', { a: s.players[k].name, b: s.players[k + 2].name });
    return { title: team(seat) === w ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: tn(w) }), win: team(seat) === w, lines: [0, 1].map(k => ({ label: tn(k), value: num(s.scores[k]), color: COLORS[k] })) };
  },
  status(v, ui) {
    if (v.phase === 'roundEnd') return t('cx_round');
    if (v.phase === 'bid') return ui.myTurn ? t('tn_bid') : t('gk_turnOf', { name: ui.name(v.bidTurn) });
    if (v.phase === 'trump') return ui.myTurn ? t('tn_choose') : t('gk_turnOf', { name: ui.name(v.bid.by) });
    return ui.myTurn ? t('cx_play') : t('gk_turnOf', { name: ui.name(v.turn) });
  },
  render(el, v, ui) {
    const me = ui.seat, my = team(me);
    const lastBid = (s) => { const x = [...v.bidLog].reverse().find(b => b.seat === s); return x ? h('span', { class: 'bl-bubble' + (x.n === 'pass' ? ' pass' : '') }, x.n === 'pass' ? t('tn_pass') : num(x.n)) : null; };
    let center = null, bar = null;
    if (v.phase === 'bid' || v.phase === 'trump') {
      center = h('div', { class: 'cx-mid' }, h('div', { class: 'cx-panel' },
        h('b', {}, v.phase === 'bid' ? t('tn_bid') : t('tn_choose')),
        v.bid ? h('span', { class: 'cx-badge gold' }, t('tn_by', { n: num(v.bid.n), name: ui.name(v.bid.by) })) : null,
        v.flash ? h('small', {}, v.flash) : null));
      if (ui.myTurn && v.phase === 'bid') bar = h('div', { class: 'cx-btns' }, h('small', { style: { width: '100%', textAlign: 'center' } }, t('tn_yourBid')),
        [7, 8, 9, 10, 11, 12, 13].map(n => h('button', { type: 'button', class: 'bl-bid bl-bid-hokm', disabled: n <= (v.bid?.n || 6), onclick: () => ui.act({ type: 'bid', n }) }, num(n))),
        h('button', { type: 'button', class: 'bl-bid', onclick: () => ui.act({ type: 'bid', n: 'pass' }) }, t('tn_pass')));
      if (ui.myTurn && v.phase === 'trump') bar = h('div', { class: 'cx-btns' }, SUITS.map(su => h('button', { type: 'button', class: 'bl-bid' + (red(su) ? ' bl-bid-hokm red' : ' bl-bid-hokm'), style: { fontSize: '26px' }, onclick: () => ui.act({ type: 'trump', suit: su }) }, SYM[su])));
    }
    const score = h('div', {},
      h('div', { class: 'bl-srow' }, h('span', {}, t('cx_us')), h('b', {}, num(v.scores[my]))),
      h('div', { class: 'bl-srow them' }, h('span', {}, t('cx_them')), h('b', {}, num(v.scores[1 - my]))),
      h('small', {}, '🎯 ', num(v.target)),
      v.trump ? h('div', { class: 'bl-modeb' }, t('tn_trump'), ' ', h('span', { style: { color: red(v.trump) ? '#b91c1c' : '#111' } }, SYM[v.trump]), ' · ', num(v.bid.n)) : null,
      v.phase === 'play' || v.phase === 'roundEnd' ? h('small', {}, t('cx_tricks'), ': ', num(v.tricks[my]), ' – ', num(v.tricks[1 - my])) : null);
    let overlay = null;
    if (v.phase === 'roundEnd' && v.summary) {
      const S = v.summary; const ord = [my, 1 - my];
      overlay = roundCard(t('cx_round'), ord.map(k => k === my ? t('cx_us') : t('cx_them')), [
        [t('tn_need'), ...ord.map(k => k === team(S.by) ? num(S.n) : '—')], [t('tn_got'), ...ord.map(k => S.tricks[k])], [t('tn_round'), ...ord.map(k => S.pts[k])], [t('cx_total'), ...ord.map(k => v.scores[k])]],
        ui, h('p', { class: 'dm-who' }, S.kaboot ? t('tn_kaboot') : S.made ? t('tn_made') : t('tn_fail')));
    }
    trickTable(el, v, ui, {
      n: 4, legal: new Set(v.legal), dimOthers: ui.myTurn && v.phase === 'play', onPlay: (c) => { sound('place'); ui.act({ type: 'play', card: c }); },
      tag: (s) => h('small', { class: 'bl-tag', style: { background: COLORS[s] } }, team(s) === my ? t('cx_us') : t('cx_them')),
      seatExtra: (s) => v.phase === 'bid' ? lastBid(s) : v.bid && v.bid.by === s && v.phase !== 'bid' ? h('span', { class: 'cx-badge gold' }, '📣 ', num(v.bid.n)) : null,
      meExtra: v.phase === 'bid' ? lastBid(me) : null,
      center, bar, score, overlay,
    });
  },
};
function score(s) {
  const bt = team(s.bid.by), n = s.bid.n, got = s.tricks[bt];
  const pts = [0, 0]; let made = got >= n, kaboot = got === 13;
  if (made) pts[bt] = kaboot ? (n === 13 ? 26 : 16) : got;
  else { pts[bt] = n === 13 ? -16 : -n; pts[1 - bt] = s.tricks[1 - bt]; }
  s.scores[0] += pts[0]; s.scores[1] += pts[1];
  s.summary = { by: s.bid.by, n, tricks: s.tricks.slice(), pts, made, kaboot };
  s.phase = (s.scores[0] >= s.target || s.scores[1] >= s.target) && s.scores[0] !== s.scores[1] ? 'over' : 'roundEnd';
}
export async function mount(root, ctx) { loadCss(); resetLast(); return tableGame(root, ctx, def); }
export const _test = { def };
