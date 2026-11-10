// مصممة الأزياء المبدعة: صممي الملابس واختاري الألوان والأقمشة والنقوش والإكسسوارات، واحفظي مجموعتك، ثم اعرضيها في عرض أزياء افتراضي وتعرّفي على تناسق الألوان وتكلفة الإنتاج والربح.
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';
addDict({
  ar: { fs_top: 'القطعة العلوية', fs_bottom: 'القطعة السفلية', fs_dress: 'فستان', fs_color: 'اللون', fs_pattern: 'النقش', fs_acc: 'الإكسسوارات', fs_save: 'احفظي في المجموعة', fs_show: 'ابدئي عرض الأزياء ✨', fs_coll: 'مجموعتي', fs_harmony: 'تناسق الألوان', fs_cost: 'تكلفة القماش', fs_price: 'سعر البيع', fs_part: 'الجزء', fs_skin: 'لون البشرة', fs_hair: 'الشعر',
    fs_h3: 'رائع! ألوان متكاملة أو متجاورة على دائرة الألوان', fs_h2: 'جيد: الألوان المحايدة تناسب كل شيء', fs_h1: 'جربي ألوانًا متجاورة أو متقابلة على دائرة الألوان', fs_saved: 'حُفظ التصميم في مجموعتك', fs_full: 'المجموعة ممتلئة (8 تصاميم)، احذفي تصميمًا',
    fs_result: 'نتيجة العرض: أعجب الجمهور بنسبة {p}% وبعتِ {n} قطعة، وكان ربحك {r}', fs_profit: 'الربح = (سعر البيع − التكلفة) × عدد القطع', fs_empty: 'احفظي تصميمًا واحدًا على الأقل', fs_close: 'إنهاء العرض' },
  en: { fs_top: 'Top', fs_bottom: 'Bottom', fs_dress: 'Dress', fs_color: 'Colour', fs_pattern: 'Pattern', fs_acc: 'Accessories', fs_save: 'Save to collection', fs_show: 'Start the fashion show ✨', fs_coll: 'My collection', fs_harmony: 'Colour harmony', fs_cost: 'Fabric cost', fs_price: 'Price', fs_part: 'Part', fs_skin: 'Skin', fs_hair: 'Hair',
    fs_h3: 'Great! Complementary or analogous colours', fs_h2: 'Good: neutrals go with everything', fs_h1: 'Try neighbouring or opposite colours on the colour wheel', fs_saved: 'Saved to your collection', fs_full: 'Collection is full (8)',
    fs_result: 'Show result: {p}% audience approval, {n} pieces sold, profit {r}', fs_profit: 'Profit = (price − cost) × pieces', fs_empty: 'Save at least one design', fs_close: 'End show' },
});
const COLORS = ['#ffffff', '#111827', '#9ca3af', '#f5deb3', '#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#7c2d12', '#065f46', '#1e3a8a'];
const TOPS = { tee: 'قميص قصير', blouse: 'بلوزة', jacket: 'سترة', hoodie: 'هودي' };
const BOTTOMS = { pants: 'بنطال', skirt: 'تنورة', long: 'تنورة طويلة', shorts: 'شورت' };
const DRESSES = { none: 'بلا فستان', aline: 'فستان قصير', gown: 'فستان طويل', abaya: 'عباءة' };
const PATTERNS = { solid: 'سادة', stripes: 'مخطط', dots: 'منقط', flowers: 'ورود', checks: 'مربعات' };
const ACC = { hijab: '🧕 حجاب', hat: '👒 قبعة', bag: '👜 حقيبة', scarf: '🧣 وشاح', glasses: '🕶️ نظارة', crown: '👑 تاج' };
const HAIRS = { long: 'طويل', bob: 'قصير', bun: 'كعكة', pony: 'ذيل حصان', curly: 'مجعد' };
const PCOST = { solid: 40, stripes: 55, dots: 55, flowers: 70, checks: 60 };
const hue = (hex) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx - mn < .12) return null; let hh; if (mx === r) hh = ((g - b) / (mx - mn)) % 6; else if (mx === g) hh = (b - r) / (mx - mn) + 2; else hh = (r - g) / (mx - mn) + 4; return (hh * 60 + 360) % 360; };
function harmony(d) {
  const cs = d.dress !== 'none' ? [d.c1, d.c3] : [d.c1, d.c2, d.c3]; const hs = cs.map(hue).filter(x => x != null);
  if (hs.length <= 1) return 2;
  let good = true; for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) { const df = Math.min(Math.abs(hs[i] - hs[j]), 360 - Math.abs(hs[i] - hs[j])); if (!(df < 45 || df > 150)) good = false; }
  return good ? 3 : 1;
}
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); p?.append(e); return e; };
let pid = 0;
export function figure(d, small = false) {
  const svg = sv('svg', { viewBox: '0 0 200 420', class: 'fs-fig' + (small ? ' small' : '') });
  const defs = sv('defs', {}, svg); const u = 'f' + (++pid);
  const grad = (id, stops, at = {}) => { const g = sv(at.r ? 'radialGradient' : 'linearGradient', { id: u + id, ...at.a }, defs); for (const [o, c, op = 1] of stops) sv('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, g); return `url(#${u + id})`; };
  const fill = (col, pat) => { if (pat === 'solid' || !pat) return col; const id = u + 'p' + (++pid); const p = sv('pattern', { id, width: 16, height: 16, patternUnits: 'userSpaceOnUse' }, defs); sv('rect', { width: 16, height: 16, fill: col }, p); const fg = hue(col) == null && col !== '#9ca3af' ? (col === '#111827' ? '#fff' : '#111827') : '#ffffff';
    if (pat === 'stripes') sv('rect', { width: 16, height: 5, fill: fg, opacity: .7 }, p); if (pat === 'dots') sv('circle', { cx: 8, cy: 8, r: 2.6, fill: fg, opacity: .85 }, p); if (pat === 'checks') { sv('rect', { width: 8, height: 8, fill: fg, opacity: .4 }, p); sv('rect', { x: 8, y: 8, width: 8, height: 8, fill: fg, opacity: .4 }, p); } if (pat === 'flowers') { for (const [x, y] of [[4, 4], [12, 12]]) { for (const a of [0, 72, 144, 216, 288]) sv('circle', { cx: x + Math.cos(a / 57.3) * 2, cy: y + Math.sin(a / 57.3) * 2, r: 1.6, fill: '#fde047' }, p); sv('circle', { cx: x, cy: y, r: 1.1, fill: '#ef4444' }, p); } } return `url(#${id})`; };
  const skin = d.skin || '#f1c27d', hair = d.hair || '#3f2a1d', A = d.acc || [], hijab = A.includes('hijab');
  const dk = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`; };
  // تدرجات: إضاءة من أعلى اليسار
  const skinG = grad('sk', [[0, dk(skin, 1.12)], [.55, skin], [1, dk(skin, .78)]], { a: { x1: 0, y1: 0, x2: 1, y2: 0 } });
  const faceG = grad('fc', [[0, dk(skin, 1.15)], [.6, skin], [1, dk(skin, .8)]], { r: 1, a: { cx: .4, cy: .38, r: .7 } });
  const hairG = grad('hr', [[0, dk(hair, 1.7)], [.35, hair], [1, dk(hair, .6)]], { a: { x1: 0, y1: 0, x2: .7, y2: 1 } });
  const shade = grad('sd', [[0, '#fff', .28], [.35, '#fff', 0], [.65, '#000', 0], [1, '#000', .32]], { a: { x1: 0, y1: 0, x2: 1, y2: 0 } });
  const shadeV = grad('sv', [[0, '#000', .18], [.12, '#000', 0], [.85, '#000', 0], [1, '#000', .22]], { a: { x1: 0, y1: 0, x2: 0, y2: 1 } });
  const P = (dd, f, extra = {}) => sv('path', { d: dd, fill: f, ...extra }, svg);
  const G = (dd, f, extra = {}) => { P(dd, f, { stroke: 'rgba(0,0,0,.28)', 'stroke-width': 1, 'stroke-linejoin': 'round', ...extra }); P(dd, shade); P(dd, shadeV); };
  const limb = (dd, w, col) => { sv('path', { d: dd, stroke: col, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' }, svg); sv('path', { d: dd, stroke: shade, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' }, svg); };
  // أرضية وظل
  sv('ellipse', { cx: 100, cy: 409, rx: 56, ry: 7, fill: 'rgba(0,0,0,.18)' }, svg);
  // الشعر الخلفي
  const hs = hijab ? 'none' : (d.hs || 'long');
  if (hs === 'long') P('M70 52 Q66 120 74 168 Q100 176 126 168 Q134 120 130 52 Z', hairG);
  if (hs === 'pony') P('M118 40 Q150 60 142 120 Q138 150 128 160 Q132 120 122 80 Z', hairG);
  if (hs === 'curly') for (const [x, y, r] of [[72, 70, 16], [128, 70, 16], [70, 98, 15], [130, 98, 15], [76, 124, 13], [124, 124, 13]]) sv('circle', { cx: x, cy: y, r, fill: hairG }, svg);
  if (hijab) P('M68 50 Q66 14 100 12 Q134 14 132 50 L140 112 Q100 130 60 112 Z', fill(d.c3, 'solid'), { stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 });
  // الساقان والذراعان والجذع (بشرة)
  const leg = 'M79 206 Q76 252 81 292 Q83 302 81 314 Q79 352 84 390 L94 390 Q96 352 95 314 Q94 302 96 292 Q100 252 99 206 Z';
  const mir = (dd) => dd.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (m, x, y) => `${200 - x} ${y}`);
  for (const dd of [leg, mir(leg)]) { P(dd, skinG); P(dd, shade); }
  P('M84 292 Q88 296 92 292', 'none', { stroke: 'rgba(0,0,0,.12)', 'stroke-width': 1 }); P('M108 292 Q112 296 116 292', 'none', { stroke: 'rgba(0,0,0,.12)', 'stroke-width': 1 });
  const longSleeve = d.dress === 'abaya' || (d.dress === 'none' && ['blouse', 'jacket', 'hoodie'].includes(d.top));
  limb('M72 112 Q62 140 61 166 Q60 194 58 220', 11, skinG); limb('M128 112 Q138 140 139 166 Q140 194 142 220', 11, skinG);
  sv('ellipse', { cx: 58, cy: 226, rx: 6, ry: 8, fill: skinG }, svg); sv('ellipse', { cx: 142, cy: 226, rx: 6, ry: 8, fill: skinG }, svg);
  P('M76 104 Q100 98 124 104 Q132 110 129 132 Q124 160 122 178 Q128 194 130 210 L70 210 Q72 194 78 178 Q76 160 71 132 Q68 110 76 104 Z', skinG);
  P('M93 76 L107 76 L108 100 Q100 106 92 100 Z', skinG); P('M93 84 Q100 92 107 84 L107 90 Q100 96 93 90 Z', 'rgba(0,0,0,.12)');
  // الحذاء
  const sh = d.shoes || '#111827', shG = grad('sh', [[0, dk(sh, 1.6)], [.5, sh], [1, dk(sh, .6)]], { a: { x1: 0, y1: 0, x2: 0, y2: 1 } });
  for (const x of [89, 111]) { P(`M${x - 9} 396 Q${x - 9} 386 ${x} 386 Q${x + 11} 386 ${x + 13} 398 Q${x + 2} 403 ${x - 9} 400 Z`, shG, { stroke: 'rgba(0,0,0,.35)', 'stroke-width': .8 }); sv('ellipse', { cx: x - 2, cy: 389, rx: 4, ry: 1.4, fill: 'rgba(255,255,255,.5)' }, svg); }
  const f1 = fill(d.c1, d.p1), f2 = fill(d.c2, d.p2), f3 = fill(d.c3, 'solid');
  const sleeve = (f, short) => { const L = short ? 'M74 108 Q64 124 62 140' : 'M72 110 Q62 140 61 166 Q60 194 58 216', R = short ? 'M126 108 Q136 124 138 140' : 'M128 110 Q138 140 139 166 Q140 194 142 216'; for (const dd of [L, R]) { sv('path', { d: dd, stroke: 'rgba(0,0,0,.3)', 'stroke-width': short ? 18 : 16, fill: 'none', 'stroke-linecap': 'round' }, svg); sv('path', { d: dd, stroke: f, 'stroke-width': short ? 16.5 : 14.5, fill: 'none', 'stroke-linecap': 'round' }, svg); sv('path', { d: dd, stroke: shade, 'stroke-width': short ? 16.5 : 14.5, fill: 'none', 'stroke-linecap': 'round' }, svg); } };
  const folds = (lines) => { for (const dd of lines) sv('path', { d: dd, stroke: 'rgba(0,0,0,.16)', 'stroke-width': 1.4, fill: 'none', 'stroke-linecap': 'round' }, svg); };
  if (d.dress !== 'none') {
    if (d.dress === 'aline') { sleeve(f1, true); G('M76 102 Q100 96 124 102 Q131 112 128 134 Q124 160 122 176 Q140 230 150 290 Q100 302 50 290 Q60 230 78 176 Q76 160 72 134 Q69 112 76 102 Z', f1); folds(['M86 200 Q80 240 74 286', 'M100 196 L100 294', 'M114 200 Q120 240 126 286']); P('M78 176 Q100 184 122 176 L122 182 Q100 190 78 182 Z', 'rgba(0,0,0,.18)'); }
    if (d.dress === 'gown') { sleeve(f1, true); G('M76 102 Q100 96 124 102 Q131 112 128 134 Q124 160 122 176 Q150 280 166 398 Q100 410 34 398 Q50 280 78 176 Q76 160 72 134 Q69 112 76 102 Z', f1); folds(['M88 200 Q74 300 62 396', 'M100 196 L100 404', 'M112 200 Q126 300 138 396']); P('M78 176 Q100 184 122 176 L122 182 Q100 190 78 182 Z', 'rgba(255,255,255,.35)'); }
    if (d.dress === 'abaya') { sleeve(f1, false); G('M72 100 Q100 92 128 100 Q138 140 140 200 Q150 300 156 398 Q100 408 44 398 Q50 300 60 200 Q62 140 72 100 Z', f1); folds(['M100 104 L100 404', 'M84 130 Q76 260 70 396', 'M116 130 Q124 260 130 396']); P('M96 102 L100 120 L104 102 Z', 'rgba(0,0,0,.2)'); }
  } else {
    if (d.bottom === 'pants') { G('M76 176 L124 176 L130 214 Q126 300 122 394 L104 394 L100 236 L96 394 L78 394 Q74 300 70 214 Z', f2); folds(['M86 230 Q88 300 86 390', 'M114 230 Q112 300 114 390']); }
    if (d.bottom === 'skirt') { G('M76 176 L124 176 Q140 220 152 274 Q100 286 48 274 Q60 220 76 176 Z', f2); folds(['M88 186 Q80 230 72 276', 'M100 184 L100 282', 'M112 186 Q120 230 128 276']); }
    if (d.bottom === 'long') { G('M76 176 L124 176 Q148 290 160 394 Q100 404 40 394 Q52 290 76 176 Z', f2); folds(['M88 186 Q76 300 66 392', 'M100 184 L100 400', 'M112 186 Q124 300 134 392']); }
    if (d.bottom === 'shorts') { G('M76 176 L124 176 L132 214 L134 252 L104 254 L100 224 L96 254 L66 252 L68 214 Z', f2); }
    const top = d.top;
    if (top === 'tee') { sleeve(f1, true); G('M76 102 Q100 96 124 102 Q131 112 128 134 Q126 164 128 196 Q100 204 72 196 Q74 164 72 134 Q69 112 76 102 Z', f1); P('M90 101 Q100 112 110 101', 'none', { stroke: 'rgba(0,0,0,.3)', 'stroke-width': 2 }); folds(['M86 150 Q90 170 84 192', 'M116 150 Q112 170 116 192']); }
    if (top === 'blouse') { sleeve(f1, false); G('M76 102 Q100 96 124 102 Q131 112 128 134 Q126 166 130 200 Q100 210 70 200 Q74 166 72 134 Q69 112 76 102 Z', f1); P('M88 100 Q100 116 112 100 L108 99 Q100 108 92 99 Z', '#fff', { stroke: 'rgba(0,0,0,.2)', 'stroke-width': .8 }); for (const y of [126, 146, 166, 186]) sv('circle', { cx: 100, cy: y, r: 1.8, fill: '#fff', stroke: 'rgba(0,0,0,.3)', 'stroke-width': .5 }, svg); }
    if (top === 'jacket') { sleeve(f1, false); G('M74 100 Q100 94 126 100 Q134 112 131 136 Q128 170 132 214 L102 220 L98 220 L68 214 Q72 170 69 136 Q66 112 74 100 Z', f1); P('M100 104 L90 100 L84 112 L96 156 Z M100 104 L110 100 L116 112 L104 156 Z', dk(d.c1, .75), { stroke: 'rgba(0,0,0,.3)', 'stroke-width': .8 }); P('M96 104 L100 150 L104 104 Q100 108 96 104 Z', '#f8fafc'); for (const y of [168, 188, 206]) sv('circle', { cx: 101, cy: y, r: 2.4, fill: '#facc15', stroke: '#a16207', 'stroke-width': .6 }, svg); P('M76 186 L92 186 L92 192 L76 192 Z', 'rgba(0,0,0,.2)'); P('M108 186 L124 186 L124 192 L108 192 Z', 'rgba(0,0,0,.2)'); }
    if (top === 'hoodie') { sleeve(f1, false); G('M72 100 Q100 92 128 100 Q136 112 133 136 Q130 172 134 210 Q100 218 66 210 Q70 172 67 136 Q64 112 72 100 Z', f1); G('M76 98 Q100 80 124 98 Q100 112 76 98 Z', f1); G('M80 168 L120 168 L116 196 L84 196 Z', f1); for (const x of [94, 106]) sv('path', { d: `M${x} 106 L${x} 136`, stroke: '#f8fafc', 'stroke-width': 1.5 }, svg); }
  }
  // الرأس والوجه
  if (hs === 'bob' || hs === 'long' || hs === 'curly') P('M74 54 Q72 92 80 104 L120 104 Q128 92 126 54 Z', hs === 'curly' ? 'none' : hairG);
  sv('ellipse', { cx: 100, cy: 56, rx: 23, ry: 27, fill: faceG }, svg);
  sv('ellipse', { cx: 77, cy: 58, rx: 3.5, ry: 6, fill: skinG }, svg); sv('ellipse', { cx: 123, cy: 58, rx: 3.5, ry: 6, fill: skinG }, svg);
  for (const [x, f] of [[91, 1], [109, -1]]) {
    sv('ellipse', { cx: x, cy: 58, rx: 5.4, ry: 4.6, fill: '#fff' }, svg);
    sv('circle', { cx: x, cy: 58.5, r: 3.2, fill: grad('ir' + x, [[0, '#a16207'], [1, '#3b1d0a']], { r: 1, a: { cx: .5, cy: .4, r: .6 } }) }, svg);
    sv('circle', { cx: x, cy: 58.5, r: 1.5, fill: '#0b0b0b' }, svg); sv('circle', { cx: x - 1, cy: 57.2, r: .9, fill: '#fff' }, svg);
    sv('path', { d: `M${x - 5.8} 57 Q${x} 52.6 ${x + 5.8} 57`, stroke: '#1f1309', 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }, svg);
    sv('path', { d: `M${x + 5.5 * f} 55.5 l${2 * f} -1.6`, stroke: '#1f1309', 'stroke-width': 1.1, 'stroke-linecap': 'round' }, svg);
    sv('path', { d: `M${x - 6} 49 Q${x} 44 ${x + 6} 48`, stroke: dk(hair, .8), 'stroke-width': 1.5, fill: 'none', 'stroke-linecap': 'round' }, svg);
    sv('ellipse', { cx: x + (f > 0 ? -3 : 3), cy: 67, rx: 4.5, ry: 2.6, fill: '#f43f5e', opacity: .22 }, svg);
  }
  P('M99 61 Q97 67 99.5 68.5 Q101.5 69 102 68', 'none', { stroke: dk(skin, .7), 'stroke-width': 1.1, 'stroke-linecap': 'round' });
  P('M94 74 Q100 72.5 106 74 Q100 79 94 74 Z', grad('lp', [[0, '#fb7185'], [1, '#be123c']], { a: { x1: 0, y1: 0, x2: 0, y2: 1 } }));
  P('M96 74.5 Q100 75.5 104 74.5', 'none', { stroke: 'rgba(255,255,255,.5)', 'stroke-width': .6 });
  // الشعر الأمامي
  if (!hijab) {
    if (hs === 'bun') { sv('circle', { cx: 100, cy: 22, r: 13, fill: hairG }, svg); }
    if (hs === 'curly') for (const [x, y, r] of [[80, 34, 12], [92, 26, 12], [108, 26, 12], [120, 34, 12], [74, 48, 9], [126, 48, 9]]) sv('circle', { cx: x, cy: y, r, fill: hairG }, svg);
    else P('M76 56 Q72 24 100 24 Q128 24 124 56 Q120 40 108 36 Q104 46 86 44 Q80 46 76 56 Z', hairG);
    P('M86 30 Q98 26 108 32', 'none', { stroke: 'rgba(255,255,255,.35)', 'stroke-width': 2, 'stroke-linecap': 'round' });
  } else { P('M78 54 Q78 32 100 30 Q122 32 122 54 Q122 40 100 36 Q78 40 78 54 Z', fill(d.c3, 'solid')); P('M76 60 Q74 90 100 98 Q126 90 124 60 Q122 84 100 90 Q78 84 76 60 Z', fill(d.c3, 'solid'), { stroke: 'rgba(0,0,0,.2)', 'stroke-width': .8 }); P('M68 50 Q66 14 100 12 Q134 14 132 50', 'none', { stroke: shade, 'stroke-width': 3 }); }
  // الإكسسوارات
  if (A.includes('scarf') && !hijab) { G('M80 96 Q100 110 120 96 L122 106 Q100 120 78 106 Z', f3); G('M108 106 L116 156 L104 158 L100 112 Z', f3); }
  if (A.includes('hat') && !hijab) { G('M48 38 Q100 26 152 38 Q100 50 48 38 Z', f3); G('M74 36 Q76 4 100 4 Q124 4 126 36 Q100 42 74 36 Z', f3); P('M75 30 Q100 36 125 30 L125 35 Q100 41 75 35 Z', 'rgba(0,0,0,.3)'); }
  if (A.includes('crown')) { const cG = grad('cr', [[0, '#fef08a'], [.5, '#facc15'], [1, '#a16207']], { a: { x1: 0, y1: 0, x2: 0, y2: 1 } }); P(`M80 ${hijab ? 16 : 28} L85 ${hijab ? -2 : 8} L93 ${hijab ? 10 : 22} L100 ${hijab ? -6 : 4} L107 ${hijab ? 10 : 22} L115 ${hijab ? -2 : 8} L120 ${hijab ? 16 : 28} Z`, cG, { stroke: '#a16207', 'stroke-width': .8 }); for (const x of [85, 100, 115]) sv('circle', { cx: x, cy: hijab ? (x === 100 ? -3 : 1) : (x === 100 ? 7 : 11), r: 2, fill: x === 100 ? '#ef4444' : '#3b82f6' }, svg); }
  if (A.includes('glasses')) { for (const x of [83, 103]) sv('rect', { x, y: 52, width: 14, height: 10, rx: 4, fill: grad('gl' + x, [[0, '#334155', .9], [1, '#020617', .95]], { a: { x1: 0, y1: 0, x2: 1, y2: 1 } }), stroke: '#0f172a', 'stroke-width': 1 }, svg); sv('line', { x1: 97, y1: 56, x2: 103, y2: 56, stroke: '#0f172a', 'stroke-width': 1.5 }, svg); for (const x of [86, 106]) sv('path', { d: `M${x} 54 l3 0`, stroke: 'rgba(255,255,255,.7)', 'stroke-width': 1.2 }, svg); }
  if (A.includes('bag')) { P('M146 196 Q156 168 170 196', 'none', { stroke: dk(d.c3, .6), 'stroke-width': 3 }); G('M140 196 L176 196 L172 238 Q158 242 144 238 Z', f3); P('M140 204 L176 204', 'none', { stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }); sv('rect', { x: 154, y: 200, width: 8, height: 6, rx: 1.5, fill: '#facc15', stroke: '#a16207', 'stroke-width': .6 }, svg); }
  return svg;
}
export async function mount(root) {
  if (!document.getElementById('fs-css')) document.head.append(h('link', { id: 'fs-css', rel: 'stylesheet', href: new URL('./fashion.css', import.meta.url).href }));
  const view = h('div', { class: 'fs' }); root.append(view);
  let d = store.get('fs-cur', { top: 'blouse', bottom: 'long', dress: 'none', c1: '#ec4899', c2: '#1e3a8a', c3: '#facc15', p1: 'flowers', p2: 'solid', acc: ['bag'], skin: '#f1c27d', hair: '#3f2a1d', shoes: '#111827', price: 150 });
  let coll = store.get('fs-coll', []), part = 'c1';
  const save = () => { store.set('fs-cur', d); store.set('fs-coll', coll); };
  const costOf = (x) => PCOST[x.p1] + (x.dress === 'none' ? PCOST[x.p2] : 30) + (x.acc || []).length * 20;
  function draw() {
    view.innerHTML = ''; const hm = harmony(d);
    const chips = (obj, val, on) => h('div', { class: 'fs-chips' }, Object.entries(obj).map(([k, n]) => h('button', { type: 'button', class: val === k ? 'on' : '', onclick: () => { on(k); save(); draw(); } }, n)));
    view.append(h('div', { class: 'fs-main' },
      h('div', { class: 'fs-stage' }, figure(d), h('div', { class: 'fs-harm h' + hm }, '🎨 ', t('fs_harmony'), ': ', '⭐'.repeat(hm), h('small', {}, t('fs_h' + hm))),
        h('div', { class: 'fs-price' }, h('span', {}, t('fs_cost'), ': ', num(costOf(d))), h('label', {}, t('fs_price'), ' ', h('input', { type: 'number', class: 'input', min: 20, max: 1000, value: d.price, onchange: (e) => { d.price = Math.max(20, +e.target.value || 100); save(); draw(); } })))),
      h('div', { class: 'fs-panel' },
        h('b', {}, '👗 ', t('fs_dress')), chips(DRESSES, d.dress, v => d.dress = v),
        d.dress === 'none' ? [h('b', {}, '👚 ', t('fs_top')), chips(TOPS, d.top, v => d.top = v), h('b', {}, '👖 ', t('fs_bottom')), chips(BOTTOMS, d.bottom, v => d.bottom = v)] : null,
        h('b', {}, '💇 ', t('fs_hair')), chips(HAIRS, d.hs || 'long', v => d.hs = v),
        h('b', {}, '🎨 ', t('fs_color')),
        h('div', { class: 'fs-chips' }, [['c1', d.dress !== 'none' ? t('fs_dress') : t('fs_top')], ...(d.dress === 'none' ? [['c2', t('fs_bottom')]] : []), ['c3', t('fs_acc')], ['shoes', '👟'], ['skin', t('fs_skin')], ['hair', t('fs_hair')]].map(([k, n]) => h('button', { type: 'button', class: part === k ? 'on' : '', onclick: () => { part = k; draw(); } }, h('i', { class: 'fs-dot', style: { background: d[k] } }), n))),
        h('div', { class: 'fs-pal' }, (part === 'skin' ? ['#fde3c8', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'] : part === 'hair' ? ['#111827', '#3f2a1d', '#7c2d12', '#a16207', '#facc15', '#9ca3af'] : COLORS).map(c => h('button', { type: 'button', class: d[part] === c ? 'on' : '', style: { background: c }, onclick: () => { d[part] = c; sound('move'); save(); draw(); } }))),
        h('b', {}, '🧵 ', t('fs_pattern')), chips(PATTERNS, part === 'c2' ? d.p2 : d.p1, v => { if (part === 'c2') d.p2 = v; else d.p1 = v; }),
        h('b', {}, '✨ ', t('fs_acc')), h('div', { class: 'fs-chips' }, Object.entries(ACC).map(([k, n]) => h('button', { type: 'button', class: d.acc.includes(k) ? 'on' : '', onclick: () => { d.acc = d.acc.includes(k) ? d.acc.filter(x => x !== k) : [...d.acc, k]; save(); draw(); } }, n))),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => { if (coll.length >= 8) return toast(t('fs_full'), true); coll.push(JSON.parse(JSON.stringify(d))); save(); sound('win'); toast(t('fs_saved'), 'ok'); draw(); } }, ico('heart', 16), t('fs_save')),
          h('button', { type: 'button', class: 'btn gk-go', onclick: show }, t('fs_show'))))),
      h('div', { class: 'fs-coll' }, h('b', {}, '🗂️ ', t('fs_coll'), ' (', num(coll.length), '/8)'), h('div', { class: 'fs-cl' }, coll.map((x, i) => h('div', { class: 'fs-ci' }, figure(x, true), h('button', { type: 'button', class: 'icon-btn', onclick: () => { coll.splice(i, 1); save(); draw(); } }, ico('x', 14)), h('button', { type: 'button', class: 'fs-load', onclick: () => { d = JSON.parse(JSON.stringify(x)); save(); draw(); } }, '✏️'))))));
  }
  function show() {
    if (!coll.length) return toast(t('fs_empty'), true);
    const ov = h('div', { class: 'fs-show' }, h('div', { class: 'fs-lights' }), h('div', { class: 'fs-runway' }), h('div', { class: 'fs-crowd' }, '👏'.repeat(14)));
    document.body.append(ov);
    coll.forEach((x, i) => { const m = h('div', { class: 'fs-model', style: { animationDelay: i * 2.2 + 's' } }, figure(x)); ov.append(m); });
    // النتيجة: رضا الجمهور حسب التناسق والتنوع والسعر
    const avgH = coll.reduce((a, x) => a + harmony(x), 0) / coll.length; const variety = new Set(coll.map(x => x.dress + x.top + x.bottom)).size / coll.length;
    const avgPrice = coll.reduce((a, x) => a + x.price, 0) / coll.length; const priceF = Math.max(.2, Math.min(1.2, 220 / avgPrice));
    const approval = Math.round(Math.min(100, (avgH / 3 * 60 + variety * 30 + 10) * Math.min(1, priceF + .2)));
    const sold = Math.round(approval * coll.length * priceF * .8);
    const profit = Math.round(coll.reduce((a, x) => a + (x.price - costOf(x)), 0) / coll.length * sold);
    setTimeout(() => { sound('win'); ov.append(h('div', { class: 'fs-res' }, h('h2', {}, t('fs_result', { p: num(approval), n: num(sold), r: num(profit) })), h('p', {}, t('fs_profit')), h('button', { type: 'button', class: 'btn gk-go', onclick: () => ov.remove() }, t('fs_close')))); }, coll.length * 2200 + 2400);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  }
  draw();
  return { unmount() { document.querySelector('.fs-show')?.remove(); }, onLang() { draw(); } };
}
