// مطعمي الناجح: خدمة الزبائن في الوقت الحقيقي + قرارات استثمار بين الأيام (التكلفة والعائد ومدة الاسترداد)
import { h, tr, sound, num, store, toast } from '../../assets/js/core.js';
const L = (ar, en) => tr({ ar, en });
let _tl = 0, _tm = '';
const say = (m, k) => { const n = Date.now(); if (m === _tm && n - _tl < 2500) return; _tl = n; _tm = m; toast(m, k); };
const MENU = {
  burger: { e: '🍔', ar: 'برغر', en: 'Burger', t: 4.2, cost: 4, price: 12, unlock: 0 },
  fries: { e: '🍟', ar: 'بطاطس', en: 'Fries', t: 3, cost: 1, price: 5, unlock: 0 },
  juice: { e: '🧃', ar: 'عصير', en: 'Juice', t: 1.6, cost: 1, price: 4, unlock: 0 },
  salad: { e: '🥗', ar: 'سلطة', en: 'Salad', t: 2.6, cost: 3, price: 9, unlock: 250 },
  coffee: { e: '☕', ar: 'قهوة', en: 'Coffee', t: 2, cost: 1, price: 6, unlock: 300 },
  icecream: { e: '🍦', ar: 'بوظة', en: 'Ice cream', t: 1.8, cost: 2, price: 7, unlock: 420 },
  pizza: { e: '🍕', ar: 'بيتزا', en: 'Pizza', t: 6, cost: 5, price: 19, unlock: 650 },
  shawarma: { e: '🌯', ar: 'شاورما', en: 'Wrap', t: 3.6, cost: 3, price: 11, unlock: 900 },
};
const PEOPLE = ['👩', '🧑', '👨', '👧', '👦', '👵', '👴', '🧔', '👩‍🦱', '👨‍🦱', '🧕', '👳', '👩‍🦰', '🧑‍🦳', '👱‍♀️', '🧒'];
const DAY = 80, RENT = 30, GOAL = 6000;
const LESSONS = [
  ['الربح الإجمالي', 'سعر البيع ناقص تكلفة المكونات هو ربحك من كل طبق، وهو الذي يغطي الإيجار والرواتب.'],
  ['الهدر', 'كل طبق تحضّره ولا تبيعه خسارة كاملة لتكلفة مكوناته؛ حضّر بقدر الطلب.'],
  ['رضا الزبائن', 'الزبون السعيد يدفع إكرامية ويرفع تقييمك، والتقييم العالي يجلب زبائن أكثر.'],
  ['مدة الاسترداد', 'إذا كلّف استثمار 300 وزاد ربحك 60 يوميًا، فإنه يسترد تكلفته في 5 أيام ثم يصبح ربحًا صافيًا.'],
  ['التكاليف الثابتة', 'الإيجار والرواتب تُدفع كل يوم سواء بعت كثيرًا أو قليلًا.'],
  ['تنويع القائمة', 'أصناف أكثر تعني طلبات أكبر لكل زبون، لكنها تحتاج تنظيمًا أفضل في المطبخ.'],
];
const blank = () => ({ day: 1, cash: 200, rating: 3.5, best: 0, menu: ['burger', 'fries', 'juice'], lv: { burger: 1, fries: 1, juice: 1 }, seats: 3, decor: 0, ads: 0, waiter: 0, chef: 0, hist: [], goal: false });

