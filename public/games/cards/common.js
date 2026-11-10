// أدوات مشتركة لألعاب الكوتشينة: الورق (52 ورقة مع الجوكر اختياريًا)، والرسم، وطاولة الأكلات العامة.
// الورقة نص: الرتبة ثم النوع، مثل "QS" (بنت سبيت) و"TD" (عشرة ديناري)، ويُضاف رقم الرزمة عند استعمال رزمتين "7H1".
// الجوكر: "W*0" و"W*1".
import { h, t, addDict, num } from '../../assets/js/core.js';
addDict({
  ar: { cx_us: 'لنا', cx_them: 'لهم', cx_next: 'الجولة التالية', cx_wait: 'بانتظار صاحب الغرفة…', cx_round: 'نهاية الجولة', cx_total: 'المجموع', cx_tricks: 'الأكلات', cx_last: 'الأكلة السابقة', cx_play: 'دورك: العب ورقة', cx_follow: 'يجب أن تلعب من النوع نفسه', cx_pts: 'النقاط', cx_team: 'فريق {a} و{b}', cx_target: 'تنتهي اللعبة عند', cx_rounds: 'عدد الجولات' },
  en: { cx_us: 'Us', cx_them: 'Them', cx_next: 'Next round', cx_wait: 'Waiting for the host…', cx_round: 'End of round', cx_total: 'Total', cx_tricks: 'Tricks', cx_last: 'Last trick', cx_play: 'Your turn: play a card', cx_follow: 'You must follow suit', cx_pts: 'Points', cx_team: 'Team {a} & {b}', cx_target: 'Play to', cx_rounds: 'Rounds' },
});
export const SUITS = ['S', 'H', 'C', 'D'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SYM = { S: '♠', H: '♥', D: '♦', C: '♣', '*': '★' };
export const SUIT_AR = { S: 'سبيت', H: 'كبة', D: 'ديناري', C: 'سباتي' };
export const LBL = { T: '10', J: 'J', Q: 'Q', K: 'K', A: 'A', W: '★' };
export const RANK_AR = { T: '10', J: 'ولد', Q: 'بنت', K: 'شايب', A: 'آس' };
export const rk = (c) => c[0], st = (c) => c[1];
export const isJoker = (c) => c[0] === 'W';
export const rv = (c) => RANKS.indexOf(c[0]); // 0 (اثنان) … 12 (آس)
export const red = (s) => s === 'H' || s === 'D';
export const base = (c) => c.slice(0, 2);
export function deck({ decks = 1, jokers = 0, ranks = RANKS } = {}) {
  const d = [];
  for (let k = 0; k < decks; k++) { for (const s of SUITS) for (const r of ranks) d.push(r + s + (decks > 1 ? k : '')); }
  for (let k = 0; k < jokers; k++) d.push('W*' + k);
  return d;
}
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function sortHand(hand, order = ['S', 'H', 'C', 'D']) {
  return hand.slice().sort((a, b) => (isJoker(a) - isJoker(b)) || order.indexOf(st(a)) - order.indexOf(st(b)) || rv(b) - rv(a));
}
export const cardName = (c) => isJoker(c) ? 'جوكر' : (RANK_AR[rk(c)] || rk(c)) + ' ' + SUIT_AR[st(c)];
export function cardEl(c, opts = {}) {
  if (isJoker(c)) return h('div', { class: 'bc-card cx-joker' + (opts.cls ? ' ' + opts.cls : ''), title: 'جوكر' },
    h('span', { class: 'bc-tl' }, h('b', {}, '★')), h('span', { class: 'bc-mid' }, '🃏'), h('span', { class: 'bc-br' }, h('b', {}, '★')));
  const r = rk(c), s = st(c);
  const face = { J: '🤴', Q: '👸', K: '🤴🏻' }[r];
  return h('div', { class: 'bc-card' + (red(s) ? ' red' : '') + (opts.cls ? ' ' + opts.cls : ''), title: cardName(c) },
    h('span', { class: 'bc-tl' }, h('b', {}, LBL[r] || r), h('i', {}, SYM[s])),
    h('span', { class: 'bc-mid' }, face ? h('span', { class: 'bc-face' }, face) : SYM[s]),
    h('span', { class: 'bc-br' }, h('b', {}, LBL[r] || r), h('i', {}, SYM[s])));
}
export const back = () => h('div', { class: 'bc-back' });
export function loadCss() {
  const add = (id, url) => { if (!document.getElementById(id)) document.head.append(h('link', { id, rel: 'stylesheet', href: new URL(url, import.meta.url).href })); };
  add('bl-css', '../baloot/baloot.css'); add('dm-css', '../domino/domino.css'); add('cx-css', './cards.css');
}
// الفائز بالأكلة: أعلى ورقة من النوع الملعوب أولًا، أو أعلى حكم إن وُجد
export function trickWinner(trick, trump) {
  const led = st(trick[0].card); let best = trick[0];
  for (const p of trick.slice(1)) {
    const c = p.card, b = best.card;
    if (trump && st(c) === trump && st(b) !== trump) best = p;
    else if (st(c) === st(b) && rv(c) > rv(b)) best = p;
  }
  void led; return best.seat;
}
export const followable = (hand, trick) => { if (!trick.length) return hand.slice(); const led = st(trick[0].card); const same = hand.filter(c => st(c) === led); return same.length ? same : hand.slice(); };

// ====== طاولة عامة لألعاب الأكلات (4 لاعبين) ======
// cfg: { n, legal:Set, onPlay(card), center?: عنصر بديل للوسط, score: عنصر، tag(s) → عنصر صغير بجوار الاسم، bar: عنصر فوق اليد، overlay: عنصر، lastBtn }
let showLast = false;
export function trickTable(el, v, ui, cfg) {
  const n = cfg.n || 4, me = ui.seat;
  const POS = { 2: ['bottom', 'top'], 3: ['bottom', 'right', 'left'], 4: ['bottom', 'right', 'top', 'left'] }[n];
  const pos = (s) => POS[(s - me + n) % n];
  const wrap = h('div', { class: 'bl-wrap cx-wrap' + (cfg.cls ? ' ' + cfg.cls : '') });
  for (let k = 1; k < n; k++) {
    const s = (me + k) % n;
    wrap.append(h('div', { class: 'bl-seat bl-' + pos(s) },
      ui.plate(s, cfg.tag ? cfg.tag(s) : null),
      h('div', { class: 'bl-backs' }, Array.from({ length: v.counts[s] }, back)),
      cfg.seatExtra ? cfg.seatExtra(s) : null));
  }
  const center = h('div', { class: 'bl-center' });
  if (cfg.center) center.append(cfg.center);
  else {
    const useLast = showLast && v.lastTrick;
    const trick = useLast ? v.lastTrick.cards : v.trick || [];
    for (const p of trick) center.append(h('div', { class: 'bl-tc bl-tc-' + pos(p.seat) + (useLast && v.lastTrick.winner === p.seat ? ' win' : '') }, cardEl(p.card)));
  }
  wrap.append(center);
  if (cfg.score) wrap.append(h('div', { class: 'bl-score' }, cfg.score,
    v.lastTrick && cfg.lastBtn !== false ? h('button', { type: 'button', class: 'bl-lastbtn' + (showLast ? ' on' : ''), onclick: () => { showLast = !showLast; el.innerHTML = ''; trickTable(el, v, ui, cfg); } }, '↺ ', t('cx_last')) : null));
  const legal = cfg.legal || new Set();
  const sel = cfg.selected || new Set();
  const hand = h('div', { class: 'bl-hand cx-hand' + (v.hand.length > 13 ? ' many' : ''), style: { '--n': v.hand.length } }, v.hand.map((c, i) => {
    const can = legal.has(c);
    const b = h('button', { type: 'button', class: 'bl-hc' + (can ? ' can' : '') + (cfg.dimOthers && !can ? ' dim' : '') + (sel.has(c) ? ' sel' : ''), disabled: !can, style: { '--i': i } }, cardEl(c));
    if (can) b.addEventListener('click', () => { showLast = false; cfg.onPlay(c); });
    return b;
  }));
  wrap.append(h('div', { class: 'bl-me' }, h('div', { class: 'bl-mebar' }, ui.plate(me, cfg.tag ? cfg.tag(me) : null), cfg.meExtra || null), cfg.bar || null, hand));
  if (cfg.overlay) wrap.append(cfg.overlay);
  el.append(wrap);
}
export function resetLast() { showLast = false; }
// بطاقة نهاية الجولة: rows = [[label, ...values]], heads = أسماء الأعمدة
export function roundCard(title, heads, rows, ui, extra) {
  return h('div', { class: 'bl-endwrap' }, h('div', { class: 'dm-rcard bl-endcard' },
    h('h3', {}, title), extra || null,
    h('table', { class: 'bl-table' }, h('tr', {}, h('th', {}), ...heads.map(x => h('th', {}, x))),
      rows.map((r, i) => h('tr', { class: i === rows.length - 1 ? 'tot' : '' }, h('th', {}, r[0]), ...r.slice(1).map(x => h('td', {}, typeof x === 'number' ? num(x) : x))))),
    ui.needs.includes(ui.seat) ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('cx_next')) : h('p', { class: 'muted' }, t('cx_wait'))));
}

