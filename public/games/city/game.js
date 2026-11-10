// ابنِ مدينتك الذكية: اكسب العملات بحل التحديات، وابنِ المنازل والمدارس والمستشفيات ومحطات الطاقة، ووازن بين الميزانية والسعادة والبيئة.
import { h, t, addDict, sound, num, ico, store, toast, modal } from '../../assets/js/core.js';
import { pickQuestions } from '../../assets/js/qbank.js';
addDict({
  ar: { ct_month: 'الشهر {n}', ct_next: 'الشهر التالي ⏭', ct_money: 'الميزانية', ct_pop: 'السكان', ct_happy: 'السعادة', ct_edu: 'التعليم', ct_health: 'الصحة', ct_energy: 'الطاقة', ct_green: 'البيئة',
    ct_build: 'اختر مبنى ثم اضغط مكانًا فارغًا', ct_bull: 'الهدم', ct_challenge: 'تحدي المعرفة (+150)', ct_noMoney: 'الميزانية لا تكفي! حل تحديًا لتكسب عملات.', ct_report: 'تقرير الشهر', ct_income: 'الدخل', ct_cost: 'المصروفات', ct_goals: 'المهام',
    ct_new: 'مدينة جديدة', ct_tip: 'معلومة', ct_right: 'إجابة صحيحة! +150 عملة', ct_wrong: 'إجابة خاطئة، حاول في تحدٍّ آخر', ct_done: 'أنجزت المهمة: {g} 🎉 (+{n})', ct_lowEnergy: 'الطاقة لا تكفي! بعض المباني متوقفة.' },
  en: { ct_month: 'Month {n}', ct_next: 'Next month ⏭', ct_money: 'Budget', ct_pop: 'Population', ct_happy: 'Happiness', ct_edu: 'Education', ct_health: 'Health', ct_energy: 'Energy', ct_green: 'Environment',
    ct_build: 'Pick a building, then tap an empty lot', ct_bull: 'Demolish', ct_challenge: 'Knowledge challenge (+150)', ct_noMoney: 'Not enough budget! Solve a challenge to earn coins.', ct_report: 'Monthly report', ct_income: 'Income', ct_cost: 'Costs', ct_goals: 'Missions',
    ct_new: 'New city', ct_tip: 'Tip', ct_right: 'Correct! +150 coins', ct_wrong: 'Wrong answer — try another challenge', ct_done: 'Mission done: {g} 🎉 (+{n})', ct_lowEnergy: 'Not enough energy! Some buildings stopped.' },
});
// المباني: التكلفة، الصيانة الشهرية، السكان، الوظائف، الطاقة (+ إنتاج / − استهلاك)، التلوث، الخدمات
const B = {
  house: { ic: '🏠', n: 'منزل', cost: 100, up: 2, pop: 10, energy: -1, poll: 0, tip: 'المنازل تجلب السكان، والسكان يدفعون الضرائب.' },
  tower: { ic: '🏢', n: 'عمارة سكنية', cost: 300, up: 6, pop: 40, energy: -4, poll: 1, tip: 'العمارات تسكن عددًا أكبر في مساحة أصغر، لكنها تستهلك طاقة أكثر.' },
  school: { ic: '🏫', n: 'مدرسة', cost: 250, up: 12, edu: 60, energy: -2, tip: 'كل مدرسة تخدم نحو 60 ساكنًا. التعليم يرفع دخل السكان على المدى البعيد.' },
  hospital: { ic: '🏥', n: 'مستشفى', cost: 350, up: 16, health: 80, energy: -3, tip: 'المستشفى يخدم نحو 80 ساكنًا ويرفع السعادة.' },
  park: { ic: '🌳', n: 'حديقة', cost: 80, up: 2, fun: 30, poll: -3, tip: 'الأشجار تمتص ثاني أكسيد الكربون وتقلل التلوث وتسعد السكان.' },
  shop: { ic: '🏪', n: 'متجر', cost: 150, up: 3, jobs: 15, tax: 4, energy: -1, tip: 'المتاجر توفر وظائف وتدفع ضرائب أعلى.' },
  factory: { ic: '🏭', n: 'مصنع', cost: 400, up: 8, jobs: 40, tax: 12, energy: -4, poll: 6, tip: 'المصانع تجلب المال لكنها تلوث الهواء. وازن بينها وبين الحدائق.' },
  power: { ic: '⚡', n: 'محطة كهرباء (وقود)', cost: 300, up: 10, energy: 30, poll: 8, tip: 'محطات الوقود تنتج طاقة كثيرة لكنها تلوث البيئة.' },
  solar: { ic: '☀️', n: 'ألواح شمسية', cost: 350, up: 4, energy: 12, poll: 0, tip: 'الطاقة الشمسية متجددة ونظيفة، وتكلفة صيانتها منخفضة.' },
  wind: { ic: '🌬️', n: 'توربين رياح', cost: 280, up: 4, energy: 9, poll: 0, tip: 'طاقة الرياح متجددة لا تنفد.' },
  recycle: { ic: '♻️', n: 'مركز تدوير', cost: 220, up: 6, poll: -8, energy: -1, jobs: 8, tip: 'إعادة التدوير تقلل النفايات والتلوث وتوفر الموارد.' },
  library: { ic: '📚', n: 'مكتبة', cost: 180, up: 5, edu: 30, fun: 10, energy: -1, tip: 'المكتبات تنشر المعرفة وتسعد السكان.' },
};
const GOALS = [
  { k: 'pop50', n: 'وصّل السكان إلى 50', ok: (s) => s.pop >= 50, r: 150 },
  { k: 'school', n: 'ابنِ مدرسة', ok: (s) => s.count.school >= 1, r: 100 },
  { k: 'energy', n: 'وفّر طاقة نظيفة (شمسية أو رياح)', ok: (s) => (s.count.solar || 0) + (s.count.wind || 0) >= 1, r: 150 },
  { k: 'happy70', n: 'اجعل السعادة 70% أو أكثر', ok: (s) => s.happy >= 70, r: 200 },
  { k: 'pop200', n: 'وصّل السكان إلى 200', ok: (s) => s.pop >= 200, r: 300 },
  { k: 'green', n: 'حافظ على بيئة 80% مع 150 ساكنًا', ok: (s) => s.green >= 80 && s.pop >= 150, r: 300 },
  { k: 'rich', n: 'اجمع ميزانية 5000', ok: (s) => s.money >= 5000, r: 500 },
];
const N = 9;
import { building } from './art.js';
export async function mount(root) {
  if (!document.getElementById('ct-css')) document.head.append(h('link', { id: 'ct-css', rel: 'stylesheet', href: new URL('./city.css', import.meta.url).href }));
  const view = h('div', { class: 'ct' }); root.append(view);
  let S = store.get('city', null), tool = 'house';
  function fresh() { S = { grid: Array(N * N).fill(null), money: 1200, month: 1, done: [], log: [] }; S.grid[40] = 'house'; save(); }
  const save = () => store.set('city', S);
  function stats() {
    const count = {}; for (const b of S.grid) if (b) count[b] = (count[b] || 0) + 1;
    const sum = (k) => S.grid.reduce((a, b) => a + (b && B[b][k] || 0), 0);
    let energyProd = S.grid.reduce((a, b) => a + (b && B[b].energy > 0 ? B[b].energy : 0), 0), energyUse = -S.grid.reduce((a, b) => a + (b && B[b].energy < 0 ? B[b].energy : 0), 0);
    const powered = energyUse ? Math.min(1, energyProd / energyUse) : 1;
    const pop = Math.round(sum('pop') * powered);
    const edu = pop ? Math.min(100, Math.round(sum('edu') * powered / pop * 100)) : 100;
    const health = pop ? Math.min(100, Math.round(sum('health') * powered / pop * 100)) : 100;
    const poll = Math.max(0, sum('poll'));
    const green = Math.max(0, Math.min(100, 100 - poll * 4));
    const jobs = sum('jobs'); const work = pop ? Math.min(100, Math.round(jobs / Math.max(1, pop * .5) * 100)) : 100;
    const fun = pop ? Math.min(100, Math.round(sum('fun') / pop * 100 * 1.5)) : 100;
    const happy = Math.round((edu * .2 + health * .25 + green * .2 + work * .2 + fun * .15) * (powered < 1 ? .8 : 1));
    const income = Math.round(pop * (1.2 + edu / 200) + S.grid.reduce((a, b) => a + (b && B[b].tax || 0), 0) * powered);
    const cost = sum('up');
    return { count, pop, edu, health, green, poll, happy, income, cost, energyProd, energyUse, powered, work, money: S.money };
  }
  function nextMonth() {
    const st = stats(); S.money += st.income - st.cost; S.month++;
    S.log.push(st.income - st.cost); if (S.log.length > 24) S.log.shift();
    const st2 = { ...stats(), money: S.money };
    for (const g of GOALS) if (!S.done.includes(g.k) && g.ok(st2)) { S.done.push(g.k); S.money += g.r; toast(t('ct_done', { g: g.n, n: num(g.r) }), 'ok'); sound('win'); }
    if (st.powered < 1) toast(t('ct_lowEnergy'), true);
    sound('notify'); save(); draw();
  }
  function challenge() {
    const q = pickQuestions(1, { lvl: 2 })[0];
    modal(t('ct_challenge'), h('div', { class: 'ct-q' }, h('p', {}, q.q), h('div', { class: 'ct-qopts' }, q.opts.map((o, i) => h('button', { type: 'button', class: 'btn ghost', onclick: () => { modal.current?.close(null); if (i === q.ok) { S.money += 150; sound('win'); toast(t('ct_right'), 'ok'); } else { sound('error'); toast(t('ct_wrong'), true); } save(); draw(); } }, o)))), [], { icon: 'brain' });
  }
  function tap(i) {
    if (tool === 'bull') { if (S.grid[i]) { S.money += Math.round(B[S.grid[i]].cost * .3); S.grid[i] = null; sound('capture'); save(); draw(); } return; }
    if (S.grid[i]) return;
    const b = B[tool]; if (S.money < b.cost) { toast(t('ct_noMoney'), true); sound('error'); return; }
    S.money -= b.cost; S.grid[i] = tool; sound('place'); save(); draw();
  }
  const meter = (ic, label, v, good = true) => h('div', { class: 'ct-m' }, h('span', {}, ic, ' ', label), h('div', { class: 'ct-bar' }, h('i', { style: { width: v + '%', background: v >= 70 ? '#22c55e' : v >= 40 ? '#eab308' : '#ef4444' } })), h('b', {}, num(v), '%'));
  function draw() {
    const st = stats();
    view.innerHTML = '';
    const grid = h('div', { class: 'ct-grid', style: { '--n': N } }, S.grid.map((b, i) => h('button', { type: 'button', class: 'ct-lot' + (b ? ' b-' + b : ''), title: b ? B[b].n : '', onclick: () => tap(i), html: b ? building(b) : '' })));
    const maxLog = Math.max(1, ...S.log.map(Math.abs));
    view.append(h('div', { class: 'ct-top' },
      h('div', { class: 'ct-chip money' }, '💰 ', num(S.money)), h('div', { class: 'ct-chip' }, '👥 ', num(st.pop)), h('div', { class: 'ct-chip' }, '⚡ ', num(st.energyProd), '/', num(st.energyUse)), h('div', { class: 'ct-chip' }, '📅 ', t('ct_month', { n: num(S.month) })),
      h('button', { type: 'button', class: 'btn', onclick: nextMonth }, t('ct_next')), h('button', { type: 'button', class: 'btn ghost', onclick: challenge }, '🧠 ', t('ct_challenge')),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { fresh(); draw(); } }, t('ct_new'))),
      h('div', { class: 'ct-main' },
        h('div', { class: 'ct-left' }, grid, h('div', { class: 'ct-flow' }, h('span', {}, t('ct_income'), ': +', num(st.income)), h('span', {}, t('ct_cost'), ': −', num(st.cost)), h('b', { style: { color: st.income - st.cost >= 0 ? '#16a34a' : '#dc2626' } }, '= ', num(st.income - st.cost))),
          h('div', { class: 'ct-chart' }, S.log.map(v => h('i', { style: { height: Math.abs(v) / maxLog * 40 + 'px', background: v >= 0 ? '#22c55e' : '#ef4444' } })))),
        h('div', { class: 'ct-right' },
          h('div', { class: 'ct-meters' }, meter('😊', t('ct_happy'), st.happy), meter('🎓', t('ct_edu'), st.edu), meter('❤️', t('ct_health'), st.health), meter('🌿', t('ct_green'), st.green), meter('⚡', t('ct_energy'), Math.round(st.powered * 100))),
          h('small', { class: 'muted' }, t('ct_build')),
          h('div', { class: 'ct-tools' }, Object.entries(B).map(([k, b]) => h('button', { type: 'button', class: 'ct-tool' + (tool === k ? ' on' : '') + (S.money < b.cost ? ' poor' : ''), onclick: () => { tool = k; draw(); } }, h('span', { class: 'ct-ticon', html: building(k) }), h('small', {}, b.n), h('b', {}, '💰', num(b.cost)))),
            h('button', { type: 'button', class: 'ct-tool' + (tool === 'bull' ? ' on' : ''), onclick: () => { tool = 'bull'; draw(); } }, h('span', {}, '🚜'), h('small', {}, t('ct_bull')))),
          tool !== 'bull' ? h('p', { class: 'ct-tip' }, '💡 ', B[tool].tip) : null,
          h('div', { class: 'ct-goals' }, h('b', {}, '🎯 ', t('ct_goals')), GOALS.map(g => h('div', { class: S.done.includes(g.k) ? 'done' : '' }, S.done.includes(g.k) ? '✅ ' : '⬜ ', g.n, h('small', {}, ' (+', num(g.r), ')')))))));
  }
  if (!S) fresh();
  draw();
  return { onLang() { draw(); } };
}
