// المزرعة السعيدة: ازرع واحصد وربِّ الحيوانات وصنّع المنتجات وبِع في السوق، واستثمر أرباحك بذكاء
import { h, tr, sound, num, store, toast } from '../../assets/js/core.js';
const L = (ar, en) => tr({ ar, en });
let _tl = 0, _tm = '';
const say = (m, k) => { const n = Date.now(); if (m === _tm && n - _tl < 2500) return; _tl = n; _tm = m; toast(m, k); };
const CROPS = {
  wheat: { e: '🌾', ar: 'قمح', en: 'Wheat', seed: 2, t: 20, p: 5, lv: 1 },
  carrot: { e: '🥕', ar: 'جزر', en: 'Carrot', seed: 4, t: 35, p: 10, lv: 1 },
  tomato: { e: '🍅', ar: 'طماطم', en: 'Tomato', seed: 6, t: 50, p: 15, lv: 2 },
  corn: { e: '🌽', ar: 'ذرة', en: 'Corn', seed: 8, t: 65, p: 20, lv: 3 },
  strawberry: { e: '🍓', ar: 'فراولة', en: 'Strawberry', seed: 12, t: 90, p: 30, lv: 4 },
  sunflower: { e: '🌻', ar: 'دوار الشمس', en: 'Sunflower', seed: 15, t: 110, p: 38, lv: 5 },
};
const ANIMALS = {
  chicken: { e: '🐔', ar: 'دجاجة', en: 'Hen', cost: 60, feed: 'wheat', out: 'egg', t: 30 },
  sheep: { e: '🐑', ar: 'خروف', en: 'Sheep', cost: 180, feed: 'carrot', out: 'wool', t: 50 },
  cow: { e: '🐄', ar: 'بقرة', en: 'Cow', cost: 260, feed: 'corn', out: 'milk', t: 60 },
};
const PRODUCTS = {
  egg: { e: '🥚', ar: 'بيض', en: 'Eggs', p: 9 }, wool: { e: '🧶', ar: 'صوف', en: 'Wool', p: 20 }, milk: { e: '🥛', ar: 'حليب', en: 'Milk', p: 26 },
  bread: { e: '🍞', ar: 'خبز', en: 'Bread', p: 24 }, cake: { e: '🍰', ar: 'كعكة', en: 'Cake', p: 70 }, cheese: { e: '🧀', ar: 'جبن', en: 'Cheese', p: 66 },
  scarf: { e: '🧣', ar: 'وشاح', en: 'Scarf', p: 58 }, jam: { e: '🍯', ar: 'مربى', en: 'Jam', p: 85 }, oil: { e: '🫒', ar: 'زيت', en: 'Oil', p: 95 },
};
const FACT = {
  bakery: { e: '🥖', ar: 'مخبز', en: 'Bakery', cost: 350, recipes: [{ in: { wheat: 3 }, out: 'bread', t: 30 }, { in: { wheat: 2, egg: 2, milk: 1 }, out: 'cake', t: 60 }] },
  dairy: { e: '🏭', ar: 'مصنع ألبان', en: 'Dairy', cost: 700, recipes: [{ in: { milk: 2 }, out: 'cheese', t: 50 }] },
  loom: { e: '🧵', ar: 'مشغل نسيج', en: 'Loom', cost: 550, recipes: [{ in: { wool: 2 }, out: 'scarf', t: 45 }] },
  kitchen: { e: '🫙', ar: 'مطبخ المربى والزيت', en: 'Preserves', cost: 900, recipes: [{ in: { strawberry: 3 }, out: 'jam', t: 60 }, { in: { sunflower: 2 }, out: 'oil', t: 70 }] },
};
const ALL = { ...Object.fromEntries(Object.entries(CROPS).map(([k, v]) => [k, v])), ...PRODUCTS };
const nm = (k) => L(ALL[k].ar, ALL[k].en);
const LESSONS = ['القيمة المضافة: ثلاث حزم قمح تُباع بـ15، لكنها تصبح خبزًا يُباع بـ24 بعد التصنيع.', 'تنويع الاستثمار يقلل المخاطر: إذا انخفض سعر منتج تربح من غيره.', 'العرض والطلب: إذا بعت كمية كبيرة من صنف واحد ينخفض سعره في السوق.', 'مدة الاسترداد = تكلفة الاستثمار ÷ الربح الإضافي في الدقيقة.', 'الطلبات المسبقة تعطي سعرًا أعلى لأنك تبيع ما يحتاجه الزبون بالضبط.'];
const now = () => Date.now() / 1000;
const blank = () => ({ coins: 120, xp: 0, plots: Array.from({ length: 6 }, () => null), pens: [{ k: 'chicken', fed: 0 }], facts: [], inv: { wheat: 4 }, cap: 40, water: 0, mk: {}, orders: [], goal: false, seed: 'wheat' });

