// ارسم وخمّن: لاعب يرسم كلمة والباقون يخمنونها. عبر الإنترنت يكتب المخمّنون إجاباتهم،
// وعلى جهاز واحد يخمّن الحاضرون بأصواتهم ويضغط الرسّام اسم من أصاب.
import { h, t, addDict, sound, num, ico } from '../../assets/js/core.js';
import { tableGame, rnd, shuffle } from '../../assets/js/gamekit.js';

addDict({
  ar: {
    dr_rounds: 'عدد الأدوار لكل لاعب', dr_time: 'وقت الرسم', dr_cat: 'نوع الكلمات', dr_mix: 'منوعة', dr_draw: 'ارسم: {w}', dr_guess: 'خمّن ما يرسمه {name}', dr_type: 'اكتب تخمينك…', dr_send: 'خمّن',
    dr_got: '{name} عرف الكلمة! 🎉', dr_close: 'قريب جدًا!', dr_word: 'الكلمة كانت: {w}', dr_pick: 'اختر كلمة لترسمها', dr_who: 'من عرف الكلمة؟ اضغط اسمه', dr_skip: 'تخطَّ الكلمة', dr_clear: 'امسح', dr_undo: 'تراجع', dr_next: 'التالي',
    dr_wait: 'بانتظار {name} لاختيار كلمة…', dr_letters: '{n} أحرف', dr_end: 'انتهى الوقت',
    dr_rules: '<ol><li>في كل دور يختار أحد اللاعبين كلمة من ثلاث ويرسمها دون كتابة حروف.</li><li><b>عبر الإنترنت:</b> يكتب الباقون تخميناتهم، وكلما أسرعت في معرفة الكلمة زادت نقاطك، ويأخذ الرسّام نقاطًا عن كل من عرفها.</li><li><b>على جهاز واحد:</b> يخمّن الحاضرون بأصواتهم، ويضغط الرسّام اسم أول من أصاب.</li><li>يفوز صاحب أعلى مجموع بعد انتهاء الأدوار.</li></ol><h4>ماذا تتعلم؟</h4><p>المفردات، والتعبير البصري، وسرعة البديهة.</p>',
  },
  en: {
    dr_rounds: 'Turns per player', dr_time: 'Drawing time', dr_cat: 'Words', dr_mix: 'Mixed', dr_draw: 'Draw: {w}', dr_guess: 'Guess what {name} is drawing', dr_type: 'Type your guess…', dr_send: 'Guess',
    dr_got: '{name} got it! 🎉', dr_close: 'So close!', dr_word: 'The word was: {w}', dr_pick: 'Pick a word to draw', dr_who: 'Who guessed it? Tap their name', dr_skip: 'Skip word', dr_clear: 'Clear', dr_undo: 'Undo', dr_next: 'Next',
    dr_wait: 'Waiting for {name} to pick a word…', dr_letters: '{n} letters', dr_end: "Time's up",
    dr_rules: '<ol><li>One player picks a word and draws it — no letters!</li><li>Online: others type guesses; faster guesses score more.</li><li>One device: guess aloud; the artist taps who got it.</li></ol>',
  },
});
const WORDS = {
  animals: ['أسد', 'فيل', 'زرافة', 'جمل', 'قطة', 'سمكة', 'فراشة', 'أرنب', 'سلحفاة', 'بطريق', 'حصان', 'نحلة', 'عنكبوت', 'ثعبان', 'بومة', 'دلفين', 'تمساح', 'قرد', 'بقرة', 'ديك'],
  objects: ['مظلة', 'ساعة', 'نظارة', 'مفتاح', 'كرسي', 'سرير', 'هاتف', 'قلم', 'كتاب', 'حقيبة', 'مقص', 'مصباح', 'شمعة', 'كأس', 'ملعقة', 'سلم', 'باب', 'نافذة', 'جرس', 'مزهرية'],
  food: ['تفاحة', 'موزة', 'بطيخ', 'عنب', 'جزر', 'بيتزا', 'كعكة', 'خبز', 'بيضة', 'آيس كريم', 'فراولة', 'أناناس', 'برتقالة', 'شاي', 'تمر', 'ليمون', 'فطيرة', 'حليب', 'سمبوسة', 'كمثرى'],
  nature: ['شمس', 'قمر', 'نجمة', 'سحابة', 'مطر', 'جبل', 'شجرة', 'زهرة', 'بحر', 'بركان', 'قوس قزح', 'نخلة', 'صحراء', 'شلال', 'ثلج', 'برق', 'جزيرة', 'نهر', 'موجة', 'كهف'],
  science: ['مغناطيس', 'صاروخ', 'تلسكوب', 'مجهر', 'بطارية', 'روبوت', 'كوكب', 'قمر صناعي', 'ذرة', 'بوصلة', 'ترمومتر', 'مصباح كهربائي', 'ميزان', 'عدسة', 'طائرة', 'سيارة', 'قطار', 'سفينة', 'دراجة', 'حاسوب'],
  jobs: ['طبيب', 'معلم', 'طيار', 'مهندس', 'شرطي', 'رسام', 'طباخ', 'مزارع', 'رائد فضاء', 'رجل إطفاء', 'نجار', 'خياط', 'صياد', 'مصور', 'لاعب كرة'],
};
const CAT_NAME = { animals: 'حيوانات 🦁', objects: 'أشياء 🏠', food: 'أطعمة 🍎', nature: 'طبيعة 🌈', science: 'علوم واختراعات 🚀', jobs: 'مهن 👩‍⚕️' };
const COLORS = ['#e53935', '#1e78d6', '#2e9d43', '#f2b705', '#8e24aa', '#00897b', '#f4511e', '#5e35b1'];
const PEN = ['#111827', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#a16207', '#ffffff'];
const norm = (w) => String(w || '').trim().replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه').replace(/ى$/g, 'ي').replace(/^ال/, '').replace(/\s+/g, ' ');
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }

