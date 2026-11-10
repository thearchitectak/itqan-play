// البصرة: لاعبان أو أربعة (فريقان). العب ورقة لتأخذ من الأرض ما يطابقها أو ما يساوي مجموعه قيمتها، والولد يكنس الأرض، والبصرة = 10 نقاط.
import { h, t, addDict, num, sound } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import { deck, shuffle, sortHand, rk, cardEl, trickTable, roundCard, loadCss, resetLast } from './common.js';
addDict({
  ar: {
    bs_basra: 'بصرة! +10 🎉', bs_took: 'أخذ {name} {n} ورقة', bs_drop: 'وضع {name} ورقة على الأرض', bs_sweep: 'كنس {name} الأرض', bs_floor: 'الأرض', bs_stock: 'المتبقي في الرزمة: {n}',
    bs_cards: 'عدد الأوراق (الأغلبية = 30)', bs_bonus: 'الأولاد والآسات و2♣ و10♦', bs_basras: 'البصرات', bs_round: 'نقاط الجولة', bs_play: 'دورك: العب ورقة من يدك',
    bs_rules: `<h4>الفكرة</h4><p>لاعبان، أو أربعة في فريقين متقابلين، و52 ورقة. يأخذ كل لاعب 4 أوراق، وتُكشف 4 أوراق على الأرض (لا يكون بينها ولد ولا سبعة ديناري). كلما انتهت الأوراق من الأيدي وُزّعت 4 أخرى حتى تنتهي الرزمة.</p>
<h4>اللعب</h4><p>في دورك تلعب ورقة واحدة، وهي تأخذ تلقائيًا ما تستطيع أخذه من الأرض:</p><ul>
<li><b>ورقة رقمية</b> (الآس = 1 حتى 10): تأخذ كل ورقة تطابقها، وكل مجموعة أوراق رقمية مجموعها يساوي قيمتها. مثال: الثمانية تأخذ 5 و3 معًا.</li>
<li><b>البنت والشايب</b>: يأخذ كل منهما ما يطابقه فقط.</li>
<li><b>الولد</b>: يكنس الأرض كلها، ولا يُحسب بصرة.</li>
<li><b>السبعة الديناري</b>: تكنس الأرض كلها، وتُحسب بصرة إذا كانت الأرض أوراقًا رقمية مجموعها 10 أو أقل.</li>
<li>إن لم تأخذ الورقة شيئًا بقيت على الأرض.</li></ul>
<h4>البصرة</h4><p>إذا أخذت كل أوراق الأرض بورقة رقمية أو بنت أو شايب فهذه <b>بصرة</b> = 10 نقاط. ولا تُحسب البصرة في آخر ورقة من الجولة.</p>
<h4>الحساب في نهاية الجولة</h4><p>ما يبقى على الأرض يأخذه آخر من أخذ. ثم: صاحب أكثر من 26 ورقة = 30 نقطة، وكل ولد وكل آس = نقطة، والاثنان السباتي (2♣) = نقطتان، والعشرة الديناري (10♦) = 3 نقاط، وكل بصرة = 10. ويفوز من يصل أولًا إلى 101.</p>`,
  },
  en: { bs_basra: 'Basra! +10 🎉', bs_took: '{name} took {n} cards', bs_drop: '{name} dropped a card', bs_sweep: '{name} swept the floor', bs_floor: 'Floor', bs_stock: 'Stock: {n}', bs_cards: 'Cards (majority = 30)', bs_bonus: 'Jacks, aces, 2♣, 10♦', bs_basras: 'Basras', bs_round: 'Round points', bs_play: 'Your turn: play a card', bs_rules: '<p>Capture matching cards or numeral sets summing to your card. Jacks and 7♦ sweep. Clearing the floor is a Basra (10). Majority 30, jacks/aces 1, 2♣ 2, 10♦ 3. First to 101.</p>' },
});
const COLORS = ['#0f766e', '#b91c1c', '#0f766e', '#b91c1c'];
const val = (c) => { const r = rk(c); return r === 'A' ? 1 : r === 'T' ? 10 : /\d/.test(r) ? +r : 0; };
const isNum = (c) => val(c) > 0;
// ما تأخذه الورقة من الأرض: { cards, basra, sweep }
export function captureOf(card, floor) {
  if (!floor.length) return { cards: [], basra: false };
  if (rk(card) === 'J') return { cards: floor.slice(), basra: false, sweep: true };
  if (card === '7D') { const nums = floor.every(isNum) && floor.reduce((a, c) => a + val(c), 0) <= 10; return { cards: floor.slice(), basra: nums, sweep: true }; }
  if (!isNum(card)) { const m = floor.filter(c => rk(c) === rk(card)); return { cards: m, basra: m.length === floor.length }; }
  const v = val(card); const same = floor.filter(c => rk(c) === rk(card)); const rest = floor.filter(c => isNum(c) && rk(c) !== rk(card));
  // كل المجموعات التي مجموعها v، ثم أكبر اتحاد منفصل
  const subs = []; const n = rest.length;
  for (let m = 1; m < (1 << n); m++) { let s = 0; for (let i = 0; i < n; i++) if (m & (1 << i)) s += val(rest[i]); if (s === v) subs.push(m); }
  let best = 0; const pc = (m) => { let k = 0; while (m) { k += m & 1; m >>= 1; } return k; };
  const rec = (i, used) => { if (pc(used) > pc(best)) best = used; for (let j = i; j < subs.length; j++) if (!(subs[j] & used)) rec(j + 1, used | subs[j]); };
  if (subs.length) rec(0, 0);
  const got = [...same, ...rest.filter((_, i) => best & (1 << i))];
  return { cards: got, basra: got.length > 0 && got.length === floor.length };
}
const side = (s, seat) => s.n === 4 ? seat % 2 : seat;
function dealHands(s) { for (let i = 0; i < s.n; i++) s.hands[i] = sortHand(s.stock.splice(0, 4)); }
function newRound(s) {
  const d = shuffle(deck()); s.floor = [];
  while (s.floor.length < 4) { const c = d.shift(); if (rk(c) === 'J' || c === '7D') d.push(c); else s.floor.push(c); }
  s.stock = d; s.hands = []; dealHands(s);
  s.dealer = (s.dealer + 1) % s.n; s.turn = (s.dealer + 1) % s.n; s.won = s.n === 4 ? [[], []] : Array.from({ length: s.n }, () => []); s.basras = s.won.map(() => 0); s.lastCap = null; s.flash = null; s.phase = 'play'; s.summary = null;
}
function roundScore(s) {
  const K = s.won.length, p = Array(K).fill(0), cards = s.won.map(x => x.length), bonus = Array(K).fill(0);
  const mx = Math.max(...cards); if (cards.filter(x => x === mx).length === 1 && mx > 26) p[cards.indexOf(mx)] += 30;
  s.won.forEach((w, k) => { for (const c of w) bonus[k] += (rk(c) === 'J' || rk(c) === 'A' ? 1 : 0) + (c === '2C' ? 2 : 0) + (c === 'TD' ? 3 : 0); p[k] += bonus[k] + s.basras[k] * 10; });
  for (let k = 0; k < K; k++) s.scores[k] += p[k];
  s.summary = { cards, bonus, basras: s.basras.slice(), pts: p };
  const top = Math.max(...s.scores);
  s.phase = top >= s.target && s.scores.filter(x => x === top).length === 1 ? 'over' : 'roundEnd';
}
const def = {
  id: 'basra', name: { ar: 'البصرة', en: 'Basra' }, counts: [2, 4], hidden: true, colors: COLORS,
  options: () => [{ key: 'target', label: t('cx_target'), choices: [[61, num(61)], [101, num(101)], [151, num(151)]], def: 101 }],
  teams: (n) => n === 4 ? [0, 1, 0, 1] : null,
  rules: () => t('bs_rules'),
  init(players, o) { const n = players.length; const s = { players, n, target: +o.target || 101, scores: n === 4 ? [0, 0] : [0, 0], dealer: n - 1 }; newRound(s); return s; },
  view(s, seat) { return { ...s, stock: undefined, stockN: s.stock.length, hands: undefined, won: s.won.map(x => x.length), hand: s.hands[seat], counts: s.hands.map(x => x.length), legal: s.phase === 'play' && s.turn === seat ? s.hands[seat] : [] }; },
  needs(s) { return s.phase === 'play' ? [s.turn] : s.phase === 'roundEnd' ? [0] : []; },
  apply(s, seat, a) {
    if (s.phase === 'roundEnd') { if (a.type !== 'next') return t('gk_err'); newRound(s); return null; }
    if (a.type !== 'play' || !s.hands[seat].includes(a.card)) return t('gk_err');
    s.hands[seat] = s.hands[seat].filter(c => c !== a.card);
    const cap = captureOf(a.card, s.floor), k = side(s, seat), name = s.players[seat].name;
    const lastPlay = !s.stock.length && s.hands.every(x => !x.length);
    if (cap.cards.length) {
      s.floor = s.floor.filter(c => !cap.cards.includes(c)); s.won[k].push(a.card, ...cap.cards); s.lastCap = k;
      const basra = cap.basra && !lastPlay; if (basra) s.basras[k]++;
      s.flash = { seat, card: a.card, took: cap.cards, msg: basra ? t('bs_basra') : cap.sweep ? t('bs_sweep', { name }) : t('bs_took', { name, n: num(cap.cards.length + 1) }), basra };
    } else { s.floor.push(a.card); s.flash = { seat, card: a.card, took: [], msg: t('bs_drop', { name }) }; }
    if (s.hands.every(x => !x.length)) {
      if (s.stock.length) dealHands(s);
      else { if (s.floor.length && s.lastCap != null) s.won[s.lastCap].push(...s.floor); s.floor = []; roundScore(s); return null; }
    }
    s.turn = (seat + 1) % s.n; return null;
  },
  bot(s, seat, lv) {
    if (s.phase === 'roundEnd') return { type: 'next' };
    const hd = s.hands[seat];
    if (lv === 'easy' && Math.random() < .3) return { type: 'play', card: hd[Math.floor(Math.random() * hd.length)] };
    const pv = (c) => (rk(c) === 'J' || rk(c) === 'A' ? 1 : 0) + (c === '2C' ? 2 : 0) + (c === 'TD' ? 3 : 0);
    const score = (c) => {
      const cap = captureOf(c, s.floor);
      if (cap.cards.length) {
        let v = cap.cards.length + 1 + (cap.basra ? 12 : 0) + [c, ...cap.cards].reduce((a, x) => a + pv(x) * 2, 0);
        if (rk(c) === 'J' || c === '7D') v -= cap.cards.length <= 1 ? 6 : 2; // لا تضيّع الولد على ورقة واحدة
        const left = s.floor.length - cap.cards.length; if (left === 1) v -= 3;
        return v;
      }
      let v = -pv(c) * 2 - (rk(c) === 'J' || c === '7D' ? 10 : 0) - val(c) * .1;
      if (!s.floor.length) v -= 4; // ورقة وحيدة على الأرض تفتح بصرة للمنافس
      return v;
    };
    return { type: 'play', card: hd.slice().sort((a, b) => score(b) - score(a))[0] };
  },
  botDelay: (s) => s.phase === 'roundEnd' ? 4500 : 1100,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const k = side(s, seat), top = Math.max(...s.scores), w = s.scores.indexOf(top);
    const nm = (i) => s.n === 4 ? t('cx_team', { a: s.players[i].name, b: s.players[i + 2].name }) : s.players[i].name;
    return { title: w === k ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: nm(w) }), win: w === k, lines: s.scores.map((x, i) => ({ label: nm(i), value: num(x), color: COLORS[i] })) };
  },
  status(v, ui) { return v.phase === 'roundEnd' ? t('cx_round') : ui.myTurn ? t('bs_play') : t('gk_turnOf', { name: ui.name(v.turn) }); },
  render(el, v, ui) {
    const me = ui.seat, k = v.n === 4 ? me % 2 : me, other = v.n === 4 ? 1 - k : 1 - k;
    const f = v.flash;
    const center = h('div', { class: 'cx-mid' },
      f ? h('div', { class: 'cx-played' }, h('small', {}, ui.name(f.seat)), cardEl(f.card, { cls: 'mini' }), f.took.length ? h('span', {}, '⬅️') : null, f.took.slice(0, 8).map(c => cardEl(c, { cls: 'mini' }))) : null,
      f ? h('span', { class: f.basra ? 'cx-flash' : 'cx-badge' }, f.msg) : null,
      h('div', { class: 'cx-floor' }, v.floor.map(c => cardEl(c))),
      h('small', { class: 'cx-badge' }, '🂠 ', t('bs_stock', { n: num(v.stockN) })));
    const score = h('div', {},
      h('div', { class: 'bl-srow' }, h('span', {}, v.n === 4 ? t('cx_us') : ui.name(me)), h('b', {}, num(v.scores[k]))),
      h('div', { class: 'bl-srow them' }, h('span', {}, v.n === 4 ? t('cx_them') : ui.name(1 - me)), h('b', {}, num(v.scores[other]))),
      h('small', {}, '🎯 ', num(v.target)));
    let overlay = null;
    if (v.phase === 'roundEnd' && v.summary) {
      const S = v.summary, ord = [k, other];
      overlay = roundCard(t('cx_round'), ord.map(i => v.n === 4 ? (i === k ? t('cx_us') : t('cx_them')) : ui.name(i)),
        [[t('bs_cards'), ...ord.map(i => S.cards[i])], [t('bs_bonus'), ...ord.map(i => S.bonus[i])], [t('bs_basras'), ...ord.map(i => S.basras[i])], [t('bs_round'), ...ord.map(i => S.pts[i])], [t('cx_total'), ...ord.map(i => v.scores[i])]], ui);
    }
    trickTable(el, v, ui, {
      n: v.n, legal: new Set(v.legal), onPlay: (c) => { sound('place'); ui.act({ type: 'play', card: c }); }, lastBtn: false,
      tag: (s) => { const sk = v.n === 4 ? s % 2 : s; return h('span', {}, h('span', { class: 'cx-badge' }, '🂠 ', num(v.won[sk])), v.basras[sk] ? h('span', { class: 'cx-badge gold' }, '⭐ ', num(v.basras[sk])) : null); },
      center, score, overlay,
    });
  },
};
export async function mount(root, ctx) { loadCss(); resetLast(); return tableGame(root, ctx, def); }
export const _test = { def, captureOf };