export async function mount(root) {
  if (!document.getElementById('fm-css')) document.head.append(h('link', { id: 'fm-css', rel: 'stylesheet', href: new URL('./farm.css', import.meta.url).href }));
  const view = h('div', { class: 'fm' }); root.append(view);
  let S = store.get('farm', null) || blank(); const save = () => store.set('farm', S);
  let tab = 'field', alive = true, sig = '';
  const lvl = () => 1 + Math.floor(Math.sqrt(S.xp / 20));
  const used = () => Object.values(S.inv).reduce((a, b) => a + b, 0);
  const add = (k, n = 1) => { if (used() + n > S.cap) { say(L('المخزن ممتلئ — بِع شيئًا أو وسّع المخزن', 'Barn full — sell or expand'), true); return false; } S.inv[k] = (S.inv[k] || 0) + n; return true; };
  const take = (need) => { for (const [k, q] of Object.entries(need)) if ((S.inv[k] || 0) < q) return false; for (const [k, q] of Object.entries(need)) S.inv[k] -= q; return true; };
  const grow = (k) => CROPS[k].t / (1 + S.water * .25);
  const price = (k) => Math.max(1, Math.round(ALL[k].p * (S.mk[k] ?? 1)));
  function market() { // تقلب الأسعار كل دقيقتين
    const slot = Math.floor(now() / 120); if (S.mkSlot === slot) return; S.mkSlot = slot;
    for (const k in ALL) { const m = S.mk[k] ?? 1; S.mk[k] = Math.min(1.35, Math.max(.7, m + (1 - m) * .3 + (Math.random() - .5) * .25)); }
    while (S.orders.length < 3) newOrder();
  }
  function newOrder() {
    const pool = [...Object.keys(CROPS).filter(k => CROPS[k].lv <= lvl()), ...S.pens.map(p => ANIMALS[p.k].out), ...S.facts.flatMap(f => FACT[f.k].recipes.map(r => r.out))];
    const u = [...new Set(pool)], need = {}, n = 1 + Math.floor(Math.random() * Math.min(3, u.length));
    for (let i = 0; i < n; i++) { const k = u[Math.floor(Math.random() * u.length)]; need[k] = (need[k] || 0) + 1 + Math.floor(Math.random() * 3); }
    const val = Object.entries(need).reduce((s, [k, q]) => s + ALL[k].p * q, 0);
    S.orders.push({ id: Math.random(), who: ['🚚', '🏪', '🏨', '🍽️', '🏫'][Math.floor(Math.random() * 5)], need, pay: Math.round(val * 1.35), xp: Math.round(val / 4) });
  }
  // ---------- أفعال ----------
  function tapPlot(i) {
    const p = S.plots[i];
    if (!p) { const c = CROPS[S.seed]; if (S.coins < c.seed) return say(L('النقود لا تكفي لشراء البذور', 'Not enough coins for seeds'), true); S.coins -= c.seed; S.plots[i] = { k: S.seed, at: now() }; sound('place'); }
    else if (now() - p.at >= grow(p.k)) { if (!add(p.k, 2)) return; S.plots[i] = null; S.xp += 2; sound('capture'); pop(`[data-plot="${i}"]`, '+2 ' + CROPS[p.k].e); }
    else return say(L('لم ينضج بعد 🌱', 'Not ripe yet 🌱'));
    save(); draw();
  }
  function plantAll() { let n = 0; S.plots.forEach((p, i) => { const c = CROPS[S.seed]; if (!p && S.coins >= c.seed) { S.coins -= c.seed; S.plots[i] = { k: S.seed, at: now() }; n++; } }); if (n) { sound('place'); save(); draw(); } }
  function harvestAll() { let n = 0; S.plots.forEach((p, i) => { if (p && now() - p.at >= grow(p.k) && used() + 2 <= S.cap) { S.inv[p.k] = (S.inv[p.k] || 0) + 2; S.plots[i] = null; S.xp += 2; n++; } }); if (n) { sound('capture'); save(); draw(); } else say(L('لا يوجد محصول ناضج', 'Nothing ripe'), true); }
  function tapPen(i) {
    const p = S.pens[i], a = ANIMALS[p.k];
    if (!p.at) { if (!take({ [a.feed]: 1 })) return say(L(`تحتاج ${CROPS[a.feed].e} ${nm(a.feed)} لإطعام ${L(a.ar, a.en)}`, `Needs ${nm(a.feed)}`), true); p.at = now(); sound('place'); }
    else if (now() - p.at >= a.t) { if (!add(a.out)) return; p.at = 0; S.xp += 3; sound('capture'); pop(`[data-pen="${i}"]`, '+1 ' + PRODUCTS[a.out].e); }
    else return say(L('ما زال ينتج… ⏳', 'Still producing… ⏳'));
    save(); draw();
  }
  function tapFact(i, r) {
    const f = S.facts[i], d = FACT[f.k];
    if (f.at != null) { const rc = d.recipes[f.r]; if (now() - f.at < rc.t) return say(L('المصنع يعمل… ⏳', 'Working… ⏳')); if (!add(rc.out)) return; f.at = null; S.xp += 6; sound('win'); pop(`[data-fact="${i}"]`, '+1 ' + PRODUCTS[rc.out].e); }
    else { const rc = d.recipes[r]; if (!take(rc.in)) return say(L('المكونات غير كافية', 'Missing ingredients'), true); f.at = now(); f.r = r; sound('place'); }
    save(); draw();
  }
  function sell(k, all) {
    const q = all ? S.inv[k] : 1; if (!q) return; const p = price(k) * q;
    S.inv[k] -= q; S.coins += p; S.mk[k] = Math.max(.7, (S.mk[k] ?? 1) - .015 * q); sound('capture'); say(L(`بعت ${num(q)} ${nm(k)} بـ ${num(p)} 🪙`, `Sold ${q} for ${p}`), 'ok'); save(); draw(); goal();
  }
  function deliver(o) {
    if (!take(o.need)) return say(L('لا تملك كل المطلوب بعد', 'You lack some items'), true);
    S.coins += o.pay; S.xp += o.xp; S.orders = S.orders.filter(x => x !== o); newOrder(); sound('win'); say(L(`تم التسليم! +${num(o.pay)} 🪙`, `Delivered! +${o.pay}`), 'ok'); save(); draw(); goal();
  }
  function goal() { if (!S.goal && S.coins >= 10000) { S.goal = true; save(); say(L('🏆 مبروك! أصبحت مزرعتك شركة زراعية كبرى', '🏆 Your farm is now a big agri-business!'), 'ok'); } }
  function pop(sel, s) { requestAnimationFrame(() => { const el = view.querySelector(sel); if (!el) return; const f = h('span', { class: 'fm-pop' }, s); el.append(f); setTimeout(() => f.remove(), 1100); }); }

  // ---------- العرض ----------
  const bar = (r) => h('div', { class: 'fm-bar' }, h('i', { style: { width: Math.min(100, r * 100) + '%' } }));
  const left = (s) => s >= 60 ? `${num(Math.floor(s / 60))}:${String(Math.floor(s % 60)).padStart(2, '0')}` : num(Math.ceil(s)) + L('ث', 's');
  function hud() {
    const l = lvl(), need = 20 * l * l, prev = 20 * (l - 1) * (l - 1);
    return h('div', { class: 'fm-hud' },
      h('div', { class: 'fm-chip coin' }, '🪙 ', h('b', {}, num(Math.floor(S.coins)))),
      h('div', { class: 'fm-chip' }, '⭐ ', L('المستوى ', 'Lv '), h('b', {}, num(l)), bar((S.xp - prev) / (need - prev))),
      h('div', { class: 'fm-chip' }, '🏚️ ', L('المخزن ', 'Barn '), h('b', {}, num(used()), '/', num(S.cap))));
  }
  const TABS = [['field', '🌾', 'الحقول', 'Fields'], ['animals', '🐄', 'الحيوانات', 'Animals'], ['factory', '🏭', 'المصانع', 'Factories'], ['market', '🛒', 'السوق والطلبات', 'Market'], ['invest', '📈', 'الاستثمار', 'Invest']];
  function draw() {
    if (!alive) return; market();
    view.innerHTML = '';
    view.append(hud(), h('div', { class: 'fm-tabs' }, TABS.map(([k, e, a, en]) => h('button', { type: 'button', class: tab === k ? 'on' : '', onclick: () => { tab = k; draw(); } }, h('span', {}, e), h('small', {}, L(a, en))))));
    view.append({ field, animals, factory, market: marketView, invest }[tab]());
    sig = signature();
  }
  function field() {
    const seeds = h('div', { class: 'fm-seeds' }, Object.entries(CROPS).map(([k, c]) => {
      const lock = c.lv > lvl();
      return h('button', { type: 'button', class: (S.seed === k ? 'on' : '') + (lock ? ' lock' : ''), disabled: lock, onclick: () => { S.seed = k; save(); draw(); } }, h('span', {}, lock ? '🔒' : c.e), h('b', {}, L(c.ar, c.en)), h('small', {}, lock ? L(`المستوى ${num(c.lv)}`, `Lv ${c.lv}`) : `🪙${num(c.seed)} · ⏱${left(grow(k))} · ${L('يُباع', 'sells')} ${num(c.p)}`));
    }));
    const grid = h('div', { class: 'fm-field' }, S.plots.map((p, i) => {
      if (!p) return h('button', { type: 'button', class: 'fm-plot empty', 'data-plot': i, onclick: () => tapPlot(i) }, h('span', { class: 'fm-hint' }, '+ ', CROPS[S.seed].e));
      const r = (now() - p.at) / grow(p.k), ripe = r >= 1;
      return h('button', { type: 'button', class: 'fm-plot' + (ripe ? ' ripe' : ''), 'data-plot': i, onclick: () => tapPlot(i) },
        h('span', { class: 'fm-crop', style: { '--g': Math.min(1, .35 + r * .65) } }, r < .35 ? '🌱' : CROPS[p.k].e, ripe ? h('span', { class: 'fm-c2' }, CROPS[p.k].e) : null),
        ripe ? h('span', { class: 'fm-tag' }, L('احصد!', 'Harvest!')) : h('div', { class: 'fm-pb', 'data-at': p.at, 'data-t': grow(p.k) }, bar(r)));
    }));
    return h('div', { class: 'fm-pane' }, h('h4', {}, L('اختر البذرة ثم اضغط قطعة أرض فارغة لزراعتها', 'Pick a seed, then tap empty soil')), seeds,
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn sm', onclick: plantAll }, '🌱 ', L('ازرع الكل', 'Plant all')), h('button', { type: 'button', class: 'btn ghost sm', onclick: harvestAll }, '🧺 ', L('احصد الكل', 'Harvest all'))), grid);
  }
  function animals() {
    return h('div', { class: 'fm-pane' }, h('h4', {}, L('أطعم الحيوان من مخزنك، ثم اجمع منتجه حين يجهز', 'Feed animals from your barn, then collect')),
      h('div', { class: 'fm-pens' }, S.pens.map((p, i) => {
        const a = ANIMALS[p.k], r = p.at ? (now() - p.at) / a.t : 0, ready = p.at && r >= 1;
        return h('button', { type: 'button', class: 'fm-pen ' + p.k + (ready ? ' ripe' : ''), 'data-pen': i, onclick: () => tapPen(i) },
          h('span', { class: 'fm-ani' + (p.at && !ready ? ' eat' : '') }, a.e), ready ? h('span', { class: 'fm-prod' }, PRODUCTS[a.out].e) : null,
          h('small', {}, !p.at ? L(`جائع — أطعمه ${CROPS[a.feed].e}`, `Hungry — feed ${CROPS[a.feed].e}`) : ready ? L('اجمع المنتج!', 'Collect!') : ''),
          p.at && !ready ? h('div', { class: 'fm-pb', 'data-at': p.at, 'data-t': a.t }, bar(r)) : null);
      })), S.pens.length ? null : h('p', { class: 'muted' }, L('اشترِ حيوانات من تبويب الاستثمار.', 'Buy animals in the Invest tab.')));
  }
  function factory() {
    if (!S.facts.length) return h('div', { class: 'fm-pane' }, h('p', { class: 'muted fm-empty' }, '🏭 ', L('لا تملك مصانع بعد. المصانع تحوّل المحاصيل إلى منتجات أغلى (القيمة المضافة). اشترِ مخبزًا من تبويب الاستثمار.', 'No factories yet — buy one in Invest to add value to crops.')));
    return h('div', { class: 'fm-pane' }, h('h4', {}, L('التصنيع يرفع قيمة المحاصيل', 'Processing adds value')), h('div', { class: 'fm-facts' }, S.facts.map((f, i) => {
      const d = FACT[f.k], rc = f.at != null ? d.recipes[f.r] : null, r = rc ? (now() - f.at) / rc.t : 0, ready = rc && r >= 1;
      return h('div', { class: 'fm-fact' + (ready ? ' ripe' : ''), 'data-fact': i }, h('div', { class: 'fm-fhead' }, h('span', { class: 'fm-fe' + (rc && !ready ? ' work' : '') }, d.e), h('b', {}, L(d.ar, d.en))),
        rc ? h('button', { type: 'button', class: 'btn ' + (ready ? '' : 'ghost'), onclick: () => tapFact(i) }, ready ? [L('اجمع ', 'Collect '), PRODUCTS[rc.out].e] : [PRODUCTS[rc.out].e, ' ', h('div', { class: 'fm-pb grow', 'data-at': f.at, 'data-t': rc.t }, bar(r))])
          : d.recipes.map((rc2, j) => { const ok = Object.entries(rc2.in).every(([k, q]) => (S.inv[k] || 0) >= q), cost = Object.entries(rc2.in).reduce((s, [k, q]) => s + ALL[k].p * q, 0);
            return h('button', { type: 'button', class: 'fm-recipe' + (ok ? '' : ' no'), onclick: () => tapFact(i, j) }, h('span', {}, Object.entries(rc2.in).map(([k, q]) => [ALL[k].e, h('sub', {}, '×' + num(q))]), ' ', L('⬅', '➜'), ' ', PRODUCTS[rc2.out].e),
              h('small', {}, L(`قيمة المكونات ${num(cost)} ← المنتج ${num(PRODUCTS[rc2.out].p)}`, `inputs ${cost} → ${PRODUCTS[rc2.out].p}`), ' · ⏱', left(rc2.t))); }));
    })));
  }
  function marketView() {
    const items = Object.keys(S.inv).filter(k => S.inv[k] > 0);
    return h('div', { class: 'fm-pane' },
      h('h4', {}, '📦 ', L('طلبات الزبائن (سعر أعلى بـ35%)', 'Customer orders (+35%)')),
      h('div', { class: 'fm-orders' }, S.orders.map(o => { const ok = Object.entries(o.need).every(([k, q]) => (S.inv[k] || 0) >= q);
        return h('div', { class: 'fm-order' }, h('span', { class: 'fm-who' }, o.who), h('div', { class: 'fm-need' }, Object.entries(o.need).map(([k, q]) => h('span', { class: (S.inv[k] || 0) >= q ? 'ok' : '' }, ALL[k].e, h('sub', { dir: 'ltr' }, num(Math.min(S.inv[k] || 0, q)), '/', num(q))))),
          h('div', { class: 'fm-pay' }, '🪙 ', num(o.pay), h('small', {}, ' +', num(o.xp), '⭐')), h('button', { type: 'button', class: 'btn sm', disabled: !ok, onclick: () => deliver(o) }, L('سلّم', 'Deliver')),
          h('button', { type: 'button', class: 'fm-x', title: L('رفض', 'Skip'), onclick: () => { S.orders = S.orders.filter(x => x !== o); newOrder(); save(); draw(); } }, '✕')); })),
      h('h4', {}, '🛒 ', L('السوق — الأسعار تتغير كل دقيقتين', 'Market — prices change every 2 min')),
      items.length ? h('div', { class: 'fm-sell' }, items.map(k => { const m = S.mk[k] ?? 1;
        return h('div', { class: 'fm-si' }, h('span', { class: 'fm-sie' }, ALL[k].e), h('div', { class: 'grow' }, h('b', {}, nm(k), ' ×', num(S.inv[k])), h('small', { class: m > 1.05 ? 'up' : m < .95 ? 'down' : '' }, num(price(k)), ' 🪙 ', m > 1.05 ? '▲' : m < .95 ? '▼' : '●')),
          h('button', { type: 'button', class: 'btn ghost sm', onclick: () => sell(k) }, L('بِع 1', 'Sell 1')), h('button', { type: 'button', class: 'btn sm', onclick: () => sell(k, true) }, L('بِع الكل', 'Sell all'))); }))
        : h('p', { class: 'muted' }, L('المخزن فارغ.', 'Barn is empty.')),
      h('div', { class: 'fm-lesson' }, '💡 ', LESSONS[Math.floor(now() / 60) % LESSONS.length]));
  }
  function invest() {
    const rate = (gainPerMin, cost) => gainPerMin > 0 ? L(`يسترد تكلفته خلال ~${num(Math.ceil(cost / gainPerMin))} دقيقة لعب`, `Pays back in ~${Math.ceil(cost / gainPerMin)} min`) : '';
    const crop = CROPS.carrot, plotGain = (crop.p * 2 - crop.seed) / (crop.t / 60);
    const O = [];
    if (S.plots.length < 18) { const c = 60 + (S.plots.length - 6) * 45; O.push({ e: '🟫', t: L('قطعة أرض جديدة', 'New plot'), d: L('مساحة لزراعة محصول إضافي', 'Room for one more crop'), c, roi: rate(plotGain, c), go: () => S.plots.push(null) }); }
    for (const [k, a] of Object.entries(ANIMALS)) { const n = S.pens.filter(p => p.k === k).length; if (n < 4) { const c = Math.round(a.cost * (1 + n * .35)), g = (PRODUCTS[a.out].p - CROPS[a.feed].p) / (a.t / 60); O.push({ e: a.e, t: L('شراء ', 'Buy ') + L(a.ar, a.en), d: L(`ينتج ${PRODUCTS[a.out].e} ${PRODUCTS[a.out].ar} ويأكل ${CROPS[a.feed].e}`, `Makes ${PRODUCTS[a.out].en}`), c, roi: rate(g, c), go: () => S.pens.push({ k, at: 0 }) }); } }
    for (const [k, f] of Object.entries(FACT)) if (!S.facts.some(x => x.k === k)) { const rc = f.recipes[0], g = (PRODUCTS[rc.out].p - Object.entries(rc.in).reduce((s, [a, q]) => s + ALL[a].p * q, 0)) / (rc.t / 60); O.push({ e: f.e, t: L(f.ar, f.en), d: f.recipes.map(r => PRODUCTS[r.out].e).join(' ') + ' — ' + L('قيمة مضافة', 'value added'), c: f.cost, roi: rate(g, f.cost), go: () => S.facts.push({ k, at: null }) }); }
    if (S.water < 3) { const c = [250, 600, 1200][S.water]; O.push({ e: '💧', t: L('نظام ري بالتنقيط', 'Drip irrigation'), d: L('المحاصيل تنمو أسرع 25%', 'Crops grow 25% faster'), c, roi: rate(plotGain * S.plots.length * .2, c), go: () => S.water++ }); }
    if (S.cap < 200) { const c = S.cap * 4; O.push({ e: '🏚️', t: L('توسيع المخزن', 'Bigger barn'), d: L(`السعة من ${num(S.cap)} إلى ${num(S.cap + 30)}`, `Capacity +30`), c, roi: L('يتيح لك انتظار الأسعار الأعلى', 'Lets you wait for better prices'), go: () => S.cap += 30 }); }
    return h('div', { class: 'fm-pane' }, h('h4', {}, L('قارن التكلفة بمدة الاسترداد قبل أن تستثمر', 'Compare cost and payback before investing')),
      h('div', { class: 'fm-goal' }, h('div', {}, '🎯 ', L('الهدف: 10٬000 🪙 لتصبح شركة زراعية كبرى', 'Goal: 10,000 🪙')), bar(S.coins / 10000)),
      h('div', { class: 'fm-inv' }, O.map(o => h('div', { class: 'fm-io' + (S.coins >= o.c ? '' : ' no') }, h('span', { class: 'fm-ioe' }, o.e), h('div', { class: 'grow' }, h('b', {}, o.t), h('small', {}, o.d), h('small', { class: 'fm-roi' }, '⏱️ ', o.roi)),
        h('button', { type: 'button', class: 'btn sm', disabled: S.coins < o.c, onclick: () => { if (S.coins < o.c) return; S.coins -= o.c; o.go(); save(); sound('win'); say(L('تم الاستثمار ✅', 'Invested ✅'), 'ok'); draw(); } }, '🪙 ', num(o.c))))),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { if (confirm(L('بدء مزرعة جديدة من الصفر؟', 'Start over?'))) { S = blank(); save(); draw(); } } }, '↺ ', L('مزرعة جديدة', 'New farm')));
  }
  function signature() {
    const t = now();
    return [S.plots.map(p => p ? (t - p.at >= grow(p.k) ? 2 : (t - p.at) / grow(p.k) < .35 ? 0 : 1) : '-').join(''), S.pens.map(p => p.at ? (t - p.at >= ANIMALS[p.k].t ? 2 : 1) : 0).join(''), S.facts.map(f => f.at != null ? (t - f.at >= FACT[f.k].recipes[f.r].t ? 2 : 1) : 0).join(''), Math.floor(t / 120)].join('|');
  }
  const iv = setInterval(() => {
    if (!alive) return;
    if (signature() !== sig) { if (!view.querySelector('.fm-sell, .fm-inv') || Math.floor(now() / 120) !== +sig.split('|')[3]) draw(); else sig = signature(); return; }
    view.querySelectorAll('.fm-pb').forEach(el => { const r = (now() - +el.dataset.at) / +el.dataset.t; const i = el.querySelector('i'); if (i) i.style.width = Math.min(100, r * 100) + '%'; });
  }, 400);
  if (!S.orders.length) { market(); save(); }
  draw();
  return { unmount() { alive = false; clearInterval(iv); }, onLang() { draw(); } };
}
