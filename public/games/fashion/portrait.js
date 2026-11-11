// استوديو الجمال: تلبيس ومكياج بطبقات رسومات احترافية مرسومة يدويًا (LinXueLian، رخصة CC BY 4.0).
// الطبقات بمقاس 537×700، وكلها على قاعدة الجسم نفسها، فتتراكب بدقة.
import { h, sound, store, toast, num } from '../../assets/js/core.js';
import { LX } from './lx/manifest.js';
const BASE = new URL('./lx/', import.meta.url).href;
const W = 537, H = 700;
// ترتيب الطبقات من الأسفل إلى الأعلى
const ORDER = ['base', 'blush', 'mouth', 'eyes', 'brows', '@makeup', 'blouse', 'bodice', 'cross', 'jacket', 'collar', 'sleeve', 'cravat', 'brooch', 'ribbon', 'earrings', 'hair', 'hat', 'hatbow', 'bfly'];
const GROUPS = [
  ['face', '💆‍♀️', 'الوجه', [['skin', 'لون البشرة'], ['eyes', 'العيون'], ['brows', 'الحواجب'], ['mouth', 'الفم والابتسامة'], ['blush', 'أحمر الخدود الأساسي']]],
  ['hair', '💇‍♀️', 'الشعر', [['hair', 'تسريحة الشعر']]],
  ['wear', '👗', 'الملابس', [['bodice', 'فستان بأكتاف مكشوفة'], ['sleeve', 'كشكشة الأكتاف'], ['cross', 'بلوزة متقاطعة'], ['blouse', 'قميص'], ['jacket', 'سترة'], ['collar', 'ياقة السترة'], ['cravat', 'ربطة عنق'], ['ribbon', 'شريط الرقبة']]],
  ['acc', '💎', 'الإكسسوارات', [['earrings', 'أقراط'], ['brooch', 'بروش'], ['hat', 'قبعة'], ['hatbow', 'زينة القبعة'], ['bfly', 'مشابك الفراشة']]],
  ['makeup', '💄', 'المكياج', null],
];
const OPTIONAL = new Set(['blush', 'blouse', 'bodice', 'cross', 'jacket', 'collar', 'sleeve', 'cravat', 'brooch', 'ribbon', 'earrings', 'hat', 'hatbow', 'bfly']);
const SKINS = [['فاتحة جدًا', 'brightness(1.05) saturate(.75)'], ['خوخية', 'none'], ['قمحية', 'sepia(.25) saturate(1.15) brightness(.93)'], ['حنطية', 'sepia(.4) saturate(1.2) brightness(.84) hue-rotate(-5deg)'], ['سمراء', 'sepia(.5) saturate(1.2) brightness(.7) hue-rotate(-8deg)'], ['داكنة', 'sepia(.55) saturate(1.1) brightness(.52) hue-rotate(-10deg)']];
// أدوات المكياج: الموضع على الوجه (بإحداثيات الصورة) والألوان الواقعية
const MK = [
  ['lip', '💄', 'أحمر الشفاه', ['#c97b74', '#d9657a', '#c2185b', '#b71c1c', '#8e244d', '#e5737a', '#a0525a', '#ff7f6a'], [268, 360]],
  ['gloss', '💧', 'ملمّع الشفاه', null, [268, 366]],
  ['shadow', '🎨', 'ظل العيون', ['#b98a7a', '#c9a96e', '#a77bb8', '#7aa1c9', '#d7889c', '#8d6e63', '#5d6470', '#c6a0d8'], [268, 276]],
  ['liner', '✒️', 'محدد العيون', ['#151515', '#3b2416', '#1f2a7a', '#4a1b5c'], [268, 282]],
  ['blushx', '🌸', 'أحمر الخدود', ['#f28b82', '#ff9aa2', '#f4a582', '#e57f94', '#d98fa6'], [268, 330]],
  ['high', '✨', 'هايلايتر', null, [268, 312]],
  ['contour', '🖌️', 'كونتور', null, [268, 345]],
  ['glitter', '💫', 'لمعة براقة', null, [268, 300]],
  ['mole', '•', 'شامة جمال', null, [300, 350]],
];
const DEF = { skin: 1, base: 'peachy', eyes: (LX.eyes.find(x => /blue/.test(x.id)) || LX.eyes[0]).id, brows: (LX.brows.find(x => /d-regular/.test(x.id)) || LX.brows[0]).id, mouth: (LX.mouth.find(x => /smile-pink/.test(x.id)) || LX.mouth[0]).id, blush: LX.blush[1]?.id || null, hair: (LX.hair.find(x => /melina-honey/.test(x.id)) || LX.hair[0]).id, bodice: 'pink', sleeve: 'ivory', earrings: 'gold', mk: {} };