function nextTurn(s, now) {
  // الرسّام التالي (نتخطى من غادر)
  for (let k = 0; k < s.players.length; k++) {
    s.di = (s.di + 1) % s.players.length; if (s.di === 0) s.round++;
    if (s.round > s.rounds) { s.phase = 'over'; return; }
    if (s.players[s.di].type !== 'gone') break;
  }
  const pool = s.cat === 'mix' ? Object.values(WORDS).flat() : WORDS[s.cat];
  s.choices = shuffle(pool.filter(w => !s.used.includes(w))).slice(0, 3);
  s.phase = 'pick'; s.word = null; s.strokes = []; s.guessed = []; s.feed = []; s.deadline = now + 20000;
}
const def = {
  id: 'draw', name: { ar: 'ارسم وخمّن', en: 'Draw & Guess' }, counts: [2, 3, 4, 5, 6, 7, 8], defaultCount: 3, colors: COLORS, noBots: true, tickMs: 400,
  options: () => [
    { key: 'cat', label: t('dr_cat'), choices: [['mix', t('dr_mix')], ...Object.entries(CAT_NAME)], def: 'mix', wide: true },
    { key: 'rounds', label: t('dr_rounds'), choices: [[1, num(1)], [2, num(2)], [3, num(3)]], def: 2 },
    { key: 'time', label: t('dr_time'), choices: [[60, num(60)], [80, num(80)], [100, num(100)]], def: 80 },
  ],
  rules: () => t('dr_rules'),
  init(players, o) {
    const s = { players, scores: players.map(() => 0), di: -1, round: 1, rounds: +o.rounds || 2, time: +o.time || 80, cat: o.cat || 'mix', used: [], online: players.some(p => p.type === 'remote') };
    s.round = 0; s.di = players.length - 1; // تبدأ الجولة 1 مع الرسام الأول
    nextTurn(s, Date.now()); return s;
  },
  view(s, seat) {
    const v = { ...s, now: Date.now() };
    if (seat !== s.di && s.phase === 'draw') { v.word = null; v.hint = s.word.replace(/[^ ]/g, '_'); v.len = s.word.replace(/ /g, '').length; v.choices = null; }
    if (seat !== s.di && s.phase === 'pick') v.choices = null;
    v.used = undefined;
    return v;
  },
  needs(s) {
    if (s.phase === 'over') return [];
    if (s.phase === 'pick' || s.phase === 'reveal') return [s.di];
    // أثناء الرسم: الرسّام ومن لم يعرف الكلمة بعد (للتخمين عبر الإنترنت)
    const list = [s.di];
    if (s.online) s.players.forEach((p, i) => { if (i !== s.di && p.type !== 'gone' && !s.guessed.includes(i)) list.push(i); });
    return list;
  },
  apply(s, seat, a) {
    const now = Date.now();
    if (s.phase === 'pick') {
      if (seat !== s.di || a.type !== 'pick' || !s.choices.includes(a.w)) return t('gk_err');
      s.word = a.w; s.used.push(a.w); s.phase = 'draw'; s.start = now; s.deadline = now + s.time * 1000; s.strokes = []; return null;
    }
    if (s.phase === 'reveal') { if (seat !== s.di || a.type !== 'next') return t('gk_err'); nextTurn(s, now); return null; }
    if (s.phase !== 'draw') return t('gk_err');
    if (seat === s.di) {
      if (a.type === 'stroke') {
        const pts = (a.pts || []).slice(0, 600).map(x => Math.max(0, Math.min(1000, x | 0)));
        const st = s.strokes.find(x => x.id === a.id);
        if (st) st.p = pts; else { if (s.strokes.length > 400) return t('gk_err'); s.strokes.push({ id: a.id, c: PEN.includes(a.c) ? a.c : '#111827', w: Math.max(2, Math.min(40, a.w | 0)), p: pts }); }
        return null;
      }
      if (a.type === 'clear') { s.strokes = []; return null; }
      if (a.type === 'undo') { s.strokes.pop(); return null; }
      if (a.type === 'award') { const i = a.seat | 0; if (i === s.di || s.guessed.includes(i) || !s.players[i]) return t('gk_err'); award(s, i, now); return null; }
      if (a.type === 'skip') { s.phase = 'reveal'; s.feed.push({ sys: 'dr_word', w: s.word }); return null; }
      return t('gk_err');
    }
    if (a.type === 'guess') {
      if (s.guessed.includes(seat)) return t('gk_err');
      const g = String(a.text || '').slice(0, 40);
      if (!g.trim()) return null;
      if (norm(g) === norm(s.word)) { award(s, seat, now); return null; }
      const close = lev(norm(g), norm(s.word)) <= 1 && norm(s.word).length > 3;
      s.feed.push({ seat, text: g, close }); if (s.feed.length > 40) s.feed.shift();
      return null;
    }
    return t('gk_err');
  },
  tick(s, now) {
    if (s.phase === 'draw' && now > s.deadline) { s.phase = 'reveal'; s.feed.push({ sys: 'dr_word', w: s.word }); return true; }
    if (s.phase === 'pick' && now > s.deadline) { s.word = s.choices[0]; s.used.push(s.word); s.phase = 'draw'; s.start = now; s.deadline = now + s.time * 1000; return true; }
    return false;
  },
  bot: () => null,
  over: (s) => s.phase === 'over',
  result(s, seat) {
    const order = s.players.map((p, i) => i).sort((a, b) => s.scores[b] - s.scores[a]); const w = order[0];
    return { title: w === seat ? t('gk_youWin') : t('gk_gameOver'), big: t('gk_winner', { name: s.players[w].name }), win: w === seat, lines: order.map(i => ({ label: s.players[i].name, avatar: s.players[i].avatar, value: num(s.scores[i]), color: COLORS[i] })) };
  },
  status(v, ui) {
    if (v.phase === 'pick') return ui.seat === v.di ? t('dr_pick') : t('dr_wait', { name: ui.name(v.di) });
    if (v.phase === 'reveal') return t('dr_word', { w: v.word });
    return ui.seat === v.di ? t('dr_draw', { w: v.word }) : t('dr_guess', { name: ui.name(v.di) });
  },
  render(el, v, ui) { renderDraw(el, v, ui); },
};
function award(s, i, now) {
  const left = Math.max(0, s.deadline - now) / (s.time * 1000);
  const pts = 50 + Math.round(left * 100);
  s.scores[i] += pts; s.scores[s.di] += 25; s.guessed.push(i);
  s.feed.push({ sys: 'dr_got', seat: i, pts });
  const others = s.players.filter((p, k) => k !== s.di && p.type !== 'gone').length;
  if (s.guessed.length >= others) { s.phase = 'reveal'; s.feed.push({ sys: 'dr_word', w: s.word }); }
}

