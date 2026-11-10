// عدّاء الطاقة: جري لا ينتهي في ثلاثة مسارات بمنظور ثلاثي الأبعاد. اقفز وانزلق وغيّر المسار، واجمع قوارير الماء والفواكه، وتجنب الحواجز.
// الشخصية والرسوم أصلية بالكامل.
import { h, t, addDict, sound, num, store, is3d } from '../../assets/js/core.js';
addDict({
  ar: { rn_start: 'ابدأ الجري', rn_over: 'اصطدمت! المسافة {d} م', rn_best: 'أفضل مسافة: {d} م', rn_again: 'جرّب مرة أخرى', rn_help: 'الأسهم: يمين ويسار لتغيير المسار، وأعلى للقفز، وأسفل للانزلاق. على الهاتف: اسحب بإصبعك.', rn_tip: 'معلومة صحية' },
  en: { rn_start: 'Start running', rn_over: 'Crash! Distance {d} m', rn_best: 'Best: {d} m', rn_again: 'Try again', rn_help: 'Arrows: left/right to switch lanes, up to jump, down to slide. Phone: swipe.', rn_tip: 'Health tip' },
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
    if (kind < .35) { S.objs.push({ t: 'block', lane: lanes[0], z }); if (Math.random() < .5) S.objs.push({ t: 'block', lane: lanes[1], z }); }
    else if (kind < .55) S.objs.push({ t: 'bar', lane: lanes[0], z }); // حاجز منخفض: اقفز
    else if (kind < .7) S.objs.push({ t: 'high', lane: lanes[0], z }); // لافتة عالية: انزلق
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
    for (const o of S.objs) {
      if (o.done) continue; const d = o.z - S.z;
      if (d < 6 && d > -4 && Math.abs(o.lane - S.lx) < .5) {
        if (o.t === 'water' || o.t === 'fruit') { o.done = true; S.items++; S.score += o.t === 'fruit' ? 50 : 20; sound('place'); }
        else if (o.t === 'block' || (o.t === 'bar' && S.y < .35) || (o.t === 'high' && S.slide <= 0)) { state = 'over'; sound('lose'); best = Math.max(best, Math.floor(S.z / 4)); store.set('rn-best', best); ui(); }
        else if (!o.passed) { o.passed = true; S.score += 25; sound('move'); }
      }
    }
    S.objs = S.objs.filter(o => o.z - S.z > -20);
  }
  function drawRunner() {
    const p = proj((S.lx - 1), S.z, S.y); const sc = p.sc * 1.25; const ph = S.t * .35 * (S.speed / 14);
    g.save(); g.translate(p.sx, p.sy); g.scale(sc, sc);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, S.y * 120, 34, 10, 0, 0, 7); g.fill();
    if (S.slide > 0) { g.fillStyle = '#0ea5e9'; g.beginPath(); g.roundRect(-40, -34, 80, 30, 14); g.fill(); g.fillStyle = '#fbbf24'; g.beginPath(); g.arc(34, -30, 15, 0, 7); g.fill(); g.restore(); return; }
    const leg = Math.sin(ph) * 16;
    g.strokeStyle = '#1e293b'; g.lineWidth = 11; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-8, -50); g.lineTo(-10 + leg, -6); g.stroke(); g.beginPath(); g.moveTo(8, -50); g.lineTo(10 - leg, -6); g.stroke();
    g.fillStyle = '#f97316'; g.fillRect(-20 + leg, -10, 18, 9); g.fillRect(2 - leg, -10, 18, 9);
    const bd = g.createLinearGradient(-22, 0, 22, 0); bd.addColorStop(0, '#7dd3fc'); bd.addColorStop(.45, '#0ea5e9'); bd.addColorStop(1, '#075985'); g.fillStyle = is3d() ? bd : '#0ea5e9'; g.beginPath(); g.roundRect(-22, -110, 44, 64, 14); g.fill();
    g.fillStyle = '#fff'; g.font = '900 22px system-ui'; g.textAlign = 'center'; g.fillText('7', 0, -70);
    g.strokeStyle = '#fbbf24'; g.lineWidth = 10; g.beginPath(); g.moveTo(-20, -100); g.lineTo(-32, -70 - leg * .6); g.stroke(); g.beginPath(); g.moveTo(20, -100); g.lineTo(32, -70 + leg * .6); g.stroke();
    const hg = g.createRadialGradient(-7, -136, 2, 0, -128, 23); hg.addColorStop(0, '#fef3c7'); hg.addColorStop(.5, '#fbbf24'); hg.addColorStop(1, '#b45309'); g.fillStyle = is3d() ? hg : '#fbbf24'; g.beginPath(); g.arc(0, -128, 20, 0, 7); g.fill();
    g.fillStyle = '#7c2d12'; g.beginPath(); g.arc(0, -134, 21, Math.PI, 0); g.fill();
    g.fillStyle = '#22c55e'; g.fillRect(-21, -140, 42, 6);
    g.restore();
  }
  function drawObj(o) {
    const d = o.z - S.z; if (d < -38 || d > 480) return;
    const p = proj(o.lane - 1, o.z); const s = p.sc;
    if (o.t === 'block') { const w = 150 * s, hh = 140 * s, p2 = proj(o.lane - 1, o.z + 18), w2 = 150 * p2.sc, h2 = 140 * p2.sc;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(p.sx, p.sy, w * .6, 10 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#991b1b'; g.beginPath(); g.moveTo(p.sx - w / 2, p.sy - hh); g.lineTo(p2.sx - w2 / 2, p2.sy - h2); g.lineTo(p2.sx + w2 / 2, p2.sy - h2); g.lineTo(p.sx + w / 2, p.sy - hh); g.fill();
      const bg = g.createLinearGradient(0, p.sy - hh, 0, p.sy); bg.addColorStop(0, '#f87171'); bg.addColorStop(1, '#b91c1c'); g.fillStyle = bg; g.fillRect(p.sx - w / 2, p.sy - hh, w, hh);
      g.fillStyle = 'rgba(255,255,255,.9)'; for (let k = 0; k < 3; k++) g.fillRect(p.sx - w / 2, p.sy - hh + (k * 2 + 1) * hh / 7, w, hh / 7);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(p.sx - w / 2, p.sy - hh, w, 4 * s); g.fillStyle = '#7f1d1d'; g.fillRect(p.sx - w / 2, p.sy - 6 * s, w, 6 * s); }
    if (o.t === 'bar') { const w = 160 * s, hh = 45 * s; g.fillStyle = '#f59e0b'; g.fillRect(p.sx - w / 2, p.sy - hh, w, hh * .45); g.fillStyle = '#111827'; for (let k = 0; k < 4; k++) g.fillRect(p.sx - w / 2 + k * w / 4, p.sy - hh, w / 8, hh * .45); g.fillStyle = '#475569'; g.fillRect(p.sx - w / 2, p.sy - hh, 6 * s, hh); g.fillRect(p.sx + w / 2 - 6 * s, p.sy - hh, 6 * s, hh); }
    if (o.t === 'high') { const w = 170 * s, top = 200 * s, hh = 60 * s; g.fillStyle = '#475569'; g.fillRect(p.sx - w / 2, p.sy - top - hh, 8 * s, top + hh); g.fillRect(p.sx + w / 2 - 8 * s, p.sy - top - hh, 8 * s, top + hh); g.fillStyle = '#7c3aed'; g.fillRect(p.sx - w / 2, p.sy - top - hh * .2 - 70 * s, w, 70 * s); g.fillStyle = '#fff'; g.font = `900 ${Math.max(8, 34 * s)}px system-ui`; g.textAlign = 'center'; g.fillText('⬇', p.sx, p.sy - top - 30 * s); }
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
  const act = (k) => { if (state !== 'play') return; if (k === 'L') S.lane = Math.max(0, S.lane - 1); if (k === 'R') S.lane = Math.min(2, S.lane + 1); if (k === 'U' && S.y === 0) { S.vy = .95; S.slide = 0; sound('move'); } if (k === 'D') { S.slide = 45; if (S.y > 0) S.vy = -1.2; } };
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
  const pads = h('div', { class: 'jp-pads' }, h('div', {}, ...[['L', '◀'], ['R', '▶']].map(([k, l]) => h('button', { type: 'button', class: 'jp-pad', onclick: () => act(k) }, l))), h('div', {}, ...[['D', '⬇'], ['U', '⤒']].map(([k, l]) => h('button', { type: 'button', class: 'jp-pad' + (k === 'U' ? ' jump' : ''), onclick: () => act(k) }, l))));
  view.append(h('div', { class: 'jp-stage' }, cv, msg, pads));
  ui(); loop();
  return { unmount() { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); } };
}
