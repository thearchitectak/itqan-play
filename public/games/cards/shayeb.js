// الشايب: من 2 إلى 6 لاعبين. تُرمى الأزواج، ويسحب كل لاعب ورقة مخفية من جاره، ومن يبقى معه الشايب في النهاية يخسر.
import { h, t, addDict, num, sound } from '../../assets/js/core.js';
import { tableGame } from '../../assets/js/gamekit.js';
import { deck, shuffle, sortHand, rk, cardEl, back, loadCss } from './common.js';
addDict({
  ar: {
    sh_draw: 'دورك: اسحب ورقة من أوراق {name}', sh_drew: 'سحب {a} ورقة من {b}', sh_pair: 'وكوّن زوجًا ورماه ✨', sh_out: 'خرج {name} بلا أوراق 🎉', sh_pairs: 'الأزواج المرمية', sh_loser: 'بقي الشايب مع {name}! 🤴🏻',
    sh_you: 'سحبتَ:', sh_safe: 'نجوت من الشايب 🎉', sh_lose: 'بقي الشايب معك 😅',
    sh_rules: `<h4>الفكرة</h4><p>تُسحب ثلاثة شياب من الرزمة ويبقى <b>شايب واحد</b> لا زوج له. توزَّع كل الأوراق على اللاعبين.</p>
<ol><li>يرمي كل لاعب كل زوجين متشابهين في الرتبة (مثل سبعتين أو بنتين).</li><li>في دورك تسحب ورقة واحدة <b>دون أن تراها</b> من أوراق اللاعب الذي يليك. فإن كوّنت زوجًا رميته.</li><li>من تنتهي أوراقه يخرج فائزًا.</li><li>يخسر اللاعب الأخير الذي يبقى معه الشايب.</li></ol><p class="muted">نصيحة: لا تُظهر على وجهك أنك تحمل الشايب 😉</p>`,
  },
  en: { sh_draw: 'Your turn: draw from {name}', sh_drew: '{a} drew from {b}', sh_pair: 'and discarded a pair ✨', sh_out: '{name} is out 🎉', sh_pairs: 'Pairs', sh_loser: '{name} is left with the King! 🤴🏻', sh_you: 'You drew:', sh_safe: 'You escaped the King 🎉', sh_lose: 'You kept the King 😅', sh_rules: '<p>Old Maid with a single king. Discard pairs, draw a hidden card from your neighbour; the last player holding the king loses.</p>' },
});
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];
function stripPairs(hand) {
  const by = {}; for (const c of hand) (by[rk(c)] ||= []).push(c);
  const keep = [], gone = [];
  for (const r of Object.keys(by)) { const a = by[r]; while (a.length >= 2) gone.push(a.shift(), a.shift()); keep.push(...a); }
  return { keep, gone };
}
const active = (s) => s.hands.map((x, i) => x.length ? i : -1).filter(i => i >= 0);
function nextActive(s, from) { for (let k = 1; k <= s.n; k++) { const i = (from + k) % s.n; if (s.hands[i].length) return i; } return -1; }
const def = {
  id: 'shayeb', name: { ar: 'الشايب', en: 'Old Maid' }, counts: [2, 3, 4, 5, 6], defaultCount: 4, hidden: true, colors: COLORS,
  rules: () => t('sh_rules'),
  init(players) {
    const n = players.length; const keepK = ['KS', 'KH', 'KD', 'KC'][Math.floor(Math.random() * 4)];
    const d = shuffle(deck().filter(c => rk(c) !== 'K' || c === keepK));
    const s = { players, n, hands: Array.from({ length: n }, () => []), pairs: Array(n).fill(0), out: [], flash: null };
    d.forEach((c, i) => s.hands[i % n].push(c));
    for (let i = 0; i < n; i++) { const r = stripPairs(s.hands[i]); s.hands[i] = shuffle(r.keep); s.pairs[i] += r.gone.length / 2; }
    for (let i = 0; i < n; i++) if (!s.hands[i].length) s.out.push(i);
    s.turn = nextActive(s, Math.floor(Math.random() * n) - 1 + n); s.from = nextActive(s, s.turn);
    if (active(s).length <= 1) s.phase = 'over'; else s.phase = 'play';
    return s;
  },
  view(s, seat) { return { ...s, hands: undefined, hand: sortHand(s.hands[seat]), counts: s.hands.map(x => x.length), lastGot: s.flash && s.flash.a === seat ? s.flash.card : null, flash: s.flash ? { ...s.flash, card: undefined } : null }; },
  needs(s) { return s.phase === 'play' ? [s.turn] : []; },
  apply(s, seat, a) {
    if (a.type !== 'draw' || !(a.i >= 0 && a.i < s.hands[s.from].length)) return t('gk_err');
    const from = s.from; const [card] = s.hands[from].splice(a.i, 1);
    s.hands[seat].push(card);
    const r = stripPairs(s.hands[seat]); s.hands[seat] = shuffle(r.keep); const paired = r.gone.length > 0; s.pairs[seat] += r.gone.length / 2;
    shuffle(s.hands[from]);
    s.flash = { a: seat, b: from, paired, card };
    for (const i of [from, seat]) if (!s.hands[i].length && !s.out.includes(i)) s.out.push(i);
    if (active(s).length <= 1) { s.phase = 'over'; s.loser = active(s)[0]; return null; }
    s.turn = nextActive(s, seat); s.from = nextActive(s, s.turn); return null;
  },
  bot(s, seat) { return { type: 'draw', i: Math.floor(Math.random() * s.hands[s.from].length) }; },
  botDelay: 1100,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const L = s.loser ?? s.hands.findIndex(x => x.length);
    return { title: seat === L ? t('sh_lose') : t('sh_safe'), big: t('sh_loser', { name: s.players[L]?.name || '' }), win: seat !== L,
      lines: [...s.out, L].filter((x, i, a) => x >= 0 && a.indexOf(x) === i).map((k, i) => ({ label: (i + 1) + '. ' + s.players[k].name, value: k === L ? '🤴🏻' : '✅', color: COLORS[k] })) };
  },
  status(v, ui) { return ui.myTurn ? t('sh_draw', { name: ui.name(v.from) }) : t('gk_turnOf', { name: ui.name(v.turn) }); },
  render(el, v, ui) {
    const me = ui.seat;
    const wrap = h('div', { class: 'bl-wrap cx-wrap cx-simple' });
    const opps = h('div', { class: 'cx-opps' });
    for (let k = 1; k < v.n; k++) {
      const s = (me + k) % v.n;
      opps.append(h('div', { class: 'cx-opp' + (v.counts[s] ? '' : ' out') }, ui.plate(s, h('small', { class: 'cx-badge' }, '🂠 ', num(v.counts[s]))),
        v.counts[s] ? h('div', { class: 'bl-backs' }, Array.from({ length: Math.min(v.counts[s], 12) }, back)) : h('span', { class: 'cx-badge gold' }, '✅'),
        v.pairs[s] ? h('small', {}, '✨ ', num(v.pairs[s])) : null));
    }
    wrap.append(opps);
    const f = v.flash;
    const center = h('div', { class: 'bl-center' }, h('div', { class: 'cx-mid' },
      f ? h('span', { class: 'cx-badge' + (f.paired ? ' gold' : '') }, t('sh_drew', { a: ui.name(f.a), b: ui.name(f.b) }), f.paired ? ' ' + t('sh_pair') : '') : null,
      v.lastGot ? h('div', { class: 'cx-played' }, h('small', {}, t('sh_you')), cardEl(v.lastGot, { cls: 'mini' })) : null,
      ui.myTurn ? h('div', { class: 'cx-panel' }, h('b', {}, t('sh_draw', { name: ui.name(v.from) })),
        h('div', { class: 'cx-fan' }, Array.from({ length: v.counts[v.from] }, (_, i) => h('button', { type: 'button', onclick: () => { sound('place'); ui.act({ type: 'draw', i }); } }, back())))) : null));
    wrap.append(center);
    wrap.append(h('div', { class: 'bl-me' }, h('div', { class: 'bl-mebar' }, ui.plate(me, h('small', { class: 'cx-badge' }, '✨ ', t('sh_pairs'), ' ', num(v.pairs[me])))),
      h('div', { class: 'bl-hand cx-hand', style: { '--n': v.hand.length } }, v.hand.map((c, i) => h('div', { class: 'bl-hc' + (rk(c) === 'K' ? ' sel' : ''), style: { '--i': i } }, cardEl(c))))));
    el.append(wrap);
  },
};
export async function mount(root, ctx) { loadCss(); return tableGame(root, ctx, def); }
export const _test = { def };
