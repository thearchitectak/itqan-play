// مغامرات فرفور: لعبة منصات وقفز بأسلوب ألعاب المغامرات الكلاسيكية — جري وقفز وعملات وصناديق مفاجآت وأعداء وعلَم نهاية المرحلة.
// الشخصية والمراحل والرسوم أصلية بالكامل ومرسومة بالكود.
import { h, t, addDict, sound, num, store, is3d } from '../../assets/js/core.js';
addDict({
  ar: { jp_start: 'ابدأ المغامرة', jp_level: 'المرحلة {n}', jp_lives: 'الأرواح', jp_coins: 'العملات', jp_win: 'وصلت إلى العلَم! 🎉', jp_next: 'المرحلة التالية', jp_over: 'انتهت المحاولات', jp_retry: 'العب من جديد', jp_done: 'أكملت كل المراحل! أنت بطل المغامرات 🏆',
    jp_help: 'الحاسوب: الأسهم أو A/D للحركة، والمسافة أو ↑ للقفز، وShift للجري. الهاتف: استخدم الأزرار على الشاشة.', jp_q: 'صندوق المعرفة', jp_paused: 'متوقف مؤقتًا' },
  en: { jp_start: 'Start adventure', jp_level: 'Level {n}', jp_lives: 'Lives', jp_coins: 'Coins', jp_win: 'You reached the flag! 🎉', jp_next: 'Next level', jp_over: 'Game over', jp_retry: 'Play again', jp_done: 'All levels complete! 🏆',
    jp_help: 'Keyboard: arrows/A-D to move, Space/↑ to jump, Shift to run. Phone: on-screen buttons.', jp_q: 'Knowledge box', jp_paused: 'Paused' },
});
const T = 32, ROWS = 15;
// رموز المراحل: # أرض، B طوب، ? صندوق عملة، M صندوق ثمرة نجمية، o عملة، e عدو هلامي، s قنفذ شائك (لا يُداس)، [ ] جذع شجرة، F علَم، C سحابة صلبة
const LEVELS = [
  [
    '                                                                                                                                                  ',
    '                                                                                                                                                  ',
    '                                                                                                                                                  ',
    '                                                                                                                                                  ',
    '                                                                                                                                         F        ',
    '                      ?                                                     oooo                                                        F        ',
    '                                                                           BBBBBB         ?                                             F        ',
    '                                                                                                                                       #F        ',
    '                ?   B?BMB                     []         []                         ooo        B?B           ?  ?  ?                  ##F        ',
    '                                      []      []         []                                                                          ###F        ',
    '                                      []      []         []      ooo                                                                ####F        ',
    '                           e          []   e  []    e e  []                   e e       e     e    s       e  e         e  e        #####F        ',
    '##############################################################  ############   ##############################  ###################################',
    '##############################################################  ############   ##############################  ###################################',
    '##############################################################  ############   ##############################  ###################################',
  ],
  [
    '                                                                                                                                                  ',
    '                                                                                                                                                  ',
    '                                                                                                                                                  ',
    '                                    ooooo                                                                                                         ',
    '                                   CCCCCCC               M                                ooo                                         F           ',
    '                      ooo                              BBBBB                             BBBBB                                        F           ',
    '                     BBBBB                                              ?   ?                                                         F           ',
    '                                                                                                    oo                               #F           ',
    '               ?                ?B?B?             s                                    B?B        BBBB         CCC                  ##F           ',
    '                                                ####          []                                                                   ###F           ',
    '                                     #         #####          []      ######                                       ##            ####F           ',
    '                    e   e           ##   e e  ######   e      []    e######   e   e   s    e  e         s   e     ###   e  e      #####F           ',
    '#########################   #############   ############################################   ######   #######################################   ######',
    '#########################   #############   ############################################   ######   #######################################   ######',
    '#########################   #############   ############################################   ######   #######################################   ######',
  ],
  [
    '                                                                                                                                                       ',
    '                                                                                                                                                       ',
    '                                                    ooooo                                                                                              ',
    '                                                   CCCCCCC                                    ooo                                                       ',
    '                              oo                                           M                  CCC                ooo                    F              ',
    '                             CCCC          oo                            BBBBB                                  CCCCC                   F              ',
    '                    ?                     CCCC                                       ?                                                  F              ',
    '                                                                                                                                       #F              ',
    '             ?   B?B?B             CC                  C        []         B?B             CCC            []        s      e          ##F              ',
    '                                                 C              []                                        []      #####  #####       ###F              ',
    '                          ##                                    []     []                                 []     ##############     ####F              ',
    '               e  e      ###    e   e     s         e    e   e  []  e  []   e  e   s   e  e   e   s   e   []  e ################   #####F              ',
    '###########################   ########   #######   #####   ######   ########   #######   #############   ######################   #######   #########',
    '###########################   ########   #######   #####   ######   ########   #######   #############   ######################   #######   #########',
    '###########################   ########   #######   #####   ######   ########   #######   #############   ######################   #######   #########',
  ],
];
export async function mount(root) {
  if (!document.getElementById('jp-css')) document.head.append(h('link', { id: 'jp-css', rel: 'stylesheet', href: new URL('./jumper.css', import.meta.url).href }));
  const view = h('div', { class: 'jp' }); root.append(view);
  const W = 960, H = ROWS * T;
  const cv = h('canvas', { class: 'jp-cv', width: W, height: H }); const g = cv.getContext('2d');
  let lv = 0, lives = 3, coins = 0, score = 0, L, P, ents, parts, cam = 0, raf = 0, state = 'menu', keys = {}, best = store.get('jp-best', 0), unlocked = store.get('jp-lv', 0);
  const msg = h('div', { class: 'jp-msg' });
  function load(i) {
    lv = i; const rows = LEVELS[i]; const w = Math.max(...rows.map(r => r.length));
    L = { w, tiles: rows.map(r => r.padEnd(w, ' ').split('')), bumped: {} };
    ents = []; parts = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < w; x++) {
      const c = L.tiles[y][x];
      if (c === 'e' || c === 's') { ents.push({ type: c === 'e' ? 'slime' : 'spike', x: x * T, y: y * T, w: 28, h: 26, vx: -1.1, vy: 0, alive: true }); L.tiles[y][x] = ' '; }
      if (c === 'o') { ents.push({ type: 'coin', x: x * T + 8, y: y * T + 4, w: 16, h: 24, alive: true }); L.tiles[y][x] = ' '; }
    }
    P = { x: 3 * T, y: 9 * T, w: 24, h: 30, vx: 0, vy: 0, on: false, big: false, inv: 0, face: 1, dead: false, win: false, t: 0 };
    cam = 0;
  }
  const solid = (c) => '#B?MC[]UF'.includes(c) && c !== 'F';
  const tile = (tx, ty) => (ty < 0 || tx < 0 || tx >= L.w) ? ' ' : ty >= ROWS ? ' ' : L.tiles[ty][tx];
  function collide(o, dx, dy, onHead) {
    o.x += dx; let hit = false;
    for (const [tx, ty] of cellsOf(o)) if (solid(tile(tx, ty))) { if (dx > 0) o.x = tx * T - o.w - .01; else if (dx < 0) o.x = (tx + 1) * T + .01; hit = 'x'; }
    o.y += dy;
    for (const [tx, ty] of cellsOf(o)) if (solid(tile(tx, ty))) {
      if (dy > 0) { o.y = ty * T - o.h - .01; o.vy = 0; o.on = true; }
      else if (dy < 0) { o.y = (ty + 1) * T + .01; o.vy = 0; onHead?.(tx, ty); }
      hit = hit || 'y';
    }
    return hit;
  }
  const cellsOf = (o) => { const out = []; for (let ty = Math.floor(o.y / T); ty <= Math.floor((o.y + o.h - .02) / T); ty++) for (let tx = Math.floor(o.x / T); tx <= Math.floor((o.x + o.w - .02) / T); tx++) out.push([tx, ty]); return out; };
  function bump(tx, ty) {
    const c = L.tiles[ty][tx];
    if (c === '?' || c === 'M') { L.tiles[ty][tx] = 'U'; L.bumped[tx + ',' + ty] = 8;
      if (c === '?') { coins++; score += 100; sound('place'); parts.push({ kind: 'coinpop', x: tx * T + 8, y: ty * T - 10, t: 0 }); }
      else { ents.push({ type: 'fruit', x: tx * T + 4, y: ty * T - 26, w: 24, h: 24, vx: 1.4, vy: -2, alive: true }); sound('notify'); } }
    else if (c === 'B') { if (P.big) { L.tiles[ty][tx] = ' '; score += 50; sound('capture'); for (let k = 0; k < 4; k++) parts.push({ kind: 'brick', x: tx * T + 16, y: ty * T + 16, vx: (k % 2 ? 2 : -2), vy: -4 - (k > 1 ? 2 : 0), t: 0 }); } else { L.bumped[tx + ',' + ty] = 8; sound('move'); }
      // الأعداء فوق الطوبة تسقط
      for (const e of ents) if (e.alive && (e.type === 'slime' || e.type === 'spike') && Math.abs(e.x - tx * T) < 30 && Math.abs(e.y + e.h - ty * T) < 4) { e.alive = false; score += 200; } }
  }
  function hurt() {
    if (P.inv > 0 || P.win) return;
    if (P.big) { P.big = false; P.h = 30; P.y += 18; P.inv = 90; sound('error'); return; }
    P.dead = true; P.vy = -9; sound('lose');
  }
  function update() {
    if (state !== 'play') return;
    P.t++;
    if (P.dead) { P.vy += .5; P.y += P.vy; if (P.y > H + 100) { lives--; if (lives <= 0) { state = 'over'; ui(); } else { load(lv); } } return; }
    if (P.win) { P.vx = 2; P.x += P.vx; if (P.y + P.h < 12 * T) { P.y += 3; } if (P.x > (L.w - 4) * T) { state = 'won'; unlocked = Math.max(unlocked, lv + 1); store.set('jp-lv', unlocked); ui(); } return; }
    const run = keys.Shift ? 1.6 : 1, left = keys.ArrowLeft || keys.a || keys.ك, right = keys.ArrowRight || keys.d || keys.ي, jump = keys[' '] || keys.ArrowUp || keys.w || keys.ص;
    const acc = P.on ? .45 : .3;
    if (left) { P.vx -= acc; P.face = -1; } if (right) { P.vx += acc; P.face = 1; }
    if (!left && !right) P.vx *= P.on ? .78 : .95;
    const mx = 3.4 * run; P.vx = Math.max(-mx, Math.min(mx, P.vx));
    if (jump && P.on && !P.jumpHeld) { P.vy = -11.2 - Math.abs(P.vx) * .25; P.on = false; P.jumpHeld = true; sound('move'); }
    if (!jump) { P.jumpHeld = false; if (P.vy < -4) P.vy = -4; }
    P.vy = Math.min(13, P.vy + .55); P.on = false;
    collide(P, P.vx, 0); collide(P, 0, P.vy, (tx, ty) => bump(tx, ty));
    if (P.x < cam) { P.x = cam; P.vx = 0; }
    if (P.y > H) { P.big = false; hurt(); P.dead = true; }
    if (P.inv > 0) P.inv--;
    // العلَم
    for (const [tx, ty] of cellsOf(P)) if (tile(tx, ty) === 'F') { P.win = true; score += 1000 + Math.max(0, 12 - Math.floor(P.y / T)) * 100; sound('win'); break; }
    for (const e of ents) {
      if (!e.alive) continue;
      if (e.type === 'slime' || e.type === 'spike' || e.type === 'fruit') {
        if (Math.abs(e.x - P.x) > W + 64) continue;
        e.vy = Math.min(12, (e.vy || 0) + .5); e.on = false;
        const hx = collide(e, e.vx, 0); if (hx === 'x') e.vx *= -1;
        collide(e, 0, e.vy);
        // الأعداء الهلامية لا تسقط من الحواف
        if (e.type !== 'fruit' && e.on) { const ahead = Math.floor((e.vx > 0 ? e.x + e.w + 2 : e.x - 2) / T), below = Math.floor((e.y + e.h + 4) / T); if (!solid(tile(ahead, below))) e.vx *= -1; }
        if (e.y > H) e.alive = false;
      }
      const touch = P.x < e.x + e.w && P.x + P.w > e.x && P.y < e.y + e.h && P.y + P.h > e.y;
      if (!touch || P.dead) continue;
      if (e.type === 'coin') { e.alive = false; coins++; score += 100; sound('place'); if (coins % 100 === 0) lives++; }
      else if (e.type === 'fruit') { e.alive = false; score += 1000; if (!P.big) { P.big = true; P.y -= 18; P.h = 48; } sound('win'); }
      else if (e.type === 'slime' && P.vy > 0 && P.y + P.h - e.y < 16) { e.alive = false; P.vy = -7; score += 200; sound('capture'); parts.push({ kind: 'squash', x: e.x, y: e.y + e.h - 8, t: 0 }); }
      else hurt();
    }
    for (const p of parts) { p.t++; if (p.kind === 'brick') { p.x += p.vx; p.y += p.vy; p.vy += .4; } if (p.kind === 'coinpop') p.y -= 2; }
    parts = parts.filter(p => p.t < 40);
    for (const k in L.bumped) if (--L.bumped[k] <= 0) delete L.bumped[k];
    cam = Math.max(cam, Math.min(P.x - W * .38, L.w * T - W));
  }
  // ---------- الرسم ----------
  // تلوين حجمي للشخصيات في الوضع ثلاثي الأبعاد: تدرج كروي بإضاءة من أعلى اليسار
  const vol = (cx, cy, r, light, base, dark) => { if (!is3d()) return base; const gr = g.createRadialGradient(cx - r * .4, cy - r * .45, r * .1, cx, cy, r * 1.15); gr.addColorStop(0, light); gr.addColorStop(.55, base); gr.addColorStop(1, dark); return gr; };
  const shine = (cx, cy, rx, ry) => { if (!is3d()) return; g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(cx, cy, rx, ry, -.5, 0, 7); g.fill(); };
  function bevel(x, y, w, hh, base, light, dark) {
    g.fillStyle = base; g.fillRect(x, y, w, hh); g.fillStyle = light; g.fillRect(x, y, w, 3); g.fillRect(x, y, 3, hh); g.fillStyle = dark; g.fillRect(x, y + hh - 3, w, 3); g.fillRect(x + w - 3, y, 3, hh);
  }
  function drawHero(x, y, big) {
    const s = big ? 1.6 : 1, bob = P.on && Math.abs(P.vx) > .5 ? Math.sin(P.t * .4) * 2 : 0;
    g.save(); g.translate(x + P.w / 2, y + P.h); g.scale(P.face * s, s);
    if (P.inv > 0 && Math.floor(P.inv / 4) % 2) g.globalAlpha = .4;
    // الذيل
    g.fillStyle = vol(-12, -14, 9, '#fdba74', '#f97316', '#9a3412'); g.beginPath(); g.ellipse(-12, -14, 9, 5, -.6, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-18, -18, 4, 3, -.6, 0, 7); g.fill();
    // الجسم والقدمان
    g.fillStyle = vol(0, -11, 9, '#7dd3fc', '#0ea5e9', '#075985'); g.beginPath(); g.roundRect(-8, -16, 16, 10, 3); g.fill();
    g.fillStyle = vol(0, -3, 6, '#64748b', '#1e293b', '#020617'); g.beginPath(); g.roundRect(-8 + bob, -6, 6, 6, 2); g.roundRect(2 - bob, -6, 6, 6, 2); g.fill();
    // الرأس
    g.fillStyle = vol(0, -22, 10, '#fed7aa', '#fb923c', '#9a3412'); g.beginPath(); g.arc(0, -22, 10, 0, 7); g.fill(); shine(-4, -27, 3, 1.6);
    g.beginPath(); g.moveTo(-9, -27); g.lineTo(-7, -37); g.lineTo(-2, -30); g.fill(); g.beginPath(); g.moveTo(9, -27); g.lineTo(7, -37); g.lineTo(2, -30); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(4, -19, 6, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(4, -25, 2, 0, 7); g.fill(); g.beginPath(); g.arc(10, -20, 1.8, 0, 7); g.fill();
    // الوشاح
    g.fillStyle = vol(0, -14, 8, '#86efac', '#22c55e', '#14532d'); g.fillRect(-9, -15, 18, 3); g.fillRect(-12, -15, 4, 8);
    g.restore();
  }
  function draw() {
    const pal = [['#60a5fa', '#bae6fd', '#e0f2fe'], ['#f59e0b', '#fde68a', '#fff7ed'], ['#7c3aed', '#c4b5fd', '#f5f3ff']][lv % 3];
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, pal[0]); sky.addColorStop(.6, pal[1]); sky.addColorStop(1, pal[2]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // شمس متوهجة
    const sx0 = W * .8 - cam * .03, sun = g.createRadialGradient(sx0, 90, 10, sx0, 90, 120); sun.addColorStop(0, 'rgba(255,255,220,1)'); sun.addColorStop(.25, 'rgba(255,240,170,.9)'); sun.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = sun; g.fillRect(sx0 - 130, -40, 260, 260);
    // جبال بعيدة (طبقة أولى)
    for (let i = -1; i < 7; i++) { const x = i * 380 - (cam * .12) % 380; const mg = g.createLinearGradient(0, H - 300, 0, H); mg.addColorStop(0, 'rgba(100,116,139,.55)'); mg.addColorStop(1, 'rgba(148,163,184,.15)'); g.fillStyle = mg; g.beginPath(); g.moveTo(x, H - 60); g.lineTo(x + 120, H - 290); g.lineTo(x + 170, H - 250); g.lineTo(x + 250, H - 330); g.lineTo(x + 380, H - 60); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.moveTo(x + 230, H - 310); g.lineTo(x + 250, H - 330); g.lineTo(x + 272, H - 304); g.lineTo(x + 252, H - 312); g.fill(); }
    // غيوم مظللة
    for (let i = -1; i < 7; i++) { const x = i * 260 - (cam * .35) % 260; for (const [dx, dy, col] of [[0, 4, 'rgba(203,213,225,.85)'], [0, 0, 'rgba(255,255,255,.95)']]) { g.fillStyle = col; g.beginPath(); g.arc(x + 60 + dx, 70 + dy, 22, 0, 7); g.arc(x + 85 + dx, 62 + dy, 28, 0, 7); g.arc(x + 112 + dx, 72 + dy, 20, 0, 7); g.fill(); } }
    // تلال قريبة بتظليل (طبقة ثانية)
    for (let i = -1; i < 8; i++) { const x = i * 300 - (cam * .3) % 300; const hg = g.createRadialGradient(x + 110, H - 150, 20, x + 150, H - 60, 200); hg.addColorStop(0, 'rgba(134,239,172,.95)'); hg.addColorStop(1, 'rgba(22,163,74,.75)'); g.fillStyle = hg; g.beginPath(); g.ellipse(x + 150, H - 50, 180, 120, 0, Math.PI, 0); g.fill(); }
    // ضباب خفيف يعطي عمقًا
    const fog = g.createLinearGradient(0, H - 200, 0, H); fog.addColorStop(0, 'rgba(255,255,255,0)'); fog.addColorStop(1, 'rgba(255,255,255,.35)'); g.fillStyle = fog; g.fillRect(0, H - 200, W, 200);
    if (!L) return;
    g.save(); g.translate(-Math.round(cam), 0);
    const x0 = Math.floor(cam / T) - 1, x1 = x0 + W / T + 3;
    for (let y = 0; y < ROWS; y++) for (let x = x0; x < x1; x++) {
      const c = tile(x, y); if (c === ' ') continue; const px = x * T, py = y * T - (L.bumped[x + ',' + y] ? Math.sin(L.bumped[x + ',' + y] / 8 * Math.PI) * 8 : 0);
      if (c === '#') { const top = tile(x, y - 1) !== '#'; const dg = g.createLinearGradient(0, py, 0, py + T); dg.addColorStop(0, '#b7791f'); dg.addColorStop(1, '#7c4a10'); g.fillStyle = dg; g.fillRect(px, py, T, T); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(px + 4, py + 12, 6, 5); g.fillRect(px + 19, py + 21, 7, 5); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(px + 5, py + 11, 6, 2); g.fillRect(px + 20, py + 20, 6, 2);
        if (top) { const gg = g.createLinearGradient(0, py, 0, py + 11); gg.addColorStop(0, '#4ade80'); gg.addColorStop(1, '#15803d'); g.fillStyle = gg; g.fillRect(px, py, T, 10); g.fillStyle = '#86efac'; g.fillRect(px, py, T, 2); g.fillStyle = '#15803d'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(px + k * 8, py + 9); g.lineTo(px + k * 8 + 4, py + 14); g.lineTo(px + k * 8 + 8, py + 9); g.fill(); } } }
      if (c === 'B') { bevel(px, py, T, T, '#c2410c', '#fb923c', '#7c2d12'); g.fillStyle = '#9a3412'; g.fillRect(px + 2, py + 15, T - 4, 2); g.fillRect(px + 15, py + 3, 2, 12); g.fillRect(px + 7, py + 17, 2, 12); g.fillRect(px + 23, py + 17, 2, 12); }
      if (c === '?' || c === 'M') { bevel(px + 1, py + 1, T - 2, T - 2, '#f59e0b', '#fde68a', '#92400e'); const gl = g.createLinearGradient(px, py, px + T, py + T); gl.addColorStop(0, 'rgba(255,255,255,.45)'); gl.addColorStop(.4, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(px + 1, py + 1, T - 2, T - 2); g.fillStyle = '#7c2d12'; g.font = '900 20px system-ui'; g.textAlign = 'center'; g.fillText(c === 'M' ? '★' : '؟', px + 17, py + 24); g.fillStyle = '#fff'; g.fillText(c === 'M' ? '★' : '؟', px + 16, py + 23); }
      if (c === 'U') { bevel(px + 1, py + 1, T - 2, T - 2, '#92400e', '#b45309', '#451a03'); }
      if (c === 'C') { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(px, py + 4, T, T - 8, 12); g.fill(); g.strokeStyle = '#cbd5e1'; g.stroke(); }
      if (c === '[') { const topP = tile(x, y - 1) !== '['; g.fillStyle = '#78350f'; g.fillRect(px + 2, py, T * 2 - 4, T); g.fillStyle = '#92400e'; for (let k = 0; k < 4; k++) g.fillRect(px + 8 + k * 13, py, 3, T); if (topP) { g.fillStyle = '#fde68a'; g.beginPath(); g.ellipse(px + T, py + 6, T - 1, 7, 0, 0, 7); g.fill(); g.strokeStyle = '#a16207'; g.lineWidth = 2; g.beginPath(); g.ellipse(px + T, py + 6, T - 10, 4, 0, 0, 7); g.stroke(); } }
      if (c === 'F') { g.fillStyle = '#e5e7eb'; g.fillRect(px + 14, py, 4, T); if (tile(x, y - 1) !== 'F') { g.fillStyle = '#ef4444'; g.beginPath(); g.moveTo(px + 18, py); g.lineTo(px + 46, py + 10); g.lineTo(px + 18, py + 20); g.fill(); g.fillStyle = '#facc15'; g.beginPath(); g.arc(px + 16, py - 4, 6, 0, 7); g.fill(); } }
    }
    if (is3d()) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 7; g.shadowOffsetY = 4; g.shadowOffsetX = 2; }
    for (const e of ents) {
      if (!e.alive || e.x < cam - 40 || e.x > cam + W + 40) continue;
      if (e.type === 'coin') { const sx = Math.abs(Math.cos(P.t * .08 + e.x)); g.fillStyle = vol(e.x + 8, e.y + 12, 11, '#fef9c3', '#facc15', '#a16207'); g.beginPath(); g.ellipse(e.x + 8, e.y + 12, 8 * sx + 1, 11, 0, 0, 7); g.fill(); g.strokeStyle = '#ca8a04'; g.lineWidth = 2; g.stroke(); }
      if (e.type === 'slime') { const sq = 1 + Math.sin(P.t * .2 + e.x) * .08; g.fillStyle = vol(e.x + 14, e.y + 18, 15, '#ddd6fe', '#8b5cf6', '#4c1d95'); g.beginPath(); g.ellipse(e.x + 14, e.y + 26 - 13 * sq, 15, 13 * sq, 0, Math.PI, 0); g.lineTo(e.x + 29, e.y + 26); g.lineTo(e.x - 1, e.y + 26); g.fill(); shine(e.x + 8, e.y + 8, 4, 2); g.fillStyle = '#fff'; g.beginPath(); g.arc(e.x + 9, e.y + 14, 4, 0, 7); g.arc(e.x + 19, e.y + 14, 4, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(e.x + (e.vx < 0 ? 8 : 10), e.y + 14, 2, 0, 7); g.arc(e.x + (e.vx < 0 ? 18 : 20), e.y + 14, 2, 0, 7); g.fill(); }
      if (e.type === 'spike') { g.fillStyle = '#475569'; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(e.x + k * 6, e.y + 14); g.lineTo(e.x + k * 6 + 3, e.y); g.lineTo(e.x + k * 6 + 6, e.y + 14); g.fill(); } g.fillStyle = vol(e.x + 14, e.y + 18, 15, '#d6a76c', '#92400e', '#451a03'); g.beginPath(); g.ellipse(e.x + 14, e.y + 18, 15, 9, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(e.x + (e.vx < 0 ? 4 : 24), e.y + 16, 3, 0, 7); g.fill(); }
      if (e.type === 'fruit') { g.fillStyle = vol(e.x + 12, e.y + 12, 13, '#fef9c3', '#facc15', '#a16207'); g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, r = k % 2 ? 6 : 13; g.lineTo(e.x + 12 + Math.cos(a) * r, e.y + 12 + Math.sin(a) * r); } g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(e.x + 9, e.y + 11, 1.6, 0, 7); g.arc(e.x + 15, e.y + 11, 1.6, 0, 7); g.fill(); }
    }
    for (const p of parts) { if (p.kind === 'brick') { g.fillStyle = '#c2410c'; g.fillRect(p.x, p.y, 10, 10); } if (p.kind === 'coinpop') { g.fillStyle = '#facc15'; g.beginPath(); g.arc(p.x + 8, p.y, 8, 0, 7); g.fill(); } if (p.kind === 'squash') { g.fillStyle = '#8b5cf6'; g.fillRect(p.x, p.y, 28, 8); } }
    if (P && is3d()) { g.save(); g.shadowColor = 'transparent'; let gy = P.y + P.h; for (let k = 0; k < 8 && !'#B?MU['.includes(tile(Math.floor((P.x + P.w / 2) / T), Math.floor(gy / T)) || ' '); k++) gy = (Math.floor(gy / T) + 1) * T; const dist = Math.max(0, gy - P.y - P.h); g.fillStyle = `rgba(0,0,0,${Math.max(.08, .3 - dist / 400)})`; g.beginPath(); g.ellipse(P.x + P.w / 2 + 4, Math.floor(gy / T) * T - 3, 14 * Math.max(.4, 1 - dist / 300), 4, 0, 0, 7); g.fill(); g.restore(); }
    if (P) drawHero(P.x, P.y, P.big);
    g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; g.shadowOffsetX = 0;
    g.restore();
    // الشريط العلوي
    g.fillStyle = 'rgba(15,23,42,.55)'; g.fillRect(0, 0, W, 34); g.fillStyle = '#fff'; g.font = '800 18px system-ui'; g.textAlign = 'left';
    g.fillText(`⭐ ${score}    🪙 ${coins}    ❤️ ${lives}    🗺️ ${lv + 1}/${LEVELS.length}`, 12, 23);
  }
  function loop() { raf = requestAnimationFrame(loop); update(); draw(); }
  function ui() {
    msg.innerHTML = ''; msg.classList.toggle('on', state !== 'play');
    if (state === 'menu') msg.append(h('h2', {}, '🦊 ', t('jp_start')), h('div', { class: 'jp-lv' }, LEVELS.map((_, i) => h('button', { type: 'button', class: 'btn' + (i > unlocked ? ' ghost' : ''), disabled: i > unlocked, onclick: () => { lives = 3; coins = 0; score = 0; load(i); state = 'play'; ui(); } }, t('jp_level', { n: num(i + 1) })))), h('small', {}, t('jp_help')));
    if (state === 'won') { if (lv + 1 < LEVELS.length) msg.append(h('h2', {}, t('jp_win')), h('p', {}, '⭐ ', num(score)), h('button', { type: 'button', class: 'btn gk-go', onclick: () => { load(lv + 1); state = 'play'; ui(); } }, t('jp_next'))); else { best = Math.max(best, score); store.set('jp-best', best); msg.append(h('h2', {}, t('jp_done')), h('p', {}, '⭐ ', num(score)), h('button', { type: 'button', class: 'btn gk-go', onclick: () => { state = 'menu'; ui(); } }, t('jp_retry'))); } }
    if (state === 'over') msg.append(h('h2', {}, t('jp_over')), h('p', {}, '⭐ ', num(score)), h('button', { type: 'button', class: 'btn gk-go', onclick: () => { lives = 3; coins = 0; score = 0; load(lv); state = 'play'; ui(); } }, t('jp_retry')));
  }
  const kd = (e) => { if (!view.isConnected) return; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'ArrowDown'].includes(e.key)) e.preventDefault(); keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true; if (e.key === 'Shift') keys.Shift = true; };
  const ku = (e) => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; if (e.key === 'Shift') keys.Shift = false; };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  const pad = (k, label, cls = '') => { const b = h('button', { type: 'button', class: 'jp-pad ' + cls }, label); const on = (v) => (e) => { e.preventDefault(); keys[k] = v; if (k === 'ArrowRight' || k === 'ArrowLeft') keys.Shift = v; }; b.addEventListener('pointerdown', on(true)); b.addEventListener('pointerup', on(false)); b.addEventListener('pointerleave', on(false)); b.addEventListener('pointercancel', on(false)); return b; };
  view.append(h('div', { class: 'jp-stage' }, cv, msg, h('div', { class: 'jp-pads' }, h('div', {}, pad('ArrowLeft', '◀'), pad('ArrowRight', '▶')), pad(' ', '⤒', 'jump'))));
  draw(); ui(); loop();
  return { unmount() { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); } };
}