export async function mount(root) {
  if (!document.getElementById('rs-css')) document.head.append(h('link', { id: 'rs-css', rel: 'stylesheet', href: new URL('./restaurant.css', import.meta.url).href }));
  const view = h('div', { class: 'rs' }); root.append(view);
  let S = store.get('resto', null) || blank(); const save = () => store.set('resto', S);
  let D = null, raf = 0, last = 0, alive = true, phase = 'office';

  // ============ اليوم: محاكاة الوقت الحقيقي ============
  function startDay() {
    D = { t: 0, spawn: 1, cust: Array(S.seats).fill(null), cook: {}, ready: {}, served: 0, lost: 0, rev: 0, tips: 0, ingr: 0, made: 0, waste: 0, sat: [], next: 0, wt: 0 };
    S.menu.forEach(k => { D.cook[k] = []; D.ready[k] = 0; });
    phase = 'day'; sound('notify'); renderDay(); last = performance.now(); raf = requestAnimationFrame(loop);
  }
  const speed = (k) => 1 + (S.lv[k] - 1) * .3 + S.chef * .15;
  const cap = (k) => Math.min(4, S.lv[k]);
  const patience = () => 24 * (1 + S.decor * .25);
  const rate = () => (5.5 - S.ads * .9 - (S.rating - 3) * .6) * (3 / S.seats) ** .3;
  function spawn() {
    const i = D.cust.findIndex(c => !c); if (i < 0) return;
    const n = Math.random() < .3 ? 1 : Math.random() < .7 ? 2 : 3, order = {};
    for (let j = 0; j < n; j++) { const k = S.menu[Math.floor(Math.random() * S.menu.length)]; order[k] = (order[k] || 0) + 1; }
    D.cust[i] = { p: PEOPLE[Math.floor(Math.random() * PEOPLE.length)], order, got: {}, pat: patience(), max: patience(), id: Math.random() };
    renderDay();
  }
  function startCook(k) {
    if (phase !== 'day') return;
    if (D.cook[k].length >= cap(k)) { say(L('المحطة ممتلئة — طوّرها لتطهو أكثر في وقت واحد', 'Station is full — upgrade it'), true); return; }
    D.cook[k].push(0); D.ingr += MENU[k].cost; D.made++; sound('place'); renderDay();
  }
  function serve(i) {
    const c = D.cust[i]; if (!c) return; let gave = 0;
    for (const k in c.order) { const need = c.order[k] - (c.got[k] || 0); const g = Math.min(need, D.ready[k]); if (g > 0) { D.ready[k] -= g; c.got[k] = (c.got[k] || 0) + g; gave += g; } }
    if (!gave) { say(L('لا يوجد طبق جاهز من طلب هذا الزبون', 'Nothing ready for this order'), true); return; }
    sound('move');
    if (Object.keys(c.order).every(k => (c.got[k] || 0) >= c.order[k])) {
      const bill = Object.entries(c.order).reduce((s, [k, q]) => s + MENU[k].price * q, 0), mood = c.pat / c.max;
      const tip = Math.round(bill * (mood > .66 ? .2 : mood > .33 ? .1 : 0));
      D.rev += bill; D.tips += tip; D.served++; D.sat.push(mood > .66 ? 5 : mood > .33 ? 4 : 3);
      floatTxt(i, '+' + num(bill + tip) + (tip ? ' 💛' : '')); sound('capture'); D.cust[i] = null; D.next = Math.min(D.next, 1.2);
    }
    renderDay();
  }
  function loop(now) {
    if (!alive || phase !== 'day') return;
    const dt = Math.min(.1, (now - last) / 1000); last = now; D.t += dt;
    let dirty = false;
    for (const k of S.menu) {
      const arr = D.cook[k];
      for (let j = 0; j < arr.length; j++) arr[j] += dt * speed(k) / MENU[k].t;
      const done = arr.filter(x => x >= 1).length; if (done) { D.cook[k] = arr.filter(x => x < 1); D.ready[k] += done; dirty = true; sound('check'); }
    }
    D.cust.forEach((c, i) => { if (!c) return; c.pat -= dt; if (c.pat <= 0) { D.cust[i] = null; D.lost++; D.sat.push(1); floatTxt(i, '😠'); sound('lose'); dirty = true; } });
    if (D.t < DAY) { D.next -= dt; if (D.next <= 0) { spawn(); D.next = rate() * (.7 + Math.random() * .6); } }
    if (S.waiter) { D.wt += dt; if (D.wt > 1.8 / S.waiter) { D.wt = 0; const i = D.cust.findIndex(c => c && Object.keys(c.order).some(k => (c.got[k] || 0) < c.order[k] && D.ready[k] > 0)); if (i >= 0) serve(i); } }
    if (dirty) renderDay(); else updateBars();
    if (D.t >= DAY && D.cust.every(c => !c)) return endDay();
    raf = requestAnimationFrame(loop);
  }
  function endDay() {
    phase = 'report';
    D.waste = S.menu.reduce((s, k) => s + D.ready[k] + D.cook[k].length, 0);
    const wasteCost = S.menu.reduce((s, k) => s + (D.ready[k] + D.cook[k].length) * MENU[k].cost, 0);
    const wages = S.waiter * 25 + S.chef * 35;
    const profit = D.rev + D.tips - D.ingr - RENT - wages;
    const avg = D.sat.length ? D.sat.reduce((a, b) => a + b, 0) / D.sat.length : S.rating;
    S.rating = Math.max(1, Math.min(5, S.rating * .6 + avg * .4));
    S.cash += profit; S.best = Math.max(S.best, profit);
    const rep = { day: S.day, served: D.served, lost: D.lost, rev: D.rev, tips: D.tips, ingr: D.ingr, rent: RENT, wages, waste: D.waste, wasteCost, profit, rating: S.rating };
    S.hist.push(rep); S.hist = S.hist.slice(-14); S.day++; save();
    sound(profit >= 0 ? 'win' : 'lose'); renderReport(rep);
  }

  // ============ العرض ============
  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  function head(...extra) {
    return h('div', { class: 'rs-hud' },
      h('div', { class: 'rs-chip' }, h('small', {}, L('اليوم', 'Day')), h('b', {}, num(S.day))),
      h('div', { class: 'rs-chip cash' }, h('small', {}, L('النقود', 'Cash')), h('b', {}, '💰 ', num(Math.round(S.cash)))),
      h('div', { class: 'rs-chip' }, h('small', {}, L('التقييم', 'Rating')), h('b', { class: 'rs-stars' }, stars(S.rating))),
      ...extra);
  }
  function renderDay() {
    if (phase !== 'day') return;
    view.innerHTML = '';
    const left = Math.max(0, DAY - D.t);
    view.append(head(h('div', { class: 'rs-chip grow' }, h('small', {}, D.t < DAY ? L('الوقت المتبقي', 'Time left') : L('أغلق الباب — اخدم الباقين', 'Closing — serve the rest')), h('div', { class: 'rs-time' }, h('i', { style: { width: (left / DAY * 100) + '%' } }))),
      h('div', { class: 'rs-chip' }, h('small', {}, L('دخل اليوم', 'Today')), h('b', {}, num(D.rev + D.tips)))));
    const hall = h('div', { class: 'rs-hall' }, h('div', { class: 'rs-wall' }, h('span', { class: 'rs-sign' }, '🍽️ ', L('مطعمي', 'My Restaurant')), S.decor ? h('span', { class: 'rs-deco' }, '🪴', S.decor > 1 ? ' 🖼️ 🪴' : '') : null),
      h('div', { class: 'rs-seats', style: { '--n': S.seats } }, D.cust.map((c, i) => h('div', { class: 'rs-seat', 'data-i': i },
        c ? h('button', { type: 'button', class: 'rs-cust', onclick: () => serve(i) },
          h('div', { class: 'rs-bubble' }, Object.entries(c.order).map(([k, q]) => h('span', { class: 'rs-ord' + ((c.got[k] || 0) >= q ? ' ok' : D.ready[k] > 0 ? ' can' : '') }, MENU[k].e, q > 1 ? h('sub', {}, '×' + num(q)) : null))),
          h('div', { class: 'rs-face' }, c.p), h('div', { class: 'rs-pat' }, h('i', { 'data-id': c.id }))) : h('div', { class: 'rs-empty' }, '🪑'),
        h('div', { class: 'rs-table' })))));
    const kitchen = h('div', { class: 'rs-kitchen' }, S.menu.map(k => {
      const m = MENU[k], arr = D.cook[k];
      return h('button', { type: 'button', class: 'rs-st', onclick: () => startCook(k) },
        h('span', { class: 'rs-st-e' }, m.e), h('b', {}, L(m.ar, m.en)), h('small', {}, L('تكلفة ', 'cost '), num(m.cost), ' · ', L('سعر ', 'price '), num(m.price)),
        h('div', { class: 'rs-slots' }, Array.from({ length: cap(k) }, (_, j) => h('i', { class: j < arr.length ? 'on' : '' }, h('u', { 'data-k': k, 'data-j': j, style: { width: ((arr[j] || 0) * 100) + '%' } })))),
        D.ready[k] ? h('span', { class: 'rs-ready' }, num(D.ready[k])) : null);
    }));
    view.append(hall, h('p', { class: 'rs-tip muted' }, L('اضغط الصنف في المطبخ ليُطهى، ثم اضغط الزبون لتقدّم له الأطباق الجاهزة.', 'Tap a station to cook, then tap a customer to serve ready dishes.')), kitchen);
  }
  function updateBars() {
    view.querySelectorAll('.rs-pat i').forEach(el => { const c = D.cust.find(x => x && String(x.id) === el.dataset.id); if (c) { const r = c.pat / c.max; el.style.width = r * 100 + '%'; el.style.background = r > .66 ? '#22c55e' : r > .33 ? '#f59e0b' : '#ef4444'; } });
    view.querySelectorAll('.rs-slots u').forEach(el => { el.style.width = ((D.cook[el.dataset.k][+el.dataset.j] || 0) * 100) + '%'; });
    const tb = view.querySelector('.rs-time i'); if (tb) tb.style.width = Math.max(0, (DAY - D.t) / DAY * 100) + '%';
  }
  function floatTxt(i, s) { const seat = view.querySelector(`.rs-seat[data-i="${i}"]`); if (!seat) return; const f = h('span', { class: 'rs-float' }, s); seat.append(f); setTimeout(() => f.remove(), 1200); }

  function renderReport(r) {
    view.innerHTML = '';
    const [lt, lx] = LESSONS[(r.day - 1) % LESSONS.length];
    const row = (a, b, cls) => h('tr', { class: cls || '' }, h('td', {}, a), h('td', {}, b));
    view.append(head(), h('div', { class: 'rs-report card' },
      h('h3', {}, L('تقرير اليوم ', 'Day report '), num(r.day)),
      h('div', { class: 'rs-kpis' }, h('div', {}, h('b', {}, num(r.served)), h('small', {}, L('زبون راضٍ', 'served'))), h('div', {}, h('b', {}, num(r.lost)), h('small', {}, L('زبون غادر', 'left'))), h('div', {}, h('b', {}, num(r.waste)), h('small', {}, L('طبق مهدور', 'wasted')))),
      h('table', { class: 'rs-pl' }, row(L('المبيعات', 'Sales'), '+' + num(r.rev)), row(L('الإكراميات', 'Tips'), '+' + num(r.tips)), row(L('المكونات', 'Ingredients'), '−' + num(r.ingr)), row(L('الإيجار', 'Rent'), '−' + num(r.rent)), r.wages ? row(L('الرواتب', 'Wages'), '−' + num(r.wages)) : null,
        row(L('صافي الربح', 'Net profit'), (r.profit >= 0 ? '+' : '−') + num(Math.abs(Math.round(r.profit))), r.profit >= 0 ? 'pos' : 'neg')),
      r.wasteCost ? h('p', { class: 'muted' }, L(`خسرتَ ${num(r.wasteCost)} في أطباق لم تُبَع.`, `Unsold dishes cost you ${num(r.wasteCost)}.`)) : null,
      h('div', { class: 'rs-lesson' }, h('b', {}, '💡 ', lt), h('p', {}, lx)),
      h('button', { type: 'button', class: 'btn', onclick: () => { phase = 'office'; renderOffice(); } }, '📈 ', L('إلى مكتب الاستثمار', 'To the investment office'))));
    if (!S.goal && S.cash >= GOAL) { S.goal = true; save(); setTimeout(() => say(L('🏆 مبروك! أصبح مطعمك سلسلة مطاعم ناجحة', '🏆 Your restaurant became a successful chain!'), 'ok'), 500); }
  }

  // ============ مكتب الاستثمار ============
  function avgProfit() { const hs = S.hist.slice(-3); return hs.length ? hs.reduce((s, x) => s + x.profit + x.rent + x.wages, 0) / hs.length : 80; }
  function offers() {
    const g = Math.max(40, avgProfit()), o = [];
    for (const k of Object.keys(MENU)) if (!S.menu.includes(k) && MENU[k].unlock) o.push({ id: 'm:' + k, e: MENU[k].e, t: L('صنف جديد: ', 'New dish: ') + L(MENU[k].ar, MENU[k].en), d: L(`ربح ${num(MENU[k].price - MENU[k].cost)} في كل طبق، وطلبات أكبر`, `${num(MENU[k].price - MENU[k].cost)} margin per dish`), c: MENU[k].unlock, gain: (MENU[k].price - MENU[k].cost) * 6, go: () => { S.menu.push(k); S.lv[k] = 1; } });
    for (const k of S.menu) if (S.lv[k] < 4) o.push({ id: 'l:' + k, e: '🔥', t: L('تطوير محطة ', 'Upgrade ') + L(MENU[k].ar, MENU[k].en) + ' ' + MENU[k].e, d: L(`مستوى ${num(S.lv[k] + 1)}: أسرع، و${num(S.lv[k] + 1)} أطباق معًا`, `Lv ${S.lv[k] + 1}: faster & more at once`), c: 90 * S.lv[k] + MENU[k].price * 8, gain: g * .08, go: () => S.lv[k]++ });
    if (S.seats < 6) o.push({ id: 'seat', e: '🪑', t: L('طاولة إضافية', 'Extra table'), d: L('مكان لزبون آخر في الوقت نفسه', 'Seat one more customer'), c: 220 * (S.seats - 2), gain: g / S.seats, go: () => S.seats++ });
    if (S.decor < 3) o.push({ id: 'decor', e: '🪴', t: L('ديكور وراحة', 'Decor & comfort'), d: L('يصبر الزبائن 25% أطول', 'Customers wait 25% longer'), c: [250, 450, 800][S.decor], gain: g * .1, go: () => S.decor++ });
    if (S.ads < 3) o.push({ id: 'ads', e: '📣', t: L('حملة إعلانية', 'Ad campaign'), d: L('زبائن أكثر كل يوم', 'More customers daily'), c: [200, 450, 900][S.ads], gain: g * .18, go: () => S.ads++ });
    if (S.waiter < 2) o.push({ id: 'waiter', e: '🤵', t: L('توظيف نادل', 'Hire a waiter'), d: L('يقدّم الأطباق الجاهزة تلقائيًا — راتبه 25 يوميًا', 'Serves ready dishes automatically — wage 25/day'), c: 500 + S.waiter * 400, gain: g * .2 - 25, go: () => S.waiter++ });
    if (S.chef < 2) o.push({ id: 'chef', e: '🧑‍🍳', t: L('توظيف طاهٍ مساعد', 'Hire a sous-chef'), d: L('كل المحطات أسرع 15% — راتبه 35 يوميًا', 'All stations 15% faster — wage 35/day'), c: 700 + S.chef * 500, gain: g * .15 - 35, go: () => S.chef++ });
    return o;
  }
  function renderOffice() {
    view.innerHTML = '';
    const hs = S.hist.slice(-7), mx = Math.max(50, ...hs.map(x => Math.abs(x.profit)));
    const chart = h('div', { class: 'rs-chart' }, hs.length ? hs.map(x => h('div', { class: 'rs-bar' + (x.profit < 0 ? ' neg' : '') }, h('i', { style: { height: Math.abs(x.profit) / mx * 100 + '%' } }), h('small', {}, num(x.day)))) : h('p', { class: 'muted' }, L('سيظهر هنا ربح كل يوم.', 'Daily profit will appear here.')));
    const list = h('div', { class: 'rs-offers' }, offers().map(o => {
      const pb = o.gain > 0 ? Math.ceil(o.c / o.gain) : null, can = S.cash >= o.c;
      return h('div', { class: 'rs-offer' + (can ? '' : ' no') }, h('span', { class: 'rs-oe' }, o.e), h('div', { class: 'grow' }, h('b', {}, o.t), h('small', {}, o.d),
        h('div', { class: 'rs-roi' }, '⏱️ ', pb ? L(`يسترد تكلفته تقريبًا خلال ${num(pb)} ${pb > 10 ? 'يومًا' : 'أيام'}`, `Pays back in ~${pb} days`) : L('عائد غير مضمون', 'Uncertain return'))),
        h('button', { type: 'button', class: 'btn sm', disabled: !can, onclick: () => { if (S.cash < o.c) return; S.cash -= o.c; o.go(); save(); sound('win'); say(L('تم الاستثمار ✅', 'Invested ✅'), 'ok'); renderOffice(); } }, '💰 ', num(o.c)));
    }));
    view.append(head(), h('div', { class: 'rs-office' },
      h('div', { class: 'card rs-ohead' }, h('h3', {}, '📈 ', L('مكتب الاستثمار', 'Investment office')),
        h('p', { class: 'muted' }, L('استثمر أرباحك بحكمة: قارن التكلفة بالربح الإضافي المتوقع، واختر ما يسترد تكلفته أسرع. هدفك: ', 'Invest wisely: compare cost with expected extra profit. Goal: '), h('b', {}, num(GOAL)), L(' لتصبح سلسلة مطاعم.', ' to become a chain.')),
        h('div', { class: 'rs-goal' }, h('i', { style: { width: Math.min(100, S.cash / GOAL * 100) + '%' } })), chart,
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn big', onclick: startDay }, '☀️ ', L('افتح المطعم — اليوم ', 'Open — day '), num(S.day)),
          h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { if (confirm(L('بدء مطعم جديد من الصفر؟', 'Start over?'))) { S = blank(); save(); renderOffice(); } } }, '↺ ', L('من جديد', 'Restart')))),
      h('h4', {}, L('فرص الاستثمار', 'Investment options')), list));
  }
  renderOffice();
  return {
    unmount() { alive = false; cancelAnimationFrame(raf); },
    onLang() { if (phase === 'day') renderDay(); else if (phase === 'office') renderOffice(); },
  };
}
