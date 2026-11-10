// الهاند: من 2 إلى 4 لاعبين، رزمتان وجوكران. كوّن مجموعات (3 أو 4 أوراق متشابهة) وسلاسل (3 متتالية من نوع واحد)،
// والنزول الأول لا يقل عن 51 نقطة، وتنتهي الجولة حين يرمي أحد اللاعبين آخر ورقة معه. الأقل نقاطًا يفوز.
import { h, t, addDict, num, sound, toast } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import { deck, shuffle, rk, st, isJoker, cardEl, back, loadCss, SUITS } from './common.js';
addDict({
  ar: {
    hd_draw: 'اسحب ورقة من الرزمة أو خذ الورقة المرمية', hd_act: 'أنزل مجموعاتك أو ألصق أوراقًا، ثم ارمِ ورقة', hd_stock: 'الرزمة', hd_pile: 'المرمى', hd_meld: 'أنزل المحدد', hd_lay: 'اضغط على مجموعة على الطاولة لتلصق بها الأوراق المحددة', hd_discard: 'ارمِ الورقة المحددة', hd_undo: 'تراجع عن نزول هذا الدور',
    hd_need51: 'النزول الأول يجب ألا يقل عن 51 نقطة (الآن {n})', hd_mustUse: 'الورقة التي أخذتها من المرمى يجب أن تنزلها في هذا الدور', hd_bad: 'هذه ليست مجموعة صحيحة', hd_keep1: 'يجب أن تبقى معك ورقة لترميها', hd_notOpen: 'لا يمكنك الإلصاق قبل أن تنزل نزولك الأول',
    hd_opened: 'نزل', hd_closed: 'لم ينزل', hd_turnVal: 'نزول هذا الدور: {n}', hd_round: 'الجولة {a} من {b}', hd_left: 'الأوراق الباقية', hd_handWin: 'هاند! أنهى {name} الجولة دفعة واحدة 🎉', hd_won: 'أنهى {name} الجولة', hd_rounds: 'عدد الجولات', hd_select: 'حدد أوراقًا من يدك',
    hd_rules: `<h4>الأدوات</h4><p>رزمتان من الورق (104 أوراق) وجوكران. لكل لاعب 14 ورقة، ويأخذ اللاعب الذي يبدأ 15 ورقة فيبدأ بالرمي مباشرة.</p>
<h4>المجموعات</h4><ul><li><b>المجموعة</b>: 3 أو 4 أوراق من رتبة واحدة وأنواع مختلفة، مثل 7♠ 7♥ 7♦.</li><li><b>السلسلة</b>: 3 أوراق أو أكثر متتالية من نوع واحد، مثل 5♥ 6♥ 7♥. والآس يأتي قبل الاثنين أو بعد الشايب.</li><li><b>الجوكر</b> يحل محل أي ورقة.</li></ul>
<h4>الدور</h4><ol><li>اسحب ورقة من الرزمة، أو خذ آخر ورقة مرمية بشرط أن تنزلها في الدور نفسه.</li><li>يمكنك أن تنزل مجموعات. والنزول الأول يجب أن يكون مجموعه <b>51 نقطة على الأقل</b>.</li><li>بعد نزولك يمكنك أن تلصق أوراقًا بأي مجموعة على الطاولة.</li><li>تنهي دورك برمي ورقة واحدة.</li></ol>
<h4>قيم الأوراق</h4><p>الآس 11 (أو 1 قبل الاثنين في السلسلة)، والولد والبنت والشايب 10، وبقية الأوراق بأرقامها، والجوكر بقيمة الورقة التي يحل محلها، وإن بقي في اليد فقيمته 15.</p>
<h4>نهاية الجولة والحساب</h4><ul><li>تنتهي الجولة حين يرمي لاعب آخر ورقة معه: يأخذ <b>−30</b>، أو <b>−60</b> إن نزل كل أوراقه في دور واحد دون نزول سابق (<b>هاند</b>).</li><li>من لم ينزل أبدًا يأخذ +100 (+200 إن كان الفوز هاند).</li><li>ومن نزل يأخذ مجموع الأوراق الباقية في يده (مضاعفًا إن كان الفوز هاند).</li><li>بعد الجولات المحددة يفوز صاحب <b>أقل</b> مجموع.</li></ul>`,
  },
  en: { hd_draw: 'Draw from the stock or take the discard', hd_act: 'Meld or lay off, then discard', hd_stock: 'Stock', hd_pile: 'Discard', hd_meld: 'Meld selected', hd_lay: 'Tap a table meld to lay off selected cards', hd_discard: 'Discard selected', hd_undo: 'Undo this turn’s melds', hd_need51: 'First meld must total 51+ (now {n})', hd_mustUse: 'You must meld the card you took from the discard', hd_bad: 'Not a valid meld', hd_keep1: 'Keep a card to discard', hd_notOpen: 'Open first before laying off', hd_opened: 'Opened', hd_closed: 'Not opened', hd_turnVal: 'This turn: {n}', hd_round: 'Round {a} of {b}', hd_left: 'Cards left', hd_handWin: 'Hand! {name} went out in one go 🎉', hd_won: '{name} went out', hd_rounds: 'Rounds', hd_select: 'Select cards', hd_rules: '<p>Two decks + 2 jokers. Melds: sets of 3–4 or runs of 3+. First meld 51+. Go out by discarding your last card: −30 (−60 for Hand). Unopened +100, others score their cards. Lowest total wins.</p>' },
});
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706'];
const RP = { A: 14, K: 13, Q: 12, J: 11, T: 10 }; const pos = (c) => RP[rk(c)] || +rk(c);
const posVal = (p) => p === 1 ? 1 : p === 14 ? 11 : p >= 11 ? 10 : p;
export const cardVal = (c) => isJoker(c) ? 15 : rk(c) === 'A' ? 11 : 'TJQK'.includes(rk(c)) ? 10 : +rk(c);
const POSCH = { 1: 'A', 10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
// تحليل مجموعة: تعيد { type, cards مرتبة, value, rep: تمثيل الجوكر } أو null
export function analyze(cards) {
  if (!cards || cards.length < 3) return null;
  const jk = cards.filter(isJoker), nat = cards.filter(c => !isJoker(c));
  if (!nat.length) return null;
  // مجموعة متشابهة
  if (nat.every(c => rk(c) === rk(nat[0])) && new Set(nat.map(st)).size === nat.length && cards.length <= 4) {
    return { type: 'set', cards: [...nat, ...jk], value: cardVal(nat[0]) * cards.length };
  }
  // سلسلة
  if (!nat.every(c => st(c) === st(nat[0]))) return null;
  for (const aceLow of [false, true]) {
    const ps = nat.map(c => rk(c) === 'A' && aceLow ? 1 : pos(c)).sort((a, b) => a - b);
    if (new Set(ps).size !== ps.length) continue;
    const top = aceLow ? 13 : 14, bot = aceLow ? 1 : 2;
    let lo = ps[0], hi = ps[ps.length - 1]; const gaps = hi - lo + 1 - ps.length; let extra = jk.length - gaps;
    if (extra < 0) continue;
    while (extra > 0 && hi < top) { hi++; extra--; } while (extra > 0 && lo > bot) { lo--; extra--; }
    if (extra > 0) continue;
    const ordered = []; let ji = 0; let value = 0;
    for (let p = lo; p <= hi; p++) { const i = ps.indexOf(p); const c = i >= 0 ? nat.find(x => (rk(x) === 'A' && aceLow ? 1 : pos(x)) === p) : jk[ji++]; ordered.push(c); value += posVal(p); }
    return { type: 'run', cards: ordered, value, suit: st(nat[0]), lo, hi };
  }
  return null;
}
const sortH = (hand) => hand.slice().sort((a, b) => (isJoker(a) - isJoker(b)) || SUITS.indexOf(st(a)) - SUITS.indexOf(st(b)) || pos(a) - pos(b));
// إيجاد مجموعات بطريقة جشعة (للكمبيوتر)
export function findMelds(hand) {
  let rest = hand.filter(c => !isJoker(c)); let jk = hand.filter(isJoker); const out = [];
  const take = (cs) => { for (const c of cs) { const i = rest.indexOf(c); if (i >= 0) rest.splice(i, 1); else jk.splice(jk.indexOf(c), 1); } out.push(analyze(cs).cards); };
  // سلاسل طبيعية
  for (const su of SUITS) {
    for (const aceLow of [false, true]) {
      const byP = {}; for (const c of rest.filter(c => st(c) === su)) { const p = rk(c) === 'A' && aceLow ? 1 : pos(c); if (!byP[p]) byP[p] = c; }
      const ps = Object.keys(byP).map(Number).sort((a, b) => a - b); let run = [];
      const flush = () => { if (run.length >= 3) take(run.map(p => byP[p])); run = []; };
      for (const p of ps) { if (run.length && p !== run[run.length - 1] + 1) flush(); run.push(p); } flush();
    }
  }
  // مجموعات طبيعية
  const byR = {}; for (const c of rest) (byR[rk(c)] ||= []).push(c);
  for (const r of Object.keys(byR)) { const uniq = []; for (const c of byR[r]) if (!uniq.some(x => st(x) === st(c))) uniq.push(c); if (uniq.length >= 3) take(uniq.slice(0, 4)); }
  // الجوكر يكمل زوجًا
  while (jk.length) {
    let done = false;
    const br = {}; for (const c of rest) (br[rk(c)] ||= []).push(c);
    for (const r of Object.keys(br).sort((a, b) => cardVal(b + 'S') - cardVal(a + 'S'))) { const u = []; for (const c of br[r]) if (!u.some(x => st(x) === st(c))) u.push(c); if (u.length >= 2) { take([u[0], u[1], jk[0]]); done = true; break; } }
    if (!done) for (const a of rest) { const b = rest.find(x => x !== a && st(x) === st(a) && pos(x) - pos(a) >= 1 && pos(x) - pos(a) <= 2); if (b) { take([a, b, jk[0]]); done = true; break; } }
    if (!done) break;
  }
  return out;
}
function dealRound(s) {
  const d = shuffle(deck({ decks: 2, jokers: 2 }));
  s.hands = Array.from({ length: s.n }, () => d.splice(0, 14));
  s.starter = (s.starter + 1) % s.n; s.hands[s.starter].push(d.shift());
  s.stock = d; s.pile = []; s.table = []; s.opened = Array(s.n).fill(false);
  s.turn = s.starter; s.step = 'act'; s.phase = 'turn'; s.snap = snapshot(s); s.took = null; s.summary = null; s.flash = null; s.plan = null;
}
const snapshot = (s) => JSON.stringify({ hand: s.hands[s.turn], table: s.table, opened: s.opened[s.turn] });
const turnVal = (s) => { const o = JSON.parse(s.snap); const before = o.table.length; return s.table.slice(before).reduce((a, m) => a + analyze(m.cards).value, 0); };
function endRound(s, w) {
  const handWin = w != null && !JSON.parse(s.snap).opened;
  const pts = s.hands.map((hd, i) => {
    if (i === w) return handWin ? -60 : -30;
    if (!s.opened[i]) return handWin ? 200 : 100;
    return hd.reduce((a, c) => a + cardVal(c), 0) * (handWin ? 2 : 1);
  });
  pts.forEach((p, i) => s.scores[i] += p);
  s.summary = { w, handWin, pts, left: s.hands.map(x => x.length) };
  s.round++; s.phase = s.round >= s.rounds ? 'over' : 'roundEnd';
}
const def = {
  id: 'hand', name: { ar: 'الهاند', en: 'Hand' }, counts: [2, 3, 4], defaultCount: 4, hidden: true, colors: COLORS,
  options: () => [{ key: 'rounds', label: t('hd_rounds'), choices: [[3, num(3)], [5, num(5)], [7, num(7)]], def: 5 }],
  rules: () => t('hd_rules'),
  init(players, o) { const s = { players, n: players.length, scores: Array(players.length).fill(0), rounds: +o.rounds || 5, round: 0, starter: -1 }; dealRound(s); return s; },
  view(s, seat) { return { ...s, stock: undefined, stockN: s.stock.length, hands: undefined, snap: undefined, plan: undefined, hand: sortH(s.hands[seat]), counts: s.hands.map(x => x.length), top: s.pile[s.pile.length - 1] || null, tv: s.phase === 'turn' ? turnVal(s) : 0, changed: s.phase === 'turn' && JSON.parse(s.snap).table.length !== s.table.length || (s.phase === 'turn' && JSON.stringify(JSON.parse(s.snap).table) !== JSON.stringify(s.table)) }; },
  needs(s) { return s.phase === 'turn' ? [s.turn] : s.phase === 'roundEnd' ? [0] : []; },
  apply(s, seat, a) {
    if (s.phase === 'roundEnd') { if (a.type !== 'next') return t('gk_err'); dealRound(s); return null; }
    const hd = s.hands[seat]; const has = (cs) => Array.isArray(cs) && cs.length && new Set(cs).size === cs.length && cs.every(c => hd.includes(c));
    const before = JSON.parse(s.snap);
    if (s.step === 'draw') {
      if (a.type !== 'draw') return t('hd_draw');
      if (a.src === 'pile') { if (!s.pile.length) return t('gk_err'); const c = s.pile.pop(); hd.push(c); s.took = c; }
      else {
        if (!s.stock.length) { const top = s.pile.pop(); s.stock = shuffle(s.pile); s.pile = top ? [top] : []; }
        if (!s.stock.length) { endRound(s, null); return null; }
        hd.push(s.stock.shift()); s.took = null;
      }
      s.step = 'act'; s.snap = snapshot(s); return null;
    }
    if (a.type === 'undo') { s.hands[seat] = before.hand; s.table = before.table; s.opened[seat] = before.opened; return null; }
    if (a.type === 'meld') {
      if (!has(a.cards)) return t('gk_err'); const m = analyze(a.cards); if (!m) return t('hd_bad');
      if (hd.length - a.cards.length < 1) return t('hd_keep1');
      s.hands[seat] = hd.filter(c => !a.cards.includes(c)); s.table.push({ owner: seat, cards: m.cards }); return null;
    }
    if (a.type === 'lay') {
      const M = s.table[a.m]; if (!M || !has(a.cards)) return t('gk_err');
      if (!before.opened && turnVal(s) < 51) return t('hd_notOpen');
      const m = analyze([...M.cards, ...a.cards]); if (!m) return t('hd_bad');
      if (hd.length - a.cards.length < 1) return t('hd_keep1');
      s.hands[seat] = hd.filter(c => !a.cards.includes(c)); M.cards = m.cards; return null;
    }
    if (a.type === 'discard') {
      if (!hd.includes(a.card)) return t('gk_err');
      const tv = turnVal(s), changed = JSON.stringify(before.table) !== JSON.stringify(s.table);
      if (!before.opened && changed && tv < 51) return t('hd_need51', { n: num(tv) });
      if (s.took && hd.includes(s.took)) return t('hd_mustUse');
      if (changed) s.opened[seat] = true;
      s.hands[seat] = hd.filter(c => c !== a.card); s.pile.push(a.card); s.took = null; s.plan = null;
      if (!s.hands[seat].length) { s.flash = { w: seat }; endRound(s, seat); return null; }
      s.turn = (seat + 1) % s.n; s.step = 'draw'; s.snap = snapshot(s); return null;
    }
    return t('gk_err');
  },
  bot(s, seat) {
    if (s.phase === 'roundEnd') return { type: 'next' };
    const hd = s.hands[seat], before = JSON.parse(s.snap);
    const total = (ms) => ms.reduce((a, m) => a + analyze(m).value, 0);
    const keepOne = (ms) => hd.length - ms.flat().length >= 1;
    if (s.step === 'draw') {
      const top = s.pile[s.pile.length - 1];
      if (top) { const ms = findMelds([...hd, top]); const used = ms.some(m => m.includes(top)); if (used && (s.opened[seat] || total(ms) >= 51) && hd.length + 1 - ms.flat().length >= 1) { s.plan = ms; return { type: 'draw', src: 'pile' }; } }
      return { type: 'draw', src: 'stock' };
    }
    // نفّذ الخطة أو ابحث عن مجموعات
    const canOpen = before.opened || turnVal(s) >= 51;
    let ms = findMelds(hd).filter(m => analyze(m));
    while (ms.length && !keepOne(ms)) ms.pop();
    if (ms.length && (canOpen || turnVal(s) + total(ms) >= 51)) return { type: 'meld', cards: ms[0] };
    if (canOpen && hd.length > 1) {
      for (const c of hd.filter(c => !isJoker(c))) for (let i = 0; i < s.table.length; i++) if (analyze([...s.table[i].cards, c])) return { type: 'lay', m: i, cards: [c] };
    }
    if (s.took && hd.includes(s.took)) return { type: 'undo' }; // احتياط نادر
    // ارمِ أعلى ورقة لا تقترب من مجموعة
    const near = (c) => isJoker(c) ? 99 : hd.filter(x => x !== c && !isJoker(x) && (rk(x) === rk(c) && st(x) !== st(c) || st(x) === st(c) && Math.abs(pos(x) - pos(c)) <= 2 && pos(x) !== pos(c))).length;
    const cand = hd.slice().sort((a, b) => near(a) - near(b) || cardVal(b) - cardVal(a));
    return { type: 'discard', card: cand[0] };
  },
  botDelay: (s) => s.phase === 'roundEnd' ? 5000 : 700,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const order = s.scores.map((_, i) => i).sort((a, b) => s.scores[a] - s.scores[b]); const w = order[0];
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat, lines: order.map(k => ({ label: s.players[k].name, value: num(s.scores[k]), color: COLORS[k] })) };
  },
  status(v, ui) {
    if (v.phase === 'roundEnd') return t('cx_round');
    if (!ui.myTurn) return t('gk_turnOf', { name: ui.name(v.turn) });
    return v.step === 'draw' ? t('hd_draw') : t('hd_act');
  },
  render(el, v, ui) { renderHand(el, v, ui); },
};
let sel = new Set();
function renderHand(el, v, ui) {
  const me = ui.seat, my = ui.myTurn && v.phase === 'turn';
  for (const c of [...sel]) if (!v.hand.includes(c)) sel.delete(c);
  const redraw = () => { el.innerHTML = ''; renderHand(el, v, ui); };
  const act = (a) => { const err = ui.act(a); if (!err) sel = new Set(); };
  const selA = [...sel], selM = analyze(selA);
  const melds = h('div', { class: 'cx-melds' }, v.table.map((m, i) => {
    const can = my && v.step === 'act' && sel.size > 0;
    const b = h('div', { class: 'cx-meld' + (can && analyze([...m.cards, ...selA]) ? ' target' : ''), style: { borderInlineStartColor: COLORS[m.owner] } }, m.cards.map(c => cardEl(c)), h('small', {}, num(analyze(m.cards)?.value || 0)));
    if (can) b.addEventListener('click', () => { sound('place'); act({ type: 'lay', m: i, cards: selA }); });
    return b;
  }));
  const pile = h('div', { class: 'cx-pile' },
    h('button', { type: 'button', class: my && v.step === 'draw' ? 'can' : '', disabled: !(my && v.step === 'draw'), onclick: () => { sound('place'); act({ type: 'draw', src: 'stock' }); } }, back(), h('small', {}, t('hd_stock'), ' ', num(v.stockN))),
    h('button', { type: 'button', class: my && v.step === 'draw' && v.top ? 'can' : '', disabled: !(my && v.step === 'draw' && v.top), onclick: () => { sound('place'); act({ type: 'draw', src: 'pile' }); } }, v.top ? cardEl(v.top) : h('div', { class: 'bc-back', style: { opacity: .2 } }), h('small', {}, t('hd_pile'))));
  const wrap = h('div', { class: 'bl-wrap cx-wrap cx-simple blue' });
  wrap.append(h('div', { class: 'cx-opps' }, Array.from({ length: v.n - 1 }, (_, k) => { const s = (me + k + 1) % v.n; return h('div', { class: 'cx-opp' }, ui.plate(s, h('small', { class: 'cx-badge' + (v.opened[s] ? ' gold' : '') }, '🂠 ', num(v.counts[s]))), h('small', {}, v.opened[s] ? t('hd_opened') : t('hd_closed'), ' · ', num(v.scores[s]))); })));
  wrap.append(h('div', { class: 'bl-center' }, h('div', { class: 'cx-mid', style: { placeContent: 'start center', overflow: 'auto' } },
    h('div', { class: 'cx-btns' }, pile, h('div', { class: 'cx-panel', style: { padding: '6px 10px' } }, h('small', {}, t('hd_round', { a: num(v.round + 1), b: num(v.rounds) })), my && v.step === 'act' && !v.opened[me] ? h('small', { class: v.tv >= 51 ? 'cx-badge gold' : 'cx-badge' }, t('hd_turnVal', { n: num(v.tv) }), ' / ', num(51)) : null)),
    melds)));
  const bar = my && v.step === 'act' ? h('div', { class: 'cx-btns' },
    h('button', { type: 'button', class: 'bl-bid bl-bid-hokm', disabled: !selM, onclick: () => { sound('place'); act({ type: 'meld', cards: selA }); } }, '⬆️ ', t('hd_meld'), selM ? ' (' + num(selM.value) + ')' : ''),
    h('button', { type: 'button', class: 'bl-bid bl-bid-sun', disabled: sel.size !== 1, onclick: () => { sound('place'); act({ type: 'discard', card: selA[0] }); } }, '🗑️ ', t('hd_discard')),
    v.changed ? h('button', { type: 'button', class: 'bl-bid', onclick: () => act({ type: 'undo' }) }, '↺ ', t('hd_undo')) : null,
    sel.size && v.table.length ? h('small', { style: { width: '100%', textAlign: 'center' } }, t('hd_lay')) : null) : null;
  const hand = h('div', { class: 'bl-hand cx-hand many' }, v.hand.map(c => {
    const b = h('button', { type: 'button', class: 'bl-hc' + (my && v.step === 'act' ? ' can' : '') + (sel.has(c) ? ' sel' : ''), disabled: !(my && v.step === 'act') }, cardEl(c));
    b.addEventListener('click', () => { sel.has(c) ? sel.delete(c) : sel.add(c); redraw(); });
    return b;
  }));
  wrap.append(h('div', { class: 'bl-me' }, h('div', { class: 'bl-mebar' }, ui.plate(me, h('small', { class: 'cx-badge' + (v.opened[me] ? ' gold' : '') }, v.opened[me] ? t('hd_opened') : t('hd_closed'))), h('small', { class: 'cx-badge' }, t('cx_total'), ' ', num(v.scores[me]))), bar, hand));
  if (v.phase === 'roundEnd' && v.summary) {
    const S = v.summary; const ids = Array.from({ length: v.n }, (_, i) => i);
    wrap.append(h('div', { class: 'bl-endwrap' }, h('div', { class: 'dm-rcard bl-endcard' }, h('h3', {}, t('cx_round')),
      S.w != null ? h('p', { class: 'dm-who' }, S.handWin ? t('hd_handWin', { name: ui.name(S.w) }) : t('hd_won', { name: ui.name(S.w) })) : null,
      h('table', { class: 'bl-table' }, h('tr', {}, h('th', {}), ...ids.map(i => h('th', {}, ui.name(i)))),
        h('tr', {}, h('th', {}, t('hd_left')), ...ids.map(i => h('td', {}, num(S.left[i])))),
        h('tr', {}, h('th', {}, t('cx_pts')), ...ids.map(i => h('td', {}, num(S.pts[i])))),
        h('tr', { class: 'tot' }, h('th', {}, t('cx_total')), ...ids.map(i => h('td', {}, num(v.scores[i]))))),
      ui.needs.includes(me) ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('cx_next')) : h('p', { class: 'muted' }, t('cx_wait')))));
  }
  el.append(wrap);
  void toast;
}
export async function mount(root, ctx) { loadCss(); sel = new Set(); return tableGame(root, ctx, def); }
export const _test = { def, analyze, findMelds };
