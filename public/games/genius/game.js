// تحدي العباقرة: مسابقة ذكاء بأسئلة متنوعة وأربعة اختيارات ووقت محدد، ونقاط إضافية للسرعة، ووسائل مساعدة.
import { h, t, addDict, sound, num, settings } from '../../assets/js/core.js';
import { tableGame, rnd } from '../../assets/js/gamekit.js';
import { pickQuestions, CATS } from '../../assets/js/qbank.js';

addDict({
  ar: {
    gn_cats: 'المجالات', gn_all: 'كل المجالات', gn_level: 'المستوى', gn_l1: 'مبتدئ (8–11 سنة)', gn_l2: 'متوسط (12–14)', gn_l3: 'متقدم (15–18)', gn_count: 'عدد الأسئلة', gn_time: 'وقت السؤال', gn_sec: '{n} ثانية',
    gn_q: 'السؤال {i} من {n}', gn_fifty: 'حذف إجابتين', gn_more: '+10 ثوانٍ', gn_skip: 'تخطٍّ (50 نقطة)', gn_wait: 'أجبت! بانتظار الآخرين…', gn_right: 'إجابة صحيحة! +{n}', gn_wrong: 'إجابة خاطئة', gn_timeout: 'انتهى الوقت',
    gn_turn: 'دور {name} للإجابة', gn_ready: 'جاهز؟', gn_points: '{n} نقطة', gn_correct: 'الإجابة الصحيحة: {a}', gn_mixed: 'منوعة',
    gn_rules: '<ol><li>يظهر سؤال وأربعة اختيارات، ولكل سؤال وقت محدد.</li><li>الإجابة الصحيحة = 100 نقطة، ومعها حتى 100 نقطة إضافية حسب سرعتك.</li><li>لكل لاعب ثلاث وسائل مساعدة تُستخدم مرة واحدة: <b>حذف إجابتين</b>، و<b>زيادة 10 ثوانٍ</b>، و<b>التخطي</b> مقابل 50 نقطة.</li><li>يفوز صاحب أعلى مجموع بعد آخر سؤال.</li></ol><p>تلعب وحدك، أو مع أصدقائك عبر الإنترنت (حتى 8 لاعبين) فيجيب الجميع في الوقت نفسه، أو على جهاز واحد بالتناوب.</p>',
  },
  en: {
    gn_cats: 'Subjects', gn_all: 'All subjects', gn_level: 'Level', gn_l1: 'Beginner (8–11)', gn_l2: 'Intermediate (12–14)', gn_l3: 'Advanced (15–18)', gn_count: 'Questions', gn_time: 'Time per question', gn_sec: '{n} s',
    gn_q: 'Question {i} of {n}', gn_fifty: '50:50', gn_more: '+10 s', gn_skip: 'Skip (50 pts)', gn_wait: 'Answered! Waiting for others…', gn_right: 'Correct! +{n}', gn_wrong: 'Wrong answer', gn_timeout: "Time's up",
    gn_turn: "{name}'s turn to answer", gn_ready: 'Ready?', gn_points: '{n} pts', gn_correct: 'Correct answer: {a}', gn_mixed: 'Mixed',
    gn_rules: '<ol><li>Each question has four options and a timer.</li><li>Correct = 100 points plus up to 100 speed bonus.</li><li>Three one-time lifelines: 50:50, +10 seconds, and skip for 50 points.</li></ol>',
  },
});
const COLORS = ['#e53935', '#1e78d6', '#2e9d43', '#f2b705', '#8e24aa', '#00897b', '#f4511e', '#5e35b1'];
const OPT_C = ['#e11d48', '#2563eb', '#d97706', '#16a34a'];
const OPT_S = ['▲', '◆', '●', '■'];
const REVEAL_MS = 2600;