export function portraitStudio(root) {
  if (!document.getElementById('fp-css')) document.head.append(h('link', { id: 'fp-css', rel: 'stylesheet', href: new URL('./portrait.css', import.meta.url).href }));
  let S = { ...DEF, ...store.get('fp-cur', {}) }; S.mk = S.mk || {};
  let grp = 'face', cat = 'eyes', zoom = false, mkTool = 'lip', looks = store.get('fp-looks', []);
  const save = () => { store.set('fp-cur', S); };
  const url = (c, id, b) => `${BASE}${c}/${id}${b ? '-b' : ''}.webp`;
  const view = h('div', { class: 'fp' }); root.append(view);

  function doll(small) {
    const st = h('div', { class: 'fp-doll' + (small ? ' small' : '') });
    for (const c of ORDER) {
      if (c === '@makeup') { st.append(makeupLayer()); continue; }
      const id = c === 'base' ? 'peachy' : S[c]; if (!id) continue;
      const it = (LX[c] || []).find(x => x.id === id); if (!it) continue;
      const im = h('img', { src: url(c, id), alt: '', draggable: 'false', class: 'fp-l fp-' + c, style: c === 'base' ? { filter: SKINS[S.skin ?? 1][1] } : null });
      st.append(im); if (it.pair) st.append(h('img', { src: url(c, id, true), alt: '', draggable: 'false', class: 'fp-l' }));
    }
    return st;
  }
  // طبقة المكياج: صبغات بأسلوب «multiply» فوق ملامح الرسمة نفسها
  function makeupLayer() {
    const m = S.mk, k = m.k ?? 1, box = h('div', { class: 'fp-mk' });
    const mouthUrl = url('mouth', S.mouth);
    if (m.lip) box.append(h('div', { class: 'fp-tint', style: { background: m.lip, opacity: .78 * k, '-webkit-mask-image': `url("${mouthUrl}")`, 'mask-image': `url("${mouthUrl}")` } }));
    const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="fpb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter><filter id="fpb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
      ${m.shadow ? `<g style="mix-blend-mode:multiply" opacity="${.62 * k}" filter="url(#fpb)"><ellipse cx="212" cy="270" rx="34" ry="13" fill="${m.shadow}"/><ellipse cx="324" cy="270" rx="34" ry="13" fill="${m.shadow}"/></g>` : ''}
      ${m.blushx ? `<g style="mix-blend-mode:multiply" opacity="${.5 * k}" filter="url(#fpb)"><ellipse cx="207" cy="328" rx="30" ry="17" fill="${m.blushx}"/><ellipse cx="329" cy="328" rx="30" ry="17" fill="${m.blushx}"/></g>` : ''}
      ${m.contour ? `<g style="mix-blend-mode:multiply" opacity="${.35 * k}" filter="url(#fpb)"><path d="M186 320 Q196 360 230 384" stroke="#8a5a44" stroke-width="16" fill="none"/><path d="M350 320 Q340 360 306 384" stroke="#8a5a44" stroke-width="16" fill="none"/></g>` : ''}
      ${m.high ? `<g opacity="${.75 * k}" filter="url(#fpb2)"><ellipse cx="214" cy="308" rx="14" ry="5" fill="#fff8ea"/><ellipse cx="322" cy="308" rx="14" ry="5" fill="#fff8ea"/><ellipse cx="268" cy="315" rx="3" ry="12" fill="#fff8ea"/></g>` : ''}
      ${m.liner ? `<g fill="${m.liner}" opacity="${Math.min(1, .95 * k + .1)}"><path d="M186 280 Q196 268 214 266 Q194 270 182 282 L170 274 Z"/><path d="M350 280 Q340 268 322 266 Q342 270 354 282 L366 274 Z"/></g>` : ''}
      ${m.gloss ? `<ellipse cx="270" cy="366" rx="11" ry="3" fill="#fff" opacity="${.7 * k}" filter="url(#fpb2)"/><ellipse cx="272" cy="365" rx="4" ry="1.4" fill="#fff" opacity=".9"/>` : ''}
      ${m.glitter ? [[200, 300], [212, 292], [224, 302], [330, 300], [318, 292], [342, 302], [268, 250], [190, 270], [346, 270]].map(([x, y], i) => `<path d="M${x} ${y - 5} l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5 Z" fill="#fffbe6" opacity="${.6 + (i % 3) * .13}"/>`).join('') : ''}
      ${m.mole ? `<circle cx="300" cy="350" r="2.6" fill="#4a2a1a"/>` : ''}
    </svg>`;
    box.insertAdjacentHTML('beforeend', svg);
    return box;
  }
  function stage() {
    const d = doll();
    const wrap = h('div', { class: 'fp-stage' + (zoom ? ' zoom' : '') }, h('div', { class: 'fp-spark' }), d,
      h('button', { type: 'button', class: 'fp-zoom', onclick: () => { zoom = !zoom; draw(); } }, zoom ? '🔍− تصغير' : '🔍+ تكبير الوجه'));
    return wrap;
  }
  // تحريك أداة المكياج فوق الوجه قبل تطبيق اللون
  function brush(tool, apply) {
    const st = view.querySelector('.fp-stage'); const d = st?.querySelector('.fp-doll'); if (!d) { apply(); draw(); return; }
    const T = MK.find(x => x[0] === tool); const r = d.getBoundingClientRect(), sr = st.getBoundingClientRect();
    const px = (x) => r.left - sr.left + x / W * r.width, py = (y) => r.top - sr.top + y / H * r.height;
    const ic = h('div', { class: 'fp-tool' }, T[1]); st.append(ic);
    const [cx, cy] = T[4]; const pts = tool === 'lip' || tool === 'gloss' ? [[cx - 22, cy], [cx + 22, cy], [cx - 10, cy + 3], [cx + 10, cy + 3]] : tool === 'shadow' || tool === 'liner' || tool === 'glitter' ? [[205, 272], [225, 270], [312, 270], [332, 272]] : tool === 'mole' ? [[cx, cy]] : [[205, cy], [225, cy + 4], [312, cy + 4], [332, cy]];
    let i = 0; sound('place');
    const step = () => { if (i >= pts.length) { ic.remove(); apply(); save(); draw(); return; } const [x, y] = pts[i++]; ic.style.transform = `translate(${px(x)}px, ${py(y)}px)`; setTimeout(step, 160); };
    ic.style.transform = `translate(${sr.width - 40}px, ${sr.height - 40}px)`; requestAnimationFrame(() => requestAnimationFrame(step));
  }
  function panel() {
    const tabs = h('div', { class: 'fp-tabs' }, GROUPS.map(([k, ic, n, cs]) => h('button', { type: 'button', class: grp === k ? 'on' : '', onclick: () => { grp = k; if (cs) cat = cs[0][0]; zoom = k === 'makeup' || k === 'face'; draw(); } }, h('span', {}, ic), h('small', {}, n))));
    const G = GROUPS.find(x => x[0] === grp);
    let body;
    if (grp === 'makeup') {
      const T = MK.find(x => x[0] === mkTool);
      body = h('div', { class: 'fp-body' },
        h('div', { class: 'fp-mktools' }, MK.map(([k, ic, n]) => h('button', { type: 'button', class: (mkTool === k ? 'on' : '') + (S.mk[k] ? ' used' : ''), onclick: () => { mkTool = k; if (!MK.find(x => x[0] === k)[3]) brush(k, () => { S.mk[k] = !S.mk[k]; }); else draw(); } }, h('span', {}, ic), h('small', {}, n)))),
        T[3] ? h('div', { class: 'fp-swatches' }, h('button', { type: 'button', class: 'fp-none' + (!S.mk[mkTool] ? ' on' : ''), title: 'إزالة', onclick: () => { delete S.mk[mkTool]; save(); draw(); } }, '⊘'),
          T[3].map(c => h('button', { type: 'button', class: S.mk[mkTool] === c ? 'on' : '', style: { background: c }, onclick: () => brush(mkTool, () => { S.mk[mkTool] = c; }) }))) : h('p', { class: 'muted' }, S.mk[mkTool] ? '✅ مفعّل — اضغطي الأداة مرة أخرى لإزالتها' : 'اضغطي الأداة لتطبيقها على الوجه'),
        h('label', { class: 'fp-k' }, 'الشدة', h('input', { type: 'range', min: .3, max: 1, step: .05, value: S.mk.k ?? 1, oninput: (e) => { S.mk.k = +e.target.value; save(); const old = view.querySelector('.fp-stage .fp-mk'); old?.replaceWith(makeupLayer()); } })),
        h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { S.mk = {}; save(); draw(); } }, '🧽 إزالة كل المكياج'));
    } else {
      const sub = h('div', { class: 'fp-sub' }, G[3].map(([k, n]) => h('button', { type: 'button', class: cat === k ? 'on' : '', onclick: () => { cat = k; draw(); } }, n)));
      let grid;
      if (cat === 'skin') grid = h('div', { class: 'fp-grid skins' }, SKINS.map(([n, f], i) => h('button', { type: 'button', class: (S.skin ?? 1) === i ? 'on' : '', onclick: () => { S.skin = i; save(); sound('place'); draw(); } }, h('i', { style: { background: '#f6d2bd', filter: f } }), h('small', {}, n))));
      else grid = h('div', { class: 'fp-grid' }, OPTIONAL.has(cat) ? h('button', { type: 'button', class: 'fp-none' + (!S[cat] ? ' on' : ''), onclick: () => { S[cat] = null; save(); draw(); } }, '⊘', h('small', {}, 'بلا')) : null,
        (LX[cat] || []).map(it => h('button', { type: 'button', class: S[cat] === it.id ? 'on' : '', title: it.n, onclick: () => { S[cat] = it.id; if (cat === 'collar' && !S.jacket) S.jacket = LX.jacket[0].id; if (cat === 'hatbow' && !S.hat) S.hat = LX.hat[0].id; sound('place'); save(); draw(); } }, h('img', { src: `${BASE}t/${cat}/${it.id}.webp`, alt: it.n, loading: 'lazy' }))));
      body = h('div', { class: 'fp-body' }, sub, grid);
    }
    return h('div', { class: 'fp-panel' }, tabs, body,
      h('div', { class: 'fp-actions' },
        h('button', { type: 'button', class: 'btn', onclick: () => { if (looks.length >= 8) return toast('المعرض ممتلئ (8 إطلالات)', true); looks.push(JSON.parse(JSON.stringify(S))); store.set('fp-looks', looks); sound('win'); toast('حُفظت الإطلالة في معرضك ✨', 'ok'); draw(); } }, '💖 احفظي الإطلالة'),
        h('button', { type: 'button', class: 'btn ghost', onclick: snapshot }, '📸 حمّلي صورة'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { const r = (c) => (LX[c] || [])[Math.floor(Math.random() * (LX[c] || []).length)]?.id, q = (p, c) => Math.random() < p ? r(c) : null; const top = ['bodice', 'cross', 'blouse'][Math.floor(Math.random() * 3)]; S = { ...S, eyes: r('eyes'), hair: r('hair'), mouth: r('mouth'), brows: r('brows'), bodice: null, cross: null, blouse: null, [top]: r(top), jacket: q(.3, 'jacket'), collar: q(.35, 'collar'), cravat: q(.25, 'cravat'), brooch: q(.3, 'brooch'), ribbon: q(.2, 'ribbon'), sleeve: q(.5, 'sleeve'), earrings: q(.8, 'earrings'), bfly: q(.3, 'bfly'), hat: null, hatbow: null }; if (Math.random() < .25) { S.hat = r('hat'); S.hatbow = q(.6, 'hatbow'); S.bfly = null; } save(); sound('draw'); draw(); } }, '🎲 إطلالة عشوائية')),
      looks.length ? h('div', { class: 'fp-looks' }, h('b', {}, '🗂️ معرض إطلالاتي (', num(looks.length), '/8)'), h('div', {}, looks.map((x, i) => { const o = S; S = x; const d = doll(true); S = o; return h('div', { class: 'fp-look' }, h('button', { type: 'button', onclick: () => { S = JSON.parse(JSON.stringify(x)); save(); draw(); } }, d), h('i', { onclick: () => { looks.splice(i, 1); store.set('fp-looks', looks); draw(); } }, '✕')); }))) : null,
      h('small', { class: 'fp-credit' }, 'الرسومات: ', h('a', { href: 'https://linxuelian.itch.io/', target: '_blank', rel: 'noopener' }, 'LinXueLian'), ' — CC BY 4.0'));
  }
  // صورة للتحميل: نرسم الطبقات على لوحة واحدة
  async function snapshot() {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const bg = g.createRadialGradient(W / 2, 260, 40, W / 2, 300, 520); bg.addColorStop(0, '#fff'); bg.addColorStop(.5, '#fbe3ef'); bg.addColorStop(1, '#e9b8d4'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const d = doll(); d.style.position = 'fixed'; d.style.left = '-9999px'; d.style.width = W + 'px'; d.style.height = H + 'px'; document.body.append(d);
    try {
      for (const el of d.children) {
        if (el.tagName === 'IMG') { await el.decode().catch(() => { }); g.filter = el.style.filter || 'none'; g.drawImage(el, 0, 0, W, H); g.filter = 'none'; }
        else { // المكياج: نرسم ملف SVG كصورة، وصبغة الشفاه عبر قناع
          const tint = el.querySelector('.fp-tint'); if (tint) { const m = new Image(); m.src = url('mouth', S.mouth); await m.decode(); const t = document.createElement('canvas'); t.width = W; t.height = H; const tg = t.getContext('2d'); tg.drawImage(m, 0, 0, W, H); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = S.mk.lip; tg.fillRect(0, 0, W, H); g.globalAlpha = .78 * (S.mk.k ?? 1); g.globalCompositeOperation = 'multiply'; g.drawImage(t, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
          const sv = el.querySelector('svg'); if (sv) { const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sv.outerHTML.replace('<svg ', '<svg width="537" height="700" ')); await im.decode().catch(() => { }); g.globalCompositeOperation = 'multiply'; g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-over'; }
        }
      }
      const a = document.createElement('a'); a.download = 'itlala.png'; a.href = c.toDataURL('image/png'); a.click();
    } finally { d.remove(); }
  }
  function draw() { view.innerHTML = ''; view.append(h('div', { class: 'fp-main' }, stage(), panel())); }
  draw();
  return { redraw: draw };
}
