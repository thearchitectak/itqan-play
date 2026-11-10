// السلم والثعبان التعليمي: لا تصعد السلم إلا بإجابة صحيحة، وتنجو من الثعبان إن أجبت صحيحًا.
import { h, t, addDict, sound, num, settings } from '../../assets/js/core.js';
import { tableGame, rnd, dieFace } from '../../assets/js/gamekit.js';
import { pickQuestions, CATS } from '../../assets/js/qbank.js';

addDict({
  ar: {
    sn_roll: 'ارمِ النرد', sn_ladder: 'سلّم! أجب لتصعد إلى {n}', sn_snake: 'ثعبان! أجب لتنجو من النزول إلى {n}', sn_up: '{name} صعد السلم 🪜', sn_down: '{name} نزل مع الثعبان 🐍', sn_safe: '{name} نجا من الثعبان 🛡️', sn_stay: '{name} لم يصعد',
    sn_cats: 'مجال الأسئلة', sn_all: 'منوعة', sn_level: 'المستوى', sn_exact: 'الوصول إلى 100', sn_exactY: 'بالرقم المضبوط', sn_exactN: 'بأي رقم', sn_six: 'رمية 6 تعطي دورًا إضافيًا', sn_on: 'نعم', sn_off: 'لا',
    sn_rules: '<ol><li>ارمِ النرد وتقدم بعدد نقاطه.</li><li>إن وقفت عند أسفل <b>سلّم</b> يظهر لك سؤال: إجابة صحيحة = تصعد، وخاطئة = تبقى مكانك.</li><li>إن وقفت عند رأس <b>ثعبان</b> يظهر سؤال: إجابة صحيحة = تنجو، وخاطئة = تنزل إلى ذيله.</li><li>أول من يصل إلى الخانة 100 يفوز.</li></ol>',
  },
  en: {
    sn_roll: 'Roll', sn_ladder: 'Ladder! Answer to climb to {n}', sn_snake: 'Snake! Answer to avoid sliding to {n}', sn_up: '{name} climbed 🪜', sn_down: '{name} slid down 🐍', sn_safe: '{name} escaped the snake 🛡️', sn_stay: "{name} didn't climb",
    sn_cats: 'Questions', sn_all: 'Mixed', sn_level: 'Level', sn_exact: 'Reaching 100', sn_exactY: 'Exact roll', sn_exactN: 'Any roll', sn_six: 'A 6 gives another turn', sn_on: 'Yes', sn_off: 'No',
    sn_rules: '<ol><li>Roll and move.</li><li>At a ladder foot, answer correctly to climb.</li><li>At a snake head, answer correctly to escape.</li><li>First to 100 wins.</li></ol>',
  },
});
const COLORS = ['#e53935', '#1e78d6', '#2e9d43', '#f2b705'];
const LADDERS = { 3: 22, 8: 30, 28: 55, 36: 44, 51: 72, 58: 77, 71: 92, 80: 99 };
const SNAKES = { 17: 4, 27: 9, 47: 26, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79 };
function cell(n) { const r = Math.floor((n - 1) / 10), c = (n - 1) % 10; const x = r % 2 === 0 ? c : 9 - c; return [x + .5, 9 - r + .5]; }

