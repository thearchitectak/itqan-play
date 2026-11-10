// الليخة: أربعة لاعبين، تجنّب أخذ الكبة (نقطة لكل ورقة) والبنت السبيت (13) والعشرة الديناري (10).
// يمرر كل لاعب 3 أوراق لمن على يمينه، ومن لا يملك النوع الملعوب يجب أن يرمي «ليخة» إن كانت معه.
import { h, t, addDict, num, sound } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import { deck, shuffle, sortHand, st, rk, trickWinner, trickTable, roundCard, loadCss, resetLast, botAvoid, cardEl } from './common.js';
addDict({
  ar: {
    lk_pass: 'اختر 3 أوراق لتمريرها إلى اللاعب الذي على يمينك', lk_passBtn: 'مرّر الأوراق', lk_waitPass: 'بانتظار تمرير الآخرين…', lk_got: 'وصلتك هذه الأوراق:', lk_mode: 'طريقة اللعب', lk_solo: 'فردي', lk_teams: 'فريقان',
    lk_mustLikha: 'ليس معك النوع الملعوب: يجب أن ترمي الليخة', lk_pts: 'نقاط الجولة', lk_lowWins: 'الأقل نقاطًا هو الفائز',
    lk_rules: `<h4>الفكرة</h4><p>أربعة لاعبين و52 ورقة، لكل لاعب 13 ورقة. الهدف أن <b>تتجنب</b> أخذ الأوراق التي عليها نقاط:</p><ul><li>كل ورقة <b>كبة ♥</b> = نقطة واحدة.</li><li><b>البنت السبيت ♠</b> (الليخة السوداء) = 13 نقطة.</li><li><b>العشرة الديناري ♦</b> (الليخة الحمراء) = 10 نقاط.</li></ul><p>مجموع الجولة 36 نقطة.</p>
<h4>التمرير</h4><p>في بداية كل جولة يختار كل لاعب 3 أوراق ويمررها إلى اللاعب الذي على يمينه.</p>
<h4>اللعب</h4><ul><li>يبدأ من على يمين الموزع، ويجب أن تلعب من النوع الملعوب إن كان معك.</li><li>إن لم يكن معك النوع وكانت معك ليخة (البنت السبيت أو العشرة الديناري) <b>وجب</b> أن ترميها.</li><li>يأخذ الأكلة أعلى ورقة من النوع الملعوب أولًا، ولا يوجد حكم.</li></ul>
<h4>نهاية اللعبة</h4><p>حين يصل أحد اللاعبين إلى الهدف (101) تنتهي اللعبة، ويفوز صاحب أقل مجموع (أو الفريق صاحب أقل مجموع في نظام الفريقين).</p>`,
  },
  en: { lk_pass: 'Pick 3 cards to pass to your right', lk_passBtn: 'Pass cards', lk_waitPass: 'Waiting for others to pass…', lk_got: 'You received:', lk_mode: 'Mode', lk_solo: 'Solo', lk_teams: 'Teams', lk_mustLikha: 'Void in suit: you must play a Likha card', lk_pts: 'Round points', lk_lowWins: 'Lowest score wins', lk_rules: '<p>Avoid hearts (1 each), Q♠ (13) and 10♦ (10). Pass 3 cards right. Follow suit; if void you must play a Likha card. Game ends at 101; lowest wins.</p>' },
});
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706'];
const isLikha = (c) => c === 'QS' || c === 'TD';
const pts = (c) => c === 'QS' ? 13 : c === 'TD' ? 10 : st(c) === 'H' ? 1 : 0;
function legal(hand, trick) {
  if (!trick.length) return hand.slice();
  const same = hand.filter(c => st(c) === st(trick[0].card)); if (same.length) return same;
  const lk = hand.filter(isLikha); return lk.length ? lk : hand.slice();
}
function deal(s) {
  const d = shuffle(deck()); s.hands = [0, 1, 2, 3].map(i => sortHand(d.slice(i * 13, i * 13 + 13)));
  s.dealer = (s.dealer + 1) % 4; s.phase = 'pass'; s.passSel = [null, null, null, null]; s.recv = [[], [], [], []];
  s.trick = []; s.lastTrick = null; s.taken = [0, 0, 0, 0]; s.summary = null; s.turn = (s.dealer + 1) % 4;
}
const def = {
  id: 'likha', name: { ar: 'الليخة', en: 'Likha' }, counts: [4], hidden: true, colors: COLORS,
  options: () => [
    { key: 'mode', label: t('lk_mode'), choices: [['solo', t('lk_solo')], ['teams', t('lk_teams')]], def: 'solo' },
    { key: 'target', label: t('cx_target'), choices: [[51, num(51)], [101, num(101)], [151, num(151)]], def: 101 }],
  teams: (n, o) => o?.mode === 'teams' ? [0, 1, 0, 1] : null,
  rules: () => t('lk_rules'),
  init(players, o) { const s = { players, scores: [0, 0, 0, 0], target: +o.target || 101, teams: o.mode === 'teams', dealer: 3 }; deal(s); return s; },
  view(s, seat) { return { ...s, hands: undefined, passSel: s.passSel.map(x => !!x), myPass: s.passSel[seat], recv: s.recv[seat], hand: s.hands[seat], counts: s.hands.map(x => x.length), legal: s.phase === 'play' && s.turn === seat ? legal(s.hands[seat], s.trick) : [] }; },
  needs(s) { return s.phase === 'pass' ? [0, 1, 2, 3].filter(i => !s.passSel[i]) : s.phase === 'play' ? [s.turn] : s.phase === 'roundEnd' ? [0] : []; },
  apply(s, seat, a) {
    if (s.phase === 'roundEnd') { if (a.type !== 'next') return t('gk_err'); deal(s); return null; }
    if (s.phase === 'pass') {
      if (a.type !== 'pass' || !Array.isArray(a.cards) || a.cards.length !== 3 || new Set(a.cards).size !== 3 || !a.cards.every(c => s.hands[seat].includes(c))) return t('gk_err');
      s.passSel[seat] = a.cards;
      if (s.passSel.every(Boolean)) {
        for (let i = 0; i < 4; i++) s.hands[i] = s.hands[i].filter(c => !s.passSel[i].includes(c));
        for (let i = 0; i < 4; i++) { const to = (i + 1) % 4; s.hands[to] = sortHand([...s.hands[to], ...s.passSel[i]]); s.recv[to] = s.passSel[i]; }
        s.phase = 'play';
      }
      return null;
    }
    if (s.phase === 'play') {
      const L = legal(s.hands[seat], s.trick);
      if (a.type !== 'play' || !L.includes(a.card)) return s.hands[seat].includes(a.card) && s.trick.length && L.every(isLikha) ? t('lk_mustLikha') : t('cx_follow');
      s.hands[seat] = s.hands[seat].filter(c => c !== a.card); s.trick.push({ seat, card: a.card });
      if (s.trick.length < 4) { s.turn = (seat + 1) % 4; return null; }
      const w = trickWinner(s.trick, null); s.taken[w] += s.trick.reduce((x, p) => x + pts(p.card), 0);
      s.lastTrick = { cards: s.trick, winner: w }; s.trick = []; s.turn = w;
      if (!s.hands[0].length) {
        for (let i = 0; i < 4; i++) s.scores[i] += s.taken[i];
        s.summary = { taken: s.taken.slice() };
        s.phase = s.scores.some(x => x >= s.target) ? 'over' : 'roundEnd';
      }
      return null;
    }
    return t('gk_err');
  },
  bot(s, seat, lv) {
    if (s.phase === 'roundEnd') return { type: 'next' };
    if (s.phase === 'pass') {
      const hd = s.hands[seat]; const danger = (c) => pts(c) * 3 + (st(c) === 'S' && 'KA'.includes(rk(c)) ? 30 : 0) + '23456789TJQKA'.indexOf(rk(c));
      return { type: 'pass', cards: hd.slice().sort((a, b) => danger(b) - danger(a)).slice(0, 3) };
    }
    return { type: 'play', card: botAvoid(s.hands[seat], s.trick, legal(s.hands[seat], s.trick), pts, lv) };
  },
  botDelay: (s) => s.phase === 'roundEnd' ? 4500 : s.phase === 'pass' ? 500 : !s.trick.length && s.lastTrick ? 1300 : 800,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    if (s.teams) {
      const T = [s.scores[0] + s.scores[2], s.scores[1] + s.scores[3]]; const w = T[0] <= T[1] ? 0 : 1; const tn = (k) => t('cx_team', { a: s.players[k].name, b: s.players[k + 2].name });
      return { title: seat % 2 === w ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: tn(w) }), win: seat % 2 === w, lines: [0, 1].map(k => ({ label: tn(k), value: num(T[k]), color: COLORS[k] })) };
    }
    const order = [0, 1, 2, 3].sort((a, b) => s.scores[a] - s.scores[b]); const w = order[0];
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat, lines: order.map(k => ({ label: s.players[k].name, value: num(s.scores[k]), color: COLORS[k] })) };
  },
  status(v, ui) {
    if (v.phase === 'pass') return ui.myTurn ? t('lk_pass') : t('lk_waitPass');
    if (v.phase === 'roundEnd') return t('cx_round');
    return ui.myTurn ? t('cx_play') : t('gk_turnOf', { name: ui.name(v.turn) });
  },
  render(el, v, ui) { renderLikha(el, v, ui); },
};
let sel = new Set();
function renderLikha(el, v, ui) {
  const me = ui.seat;
  if (v.phase !== 'pass' || v.myPass) sel = new Set();
  let center = null, bar = null, legalSet = new Set(v.legal), onPlay = (c) => { sound('place'); ui.act({ type: 'play', card: c }); };
  if (v.phase === 'pass') {
    center = h('div', { class: 'cx-mid' }, h('div', { class: 'cx-panel' }, h('b', {}, v.myPass ? t('lk_waitPass') : t('lk_pass')), h('span', {}, '➡️ ', ui.name((me + 1) % 4))));
    if (!v.myPass && ui.myTurn) {
      legalSet = new Set(v.hand);
      onPlay = (c) => { sel.has(c) ? sel.delete(c) : sel.size < 3 && sel.add(c); el.innerHTML = ''; renderLikha(el, v, ui); };
      bar = h('div', { class: 'cx-btns' }, h('button', { type: 'button', class: 'gk-bigbtn', disabled: sel.size !== 3, onclick: () => { const c = [...sel]; sel = new Set(); ui.act({ type: 'pass', cards: c }); } }, '➡️ ', t('lk_passBtn'), ' (', num(sel.size), '/', num(3), ')'));
    }
  } else if (v.phase === 'play' && v.recv?.length && v.counts[me] === 13 && !v.lastTrick) {
    bar = h('div', { class: 'cx-played' }, h('small', {}, t('lk_got')), v.recv.map(c => cardEl(c, { cls: 'mini' })));
  }
  const tot = (i) => v.teams ? v.scores[i % 2] + v.scores[i % 2 + 2] : v.scores[i];
  const score = h('div', {}, [0, 1, 2, 3].map(i => h('div', { class: 'bl-srow', style: { borderColor: COLORS[i] } }, h('span', {}, ui.name(i)), h('b', {}, num(v.scores[i])))),
    v.teams ? h('small', {}, t('cx_us'), ' ', num(tot(me)), ' · ', t('cx_them'), ' ', num(tot(me + 1))) : null, h('small', {}, '🎯 ', num(v.target), ' · ', t('lk_lowWins')));
  let overlay = null;
  if (v.phase === 'roundEnd' && v.summary) overlay = roundCard(t('cx_round'), [0, 1, 2, 3].map(i => ui.name(i)), [[t('lk_pts'), ...v.summary.taken], [t('cx_total'), ...v.scores]], ui);
  trickTable(el, v, ui, {
    n: 4, legal: legalSet, selected: sel, dimOthers: ui.myTurn && v.phase === 'play', onPlay, cls: 'blue',
    tag: (s) => v.phase === 'play' || v.phase === 'roundEnd' ? h('small', { class: 'cx-badge' + (v.taken[s] ? ' red' : '') }, num(v.taken[s])) : null,
    center, bar, score, overlay,
  });
}
export async function mount(root, ctx) { loadCss(); resetLast(); sel = new Set(); return tableGame(root, ctx, def); }
export const _test = { def };
