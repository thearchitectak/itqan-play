// عدّاء الطاقة: جري لا ينتهي في ثلاثة مسارات بمنظور ثلاثي الأبعاد. اقفز وانزلق وغيّر المسار، واجمع قوارير الماء والفواكه، وتجنب الحواجز.
// الشخصية والرسوم أصلية بالكامل.
import { h, t, addDict, sound, num, store, is3d } from '../../assets/js/core.js';
import { joystick, holdBtn } from '../../assets/js/vpad.js';
addDict({
  ar: { rn_start: 'ابدأ الجري', rn_over: 'اصطدمت! المسافة {d} م', rn_best: 'أفضل مسافة: {d} م', rn_again: 'جرّب مرة أخرى', rn_help: 'الأسهم يمينًا ويسارًا لتغيير المسار، والسهم الأعلى للقفز فوق البراميل المتدحرجة، والسهم الأسفل للهبوط السريع. وعلى الهاتف: عصا التحكم يمينًا وزر القفز يسارًا. تجنّب أكوام البراميل والصخور المتدحرجة نحوك.', rn_tip: 'معلومة صحية' },
  en: { rn_start: 'Start running', rn_over: 'Crash! Distance {d} m', rn_best: 'Best: {d} m', rn_again: 'Try again', rn_help: 'Left/right to switch lanes, up to jump rolling barrels, down to dive. Phone: joystick right, jump left. Avoid barrel stacks and rolling boulders.', rn_tip: 'Health tip' },
});
const TIPS = ['اشرب الماء بانتظام، فهو أفضل مشروب لجسمك.', 'الفواكه والخضار تمدّك بالفيتامينات والطاقة.', 'المشروبات الغازية تحتوي على سكر كثير، فقلّل منها.', 'الجري 30 دقيقة يوميًّا يقوّي القلب.', 'النوم الكافي يساعد عقلك على التركيز والتعلّم.'];
export async function mount(root) {
  if (!document.getElementById('jp-css')) document.head.append(h('link', { id: 'jp-css', rel: 'stylesheet', href: new URL('../jumper/jumper.css', import.meta.url).href }));
  if (!document.getElementById('rn-css')) document.head.append(h('link', { id: 'rn-css', rel: 'stylesheet', href: new URL('./runner.css', import.meta.url).href }));
  const view = h('div', { class: 'rn' }); root.append(view);
  const W = 900, H = 560; const cv = h('canvas', { class: 'rn-cv', width: W, height: H }); const g = cv.getContext('2d');
  let S = null, raf = 0, best = store.get('rn-best', 0), state = 'menu';
  const HZ = 170, VPX = W / 2; // خط الأفق ونقطة التلاشي
  function start() { S = { z: 0, speed: 10, lane: 1, lx: 1, y: 0, vy: 0, slide: 0, objs: [], next: 120, score: 0, items: 0, t: 0, dead: false }; state = 'play'; ui(); }
  // إسقاط نقطة من العالم (x مسار، z عمق، y ارتفاع) إلى الشاشة
  const proj = (x, z, y = 0) => { const d = z - S.z + 40; const sc = 260 / (d + 260 / 1.0); return { sx: VPX + x * 230 * sc, sy: HZ + (H - HZ) * sc * 1.05 - y * 260 * sc, sc }; };
  function spawn() {
    const z = S.z + 420 + Math.random() * 60;
    const kind = Math.random();
    const lanes = [0, 1, 2].sort(() => Math.random() - .5);
    // براميل أفقية تتدحرج نحو البطل (فكرة ببسي مان): اقفز فوقها أو غيّر المسار
    if (kind < .55) { S.objs.push({ t: 'bar', lane: lanes[0], z: z + 60 }); if (Math.random() < .45) S.objs.push({ t: 'bar', lane: lanes[1], z: z + 60 + Math.random() * 20 }); }
    else if (kind < .66) S.objs.push({ t: 'ball', lane: lanes[0], z: z + 80 }); // صخرة تتدحرج نحوك: غيّر المسار
    else { const ln = lanes[0]; for (let k = 0; k < 5; k++) S.objs.push({ t: Math.random() < .25 ? 'fruit' : 'water', lane: ln, z: z + k * 18 }); }
    S.next = S.z + 60 + Math.random() * 50 - Math.min(30, S.speed);
  }
  function update() {
    if (state !== 'play') return;
    S.t++; S.speed = Math.min(28, 10 + S.z / 1000); S.z += S.speed * .28; S.score = Math.floor(S.z / 4);
    S.lx += (S.lane - S.lx) * .25;
    if (S.y > 0 || S.vy) { S.vy -= .055; S.y += S.vy; if (S.y <= 0) { S.y = 0; S.vy = 0; } }
    if (S.slide > 0) S.slide--;
    if (S.z > S.next) spawn();
    for (const o of S.objs) if (o.t === 'ball') { o.z -= S.speed * .09; o.rot = (o.rot || 0) + .12; } else if (o.t === 'bar') { o.z -= S.speed * .07; o.rot = (o.rot || 0) + .16; }
    for (const o of S.objs) {
      if (o.done) continue; const d = o.z - S.z;
      if (d < 6 && d > -4 && Math.abs(o.lane - S.lx) < .5) {
        if (o.t === 'water' || o.t === 'fruit') { o.done = true; S.items++; S.score += o.t === 'fruit' ? 50 : 20; sound('place'); }
        else if (o.t === 'block' || (o.t === 'bar' && S.y < .35) || (o.t === 'ball' && S.y < 2.5)) { state = 'over'; sound('lose'); best = Math.max(best, Math.floor(S.z / 4)); store.set('rn-best', best); ui(); }
        else if (!o.passed) { o.passed = true; S.score += 25; sound('move'); }
      }
    }
    S.objs = S.objs.filter(o => o.z - S.z > -20);
  }
  function drawRunner() {
    const p = proj((S.lx - 1), S.z, S.y); const sc = p.sc * 1.25; const ph = S.t * .35 * (S.speed / 14), D3 = is3d();
    g.save(); g.translate(p.sx, p.sy); g.scale(sc, sc);
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, S.y * 120, 36, 10, 0, 0, 7); g.fill();
    const lin = (x0, y0, x1, y1, stops) => { if (!D3) return stops[1]; const q = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => q.addColorStop(i / (stops.length - 1), c)); return q; };
    const leg = Math.sin(ph) * 16, arm = Math.sin(ph) * .5;
    // البطل منتصب يجري: ساقان كاملتان بركبتين، وعباءة قصيرة حتى الخصر
    const Y = -18; // رفع الجسم كله
    const fl = Math.sin(S.t * .3) * 6;
    g.fillStyle = lin(-30, -150, 30, -60, ['#b91c1c', '#dc2626', '#7f1d1d']); g.beginPath(); g.moveTo(-24, -138 + Y); g.quadraticCurveTo(-36 + fl, -100 + Y, -30 - fl, -66 + Y); g.quadraticCurveTo(0, -58 + Y + fl * .3, 30 + fl, -66 + Y); g.quadraticCurveTo(36 - fl, -100 + Y, 24, -138 + Y); g.fill();
    const legDraw = (sx, ph2) => { const hip = [sx, -66 + Y], kneeOff = Math.sin(ph2) * 14, lift = Math.max(0, Math.cos(ph2)) * 12;
      const knee = [sx + kneeOff * .5, -36 + Y - lift * .5], foot = [sx + kneeOff * .2, -4 + Y * .2 - lift];
      g.lineCap = 'round'; g.strokeStyle = lin(-12, 0, 12, 0, ['#60a5fa', '#1d4ed8', '#1e3a8a']); g.lineWidth = 15; g.beginPath(); g.moveTo(...hip); g.lineTo(...knee); g.stroke(); g.lineWidth = 12; g.beginPath(); g.moveTo(...knee); g.lineTo(foot[0], foot[1] - 10); g.stroke();
      g.fillStyle = lin(0, foot[1] - 18, 0, foot[1], ['#f87171', '#dc2626', '#7f1d1d']); g.beginPath(); g.roundRect(foot[0] - 8, foot[1] - 20, 16, 22, [5, 5, 3, 3]); g.fill(); g.fillStyle = '#450a0a'; g.fillRect(foot[0] - 8, foot[1] - 1, 16, 3); };
    legDraw(-9, ph); legDraw(9, ph + Math.PI);
    // الحزام والجذع العضلي
    g.fillStyle = lin(-24, 0, 24, 0, ['#60a5fa', '#2563eb', '#1e3a8a']); g.beginPath(); g.moveTo(-25, -136 + Y); g.quadraticCurveTo(0, -144 + Y, 25, -136 + Y); g.lineTo(19, -72 + Y); g.quadraticCurveTo(0, -66 + Y, -19, -72 + Y); g.closePath(); g.fill();
    g.fillStyle = lin(0, -76 + Y, 0, -64 + Y, ['#fde047', '#eab308', '#a16207']); g.fillRect(-20, -76 + Y, 40, 9); g.fillStyle = '#facc15'; g.fillRect(-5, -75.5 + Y, 10, 8);
    // الشعار على الظهر والصدر
    g.fillStyle = lin(0, -128 + Y, 0, -102 + Y, ['#fef08a', '#facc15', '#ca8a04']); g.beginPath(); g.moveTo(0, -130 + Y); g.lineTo(14, -120 + Y); g.lineTo(8, -102 + Y); g.lineTo(-8, -102 + Y); g.lineTo(-14, -120 + Y); g.closePath(); g.fill();
    g.fillStyle = '#b91c1c'; g.beginPath(); g.moveTo(3, -126 + Y); g.lineTo(-4, -116 + Y); g.lineTo(1, -116 + Y); g.lineTo(-3, -106 + Y); g.lineTo(6, -119 + Y); g.lineTo(1, -119 + Y); g.closePath(); g.fill();
    if (D3) { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-12, -126 + Y, 6, 4, -.4, 0, 7); g.fill(); }
    // الذراعان تتأرجحان بالتناوب مع الساقين
    for (const [sx, a] of [[-1, arm], [1, -arm]]) { g.save(); g.translate(sx * 23, -132 + Y); g.rotate(sx * .18 + a * .9); g.strokeStyle = lin(-8, 0, 8, 0, ['#60a5fa', '#2563eb', '#1e3a8a']); g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(sx * 3, 22); g.lineTo(sx * 2 - a * 8, 40); g.stroke(); g.fillStyle = lin(0, 36, 0, 50, ['#f87171', '#dc2626', '#7f1d1d']); g.beginPath(); g.arc(sx * 2 - a * 8, 44, 7.5, 0, 7); g.fill(); g.restore(); }
    // الرقبة والرأس والقناع
    g.fillStyle = lin(-6, 0, 6, 0, ['#f5c27d', '#e0a865', '#b07a45']); g.fillRect(-6, -150 + Y, 12, 12);
    g.fillStyle = lin(-16, -178 + Y, 16, -140 + Y, ['#fde68a', '#f5c27d', '#c68642']); g.beginPath(); g.ellipse(0, -160 + Y, 15, 17, 0, 0, 7); g.fill();
    g.fillStyle = '#111827'; g.beginPath(); g.ellipse(0, -165 + Y, 16, 14, 0, Math.PI, 0); g.fill(); g.beginPath(); g.moveTo(-16, -165 + Y); g.quadraticCurveTo(0, -150 + Y, 16, -165 + Y); g.quadraticCurveTo(0, -157 + Y, -16, -165 + Y); g.fill();
    g.fillStyle = '#1e3a8a'; g.beginPath(); g.roundRect(-15, -163 + Y, 30, 8, 4); g.fill();
    if (D3) { g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-6, -171 + Y, 5, 2.6, -.4, 0, 7); g.fill(); }
    g.restore();
  }
  function drawObj(o) {
    const d = o.z - S.z; if (d < -38 || d > 480) return;
    const p = proj(o.lane - 1, o.z); const s = p.sc;
    const barrel = (cx, by, w, hh, lying) => { // برميل معدني بأطواق وتظليل أسطواني
      const bg = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); bg.addColorStop(0, '#7f1d1d'); bg.addColorStop(.3, '#ef4444'); bg.addColorStop(.55, '#fca5a5'); bg.addColorStop(.75, '#dc2626'); bg.addColorStop(1, '#450a0a');
      if (lying) { const lg = g.createLinearGradient(0, by - hh, 0, by); lg.addColorStop(0, '#fca5a5'); lg.addColorStop(.35, '#ef4444'); lg.addColorStop(1, '#450a0a'); g.fillStyle = lg; g.beginPath(); g.roundRect(cx - w / 2, by - hh, w, hh, hh * .45); g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = Math.max(1, hh * .08); for (const k of [-.3, 0, .3]) { const xx = cx + k * w + Math.sin((o.rot || 0)) * 3; g.beginPath(); g.moveTo(xx, by - hh); g.lineTo(xx, by); g.stroke(); } g.fillStyle = '#fbbf24'; g.font = `900 ${Math.max(8, hh * .55)}px system-ui`; g.textAlign = 'center'; g.fillText('⚠', cx, by - hh * .25); return; }
      g.fillStyle = bg; g.beginPath(); g.roundRect(cx - w / 2, by - hh, w, hh, w * .12); g.fill();
      g.fillStyle = '#fecaca'; g.beginPath(); g.ellipse(cx, by - hh, w / 2, w * .12, 0, 0, 7); g.fill(); g.fillStyle = '#991b1b'; g.beginPath(); g.ellipse(cx, by - hh, w * .38, w * .08, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = Math.max(1, w * .05); for (const k of [.25, .75]) { g.beginPath(); g.ellipse(cx, by - hh * k, w / 2, w * .1, 0, 0, Math.PI); g.stroke(); }
      g.fillStyle = '#facc15'; g.beginPath(); g.moveTo(cx, by - hh * .62); g.lineTo(cx + w * .16, by - hh * .38); g.lineTo(cx - w * .16, by - hh * .38); g.fill();
    };
    if (o.t === 'block') { const w = 70 * s, hh = 95 * s; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(p.sx, p.sy, 80 * s, 12 * s, 0, 0, 7); g.fill(); barrel(p.sx - 38 * s, p.sy, w, hh); barrel(p.sx + 38 * s, p.sy, w, hh); barrel(p.sx, p.sy - hh * .92, w, hh); }
    if (o.t === 'bar') { const w = 150 * s, hh = 52 * s; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(p.sx, p.sy, w * .55, 9 * s, 0, 0, 7); g.fill(); barrel(p.sx, p.sy, w, hh, true); }
    if (o.t === 'ball') { const r = 62 * s, cy = p.sy - r; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(p.sx, p.sy, r * 1.05, r * .22, 0, 0, 7); g.fill();
      const bg = g.createRadialGradient(p.sx - r * .4, cy - r * .45, r * .1, p.sx, cy, r * 1.1); bg.addColorStop(0, '#d6d3d1'); bg.addColorStop(.5, '#78716c'); bg.addColorStop(1, '#292524'); g.fillStyle = bg; g.beginPath(); g.arc(p.sx, cy, r, 0, 7); g.fill();
      g.save(); g.translate(p.sx, cy); g.rotate(o.rot || 0); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(1, r * .07); for (const a of [0, 2.1, 4.2]) { g.beginPath(); g.arc(Math.cos(a) * r * .45, Math.sin(a) * r * .45, r * .25, 0, 4); g.stroke(); } g.restore();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(p.sx - r * .35, cy - r * .4, r * .25, r * .14, -.6, 0, 7); g.fill(); }
    if (o.t === 'water') { const hh = 52 * s, w = 22 * s, y = p.sy - 40 * s + Math.sin(S.t * .1 + o.z) * 6 * s; if (is3d()) { const wg = g.createLinearGradient(p.sx - w / 2, 0, p.sx + w / 2, 0); wg.addColorStop(0, 'rgba(186,230,253,.95)'); wg.addColorStop(.4, 'rgba(56,189,248,.9)'); wg.addColorStop(1, 'rgba(3,105,161,.95)'); g.fillStyle = wg; } else g.fillStyle = 'rgba(56,189,248,.85)'; g.beginPath(); g.roundRect(p.sx - w / 2, y - hh, w, hh, 6 * s); g.fill(); g.fillStyle = '#1d4ed8'; g.fillRect(p.sx - w / 4, y - hh - 8 * s, w / 2, 8 * s); g.fillStyle = '#fff'; g.fillRect(p.sx - w / 2 + 3 * s, y - hh * .7, w - 6 * s, 12 * s); }
    if (o.t === 'fruit') { const r = 20 * s, y = p.sy - 50 * s + Math.sin(S.t * .1 + o.z) * 6 * s; if (is3d()) { const fg = g.createRadialGradient(p.sx - r * .4, y - r * .4, r * .1, p.sx, y, r * 1.1); fg.addColorStop(0, '#fecaca'); fg.addColorStop(.45, '#ef4444'); fg.addColorStop(1, '#7f1d1d'); g.fillStyle = fg; } else g.fillStyle = '#ef4444'; g.beginPath(); g.arc(p.sx, y, r, 0, 7); g.fill(); g.fillStyle = '#16a34a'; g.beginPath(); g.ellipse(p.sx + 6 * s, y - r, 8 * s, 4 * s, -.5, 0, 7); g.fill(); }
  }
  function draw() {
    {
    const sky = g.createLinearGradient(0, 0, 0, HZ); sky.addColorStop(0, '#0ea5e9'); sky.addColorStop(.7, '#7dd3fc'); sky.addColorStop(1, '#e0f2fe'); g.fillStyle = sky; g.fillRect(0, 0, W, HZ);
    const sun = g.createRadialGradient(W * .78, HZ * .35, 8, W * .78, HZ * .35, 110); sun.addColorStop(0, 'rgba(255,255,230,1)'); sun.addColorStop(.3, 'rgba(254,240,138,.8)'); sun.addColorStop(1, 'rgba(254,240,138,0)'); g.fillStyle = sun; g.fillRect(0, 0, W, HZ);
    // مدينة بطبقتين في الأفق مع نوافذ
    const zz = S?.z || 0;
    for (const [sp, col, base, win] of [[.08, '#bfdbfe', 70, 0], [.2, '#93c5fd', 40, 1]]) for (let i = 0; i < 20; i++) {
      const bw = 48, bh = base + ((i * 37 + base) % 80), x = i * 52 - (zz * sp) % 52 - 26;
      const bg = g.createLinearGradient(x, 0, x + bw, 0); bg.addColorStop(0, col); bg.addColorStop(1, win ? '#60a5fa' : '#93c5fd'); g.fillStyle = bg; g.fillRect(x, HZ - bh, bw, bh);
      if (win) { g.fillStyle = 'rgba(255,255,255,.55)'; for (let yy = HZ - bh + 8; yy < HZ - 8; yy += 12) for (let xx = x + 6; xx < x + bw - 6; xx += 10) if ((xx * 7 + yy * 3 + i) % 5) g.fillRect(xx, yy, 4, 5); }
    }
    const gr = g.createLinearGradient(0, HZ, 0, H); gr.addColorStop(0, '#bbf7d0'); gr.addColorStop(.25, '#4ade80'); gr.addColorStop(1, '#15803d'); g.fillStyle = gr; g.fillRect(0, HZ, W, H - HZ); }
    if (!S) { start0(); return; }
    // الطريق
    const zb = S.z - 38, a = proj(-1.6, S.z + 480), b = proj(1.6, S.z + 480), c = proj(1.6, zb), d = proj(-1.6, zb);
    const rg = g.createLinearGradient(0, HZ, 0, H); rg.addColorStop(0, '#64748b'); rg.addColorStop(1, '#1e293b'); g.fillStyle = rg; g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(b.sx, b.sy); g.lineTo(c.sx, c.sy); g.lineTo(d.sx, d.sy); g.fill();
    for (const side of [-1.6, 1.6]) for (let z = Math.floor((S.z - 38) / 16) * 16 + 16; z < S.z + 480; z += 16) { const q1 = proj(side, z), q2 = proj(side, z + 8), q3 = proj(side + Math.sign(side) * .12, z + 8), q4 = proj(side + Math.sign(side) * .12, z); g.fillStyle = (Math.floor(z / 16) % 2) ? '#ef4444' : '#f8fafc'; g.beginPath(); g.moveTo(q1.sx, q1.sy); g.lineTo(q2.sx, q2.sy); g.lineTo(q3.sx, q3.sy); g.lineTo(q4.sx, q4.sy); g.fill(); }
    for (const lx of [-.5, .5]) for (let z = Math.floor(S.z / 20) * 20; z < S.z + 480; z += 20) { const p1 = proj(lx, z), p2 = proj(lx, z + 9); g.strokeStyle = '#f8fafc'; g.lineWidth = Math.max(1, 5 * p1.sc); g.beginPath(); g.moveTo(p1.sx, p1.sy); g.lineTo(p2.sx, p2.sy); g.stroke(); }
    for (let z = Math.floor(S.z / 40) * 40; z < S.z + 480; z += 40) for (const side of [-1, 1]) { const p = proj(side * 2.3, z); const s = p.sc; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(p.sx, p.sy, 40 * s, 10 * s, 0, 0, 7); g.fill(); const tg = g.createRadialGradient(p.sx - 14 * s, p.sy - 105 * s, 4 * s, p.sx, p.sy - 90 * s, 44 * s); tg.addColorStop(0, '#86efac'); tg.addColorStop(1, '#166534'); g.fillStyle = tg; g.beginPath(); g.arc(p.sx, p.sy - 90 * s, 40 * s, 0, 7); g.fill(); g.fillStyle = '#78350f'; g.fillRect(p.sx - 6 * s, p.sy - 60 * s, 12 * s, 60 * s); }
    { const fog = g.createLinearGradient(0, HZ - 10, 0, HZ + 90); fog.addColorStop(0, 'rgba(224,242,254,.9)'); fog.addColorStop(1, 'rgba(224,242,254,0)'); g.fillStyle = fog; g.fillRect(0, HZ - 10, W, 100); }
    const objs = S.objs.slice().sort((x, y) => y.z - x.z);
    const behind = objs.filter(o => o.z - S.z > 0), front = objs.filter(o => o.z - S.z <= 0);
    behind.forEach(drawObj); drawRunner(); front.forEach(drawObj);
    g.fillStyle = 'rgba(15,23,42,.55)'; g.fillRect(0, 0, W, 38); g.fillStyle = '#fff'; g.font = '800 19px system-ui'; g.textAlign = 'left';
    g.fillText(`🏃 ${num(Math.floor(S.z / 4))} م   💧 ${num(S.items)}   ⭐ ${num(S.score)}   🏆 ${num(best)}`, 14, 26);
  }
  function start0() { g.fillStyle = '#334155'; g.beginPath(); g.moveTo(VPX - 40, HZ); g.lineTo(VPX + 40, HZ); g.lineTo(W * .85, H); g.lineTo(W * .15, H); g.fill(); }
  function loop() { raf = requestAnimationFrame(loop); update(); draw(); }
  const act = (k) => { if (state !== 'play') return; if (k === 'L') S.lane = Math.max(0, S.lane - 1); if (k === 'R') S.lane = Math.min(2, S.lane + 1); if (k === 'U' && S.y === 0) { S.vy = .95; S.slide = 0; sound('move'); } if (k === 'D' && S.y > 0) S.vy = -1.2; if (k === 'D') { S.slide = 45; if (S.y > 0) S.vy = -1.2; } };
  const kd = (e) => { if (!view.isConnected) return; const k = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', a: 'L', d: 'R', w: 'U', s: 'D', ' ': 'U' }[e.key]; if (k) { e.preventDefault(); act(k); } };
  window.addEventListener('keydown', kd);
  let sx, sy; cv.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return act('U'); act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U')); });
  const msg = h('div', { class: 'jp-msg' });
  function ui() {
    msg.innerHTML = ''; msg.classList.toggle('on', state !== 'play');
    if (state === 'menu') msg.append(h('h2', {}, '🏃 ', t('rn_start')), h('p', {}, t('rn_best', { d: num(best) })), h('button', { type: 'button', class: 'btn gk-go', onclick: start }, t('rn_start')), h('small', {}, t('rn_help')));
    if (state === 'over') msg.append(h('h2', {}, t('rn_over', { d: num(Math.floor(S.z / 4)) })), h('p', {}, '💧 ', num(S.items), ' · ⭐ ', num(S.score), ' · ', t('rn_best', { d: num(best) })), h('p', { class: 'rn-tip' }, '💡 ', t('rn_tip'), ': ', TIPS[Math.floor(Math.random() * TIPS.length)]), h('button', { type: 'button', class: 'btn gk-go', onclick: start }, t('rn_again')));
  }
  const pads = h('div', { class: 'jp-pads' }, h('div', { class: 'jp-btns' }, holdBtn('⤒', '', () => act('U')), holdBtn('⬇', 'alt', () => act('D'))), joystick({ onDir: (d) => act(d) }));
  view.append(h('div', { class: 'jp-stage' }, cv, msg), pads);
  ui(); loop();
  return { unmount() { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); } };
}
