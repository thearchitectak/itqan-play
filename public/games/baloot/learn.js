// دليل البلوت: دروس مصورة وتمارين تفاعلية تتولد عشوائيًا من قواعد اللعبة نفسها.
import { h, t, addDict, modal, sound, num, ico, settings } from '../../assets/js/core.js';
import * as R from './rules.js';
import { cardEl } from './game.js';

addDict({
  ar: {
    bg_title: 'دليل البلوت', bg_lessons: 'الدروس', bg_drills: 'تمارين', bg_next: 'التالي', bg_prev: 'السابق', bg_check: 'تحقق', bg_new: 'سؤال جديد', bg_right: 'إجابة صحيحة! 👏', bg_wrong: 'ليست صحيحة.', bg_score: 'النتيجة: {a} من {b}',
    bg_d1: 'من يأكل الأكلة؟', bg_d1q: 'اللعب {m}. اضغط الورقة التي تأكل.', bg_d2: 'كم أبناط الأكلة؟', bg_d2q: 'اللعب {m}. كم مجموع أبناط هذه الأوراق؟', bg_d3: 'ما المشروع؟', bg_d3q: 'اللعب {m}. ما أعلى مشروع في هذه اليد؟', bg_none: 'لا مشروع',
    bg_d4: 'أي ورقة يجوز لعبها؟', bg_d4q: 'اللعب {m}. لُعبت الورقة الأولى، اضغط ورقة يجوز لك لعبها.', bg_because: 'السبب: {r}',
    bg_r_follow: 'يجب أن تلعب من النوع نفسه.', bg_r_trump: 'ليس معك النوع، فيجب أن تقطع بالحكم.', bg_r_free: 'ليس معك النوع ولا حكم، فلك أن تلعب أي ورقة.',
  },
  en: {
    bg_title: 'Baloot guide', bg_lessons: 'Lessons', bg_drills: 'Drills', bg_next: 'Next', bg_prev: 'Back', bg_check: 'Check', bg_new: 'New question', bg_right: 'Correct! 👏', bg_wrong: 'Not quite.', bg_score: 'Score: {a} of {b}',
    bg_d1: 'Who wins the trick?', bg_d1q: 'Mode: {m}. Tap the winning card.', bg_d2: 'Trick points', bg_d2q: 'Mode: {m}. How many points?', bg_d3: 'Which project?', bg_d3q: 'Mode: {m}. Highest project in this hand?', bg_none: 'No project',
    bg_d4: 'Which card may you play?', bg_d4q: 'Mode: {m}. Tap a legal card.', bg_because: 'Reason: {r}',
    bg_r_follow: 'You must follow suit.', bg_r_trump: 'Void in the suit: you must trump.', bg_r_free: 'Void and no trumps: any card.',
  },
});
const C = (...cs) => h('div', { class: 'bg-cards' }, cs.map(c => cardEl(c)));
const SUN = () => t('bl_sun');
const LESSONS = [
  () => ({ title: 'الورق والأنواع', body: [h('p', {}, 'يُلعب البلوت بـ 32 ورقة: من كل نوع ثماني أوراق من 7 إلى الإكه. الأنواع الأربعة:'),
    h('div', { class: 'bg-suits' }, R.SUITS.map(s => h('div', {}, cardEl('A' + s), h('b', {}, R.SUIT_AR[s])))),
    h('p', {}, 'وأسماء الصور: الشايب (K)، والبنت (Q)، والولد (J)، والإكه (A).'), C('KH', 'QH', 'JH', 'AH')] }),
  () => ({ title: 'قوة الورق في الصن', body: [h('p', {}, 'في الصن (بلا حكم) وفي الأنواع غير الحكم تترتب القوة هكذا من الأقوى إلى الأضعف:'), C('AS', 'TS', 'KS', 'QS', 'JS', '9S', '8S', '7S'),
    h('p', {}, 'لاحظ أن العشرة أقوى من الشايب! والورقة لا تأكل إلا من نوعها، فالإكه ♥ لا تأكل 7 ♠ إن كان النوع الملعوب أولًا ♠.')] }),
  () => ({ title: 'قوة الورق في الحكم', body: [h('p', {}, 'في الحكم يصبح ترتيب نوع الحكم مختلفًا: الولد أقوى ورقة، ثم التسعة!'), C('JH', '9H', 'AH', 'TH', 'KH', 'QH', '8H', '7H'),
    h('p', {}, 'وأي ورقة حكم — ولو 7 — تأكل كل أوراق الأنواع الأخرى.')] }),
  () => ({ title: 'الأبناط', body: [h('table', { class: 'bg-tbl' }, h('tr', {}, h('th', {}, 'الورقة'), h('th', {}, 'صن/عادي'), h('th', {}, 'حكم')),
    [['إكه', 11, 11], ['10', 10, 10], ['شايب', 4, 4], ['بنت', 3, 3], ['ولد', 2, 20], ['9', 0, 14], ['8 و7', 0, 0]].map(([a, b, c]) => h('tr', {}, h('td', {}, a), h('td', {}, num(b)), h('td', {}, num(c))))),
    h('p', {}, 'الأكلة الأخيرة (الأرض) عليها 10 أبناط. مجموع الصن 130 تتحول إلى 26 نقطة (نقسم على 5)، ومجموع الحكم 162 تتحول إلى 16 نقطة (نقسم على 10).')] }),
  () => ({ title: 'الشراء', body: [h('p', {}, 'تُوزّع خمس أوراق لكل لاعب وتُكشف ورقة في الوسط. يبدأ اللاعب الذي على يمين الموزع:'),
    h('ul', {}, h('li', {}, h('b', {}, 'صن: '), 'لعب بلا حكم، ونقاطه مضاعفة. يحتاج إككًا وعشرات.'), h('li', {}, h('b', {}, 'حكم: '), 'يصبح نوع الورقة المكشوفة هو الحكم. يحتاج الولد والتسعة من ذلك النوع.'), h('li', {}, h('b', {}, 'أشكل: '), 'صن يأخذ فيه شريكك الورقة المكشوفة، ولا يقوله إلا الثالث والرابع.'), h('li', {}, h('b', {}, 'بَس: '), 'تمرير.')),
    h('p', {}, 'إن مرر الجميع يبدأ دور ثانٍ يُختار فيه حكم من نوع آخر أو صن. والصن يغلب الحكم دائمًا.')] }),
  () => ({ title: 'قواعد اللعب', body: [h('ol', {}, h('li', {}, 'يجب أن تلعب من نوع الورقة الأولى إن كان معك.'), h('li', {}, 'في الحكم: إن لم يكن معك النوع وجب أن تقطع بالحكم، وأن تعلو على حكم المنافس إن استطعت، إلا إن كان شريكك رابحًا.'), h('li', {}, 'إن لُعب الحكم أولًا فعليك أن تعلو عليه إن استطعت.'), h('li', {}, 'من يأكل الأكلة يبدأ التي بعدها.')),
    h('p', {}, 'مثال في حكم ♥: لُعب 9♠ ثم إكه♠، وأنت ليس معك ♠ ومعك 7♥ ⇐ يجب أن تقطع بها وتأكل!'), C('9S', 'AS', '7H')] }),
  () => ({ title: 'المشاريع', body: [h('p', {}, h('b', {}, 'سرا: '), 'ثلاث متتالية من نوع واحد.'), C('9D', 'TD', 'JD'), h('p', {}, h('b', {}, 'خمسين: '), 'أربع متتالية.'), C('JC', 'QC', 'KC', 'AC'),
    h('p', {}, h('b', {}, 'مية: '), 'خمس متتالية، أو أربع عشرات أو شياب أو بنات أو أولاد.'), C('TS', 'TH', 'TD', 'TC'), h('p', {}, h('b', {}, 'أربعمية: '), 'أربع إكك في الصن.'), C('AS', 'AH', 'AD', 'AC'),
    h('p', {}, h('b', {}, 'بلوت: '), 'الشايب والبنت من نوع الحكم.'), C('KH', 'QH'), h('p', {}, 'يأخذ المشاريع الفريق الذي يملك أعلى مشروع فقط.')] }),
  () => ({ title: 'الحساب والفوز', body: [h('p', {}, 'في نهاية الجولة يُجمع لكل فريق: نقاط أكلاته + مشاريعه + البلوت.'),
    h('p', {}, 'مثال صن: فريق المشتري جمع 80 بنطًا ⇐ 16 نقطة، والمنافس 50 بنطًا ⇐ 10 نقاط. المشتري حقق أكثر من النصف فلكلٍّ نقاطه.'),
    h('p', {}, 'لو حقق المشتري النصف أو أقل فهي ', h('b', {}, 'خسرانة'), ': تذهب نقاط الجولة كلها للمنافس. ومن أخذ الأكلات الثماني فهو ', h('b', {}, 'كبوت'), ': 44 نقطة في الصن و25 في الحكم.'),
    h('p', {}, 'أول فريق يصل إلى 152 نقطة يفوز. بالتوفيق! 🎉')] }),
];

