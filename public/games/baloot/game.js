// البلوت السعودي: أربعة لاعبين في فريقين، صن وحكم وأشكل، والمشاريع (سرا، خمسين، مية، أربعمية، بلوت)، واللعبة إلى 152.
// مع «دليل البلوت»: دروس مصورة وتمارين تفاعلية لتعلّم الورق والأكلات والحساب.
import { h, t, addDict, sound, num, ico, modal, settings } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import * as R from './rules.js';
import { openGuide } from './learn.js';

addDict({
  ar: {
    bl_target: 'تنتهي اللعبة عند', bl_sun: 'صن', bl_hokm: 'حكم', bl_pass: 'بَس', bl_ashkal: 'أشكل', bl_bid1: 'الشراء — الدور الأول', bl_bid2: 'الشراء — الدور الثاني',
    bl_us: 'لنا', bl_them: 'لهم', bl_up: 'الورقة المكشوفة', bl_buyer: 'المشتري: {name}', bl_mode: 'اللعب: {m}', bl_trump: 'الحكم: {s}', bl_yourBid: 'دورك في الشراء', bl_yourPlay: 'دورك: العب ورقة',
    bl_lastTrick: 'الأكلة السابقة', bl_redeal: 'لم يشترِ أحد، أعيد التوزيع.', bl_roundEnd: 'نهاية الجولة', bl_next: 'الجولة التالية', bl_waitNext: 'بانتظار صاحب الغرفة…',
    bl_tricks: 'الأكلات', bl_cards: 'أبناط الورق', bl_projects: 'المشاريع', bl_baloot: 'بلوت', bl_total: 'المجموع', bl_kaboot: 'كبوت! 🎉', bl_lost: 'خسرانة! المشتري لم يحقق أكثر من النصف', bl_team: 'فريق {a} و{b}',
    bl_guide: 'دليل البلوت: تعلّم اللعبة من الصفر', bl_guideD: 'دروس مصورة وتمارين تفاعلية على الورق والأكلات والمشاريع والحساب', bl_hint: 'تلميح', bl_hintTxt: 'اقتراح المساعد: {c}', bl_mustFollow: 'يجب أن تلعب من النوع نفسه أو تقطع بالحكم',
    bl_rules: `<h4>الفكرة</h4><p>أربعة لاعبين في فريقين، كل شريكين متقابلين. 32 ورقة (من 7 إلى الإكه). الهدف أن يجمع فريقك <b>152</b> نقطة.</p>
<h4>التوزيع والشراء</h4><ol><li>يوزَّع لكل لاعب 5 أوراق، وتُكشف ورقة.</li><li>الدور الأول: كل لاعب يختار <b>صن</b> (بلا حكم) أو <b>حكم</b> (نوع الورقة المكشوفة) أو <b>بَس</b>. الصن يغلب الحكم. و<b>أشكل</b> للاعب الثالث والرابع: صن يأخذ فيه الشريك الورقة المكشوفة.</li><li>إن مرر الجميع يبدأ دور ثانٍ يمكن فيه اختيار حكم من نوع آخر أو صن، وإن مرروا يعاد التوزيع.</li><li>يأخذ المشتري الورقة المكشوفة ويُكمل التوزيع حتى يصبح مع كل لاعب 8 أوراق.</li></ol>
<h4>اللعب</h4><ol><li>يجب أن تلعب من نوع الورقة الأولى إن كان معك.</li><li>في الحكم: إن لم يكن معك النوع وجب أن «تقطع» بالحكم (وتعلو على حكم المنافس إن استطعت)، إلا إذا كان شريكك رابحًا للأكلة.</li><li>إن لُعب الحكم يجب أن تعلو عليه إن استطعت.</li></ol>
<h4>قوة الورق وأبناطه</h4><table><tr><th>الصن والأنواع العادية</th><td>إكه 11 · 10 = 10 · شايب 4 · بنت 3 · ولد 2 · 9 و8 و7 = 0</td></tr><tr><th>الحكم</th><td>ولد 20 · 9 = 14 · إكه 11 · 10 = 10 · شايب 4 · بنت 3 · 8 و7 = 0</td></tr></table><p>الأكلة الأخيرة «الأرض» عليها 10. المجموع 130 في الصن (= 26 نقطة) و162 في الحكم (= 16 نقطة).</p>
<h4>المشاريع</h4><ul><li><b>سرا</b>: 3 أوراق متتالية من نوع واحد (4 نقاط في الصن، 2 في الحكم).</li><li><b>خمسين</b>: 4 متتالية (10 / 5).</li><li><b>مية</b>: 5 متتالية أو أربع عشرات أو شياب أو بنات أو أولاد (20 / 10).</li><li><b>أربعمية</b>: أربع إكك في الصن (40).</li><li><b>بلوت</b>: الشايب والبنت من الحكم (نقطتان).</li></ul><p>يأخذ المشاريع الفريق صاحب أعلى مشروع فقط.</p>
<h4>الحساب</h4><p>إن لم يحقق فريق المشتري أكثر من نصف النقاط فهي <b>خسرانة</b>: يأخذ المنافس الجولة كاملة. وإن أخذ فريق الأكلات الثماني فهو <b>كبوت</b> (44 في الصن و25 في الحكم).</p><p class="muted">في هذه النسخة لا يوجد الدبل والقهوة، وتُعلن المشاريع تلقائيًا.</p>`,
  },
  en: {
    bl_target: 'Play to', bl_sun: 'Sun', bl_hokm: 'Hokm', bl_pass: 'Pass', bl_ashkal: 'Ashkal', bl_bid1: 'Bidding — round 1', bl_bid2: 'Bidding — round 2',
    bl_us: 'Us', bl_them: 'Them', bl_up: 'Face-up card', bl_buyer: 'Buyer: {name}', bl_mode: 'Mode: {m}', bl_trump: 'Trump: {s}', bl_yourBid: 'Your bid', bl_yourPlay: 'Your turn: play a card',
    bl_lastTrick: 'Last trick', bl_redeal: 'Nobody bid — redealing.', bl_roundEnd: 'End of round', bl_next: 'Next round', bl_waitNext: 'Waiting for the host…',
    bl_tricks: 'Tricks', bl_cards: 'Card points', bl_projects: 'Projects', bl_baloot: 'Belote', bl_total: 'Total', bl_kaboot: 'Capot! 🎉', bl_lost: 'Failed: the buyer did not make more than half', bl_team: 'Team {a} & {b}',
    bl_guide: 'Baloot guide: learn from zero', bl_guideD: 'Illustrated lessons and interactive drills', bl_hint: 'Hint', bl_hintTxt: 'Suggested: {c}', bl_mustFollow: 'Follow suit or trump',
    bl_rules: `<p>Four players in two partnerships, 32 cards, game to 152. Bid Sun (no trump) or Hokm (trump), follow suit, trump when void in Hokm, score card points, projects and the last trick.</p>`,
  },
});
const COLORS = ['#0f766e', '#b91c1c', '#0f766e', '#b91c1c'];
const sym = (s) => R.SUIT_SYM[s];
const red = (s) => s === 'H' || s === 'D';
export function cardEl(c, opts = {}) {
  const r = R.rk(c), s = R.st(c);
  return h('div', { class: 'bc-card' + (red(s) ? ' red' : '') + (opts.cls ? ' ' + opts.cls : ''), title: R.RANK_AR[r] + ' ' + R.SUIT_AR[s] },
    h('span', { class: 'bc-tl' }, h('b', {}, R.RANK_LBL[r]), h('i', {}, sym(s))),
    h('span', { class: 'bc-mid' }, ['J', 'Q', 'K'].includes(r) ? h('span', { class: 'bc-face' }, { J: '🤴', Q: '👸', K: '🤴🏻' }[r]) : sym(s)),
    h('span', { class: 'bc-br' }, h('b', {}, R.RANK_LBL[r]), h('i', {}, sym(s))));
}
const back = () => h('div', { class: 'bc-back' });
const modeName = (v) => v.mode === 'sun' ? t('bl_sun') : t('bl_hokm') + ' ' + sym(v.trump);