// حالة الرسم المحلية (لا تعاد بناؤها مع كل تحديث)
let pen = { c: '#111827', w: 8 }, drawing = null, lastSend = 0, keepInput = '', LIVE = null;
function renderDraw(el, v, ui) {
  const me = ui.seat, isDrawer = me === v.di;
  const skew = Date.now() - v.now; const left = Math.max(0, v.deadline + skew - Date.now());
  const wrap = h('div', { class: 'dr-wrap' });
  // اللوحة
  const cv = h('canvas', { class: 'dr-canvas', width: 1000, height: 700 });
  const ctx2 = cv.getContext('2d');
  const paint = (vv = v) => {
    v = vv;
    ctx2.fillStyle = '#fff'; ctx2.fillRect(0, 0, 1000, 700); ctx2.lineCap = 'round'; ctx2.lineJoin = 'round';
    const all = drawing && isDrawer ? v.strokes.filter(x => x.id !== drawing.id).concat([drawing]) : v.strokes;
    for (const st of all) { ctx2.strokeStyle = st.c; ctx2.lineWidth = st.w; ctx2.beginPath(); for (let i = 0; i < st.p.length; i += 2) { const x = st.p[i], y = st.p[i + 1] * .7; i ? ctx2.lineTo(x, y) : ctx2.moveTo(x, y); } if (st.p.length === 2) ctx2.lineTo(st.p[0] + .1, st.p[1] * .7); ctx2.stroke(); }
  };
  paint();
  if (isDrawer && v.phase === 'draw') {
    cv.classList.add('can');
    const P = (e) => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 1000), Math.round((e.clientY - r.top) / r.height * 1000)]; };
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); drawing = { id: Date.now() + '' + rnd(1000), c: pen.c, w: pen.w, p: P(e) }; paint(); });
    cv.addEventListener('pointermove', (e) => { if (!drawing) return; drawing.p.push(...P(e)); paint(); if (Date.now() - lastSend > 220) { lastSend = Date.now(); ui.act({ type: 'stroke', id: drawing.id, c: drawing.c, w: drawing.w, pts: drawing.p }); } });
    const up = () => { if (!drawing) return; const d = drawing; drawing = null; ui.act({ type: 'stroke', id: d.id, c: d.c, w: d.w, pts: d.p }); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
  const timer = v.phase === 'draw' ? h('div', { class: 'dr-timer' }, h('i', { style: { animationDuration: left + 'ms' } }), h('b', {}, '⏱ ', num(Math.ceil(left / 1000)))) : null;
  const top = h('div', { class: 'dr-top' },
    h('div', { class: 'dr-word' }, isDrawer && v.word ? h('span', {}, '✏️ ', v.word) : v.phase === 'draw' ? h('span', { class: 'dr-hint', dir: 'rtl' }, v.hint.split('').map(c => c === ' ' ? h('i', { class: 'sp' }) : h('i'))) : null,
      v.phase === 'draw' && !isDrawer ? h('small', {}, t('dr_letters', { n: num(v.len) })) : null), timer);
  const tools = isDrawer && v.phase === 'draw' ? h('div', { class: 'dr-tools' },
    PEN.map(c => h('button', { type: 'button', class: 'dr-col' + (pen.c === c ? ' on' : ''), style: { background: c }, onclick: (e) => { pen.c = c; e.currentTarget.parentElement.querySelectorAll('.dr-col').forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); } })),
    [4, 8, 16, 32].map(w => h('button', { type: 'button', class: 'dr-size' + (pen.w === w ? ' on' : ''), onclick: (e) => { pen.w = w; e.currentTarget.parentElement.querySelectorAll('.dr-size').forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); } }, h('i', { style: { width: Math.min(24, w) + 'px', height: Math.min(24, w) + 'px' } }))),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: () => ui.act({ type: 'undo' }) }, ico('undo-2', 15)),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: () => ui.act({ type: 'clear' }) }, t('dr_clear')),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: () => ui.act({ type: 'skip' }) }, t('dr_skip'))) : null;
  // الجانب: اللاعبون والتخمينات
  const players = h('div', { class: 'dr-players' }, v.players.map((p, i) => {
    const pl = ui.plate(i, h('b', { class: 'dr-sc' }, num(v.scores[i]), i === v.di ? ' ✏️' : v.guessed.includes(i) ? ' ✅' : ''));
    if (isDrawer && !v.online && v.phase === 'draw' && i !== v.di && !v.guessed.includes(i)) { const b = h('button', { type: 'button', class: 'dr-award', onclick: () => { sound('win'); ui.act({ type: 'award', seat: i }); } }, pl, h('span', {}, '✔')); return b; }
    return pl;
  }));
  const feed = h('div', { class: 'dr-feed' }, (v.feed || []).slice(-14).map(f => f.sys === 'dr_got' ? h('div', { class: 'dr-f ok' }, t('dr_got', { name: ui.name(f.seat) }), ' +', num(f.pts)) : f.sys === 'dr_word' ? h('div', { class: 'dr-f word' }, t('dr_word', { w: f.w })) : h('div', { class: 'dr-f' + (f.close ? ' close' : '') }, h('b', {}, ui.name(f.seat), ': '), f.text, f.close && f.seat === me ? h('em', {}, ' — ', t('dr_close')) : null)));
  let guessBox = null;
  if (v.online && !isDrawer && v.phase === 'draw' && !v.guessed.includes(me)) {
    const inp = h('input', { class: 'input', maxlength: 40, placeholder: t('dr_type'), value: keepInput, oninput: (e) => keepInput = e.target.value, onkeydown: (e) => { if (e.key === 'Enter') send(); } });
    const send = () => { if (!inp.value.trim()) return; ui.act({ type: 'guess', text: inp.value }); keepInput = ''; inp.value = ''; };
    guessBox = h('div', { class: 'dr-guess' }, inp, h('button', { type: 'button', class: 'btn', onclick: send }, t('dr_send')));
    setTimeout(() => { if (document.activeElement?.tagName !== 'INPUT' || document.activeElement === document.body) inp.focus({ preventScroll: true }); }, 0);
  }
  const side = h('div', { class: 'dr-side' }, players, !v.online && isDrawer && v.phase === 'draw' ? h('p', { class: 'dr-who' }, t('dr_who')) : null, feed, guessBox);
  wrap.append(top, h('div', { class: 'dr-main' }, h('div', { class: 'dr-board' }, cv, tools), side));
  if (v.phase === 'pick') wrap.append(h('div', { class: 'dr-over' }, h('div', { class: 'dr-card' }, isDrawer ? [h('h3', {}, t('dr_pick')), h('div', { class: 'dr-choices' }, v.choices.map(w => h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'pick', w }) }, w)))] : h('h3', {}, t('dr_wait', { name: ui.name(v.di) })))));
  if (v.phase === 'reveal') wrap.append(h('div', { class: 'dr-over' }, h('div', { class: 'dr-card' }, h('h3', {}, t('dr_word', { w: v.word })), isDrawer ? h('button', { type: 'button', class: 'gk-bigbtn', onclick: () => ui.act({ type: 'next' }) }, t('dr_next')) : null)));
  el.append(wrap);
  LIVE = { key: v.phase + ':' + v.di + ':' + v.round, paint, side, ui, el };
}
// تحديث جزئي يحافظ على لوحة الرسم أثناء الرسم
function patchDraw(el, v, ui) {
  if (!LIVE || !LIVE.side.isConnected || LIVE.key !== v.phase + ':' + v.di + ':' + v.round || v.phase !== 'draw') return false;
  LIVE.paint(v);
  // نعيد بناء الجانب فقط
  const keep = LIVE; const tmp = h('div'); renderDraw(tmp, v, ui); LIVE = keep;
  const newSide = tmp.querySelector('.dr-side'); const oldSide = el.querySelector('.dr-side');
  const focused = document.activeElement && oldSide.contains(document.activeElement) && document.activeElement.tagName === 'INPUT';
  oldSide.replaceWith(newSide);
  if (focused) newSide.querySelector('input')?.focus({ preventScroll: true });
  const ot = el.querySelector('.dr-top'), nt = tmp.querySelector('.dr-top'); if (ot && nt) ot.replaceWith(nt);
  LIVE.side = newSide;
  return true;
}
def.patch = patchDraw;
export async function mount(root, ctx) {
  if (!document.getElementById('dr-css')) document.head.append(h('link', { id: 'dr-css', rel: 'stylesheet', href: new URL('./draw.css', import.meta.url).href }));
  drawing = null; keepInput = '';
  return tableGame(root, ctx, def);
}
export const _test = { def };