const rand = (n) => Math.floor(Math.random() * n);
const pickMode = () => Math.random() < .45 ? { mode: 'sun', trump: null } : { mode: 'hokm', trump: R.SUITS[rand(4)] };
const mName = (m) => m.mode === 'sun' ? SUN() : t('bl_hokm') + ' ' + R.SUIT_SYM[m.trump];

function drillWinner(box, score) {
  const m = pickMode(); const d = R.shuffle(R.deck());
  const lead = d[0]; const others = R.shuffle(d.slice(1).filter((c, i) => i < 30)).slice(0, 3);
  // نجعل الأوراق غالبًا من النوع نفسه أو حكم لتكون الأسئلة مفيدة
  const pool = d.filter(c => R.st(c) === R.st(lead) || (m.trump && R.st(c) === m.trump)).filter(c => c !== lead);
  const cards = [lead, ...R.shuffle(pool).slice(0, 2), others[0]];
  const trick = cards.map((c, i) => ({ seat: i, card: c }));
  const w = R.trickWinner(trick, m.trump);
  box.append(h('p', { class: 'bg-q' }, t('bg_d1q', { m: mName(m) })),
    h('div', { class: 'bg-cards play' }, cards.map((c, i) => { const b = h('button', { type: 'button', class: 'bg-pick' }, i === 0 ? h('small', {}, '①') : null, cardEl(c)); b.onclick = () => answer(box, score, i === w, () => box.querySelectorAll('.bg-pick')[w].classList.add('ok')); return b; })));
}
function drillPoints(box, score) {
  const m = pickMode(); const cards = R.shuffle(R.deck()).slice(0, 4);
  const right = cards.reduce((a, c) => a + R.points(c, m.trump), 0);
  const opts = new Set([right]); while (opts.size < 4) opts.add(Math.max(0, right + (rand(9) - 4) * (rand(2) ? 1 : 2)));
  box.append(h('p', { class: 'bg-q' }, t('bg_d2q', { m: mName(m) })), C(...cards),
    h('div', { class: 'bg-opts' }, [...opts].sort((a, b) => a - b).map(o => h('button', { type: 'button', class: 'btn ghost', onclick: (e) => answer(box, score, o === right, () => { [...box.querySelectorAll('.bg-opts button')].find(b => b.textContent === num(right))?.classList.add('ok'); }) }, num(o)))));
}
function drillProject(box, score) {
  const m = pickMode();
  let hand, best;
  for (let k = 0; k < 40; k++) {
    hand = R.shuffle(R.deck()).slice(0, 8);
    const ps = R.findProjects(hand, m.mode);
    best = ps.length ? ps.reduce((a, p) => ({ sara: 1, fifty: 2, hundred: 3, four100: 4 }[p.type] > { sara: 1, fifty: 2, hundred: 3, four100: 4 }[a.type] ? p : a)).type : 'none';
    if (best !== 'none' || Math.random() < .2) break;
  }
  const opts = ['none', 'sara', 'fifty', 'hundred'].concat(m.mode === 'sun' ? ['four100'] : []);
  box.append(h('p', { class: 'bg-q' }, t('bg_d3q', { m: mName(m) })), h('div', { class: 'bg-cards' }, R.sortHand(hand, m.trump).map(c => cardEl(c))),
    h('div', { class: 'bg-opts' }, opts.map(o => h('button', { type: 'button', class: 'btn ghost', 'data-k': o, onclick: () => answer(box, score, o === best, () => box.querySelector(`[data-k="${best}"]`)?.classList.add('ok')) }, o === 'none' ? t('bg_none') : R.PROJ_NAME[o]))));
}
function drillLegal(box, score) {
  const m = { mode: 'hokm', trump: R.SUITS[rand(4)] };
  const d = R.shuffle(R.deck()); const lead = d.find(c => R.st(c) !== m.trump);
  let hand = d.filter(c => c !== lead).slice(0, 6);
  if (Math.random() < .5) hand = hand.filter(c => R.st(c) !== R.st(lead)).concat(d.filter(c => !hand.includes(c) && c !== lead && R.st(c) !== R.st(lead)).slice(0, 2)).slice(0, 6);
  const legal = R.legalCards(hand, [{ seat: 1, card: lead }], m.trump, 0);
  const reason = hand.some(c => R.st(c) === R.st(lead)) ? t('bg_r_follow') : hand.some(c => R.st(c) === m.trump) ? t('bg_r_trump') : t('bg_r_free');
  box.append(h('p', { class: 'bg-q' }, t('bg_d4q', { m: mName(m) })), h('div', { class: 'bg-lead' }, cardEl(lead)),
    h('div', { class: 'bg-cards play' }, R.sortHand(hand, m.trump).map(c => { const b = h('button', { type: 'button', class: 'bg-pick' }, cardEl(c)); b.onclick = () => answer(box, score, legal.includes(c), () => { box.querySelectorAll('.bg-pick').forEach((x, i) => { if (legal.includes(R.sortHand(hand, m.trump)[i])) x.classList.add('ok'); }); box.append(h('p', { class: 'bg-why' }, t('bg_because', { r: reason }))); }); return b; })));
}
function answer(box, score, ok, reveal) {
  if (box.dataset.done) return; box.dataset.done = '1';
  score.n++; if (ok) score.ok++;
  sound(ok ? 'win' : 'error');
  box.append(h('p', { class: 'bg-res ' + (ok ? 'ok' : 'bad') }, ok ? t('bg_right') : t('bg_wrong')));
  if (!ok) reveal();
  box.querySelectorAll('.bg-pick, .bg-opts button').forEach(b => b.disabled = true);
  score.onAnswer?.();
}