const def = {
  id: 'baloot', name: { ar: 'البلوت', en: 'Baloot' }, counts: [4], hidden: true, colors: COLORS, botDelay: 900,
  options: () => [{ key: 'target', label: t('bl_target'), choices: [[152, num(152)], [100, num(100)], [52, num(52)]], def: 152 }],
  teams: () => [0, 1, 0, 1],
  rules: () => t('bl_rules'),
  setupExtra: () => h('button', { type: 'button', class: 'bl-guide-btn', onclick: () => openGuide() }, h('span', { class: 'bl-guide-ic' }, '🎓'), h('span', {}, h('b', {}, t('bl_guide')), h('small', {}, t('bl_guideD')))),
  init(players, o) { const s = { players, scores: [0, 0], target: +o.target || 152, dealer: 3, round: 0 }; R.newRound(s); return s; },
  view(s, seat) {
    const v = { ...s, hands: undefined, rest: undefined, me: seat, hand: s.hands[seat] ? R.sortHand(s.hands[seat], s.trump) : [], counts: s.hands.map(x => x.length) };
    if (s.phase === 'play' && s.turn === seat) v.legal = R.legalCards(s.hands[seat], s.trick, s.trump, seat);
    if ((s.phase === 'bid1' || s.phase === 'bid2') && s.bidTurn === seat) v.bidOpts = R.bidOptions(s, seat);
    v.projects = s.tricks === 0 && s.phase === 'play' ? s.projects.map(p => ({ type: p.type, seat: p.seat })) : [];
    delete v.played;
    return v;
  },
  needs(s) { if (s.phase === 'bid1' || s.phase === 'bid2') return [s.bidTurn]; if (s.phase === 'play') return [s.turn]; if (s.phase === 'roundEnd') return [0]; return []; },
  apply(s, seat, a) {
    if (s.phase === 'roundEnd') { if (a.type !== 'next') return t('gk_err'); R.nextRound(s); return null; }
    s.flash = null;
    if (a.type === 'bid') return R.applyBid(s, seat, a.choice) ? null : t('gk_err');
    if (a.type === 'play') return R.playCard(s, seat, a.card) ? null : t('bl_mustFollow');
    return t('gk_err');
  },
  bot(s, seat, lv) {
    if (s.phase === 'roundEnd') return { type: 'next' };
    if (s.phase === 'bid1' || s.phase === 'bid2') return { type: 'bid', choice: R.botBid(s, seat, lv) };
    return { type: 'play', card: R.botPlay(s, seat, lv) };
  },
  botDelay: (s) => s.phase === 'roundEnd' ? 4500 : s.phase === 'play' && s.trick.length === 0 && s.lastTrick ? 1300 : 850,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const w = s.scores[0] > s.scores[1] ? 0 : 1;
    const tn = (k) => t('bl_team', { a: s.players[k].name, b: s.players[k + 2].name });
    return { title: R.team(seat) === w ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: tn(w) }), win: R.team(seat) === w,
      lines: [0, 1].map(k => ({ label: tn(k), value: num(s.scores[k]), color: COLORS[k] })) };
  },
  status(v, ui) {
    if (v.phase === 'roundEnd') return t('bl_roundEnd');
    if (v.phase === 'over') return t('gk_gameOver');
    if (v.phase.startsWith('bid')) return ui.myTurn ? t('bl_yourBid') : t('gk_turnOf', { name: ui.name(v.bidTurn) });
    return ui.myTurn ? t('bl_yourPlay') : t('gk_turnOf', { name: ui.name(v.turn) });
  },
  render(el, v, ui) { renderBaloot(el, v, ui); },
};

