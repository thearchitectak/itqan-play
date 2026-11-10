// السمكة الجائعة: كُل الأسماك الأصغر منك لتكبر، واهرب من الأسماك الأكبر. مراحل في أعماق مختلفة ومعلومات عن البحر.
import { h, t, addDict, sound, num, store, is3d } from '../../assets/js/core.js';
addDict({
  ar: { fi_start: 'ابدأ السباحة', fi_level: 'المرحلة {n}', fi_eaten: 'أكلتك سمكة أكبر منك!', fi_win: 'كبرت وأكملت المرحلة! 🎉', fi_next: 'المرحلة التالية', fi_retry: 'أعد المحاولة', fi_help: 'حرّك الفأرة أو إصبعك لتقود سمكتك. كُل الأسماك التي حولها إطار أخضر، واهرب من ذات الإطار الأحمر.', fi_fact: 'هل تعلم؟', fi_size: 'الحجم' },
  en: { fi_start: 'Start swimming', fi_level: 'Level {n}', fi_eaten: 'A bigger fish ate you!', fi_win: 'You grew up — level complete! 🎉', fi_next: 'Next level', fi_retry: 'Retry', fi_help: 'Steer with the mouse or your finger. Eat green-ringed fish, flee red-ringed ones.', fi_fact: 'Did you know?', fi_size: 'Size' },
});
const FACTS = ['الحوت الأزرق أكبر حيوان عاش على الأرض.', 'الأسماك تتنفس الأكسجين الذائب في الماء بواسطة الخياشيم.', 'المرجان كائنات حية وليست صخورًا.', 'بعض أسماك الأعماق تصنع ضوءها بنفسها.', 'الأخطبوط له ثلاثة قلوب.', 'سمك القرش يعيش على الأرض منذ ملايين السنين.', 'البحر الأحمر من أغنى البحار بالشعاب المرجانية.'];
const LEVELS = [{ goal: 4, bg: ['#7dd3fc', '#0284c7'] }, { goal: 5, bg: ['#38bdf8', '#075985'] }, { goal: 6, bg: ['#0ea5e9', '#0c4a6e'] }, { goal: 7, bg: ['#1e3a8a', '#020617'], dark: true }];
const COLS = ['#f97316', '#eab308', '#22c55e', '#ec4899', '#a855f7', '#14b8a6', '#ef4444', '#64748b'];
export async function mount(root) {
  if (!document.getElementById('jp-css')) document.head.append(h('link', { id: 'jp-css', rel: 'stylesheet', href: new URL('../jumper/jumper.css', import.meta.url).href }));
  const view = h('div', { class: 'fi' }); root.append(view);
  const W = 960, H = 560; const cv = h('canvas', { class: 'jp-cv', width: W, height: H, style: { cursor: 'none' } }); const g = cv.getContext('2d');
  let lv = 0, state = 'menu', raf = 0, P, fish, bubbles, tgt = { x: W / 2, y: H / 2 }, score = 0, t0 = 0, best = store.get('fi-best', 0);
  function load(i) {
    lv = i; P = { x: W / 2, y: H / 2, size: 1, xp: 0, vx: 0, vy: 0, face: 1, mouth: 0, inv: 90 }; fish = []; bubbles = [];
    for (let k = 0; k < 10; k++) spawn(true);
  }
  function spawn(init) {
    const L = LEVELS[lv];
    // أحجام متنوعة: أصغر وأكبر من اللاعب
    let size = Math.random() < .62 ? Math.max(.5, P.size - .3 - Math.random() * .8) : P.size + .4 + Math.random() * 1.8;
    if (Math.random() < .08 && lv > 0) size = 5 + Math.random() * 2; // سمكة ضخمة نادرة
    const dir = Math.random() < .5 ? 1 : -1;
    fish.push({ x: init ? Math.random() * W : dir > 0 ? -80 : W + 80, y: 40 + Math.random() * (H - 80), size, vx: dir * (.6 + Math.random() * 1.6) / Math.sqrt(size), wob: Math.random() * 7, col: COLS[Math.floor(Math.random() * COLS.length)], kind: size > 4.5 ? 'shark' : Math.random() < .3 ? 'round' : 'long' });
    void L;
  }
  const R = (s) => 14 * s;
  function update() {
    if (state !== 'play') return;
    const dx = tgt.x - P.x, dy = tgt.y - P.y; P.vx += dx * .012; P.vy += dy * .012; P.vx *= .86; P.vy *= .86;
    const sp = Math.hypot(P.vx, P.vy), mx = 7; if (sp > mx) { P.vx *= mx / sp; P.vy *= mx / sp; }
    P.x = Math.max(20, Math.min(W - 20, P.x + P.vx)); P.y = Math.max(20, Math.min(H - 20, P.y + P.vy));
    if (Math.abs(P.vx) > .3) P.face = P.vx > 0 ? 1 : -1;
    if (P.mouth > 0) P.mouth--; if (P.inv > 0) P.inv--;
    for (const f of fish) {
      f.wob += .08; f.x += f.vx; f.y += Math.sin(f.wob) * .5;
      // الأسماك الكبيرة تطارد اللاعب قليلًا والصغيرة تهرب
      const d = Math.hypot(P.x - f.x, P.y - f.y);
      if (d < 200) { if (f.size > P.size) f.y += Math.sign(P.y - f.y) * .5; else f.y -= Math.sign(P.y - f.y) * .6; }
      if (d < (R(f.size) + R(P.size)) * .72) {
        if (f.size < P.size) { f.dead = true; P.xp += f.size; score += Math.round(f.size * 10); P.mouth = 10; sound('capture'); bubbles.push({ x: f.x, y: f.y, r: 4, t: 0 });
          const goal = LEVELS[lv].goal; P.size = 1 + Math.min(goal - 1, P.xp / 5);
          if (P.size >= goal - .01) { state = 'won'; best = Math.max(best, score); store.set('fi-best', best); sound('win'); ui(); } }
        else if (P.inv <= 0) { state = 'over'; sound('lose'); ui(); }
      }
    }
    fish = fish.filter(f => !f.dead && f.x > -150 && f.x < W + 150);
    while (fish.length < 9 + lv * 2) spawn(false);
    if (Math.random() < .05) bubbles.push({ x: Math.random() * W, y: H + 10, r: 2 + Math.random() * 5, t: 0, rise: true });
    for (const b of bubbles) { b.t++; b.y -= b.rise ? 1.2 : .6; }
    bubbles = bubbles.filter(b => b.t < 400 && b.y > -10);
  }
  function drawFish(x, y, s, face, col, kind, ring, mouth = 0) {
    const r = R(s);
    g.save(); g.translate(x, y); g.scale(face, 1);
    if (ring) { g.strokeStyle = ring; g.lineWidth = 3; g.globalAlpha = .55; g.beginPath(); g.ellipse(0, 0, r * 1.5, r * 1.1, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (kind === 'shark') {
      g.fillStyle = is3d() ? (() => { const q = g.createLinearGradient(0, -r, 0, r); q.addColorStop(0, '#94a3b8'); q.addColorStop(1, '#334155'); return q; })() : '#64748b'; g.beginPath(); g.moveTo(-r * 1.6, 0); g.quadraticCurveTo(-r * .2, -r * .9, r * 1.4, -r * .1); g.lineTo(r * 1.4, r * .2); g.quadraticCurveTo(0, r * .9, -r * 1.6, 0); g.fill();
      g.beginPath(); g.moveTo(-r * .2, -r * .6); g.lineTo(r * .1, -r * 1.3); g.lineTo(r * .4, -r * .5); g.fill(); g.beginPath(); g.moveTo(-r * 1.5, 0); g.lineTo(-r * 2.1, -r * .7); g.lineTo(-r * 1.9, r * .5); g.fill();
      g.fillStyle = '#e2e8f0'; g.beginPath(); g.ellipse(r * .3, r * .25, r * .9, r * .3, 0, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(r * .9, -r * .2, r * .1, 0, 7); g.fill();
      g.restore(); return;
    }
    const ry = kind === 'round' ? r * .85 : r * .6;
    g.fillStyle = col; g.beginPath(); g.moveTo(-r * .9, 0); g.lineTo(-r * 1.6, -ry * .9); g.lineTo(-r * 1.5, ry * .9); g.fill();
    g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, 7); g.fill();
    // تظليل يعطي الجسم استدارة
    if (is3d()) { const sh = g.createLinearGradient(0, -ry, 0, ry); sh.addColorStop(0, 'rgba(255,255,255,.45)'); sh.addColorStop(.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = sh; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, 7); g.fill();
    g.globalAlpha = .55; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(r * .1, -ry * .45, r * .45, ry * .16, -.15, 0, 7); g.fill(); g.globalAlpha = 1; const rg2 = g.createRadialGradient(r * .3, -ry * .3, 1, 0, 0, r * 1.1); rg2.addColorStop(0, 'rgba(255,255,255,.25)'); rg2.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = rg2; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = Math.max(1, r * .08); for (const k of [-.3, .1]) { g.beginPath(); g.arc(r * k, 0, ry * .8, -1, 1); g.stroke(); }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(r * .5, -ry * .25, r * .2, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(r * .55, -ry * .25, r * .1, 0, 7); g.fill(); if (is3d()) { g.fillStyle = '#fff'; g.beginPath(); g.arc(r * .52, -ry * .3, r * .035, 0, 7); g.fill(); }
    if (mouth) { g.fillStyle = '#7f1d1d'; g.beginPath(); g.moveTo(r * .95, 0); g.lineTo(r * .6, -ry * .25); g.lineTo(r * .6, ry * .25); g.fill(); }
    g.restore();
  }
  function draw() {
    const L = LEVELS[lv]; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, L.bg[0]); gr.addColorStop(1, L.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // أشعة وقاع ونباتات
    g.globalAlpha = L.dark ? .05 : .12; g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(i * 180, 0); g.lineTo(i * 180 + 60, 0); g.lineTo(i * 180 - 60, H); g.lineTo(i * 180 - 140, H); g.fill(); } g.globalAlpha = 1;
    // طبقات بعيدة: صخور وأسراب أسماك داكنة تتحرك ببطء
    const now = Date.now() / 1000;
    g.fillStyle = L.dark ? 'rgba(2,6,23,.6)' : 'rgba(7,89,133,.35)';
    for (let i = 0; i < 5; i++) { const x = ((i * 230 - now * 6) % 1150 + 1150) % 1150 - 100; g.beginPath(); g.moveTo(x, H); g.quadraticCurveTo(x + 40, H - 150 - (i % 3) * 30, x + 110, H - 120); g.quadraticCurveTo(x + 160, H - 170, x + 220, H); g.fill(); }
    g.fillStyle = L.dark ? 'rgba(148,163,184,.12)' : 'rgba(12,74,110,.28)';
    for (let k = 0; k < 14; k++) { const x = ((k * 70 + now * 25) % (W + 200)) - 100, y = 150 + Math.sin(k * 1.7 + now) * 30 + (k % 4) * 12; g.beginPath(); g.ellipse(x, y, 9, 4, 0, 0, 7); g.moveTo(x - 8, y); g.lineTo(x - 15, y - 4); g.lineTo(x - 15, y + 4); g.fill(); }
    // تموجات الضوء على القاع
    g.strokeStyle = L.dark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.14)'; g.lineWidth = 2;
    for (let k = 0; k < 12; k++) { g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, H - 70 - k * 8 + Math.sin(x * .02 + now * 2 + k) * 5); g.stroke(); }
    const sand = g.createLinearGradient(0, H - 40, 0, H); sand.addColorStop(0, '#e7c98f'); sand.addColorStop(1, '#a8834a');
    g.fillStyle = sand; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40) g.lineTo(x, H - 26 - Math.sin(x * .02) * 10); g.lineTo(W, H); g.fill();
    for (let i = 0; i < 9; i++) { const x = 50 + i * 110; g.strokeStyle = ['#16a34a', '#15803d', '#e11d48'][i % 3]; g.lineWidth = 6; g.beginPath(); g.moveTo(x, H - 20); for (let k = 1; k < 6; k++) g.lineTo(x + Math.sin(Date.now() / 600 + i + k) * 8, H - 20 - k * 18); g.stroke(); }
    for (const b of bubbles) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.stroke(); }
    if (P) {
      if (is3d()) { g.shadowColor = 'rgba(0,30,60,.45)'; g.shadowBlur = 10; g.shadowOffsetY = 8; }
      for (const f of fish) drawFish(f.x, f.y, f.size, f.vx > 0 ? 1 : -1, f.col, f.kind, state === 'play' ? (f.size < P.size ? '#22c55e' : '#ef4444') : null);
      if (!(P.inv > 0 && Math.floor(P.inv / 5) % 2)) drawFish(P.x, P.y, P.size, P.face, '#fbbf24', 'round', null, P.mouth);
      g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
      const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,20,40,.35)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      if (L.dark) { const rg = g.createRadialGradient(P.x, P.y, 60, P.x, P.y, 300); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
      g.fillStyle = 'rgba(15,23,42,.5)'; g.fillRect(0, 0, W, 36); g.fillStyle = '#fff'; g.font = '800 18px system-ui'; g.textAlign = 'left'; g.fillText(`🐟 ${t('fi_level', { n: num(lv + 1) })}   ⭐ ${num(score)}   🏆 ${num(best)}`, 12, 24);
      const goal = L.goal; g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W - 230, 12, 200, 12); g.fillStyle = '#22c55e'; g.fillRect(W - 230, 12, 200 * Math.min(1, (P.size - 1) / (goal - 1)), 12);
    }
  }
  function loop() { raf = requestAnimationFrame(loop); update(); draw(); }
  const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  cv.addEventListener('pointermove', (e) => { tgt = pos(e); });
  cv.addEventListener('pointerdown', (e) => { tgt = pos(e); });
  cv.style.touchAction = 'none';
  const msg = h('div', { class: 'jp-msg' });
  function ui() {
    msg.innerHTML = ''; msg.classList.toggle('on', state !== 'play');
    const fact = h('p', { class: 'rn-tip' }, '🐠 ', t('fi_fact'), ' ', FACTS[Math.floor(Math.random() * FACTS.length)]);
    if (state === 'menu') msg.append(h('h2', {}, '🐟 ', t('fi_start')), h('div', { class: 'jp-lv' }, LEVELS.map((_, i) => h('button', { type: 'button', class: 'btn', disabled: i > store.get('fi-lv', 0), onclick: () => { score = 0; load(i); state = 'play'; ui(); } }, t('fi_level', { n: num(i + 1) })))), h('small', {}, t('fi_help')));
    if (state === 'won') { store.set('fi-lv', Math.max(store.get('fi-lv', 0), Math.min(LEVELS.length - 1, lv + 1))); msg.append(h('h2', {}, t('fi_win')), fact, lv + 1 < LEVELS.length ? h('button', { type: 'button', class: 'btn gk-go', onclick: () => { load(lv + 1); state = 'play'; ui(); } }, t('fi_next')) : h('button', { type: 'button', class: 'btn gk-go', onclick: () => { state = 'menu'; ui(); } }, '🏆')); }
    if (state === 'over') msg.append(h('h2', {}, t('fi_eaten')), fact, h('button', { type: 'button', class: 'btn gk-go', onclick: () => { score = 0; load(lv); state = 'play'; ui(); } }, t('fi_retry')));
  }
  view.append(h('div', { class: 'jp-stage' }, cv, msg));
  load(0); ui(); loop();
  return { unmount() { cancelAnimationFrame(raf); } };
}
