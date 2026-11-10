// بنك الحظ: لعبة العقارات الشهيرة لـ2 إلى 4 لاعبين. ارمِ النردين، واشترِ المدن والمطارات والشركات، واجمع الإيجار،
// وابنِ البيوت والفنادق حين تملك مجموعة كاملة، واحذر السجن والضرائب وبطاقات الحظ. يفوز آخر من لا يُفلس، أو الأغنى عند نهاية الجولات.
import { h, t, addDict, num, sound, is3d } from '../../assets/js/core.js';
import { tableGame, dieFace } from '../../assets/js/gamekit.js';
addDict({
  ar: {
    bk_roll: 'ارمِ النردين', bk_buy: 'اشترِ بـ {p}', bk_skip: 'لا أريد', bk_end: 'أنهِ الدور', bk_build: 'ابنِ', bk_jailPay: 'ادفع 50 واخرج', bk_jailRoll: 'حاول الدبل', bk_rounds: 'مدة اللعبة', bk_r20: '20 جولة', bk_r40: '40 جولة', bk_rInf: 'حتى الإفلاس',
    bk_cash: 'النقد', bk_worth: 'الثروة', bk_inJail: 'في السجن', bk_out: 'أفلس', bk_houses: 'بيوت', bk_hotel: 'فندق', bk_rent: 'الإيجار', bk_price: 'السعر', bk_owner: 'المالك', bk_bank: 'البنك', bk_round: 'الجولة {n}',
    bk_yourTurn: 'دورك: ارمِ النردين', bk_decide: 'هل تشتري {name}؟', bk_manage: 'يمكنك البناء ثم إنهاء الدور', bk_mortgaged: 'مرهونة',
    bk_rules: `<h4>الفكرة</h4><p>من 2 إلى 4 لاعبين، يبدأ كل لاعب بـ <b>1500</b>. تدور حول لوحة من 40 خانة فيها مدن عربية ومطارات وشركات.</p>
<h4>الدور</h4><ol><li>ارمِ النردين وتقدّم بمجموعهما. إن مررت بخانة <b>البداية</b> تأخذ 200.</li><li>إن وقفت على مدينة أو مطار أو شركة غير مملوكة يمكنك شراؤها.</li><li>إن كانت مملوكة لغيرك تدفع له <b>الإيجار</b>.</li><li>إن رميت <b>دبل</b> (رقمين متشابهين) تلعب مرة أخرى، وثلاثة دبل متتالية تُدخلك السجن.</li></ol>
<h4>المجموعات والبناء</h4><ul><li>إن امتلكت كل مدن اللون الواحد يتضاعف إيجارها، ويحق لك بناء البيوت بالتساوي (حتى 4 بيوت ثم فندق).</li><li>المطارات: 25 لمطار واحد، ثم 50 و100 و200.</li><li>الشركات: 4 أضعاف رقم النرد، و10 أضعافه إن امتلكت الشركتين.</li></ul>
<h4>السجن</h4><p>تدخل السجن إن وقفت على «اذهب إلى السجن» أو سحبت بطاقة تقول ذلك. للخروج: ادفع 50، أو ارمِ دبل خلال 3 أدوار، وفي الدور الثالث تدفع 50 مجبرًا.</p>
<h4>الحظ والكنز والضرائب</h4><p>بطاقات «الحظ» و«الكنز» تحمل مفاجآت: مكافأة أو غرامة أو انتقال. خانتا الضريبة تأخذان 200 و100.</p>
<h4>الإفلاس والفوز</h4><p>إن لم يكفِ نقدك للدفع تُباع بيوتك بنصف سعرها وتُرهن أملاكك بنصف قيمتها تلقائيًا. فإن لم يكفِ ذلك أفلست وخرجت. يفوز آخر لاعب باقٍ، أو صاحب أعلى ثروة عند انتهاء الجولات المحددة.</p>`,
  },
  en: { bk_roll: 'Roll dice', bk_buy: 'Buy for {p}', bk_skip: 'Skip', bk_end: 'End turn', bk_build: 'Build', bk_jailPay: 'Pay 50', bk_jailRoll: 'Roll for doubles', bk_rounds: 'Length', bk_r20: '20 rounds', bk_r40: '40 rounds', bk_rInf: 'Until bankruptcy', bk_cash: 'Cash', bk_worth: 'Worth', bk_inJail: 'In jail', bk_out: 'Bankrupt', bk_houses: 'houses', bk_hotel: 'hotel', bk_rent: 'Rent', bk_price: 'Price', bk_owner: 'Owner', bk_bank: 'Bank', bk_round: 'Round {n}', bk_yourTurn: 'Your turn: roll', bk_decide: 'Buy {name}?', bk_manage: 'Build or end your turn', bk_mortgaged: 'Mortgaged', bk_rules: '<p>Classic property trading: buy, collect rent, build houses on full colour sets, avoid jail. Last solvent player (or richest at the round limit) wins.</p>' },
});
const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#d97706'];
const GROUP = { br: '#8b5a2b', lb: '#7dd3fc', pk: '#db2777', or: '#f97316', rd: '#dc2626', yl: '#facc15', gr: '#16a34a', db: '#1e40af' };
// type: go, prop, rail, util, chance, chest, tax, jail, park, gojail
const B = [
  ['go', 'البداية'], ['prop', 'الأقصر', 'br', 60], ['chest', 'كنز'], ['prop', 'أسوان', 'br', 60], ['tax', 'ضريبة الدخل', 200], ['rail', 'مطار القاهرة', 200], ['prop', 'الإسكندرية', 'lb', 100], ['chance', 'حظ'], ['prop', 'بورسعيد', 'lb', 100], ['prop', 'الإسماعيلية', 'lb', 120],
  ['jail', 'السجن'], ['prop', 'عمّان', 'pk', 140], ['util', 'شركة الكهرباء', 150], ['prop', 'إربد', 'pk', 140], ['prop', 'العقبة', 'pk', 160], ['rail', 'ميناء جدة', 200], ['prop', 'بيروت', 'or', 180], ['chest', 'كنز'], ['prop', 'طرابلس', 'or', 180], ['prop', 'صيدا', 'or', 200],
  ['park', 'استراحة'], ['prop', 'تونس', 'rd', 220], ['chance', 'حظ'], ['prop', 'الجزائر', 'rd', 220], ['prop', 'الرباط', 'rd', 240], ['rail', 'مطار دبي', 200], ['prop', 'مسقط', 'yl', 260], ['prop', 'الدوحة', 'yl', 260], ['util', 'شركة المياه', 150], ['prop', 'المنامة', 'yl', 280],
  ['gojail', 'اذهب إلى السجن'], ['prop', 'الكويت', 'gr', 300], ['prop', 'أبوظبي', 'gr', 300], ['chest', 'كنز'], ['prop', 'دبي', 'gr', 320], ['rail', 'ميناء الدار البيضاء', 200], ['chance', 'حظ'], ['prop', 'جدة', 'db', 350], ['tax', 'ضريبة الرفاهية', 100], ['prop', 'الرياض', 'db', 400],
].map(([type, name, a, b], i) => ({ i, type, name, group: type === 'prop' ? a : null, price: type === 'prop' ? b : (type === 'rail' || type === 'util') ? a : 0, tax: type === 'tax' ? a : 0 }));
const ICON = { go: '🏁', chest: '🎁', chance: '❓', tax: '💸', rail: '✈️', util: '⚡', jail: '🚔', park: '☕', gojail: '👮' };
B[28].ic = '💧'; B[15].ic = '🚢'; B[35].ic = '🚢';
const base = (p) => Math.max(2, Math.round(p.price * p.price / 3200));
const MULT = [1, 4, 12, 28, 34, 40];
const houseCost = (i) => [50, 100, 150, 200][Math.floor(i / 10)];
const groupOf = (g) => B.filter(c => c.group === g).map(c => c.i);
const CARDS = {
  chance: [['تقدّم إلى البداية واقبض 200', { to: 0 }], ['اذهب إلى السجن مباشرة', { jail: 1 }], ['ربحت جائزة مسابقة: 150', { cash: 150 }], ['غرامة سرعة: ادفع 50', { cash: -50 }], ['ارجع 3 خانات', { back: 3 }], ['تقدّم إلى أقرب مطار أو ميناء', { rail: 1 }], ['رحلة إلى الرياض', { to: 39 }], ['عائد استثمار: 100', { cash: 100 }], ['صيانة أملاكك: 25 لكل بيت', { repair: 25 }], ['انتُخبت رئيسًا للنادي: ادفع لكل لاعب 50', { each: -50 }]],
  chest: [['خطأ من البنك لصالحك: 200', { cash: 200 }], ['فاتورة الطبيب: ادفع 50', { cash: -50 }], ['عيد ميلادك: يدفع لك كل لاعب 10', { each: 10 }], ['ميراث: 100', { cash: 100 }], ['رسوم المدرسة: ادفع 100', { cash: -100 }], ['اذهب إلى السجن', { jail: 1 }], ['استرداد ضريبة: 20', { cash: 20 }], ['تقدّم إلى البداية', { to: 0 }], ['مكافأة تفوق دراسي: 50', { cash: 50 }], ['تأمين: ادفع 50', { cash: -50 }]],
};
const r6 = () => 1 + Math.floor(Math.random() * 6);
function owns(s, seat, g) { return groupOf(g).every(i => s.own[i] === seat); }
function rentOf(s, i, dice) {
  const c = B[i], o = s.own[i]; if (o == null || s.mort[i]) return 0;
  if (c.type === 'rail') { const n = [5, 15, 25, 35].filter(k => s.own[k] === o).length; return 25 * 2 ** (n - 1); }
  if (c.type === 'util') { const n = [12, 28].filter(k => s.own[k] === o).length; return (dice || 7) * (n === 2 ? 10 : 4); }
  const hs = s.houses[i] || 0; if (hs) return base(c) * MULT[hs];
  return base(c) * (owns(s, o, c.group) ? 2 : 1);
}
function worth(s, seat) { let w = s.cash[seat]; for (const [i, o] of Object.entries(s.own)) if (o === seat) w += (s.mort[i] ? B[i].price / 2 : B[i].price) + (s.houses[i] || 0) * houseCost(+i); return w; }
const log = (s, m) => { s.log.unshift(m); s.log.length = Math.min(s.log.length, 6); };
const alive = (s) => s.players.map((_, i) => i).filter(i => !s.out[i]);
// الدفع مع التصفية التلقائية والإفلاس
function pay(s, from, to, amt) {
  if (amt <= 0) return;
  if (s.cash[from] < amt) liquidate(s, from, amt);
  if (s.cash[from] < amt) { // إفلاس
    const left = s.cash[from]; if (to != null) s.cash[to] += left; s.cash[from] = 0; s.out[from] = true;
    for (const i of Object.keys(s.own)) if (s.own[i] === from) { if (to != null) { s.own[i] = to; } else { delete s.own[i]; delete s.mort[i]; } delete s.houses[i]; }
    log(s, `💥 ${s.players[from].name} أفلس`); return;
  }
  s.cash[from] -= amt; if (to != null) s.cash[to] += amt;
}
function liquidate(s, seat, need) {
  const mine = Object.keys(s.own).map(Number).filter(i => s.own[i] === seat);
  for (const i of mine.sort((a, b) => (s.houses[b] || 0) - (s.houses[a] || 0))) while ((s.houses[i] || 0) > 0 && s.cash[seat] < need) { s.houses[i]--; s.cash[seat] += houseCost(i) / 2; }
  for (const i of mine.sort((a, b) => B[a].price - B[b].price)) if (!s.mort[i] && !(s.houses[i] > 0) && s.cash[seat] < need) { s.mort[i] = true; s.cash[seat] += B[i].price / 2; log(s, `🏦 رُهنت ${B[i].name}`); }
}
function canBuild(s, seat, i) {
  const c = B[i]; if (c.type !== 'prop' || s.own[i] !== seat || !owns(s, seat, c.group)) return false;
  const g = groupOf(c.group); if (g.some(k => s.mort[k])) return false; const hs = s.houses[i] || 0; if (hs >= 5) return false;
  return g.every(k => (s.houses[k] || 0) >= hs) && s.cash[seat] >= houseCost(i);
}
function nextTurn(s) {
  const a = alive(s); if (a.length <= 1) { s.phase = 'over'; return; }
  let k = s.turn; do { k = (k + 1) % s.players.length; if (k === 0) s.round++; } while (s.out[k]);
  s.turn = k; s.dbl = 0; s.phase = s.jail[k] ? 'jail' : 'roll'; s.card = null;
  if (s.maxRounds && s.round > s.maxRounds) s.phase = 'over';
}
function moveTo(s, seat, to, passGo = true) {
  if (passGo && to < s.pos[seat]) { s.cash[seat] += 200; log(s, `🏁 ${s.players[seat].name} مرّ بالبداية: +200`); }
  s.pos[seat] = to;
}
function toJail(s, seat) { s.pos[seat] = 10; s.jail[seat] = 1; s.dbl = 0; log(s, `🚔 ${s.players[seat].name} دخل السجن`); }
function land(s, seat) {
  const c = B[s.pos[seat]], nm = s.players[seat].name, dice = s.dice[0] + s.dice[1];
  if (['prop', 'rail', 'util'].includes(c.type)) {
    const o = s.own[c.i];
    if (o == null) { s.phase = 'buy'; return; }
    if (o !== seat) { const r = rentOf(s, c.i, dice); if (r) { pay(s, seat, o, r); log(s, `🏠 ${nm} دفع إيجار ${c.name}: ${r} إلى ${s.players[o].name}`); } }
  } else if (c.type === 'tax') { pay(s, seat, null, c.tax); log(s, `💸 ${nm} دفع ${c.name}: ${c.tax}`); }
  else if (c.type === 'gojail') { toJail(s, seat); s.phase = 'manage'; return; }
  else if (c.type === 'chance' || c.type === 'chest') {
    const deck = s.decks[c.type]; const [txt, e] = CARDS[c.type][deck.shift()]; deck.push(CARDS[c.type].findIndex(x => x[0] === txt));
    s.card = { kind: c.type, txt }; log(s, `${ICON[c.type]} ${nm}: ${txt}`);
    if (e.cash > 0) s.cash[seat] += e.cash; if (e.cash < 0) pay(s, seat, null, -e.cash);
    if (e.each) for (const o of alive(s)) if (o !== seat) { if (e.each > 0) pay(s, o, seat, e.each); else pay(s, seat, o, -e.each); }
    if (e.repair) { const n = Object.keys(s.own).filter(i => s.own[i] === seat).reduce((a, i) => a + (s.houses[i] || 0), 0); pay(s, seat, null, n * e.repair); }
    if (e.jail) { toJail(s, seat); s.phase = 'manage'; return; }
    if (e.to != null) { moveTo(s, seat, e.to); return land(s, seat); }
    if (e.back) { s.pos[seat] = (s.pos[seat] + 40 - e.back) % 40; return land(s, seat); }
    if (e.rail) { let p = s.pos[seat]; do p = (p + 1) % 40; while (B[p].type !== 'rail'); moveTo(s, seat, p); return land(s, seat); }
  }
  s.phase = s.out[seat] ? 'manage' : 'manage';
}
const def = {
  id: 'bank', name: { ar: 'بنك الحظ', en: 'Fortune Bank' }, counts: [2, 3, 4], defaultCount: 4, colors: COLORS, botDelay: 900,
  options: () => [{ key: 'rounds', label: t('bk_rounds'), choices: [[20, t('bk_r20')], [40, t('bk_r40')], [100, t('bk_rInf')]], def: 40 }],
  rules: () => t('bk_rules'),
  init(players, o) {
    const n = players.length, sh = (k) => { const a = CARDS[k].map((_, i) => i); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    return { players, cash: Array(n).fill(1500), pos: Array(n).fill(0), jail: Array(n).fill(0), out: Array(n).fill(false), own: {}, houses: {}, mort: {}, turn: 0, phase: 'roll', dice: [1, 1], dbl: 0, round: 1, maxRounds: +o.rounds || 100, log: [], card: null, decks: { chance: sh('chance'), chest: sh('chest') }, rollId: 0 };
  },
  view: (s) => s,
  needs: (s) => s.phase === 'over' ? [] : [s.turn],
  apply(s, seat, a) {
    const nm = s.players[seat].name;
    if (s.phase === 'roll' && a.type === 'roll') {
      const d = [r6(), r6()]; s.dice = d; s.rollId++; s.card = null; const dbl = d[0] === d[1];
      if (dbl) { s.dbl++; if (s.dbl >= 3) { toJail(s, seat); s.phase = 'manage'; return null; } } else s.dbl = 0;
      moveTo(s, seat, (s.pos[seat] + d[0] + d[1]) % 40); land(s, seat); return null;
    }
    if (s.phase === 'jail') {
      if (a.type === 'pay') { pay(s, seat, null, 50); s.jail[seat] = 0; s.phase = 'roll'; log(s, `🔓 ${nm} دفع 50 وخرج من السجن`); return null; }
      if (a.type === 'roll') {
        const d = [r6(), r6()]; s.dice = d; s.rollId++;
        if (d[0] === d[1]) { s.jail[seat] = 0; log(s, `🎲 ${nm} رمى دبل وخرج من السجن`); moveTo(s, seat, (s.pos[seat] + d[0] + d[1]) % 40); s.dbl = 0; land(s, seat); if (s.phase === 'roll') s.phase = 'manage'; s.noAgain = true; return null; }
        s.jail[seat]++; if (s.jail[seat] > 3) { pay(s, seat, null, 50); s.jail[seat] = 0; log(s, `🔓 ${nm} دفع 50 إجباريًا`); moveTo(s, seat, (s.pos[seat] + d[0] + d[1]) % 40); land(s, seat); s.noAgain = true; return null; }
        s.phase = 'manage'; s.noAgain = true; return null;
      }
      return t('gk_err');
    }
    if (s.phase === 'buy') {
      const c = B[s.pos[seat]];
      if (a.type === 'buy') { if (s.cash[seat] < c.price) return t('gk_err'); s.cash[seat] -= c.price; s.own[c.i] = seat; log(s, `🏷️ ${nm} اشترى ${c.name} بـ ${c.price}`); sound('capture'); s.phase = 'manage'; return null; }
      if (a.type === 'skip') { s.phase = 'manage'; return null; }
      return t('gk_err');
    }
    if (s.phase === 'manage') {
      if (a.type === 'build') { if (!canBuild(s, seat, a.i)) return t('gk_err'); s.cash[seat] -= houseCost(a.i); s.houses[a.i] = (s.houses[a.i] || 0) + 1; log(s, `🏗️ ${nm} بنى ${s.houses[a.i] === 5 ? 'فندقًا' : 'بيتًا'} في ${B[a.i].name}`); sound('place'); return null; }
      if (a.type === 'unmort') { if (s.own[a.i] !== seat || !s.mort[a.i]) return t('gk_err'); const cst = Math.ceil(B[a.i].price * .55); if (s.cash[seat] < cst) return t('gk_err'); s.cash[seat] -= cst; delete s.mort[a.i]; return null; }
      if (a.type === 'end') {
        if (!s.out[seat] && s.dice[0] === s.dice[1] && s.dbl > 0 && !s.jail[seat] && !s.noAgain) { s.phase = 'roll'; return null; }
        s.noAgain = false; nextTurn(s); return null;
      }
    }
    return t('gk_err');
  },
  bot(s, seat, lv) {
    const easy = lv === 'easy';
    if (s.phase === 'roll') return { type: 'roll' };
    if (s.phase === 'jail') return s.cash[seat] > 400 && !easy ? { type: 'pay' } : { type: 'roll' };
    if (s.phase === 'buy') { const c = B[s.pos[seat]]; const keep = easy ? 50 : 150; return s.cash[seat] - c.price >= keep ? { type: 'buy' } : { type: 'skip' }; }
    if (s.phase === 'manage') {
      if (!easy) { const opts = Object.keys(s.own).map(Number).filter(i => canBuild(s, seat, i) && s.cash[seat] - houseCost(i) > 250); if (opts.length) return { type: 'build', i: opts.sort((a, b) => (s.houses[a] || 0) - (s.houses[b] || 0))[0] }; }
      return { type: 'end' };
    }
    return { type: 'end' };
  },
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const order = s.players.map((_, i) => i).sort((a, b) => (s.out[a] - s.out[b]) || worth(s, b) - worth(s, a)); const w = order[0];
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat, lines: order.map(k => ({ label: s.players[k].name + (s.out[k] ? ' 💥' : ''), value: num(worth(s, k)), color: COLORS[k] })) };
  },
  status(v, ui) {
    if (!ui.myTurn) return t('gk_turnOf', { name: ui.name(v.turn) });
    if (v.phase === 'buy') return t('bk_decide', { name: B[v.pos[v.turn]].name });
    if (v.phase === 'manage') return t('bk_manage');
    if (v.phase === 'jail') return t('bk_inJail');
    return t('bk_yourTurn');
  },
  render(el, v, ui) { renderBank(el, v, ui); },
};
// موضع الخانة على شبكة 11×11 (البداية في الزاوية السفلية اليمنى)
function cellPos(i) {
  if (i <= 10) return [11, 11 - i]; if (i <= 20) return [11 - (i - 10), 1]; if (i <= 30) return [1, 1 + (i - 20)]; return [1 + (i - 30), 11];
}
let showCard = null;
function renderBank(el, v, ui) {
  const me = ui.seat, D3 = is3d();
  const board = h('div', { class: 'bk-board' + (D3 ? ' d3' : '') });
  for (const c of B) {
    const [r, col] = cellPos(c.i), side = c.i < 10 ? 'b' : c.i < 20 ? 'l' : c.i < 30 ? 't' : 'r'; const corner = c.i % 10 === 0;
    const o = v.own[c.i]; const hs = v.houses[c.i] || 0;
    const cell = h('button', { type: 'button', class: `bk-cell s-${side}` + (corner ? ' corner' : '') + (o != null ? ' owned' : '') + (v.mort[c.i] ? ' mort' : ''), style: { gridRow: r, gridColumn: col, '--oc': o != null ? COLORS[o] : 'transparent' }, onclick: () => { showCard = c.i; el.innerHTML = ''; renderBank(el, v, ui); } },
      c.group ? h('i', { class: 'bk-band', style: { background: GROUP[c.group] } }, hs ? (hs === 5 ? h('b', { class: 'bk-hotel' }, '🏨') : Array.from({ length: hs }, () => h('b', { class: 'bk-house' }))) : null) : null,
      h('span', { class: 'bk-ic' }, c.group ? '' : (c.ic || ICON[c.type])),
      h('small', { class: 'bk-nm' }, c.name),
      c.price ? h('em', {}, num(c.price)) : c.tax ? h('em', {}, '−', num(c.tax)) : null,
      h('div', { class: 'bk-toks' }, v.players.map((_, p) => !v.out[p] && v.pos[p] === c.i ? h('span', { class: 'bk-tok' + (p === v.turn ? ' cur' : ''), style: { '--pc': COLORS[p] } }, ui.avatar(p)) : null)));
    board.append(cell);
  }
  // الوسط
  const myTurn = ui.myTurn, cur = v.turn, here = B[v.pos[cur]];
  const acts = [];
  if (myTurn && v.phase === 'roll') acts.push(h('button', { type: 'button', class: 'gk-bigbtn gk-pulse', style: { '--pc': COLORS[me] }, onclick: () => { sound('draw'); ui.act({ type: 'roll' }); } }, '🎲 ', t('bk_roll')));
  if (myTurn && v.phase === 'jail') acts.push(h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'roll' }) }, '🎲 ', t('bk_jailRoll')), h('button', { type: 'button', class: 'gk-bigbtn', style: { '--pc': '#64748b' }, disabled: v.cash[me] < 50, onclick: () => ui.act({ type: 'pay' }) }, '💵 ', t('bk_jailPay')));
  if (myTurn && v.phase === 'buy') acts.push(h('button', { type: 'button', class: 'gk-bigbtn', style: { '--pc': '#16a34a' }, disabled: v.cash[me] < here.price, onclick: () => ui.act({ type: 'buy' }) }, '🏷️ ', t('bk_buy', { p: num(here.price) })), h('button', { type: 'button', class: 'gk-bigbtn', style: { '--pc': '#64748b' }, onclick: () => ui.act({ type: 'skip' }) }, t('bk_skip')));
  if (myTurn && v.phase === 'manage') {
    const bl = Object.keys(v.own).map(Number).filter(i => canBuild(v, me, i));
    if (bl.length) acts.push(h('div', { class: 'bk-build' }, bl.map(i => h('button', { type: 'button', style: { '--g': GROUP[B[i].group] }, onclick: () => ui.act({ type: 'build', i }) }, '🏗️ ', B[i].name, ' (', num(houseCost(i)), ')'))));
    const um = Object.keys(v.mort).map(Number).filter(i => v.own[i] === me && v.cash[me] >= Math.ceil(B[i].price * .55));
    if (um.length) acts.push(h('div', { class: 'bk-build' }, um.map(i => h('button', { type: 'button', onclick: () => ui.act({ type: 'unmort', i }) }, '🔓 ', B[i].name, ' (', num(Math.ceil(B[i].price * .55)), ')'))));
    acts.push(h('button', { type: 'button', class: 'gk-bigbtn', style: { '--pc': COLORS[me] }, onclick: () => ui.act({ type: 'end' }) }, v.dice[0] === v.dice[1] && v.dbl > 0 && !v.jail[me] && !v.noAgain ? '🎲 ' + t('bk_roll') : '✓ ' + t('bk_end')));
  }
  const pc = showCard != null ? B[showCard] : (v.phase === 'buy' ? here : null);
  const card = pc && ['prop', 'rail', 'util'].includes(pc.type) ? h('div', { class: 'bk-deed' },
    h('div', { class: 'bk-deedh', style: { background: pc.group ? GROUP[pc.group] : '#334155' } }, pc.ic || ICON[pc.type] || '🏙️', ' ', pc.name),
    pc.type === 'prop' ? h('table', {}, [[t('bk_rent'), base(pc)], ['مع المجموعة', base(pc) * 2], ...[1, 2, 3, 4].map(k => [`${num(k)} ${t('bk_houses')}`, base(pc) * MULT[k]]), [t('bk_hotel'), base(pc) * MULT[5]], ['🏗️', houseCost(pc.i)]].map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, num(b)))))
      : h('p', {}, pc.type === 'rail' ? '25 · 50 · 100 · 200' : '4× / 10× النرد'),
    h('small', {}, t('bk_owner'), ': ', v.own[pc.i] != null ? ui.name(v.own[pc.i]) : t('bk_bank'), v.mort[pc.i] ? ' · ' + t('bk_mortgaged') : ''),
    showCard != null ? h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { showCard = null; el.innerHTML = ''; renderBank(el, v, ui); } }, '✕') : null) : null;
  const center = h('div', { class: 'bk-center' },
    h('div', { class: 'bk-logo' }, h('b', {}, 'بنك الحظ'), h('small', {}, v.maxRounds ? t('bk_round', { n: num(v.round) }) + ' / ' + num(v.maxRounds) : t('bk_round', { n: num(v.round) }))),
    h('div', { class: 'bk-dice', key: v.rollId }, dieFace(v.dice[0], 'roll'), dieFace(v.dice[1], 'roll')),
    v.card ? h('div', { class: 'bk-cardmsg ' + v.card.kind }, h('b', {}, v.card.kind === 'chance' ? '❓ حظ' : '🎁 كنز'), h('span', {}, v.card.txt)) : null,
    card, h('div', { class: 'bk-acts' }, acts),
    h('div', { class: 'bk-log' }, v.log.slice(0, 4).map(x => h('div', {}, x))));
  board.append(center);
  const side = h('div', { class: 'bk-side' }, v.players.map((p, i) => h('div', { class: 'bk-pl' + (i === v.turn ? ' cur' : '') + (v.out[i] ? ' out' : ''), style: { '--pc': COLORS[i] } },
    ui.plate(i), h('b', { class: 'bk-cash' }, '💰 ', num(v.cash[i])), v.jail[i] ? h('small', {}, '🚔') : null,
    h('div', { class: 'bk-props' }, Object.keys(v.own).map(Number).filter(k => v.own[k] === i).sort((a, b) => a - b).map(k => h('i', { title: B[k].name, style: { background: B[k].group ? GROUP[B[k].group] : '#475569', opacity: v.mort[k] ? .35 : 1 } }))))));
  el.append(h('div', { class: 'bk-wrap' }, board, side));
}
export async function mount(root, ctx) {
  if (!document.getElementById('bk-css')) document.head.append(h('link', { id: 'bk-css', rel: 'stylesheet', href: new URL('./bank.css', import.meta.url).href }));
  showCard = null;
  return tableGame(root, ctx, def);
}
export const _test = { def };