// ====== ذكاء الكمبيوتر العام ======
// لعبة كسب الأكلات (الطرنيب): اكسب بأرخص ورقة، ولا تنافس شريكك، وتخلّص من أضعف ورقة عند العجز.
export function botWin(hand, trick, trump, seat, partnerOf, lv = 'hard', played = []) {
  const legal = followable(hand, trick);
  const low = (arr) => arr.slice().sort((a, b) => ((st(a) === trump) - (st(b) === trump)) || rv(a) - rv(b))[0];
  if (lv === 'easy' && Math.random() < .35) return legal[Math.floor(Math.random() * legal.length)];
  if (!trick.length) {
    // ابدأ بآس أو ورقة هي الأعلى المتبقية في نوع غير الحكم
    const top = legal.filter(c => st(c) !== trump && RANKS.slice(rv(c) + 1).every(r => played.includes(r + st(c)) || hand.includes(r + st(c))));
    if (top.length) return top.sort((a, b) => rv(b) - rv(a))[0];
    const nonT = legal.filter(c => st(c) !== trump);
    return low(nonT.length ? nonT : legal);
  }
  const cur = trickWinner(trick, trump);
  const wins = legal.filter(c => trickWinner([...trick, { seat, card: c }], trump) === seat);
  if (partnerOf != null && cur === partnerOf) {
    const last = trick.length === 3; const strong = trick.find(p => p.seat === cur).card;
    if (last || rv(strong) >= 11 || st(strong) === trump) return low(legal);
  }
  if (wins.length) {
    return low(wins);
  }
  return low(legal);
}
// لعبة تجنب الأكلات (الليخة والتريكس): danger(c) قيمة خطورة الورقة
export function botAvoid(hand, trick, legal, danger, lv = 'hard') {
  if (lv === 'easy' && Math.random() < .3) return legal[Math.floor(Math.random() * legal.length)];
  const dsc = (arr) => arr.slice().sort((a, b) => danger(b) - danger(a) || rv(b) - rv(a));
  if (!trick.length) {
    // ابدأ بأصغر ورقة في نوع آمن
    return legal.slice().sort((a, b) => danger(a) - danger(b) || rv(a) - rv(b))[0];
  }
  const led = st(trick[0].card);
  const follow = legal.filter(c => st(c) === led);
  if (!follow.length) return dsc(legal)[0];
  const high = Math.max(...trick.filter(p => st(p.card) === led).map(p => rv(p.card)));
  const under = follow.filter(c => rv(c) < high);
  if (under.length) return dsc(under)[0];
  const pts = trick.reduce((a, p) => a + danger(p.card), 0);
  if (trick.length === 3 && pts === 0) return follow.filter(c => !danger(c)).sort((a, b) => rv(b) - rv(a))[0] || follow.sort((a, b) => rv(a) - rv(b))[0];
  return follow.slice().sort((a, b) => danger(a) - danger(b) || rv(a) - rv(b))[0];
}
