// كرات الألوان (فكرة شبيهة بزوما): أطلق الكرات من الضفدع في المنتصف لتصنع ثلاث كرات أو أكثر من اللون نفسه فتختفي، قبل أن تصل السلسلة إلى الحفرة.
import { h, t, addDict, sound, num, ico, store, is3d, settings } from '../../assets/js/core.js';
// مؤثرات صوتية حماسية خاصة باللعبة (تُولَّد بالمتصفح)
let AC = null;
const ac = () => { if (!settings.sound) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch { return null; } };
function tone(f0, f1, dur, type = 'sine', vol = .2, delay = 0) { const a = ac(); if (!a) return; const t0 = a.currentTime + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur); o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + .02); }
function noise(dur, freq, vol = .3, delay = 0) { const a = ac(); if (!a) return; const t0 = a.currentTime + delay, n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2; n.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2; const g = a.createGain(); g.gain.value = vol; n.connect(f).connect(g).connect(a.destination); n.start(t0); }
const SFX = {
  shoot: () => { tone(900, 300, .12, 'square', .07); noise(.06, 3000, .12); },
  insert: () => { noise(.05, 2400, .35); tone(520, 380, .06, 'triangle', .12); },
  pop: (combo) => { const base = 440 * Math.pow(1.19, Math.min(combo, 8)); [0, 1, 2].forEach(k => tone(base * [1, 1.26, 1.5][k], base * [1, 1.26, 1.5][k] * 1.02, .16, 'triangle', .16, k * .055)); noise(.18, 5200, .18); },
  combo: (n) => { [0, 1, 2, 3].forEach(k => tone(523 * Math.pow(1.122, k + n), 523 * Math.pow(1.122, k + n) * 1.01, .14, 'square', .07, k * .07)); },
  magnet: () => { tone(260, 900, .35, 'sawtooth', .06); tone(130, 520, .35, 'sine', .12); },
  clack: () => { noise(.09, 1500, .55); tone(180, 70, .12, 'sine', .3); },
  roll: () => { noise(.5, 400, .12); },
  danger: () => { tone(110, 90, .12, 'sine', .35); tone(110, 90, .12, 'sine', .3, .16); },
  win: () => { [523, 659, 784, 1046, 784, 1046].forEach((f, k) => tone(f, f, .22, 'square', .08, k * .12)); },
  lose: () => { [392, 330, 262, 196].forEach((f, k) => tone(f, f * .97, .3, 'sawtooth', .08, k * .2)); },
};
addDict({
  ar: { zu_level: 'المرحلة {n}', zu_score: 'النقاط {n}', zu_start: 'ابدأ', zu_win: 'نظّفت المسار! 🎉', zu_lose: 'وصلت الكرات إلى الحفرة!', zu_next: 'المرحلة التالية', zu_retry: 'أعد المحاولة', zu_swap: 'بدّل الكرة', zu_help: 'وجّه بالفأرة أو بإصبعك واضغط لإطلاق الكرة. اضغط زر المسافة أو زر التبديل لتبديل الكرة التالية.', zu_mode: 'النمط', zu_colors: 'ألوان', zu_math: 'أعداد (مجموعها 10)' },
  en: { zu_level: 'Level {n}', zu_score: 'Score {n}', zu_start: 'Start', zu_win: 'Path cleared! 🎉', zu_lose: 'The balls reached the hole!', zu_next: 'Next level', zu_retry: 'Retry', zu_swap: 'Swap', zu_help: 'Aim and tap to shoot. Space or Swap switches balls.', zu_mode: 'Mode', zu_colors: 'Colours', zu_math: 'Numbers (make 10)' },
});
const COLS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#64748b'];
const W = 800, H = 600, D = 30, CX = 400, CY = 300;
function makePath(level) {
  const pts = []; const turns = 2.6, r0 = 270, r1 = 95;
  const N = 1400;
  for (let i = 0; i <= N; i++) { const f = i / N; const a = -Math.PI / 2 + f * turns * Math.PI * 2 + level * .7; const r = r0 - (r0 - r1) * f; pts.push([CX + Math.cos(a) * r * 1.35, CY + Math.sin(a) * r]); }
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len, total: len[len.length - 1] };
}
function at(P, s) { if (s <= 0) return P.pts[0]; let lo = 0, hi = P.len.length - 1; while (lo < hi - 1) { const m = (lo + hi) >> 1; if (P.len[m] < s) lo = m; else hi = m; } const f = (s - P.len[lo]) / (P.len[hi] - P.len[lo] || 1); return [P.pts[lo][0] + (P.pts[hi][0] - P.pts[lo][0]) * f, P.pts[lo][1] + (P.pts[hi][1] - P.pts[lo][1]) * f]; }
export async function mount(root) {
  if (!document.getElementById('zu-css')) document.head.append(h('link', { id: 'zu-css', rel: 'stylesheet', href: new URL('./zuma.css', import.meta.url).href }));
  const view = h('div', { class: 'zu' }); root.append(view);
  const cv = h('canvas', { class: 'zu-cv', width: W, height: H }); const g = cv.getContext('2d');
  let level = store.get('zu-level', 1), score = 0, mode = store.get('zu-mode', 'colors'), S = null, raf = 0, aim = -Math.PI / 2, over = null;
  const nColors = () => mode === 'math' ? 9 : Math.min(3 + Math.floor((level + 1) / 2), 6);
  const label = (c) => mode === 'math' ? c + 1 : '';
  function newColor(chain) { if (mode === 'math') { const vis = chain.filter(b => b.s >= 0); const src = vis.length ? vis : chain; if (!src.length) return 4; return 8 - src[Math.floor(Math.random() * Math.min(src.length, 12)) + Math.max(0, src.length - 12)].c; } const present = [...new Set(chain.map(b => b.c))]; const pool = present.length ? present : [...Array(nColors()).keys()]; return pool[Math.floor(Math.random() * pool.length)]; }
  function start() {
    over = null; const P = makePath(level);
    const total = 40 + level * 8; const chain = [];
    for (let i = 0; i < total; i++) { let c; do { c = Math.floor(Math.random() * nColors()); } while (i >= 2 && chain[i - 1].c === c && chain[i - 2].c === c); chain.push({ c, s: -i * D }); }
    chain.reverse(); // الفهرس 0 = آخر السلسلة (الأبعد عن الحفرة)
    for (let i = 0; i < chain.length; i++) chain[i].s = -(chain.length - 1 - i) * D;
    S = { P, chain, shots: [], cur: 0, next: 0, speed: 0.55 + level * .06, intro: 220, t: 0, pops: [], texts: [], combo: 0, shake: 0, beat: 0 }; SFX.roll();
    S.cur = newColor(chain); S.next = newColor(chain);
    cancelAnimationFrame(raf); loop(); draw();
  }
  function groupAround(chain, i) { let a = i, b = i; const same = (x, y) => mode === 'math' ? false : chain[x].c === chain[y].c; while (a > 0 && same(a - 1, i) && chain[a].s - chain[a - 1].s <= D + 1) a--; while (b < chain.length - 1 && same(b + 1, i) && chain[b + 1].s - chain[b].s <= D + 1) b++; return [a, b]; }
  function mathPair(chain, i) { // في نمط الأعداد: كرتان متجاورتان مجموعهما 10 تختفيان
    for (const j of [i - 1, i + 1]) if (chain[j] && Math.abs(chain[j].s - chain[i].s) <= D + 1 && chain[j].c + 1 + chain[i].c + 1 === 10) return [Math.min(i, j), Math.max(i, j)];
    return null;
  }
  function tryPop(i) {
    const ch = S.chain; let rng = null;
    if (mode === 'math') rng = mathPair(ch, i); else { const [a, b] = groupAround(ch, i); if (b - a + 1 >= 3) rng = [a, b]; }
    if (!rng) return false;
    const [a, b] = rng; for (let k = a; k <= b; k++) { const [x, y] = at(S.P, ch[k].s); S.pops.push({ x, y, c: ch[k].c, t: 0 }); }
    S.combo = (S.combo || 0) + 1; const pts = (b - a + 1) * 10 * S.combo; score += pts;
    const [mx, my] = at(S.P, ch[Math.floor((a + b) / 2)].s); S.texts.push({ x: mx, y: my, s: S.combo > 1 ? `+${pts}  ×${S.combo}` : `+${pts}`, t: 0, big: S.combo > 1 });
    ch.splice(a, b - a + 1); SFX.pop(S.combo); if (S.combo > 1) { SFX.combo(S.combo); S.shake = 10; }
    // الجزء الأمامي ينجذب للخلف إذا تطابق لون الطرفين
    if (a > 0 && a < ch.length && ch[a].c === ch[a - 1].c && mode !== 'math') { ch[a].mag = true; SFX.magnet(); }
    return true;
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!S || over) { draw(); return; }
    const ch = S.chain; S.t++;
    const sp = S.intro > 0 ? 3.2 : S.speed; if (S.intro > 0) S.intro--;
    // حركة السلسلة على شكل أجزاء: الجزء الخلفي يُدفع، والأجزاء الأمامية تواصل السير ولا تتوقف،
    // وإذا تطابق لون طرفي الفجوة ينجذب الجزء الأمامي للخلف كالمغناطيس حتى يرتطم
    if (ch.length) {
      const segs = []; let a = 0;
      for (let i = 1; i <= ch.length; i++) if (i === ch.length || ch[i].s - ch[i - 1].s > D + 1) { segs.push([a, i - 1]); a = i; }
      segs.forEach(([a, b], k) => {
        let v = sp;
        if (k > 0) {
          const head = ch[a], prev = ch[a - 1];
          if (mode !== 'math' && head.c === prev.c) { head.mag = true; head.v = Math.max(-11, (head.v ?? sp) - .55); v = head.v; }
          else { head.mag = false; head.v = sp; }
        }
        for (let i = a; i <= b; i++) ch[i].s += v;
      });
      for (let i = 1; i < ch.length; i++) if (ch[i].s < ch[i - 1].s + D) {
        const hit = ch[i].mag; ch[i].s = ch[i - 1].s + D;
        if (hit) { ch[i].mag = false; ch[i].v = sp; SFX.clack(); S.shake = Math.max(S.shake, 6); if (!tryPop(i)) S.combo = 0; break; }
      }
    }
    // نبض الخطر قرب الحفرة
    if (ch.length && ch[ch.length - 1].s > S.P.total * .82 && ++S.beat % 45 === 0) SFX.danger();
    S.texts.forEach(x => x.t++); S.texts = S.texts.filter(x => x.t < 50); if (S.shake > 0) S.shake -= .6;
    // المقذوفات
    for (const b of S.shots) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { b.dead = true; continue; }
      for (let i = 0; i < ch.length; i++) { if (ch[i].s < 0) continue; const [x, y] = at(S.P, ch[i].s); if (Math.hypot(b.x - x, b.y - y) < D * .9) {
        // نحدد هل تدخل قبل الكرة أم بعدها
        const [xn, yn] = at(S.P, ch[i].s + 2); const ahead = (b.x - x) * (xn - x) + (b.y - y) * (yn - y) > 0;
        const idx = ahead ? i + 1 : i; const sNew = ahead ? ch[i].s + D : ch[i].s;
        ch.splice(idx, 0, { c: b.c, s: sNew });
        for (let k = idx + 1; k < ch.length; k++) if (ch[k].s < ch[k - 1].s + D) ch[k].s = ch[k - 1].s + D;
        b.dead = true; S.combo = 0; if (!tryPop(idx)) SFX.insert();
        break; } }
    }
    S.shots = S.shots.filter(b => !b.dead);
    S.pops.forEach(p => p.t++); S.pops = S.pops.filter(p => p.t < 20);
    if (!ch.length) { over = 'win'; level++; store.set('zu-level', level); SFX.win(); ui(); }
    else if (ch[ch.length - 1].s >= S.P.total) { over = 'lose'; SFX.lose(); ui(); }
    if (S.cur != null && ch.length && !ch.some(b => b.c === S.cur) && mode !== 'math') S.cur = newColor(ch);
    draw();
  }
  function ball(x, y, c, r = D / 2) {
    if (!is3d()) { g.fillStyle = COLS[c]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = shade(COLS[c]); g.lineWidth = 2; g.stroke(); }
    else {
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + r * .3, y + r * .6, r * .85, r * .4, 0, 0, 7); g.fill();
      const gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r * 1.05); gr.addColorStop(0, '#fff'); gr.addColorStop(.18, COLS[c]); gr.addColorStop(.75, shade(COLS[c])); gr.addColorStop(1, '#000');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      // انعكاس الضوء من الأسفل (ضوء مرتد) ولمعة حادة
      g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x + r * .2, y + r * .55, r * .5, r * .18, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x - r * .38, y - r * .42, r * .2, r * .12, -.7, 0, 7); g.fill();
    }
    if (mode === 'math') { g.fillStyle = '#fff'; g.font = `900 ${r * 1.1}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(label(c)), x, y + 1); }
  }
  const shade = (hex) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * .55, gg = (n >> 8 & 255) * .55, b = (n & 255) * .55; return `rgb(${r|0},${gg|0},${b|0})`; };
  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#123524'; g.fillRect(0, 0, W, H);
    if (!S) return;
    if (S.shake > 0) g.setTransform(1, 0, 0, 1, (Math.random() - .5) * S.shake, (Math.random() - .5) * S.shake);
    g.lineWidth = D + 10; g.lineCap = 'round'; g.strokeStyle = '#a16207'; g.beginPath(); S.P.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.lineWidth = D + 2; g.strokeStyle = '#d9b26a'; g.stroke();
    const end = S.P.pts[S.P.pts.length - 1]; g.fillStyle = '#0b0b0b'; g.beginPath(); g.arc(end[0], end[1], D * .9, 0, Math.PI * 2); g.fill();
    for (const b of S.chain) if (b.s >= 0) { const [x, y] = at(S.P, b.s); ball(x, y, b.c); }
    for (const b of S.shots) ball(b.x, b.y, b.c);
    for (const p of S.pops) { g.globalAlpha = 1 - p.t / 20; ball(p.x, p.y - p.t, p.c, D / 2 * (1 + p.t / 12)); g.globalAlpha = 1; }
    // الضفدع
    g.save(); g.translate(CX, CY); g.rotate(aim + Math.PI / 2);
    const D3 = is3d(), A = -(aim + Math.PI / 2), L = (lx, ly) => [lx * Math.cos(A) - ly * Math.sin(A), lx * Math.sin(A) + ly * Math.cos(A)];
    const rad = (cx, cy, r, c0, c1, c2) => { if (!D3) return c1; const [ox, oy] = L(-r * .4, -r * .45); const q = g.createRadialGradient(cx + ox, cy + oy, r * .08, cx, cy, r * 1.1); q.addColorStop(0, c0); q.addColorStop(.5, c1); q.addColorStop(1, c2); return q; };
    if (D3) { const [sx, sy] = L(6, 10); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(sx, sy, 40, 46, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = rad(0, 0, 44, '#86efac', '#16a34a', '#052e16'); g.beginPath(); g.ellipse(0, 0, 38, 44, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = rad(0, 6, 30, '#dcfce7', '#4ade80', '#15803d'); g.beginPath(); g.ellipse(0, 6, 26, 30, 0, 0, Math.PI * 2); g.fill();
    for (const ex of [-16, 16]) { g.fillStyle = rad(ex, -32, 10, '#fff', '#f1f5f9', '#94a3b8'); g.beginPath(); g.arc(ex, -32, 10, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#111'; for (const ex of [-16, 16]) { g.beginPath(); g.arc(ex, -34, 5, 0, Math.PI * 2); g.fill(); }
    if (D3) { g.fillStyle = '#fff'; for (const ex of [-16, 16]) { const [ox, oy] = L(-2, -2); g.beginPath(); g.arc(ex + ox, -34 + oy, 1.8, 0, Math.PI * 2); g.fill(); } }
    g.restore();
    ball(CX + Math.cos(aim) * 30, CY + Math.sin(aim) * 30, S.cur, D / 2);
    ball(CX, CY + 8, S.next, D / 3);
    g.setLineDash([4, 8]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(CX + Math.cos(aim) * 50, CY + Math.sin(aim) * 50); g.lineTo(CX + Math.cos(aim) * 360, CY + Math.sin(aim) * 360); g.stroke(); g.setLineDash([]);
    for (const x of S.texts) { g.globalAlpha = 1 - x.t / 50; g.font = `900 ${x.big ? 34 + Math.min(10, x.t) : 22}px system-ui`; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#000'; g.fillStyle = x.big ? '#fde047' : '#fff'; g.strokeText(x.s, x.x, x.y - 20 - x.t); g.fillText(x.s, x.x, x.y - 20 - x.t); g.globalAlpha = 1; }
    g.fillStyle = '#fff'; g.font = '700 22px system-ui'; g.textAlign = 'left'; g.fillText('⭐ ' + score, 16, 32);
  }
  function shoot() { if (!S || over || S.shots.length > 1) return; S.shots.push({ x: CX + Math.cos(aim) * 30, y: CY + Math.sin(aim) * 30, vx: Math.cos(aim) * 14, vy: Math.sin(aim) * 14, c: S.cur }); S.cur = S.next; S.next = newColor(S.chain); SFX.shoot(); }
  function swap() { if (!S) return; [S.cur, S.next] = [S.next, S.cur]; }
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  cv.addEventListener('pointermove', (e) => { const [x, y] = pos(e); aim = Math.atan2(y - CY, x - CX); });
  cv.addEventListener('pointerdown', (e) => { const [x, y] = pos(e); aim = Math.atan2(y - CY, x - CX); if (Math.hypot(x - CX, y - CY) < 40) swap(); else shoot(); });
  const onKey = (e) => { if (!view.isConnected) return; if (e.code === 'Space') { e.preventDefault(); swap(); } };
  window.addEventListener('keydown', onKey);
  const msgEl = h('div', { class: 'zu-msg' });
  function ui() {
    msgEl.innerHTML = ''; msgEl.classList.toggle('on', !!over || !S);
    if (!S) msgEl.append(h('button', { type: 'button', class: 'btn gk-go', onclick: start }, '▶ ', t('zu_start')));
    else if (over === 'win') msgEl.append(h('h2', {}, t('zu_win')), h('button', { type: 'button', class: 'btn gk-go', onclick: start }, t('zu_next')));
    else if (over === 'lose') msgEl.append(h('h2', {}, t('zu_lose')), h('button', { type: 'button', class: 'btn gk-go', onclick: start }, t('zu_retry')));
    head.querySelector('.zu-lv').textContent = t('zu_level', { n: num(level) });
  }
  const head = h('div', { class: 'zu-top' }, h('b', { class: 'zu-lv' }, t('zu_level', { n: num(level) })),
    h('div', { class: 'field' }, h('span', {}, t('zu_mode')), h('div', { class: 'seg' }, [['colors', '🎨 ' + t('zu_colors')], ['math', '🔢 ' + t('zu_math')]].map(([k, l]) => h('button', { type: 'button', class: mode === k ? 'on' : '', onclick: (e) => { mode = k; store.set('zu-mode', k); e.currentTarget.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget)); start(); ui(); } }, l)))),
    h('button', { type: 'button', class: 'btn ghost', onclick: swap }, '⇄ ', t('zu_swap')));
  view.append(head, h('div', { class: 'zu-stage' }, cv, msgEl), h('p', { class: 'muted center' }, t('zu_help')));
  draw(); ui(); loop();
  return { unmount() { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); } };
}
