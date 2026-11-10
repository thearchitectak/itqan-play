// قراءة الساعة: اقرأ الساعة ذات العقارب، أو حرّك العقارب لتضبط وقتًا مطلوبًا، بمستويات من الساعات الكاملة حتى الدقائق.
import { h, t, addDict, sound, num, ico, store, settings } from '../../assets/js/core.js';
addDict({
  ar: { ck_read: 'اقرأ الساعة', ck_set: 'اضبط الساعة', ck_lvl: 'المستوى', ck_l1: 'ساعات كاملة', ck_l2: 'نصف ساعة', ck_l3: 'ربع ساعة', ck_l4: 'كل 5 دقائق', ck_l5: 'بالدقيقة',
    ck_q: 'كم الساعة؟', ck_setQ: 'حرّك العقارب لتصبح الساعة: {t}', ck_check: 'تحقق', ck_right: 'صحيح! 🎉', ck_wrong: 'ليس تمامًا، الساعة: {t}', ck_next: 'التالي', ck_score: '⭐ {n} · 🔥 {s}', ck_drag: 'اسحب العقرب الطويل للدقائق والقصير للساعات', ck_digital: 'الساعة الرقمية' },
  en: { ck_read: 'Read the clock', ck_set: 'Set the clock', ck_lvl: 'Level', ck_l1: "O'clock", ck_l2: 'Half hours', ck_l3: 'Quarters', ck_l4: '5 minutes', ck_l5: 'Minutes',
    ck_q: 'What time is it?', ck_setQ: 'Move the hands to: {t}', ck_check: 'Check', ck_right: 'Correct! 🎉', ck_wrong: 'Not quite — it is {t}', ck_next: 'Next', ck_score: '⭐ {n} · 🔥 {s}', ck_drag: 'Drag the long hand for minutes and the short hand for hours', ck_digital: 'Digital' },
});
const HOURS_AR = ['الثانية عشرة', 'الواحدة', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة'];
// صياغة الوقت بالعربية الفصحى
export function timeAr(hh, mm) {
  const H = (x) => HOURS_AR[x % 12];
  if (mm === 0) return `${H(hh)} تمامًا`;
  if (mm === 15) return `${H(hh)} والربع`;
  if (mm === 30) return `${H(hh)} والنصف`;
  if (mm === 45) return `${H(hh + 1)} إلا ربعًا`;
  if (mm === 20) return `${H(hh)} والثلث`;
  if (mm === 40) return `${H(hh + 1)} إلا ثلثًا`;
  if (mm < 30) return `${H(hh)} و${num(mm)} ${mm <= 10 && mm >= 3 ? 'دقائق' : 'دقيقة'}`;
  const r = 60 - mm; return `${H(hh + 1)} إلا ${num(r)} ${r <= 10 && r >= 3 ? 'دقائق' : 'دقيقة'}`;
}
const fmt = (hh, mm) => settings.lang === 'ar' ? timeAr(hh, mm) : `${hh % 12 || 12}:${String(mm).padStart(2, '0')}`;
const dig = (hh, mm) => `${num(hh % 12 || 12)}:${num(String(mm).padStart(2, '0'))}`;
const R = (n) => Math.floor(Math.random() * n);
function randTime(l) { const hh = 1 + R(12); const step = [60, 30, 15, 5, 1][l - 1]; const mm = step === 60 ? 0 : R(60 / step) * step; return [hh, mm]; }
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); p?.append(e); return e; };
function clockSvg(hh, mm, { drag, onChange } = {}) {
  const svg = sv('svg', { viewBox: '-110 -110 220 220', class: 'ck-svg' + (drag ? ' drag' : '') });
  sv('circle', { r: 104, fill: '#fff', stroke: '#0f766e', 'stroke-width': 8 }, svg);
  for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 90 : 84; sv('line', { x1: Math.sin(a) * r1, y1: -Math.cos(a) * r1, x2: Math.sin(a) * 96, y2: -Math.cos(a) * 96, stroke: i % 5 ? '#94a3b8' : '#0f172a', 'stroke-width': i % 5 ? 1.5 : 3.5 }, svg); }
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; const tx = sv('text', { x: Math.sin(a) * 70, y: -Math.cos(a) * 70 + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#0f172a' }, svg); tx.textContent = num(i); }
  const hA = ((hh % 12) + mm / 60) * 30, mA = mm * 6;
  const hand = (ang, len, w, col, cls) => { const g = sv('g', { transform: `rotate(${ang})`, class: cls }, svg); sv('line', { x1: 0, y1: 12, x2: 0, y2: -len, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, g); if (drag) sv('circle', { cx: 0, cy: -len, r: 11, fill: col, opacity: .25 }, g); return g; };
  const H = hand(hA, 48, 9, '#0f172a', 'ck-h'), M = hand(mA, 78, 5, '#e11d48', 'ck-m');
  sv('circle', { r: 7, fill: '#e11d48' }, svg);
  if (drag) {
    let which = null, cur = { hh, mm };
    const angle = (e) => { const r = svg.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360; };
    svg.addEventListener('pointerdown', (e) => { const a = angle(e); const dm = Math.min(Math.abs(a - cur.mm * 6), 360 - Math.abs(a - cur.mm * 6)), dh = Math.min(Math.abs(a - ((cur.hh % 12) + cur.mm / 60) * 30), 360 - Math.abs(a - ((cur.hh % 12) + cur.mm / 60) * 30)); which = dm <= dh ? 'm' : 'h'; svg.setPointerCapture(e.pointerId); move(e); });
    const move = (e) => {
      if (!which) return; const a = angle(e);
      if (which === 'm') { let m = Math.round(a / 6) % 60; const old = cur.mm; if (old > 45 && m < 15) cur.hh = cur.hh % 12 + 1; else if (old < 15 && m > 45) cur.hh = (cur.hh + 10) % 12 + 1; cur.mm = m; }
      else { cur.hh = (Math.floor(a / 30) % 12) || 12; }
      H.setAttribute('transform', `rotate(${((cur.hh % 12) + cur.mm / 60) * 30})`); M.setAttribute('transform', `rotate(${cur.mm * 6})`);
      onChange?.(cur.hh, cur.mm);
    };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', () => which = null);
  }
  return svg;
}
export async function mount(root) {
  if (!document.getElementById('ck-css')) document.head.append(h('link', { id: 'ck-css', rel: 'stylesheet', href: new URL('./clock.css', import.meta.url).href }));
  const view = h('div', { class: 'ck' }); root.append(view);
  let mode = 'read', lvl = store.get('ck-lvl', 1), score = 0, streak = 0, Q, answered = null, setT = null;
  function next() {
    const [hh, mm] = randTime(lvl); Q = { hh, mm };
    const opts = new Set([hh * 60 + mm]);
    while (opts.size < 4) { const [a, b] = Math.random() < .5 ? randTime(lvl) : [((hh + (R(3) - 1) + 11) % 12) + 1, (mm + [0, 5, 15, 30, 45][R(5)]) % 60]; opts.add(a * 60 + b); }
    Q.opts = [...opts].sort(() => Math.random() - .5).map(x => [Math.floor(x / 60), x % 60]);
    answered = null; setT = { hh: 12, mm: 0 }; draw();
  }
  function judge(ok) { answered = ok; if (ok) { score += 10 + streak * 2; streak++; sound('win'); } else { streak = 0; sound('error'); } draw(); }
  function draw() {
    view.innerHTML = '';
    const top = h('div', { class: 'ck-top' },
      h('div', { class: 'seg' }, [['read', t('ck_read')], ['set', t('ck_set')]].map(([k, l]) => h('button', { type: 'button', class: mode === k ? 'on' : '', onclick: () => { mode = k; next(); } }, l))),
      h('div', { class: 'seg' }, [1, 2, 3, 4, 5].map(k => h('button', { type: 'button', class: lvl === k ? 'on' : '', onclick: () => { lvl = k; store.set('ck-lvl', k); next(); } }, t('ck_l' + k)))),
      h('b', { class: 'ck-score' }, t('ck_score', { n: num(score), s: num(streak) })));
    let body;
    if (mode === 'read') {
      body = h('div', { class: 'ck-play' }, h('h2', {}, t('ck_q')), clockSvg(Q.hh, Q.mm),
        h('div', { class: 'ck-opts' }, Q.opts.map(([a, b]) => { const ok = a === Q.hh && b === Q.mm; return h('button', { type: 'button', class: 'ck-opt' + (answered != null ? ok ? ' ok' : '' : ''), disabled: answered != null, onclick: () => judge(ok) }, h('b', {}, fmt(a, b)), h('small', {}, dig(a, b))); })));
    } else {
      body = h('div', { class: 'ck-play' }, h('h2', {}, t('ck_setQ', { t: fmt(Q.hh, Q.mm) })), h('p', { class: 'ck-dig' }, dig(Q.hh, Q.mm)),
        clockSvg(answered != null && !answered ? Q.hh : setT.hh, answered != null && !answered ? Q.mm : setT.mm, { drag: answered == null, onChange: (a, b) => { setT = { hh: a, mm: b }; } }),
        h('small', { class: 'muted' }, t('ck_drag')),
        answered == null ? h('button', { type: 'button', class: 'btn gk-go', onclick: () => judge(setT.hh === Q.hh && setT.mm === Q.mm) }, ico('check', 18), t('ck_check')) : null);
    }
    view.append(top, body);
    if (answered != null) body.append(h('div', { class: 'ck-res ' + (answered ? 'ok' : 'bad') }, answered ? t('ck_right') : t('ck_wrong', { t: fmt(Q.hh, Q.mm) }), h('button', { type: 'button', class: 'btn', onclick: next }, t('ck_next'))));
  }
  next();
  return { onLang() { draw(); } };
}
