// رحلة حول العالم: العواصم والأعلام والقارات، بجولات سريعة ونجوم وتتبّع لما أتقنته.
import { h, t, addDict, sound, num, ico, store } from '../../assets/js/core.js';
import { COUNTRIES, CONT } from './data.js';
addDict({
  ar: { ge_m1: 'ما عاصمة…؟', ge_m2: 'علم أي دولة؟', ge_m3: 'عاصمة أي دولة؟', ge_m4: 'في أي قارة؟', ge_region: 'المنطقة', ge_all: 'كل الدول', ge_arab: 'الدول العربية',
    ge_q1: 'ما عاصمة {c}؟', ge_q2: 'هذا علم أي دولة؟', ge_q3: '{x} عاصمة أي دولة؟', ge_q4: 'في أي قارة تقع {c}؟', ge_round: 'السؤال {i} من 10', ge_end: 'انتهت الجولة: {n} من 10', ge_again: 'جولة جديدة', ge_master: 'أتقنت {n} من {m} دولة' },
  en: { ge_m1: 'Capital of…?', ge_m2: 'Whose flag?', ge_m3: 'Capital of which country?', ge_m4: 'Which continent?', ge_region: 'Region', ge_all: 'All countries', ge_arab: 'Arab countries',
    ge_q1: 'What is the capital of {c}?', ge_q2: 'Which country has this flag?', ge_q3: '{x} is the capital of…?', ge_q4: 'Which continent is {c} in?', ge_round: 'Question {i} of 10', ge_end: 'Round over: {n} of 10', ge_again: 'New round', ge_master: 'Mastered {n} of {m}' },
});
const R = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => a.sort(() => Math.random() - .5);
export async function mount(root) {
  if (!document.getElementById('ge-css')) document.head.append(h('link', { id: 'ge-css', rel: 'stylesheet', href: new URL('./geo.css', import.meta.url).href }));
  const view = h('div', { class: 'ge' }); root.append(view);
  let mode = 1, region = 'arab', i = 0, right = 0, Q, res = null;
  const mastered = new Set(store.get('ge-mastered', []));
  const pool = () => region === 'arab' ? COUNTRIES.slice(0, 22) : COUNTRIES;
  function newRound() { i = 0; right = 0; next(); }
  function next() {
    res = null; const P = pool(); const c = P[R(P.length)];
    const others = shuffle(COUNTRIES.filter(x => x !== c && (region === 'arab' ? COUNTRIES.slice(0, 22).includes(x) || Math.random() < .3 : true))).slice(0, 3);
    if (mode === 1) Q = { c, q: t('ge_q1', { c: c[0] }), opts: shuffle([c, ...others]).map(x => x[1]), ans: c[1] };
    if (mode === 2) Q = { c, flag: c[2], q: t('ge_q2'), opts: shuffle([c, ...others]).map(x => x[0]), ans: c[0] };
    if (mode === 3) Q = { c, q: t('ge_q3', { x: c[1] }), opts: shuffle([c, ...others]).map(x => x[0]), ans: c[0] };
    if (mode === 4) Q = { c, flag: c[2], q: t('ge_q4', { c: c[0] }), opts: shuffle(Object.keys(CONT)).slice(0, 4).concat([]).filter((x, k, arr) => true), ans: c[3] };
    if (mode === 4) { if (!Q.opts.includes(c[3])) Q.opts[0] = c[3]; Q.opts = shuffle(Q.opts).map(x => CONT[x]); Q.ans = CONT[c[3]]; }
    draw();
  }
  function pickA(o) { res = o === Q.ans; i++; if (res) { right++; mastered.add(Q.c[0] + mode); store.set('ge-mastered', [...mastered]); sound('win'); } else sound('error'); draw(); }
  function draw() {
    view.innerHTML = '';
    const total = pool().length * 4; const m = [...mastered].filter(x => pool().some(c => x.startsWith(c[0]))).length;
    view.append(h('div', { class: 'ge-top' },
      h('div', { class: 'seg' }, [1, 2, 3, 4].map(k => h('button', { type: 'button', class: mode === k ? 'on' : '', onclick: () => { mode = k; newRound(); } }, t('ge_m' + k)))),
      h('div', { class: 'seg' }, [['arab', '🌙 ' + t('ge_arab')], ['all', '🌍 ' + t('ge_all')]].map(([k, l]) => h('button', { type: 'button', class: region === k ? 'on' : '', onclick: () => { region = k; newRound(); } }, l))),
      h('span', { class: 'ge-m' }, '🏅 ', t('ge_master', { n: num(m), m: num(total) }))));
    if (i >= 10 && res != null) {
      view.append(h('div', { class: 'ge-play' }, h('h2', {}, t('ge_end', { n: num(right) })), h('div', { class: 'ge-stars' }, '⭐'.repeat(Math.round(right / 3.4)) || '💪'), h('button', { type: 'button', class: 'btn gk-go', onclick: newRound }, t('ge_again'))));
      return;
    }
    view.append(h('div', { class: 'ge-play' }, h('small', { class: 'muted' }, t('ge_round', { i: num(Math.min(i + (res == null ? 1 : 0), 10)), n: 10 })),
      Q.flag && mode === 2 ? h('div', { class: 'ge-flag' }, Q.flag) : null,
      h('h2', {}, mode === 4 ? [Q.flag, ' ', Q.q] : Q.q),
      h('div', { class: 'ge-opts' }, Q.opts.map(o => h('button', { type: 'button', class: 'ge-opt' + (res != null && o === Q.ans ? ' ok' : ''), disabled: res != null, onclick: () => pickA(o) }, o))),
      res != null ? h('div', { class: 'ck-res ' + (res ? 'ok' : 'bad') }, res ? '✔ ' : '✘ ', Q.c[2], ' ', Q.c[0], ' — ', Q.c[1], ' (', CONT[Q.c[3]], ')', h('button', { type: 'button', class: 'btn', onclick: () => i >= 10 ? draw() : next() }, ico('chevron-left', 16))) : null));
  }
  newRound();
  return { onLang() { draw(); } };
}