const def = {
  id: 'snakes', name: { ar: 'السلم والثعبان', en: 'Snakes & Ladders' }, counts: [2, 3, 4], colors: COLORS, botDelay: 900,
  levels: [['easy', t('gk_easy')], ['hard', t('gk_hard')]],
  options: () => [
    { key: 'cats', label: t('sn_cats'), choices: [['all', t('sn_all')], ...Object.entries(CATS).map(([k, c]) => [k, c.icon + ' ' + (c[settings.lang] || c.ar)])], def: 'math', wide: true },
    { key: 'lvl', label: t('sn_level'), choices: [[1, t('gn_l1')], [2, t('gn_l2')], [3, t('gn_l3')]], def: 1, wide: true },
    { key: 'exact', label: t('sn_exact'), choices: [['n', t('sn_exactN')], ['y', t('sn_exactY')]], def: 'n' },
    { key: 'six', label: t('sn_six'), choices: [['y', t('sn_on')], ['n', t('sn_off')]], def: 'y' },
  ],
  rules: () => t('sn_rules'),
  init(players, o) {
    return { players, pos: players.map(() => 1), turn: 0, phase: 'roll', dice: null, q: null, msg: null, exact: o.exact === 'y', six: o.six !== 'n',
      cats: o.cats && o.cats !== 'all' ? [o.cats] : Object.keys(CATS), lvl: +o.lvl || 1, winner: null, rollId: 0 };
  },
  view(s, seat) { const v = { ...s }; if (s.q && s.phase === 'question') { v.q = { ...s.q }; delete v.q.ok; } return v; },
  needs: (s) => s.phase === 'over' ? [] : [s.turn],
  apply(s, seat, a) {
    if (seat !== s.turn) return t('gk_err');
    const name = s.players[seat].name;
    if (s.phase === 'roll' && a.type === 'roll') {
      const d = 1 + rnd(6); s.dice = d; s.rollId++; s.msg = null;
      let to = s.pos[seat] + d;
      if (to > 100) to = s.exact ? s.pos[seat] : 100;
      s.pos[seat] = to;
      if (to === 100) { s.phase = 'over'; s.winner = seat; return null; }
      if (LADDERS[to] || SNAKES[to]) {
        const kind = LADDERS[to] ? 'ladder' : 'snake';
        s.q = { ...pickQuestions(1, { cats: s.cats, lvl: s.lvl })[0], kind, from: to, to: LADDERS[to] || SNAKES[to] };
        s.phase = 'question'; return null;
      }
      if (!(s.six && d === 6)) s.turn = (seat + 1) % s.players.length;
      return null;
    }
    if (s.phase === 'question' && a.type === 'answer') {
      const ok = (a.c | 0) === s.q.ok; const q = s.q;
      s.last = { c: a.c | 0, ok, right: q.ok, q: q.q, opts: q.opts };
      if (q.kind === 'ladder') { if (ok) { s.pos[seat] = q.to; s.msg = { k: 'sn_up', name }; } else s.msg = { k: 'sn_stay', name }; }
      else { if (!ok) { s.pos[seat] = q.to; s.msg = { k: 'sn_down', name }; } else s.msg = { k: 'sn_safe', name }; }
      s.q = null; s.phase = 'roll';
      if (s.pos[seat] === 100) { s.phase = 'over'; s.winner = seat; return null; }
      if (!(s.six && s.dice === 6)) s.turn = (seat + 1) % s.players.length;
      return null;
    }
    return t('gk_err');
  },
  bot(s, seat, lv) {
    if (s.phase === 'roll') return { type: 'roll' };
    const p = lv === 'easy' ? .5 : .8;
    return { type: 'answer', c: Math.random() < p ? s.q.ok : rnd(4) };
  },
  botDelay: (s) => s.phase === 'question' ? 2600 : 900,
  over: (s) => s.phase === 'over',
  result(s, seat) { const w = s.winner; return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat, lines: s.players.map((p, i) => i).sort((a, b) => s.pos[b] - s.pos[a]).map(i => ({ label: s.players[i].name, avatar: s.players[i].avatar, value: num(s.pos[i]), color: COLORS[i] })) }; },
  status(v, ui) { if (v.phase === 'question') return t(v.q.kind === 'ladder' ? 'sn_ladder' : 'sn_snake', { n: num(v.q.to) }); return ui.myTurn ? t('sn_roll') : t('gk_turnOf', { name: ui.name(v.turn) }); },
  render(el, v, ui) { renderSnakes(el, v, ui); },
  preview() { return boardSvg({ pos: [], players: [] }); },
};
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); parent?.append(e); return e; };
function boardSvg(v) {
  const svg = sv('svg', { viewBox: '0 0 10 10', class: 'sn-svg' });
  const pal = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe'];
  for (let n = 1; n <= 100; n++) {
    const [x, y] = cell(n);
    sv('rect', { x: x - .5, y: y - .5, width: 1, height: 1, fill: pal[(n + Math.floor((n - 1) / 10)) % 5], stroke: '#fff', 'stroke-width': .03 }, svg);
    const tx = sv('text', { x: x - .42, y: y - .26, 'font-size': .26, 'font-weight': 800, fill: '#334155' }, svg); tx.textContent = num(n);
  }
  const s100 = cell(100); const tr = sv('text', { x: s100[0], y: s100[1] + .25, 'font-size': .55, 'text-anchor': 'middle' }, svg); tr.textContent = '🏆';
  for (const [a, b] of Object.entries(LADDERS)) {
    const [x1, y1] = cell(+a), [x2, y2] = cell(b); const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * .17, ny = dx / L * .17;
    const g = sv('g', { class: 'sn-ladder' }, svg);
    sv('line', { x1: x1 + nx, y1: y1 + ny, x2: x2 + nx, y2: y2 + ny }, g); sv('line', { x1: x1 - nx, y1: y1 - ny, x2: x2 - nx, y2: y2 - ny }, g);
    const k = Math.max(2, Math.round(L / .35)); for (let i = 1; i < k; i++) { const f = i / k; sv('line', { x1: x1 + dx * f + nx, y1: y1 + dy * f + ny, x2: x1 + dx * f - nx, y2: y1 + dy * f - ny, class: 'rung' }, g); }
  }
  const SC = ['#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2'];
  Object.entries(SNAKES).forEach(([a, b], i) => {
    const [x1, y1] = cell(+a), [x2, y2] = cell(b); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
    const c1 = [mx - dy * .25 + (x1 - mx) * .5, my + dx * .25 + (y1 - my) * .5], c2 = [mx + dy * .25 + (x2 - mx) * .5, my - dx * .25 + (y2 - my) * .5];
    const d = `M${x1},${y1} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x2},${y2}`;
    sv('path', { d, class: 'sn-body', stroke: SC[i % 5] }, svg); sv('path', { d, class: 'sn-pattern' }, svg);
    sv('circle', { cx: x1, cy: y1, r: .2, fill: SC[i % 5] }, svg);
    sv('circle', { cx: x1 - .07, cy: y1 - .06, r: .045, fill: '#fff' }, svg); sv('circle', { cx: x1 + .07, cy: y1 - .06, r: .045, fill: '#fff' }, svg);
  });
  const groups = {};
  v.pos.forEach((p, i) => (groups[p] ||= []).push(i));
  for (const [p, list] of Object.entries(groups)) list.forEach((i, k) => {
    const [x, y] = cell(+p); const off = list.length > 1 ? [[-.18, -.12], [.18, -.12], [-.18, .18], [.18, .18]][k] : [0, 0];
    const g = sv('g', { class: 'sn-tok', style: `transform: translate(${x + off[0]}px, ${y + off[1]}px)` }, svg);
    sv('circle', { cx: 0, cy: 0, r: .26, fill: COLORS[i], stroke: '#fff', 'stroke-width': .06 }, g);
    const tt = sv('text', { x: 0, y: .1, 'font-size': .28, 'text-anchor': 'middle' }, g); tt.textContent = v.players[i]?.avatar || '';
  });
  return svg;
}
function renderSnakes(el, v, ui) {
  const me = ui.seat;
  const side = h('div', { class: 'sn-side' },
    h('div', { class: 'sn-plist' }, v.players.map((p, i) => ui.plate(i, h('b', { class: 'sn-pos' }, num(v.pos[i]))))),
    v.dice ? h('div', { class: 'sn-dice', key: v.rollId }, dieFace(v.dice, 'roll')) : null,
    ui.myTurn && v.phase === 'roll' ? h('button', { type: 'button', class: 'gk-bigbtn gk-pulse', style: { '--pc': COLORS[me] }, onclick: () => { sound('draw'); ui.act({ type: 'roll' }); } }, '🎲 ', t('sn_roll')) : null,
    v.msg ? h('div', { class: 'sn-msg' }, t(v.msg.k, { name: v.msg.name })) : null,
    v.last && v.phase === 'roll' && !v.q ? h('div', { class: 'sn-last ' + (v.last.ok ? 'ok' : 'bad') }, h('small', {}, v.last.q), h('b', {}, v.last.opts[v.last.right])) : null);
  const wrap = h('div', { class: 'sn-wrap' }, h('div', { class: 'sn-board' }, boardSvg(v)), side);
  if (v.phase === 'question' && v.q) {
    const can = ui.myTurn;
    wrap.append(h('div', { class: 'sn-qwrap' }, h('div', { class: 'sn-qcard ' + v.q.kind },
      h('div', { class: 'sn-qhead' }, v.q.kind === 'ladder' ? '🪜 ' : '🐍 ', t(v.q.kind === 'ladder' ? 'sn_ladder' : 'sn_snake', { n: num(v.q.to) })),
      h('div', { class: 'sn-qtext' }, ui.name(v.turn), ': ', v.q.q),
      h('div', { class: 'sn-qopts' }, v.q.opts.map((o, i) => h('button', { type: 'button', class: 'sn-qopt', disabled: !can, onclick: can ? () => ui.act({ type: 'answer', c: i }) : null }, o))))));
  }
  el.append(wrap);
}
export async function mount(root, ctx) {
  if (!document.getElementById('sn-css')) document.head.append(h('link', { id: 'sn-css', rel: 'stylesheet', href: new URL('./snakes.css', import.meta.url).href }));
  return tableGame(root, ctx, def);
}
export const _test = { def };