function startQ(s, now) {
  s.phase = 'q'; s.ans = {}; s.removed = {}; s.extra = {};
  if (s.seq) { s.cur = s.order[0]; s.ci = 0; s.deadline = now + s.time * 1000 + 1200; s.qStart = now + 1200; }
  else { s.deadline = now + s.time * 1000 + 1200; s.qStart = now + 1200; }
}
function allDone(s) { return s.players.every((p, i) => s.ans[i] != null); }
function reveal(s, now) {
  s.phase = 'reveal'; s.revealUntil = now + REVEAL_MS;
  const Q = s.qs[s.qi];
  for (let i = 0; i < s.players.length; i++) {
    const a = s.ans[i];
    if (!a) { s.ans[i] = { c: -1 }; continue; }
    if (a.skip) { s.scores[i] += 50; a.gain = 50; continue; }
    if (a.c === Q.ok) { const total = s.time * 1000 + (s.extra[i] || 0); const left = Math.max(0, total - (a.t - s.qStart)); a.gain = 100 + Math.round(100 * left / total); s.scores[i] += a.gain; s.streak[i]++; }
    else { a.gain = 0; s.streak[i] = 0; }
  }
}
const def = {
  id: 'genius', name: { ar: 'تحدي العباقرة', en: 'Genius Challenge' }, counts: [1, 2, 3, 4, 5, 6, 7, 8], defaultCount: 1, colors: COLORS,
  options: () => [
    { key: 'cats', label: t('gn_cats'), choices: [['all', t('gn_all')], ...Object.entries(CATS).map(([k, c]) => [k, c.icon + ' ' + (c[settings.lang] || c.ar)])], def: 'all', wide: true },
    { key: 'lvl', label: t('gn_level'), choices: [[1, t('gn_l1')], [2, t('gn_l2')], [3, t('gn_l3')]], def: 2, wide: true },
    { key: 'n', label: t('gn_count'), choices: [[10, num(10)], [15, num(15)], [20, num(20)]], def: 10 },
    { key: 'time', label: t('gn_time'), choices: [[15, t('gn_sec', { n: num(15) })], [20, t('gn_sec', { n: num(20) })], [30, t('gn_sec', { n: num(30) })]], def: 20 },
  ],
  rules: () => t('gn_rules'),
  init(players, o) {
    const cats = o.cats && o.cats !== 'all' ? [o.cats] : Object.keys(CATS);
    const n = +o.n || 10;
    const humans = players.filter(p => p.type === 'human').length;
    const s = { players, qs: pickQuestions(n, { cats, lvl: +o.lvl || 2 }), qi: 0, time: +o.time || 20, scores: players.map(() => 0), streak: players.map(() => 0),
      life: players.map(() => ({ fifty: 1, more: 1, skip: 1 })), seq: humans > 1 && !players.some(p => p.type === 'remote') };
    s.order = players.map((p, i) => i);
    startQ(s, Date.now());
    return s;
  },
  view(s, seat) {
    const v = { ...s, qs: undefined, Q: { ...s.qs[s.qi] }, n: s.qs.length, now: Date.now() };
    if (s.phase === 'q') { delete v.Q.ok; v.ans = Object.fromEntries(Object.entries(s.ans).map(([k, a]) => [k, { done: true }])); if (s.ans[seat]) v.myAns = s.ans[seat]; }
    return v;
  },
  needs(s) {
    if (s.phase !== 'q') return [];
    if (s.seq) return [s.cur];
    return s.players.map((p, i) => i).filter(i => s.ans[i] == null);
  },
  apply(s, seat, a) {
    if (s.phase !== 'q') return t('gk_err');
    if (s.seq && s.cur !== seat) return t('gk_err');
    if (s.ans[seat]) return t('gk_err');
    const now = Date.now();
    const L = s.life[seat];
    if (a.type === 'fifty') { if (!L.fifty) return t('gk_err'); L.fifty = 0; const Q = s.qs[s.qi]; const wrong = [0, 1, 2, 3].filter(i => i !== Q.ok); wrong.splice(rnd(3), 1); s.removed[seat] = wrong; return null; }
    if (a.type === 'more') { if (!L.more) return t('gk_err'); L.more = 0; s.extra[seat] = 10000; if (s.seq) s.deadline += 10000; else s.deadline = Math.max(s.deadline, now + 10000); return null; }
    if (a.type === 'skip') { if (!L.skip) return t('gk_err'); L.skip = 0; s.ans[seat] = { skip: true, t: now }; }
    else if (a.type === 'answer') { const c = a.c | 0; if (c < 0 || c > 3 || s.removed[seat]?.includes(c)) return t('gk_err'); s.ans[seat] = { c, t: Math.max(now, s.qStart) }; }
    else return t('gk_err');
    if (s.seq) { s.ci++; if (s.ci < s.order.length) { s.cur = s.order[s.ci]; s.qStart = now + 600; s.deadline = now + 600 + s.time * 1000; } else reveal(s, now); }
    else if (allDone(s)) reveal(s, now);
    return null;
  },
  tick(s, now) {
    if (s.phase === 'q' && now > s.deadline) {
      if (s.seq) { s.ans[s.cur] = s.ans[s.cur] || { c: -1 }; s.ci++; if (s.ci < s.order.length) { s.cur = s.order[s.ci]; s.qStart = now + 600; s.deadline = now + 600 + s.time * 1000; } else reveal(s, now); }
      else reveal(s, now);
      return true;
    }
    if (s.phase === 'reveal' && now > s.revealUntil) {
      if (s.qi + 1 >= s.qs.length) { s.phase = 'over'; return true; }
      s.qi++; startQ(s, now); return true;
    }
    return false;
  },
  bot(s, seat, lv) {
    const Q = s.qs[s.qi];
    const p = lv === 'easy' ? .5 : lv === 'mid' ? .7 : .86;
    const opts = [0, 1, 2, 3].filter(i => !s.removed[seat]?.includes(i));
    return { type: 'answer', c: Math.random() < p ? Q.ok : opts[rnd(opts.length)] };
  },
  botDelay: (s) => 1800 + rnd(Math.min(s.time * 1000 * .55, 7000)),
  levels: [['easy', t('gk_easy')], ['mid', t('gk_mid')], ['hard', t('gk_hard')]],
  over: (s) => s.phase === 'over',
  resultDelay: 200,
  result(s, seat) {
    const order = s.players.map((p, i) => i).sort((a, b) => s.scores[b] - s.scores[a]);
    const w = order[0];
    const solo = s.players.length === 1;
    return { title: solo ? t('gk_gameOver') : w === seat ? t('gk_youWin') : t('gk_gameOver'), big: solo ? t('gn_points', { n: num(s.scores[0]) }) : t('gk_winner', { name: s.players[w].name }), win: solo ? s.scores[0] >= s.qs.length * 100 : w === seat,
      lines: order.map((i, k) => ({ label: ['🥇', '🥈', '🥉'][k] || '', avatar: s.players[i].avatar, value: num(s.scores[i]), color: COLORS[i], label2: s.players[i].name })).map(l => ({ ...l, label: (l.label ? l.label + ' ' : '') + l.label2 })) };
  },
  status(v, ui) {
    if (v.phase === 'reveal') return t('gn_correct', { a: v.Q.opts[v.Q.ok] });
    if (v.seq) return t('gn_turn', { name: ui.name(v.cur) });
    return t('gn_q', { i: num(v.qi + 1), n: num(v.n) });
  },
  render(el, v, ui) { renderGenius(el, v, ui); },
};