let showLast = false;
function renderBaloot(el, v, ui) {
  const me = ui.seat; const pos = (s) => ['bottom', 'right', 'top', 'left'][(s - me + 4) % 4];
  const myTeam = R.team(me);
  const wrap = h('div', { class: 'bl-wrap' });
  // اللاعبون الآخرون
  for (const s of [1, 2, 3].map(k => (me + k) % 4)) {
    const p = pos(s);
    const proj = v.projects.filter(x => x.seat === s);
    wrap.append(h('div', { class: 'bl-seat bl-' + p },
      ui.plate(s, h('small', { class: 'bl-tag', style: { background: COLORS[s] } }, R.team(s) === myTeam ? t('bl_us') : t('bl_them'))),
      h('div', { class: 'bl-backs' }, Array.from({ length: v.counts[s] }, back)),
      proj.length ? h('div', { class: 'bl-proj' }, proj.map(x => h('span', {}, settings.lang === 'ar' ? R.PROJ_NAME[x.type] : R.PROJ_NAME_EN[x.type]))) : null,
      bidBubble(v, s)));
  }
  // الوسط
  const center = h('div', { class: 'bl-center' });
  if (v.phase === 'bid1' || v.phase === 'bid2') {
    center.append(h('div', { class: 'bl-upbox' }, h('small', {}, t('bl_up')), cardEl(v.up, { cls: 'big' }), h('small', { class: 'bl-phase' }, v.phase === 'bid1' ? t('bl_bid1') : t('bl_bid2'))));
  } else {
    const trick = showLast && v.lastTrick ? v.lastTrick.cards : v.trick;
    for (const p of trick) center.append(h('div', { class: 'bl-tc bl-tc-' + pos(p.seat) + (showLast && v.lastTrick?.winner === p.seat ? ' win' : '') }, cardEl(p.card)));
  }
  wrap.append(center);
  // لوحة النتيجة
  wrap.append(h('div', { class: 'bl-score' },
    h('div', { class: 'bl-srow' }, h('span', {}, t('bl_us')), h('b', {}, num(v.scores[myTeam]))),
    h('div', { class: 'bl-srow them' }, h('span', {}, t('bl_them')), h('b', {}, num(v.scores[1 - myTeam]))),
    h('small', {}, '🎯 ', num(v.target)),
    v.mode && v.phase !== 'bid1' && v.phase !== 'bid2' ? h('div', { class: 'bl-modeb' }, modeName(v), ' · ', ui.name(v.bid.by)) : null,
    v.lastTrick && v.phase === 'play' ? h('button', { type: 'button', class: 'bl-lastbtn' + (showLast ? ' on' : ''), onclick: () => { showLast = !showLast; redraw(); } }, ico('rotate-ccw', 14), t('bl_lastTrick')) : null));
  // يدي
  const legal = new Set(v.legal || []);
  const myProj = v.projects.filter(x => x.seat === me);
  const hand = h('div', { class: 'bl-hand', style: { '--n': v.hand.length } }, v.hand.map((c, i) => {
    const can = ui.myTurn && v.phase === 'play' && legal.has(c);
    const b = h('button', { type: 'button', class: 'bl-hc' + (can ? ' can' : '') + (v.phase === 'play' && ui.myTurn && !can ? ' dim' : ''), style: { '--i': i }, disabled: !can }, cardEl(c));
    if (can) b.addEventListener('click', () => { sound('place'); showLast = false; ui.act({ type: 'play', card: c }); });
    return b;
  }));
  const bidBar = v.bidOpts && ui.myTurn ? h('div', { class: 'bl-bids' }, v.bidOpts.map(o => {
    const lbl = o === 'pass' ? t('bl_pass') : o === 'sun' ? t('bl_sun') : o === 'ashkal' ? t('bl_ashkal') : o === 'hokm' ? t('bl_hokm') + ' ' + sym(R.st(v.up)) : t('bl_hokm') + ' ' + sym(o.slice(5));
    return h('button', { type: 'button', class: 'bl-bid bl-bid-' + o.split(':')[0] + (o.includes(':') && red(o.slice(5)) ? ' red' : ''), onclick: () => ui.act({ type: 'bid', choice: o }) }, lbl);
  })) : null;
  wrap.append(h('div', { class: 'bl-me' },
    h('div', { class: 'bl-mebar' }, ui.plate(me, h('small', { class: 'bl-tag', style: { background: COLORS[me] } }, t('bl_us'))), bidBubble(v, me),
      myProj.length ? h('div', { class: 'bl-proj' }, myProj.map(x => h('span', {}, settings.lang === 'ar' ? R.PROJ_NAME[x.type] : R.PROJ_NAME_EN[x.type]))) : null,
      ui.myTurn && v.phase === 'play' ? h('button', { type: 'button', class: 'btn ghost sm bl-hintbtn', onclick: () => hint(v, ui) }, ico('lightbulb', 15), t('bl_hint')) : null),
    bidBar, hand));
  if (v.phase === 'roundEnd' && v.summary) wrap.append(summaryCard(v, ui));
  el.append(wrap);
  function redraw() { el.innerHTML = ''; renderBaloot(el, v, ui); }
}
function bidBubble(v, s) {
  if (!(v.phase === 'bid1' || v.phase === 'bid2')) return null;
  const last = [...(v.bidLog || [])].reverse().find(x => x.seat === s);
  if (!last) return null;
  const c = last.choice; const lbl = c === 'pass' ? t('bl_pass') : c === 'sun' ? t('bl_sun') : c === 'ashkal' ? t('bl_ashkal') : t('bl_hokm') + ' ' + sym(c === 'hokm' ? R.st(v.up) : c.slice(5));
  return h('span', { class: 'bl-bubble' + (c === 'pass' ? ' pass' : '') }, lbl);
}
function hint(v, ui) {
  // نحاكي اختيار الكمبيوتر القوي من منظور اللاعب الحالي اعتمادًا على ما يراه فقط
  const fake = { hands: [], trick: v.trick, trump: v.trump, played: [] };
  fake.hands[ui.seat] = v.hand;
  const c = R.botPlay(fake, ui.seat, 'hard');
  const els = [...document.querySelectorAll('.bl-hc')];
  const i = v.hand.indexOf(c); if (els[i]) { els[i].classList.add('hinted'); setTimeout(() => els[i]?.classList.remove('hinted'), 2500); }
}
function summaryCard(v, ui) {
  const S = v.summary, me = ui.seat, my = R.team(me);
  const tn = (k) => k === my ? t('bl_us') : t('bl_them');
  const row = (lbl, a, b) => h('tr', {}, h('th', {}, lbl), h('td', {}, a), h('td', {}, b));
  const order = [my, 1 - my];
  return h('div', { class: 'bl-endwrap' }, h('div', { class: 'dm-rcard bl-endcard' },
    h('h3', {}, t('bl_roundEnd'), ' — ', S.mode === 'sun' ? t('bl_sun') : t('bl_hokm') + ' ' + sym(S.trump)),
    S.kaboot != null ? h('p', { class: 'dm-who' }, t('bl_kaboot'), ' ', tn(S.kaboot)) : null,
    S.lost ? h('p', { class: 'bl-lost' }, t('bl_lost')) : null,
    h('table', { class: 'bl-table' },
      h('tr', {}, h('th', {}), ...order.map(k => h('th', {}, tn(k)))),
      row(t('bl_cards'), ...order.map(k => num(S.raw[k]))),
      row(t('bl_tricks'), ...order.map(k => num(S.pts[k]))),
      row(t('bl_projects'), ...order.map(k => num(S.projPts[k]))),
      row(t('bl_baloot'), ...order.map(k => num(S.balootPts[k]))),
      h('tr', { class: 'tot' }, h('th', {}, t('bl_total')), ...order.map(k => h('td', {}, num(S.tot[k]))))),
    S.projects.length ? h('div', { class: 'bl-projlist' }, S.projects.map(p => h('div', { class: 'bl-prow' + (R.team(p.seat) === S.projWinner ? ' won' : '') }, h('b', {}, ui.name(p.seat), ': ', settings.lang === 'ar' ? R.PROJ_NAME[p.type] : R.PROJ_NAME_EN[p.type]), h('span', { class: 'bl-mini' }, p.cards.map(c => cardEl(c, { cls: 'mini' })))))) : null,
    h('p', {}, t('bl_us'), ' ', num(v.scores[my]), ' — ', num(v.scores[1 - my]), ' ', t('bl_them')),
    ui.needs.includes(me) ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('bl_next')) : h('p', { class: 'muted' }, t('bl_waitNext'))));
}

export async function mount(root, ctx) {
  if (!document.getElementById('bl-css')) document.head.append(h('link', { id: 'bl-css', rel: 'stylesheet', href: new URL('./baloot.css', import.meta.url).href }));
  if (!document.getElementById('dm-css')) document.head.append(h('link', { id: 'dm-css', rel: 'stylesheet', href: new URL('../domino/domino.css', import.meta.url).href }));
  showLast = false;
  return tableGame(root, ctx, def);
}
export const _test = { def };
