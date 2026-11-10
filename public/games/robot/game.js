// برمجة الروبوت: رتّب الأوامر (تقدم، استدر، التقط) لتقود الروبوت إلى كل الجواهر، واستخدم «الدالة» لتختصر برنامجك.
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';
addDict({
  ar: { rb_level: 'المرحلة {n}', rb_main: 'البرنامج الرئيسي', rb_func: 'الدالة ⓕ', rb_run: 'شغّل', rb_stop: 'أوقف', rb_clear: 'امسح', rb_fwd: 'تقدّم', rb_left: 'استدر يسارًا', rb_right: 'استدر يمينًا', rb_pick: 'التقط', rb_call: 'نفّذ الدالة',
    rb_win: 'أحسنت! جمعت كل الجواهر 💎', rb_fail: 'لم يجمع الروبوت كل الجواهر. عدّل برنامجك وحاول مرة أخرى.', rb_crash: 'اصطدم الروبوت! لا يمكنه الخروج من الطريق.', rb_next: 'المرحلة التالية', rb_slots: '{n}/{m} أوامر',
    rb_help: 'اضغط الأوامر لتضيفها إلى البرنامج، واضغط أي أمر في البرنامج لحذفه. ثم اضغط «شغّل».', rb_target: 'هدف النجوم: {n} أوامر أو أقل', rb_full: 'لا مكان لأوامر أخرى هنا' },
  en: { rb_level: 'Level {n}', rb_main: 'Main program', rb_func: 'Function ⓕ', rb_run: 'Run', rb_stop: 'Stop', rb_clear: 'Clear', rb_fwd: 'Forward', rb_left: 'Turn left', rb_right: 'Turn right', rb_pick: 'Pick up', rb_call: 'Call function',
    rb_win: 'All gems collected! 💎', rb_fail: "Not all gems were collected. Fix your program and try again.", rb_crash: 'The robot crashed!', rb_next: 'Next level', rb_slots: '{n}/{m} commands',
    rb_help: 'Tap commands to add them; tap a command in the program to remove it. Then Run.', rb_target: 'Star target: {n} commands or fewer', rb_full: 'No more room here' },
});
// المراحل: # فراغ، . أرض، G جوهرة، > < ^ v بداية الروبوت واتجاهه
const LEVELS = [
  { m: ['>..G'], max: 8, best: 4  },
  { m: ['>.G', '##.', '##G'], max: 11, best: 7  },
  { m: ['..G', '.##', '^##'], max: 10, best: 6  },
  { m: ['>...', '###.', '###.', 'G..G'], max: 17, best: 13  },
  { m: ['>.G.G.G'], max: 13, best: 9, fmax: 0  },
  { m: ['v###', '.###', 'G.##', '#.##', '#G..'], max: 13, best: 9  },
  { m: ['>.G.G.G.G'], max: 4, best: 4, fmax: 3, fbest: 3 },
  { m: ['G...G', '.###.', '.###.', '^###G'], max: 19, best: 15, fmax: 4  },
  { m: ['>.#..G', '#.#.##', '#...##'], max: 18, best: 14, fmax: 4  },
  { m: ['>..G', '#..#', 'G..#', '#..G'], max: 27, best: 23, fmax: 4  },
  { m: ['>.G.G.', '#####.', 'G.G.G.'], max: 23, best: 19, fmax: 4  },
  { m: ['G.....G', '.#####.', '.#####.', '.#####.', '^.....G'], max: 23, best: 19, fmax: 5  },
];
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const ARROW = { '^': 0, '>': 1, 'v': 2, '<': 3 };
const ROBOT_SVG = `<svg viewBox="0 0 64 64" class="rb-svg"><defs><linearGradient id="rbm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#475569"/></linearGradient><linearGradient id="rbv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient></defs><ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(0,0,0,.25)"/><line x1="32" y1="10" x2="32" y2="3" stroke="#64748b" stroke-width="2"/><circle cx="32" cy="3" r="3" fill="#ef4444"/><rect x="14" y="10" width="36" height="24" rx="9" fill="url(#rbm)" stroke="#334155" stroke-width="1"/><rect x="18" y="15" width="28" height="13" rx="6" fill="url(#rbv)"/><circle cx="25" cy="21.5" r="3.4" fill="#22d3ee"/><circle cx="39" cy="21.5" r="3.4" fill="#22d3ee"/><circle cx="24" cy="20.5" r="1.1" fill="#fff"/><circle cx="38" cy="20.5" r="1.1" fill="#fff"/><path d="M18 16 q6 -2 12 0" stroke="rgba(255,255,255,.35)" stroke-width="1.5" fill="none"/><rect x="18" y="35" width="28" height="16" rx="5" fill="url(#rbm)" stroke="#334155" stroke-width="1"/><rect x="24" y="39" width="16" height="6" rx="2" fill="#0f172a"/><rect x="26" y="41" width="3" height="2" fill="#22c55e"/><rect x="31" y="41" width="3" height="2" fill="#facc15"/><rect x="36" y="41" width="2" height="2" fill="#ef4444"/><rect x="9" y="37" width="7" height="12" rx="3" fill="#64748b"/><rect x="48" y="37" width="7" height="12" rx="3" fill="#64748b"/><rect x="17" y="51" width="11" height="6" rx="3" fill="#1e293b"/><rect x="36" y="51" width="11" height="6" rx="3" fill="#1e293b"/></svg>`;
const GEM_SVG = `<svg viewBox="0 0 40 40" class="rb-gsvg"><ellipse cx="20" cy="36" rx="10" ry="2.5" fill="rgba(0,0,0,.2)"/><path d="M8 14 L14 6 H26 L32 14 L20 32 Z" fill="#0ea5e9"/><path d="M8 14 H32 L20 32 Z" fill="#0284c7"/><path d="M14 6 L17 14 H8 Z" fill="#7dd3fc"/><path d="M26 6 L23 14 H32 Z" fill="#38bdf8"/><path d="M14 6 H26 L23 14 H17 Z" fill="#bae6fd"/><path d="M17 14 L20 32 L23 14 Z" fill="#38bdf8"/><path d="M15 9 l3 -2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const CMD = { F: '⬆️', L: '↪️', R: '↩️', P: '💎', C: 'ⓕ' };
export async function mount(root) {
  if (!document.getElementById('rb-css')) document.head.append(h('link', { id: 'rb-css', rel: 'stylesheet', href: new URL('./robot.css', import.meta.url).href }));
  const view = h('div', { class: 'rb' }); root.append(view);
  let li = Math.min(store.get('rb-level', 0), LEVELS.length - 1), prog = [], func = [], target = 'main', running = null, robot, gems, stars = store.get('rb-stars', {}), msg = null;
  function load() { const L = LEVELS[li]; robot = null; gems = new Set(); L.m.forEach((row, y) => [...row].forEach((ch, x) => { if (ch in ARROW) robot = { x, y, d: ARROW[ch] }; if (ch === 'G') gems.add(x + ',' + y); })); robot.start = { ...robot }; msg = null; }
  function reset() { clearInterval(running); running = null; load(); draw(); }
  const cell = (x, y) => LEVELS[li].m[y]?.[x] ?? '#';
  function expand() { const out = []; for (const c of prog) { if (c === 'C') for (const f of func) out.push({ c: f, f: true }); else out.push({ c }); } return out; }
  function run() {
    if (running) { reset(); return; }
    load(); const steps = expand(); let k = 0;
    running = setInterval(() => {
      if (k >= steps.length) { clearInterval(running); running = null; const ok = !gems.size; if (ok) win(); else { msg = { bad: t('rb_fail') }; sound('error'); draw(); } return; }
      const { c } = steps[k++]; robot.step = k - 1;
      if (c === 'F') { const [dx, dy] = DIRS[robot.d]; const nx = robot.x + dx, ny = robot.y + dy; if (cell(nx, ny) === '#') { clearInterval(running); running = null; msg = { bad: t('rb_crash') }; sound('error'); robot.crash = true; draw(); return; } robot.x = nx; robot.y = ny; sound('move'); }
      if (c === 'L') robot.d = (robot.d + 3) % 4; if (c === 'R') robot.d = (robot.d + 1) % 4;
      if (c === 'P') { const k2 = robot.x + ',' + robot.y; if (gems.has(k2)) { gems.delete(k2); sound('capture'); } }
      draw();
    }, 480);
    draw();
  }
  function win() {
    const L = LEVELS[li]; const used = prog.length + func.length; const s = used <= L.best + (L.fbest || 0) ? 3 : used <= L.best + 3 ? 2 : 1;
    stars[li] = Math.max(stars[li] || 0, s); store.set('rb-stars', stars); if (li + 1 < LEVELS.length) store.set('rb-level', Math.max(store.get('rb-level', 0), li + 1));
    msg = { ok: t('rb_win'), stars: s }; sound('win'); draw();
  }
  function add(c) {
    if (running) return; const L = LEVELS[li];
    if (target === 'func') { if (c === 'C') return; if (func.length >= (L.fmax || 0)) return toast(t('rb_full'), true); func.push(c); }
    else { if (prog.length >= L.max) return toast(t('rb_full'), true); prog.push(c); }
    sound('place'); msg = null; draw();
  }
  function draw() {
    const L = LEVELS[li]; const W = Math.max(...L.m.map(r => r.length)), H = L.m.length;
    view.innerHTML = '';
    const levels = h('div', { class: 'rb-levels' }, LEVELS.map((_, k) => h('button', { type: 'button', class: (k === li ? 'on ' : '') + (k > store.get('rb-level', 0) ? 'lock' : ''), disabled: k > store.get('rb-level', 0), onclick: () => { li = k; prog = []; func = []; target = 'main'; reset(); } }, num(k + 1), h('small', {}, '⭐'.repeat(stars[k] || 0)))));
    const board = h('div', { class: 'rb-board', style: { '--w': W, '--h': H } });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const ch = cell(x, y); board.append(h('div', { class: 'rb-cell' + (ch === '#' ? ' void' : '') }, gems.has(x + ',' + y) ? h('span', { class: 'rb-gem', html: GEM_SVG }) : null)); }
    board.append(h('div', { class: 'rb-bot' + (robot.crash ? ' crash' : ''), style: { '--x': robot.x, '--y': robot.y, '--d': robot.d * 90 + 'deg' } }, h('span', { html: ROBOT_SVG }), h('i', { class: 'rb-dir' }, '▲')));
    const steps = expand();
    const progEl = (arr, key, max) => h('div', { class: 'rb-prog' + (target === key ? ' on' : ''), onclick: () => { target = key; draw(); } },
      h('div', { class: 'rb-ph' }, h('b', {}, key === 'main' ? t('rb_main') : t('rb_func')), h('small', {}, t('rb_slots', { n: num(arr.length), m: num(max) }))),
      h('div', { class: 'rb-slots' }, Array.from({ length: max }, (_, k) => { const c = arr[k]; const idx = key === 'main' ? k : null; const active = running && robot.step != null && key === 'main' && steps[robot.step] && !steps[robot.step].f && prog.slice(0, k).reduce((a, x) => a + (x === 'C' ? func.length : 1), 0) === robot.step;
        return h('button', { type: 'button', class: 'rb-slot' + (c ? ' full' : '') + (active ? ' act' : ''), onclick: (e) => { e.stopPropagation(); if (running || !c) { target = key; draw(); return; } arr.splice(k, 1); draw(); } }, c ? CMD[c] : ''); void idx; })));
    view.append(levels, h('div', { class: 'rb-main' },
      h('div', { class: 'rb-left' }, h('h3', {}, t('rb_level', { n: num(li + 1) })), board, h('small', { class: 'muted' }, t('rb_target', { n: num(L.best + (L.fbest || 0)) }))),
      h('div', { class: 'rb-right' },
        h('div', { class: 'rb-cmds' }, [['F', 'rb_fwd'], ['L', 'rb_left'], ['R', 'rb_right'], ['P', 'rb_pick']].concat(L.fmax ? [['C', 'rb_call']] : []).map(([c, k]) => h('button', { type: 'button', class: 'rb-cmd', onclick: () => add(c) }, h('span', {}, CMD[c]), h('small', {}, t(k))))),
        progEl(prog, 'main', L.max), L.fmax ? progEl(func, 'func', L.fmax) : null,
        h('div', { class: 'rb-acts' }, h('button', { type: 'button', class: 'btn gk-go', onclick: run }, running ? '⏹ ' + t('rb_stop') : '▶ ' + t('rb_run')), h('button', { type: 'button', class: 'btn ghost', onclick: () => { prog = []; func = []; reset(); } }, t('rb_clear'))),
        msg?.bad ? h('div', { class: 'ck-res bad' }, msg.bad) : null,
        msg?.ok ? h('div', { class: 'ck-res ok' }, msg.ok, ' ', '⭐'.repeat(msg.stars), li + 1 < LEVELS.length ? h('button', { type: 'button', class: 'btn', onclick: () => { li++; prog = []; func = []; target = 'main'; reset(); } }, t('rb_next')) : null) : null,
        h('p', { class: 'muted' }, t('rb_help')))));
  }
  load(); draw();
  return { unmount() { clearInterval(running); }, onLang() { draw(); } };
}
export const _levels = LEVELS;
