// مطعم الكسور: تعلّم الكسور بالبيتزا والألواح — تعرّف الكسر، وكوّن الكسر بالتلوين، وقارن، واكتشف الكسور المتكافئة، واجمع الكسور.
import { h, t, addDict, sound, num, ico, store } from '../../assets/js/core.js';
addDict({
  ar: { fr_t1: 'ما الكسر؟', fr_t2: 'لوّن الكسر', fr_t3: 'أيهما أكبر؟', fr_t4: 'كسور متكافئة', fr_t5: 'اجمع الكسرين',
    fr_q1: 'ما الكسر الذي يمثله الجزء الملوّن؟', fr_q2: 'لوّن {f} من البيتزا', fr_q3: 'اختر الكسر الأكبر', fr_q4: 'أي كسر يساوي {f}؟', fr_q5: 'كم يساوي المجموع؟', fr_eq: 'متساويان',
    fr_check: 'تحقق', fr_right: 'أحسنت! 🍕', fr_wrong: 'حاول مرة أخرى، الإجابة: {a}', fr_next: 'التالي', fr_score: '⭐ {n}', fr_tip1: 'البسط = عدد الأجزاء الملوّنة، والمقام = عدد الأجزاء كلها.', fr_tip3: 'كلما كبر المقام صغر الجزء الواحد.', fr_tip4: 'اضرب البسط والمقام في العدد نفسه لتحصل على كسر مكافئ.', fr_tip5: 'وحّد المقامات ثم اجمع البسوط.' },
  en: { fr_t1: 'Name it', fr_t2: 'Colour it', fr_t3: 'Which is bigger?', fr_t4: 'Equivalent', fr_t5: 'Add them',
    fr_q1: 'Which fraction is shaded?', fr_q2: 'Colour {f} of the pizza', fr_q3: 'Pick the bigger fraction', fr_q4: 'Which fraction equals {f}?', fr_q5: 'What is the sum?', fr_eq: 'Equal',
    fr_check: 'Check', fr_right: 'Well done! 🍕', fr_wrong: 'Try again — answer: {a}', fr_next: 'Next', fr_score: '⭐ {n}', fr_tip1: 'Numerator = shaded parts, denominator = all parts.', fr_tip3: 'The bigger the denominator, the smaller each part.', fr_tip4: 'Multiply top and bottom by the same number.', fr_tip5: 'Use a common denominator, then add the tops.' },
});
const R = (n) => Math.floor(Math.random() * n);
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const frac = (n, d, cls = '') => h('span', { class: 'fr-f ' + cls }, h('b', {}, num(n)), h('i'), h('b', {}, num(d)));
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); p?.append(e); return e; };
function pizza(d, shaded, { onToggle, color = '#f59e0b' } = {}) {
  const svg = sv('svg', { viewBox: '-105 -105 210 210', class: 'fr-pizza' });
  sv('circle', { r: 102, fill: '#d97706' }, svg);
  for (let i = 0; i < d; i++) {
    const a0 = (i / d) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
    const path = d === 1 ? 'M -92 0 A 92 92 0 1 1 92 0 A 92 92 0 1 1 -92 0' : `M0 0 L${Math.cos(a0) * 92} ${Math.sin(a0) * 92} A92 92 0 ${1 / d > .5 ? 1 : 0} 1 ${Math.cos(a1) * 92} ${Math.sin(a1) * 92}Z`;
    const on = shaded.includes(i);
    const p = sv('path', { d: path, fill: on ? '#fde68a' : '#fef3c7', stroke: '#b45309', 'stroke-width': 2.5, class: onToggle ? 'tap' : '' }, svg);
    if (on) { const am = (a0 + a1) / 2; for (const [r, off] of [[55, 0], [35, .25], [70, -.2]]) if (d <= 12) sv('circle', { cx: Math.cos(am + off / d * 3) * r, cy: Math.sin(am + off / d * 3) * r, r: 7, fill: '#dc2626' }, svg); }
    if (onToggle) p.addEventListener('click', () => onToggle(i));
  }
  return svg;
}
function bar(d, n, color) { return h('div', { class: 'fr-bar', style: { '--d': d } }, Array.from({ length: d }, (_, i) => h('i', { class: i < n ? 'on' : '', style: i < n ? { background: color } : null }))); }
export async function mount(root) {
  if (!document.getElementById('fr-css')) document.head.append(h('link', { id: 'fr-css', rel: 'stylesheet', href: new URL('./fractions.css', import.meta.url).href }));
  const view = h('div', { class: 'fr' }); root.append(view);
  let task = 1, score = store.get('fr-score', 0), Q, res = null, colored = [];
  function gen() {
    res = null; colored = [];
    const d = [2, 3, 4, 5, 6, 8, 10, 12][R(8)], n = 1 + R(d - 1);
    if (task === 1) { const sh = [...Array(d).keys()].sort(() => Math.random() - .5).slice(0, n); const opts = new Set([n + '/' + d]); while (opts.size < 4) { const dd = [2, 3, 4, 5, 6, 8, 10, 12][R(8)], nn = 1 + R(dd - 1); if (Math.abs(nn / dd - n / d) > 1e-9) opts.add(nn + '/' + dd); } opts.add(n + '/' + d); Q = { d, n, sh, opts: [...opts].slice(0, 4).sort(() => Math.random() - .5), ans: n + '/' + d }; if (!Q.opts.includes(Q.ans)) Q.opts[0] = Q.ans; }
    else if (task === 2) Q = { d, n };
    else if (task === 3) { let d2 = [2, 3, 4, 5, 6, 8][R(6)], n2 = 1 + R(d2 - 1); if (Math.random() < .15) { n2 = n * 2; d2 = d * 2; } Q = { a: [n, d], b: [n2, d2] }; const va = n / d, vb = n2 / d2; Q.ans = Math.abs(va - vb) < 1e-9 ? 'eq' : va > vb ? 'a' : 'b'; }
    else if (task === 4) { const g = gcd(n, d); const bn = n / g, bd = d / g; const k = 2 + R(3); const right = (bn * k) + '/' + (bd * k); const opts = new Set([right]); while (opts.size < 4) { const k2 = 2 + R(3); opts.add((bn * k2 + (R(2) ? 1 : -1)) + '/' + (bd * k2)); } Q = { f: [bn, bd], opts: [...opts].filter(x => !x.startsWith('0/')).sort(() => Math.random() - .5), ans: right }; }
    else { const dd = [2, 3, 4, 6, 8][R(5)]; const k = [1, 2][R(2)]; const d1 = dd, d2 = dd * k; const n1 = 1 + R(d1 - 1), n2 = 1 + R(d2 - 1); const L = Math.max(d1, d2); const sn = n1 * (L / d1) + n2 * (L / d2); const g = gcd(sn, L); const right = (sn / g) + '/' + (L / g); const opts = new Set([right, (n1 + n2) + '/' + (d1 + d2)]); while (opts.size < 4) opts.add((sn / g + R(3) + 1) + '/' + (L / g)); Q = { a: [n1, d1], b: [n2, d2], opts: [...opts].sort(() => Math.random() - .5), ans: right }; }
    draw();
  }
  const fstr = (s) => { const [a, b] = s.split('/'); return frac(a, b); };
  function judge(ok) { res = ok; if (ok) { score += 10; store.set('fr-score', score); sound('win'); } else sound('error'); draw(); }
  function draw() {
    view.innerHTML = '';
    const tabs = h('div', { class: 'fr-tabs' }, [1, 2, 3, 4, 5].map(k => h('button', { type: 'button', class: task === k ? 'on' : '', onclick: () => { task = k; gen(); } }, ['🍕', '🖍️', '⚖️', '🟰', '➕'][k - 1], ' ', t('fr_t' + k))), h('b', { class: 'fr-score' }, t('fr_score', { n: num(score) })));
    const box = h('div', { class: 'fr-play' });
    const ansTxt = () => task === 3 ? (Q.ans === 'eq' ? t('fr_eq') : '') : '';
    if (task === 1) box.append(h('h2', {}, t('fr_q1')), pizza(Q.d, Q.sh), h('div', { class: 'fr-opts' }, Q.opts.map(o => h('button', { type: 'button', class: 'fr-opt' + (res != null && o === Q.ans ? ' ok' : ''), disabled: res != null, onclick: () => judge(o === Q.ans) }, fstr(o)))), h('p', { class: 'muted' }, t('fr_tip1')));
    if (task === 2) box.append(h('h2', {}, t('fr_q2', { f: '' }), frac(Q.n, Q.d, 'big')), pizza(Q.d, colored, res == null ? { onToggle: (i) => { const k = colored.indexOf(i); k >= 0 ? colored.splice(k, 1) : colored.push(i); sound('place'); draw(); } } : {}),
      h('div', { class: 'fr-now' }, frac(colored.length, Q.d)), res == null ? h('button', { type: 'button', class: 'btn gk-go', onclick: () => judge(colored.length === Q.n) }, ico('check', 18), t('fr_check')) : null);
    if (task === 3) box.append(h('h2', {}, t('fr_q3')), h('div', { class: 'fr-cmp' }, [['a', Q.a, '#f59e0b'], ['b', Q.b, '#0ea5e9']].map(([k, [n, d], c]) => h('button', { type: 'button', class: 'fr-cbox' + (res != null && Q.ans === k ? ' ok' : ''), disabled: res != null, onclick: () => judge(Q.ans === k) }, frac(n, d, 'big'), bar(d, n, c)))),
      h('button', { type: 'button', class: 'btn ghost' + (res != null && Q.ans === 'eq' ? ' ok' : ''), disabled: res != null, onclick: () => judge(Q.ans === 'eq') }, '= ', t('fr_eq')), h('p', { class: 'muted' }, t('fr_tip3')));
    if (task === 4) box.append(h('h2', {}, t('fr_q4', { f: '' }), frac(Q.f[0], Q.f[1], 'big')), bar(Q.f[1], Q.f[0], '#22c55e'), h('div', { class: 'fr-opts' }, Q.opts.map(o => h('button', { type: 'button', class: 'fr-opt' + (res != null && o === Q.ans ? ' ok' : ''), disabled: res != null, onclick: () => judge(o === Q.ans) }, fstr(o)))), h('p', { class: 'muted' }, t('fr_tip4')));
    if (task === 5) box.append(h('h2', {}, t('fr_q5')), h('div', { class: 'fr-sum' }, frac(...Q.a, 'big'), h('span', {}, '+'), frac(...Q.b, 'big'), h('span', {}, '=', ' ؟')), h('div', { class: 'fr-bars' }, bar(Q.a[1], Q.a[0], '#f59e0b'), bar(Q.b[1], Q.b[0], '#0ea5e9')),
      h('div', { class: 'fr-opts' }, Q.opts.map(o => h('button', { type: 'button', class: 'fr-opt' + (res != null && o === Q.ans ? ' ok' : ''), disabled: res != null, onclick: () => judge(o === Q.ans) }, fstr(o)))), h('p', { class: 'muted' }, t('fr_tip5')));
    if (res != null) box.append(h('div', { class: 'ck-res ' + (res ? 'ok' : 'bad') }, res ? t('fr_right') : t('fr_wrong', { a: '' }), res ? null : (task === 2 ? frac(Q.n, Q.d) : task === 3 ? (Q.ans === 'eq' ? t('fr_eq') : frac(...(Q.ans === 'a' ? Q.a : Q.b))) : fstr(Q.ans)), h('button', { type: 'button', class: 'btn', onclick: gen }, t('fr_next'))));
    void ansTxt;
    view.append(tabs, box);
  }
  gen();
  return { onLang() { draw(); } };
}
