// رائدة الأعمال الصغيرة: ابدئي مشروعًا (مخبز أو متجر هدايا أو مقهى)، واختاري المنتجات والأسعار، واشتري المخزون، وسوّقي، وطوّري مشروعك يومًا بعد يوم حتى يصبح علامة تجارية ناجحة.
import { h, t, addDict, sound, num, ico, store, toast, modal } from '../../assets/js/core.js';
addDict({
  ar: { bz_pick: 'اختاري مشروعك', bz_day: 'اليوم {n}', bz_cash: 'النقود', bz_rep: 'السمعة', bz_level: 'المستوى', bz_open: 'افتحي المتجر لليوم ☀️', bz_stock: 'المخزون', bz_buy: 'اشتري', bz_price: 'سعر البيع', bz_cost: 'التكلفة', bz_market: 'التسويق اليومي', bz_upgrade: 'التطويرات', bz_report: 'تقرير اليوم', bz_sold: 'بيع', bz_revenue: 'الإيرادات', bz_expenses: 'المصروفات', bz_profit: 'الربح', bz_rent: 'الإيجار', bz_customers: 'الزبائن', bz_missed: 'زبائن لم يجدوا ما يريدون', bz_new: 'مشروع جديد', bz_goal: 'الهدف: علامة تجارية برصيد {n}',
    bz_brand: 'مبروك! أصبح مشروعك علامة تجارية ناجحة 🏆', bz_noCash: 'النقود لا تكفي', bz_lesson: 'درس اليوم', bz_margin: 'هامش الربح للقطعة: {n}', bz_hint: 'السعر المرتفع جدًا يُبعد الزبائن، والمنخفض جدًا يقلل الربح. ابحثي عن السعر المناسب!', bz_chart: 'الأرباح اليومية', bz_event: 'حدث اليوم' },
  en: { bz_pick: 'Pick your business', bz_day: 'Day {n}', bz_cash: 'Cash', bz_rep: 'Reputation', bz_level: 'Level', bz_open: 'Open for the day ☀️', bz_stock: 'Stock', bz_buy: 'Buy', bz_price: 'Price', bz_cost: 'Cost', bz_market: 'Daily marketing', bz_upgrade: 'Upgrades', bz_report: 'Daily report', bz_sold: 'Sold', bz_revenue: 'Revenue', bz_expenses: 'Expenses', bz_profit: 'Profit', bz_rent: 'Rent', bz_customers: 'Customers', bz_missed: 'Customers who found nothing', bz_new: 'New business', bz_goal: 'Goal: a brand with {n} in cash',
    bz_brand: 'Congratulations! Your business is a successful brand 🏆', bz_noCash: 'Not enough cash', bz_lesson: 'Lesson', bz_margin: 'Margin per item: {n}', bz_hint: 'Too high a price scares customers away; too low cuts profit.', bz_chart: 'Daily profit', bz_event: "Today's event" },
});
const SHOPS = {
  bakery: { ic: '🥐', n: 'المخبز', bg: '#fef3c7', items: { bread: ['🍞 خبز', 2, 4], croissant: ['🥐 كرواسون', 4, 9], cake: ['🍰 كعكة', 12, 25], cookies: ['🍪 بسكويت', 3, 7] } },
  gifts: { ic: '🎁', n: 'متجر الهدايا', bg: '#fce7f3', items: { card: ['💌 بطاقة', 2, 6], flower: ['💐 باقة ورد', 15, 35], toy: ['🧸 دمية', 20, 45], candle: ['🕯️ شمعة', 6, 14] } },
  cafe: { ic: '☕', n: 'المقهى', bg: '#ede9fe', items: { coffee: ['☕ قهوة', 3, 9], juice: ['🧃 عصير', 4, 10], sandwich: ['🥪 شطيرة', 6, 15], donut: ['🍩 دونات', 2, 6] } },
};
const UPS = { sign: ['🪧 لافتة مضيئة', 300, 'زبائن أكثر بنسبة 15%'], decor: ['🪴 ديكور جميل', 600, 'سمعة أعلى كل يوم'], quality: ['⭐ مكونات أجود', 900, 'الزبائن يقبلون سعرًا أعلى'], online: ['📱 متجر إلكتروني', 1500, 'زبائن إضافيون من الإنترنت'], branch: ['🏬 فرع جديد', 4000, 'يضاعف عدد الزبائن'] };
const EVENTS = [['🌧️ يوم ممطر: زبائن أقل', .7], ['🎉 عطلة نهاية الأسبوع: زبائن أكثر', 1.4], ['📰 مقال في الصحيفة عن مشروعك!', 1.3], ['😐 يوم عادي', 1], ['😐 يوم عادي', 1], ['🏪 افتتح منافس قريب', .85], ['🌞 طقس جميل', 1.15]];
const LESSONS = ['الإيرادات = سعر البيع × عدد القطع المبيعة.', 'الربح = الإيرادات − المصروفات.', 'لا تشتري مخزونًا أكثر من حاجتك: ما لا يُباع قد يتلف.', 'التسويق يجلب زبائن جددًا، لكنه مصروف يجب أن يعود بربح.', 'السمعة الجيدة تبني ولاء الزبائن وتسمح بأسعار أعلى.', 'ادّخري جزءًا من الربح لتستثمريه في تطوير المشروع.', 'تابعي ما يُطلب أكثر واطلبي منه مخزونًا أكبر.'];
const GOAL = 10000, RENT = 40;
import { storefront } from './art.js';
export async function mount(root) {
  if (!document.getElementById('bz-css')) document.head.append(h('link', { id: 'bz-css', rel: 'stylesheet', href: new URL('./business.css', import.meta.url).href }));
  const view = h('div', { class: 'bz' }); root.append(view);
  let G = store.get('biz', null);
  const save = () => store.set('biz', G);
  function start(k) { const sh = SHOPS[k]; G = { shop: k, day: 1, cash: 300, rep: 50, mkt: 10, ups: [], hist: [], stock: Object.fromEntries(Object.keys(sh.items).map(i => [i, 5])), price: Object.fromEntries(Object.entries(sh.items).map(([i, it]) => [i, it[2]])), brand: false }; save(); draw(); }
  function openDay() {
    const sh = SHOPS[G.shop]; const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    let base = 18 + G.rep * .35 + Math.sqrt(G.mkt) * 3.2; if (G.ups.includes('sign')) base *= 1.15; if (G.ups.includes('online')) base += 12; if (G.ups.includes('branch')) base *= 2;
    const customers = Math.round(base * ev[1] * (.85 + Math.random() * .3));
    const sold = {}; let revenue = 0, missed = 0, fairSum = 0;
    const keys = Object.keys(sh.items);
    for (let c = 0; c < customers; c++) {
      const want = keys[Math.floor(Math.random() * keys.length)]; const [, cost, fair] = sh.items[want];
      const fairP = fair * (G.ups.includes('quality') ? 1.3 : 1) * (.8 + G.rep / 250);
      const p = G.price[want]; const ratio = p / fairP; const buyProb = ratio <= .8 ? .97 : ratio <= 1 ? .9 : ratio <= 1.25 ? .6 : ratio <= 1.6 ? .25 : .05;
      if (Math.random() > buyProb) { fairSum -= .3; continue; }
      if (G.stock[want] <= 0) { missed++; continue; }
      G.stock[want]--; sold[want] = (sold[want] || 0) + 1; revenue += p; fairSum += ratio <= 1.1 ? .3 : -.1;
    }
    const expenses = RENT + G.mkt + (G.ups.includes('branch') ? 60 : 0);
    const profit = revenue - expenses;
    G.cash += profit; G.rep = Math.max(0, Math.min(100, G.rep + fairSum / Math.max(5, customers) * 10 - missed * .4 + (G.ups.includes('decor') ? 1.5 : 0)));
    // تلف جزء من المخزون الزائد في المخبز والمقهى
    if (G.shop !== 'gifts') for (const k of keys) G.stock[k] = Math.floor(G.stock[k] * .7);
    G.hist.push(profit); if (G.hist.length > 20) G.hist.shift();
    const rep = { ev: ev[0], customers, sold, revenue, expenses, profit, missed, lesson: LESSONS[(G.day - 1) % LESSONS.length] };
    G.day++;
    if (!G.brand && G.cash >= GOAL) { G.brand = true; setTimeout(() => { sound('win'); toast(t('bz_brand'), 'ok'); }, 400); }
    save(); sound(profit >= 0 ? 'win' : 'lose'); draw();
    modal(t('bz_report'), h('div', { class: 'bz-rep' }, h('p', { class: 'bz-ev' }, '📅 ', rep.ev),
      h('table', {}, h('tr', {}, h('th', {}, '👥 ', t('bz_customers')), h('td', {}, num(rep.customers))),
        ...Object.entries(rep.sold).map(([k, n]) => h('tr', {}, h('th', {}, sh.items[k][0]), h('td', {}, t('bz_sold'), ' ', num(n), ' × ', num(G.price[k])))),
        h('tr', {}, h('th', {}, t('bz_revenue')), h('td', {}, '+', num(rep.revenue))), h('tr', {}, h('th', {}, t('bz_expenses')), h('td', {}, '−', num(rep.expenses))),
        h('tr', { class: rep.profit >= 0 ? 'ok' : 'bad' }, h('th', {}, t('bz_profit')), h('td', {}, num(rep.profit)))),
      rep.missed ? h('p', { class: 'bz-warn' }, '⚠️ ', t('bz_missed'), ': ', num(rep.missed)) : null,
      h('p', { class: 'bz-lesson' }, '📘 ', h('b', {}, t('bz_lesson'), ': '), rep.lesson)), [], { icon: 'calculator' });
  }
  function draw() {
    view.innerHTML = '';
    if (!G) { view.append(h('h2', {}, t('bz_pick')), h('div', { class: 'bz-pick' }, Object.entries(SHOPS).map(([k, s]) => h('button', { type: 'button', class: 'bz-shop', style: { background: s.bg }, onclick: () => start(k) }, h('span', {}, s.ic), h('b', {}, s.n), h('small', {}, Object.values(s.items).map(i => i[0].split(' ')[0]).join(' ')))))); return; }
    const sh = SHOPS[G.shop]; const maxH = Math.max(1, ...G.hist.map(Math.abs));
    const lvl = G.cash >= GOAL ? 5 : G.cash >= 5000 ? 4 : G.cash >= 2000 ? 3 : G.cash >= 800 ? 2 : 1;
    view.append(h('div', { class: 'bz-scene', html: storefront(G.shop, G, sh.n, lvl) }));
    view.append(h('div', { class: 'bz-top', style: { background: sh.bg } }, h('span', { class: 'bz-logo' }, sh.ic), h('b', {}, sh.n, G.brand ? ' 🏆' : ''),
      h('div', { class: 'ct-chip money' }, '💰 ', num(Math.round(G.cash))), h('div', { class: 'ct-chip' }, '⭐ ', t('bz_rep'), ' ', num(Math.round(G.rep))), h('div', { class: 'ct-chip' }, '📅 ', t('bz_day', { n: num(G.day) })), h('div', { class: 'ct-chip' }, '🏅 ', t('bz_level'), ' ', num(lvl)),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { G = null; save(); draw(); } }, t('bz_new'))),
      h('div', { class: 'bz-goal' }, h('span', {}, '🎯 ', t('bz_goal', { n: num(GOAL) })), h('div', { class: 'ar-bar' }, h('i', { style: { width: Math.min(100, G.cash / GOAL * 100) + '%', background: '#f59e0b' } }))),
      h('div', { class: 'bz-main' },
        h('div', { class: 'bz-items' }, Object.entries(sh.items).map(([k, [n, cost, fair]]) => h('div', { class: 'bz-item' },
          h('div', { class: 'bz-ih' }, h('b', {}, n), h('small', {}, t('bz_stock'), ': ', num(G.stock[k]))),
          h('div', { class: 'bz-row' }, h('span', {}, t('bz_cost'), ': ', num(cost)), h('label', {}, t('bz_price'), ' ', h('input', { type: 'number', class: 'input', min: 1, value: G.price[k], onchange: (e) => { G.price[k] = Math.max(1, +e.target.value || cost); save(); draw(); } }))),
          h('small', { class: G.price[k] > cost ? 'ok' : 'bad' }, t('bz_margin', { n: num(G.price[k] - cost) })),
          h('div', { class: 'bz-row' }, [5, 10, 20].map(q => h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { if (G.cash < q * cost) return toast(t('bz_noCash'), true); G.cash -= q * cost; G.stock[k] += q; sound('place'); save(); draw(); } }, t('bz_buy'), ' ', num(q), h('small', {}, ' (', num(q * cost), ')'))))))),
        h('div', { class: 'bz-side' },
          h('div', { class: 'field' }, h('span', {}, '📣 ', t('bz_market'), ': ', num(G.mkt)), h('input', { type: 'range', min: 0, max: 200, step: 10, value: G.mkt, onchange: (e) => { G.mkt = +e.target.value; save(); draw(); } })),
          h('button', { type: 'button', class: 'btn gk-go', onclick: openDay }, t('bz_open')),
          h('small', { class: 'muted' }, '💡 ', t('bz_hint'), ' — ', t('bz_rent'), ': ', num(RENT)),
          h('b', {}, '📈 ', t('bz_chart')), h('div', { class: 'ct-chart bz-chart' }, G.hist.map(v => h('i', { style: { height: Math.abs(v) / maxH * 60 + 'px', background: v >= 0 ? '#22c55e' : '#ef4444' }, title: num(Math.round(v)) }))),
          h('b', {}, '🚀 ', t('bz_upgrade')), h('div', { class: 'bz-ups' }, Object.entries(UPS).map(([k, [n, c, d]]) => h('button', { type: 'button', class: 'bz-up' + (G.ups.includes(k) ? ' own' : ''), disabled: G.ups.includes(k), onclick: () => { if (G.cash < c) return toast(t('bz_noCash'), true); G.cash -= c; G.ups.push(k); sound('win'); save(); draw(); } }, h('b', {}, n), h('small', {}, d), h('span', {}, G.ups.includes(k) ? '✅' : '💰 ' + num(c))))))));
  }
  draw();
  return { onLang() { draw(); } };
}