export function openGuide() {
  if (!document.getElementById('bl-css')) document.head.append(h('link', { id: 'bl-css', rel: 'stylesheet', href: new URL('./baloot.css', import.meta.url).href }));
  let tab = 'lessons', li = 0, drill = 0;
  const score = { ok: 0, n: 0 };
  const body = h('div', { class: 'bg-guide' });
  const DR = [[t('bg_d1'), drillWinner], [t('bg_d2'), drillPoints], [t('bg_d4'), drillLegal], [t('bg_d3'), drillProject]];
  const draw = () => {
    body.innerHTML = '';
    body.append(h('div', { class: 'bg-tabs' }, h('button', { type: 'button', class: tab === 'lessons' ? 'on' : '', onclick: () => { tab = 'lessons'; draw(); } }, '📖 ', t('bg_lessons')), h('button', { type: 'button', class: tab === 'drills' ? 'on' : '', onclick: () => { tab = 'drills'; draw(); } }, '🎯 ', t('bg_drills'))));
    if (tab === 'lessons') {
      const L = LESSONS[li]();
      body.append(h('div', { class: 'bg-steps' }, LESSONS.map((_, i) => h('button', { type: 'button', class: i === li ? 'on' : i < li ? 'done' : '', onclick: () => { li = i; draw(); } }, num(i + 1)))),
        h('h3', {}, L.title), h('div', { class: 'bg-body' }, L.body),
        h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '12px' } },
          h('button', { type: 'button', class: 'btn ghost', disabled: li === 0, onclick: () => { li--; draw(); } }, t('bg_prev')),
          li < LESSONS.length - 1 ? h('button', { type: 'button', class: 'btn', onclick: () => { li++; draw(); } }, t('bg_next')) : h('button', { type: 'button', class: 'btn', onclick: () => { tab = 'drills'; draw(); } }, '🎯 ', t('bg_drills'))));
    } else {
      const box = h('div', { class: 'bg-drill' });
      score.onAnswer = () => { sc.textContent = t('bg_score', { a: num(score.ok), b: num(score.n) }); };
      const sc = h('b', {}, t('bg_score', { a: num(score.ok), b: num(score.n) }));
      body.append(h('div', { class: 'bg-dtabs' }, DR.map(([n], i) => h('button', { type: 'button', class: i === drill ? 'on' : '', onclick: () => { drill = i; draw(); } }, n))), h('div', { class: 'row' }, sc), box,
        h('button', { type: 'button', class: 'btn', style: { marginTop: '10px' }, onclick: () => draw() }, ico('refresh-cw', 16), t('bg_new')));
      DR[drill][1](box, score);
    }
  };
  draw();
  modal(t('bg_title'), body, [], { icon: 'brain', wide: true });
}