function renderGenius(el, v, ui) {
  const me = ui.seat, Q = v.Q, cat = CATS[Q.cat] || {};
  const nowLocal = Date.now(), skew = nowLocal - v.now; // فرق ساعة الضيف عن المضيف
  const left = Math.max(0, v.deadline + skew - nowLocal), started = Math.max(0, v.qStart + skew - nowLocal);
  const total = v.time * 1000 + (v.extra?.[me] || 0);
  const answered = v.phase === 'q' && (v.myAns || v.ans?.[me]);
  const myTurn = ui.myTurn && v.phase === 'q' && !answered;
  const removed = v.removed?.[me] || [];
  const wrap = h('div', { class: 'gn-wrap' });
  wrap.append(h('div', { class: 'gn-head' },
    h('span', { class: 'gn-cat', style: { background: cat.color } }, cat.icon, ' ', cat[settings.lang] || cat.ar),
    h('span', { class: 'gn-qn' }, t('gn_q', { i: num(v.qi + 1), n: num(v.n) })),
    v.players.length === 1 ? h('b', { class: 'gn-myscore' }, '⭐ ', num(v.scores[0])) : null));
  const bar = h('div', { class: 'gn-timer' }, h('i', { style: { animationDuration: total + 'ms', animationDelay: (started - (total - Math.max(0, left - started)) + 0) + 'ms', animationPlayState: v.phase === 'q' ? 'running' : 'paused' } }));
  // نحسب نقطة البداية بدقة: الجزء المنقضي من الوقت
  const elapsed = Math.max(0, total - Math.max(0, left - started));
  bar.firstChild.style.animationDelay = started > 0 ? started + 'ms' : (-elapsed) + 'ms';
  wrap.append(bar);
  wrap.append(h('div', { class: 'gn-q' }, Q.q));
  const opts = h('div', { class: 'gn-opts' }, Q.opts.map((o, i) => {
    const isRemoved = removed.includes(i);
    let cls = 'gn-opt';
    if (v.phase === 'reveal') { cls += i === Q.ok ? ' ok' : ' no'; if (v.ans?.[me]?.c === i && i !== Q.ok) cls += ' mine-bad'; }
    else if (answered && v.myAns?.c === i) cls += ' picked';
    if (isRemoved) cls += ' removed';
    const b = h('button', { type: 'button', class: cls, style: { '--oc': OPT_C[i] }, disabled: !myTurn || isRemoved }, h('span', { class: 'gn-sym' }, OPT_S[i]), h('span', { class: 'gn-txt', dir: 'auto' }, o),
      v.phase === 'reveal' ? h('span', { class: 'gn-who' }, v.players.map((p, k) => v.ans?.[k]?.c === i ? h('span', { title: p.name }, p.avatar) : null)) : null);
    if (myTurn && !isRemoved) b.addEventListener('click', () => { sound('place'); ui.act({ type: 'answer', c: i }); });
    return b;
  }));
  wrap.append(opts);
  const L = v.life[me] || {};
  const foot = h('div', { class: 'gn-foot' });
  if (v.phase === 'q') {
    if (myTurn) foot.append(h('div', { class: 'gn-life' },
      h('button', { type: 'button', class: 'gn-lb', disabled: !L.fifty, onclick: () => ui.act({ type: 'fifty' }) }, '✂️ ', t('gn_fifty')),
      h('button', { type: 'button', class: 'gn-lb', disabled: !L.more, onclick: () => ui.act({ type: 'more' }) }, '⏱️ ', t('gn_more')),
      h('button', { type: 'button', class: 'gn-lb', disabled: !L.skip, onclick: () => ui.act({ type: 'skip' }) }, '⏭️ ', t('gn_skip'))));
    else if (answered) foot.append(h('p', { class: 'gn-msg' }, t('gn_wait')));
    else if (v.seq) foot.append(h('p', { class: 'gn-msg' }, t('gn_turn', { name: ui.name(v.cur) })));
  } else if (v.phase === 'reveal') {
    const a = v.ans?.[me];
    if (a) foot.append(h('p', { class: 'gn-res ' + (a.gain ? 'ok' : 'bad') }, a.skip ? t('gn_skip') : a.c === -1 ? t('gn_timeout') : a.gain ? t('gn_right', { n: num(a.gain) }) : t('gn_wrong')));
    if (a?.gain && !a.skip) sound('win'); else if (a && !a.skip) sound('error');
  }
  if (v.players.length > 1) foot.append(h('div', { class: 'gn-board' }, v.players.map((p, i) => i).sort((a, b) => v.scores[b] - v.scores[a]).map(i => ui.plate(i, h('b', { class: 'gn-sc' }, num(v.scores[i]), v.phase === 'q' && v.ans?.[i] ? ' ✔' : '')))));
  wrap.append(foot);
  el.append(wrap);
}

export async function mount(root, ctx) {
  if (!document.getElementById('gn-css')) document.head.append(h('link', { id: 'gn-css', rel: 'stylesheet', href: new URL('./genius.css', import.meta.url).href }));
  return tableGame(root, ctx, def);
}
export const _test = { def };
