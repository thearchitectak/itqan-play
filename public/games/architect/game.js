// المعماري الصغير: قطعة أرض وميزانية؛ ارسم الجدران، وحدد الغرف والأبواب والنوافذ، واختر الأثاث والخامات، ثم شاهد بيتك ثلاثي الأبعاد.
import { h, t, addDict, sound, num, ico, store, toast, onSettings, is3d } from '../../assets/js/core.js';
addDict({
  ar: { ar_plan: 'المخطط', ar_3d: 'العرض ثلاثي الأبعاد', ar_wall: 'جدار', ar_door: 'باب', ar_window: 'نافذة', ar_erase: 'ممحاة', ar_rooms: 'الغرف (لوّن الأرضية)', ar_furn: 'الأثاث', ar_budget: 'الميزانية', ar_cost: 'التكلفة', ar_area: 'المساحة المبنية', ar_new: 'أرض جديدة',
    ar_help: 'الجدار: اضغط نقطة بداية ثم نقطة نهاية على الخط نفسه. الباب والنافذة: اضغط جدارًا موجودًا. الغرف: اختر نوعها ثم اضغط المربعات أو اسحب عليها.', ar_tips: 'ملاحظات المعماري', ar_m2: 'م²', ar_unit: 'كل مربع = 1 م × 1 م', ar_mat: 'خامة الجدران', ar_example: 'تصميم مثال', ar_drag: 'اسحب لتدوير المنظر، واستخدم العجلة أو إصبعين للتكبير' },
  en: { ar_plan: 'Plan', ar_3d: '3D view', ar_wall: 'Wall', ar_door: 'Door', ar_window: 'Window', ar_erase: 'Eraser', ar_rooms: 'Rooms (paint floor)', ar_furn: 'Furniture', ar_budget: 'Budget', ar_cost: 'Cost', ar_area: 'Built area', ar_new: 'New plot',
    ar_help: 'Wall: tap a start point then an end point on the same line. Door/window: tap an existing wall. Rooms: choose a type and tap or drag over squares.', ar_tips: "Architect's notes", ar_m2: 'm²', ar_unit: 'Each square = 1 m × 1 m', ar_mat: 'Wall material', ar_example: 'Example design', ar_drag: 'Drag to orbit, wheel or pinch to zoom' },
});
const ROOMS = { bed: ['🛏️ غرفة نوم', '#bfdbfe', 400], living: ['🛋️ معيشة', '#fde68a', 350], kitchen: ['🍳 مطبخ', '#fecaca', 500], bath: ['🛁 حمام', '#a5f3fc', 600], hall: ['🚶 ممر', '#e5e7eb', 250], garden: ['🌳 حديقة', '#86efac', 80], pool: ['🏊 مسبح', '#38bdf8', 900] };
const FURN = { bed: ['🛏️ سرير', 2, 2, 2500, '#60a5fa', .6], sofa: ['🛋️ كنبة', 2, 1, 2000, '#f472b6', .8], table: ['🍽️ طاولة', 1, 1, 800, '#a16207', .75], kitchen: ['🍳 مطبخ', 3, 1, 6000, '#f8fafc', .9], tub: ['🛁 حوض', 2, 1, 2500, '#e0f2fe', .6], wc: ['🚽 مرحاض', 1, 1, 900, '#ffffff', .5], desk: ['🖥️ مكتب', 2, 1, 1200, '#d6a76c', .75], tree: ['🌳 شجرة', 1, 1, 300, '#16a34a', 2.5], car: ['🚗 سيارة', 2, 4, 0, '#ef4444', 1.4] };
const MATS = { paint: ['دهان أبيض', '#f8fafc', 600], brick: ['طوب أحمر', '#b45309', 800], stone: ['حجر', '#d6d3d1', 1100], wood: ['خشب', '#a16207', 900] };
const PW = 16, PH = 12, BUDGET = 250000;
const EX = () => { // تصميم مثال صغير
  const e = {}; const wl = (x1, y1, x2, y2) => { if (y1 === y2) for (let x = Math.min(x1, x2); x < Math.max(x1, x2); x++) e['h:' + x + ',' + y1] = 'wall'; else for (let y = Math.min(y1, y2); y < Math.max(y1, y2); y++) e['v:' + x1 + ',' + y] = 'wall'; };
  wl(2, 2, 12, 2); wl(2, 9, 12, 9); wl(2, 2, 2, 9); wl(12, 2, 12, 9); wl(7, 2, 7, 9); wl(2, 6, 7, 6); wl(9, 2, 9, 6); wl(7, 6, 12, 6);
  e['h:4,9'] = 'door'; e['v:7,4'] = 'door'; e['h:4,6'] = 'door'; e['h:10,6'] = 'door'; e['v:9,3'] = 'door'; e['h:3,2'] = 'window'; e['h:5,2'] = 'window'; e['v:2,7'] = 'window'; e['h:10,9'] = 'window'; e['v:12,4'] = 'window'; e['h:8,2'] = 'window';
  const rooms = {}; const paint = (x0, y0, x1, y1, r) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) rooms[x + ',' + y] = r; };
  paint(2, 2, 7, 6, 'bed'); paint(2, 6, 7, 9, 'living'); paint(7, 2, 9, 6, 'bath'); paint(9, 2, 12, 6, 'kitchen'); paint(7, 6, 12, 9, 'living'); paint(13, 1, 16, 11, 'garden'); paint(0, 10, 12, 12, 'garden');
  return { edges: e, rooms, furn: [{ k: 'bed', x: 3, y: 3 }, { k: 'sofa', x: 3, y: 7 }, { k: 'table', x: 9, y: 7 }, { k: 'kitchen', x: 9, y: 2 }, { k: 'tub', x: 7, y: 2 }, { k: 'wc', x: 7, y: 5 }, { k: 'tree', x: 14, y: 3 }, { k: 'tree', x: 14, y: 8 }, { k: 'car', x: 13, y: 6 }], mat: 'brick' };
};
export async function mount(root) {
  if (!document.getElementById('ar-css')) document.head.append(h('link', { id: 'ar-css', rel: 'stylesheet', href: new URL('./architect.css', import.meta.url).href }));
  const view = h('div', { class: 'ar' }); root.append(view);
  let D = store.get('arch', null) || EX(), tool = 'wall', roomT = 'bed', furnT = 'bed', start = null, mode = 'plan', three = null, painting = false;
  const save = () => store.set('arch', D);
  const cost = () => {
    let c = 0; for (const [k, v] of Object.entries(D.edges)) c += v === 'wall' ? MATS[D.mat][2] : v === 'door' ? 1500 : 1000;
    for (const r of Object.values(D.rooms)) c += ROOMS[r][2] * 1; for (const f of D.furn) c += FURN[f.k][3]; return c;
  };
  const areaBy = () => { const a = {}; for (const r of Object.values(D.rooms)) a[r] = (a[r] || 0) + 1; return a; };
  function tips() {
    const a = areaBy(); const out = [];
    if (!a.bed) out.push('أضف غرفة نوم واحدة على الأقل.'); else if (a.bed < 9) out.push('غرفة النوم تحتاج 9 م² على الأقل لتكون مريحة.');
    if (!a.bath) out.push('لا تنسَ الحمام! يحتاج نحو 4 م² على الأقل.');
    if (!a.kitchen) out.push('أضف مطبخًا، ويفضل أن يكون قريبًا من غرفة المعيشة.');
    if (!Object.values(D.edges).includes('door')) out.push('البيت بلا أبواب! أضف بابًا للمدخل وأبوابًا للغرف.');
    if (Object.values(D.edges).filter(v => v === 'window').length < 2) out.push('النوافذ تدخل الضوء والهواء؛ أضف نافذة لكل غرفة.');
    if (cost() > BUDGET) out.push('تجاوزت الميزانية! قلّل المساحات أو اختر خامات أرخص.');
    if (!out.length) out.push('تصميم متوازن! جرّب العرض ثلاثي الأبعاد 👀');
    return out;
  }
  function edgeAt(px, py) { // أقرب حافة لنقطة النقر داخل المخطط (بوحدات المربعات)
    const fx = px - Math.floor(px), fy = py - Math.floor(py); const x = Math.floor(px), y = Math.floor(py);
    const d = [[fy, 'h:' + x + ',' + y], [1 - fy, 'h:' + x + ',' + (y + 1)], [fx, 'v:' + x + ',' + y], [1 - fx, 'v:' + (x + 1) + ',' + y]].sort((a, b) => a[0] - b[0])[0];
    return d[0] < .3 ? d[1] : null;
  }
  function onPlan(e, kind) {
    const svg = e.currentTarget; const r = svg.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width * PW, py = (e.clientY - r.top) / r.height * PH;
    if (tool === 'wall') { if (kind !== 'down') return; const gx = Math.round(px), gy = Math.round(py); if (!start) { start = [gx, gy]; drawPlan(); return; }
      const [sx, sy] = start; if (sx === gx && sy === gy) { start = null; drawPlan(); return; }
      if (sx !== gx && sy !== gy) { toast('الجدار يجب أن يكون أفقيًا أو رأسيًا', true); return; }
      if (sy === gy) for (let x = Math.min(sx, gx); x < Math.max(sx, gx); x++) D.edges['h:' + x + ',' + sy] = 'wall'; else for (let y = Math.min(sy, gy); y < Math.max(sy, gy); y++) D.edges['v:' + sx + ',' + y] = 'wall';
      start = [gx, gy]; sound('place'); save(); drawPlan(); return; }
    if (tool === 'door' || tool === 'window') { if (kind !== 'down') return; const k = edgeAt(px, py); if (k && D.edges[k]) { D.edges[k] = D.edges[k] === tool ? 'wall' : tool; sound('place'); save(); drawPlan(); } return; }
    const cx = Math.floor(px), cy = Math.floor(py); if (cx < 0 || cy < 0 || cx >= PW || cy >= PH) return;
    if (tool === 'room') { if (kind === 'down') painting = true; if (!painting) return; if (D.rooms[cx + ',' + cy] !== roomT) { D.rooms[cx + ',' + cy] = roomT; save(); drawPlan(); } return; }
    if (kind !== 'down') return;
    if (tool === 'furn') { const [, w, hh] = FURN[furnT]; if (cx + w > PW || cy + hh > PH) return; D.furn.push({ k: furnT, x: cx, y: cy }); sound('place'); save(); drawPlan(); return; }
    if (tool === 'erase') { const k = edgeAt(px, py); const fi = D.furn.findIndex(f => cx >= f.x && cx < f.x + FURN[f.k][1] && cy >= f.y && cy < f.y + FURN[f.k][2]);
      if (k && D.edges[k]) delete D.edges[k]; else if (fi >= 0) D.furn.splice(fi, 1); else delete D.rooms[cx + ',' + cy]; sound('capture'); save(); drawPlan(); }
  }
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); p?.append(e); return e; };
  let planBox;
  function drawPlan() {
    if (!planBox) return; planBox.innerHTML = '';
    const svg = sv('svg', { viewBox: `-0.3 -0.3 ${PW + .6} ${PH + .6}`, class: 'ar-svg' });
    sv('rect', { x: 0, y: 0, width: PW, height: PH, fill: '#ecfccb' }, svg);
    for (const [k, r] of Object.entries(D.rooms)) { const [x, y] = k.split(',').map(Number); sv('rect', { x, y, width: 1, height: 1, fill: ROOMS[r][1] }, svg); }
    for (let x = 0; x <= PW; x++) sv('line', { x1: x, y1: 0, x2: x, y2: PH, stroke: 'rgba(0,0,0,.08)', 'stroke-width': .02 }, svg);
    for (let y = 0; y <= PH; y++) sv('line', { x1: 0, y1: y, x2: PW, y2: y, stroke: 'rgba(0,0,0,.08)', 'stroke-width': .02 }, svg);
    for (const f of D.furn) { const [n, w, hh, , col] = FURN[f.k]; sv('rect', { x: f.x + .08, y: f.y + .08, width: w - .16, height: hh - .16, rx: .15, fill: col, stroke: '#334155', 'stroke-width': .04, opacity: .9 }, svg); const tx = sv('text', { x: f.x + w / 2, y: f.y + hh / 2 + .22, 'text-anchor': 'middle', 'font-size': .6 }, svg); tx.textContent = n.split(' ')[0]; }
    for (const [k, v] of Object.entries(D.edges)) { const [d, rest] = k.split(':'); const [x, y] = rest.split(',').map(Number); const x2 = d === 'h' ? x + 1 : x, y2 = d === 'h' ? y : y + 1;
      if (v === 'wall') sv('line', { x1: x, y1: y, x2, y2, stroke: MATS[D.mat][1] === '#f8fafc' ? '#475569' : MATS[D.mat][1], 'stroke-width': .2, 'stroke-linecap': 'square' }, svg);
      if (v === 'window') { sv('line', { x1: x, y1: y, x2, y2, stroke: '#475569', 'stroke-width': .2 }, svg); sv('line', { x1: x, y1: y, x2, y2, stroke: '#7dd3fc', 'stroke-width': .1 }, svg); }
      if (v === 'door') { sv('path', { d: d === 'h' ? `M${x + 1},${y} A1,1 0 0 0 ${x},${y - 1}` : `M${x + 1},${y} A1,1 0 0 1 ${x},${y + 1}`, fill: 'none', stroke: '#a16207', 'stroke-width': .05, 'stroke-dasharray': '.1 .08' }, svg); sv('line', { x1: x, y1: y, x2: d === 'h' ? x : x + 1, y2: d === 'h' ? y - 1 : y, stroke: '#a16207', 'stroke-width': .08 }, svg); } }
    if (start) sv('circle', { cx: start[0], cy: start[1], r: .22, fill: '#ef4444' }, svg);
    for (let x = 0; x <= PW; x++) for (let y = 0; y <= PH; y++) if (tool === 'wall') sv('circle', { cx: x, cy: y, r: .06, fill: '#64748b' }, svg);
    svg.addEventListener('pointerdown', (e) => onPlan(e, 'down')); svg.addEventListener('pointermove', (e) => onPlan(e, 'move')); svg.addEventListener('pointerup', () => painting = false); svg.addEventListener('pointerleave', () => painting = false);
    planBox.append(svg);
    renderSide();
  }
  let side;
  function renderSide() {
    if (!side) return; const c = cost(), a = areaBy(); side.innerHTML = '';
    const built = Object.entries(a).filter(([k]) => k !== 'garden' && k !== 'pool').reduce((s, [, v]) => s + v, 0);
    side.append(
      h('div', { class: 'ar-money' + (c > BUDGET ? ' over' : '') }, '💰 ', t('ar_cost'), ': ', num(c.toLocaleString('en')), ' / ', num(BUDGET.toLocaleString('en'))), h('div', { class: 'ar-bar' }, h('i', { style: { width: Math.min(100, c / BUDGET * 100) + '%', background: c > BUDGET ? '#ef4444' : '#22c55e' } })),
      h('div', { class: 'ar-areas' }, h('b', {}, '📐 ', t('ar_area'), ': ', num(built), ' ', t('ar_m2')), Object.entries(a).map(([k, v]) => h('span', { style: { background: ROOMS[k][1] } }, ROOMS[k][0], ' ', num(v), ' ', t('ar_m2')))),
      h('div', { class: 'ct-goals' }, h('b', {}, '📝 ', t('ar_tips')), tips().map(x => h('div', {}, '• ', x))));
  }
  async function draw3d(box) {
    const THREE = await import('../../vendor/three/three.module.min.js'); const { OrbitControls } = await import('../../vendor/three/OrbitControls.js');
    const w = box.clientWidth || 800, hh = Math.max(380, Math.min(620, w * .62));
    // خامات مرسومة على لوحات: عشب، وخشب، وبلاط، وجص، وسماء متدرجة
    const tex = (kind, col, rep = 1) => {
      const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = col; g.fillRect(0, 0, 256, 256);
      const rnd = (a) => Math.random() * a;
      if (kind === 'grass') for (let i = 0; i < 5000; i++) { g.fillStyle = `hsla(${90 + rnd(30)},${35 + rnd(20)}%,${32 + rnd(18)}%,.22)`; g.fillRect(rnd(256), rnd(256), 1.2, 2 + rnd(3)); }
      if (kind === 'wood') { for (let y = 0; y < 256; y += 32) { g.fillStyle = `rgba(0,0,0,${.04 + rnd(.06)})`; g.fillRect(0, y, 256, 32); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, 256, 1.5); g.fillRect(rnd(256), y, 1.5, 32); } for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(90,50,20,${.05 + rnd(.1)})`; g.beginPath(); const y = rnd(256); g.moveTo(0, y); g.bezierCurveTo(80, y + rnd(4) - 2, 170, y + rnd(4) - 2, 256, y); g.stroke(); } }
      if (kind === 'tile') { for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { g.fillStyle = `rgba(255,255,255,${rnd(.12)})`; g.fillRect(x, y, 64, 64); } g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2; for (let k = 0; k <= 256; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 256); g.moveTo(0, k); g.lineTo(256, k); g.stroke(); } }
      if (kind === 'plaster') for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${rnd(1) > .5 ? '255,255,255' : '0,0,0'},${rnd(.05)})`; g.fillRect(rnd(256), rnd(256), 2, 2); }
      if (kind === 'water') { for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.beginPath(); const y = rnd(256); g.moveTo(0, y); for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x / 20 + i) * 3); g.stroke(); } }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
    };
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setSize(w, hh); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    box.append(renderer.domElement);
    const scene = new THREE.Scene(); { const c = document.createElement('canvas'); c.width = 2; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3b82f6'); gr.addColorStop(.55, '#93c5fd'); gr.addColorStop(1, '#e0f2fe'); g.fillStyle = gr; g.fillRect(0, 0, 2, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; } scene.fog = new THREE.Fog('#dbeafe', 45, 95);
    const cam = new THREE.PerspectiveCamera(45, w / hh, .1, 200); cam.position.set(PW / 2 + 12, 18, PH + 14);
    const ctl = new OrbitControls(cam, renderer.domElement); ctl.target.set(PW / 2, 0, PH / 2); ctl.maxPolarAngle = Math.PI / 2.1; ctl.enableDamping = true;
    scene.add(new THREE.HemisphereLight('#ffffff', '#a3e635', 1.1));
    const sun = new THREE.DirectionalLight('#fff7ed', 1.6); sun.position.set(20, 30, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); sun.target.position.set(PW / 2, 0, PH / 2); scene.add(sun, sun.target);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: tex('grass', '#6a9a45', 30), roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.set(PW / 2, -.02, PH / 2); ground.receiveShadow = true; scene.add(ground);
    const box3 = (wx, hy, dz, color, x, y, z, opts = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wx, hy, dz), new THREE.MeshStandardMaterial({ color: opts.map ? '#ffffff' : color, map: opts.map || null, roughness: opts.glass ? .05 : .8, metalness: opts.glass ? .1 : 0, transparent: !!opts.op, opacity: opts.op || 1 })); m.position.set(x, y, z); m.castShadow = !opts.op; m.receiveShadow = true; scene.add(m); return m; };
    const FT = { bed: tex('wood', '#c49a6c'), living: tex('wood', '#d4a373'), kitchen: tex('tile', '#f1f5f9'), bath: tex('tile', '#cffafe'), hall: tex('tile', '#e7e5e4'), garden: tex('grass', '#4d9a3a'), pool: tex('water', '#0ea5e9') };
    for (const [k, r] of Object.entries(D.rooms)) { const [x, y] = k.split(',').map(Number); box3(1, r === 'pool' ? .02 : .06, 1, ROOMS[r][1], x + .5, r === 'pool' ? -.01 : .03, y + .5, { map: FT[r] }); }
    const WT = { paint: tex('plaster', '#f8fafc'), brick: (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#d6d3d1'; g.fillRect(0, 0, 128, 128); for (let r = 0; r < 8; r++) for (let q = -1; q < 4; q++) { g.fillStyle = `hsl(${12 + Math.random() * 10},${45 + Math.random() * 15}%,${32 + Math.random() * 12}%)`; g.fillRect(q * 40 + (r % 2) * 20 + 2, r * 16 + 2, 36, 12); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })(), stone: tex('tile', '#d6d3d1'), wood: tex('wood', '#a16207') };
    const WH = 2.8, T = .15, wcol = MATS[D.mat][1];
    for (const [k, v] of Object.entries(D.edges)) { const [d, rest] = k.split(':'); const [x, y] = rest.split(',').map(Number); const cx = d === 'h' ? x + .5 : x, cz = d === 'h' ? y : y + .5; const sx = d === 'h' ? 1 + T : T, sz = d === 'h' ? T : 1 + T;
      if (v === 'wall') box3(sx, WH, sz, wcol, cx, WH / 2, cz, { map: WT[D.mat] });
      if (v === 'door') { box3(sx, WH - 2.1, sz, wcol, cx, 2.1 + (WH - 2.1) / 2, cz); box3(d === 'h' ? .9 : .05, 2.05, d === 'h' ? .05 : .9, '#92400e', cx, 1.03, cz); }
      if (v === 'window') { box3(sx, .9, sz, wcol, cx, .45, cz); box3(sx, WH - 2.1, sz, wcol, cx, 2.1 + (WH - 2.1) / 2, cz); box3(d === 'h' ? 1 : .04, 1.2, d === 'h' ? .04 : 1, '#7dd3fc', cx, 1.5, cz, { op: .45, glass: true }); } }
    for (const f of D.furn) { const [, w2, h2, , col, ht] = FURN[f.k]; if (f.k === 'tree') { box3(.25, 1.2, .25, '#78350f', f.x + .5, .6, f.y + .5); const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.85, 2), new THREE.MeshStandardMaterial({ color: '#2f8f3a', roughness: .9, flatShading: true })); s.position.set(f.x + .5, 1.8, f.y + .5); s.castShadow = true; scene.add(s); continue; }
      box3(w2 - .2, ht, h2 - .2, col, f.x + w2 / 2, ht / 2 + .06, f.y + h2 / 2); }
    let raf; const loop = () => { raf = requestAnimationFrame(loop); ctl.update(); renderer.render(scene, cam); }; loop();
    three = { stop() { cancelAnimationFrame(raf); renderer.dispose(); } };
  }
  function draw() {
    three?.stop(); three = null; view.innerHTML = '';
    const top = h('div', { class: 'ar-top' }, h('div', { class: 'seg' }, [['plan', '📐 ' + t('ar_plan')], ['3d', '🏠 ' + t('ar_3d')]].map(([k, l]) => h('button', { type: 'button', class: mode === k ? 'on' : '', onclick: () => { mode = k; draw(); } }, l))),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { D = { edges: {}, rooms: {}, furn: [], mat: D.mat }; save(); draw(); } }, t('ar_new')), h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { D = EX(); save(); draw(); } }, t('ar_example')));
    side = h('div', { class: 'ar-side' });
    if (mode === '3d') { const box = h('div', { class: 'ar-3d' }); view.append(top, box, h('small', { class: 'muted' }, t('ar_drag')), side); renderSide(); draw3d(box).catch(e => box.append(h('p', {}, String(e)))); return; }
    planBox = h('div', { class: 'ar-plan' });
    const tools = h('div', { class: 'ar-tools' },
      h('div', { class: 'seg' }, [['wall', '🧱 ' + t('ar_wall')], ['door', '🚪 ' + t('ar_door')], ['window', '🪟 ' + t('ar_window')], ['room', '🎨 ' + t('ar_rooms')], ['furn', '🛋️ ' + t('ar_furn')], ['erase', '🧽 ' + t('ar_erase')]].map(([k, l]) => h('button', { type: 'button', class: tool === k ? 'on' : '', onclick: () => { tool = k; start = null; draw(); } }, l))),
      tool === 'room' ? h('div', { class: 'ar-chips' }, Object.entries(ROOMS).map(([k, [n, col, pr]]) => h('button', { type: 'button', class: roomT === k ? 'on' : '', style: { background: col }, onclick: () => { roomT = k; draw(); } }, n, h('small', {}, ' ', num(pr), '/م²')))) : null,
      tool === 'furn' ? h('div', { class: 'ar-chips' }, Object.entries(FURN).map(([k, [n, w, hh, pr]]) => h('button', { type: 'button', class: furnT === k ? 'on' : '', onclick: () => { furnT = k; draw(); } }, n, h('small', {}, ' ', num(w), '×', num(hh), ' · ', num(pr))))) : null,
      tool === 'wall' ? h('div', { class: 'ar-chips' }, h('b', {}, t('ar_mat'), ': '), Object.entries(MATS).map(([k, [n, col, pr]]) => h('button', { type: 'button', class: D.mat === k ? 'on' : '', onclick: () => { D.mat = k; save(); draw(); } }, h('i', { style: { background: col } }), n, h('small', {}, ' ', num(pr), '/م')))) : null);
    view.append(top, tools, h('div', { class: 'ar-main' }, h('div', {}, planBox, h('small', { class: 'muted' }, t('ar_unit'), ' — ', t('ar_help'))), side));
    drawPlan();
  }
  const offV = onSettings((k) => { if (k === 'view' && view.isConnected) { mode = is3d() ? '3d' : 'plan'; draw(); } });
  draw();
  return { unmount() { three?.stop(); offV(); }, onLang() { draw(); } };
}
