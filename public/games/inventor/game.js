// مختبر المخترع الذكي: ابنِ دوائر كهربائية حقيقية بالبطارية والأسلاك والمصابيح والمفاتيح والمحركات، وأنجز التحديات، واكتشف الأعطال.
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';
import { solve } from './circuit.js';
addDict({
  ar: { iv_tools: 'القطع', iv_hand: 'يد (شغّل المفاتيح)', iv_flip: 'اقلب الاتجاه', iv_erase: 'ممحاة', iv_clear: 'امسح اللوحة', iv_tasks: 'التحديات', iv_short: '⚠️ دائرة قصيرة! التيار كبير جدًا وقد تسخن البطارية. أضف مصباحًا أو مقاومًا.', iv_burn: '🔥 احترق الصمام الضوئي! أضف مقاومًا لتقليل التيار.',
    iv_help: 'اختر قطعة ثم اضغط بين نقطتين متجاورتين لتضعها. القطب الموجب للبطارية عليه علامة +، والتيار يحتاج طريقًا مغلقًا ليعود إلى البطارية.', iv_done: 'أنجزت التحدي: {n} 🎉', iv_current: 'التيار', iv_amp: 'أمبير', iv_tip: 'معلومة' },
  en: { iv_tools: 'Parts', iv_hand: 'Hand (toggle switches)', iv_flip: 'Flip direction', iv_erase: 'Eraser', iv_clear: 'Clear board', iv_tasks: 'Challenges', iv_short: '⚠️ Short circuit! Add a bulb or resistor.', iv_burn: '🔥 The LED burned! Add a resistor.',
    iv_help: 'Pick a part, then tap between two neighbouring dots. Current needs a closed loop back to the battery.', iv_done: 'Challenge done: {n} 🎉', iv_current: 'Current', iv_amp: 'A', iv_tip: 'Tip' },
});
const TOOLS = { wire: ['➖', 'سلك'], battery: ['🔋', 'بطارية 9 فولت'], bulb: ['💡', 'مصباح'], switch: ['🔘', 'مفتاح'], resistor: ['〰️', 'مقاوم'], led: ['🔴', 'صمام ضوئي LED'], motor: ['⚙️', 'محرك'], buzzer: ['🔔', 'جرس'] };
const TIPS = { wire: 'الأسلاك النحاسية موصلة جيدة للكهرباء.', battery: 'البطارية مصدر الطاقة: يخرج التيار من قطبها الموجب ويعود إلى السالب.', bulb: 'يتوهج سلك المصباح الرفيع عندما يمر فيه التيار.', switch: 'المفتاح يفتح الدائرة أو يغلقها، فيتحكم في مرور التيار.', resistor: 'المقاوم يقلل التيار ويحمي القطع الحساسة.', led: 'الصمام الضوئي يمرر التيار في اتجاه واحد فقط، ويحتاج مقاومًا لحمايته.', motor: 'المحرك يحوّل الطاقة الكهربائية إلى حركة.', buzzer: 'الجرس يحوّل الطاقة الكهربائية إلى صوت.' };
const W = 8, H = 5;
const TASKS = [
  { n: 'أشعل مصباحًا', ok: (st) => st.lit.bulb >= 1 },
  { n: 'مصباحان على التوالي (ضوء خافت)', ok: (st) => st.bulbs.filter(i => i > .2 && i < .6).length >= 2 },
  { n: 'مصباحان على التوازي (ضوء قوي)', ok: (st) => st.bulbs.filter(i => i > .65).length >= 2 },
  { n: 'تحكم في مصباح بمفتاح', ok: (st) => st.switchControl },
  { n: 'أشعل LED بأمان مع مقاوم', ok: (st) => st.ledSafe },
  { n: 'شغّل محركًا وجرسًا معًا', ok: (st) => st.lit.motor >= 1 && st.lit.buzzer >= 1 },
];
export async function mount(root) {
  if (!document.getElementById('iv-css')) document.head.append(h('link', { id: 'iv-css', rel: 'stylesheet', href: new URL('./inventor.css', import.meta.url).href }));
  const view = h('div', { class: 'iv' }); root.append(view);
  let comps = store.get('iv-comps', []), tool = 'wire', done = new Set(store.get('iv-done', []));
  const save = () => store.set('iv-comps', comps);
  function analyze() {
    const r = solve(comps); const I = r.I || [];
    const lit = { bulb: 0, motor: 0, buzzer: 0, led: 0 }; const bulbs = [];
    comps.forEach((c, k) => { const a = Math.abs(I[k] || 0); if (c.type === 'bulb') { bulbs.push(a); if (a > .15) lit.bulb++; } if (c.type === 'motor' && a > .2) lit.motor++; if (c.type === 'buzzer' && a > .1) lit.buzzer++; if (c.type === 'led' && (I[k] || 0) > .01) lit.led++; });
    const burned = comps.some((c, k) => c.type === 'led' && (I[k] || 0) > .5);
    const ledSafe = comps.some((c, k) => c.type === 'led' && (I[k] || 0) > .01 && (I[k] || 0) <= .5) && comps.some(c => c.type === 'resistor');
    let switchControl = false;
    if (lit.bulb && comps.some(c => c.type === 'switch' && c.on)) { const off = solve(comps.map(c => c.type === 'switch' ? { ...c, on: false } : c)); switchControl = comps.some((c, k) => c.type === 'bulb' && Math.abs(I[k]) > .15 && Math.abs(off.I[k]) < .05); }
    return { I, short: r.short, burned, lit, bulbs, ledSafe, switchControl };
  }
  function edgeKey(a, b) { return [a, b].sort().join('|'); }
  function place(a, b) {
    const k = edgeKey(a, b); const i = comps.findIndex(c => edgeKey(c.a, c.b) === k);
    if (tool === 'erase') { if (i >= 0) { comps.splice(i, 1); sound('capture'); } }
    else if (tool === 'hand') { if (i >= 0 && comps[i].type === 'switch') { comps[i].on = !comps[i].on; sound('move'); } }
    else if (tool === 'flip') { if (i >= 0) { [comps[i].a, comps[i].b] = [comps[i].b, comps[i].a]; sound('move'); } }
    else { if (i >= 0) comps.splice(i, 1); comps.push({ type: tool, a, b, on: true }); sound('place'); }
    save(); draw();
  }
  const S = 90, P = 40; const px = (x) => P + x * S, py = (y) => P + y * S;
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); p?.append(e); return e; };
  function draw() {
    const st = analyze();
    for (const [k, tk] of TASKS.entries()) if (!done.has(k) && tk.ok(st)) { done.add(k); store.set('iv-done', [...done]); toast(t('iv_done', { n: tk.n }), 'ok'); sound('win'); }
    view.innerHTML = '';
    const svg = sv('svg', { viewBox: `0 0 ${P * 2 + (W - 1) * S} ${P * 2 + (H - 1) * S}`, class: 'iv-board' });
    sv('rect', { x: 0, y: 0, width: P * 2 + (W - 1) * S, height: P * 2 + (H - 1) * S, rx: 20, fill: '#0f3d2e' }, svg);
    // مواضع الوضع (الحواف)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const x2 = x + dx, y2 = y + dy; if (x2 >= W || y2 >= H) continue;
      const hit = sv('line', { x1: px(x), y1: py(y), x2: px(x2), y2: py(y2), class: 'iv-slot' }, svg);
      hit.addEventListener('click', () => place(x + ',' + y, x2 + ',' + y2));
    }
    comps.forEach((c, k) => {
      const [ax, ay] = c.a.split(',').map(Number), [bx, by] = c.b.split(',').map(Number);
      const x1 = px(ax), y1 = py(ay), x2 = px(bx), y2 = py(by), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const cur = Math.abs(st.I[k] || 0);
      const g = sv('g', { class: 'iv-comp' }, svg);
      const flowing = cur > .02;
      sv('line', { x1, y1, x2, y2, stroke: flowing ? '#fbbf24' : '#cbd5e1', 'stroke-width': c.type === 'wire' ? 7 : 5, 'stroke-linecap': 'round', class: flowing ? 'iv-flow' : '' }, g);
      if (c.type !== 'wire') {
        const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const body = sv('g', { transform: `translate(${mx},${my}) rotate(${ang})` }, g);
        sv('rect', { x: -26, y: -20, width: 52, height: 40, rx: 12, fill: '#fff', stroke: '#334155', 'stroke-width': 2 }, body);
        if (c.type === 'battery') { sv('rect', { x: -22, y: -12, width: 40, height: 24, rx: 4, fill: '#16a34a' }, body); sv('rect', { x: 18, y: -6, width: 5, height: 12, fill: '#94a3b8' }, body); const tx = sv('text', { x: 28, y: -18, 'font-size': 20, 'font-weight': 900, fill: '#dc2626' }, body); tx.textContent = '+'; }
        else if (c.type === 'switch') { sv('circle', { cx: -14, cy: 0, r: 4, fill: '#334155' }, body); sv('circle', { cx: 14, cy: 0, r: 4, fill: '#334155' }, body); sv('line', { x1: -14, y1: 0, x2: 14, y2: c.on ? 0 : -14, stroke: c.on ? '#16a34a' : '#dc2626', 'stroke-width': 5, 'stroke-linecap': 'round' }, body); }
        else if (c.type === 'led') { sv('polygon', { points: '-10,-12 -10,12 10,0', fill: cur > .5 ? '#1f2937' : (st.I[k] || 0) > .01 ? '#ef4444' : '#fecaca' }, body); sv('line', { x1: 10, y1: -12, x2: 10, y2: 12, stroke: '#334155', 'stroke-width': 3 }, body); if ((st.I[k] || 0) > .01 && cur <= .5) sv('circle', { r: 26, fill: '#ef4444', opacity: .25 }, body); }
        else if (c.type === 'resistor') sv('polyline', { points: '-20,0 -14,-9 -6,9 2,-9 10,9 16,0 20,0', fill: 'none', stroke: '#a16207', 'stroke-width': 3 }, body);
        else { const label = sv('text', { x: 0, y: 9, 'text-anchor': 'middle', 'font-size': 24, transform: `rotate(${-ang})` }, body); label.textContent = TOOLS[c.type][0]; if (c.type === 'motor' && cur > .2) label.setAttribute('class', 'iv-spin'); if (c.type === 'buzzer' && cur > .1) label.setAttribute('class', 'iv-shake'); }
        if (c.type === 'bulb' && cur > .15) sv('circle', { cx: mx, cy: my, r: 18 + cur * 30, fill: '#fde047', opacity: Math.min(.7, cur), class: 'iv-glow' }, svg);
      }
      if (flowing) { const tx = sv('text', { x: mx, y: my + 38, 'text-anchor': 'middle', 'font-size': 13, fill: '#fde68a', 'font-weight': 700 }, svg); tx.textContent = cur.toFixed(2) + ' A'; }
    });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sv('circle', { cx: px(x), cy: py(y), r: 6, fill: '#94a3b8', 'pointer-events': 'none' }, svg);
    view.append(h('div', { class: 'iv-main' },
      h('div', { class: 'iv-left' }, svg, st.short ? h('div', { class: 'ck-res bad' }, t('iv_short')) : null, st.burned ? h('div', { class: 'ck-res bad' }, t('iv_burn')) : null, h('small', { class: 'muted' }, t('iv_help'))),
      h('div', { class: 'iv-right' },
        h('b', {}, t('iv_tools')),
        h('div', { class: 'iv-tools' }, [...Object.entries(TOOLS), ['hand', ['✋', t('iv_hand')]], ['flip', ['🔄', t('iv_flip')]], ['erase', ['🧽', t('iv_erase')]]].map(([k, [ic, n]]) => h('button', { type: 'button', class: 'iv-tool' + (tool === k ? ' on' : ''), onclick: () => { tool = k; draw(); } }, h('span', {}, ic), h('small', {}, n)))),
        TIPS[tool] ? h('p', { class: 'ct-tip' }, '💡 ', TIPS[tool]) : null,
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { comps = []; save(); draw(); } }, t('iv_clear')),
        h('div', { class: 'ct-goals' }, h('b', {}, '🎯 ', t('iv_tasks')), TASKS.map((tk, k) => h('div', { class: done.has(k) ? 'done' : '' }, done.has(k) ? '✅ ' : '⬜ ', tk.n))))));
  }
  draw();
  return { onLang() { draw(); } };
}
