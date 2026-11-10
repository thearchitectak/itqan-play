// غرفة الأسرار: مغامرة هروب من ثلاث غرف. حل الألغاز الرياضية والرسائل المشفرة والألغاز المنطقية لتجمع أرقام القفل وتفتح الباب.
import { h, t, addDict, sound, num, ico, store, toast, modal } from '../../assets/js/core.js';
addDict({
  ar: { es_room: 'الغرفة {n}: {name}', es_code: 'رقم القفل', es_open: 'افتح الباب', es_wrong: 'الرمز غير صحيح', es_solved: 'أحسنت! حصلت على الرقم {d} 🔑', es_answer: 'إجابتك', es_try: 'تحقق', es_hint: 'تلميح', es_bad: 'ليست صحيحة، فكّر مرة أخرى', es_done: 'هربت من الغرفة! 🎉', es_next: 'الغرفة التالية', es_finish: 'خرجت من كل الغرف في {t}! أنت عبقري الألغاز 🏆', es_again: 'العب من جديد', es_clues: 'الأرقام التي جمعتها', es_tap: 'اضغط الأشياء في الغرفة لتكتشف ألغازها', es_order: 'رتّب الأرقام حسب ترتيب الأشياء في الغرفة من اليمين' },
  en: { es_room: 'Room {n}: {name}', es_code: 'Lock code', es_open: 'Open door', es_wrong: 'Wrong code', es_solved: 'You got digit {d} 🔑', es_answer: 'Your answer', es_try: 'Check', es_hint: 'Hint', es_bad: 'Not right, think again', es_done: 'You escaped! 🎉', es_next: 'Next room', es_finish: 'All rooms escaped in {t}! 🏆', es_again: 'Play again', es_clues: 'Digits collected', es_tap: 'Tap objects to discover puzzles', es_order: 'Digits follow the order of objects from right' },
});
const R = (n) => Math.floor(Math.random() * n);
const AR = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';
const caesar = (w, k) => [...w].map(c => { const i = AR.indexOf(c); return i < 0 ? c : AR[(i + k + AR.length) % AR.length]; }).join('');
function makeRooms() {
  // كل لغز: { icon, title, q, ans (نص أو عدد), hint, d (الرقم المكافأة) }
  const a = 3 + R(6), b = 2 + R(7), c = 1 + R(Math.min(9, a * b - 1));
  const seqStart = 1 + R(3), ratio = 2 + R(2);
  const seq = [0, 1, 2, 3].map(i => seqStart * ratio ** i);
  const words = ['كتاب', 'قلم', 'نجمة', 'شمس', 'قمر', 'وردة', 'مفتاح'];
  const w = words[R(words.length)], shift = 1 + R(2);
  const x = 2 + R(8), y = 2 + R(8);
  const ms = [[2, 7, 6], [9, 5, 1], [4, 3, 8]]; const hideR = R(3), hideC = R(3); const msVal = ms[hideR][hideC];
  const planets = ['عطارد', 'الزهرة', 'الأرض', 'المريخ', 'المشتري', 'زحل', 'أورانوس', 'نبتون'];
  const pIdx = 2 + R(5);
  const hh = [3, 6, 9][R(3)];
  const dig = (n) => ((n % 10) + 10) % 10;
  return [
    { name: 'المكتبة القديمة', bg: 'linear-gradient(180deg,#78350f,#451a03)', items: [
      { icon: '📚', title: 'رف الكتب', q: `على الكتاب الأحمر مكتوب: «\u2066${num(a)} × ${num(b)} − ${num(c)}\u2069». ما الناتج؟`, ans: a * b - c, hint: 'ابدأ بالضرب ثم اطرح.', d: dig(a * b - c) },
      { icon: '📜', title: 'رسالة مشفرة', q: `رسالة مكتوبة بشفرة القيصر: كل حرف أُزيح ${num(shift)} ${shift === 1 ? 'حرفًا' : 'حرفين'} إلى الأمام في الترتيب الألفبائي (أ ب ت ث…). فك الشفرة: «${caesar(w, shift)}»`, ans: w, hint: `أرجع كل حرف ${num(shift)} إلى الخلف: مثلًا «ت» تصبح «${AR[AR.indexOf('ت') - shift]}».`, d: w.length },
      { icon: '🕯️', title: 'الشموع', q: `أطوال الشموع تتبع نمطًا: ${seq.slice(0, 3).map(num).join('، ')}، … ما طول الشمعة الرابعة؟`, ans: seq[3], hint: `كل شمعة ${ratio === 2 ? 'ضعف' : 'ثلاثة أمثال'} التي قبلها.`, d: dig(seq[3]) },
    ] },
    { name: 'مختبر العلوم', bg: 'linear-gradient(180deg,#0e7490,#164e63)', items: [
      { icon: '⚖️', title: 'الميزان', q: `في كفة الميزان الأولى ${num(x)} مكعبات و${num(3)} كرات، وفي الثانية ${num(x + 6)} مكعبات. الميزان متوازن. كم مكعبًا تساوي الكرة الواحدة؟`, ans: 2, hint: 'احذف المكعبات المتساوية من الكفتين.', d: 2 },
      { icon: '🧪', title: 'أنابيب الألوان', q: 'إذا خلطنا اللون الأزرق باللون الأصفر، فما اللون الناتج؟ (اكتب اسم اللون)', ans: 'اخضر', alt: ['أخضر', 'الأخضر', 'الاخضر'], hint: 'لون أوراق الشجر.', d: 5 },
      { icon: '🔢', title: 'المربع السحري', q: `مربع سحري مجموع كل صف وعمود وقطر فيه ${num(15)}:\n${ms.map((r, i) => r.map((v, j) => i === hideR && j === hideC ? '؟' : num(v)).join('  ')).join('\n')}\nما الرقم المخفي؟`, ans: msVal, hint: 'اجمع الرقمين الآخرين في صفه واطرح من 15.', d: msVal },
    ] },
    { name: 'المرصد الفلكي', bg: 'linear-gradient(180deg,#1e1b4b,#0f172a)', items: [
      { icon: '🪐', title: 'خريطة الكواكب', q: `رتّب الكواكب من الأقرب إلى الشمس. ما ترتيب كوكب «${planets[pIdx]}»؟`, ans: pIdx + 1, hint: 'عطارد الأول، ثم الزهرة، ثم الأرض…', d: pIdx + 1 },
      { icon: '🕰️', title: 'ساعة المرصد', q: `الساعة الآن ${num(hh)}:00 تمامًا. كم درجة الزاوية الصغرى بين عقربي الساعات والدقائق؟`, ans: hh === 6 ? 180 : 90, hint: 'كل ساعة على الوجه تساوي 30 درجة.', d: hh === 6 ? 8 : 9 },
      { icon: '🔭', title: 'لغز التلسكوب', q: 'شيء كلما أخذتَ منه كبُر. ما هو؟', ans: 'الحفرة', alt: ['حفرة', 'الحفره', 'حفره'], hint: 'تصنعه بالمجرفة في الأرض.', d: 7 },
    ] },
  ];
}
const normAns = (s) => String(s).trim().replace(/[أإآ]/g, 'ا').replace(/ة$/, 'ه').replace(/^ال/, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
export async function mount(root) {
  if (!document.getElementById('es-css')) document.head.append(h('link', { id: 'es-css', rel: 'stylesheet', href: new URL('./escape.css', import.meta.url).href }));
  const view = h('div', { class: 'es' }); root.append(view);
  let rooms, ri, solved, t0, hints;
  function start() { rooms = makeRooms(); ri = 0; solved = rooms.map(r => r.items.map(() => false)); t0 = Date.now(); hints = 0; draw(); }
  function openPuzzle(k) {
    const it = rooms[ri].items[k];
    const inp = h('input', { class: 'input', placeholder: t('es_answer'), dir: 'auto' });
    const hintBox = h('p', { class: 'es-hintbox hidden' }, '💡 ', it.hint);
    const body = h('div', { class: 'es-pz' }, h('div', { class: 'es-pzicon' }, it.icon), h('p', { class: 'es-q' }, it.q), inp, hintBox);
    modal(it.title, body, [{ label: t('es_hint'), kind: 'ghost', onclick: () => { hintBox.classList.remove('hidden'); hints++; return false; } }, { label: t('es_try'), icon: 'check', onclick: () => {
      const v = normAns(inp.value); const ok = [it.ans, ...(it.alt || [])].some(a => normAns(a) === v || (typeof it.ans === 'number' && +v === it.ans));
      if (!ok) { sound('error'); toast(t('es_bad'), true); inp.select(); return false; }
      solved[ri][k] = true; sound('win'); toast(t('es_solved', { d: num(it.d) }), 'ok'); draw(); return true; } }], { icon: 'key-round' });
    setTimeout(() => inp.focus(), 50);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.closest('dialog').querySelector('.modal-actions .btn:last-child').click(); });
  }
  function draw() {
    const room = rooms[ri]; const got = room.items.map((it, k) => solved[ri][k] ? it.d : null);
    const code = got.join('');
    const all = got.every(x => x != null);
    const inp = h('input', { class: 'input es-codein', inputmode: 'numeric', maxlength: 3, placeholder: '•••', dir: 'ltr' });
    view.innerHTML = '';
    view.append(h('div', { class: 'es-top' }, h('b', {}, t('es_room', { n: num(ri + 1), name: room.name })), h('span', {}, '🔑 '.repeat(ri)), h('button', { type: 'button', class: 'btn ghost sm', onclick: start }, ico('refresh-cw', 15), t('es_again'))),
      h('div', { class: 'es-room', style: { background: room.bg } },
        h('div', { class: 'es-items' }, room.items.map((it, k) => h('button', { type: 'button', class: 'es-item' + (solved[ri][k] ? ' done' : ''), onclick: () => openPuzzle(k) }, h('span', { class: 'es-ic' }, it.icon), h('small', {}, it.title), solved[ri][k] ? h('b', { class: 'es-d' }, num(it.d)) : h('b', { class: 'es-d q' }, '؟')))),
        h('div', { class: 'es-door' + (all ? ' ready' : '') }, h('div', { class: 'es-doorart' }, '🚪'),
          h('div', { class: 'es-lock' }, h('small', {}, t('es_code')), inp, h('button', { type: 'button', class: 'btn', onclick: () => {
            if (inp.value.trim() === code && all) { sound('win'); if (ri < rooms.length - 1) { ri++; toast(t('es_done'), 'ok'); draw(); } else finish(); }
            else { sound('error'); toast(t('es_wrong'), true); } } }, ico('key-round', 16), t('es_open'))),
          h('small', { class: 'es-note' }, t('es_order')))),
      h('div', { class: 'es-clues' }, h('b', {}, t('es_clues'), ': '), got.map(d => h('span', {}, d == null ? '_' : num(d)))),
      h('p', { class: 'muted' }, t('es_tap')));
  }
  function finish() {
    const s = Math.round((Date.now() - t0) / 1000); const tt = `${num(Math.floor(s / 60))}:${num(String(s % 60).padStart(2, '0'))}`;
    view.innerHTML = ''; view.append(h('div', { class: 'es-room es-win', style: { background: 'linear-gradient(135deg,#f59e0b,#ef4444)' } }, h('div', { class: 'es-ic big' }, '🏆'), h('h2', {}, t('es_finish', { t: tt })), h('p', {}, '💡 × ', num(hints)), h('button', { type: 'button', class: 'btn gk-go', onclick: start }, t('es_again'))));
  }
  start();
  return { onLang() { draw(); } };
}
