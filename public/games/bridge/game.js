// مهندس الجسور: صمّم جسرًا من الطريق والخشب والفولاذ والحبال، ثم اختبره بمرور سيارة وشاحنة. تعلّم القوى والاتزان والجملونات وتحسين التكلفة.
import { h, t, addDict, sound, num, ico, store, toast, is3d } from '../../assets/js/core.js';
import { MAT, makeSim, step } from './physics.js';
addDict({
  ar: { br_level: 'المرحلة {n}', br_budget: 'الميزانية', br_cost: 'التكلفة', br_test: 'اختبر الجسر 🚗', br_truck: 'اختبر بشاحنة 🚚', br_edit: 'عودة للتصميم', br_clear: 'امسح', br_del: 'حذف', br_win: 'نجح الاختبار! عبرت المركبة بأمان 🎉', br_fail: 'انهار الجسر! انظر إلى الروابط الحمراء: هي التي تحملت أكثر من طاقتها.', br_over: 'التكلفة أعلى من الميزانية', br_next: 'المرحلة التالية',
    br_help: 'اضغط نقطة ثم نقطة أخرى لتصل بينهما رابطًا. الطريق وحده يحمل السيارة، والخشب والفولاذ والحبال تقويه. المثلثات هي سر قوة الجسور!', br_tip: 'معلومة هندسية', br_tooLong: 'الرابط أطول من الحد المسموح لهذه المادة ({n} م)', br_stress: 'لون الرابط: أخضر = حمل خفيف، أحمر = قريب من الانهيار', br_undo: 'تراجع' },
  en: { br_level: 'Level {n}', br_budget: 'Budget', br_cost: 'Cost', br_test: 'Test with car 🚗', br_truck: 'Test with truck 🚚', br_edit: 'Back to design', br_clear: 'Clear', br_del: 'Delete', br_win: 'Test passed! 🎉', br_fail: 'The bridge collapsed! Red links carried more than they could.', br_over: 'Cost exceeds budget', br_next: 'Next level',
    br_help: 'Tap a point then another to connect them. Road carries the car; wood, steel and rope reinforce it. Triangles make bridges strong!', br_tip: 'Engineering tip', br_tooLong: 'Too long for this material (max {n} m)', br_stress: 'Green = light load, red = near failure', br_undo: 'Undo' },
});
const LEVELS = [
  { gap: 8, budget: 1400, anchors: [[0, -2.5], [8, -2.5]], tip: 'المثلث شكل لا يتغير إلا إذا تغيّر طول أحد أضلاعه، لذلك تُبنى الجسور من مثلثات (جملونات).' },
  { gap: 12, budget: 2000, anchors: [[0, -3], [12, -3]], tip: 'الروابط العلوية في الجسر تتعرض غالبًا للضغط، والسفلية للشد.' },
  { gap: 14, budget: 2400, anchors: [[0, -4], [14, -4], [7, -8]], tip: 'الدعامة في منتصف النهر تقسم المسافة إلى بحرين أقصر فتقل القوى كثيرًا.' },
  { gap: 18, budget: 2600, anchors: [[0, -3], [18, -3]], high: [[-1, 6], [19, 6]], tip: 'الجسور المعلقة تعتمد على الحبال الفولاذية التي تعمل بالشد فقط، وتنقل الحمل إلى الأبراج.' },
  { gap: 20, budget: 3600, anchors: [[0, -4], [20, -4]], tip: 'وازن بين القوة والتكلفة: الفولاذ أقوى لكنه أغلى وأثقل.' },
];
export async function mount(root) {
  if (!document.getElementById('br-css')) document.head.append(h('link', { id: 'br-css', rel: 'stylesheet', href: new URL('./bridge.css', import.meta.url).href }));
  const view = h('div', { class: 'br' }); root.append(view);
  let li = Math.min(store.get('br-level', 0), LEVELS.length - 1), mat = 'road', nodes, beams, sel = null, sim = null, raf = 0, result = null, hist = [], hover = null;
  const cv = h('canvas', { class: 'br-cv', width: 1000, height: 560 }); const g = cv.getContext('2d');
  function load() {
    const L = LEVELS[li]; const saved = store.get('br-design-' + li, null);
    nodes = [{ x: 0, y: 0, fixed: true }, { x: L.gap, y: 0, fixed: true }, ...L.anchors.map(([x, y]) => ({ x, y, fixed: true })), ...(L.high || []).map(([x, y]) => ({ x, y, fixed: true }))];
    beams = [];
    if (saved) { nodes = saved.nodes; beams = saved.beams; }
    sel = null; sim = null; result = null; hist = [];
  }
  const saveD = () => store.set('br-design-' + li, { nodes, beams });
  const cost = () => Math.round(beams.reduce((a, b) => a + MAT[b.mat].cost * Math.hypot(nodes[b.a].x - nodes[b.b].x, nodes[b.a].y - nodes[b.b].y), 0));
  // التحويل بين إحداثيات العالم والشاشة
  const view2 = () => { const L = LEVELS[li]; const span = L.gap + 10; const s = 1000 / span; return { s, ox: 5 * s, oy: 300 }; };
  const toS = (x, y) => { const v = view2(); return [v.ox + x * v.s, v.oy - y * v.s]; };
  const toW = (px, py) => { const v = view2(); return [Math.round((px - v.ox) / v.s), Math.round((v.oy - py) / v.s)]; };
  function clickAt(px, py) {
    if (sim) return;
    const [x, y] = toW(px, py); const L = LEVELS[li];
    if (y < -9 || y > 8 || x < -2 || x > L.gap + 2) return;
    let i = nodes.findIndex(n => n.x === x && n.y === y);
    if (mat === 'del') { if (i >= 0) { const bi = beams.findIndex(b => b.a === i || b.b === i); if (bi >= 0) { hist.push(JSON.stringify({ nodes, beams })); beams = beams.filter(b => b.a !== i && b.b !== i); prune(); saveD(); draw(); } } return; }
    if (sel == null) { if (i < 0) { if (!(x > 0 && x < L.gap) && y <= 0) return; nodes.push({ x, y }); i = nodes.length - 1; } sel = i; draw(); return; }
    if (i === sel) { sel = null; prune(); draw(); return; }
    const A = nodes[sel]; const len = Math.hypot(A.x - x, A.y - y);
    if (len > MAT[mat].max + 1e-9) { toast(t('br_tooLong', { n: num(MAT[mat].max) }), true); return; }
    hist.push(JSON.stringify({ nodes, beams }));
    if (i < 0) { nodes.push({ x, y }); i = nodes.length - 1; }
    if (!beams.some(b => (b.a === sel && b.b === i) || (b.a === i && b.b === sel))) beams.push({ a: sel, b: i, mat });
    sound('place'); sel = i; saveD(); draw();
  }
  function prune() { // نحذف العقد غير المستخدمة
    const used = new Set(beams.flatMap(b => [b.a, b.b])); const map = []; const nn = [];
    nodes.forEach((n, i) => { if (n.fixed || used.has(i) || i === sel) { map[i] = nn.length; nn.push(n); } });
    beams = beams.map(b => ({ ...b, a: map[b.a], b: map[b.b] })); if (sel != null) sel = map[sel]; nodes = nn;
  }
  function test(truck) {
    const L = LEVELS[li];
    if (cost() > L.budget) toast(t('br_over'), true);
    sel = null; prune();
    sim = makeSim(nodes, beams, { x0: -4, xEnd: L.gap + 3, m: truck ? 2600 : 1500, speed: truck ? 2.4 : 3 }); sim.xStart = 0; sim.xEnd = L.gap; sim.truck = truck;
    result = null; draw();
    const loop = () => {
      step(sim);
      if (sim.car.done && !result) { result = 'win'; sound('win'); if (cost() <= L.budget) { store.set('br-level', Math.max(store.get('br-level', 0), li + 1)); } }
      if ((sim.car.fell || sim.car.y < -12) && !result) { result = 'fail'; sound('lose'); }
      draw(); if (sim.t < 25 && !(result && sim.t > (sim.doneAt ||= sim.t) + 2.5)) raf = requestAnimationFrame(loop); else ui();
    };
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); ui();
  }
  function draw() {
    const L = LEVELS[li]; const v = view2();
    g.clearRect(0, 0, 1000, 560);
    const sky = g.createLinearGradient(0, 0, 0, 560); sky.addColorStop(0, '#60a5fa'); sky.addColorStop(.6, '#bae6fd'); sky.addColorStop(1, '#e0f2fe'); g.fillStyle = sky; g.fillRect(0, 0, 1000, 560);
    const sun = g.createRadialGradient(820, 80, 10, 820, 80, 120); sun.addColorStop(0, 'rgba(255,253,230,1)'); sun.addColorStop(.25, 'rgba(254,240,138,.85)'); sun.addColorStop(1, 'rgba(254,240,138,0)'); g.fillStyle = sun; g.fillRect(680, -40, 280, 260);
    for (const [cx, cy, k] of [[140, 70, 1], [470, 50, .8], [700, 120, .7]]) for (const [dy, col] of [[5, 'rgba(203,213,225,.9)'], [0, '#fff']]) { g.fillStyle = col; g.beginPath(); g.arc(cx, cy + dy, 22 * k, 0, 7); g.arc(cx + 26 * k, cy - 8 * k + dy, 28 * k, 0, 7); g.arc(cx + 56 * k, cy + dy, 20 * k, 0, 7); g.fill(); }
    // جبال بعيدة بطبقتين
    for (const [base, col, amp, ph] of [[300, 'rgba(100,116,139,.45)', 120, 0], [330, 'rgba(71,85,105,.45)', 80, 2]]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, 560); for (let x = 0; x <= 1000; x += 50) g.lineTo(x, base - Math.abs(Math.sin(x / 140 + ph)) * amp - Math.sin(x / 37) * 10); g.lineTo(1000, 560); g.fill(); }
    // الماء والضفتان
    const [wx0, wy0] = toS(0, -6); const [wx1] = toS(L.gap, -6); const wy = Math.min(wy0, 500);
    { const vg = g.createLinearGradient(0, 300, 0, wy); vg.addColorStop(0, 'rgba(148,163,184,0)'); vg.addColorStop(1, 'rgba(71,85,105,.55)'); g.fillStyle = vg; g.fillRect(0, 300, 1000, wy - 300); g.fillStyle = '#3f6212'; g.beginPath(); g.moveTo(0, wy + 2); for (let x = 0; x <= 1000; x += 40) g.lineTo(x, wy - 14 - Math.sin(x / 60) * 8); g.lineTo(1000, wy + 2); g.fill(); }
    const wg = g.createLinearGradient(0, wy, 0, 560); wg.addColorStop(0, '#38bdf8'); wg.addColorStop(1, '#075985'); g.fillStyle = wg; g.fillRect(wx0, wy, wx1 - wx0, 560 - wy);
    const tt = Date.now() / 700; g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; for (let k = 0; k < 7; k++) { const y = wy + 8 + k * 16; g.beginPath(); for (let x = wx0; x <= wx1; x += 10) g.lineTo(x, y + Math.sin(x / 26 + tt + k) * 2.5); g.stroke(); }
    const [lx, ly] = toS(0, 0); const [rx] = toS(L.gap, 0);
    const cliff = (x0, x1, edgeX, dir) => {
      const rg = g.createLinearGradient(edgeX - dir * 60, 0, edgeX, 0); rg.addColorStop(0, '#8a6a4a'); rg.addColorStop(1, '#5b4330'); g.fillStyle = rg; g.fillRect(x0, ly, x1 - x0, 560 - ly);
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let k = 1; k < 9; k++) { const y = ly + k * 30; g.beginPath(); g.moveTo(x0, y); for (let x = x0; x <= x1; x += 25) g.lineTo(x, y + Math.sin(x / 30 + k) * 4); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.08)'; for (let k = 0; k < 40; k++) { const x = x0 + ((k * 97) % Math.max(1, x1 - x0)), y = ly + 20 + (k * 53) % (560 - ly); g.beginPath(); g.ellipse(x, y, 10, 5, 0, 0, 7); g.fill(); }
      const gg = g.createLinearGradient(0, ly - 4, 0, ly + 16); gg.addColorStop(0, '#84cc16'); gg.addColorStop(1, '#3f6212'); g.fillStyle = gg; g.fillRect(x0, ly - 2, x1 - x0, 16);
      g.fillStyle = '#4d7c0f'; for (let x = x0; x < x1; x += 7) { g.beginPath(); g.moveTo(x, ly); g.lineTo(x + 3, ly - 6); g.lineTo(x + 6, ly); g.fill(); }
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(dir > 0 ? edgeX - 6 : edgeX, ly, 6, 560 - ly);
    };
    cliff(0, lx, lx, 1); cliff(rx, 1000, rx, -1);
    const treeAt = (x) => { g.fillStyle = '#78350f'; g.fillRect(x - 3, ly - 34, 6, 34); for (const [dx, dy, r, c] of [[0, -48, 20, '#166534'], [-10, -40, 14, '#15803d'], [10, -42, 15, '#16a34a'], [-4, -56, 11, '#22c55e']]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx, ly + dy, r, 0, 7); g.fill(); } };
    if (lx > 120) treeAt(lx - 90); if (lx > 220) treeAt(lx - 190); if (1000 - rx > 120) treeAt(rx + 90); if (1000 - rx > 230) treeAt(rx + 200);
    const pillar = (px, py, w) => { const pg = g.createLinearGradient(px, 0, px + w, 0); pg.addColorStop(0, '#d6d3d1'); pg.addColorStop(.5, '#a8a29e'); pg.addColorStop(1, '#57534e'); g.fillStyle = pg; g.fillRect(px, py, w, 560 - py); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = py + 20; y < 560; y += 24) g.fillRect(px, y, w, 2); };
    if (L.anchors.some(a => a[0] > 0 && a[0] < L.gap)) { for (const [x, y] of L.anchors) if (x > 0 && x < L.gap) { const [px, py] = toS(x - .4, y); pillar(px, py, .8 * v.s); } }
    for (const [x, y] of (L.high || [])) { const [px, py] = toS(x, y); pillar(px - 8, py, 16); }
    // الشبكة
    if (!sim) { g.fillStyle = 'rgba(15,23,42,.18)'; for (let x = -2; x <= L.gap + 2; x++) for (let y = -9; y <= 8; y++) { const [px, py] = toS(x, y); g.beginPath(); g.arc(px, py, 2, 0, 7); g.fill(); } }
    const N = sim ? sim.N : nodes; const Bs = sim ? sim.B : beams.map(b => ({ ...b, M: MAT[b.mat] }));
    for (const b of Bs) {
      if (b.broken) continue; const A = N[b.a], C = N[b.b]; const [ax, ay] = toS(A.x, A.y), [cx, cy] = toS(C.x, C.y);
      g.lineCap = 'round'; const lw = b.M.road ? 12 : b.M.tension ? 3 : 7;
      const col = sim ? (() => { const s = Math.min(1, b.stress); return `rgb(${Math.round(40 + 215 * s)},${Math.round(200 - 170 * s)},60)`; })() : b.M.color;
      const line = (w, c, dash) => { g.lineWidth = w; g.strokeStyle = c; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(ax, ay); g.lineTo(cx, cy); g.stroke(); g.setLineDash([]); };
      const nx = -(cy - ay), ny = cx - ax, nl = Math.hypot(nx, ny) || 1, ox = nx / nl, oy = ny / nl;
      line(lw + 2.5, 'rgba(0,0,0,.45)'); line(lw, col);
      if (!sim) {
        if (b.M.road) { line(lw - 4, '#374151'); }
        else if (b.M.tension) { line(lw, 'rgba(255,255,255,.35)', [2, 3]); }
        else { g.save(); g.translate(-ox * lw * .25, -oy * lw * .25); line(lw * .3, 'rgba(255,255,255,.35)'); g.restore(); if (b.mat === 'wood') line(1, 'rgba(60,30,10,.4)', [10, 6]); if (b.mat === 'steel') { line(lw * .25, 'rgba(15,23,42,.35)'); } }
      }
      if (b.M.road && !sim) { g.strokeStyle = '#fbbf24'; g.lineWidth = 1.5; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(cx, cy); g.stroke(); g.setLineDash([]); }
    }
    for (const [i, n] of N.entries()) { const [px, py] = toS(n.x, n.y); { const r = n.fixed ? 7 : 5; const ng = g.createRadialGradient(px - r * .4, py - r * .4, 1, px, py, r); ng.addColorStop(0, n.fixed ? '#fecaca' : '#e2e8f0'); ng.addColorStop(.5, n.fixed ? '#dc2626' : '#64748b'); ng.addColorStop(1, n.fixed ? '#7f1d1d' : '#0f172a'); g.fillStyle = ng; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); } if (!sim && i === sel) { g.strokeStyle = '#facc15'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, 11, 0, 7); g.stroke(); } }
    if (!sim && sel != null && hover) { const A = nodes[sel]; const [ax, ay] = toS(A.x, A.y); const [hx, hy] = toS(...hover); const ok = Math.hypot(A.x - hover[0], A.y - hover[1]) <= MAT[mat]?.max; g.strokeStyle = ok ? 'rgba(34,197,94,.7)' : 'rgba(239,68,68,.7)'; g.lineWidth = 4; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(hx, hy); g.stroke(); g.setLineDash([]); }
    if (sim) { const c = sim.car; const [px, py] = toS(c.x, c.y); vehicle(px, py - 6, sim.truck); }
  }
  // مركبة مرسومة (سيارة أو شاحنة) بتظليل حجمي في الوضع المجسم
  function vehicle(x, y, truck) {
    const D3 = is3d(), body = (x0, y0, w, h, c1, c2) => { if (D3) { const q = g.createLinearGradient(0, y0, 0, y0 + h); q.addColorStop(0, c1); q.addColorStop(1, c2); return q; } return c1; };
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 6, truck ? 34 : 24, 4, 0, 0, 7); g.fill();
    if (truck) {
      g.fillStyle = body(-34, -30, 46, 28, '#f97316', '#c2410c'); g.beginPath(); g.roundRect(-34, -30, 46, 28, 3); g.fill();
      g.fillStyle = body(12, -22, 22, 20, '#3b82f6', '#1e3a8a'); g.beginPath(); g.roundRect(12, -22, 22, 20, [6, 6, 2, 2]); g.fill();
      g.fillStyle = '#bae6fd'; g.beginPath(); g.roundRect(20, -19, 11, 8, 2); g.fill();
      for (const wx of [-24, -10, 24]) { g.fillStyle = '#111827'; g.beginPath(); g.arc(wx, 0, 6, 0, 7); g.fill(); g.fillStyle = '#9ca3af'; g.beginPath(); g.arc(wx, 0, 2.5, 0, 7); g.fill(); }
    } else {
      g.fillStyle = body(-22, -14, 44, 13, '#ef4444', '#991b1b'); g.beginPath(); g.moveTo(-22, -2); g.lineTo(-22, -10); g.quadraticCurveTo(-20, -14, -14, -14); g.lineTo(-9, -14); g.lineTo(-3, -23); g.lineTo(11, -23); g.lineTo(17, -14); g.lineTo(20, -13); g.quadraticCurveTo(23, -11, 22, -2); g.closePath(); g.fill();
      g.fillStyle = '#bae6fd'; g.beginPath(); g.moveTo(-6, -14); g.lineTo(-1, -21); g.lineTo(4, -21); g.lineTo(4, -14); g.fill(); g.beginPath(); g.moveTo(6, -14); g.lineTo(6, -21); g.lineTo(10, -21); g.lineTo(14.5, -14); g.fill();
      if (D3) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-18, -12, 30, 2); }
      g.fillStyle = '#fde047'; g.fillRect(19, -10, 3, 3);
      for (const wx of [-13, 13]) { g.fillStyle = '#111827'; g.beginPath(); g.arc(wx, 0, 5.5, 0, 7); g.fill(); g.fillStyle = '#9ca3af'; g.beginPath(); g.arc(wx, 0, 2.2, 0, 7); g.fill(); }
    }
    g.restore();
  }
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 1000, (e.clientY - r.top) / r.height * 560]; };
  cv.addEventListener('click', (e) => clickAt(...pos(e)));
  cv.addEventListener('pointermove', (e) => { if (sim || sel == null) return; hover = toW(...pos(e)); draw(); });
  const panel = h('div', { class: 'br-panel' });
  function ui() {
    const L = LEVELS[li]; const c = cost();
    panel.innerHTML = '';
    panel.append(
      h('div', { class: 'br-levels' }, LEVELS.map((_, k) => h('button', { type: 'button', class: k === li ? 'on' : '', disabled: k > store.get('br-level', 0), onclick: () => { cancelAnimationFrame(raf); li = k; load(); draw(); ui(); } }, num(k + 1)))),
      h('div', { class: 'br-money' + (c > L.budget ? ' over' : '') }, t('br_cost'), ': ', num(c), ' / ', t('br_budget'), ': ', num(L.budget)),
      sim ? h('div', { class: 'br-row' }, h('button', { type: 'button', class: 'btn', onclick: () => { cancelAnimationFrame(raf); sim = null; result = null; draw(); ui(); } }, ico('undo-2', 16), t('br_edit')),
        result === 'win' && li + 1 < LEVELS.length ? h('button', { type: 'button', class: 'btn gk-go', onclick: () => { li++; load(); draw(); ui(); } }, t('br_next')) : null)
        : h('div', { class: 'br-row' },
          h('div', { class: 'br-mats' }, [...Object.entries(MAT).map(([k, m]) => [k, m.name, m.color, m.cost]), ['del', t('br_del'), '#ef4444']].map(([k, n, col, cst]) => h('button', { type: 'button', class: 'br-mat' + (mat === k ? ' on' : ''), onclick: () => { mat = k; sel = null; ui(); draw(); } }, h('i', { style: { background: col } }), h('span', {}, n), cst ? h('small', {}, num(cst), '/م') : null))),
          h('button', { type: 'button', class: 'btn gk-go', onclick: () => test(false) }, t('br_test')), h('button', { type: 'button', class: 'btn', onclick: () => test(true) }, t('br_truck')),
          h('button', { type: 'button', class: 'btn ghost', onclick: () => { const u = hist.pop(); if (u) { ({ nodes, beams } = JSON.parse(u)); saveD(); draw(); ui(); } } }, ico('undo-2', 15), t('br_undo')),
          h('button', { type: 'button', class: 'btn ghost', onclick: () => { hist.push(JSON.stringify({ nodes, beams })); beams = []; sel = null; prune(); saveD(); draw(); ui(); } }, t('br_clear'))),
      result === 'win' ? h('div', { class: 'ck-res ok' }, t('br_win')) : result === 'fail' ? h('div', { class: 'ck-res bad' }, t('br_fail')) : null,
      sim ? h('small', { class: 'muted' }, t('br_stress')) : h('small', { class: 'muted' }, t('br_help')),
      h('p', { class: 'br-tip' }, '🏗️ ', h('b', {}, t('br_tip'), ': '), L.tip));
  }
  view.append(h('div', { class: 'br-stage' }, cv), panel);
  load(); draw(); ui();
  return { unmount() { cancelAnimationFrame(raf); } };
}
