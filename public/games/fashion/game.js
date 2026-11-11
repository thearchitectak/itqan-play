// مصممة الأزياء المبدعة: صممي الملابس واختاري الألوان والأقمشة والنقوش والإكسسوارات، واحفظي مجموعتك، ثم اعرضيها في عرض أزياء افتراضي وتعرّفي على تناسق الألوان وتكلفة الإنتاج والربح.
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';
import { portraitStudio } from './portrait.js';
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
  const skin = d.skin || '#f1c27d', hair = d.hair || '#3f2a1d', A = d.acc || [], hijab = A.includes('hijab'), mk = d.mk || {};
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
  // الشعر الخلفي: كتلة بتدرج وخصلات رفيعة متعددة الدرجات
  const hs = hijab ? 'none' : (d.hs || 'long');
  const strands = (x0, x1, y0, y1, n, bend) => { for (let k = 0; k < n; k++) { const x = x0 + (x1 - x0) * k / (n - 1), w = Math.sin(k * 1.7) * bend; P(`M${x} ${y0} Q${x + w} ${(y0 + y1) / 2} ${x + w * .4} ${y1 - Math.abs(Math.sin(k * 2.3)) * 8}`, 'none', { stroke: k % 3 ? dk(hair, 1.45) : dk(hair, .7), 'stroke-width': .6 + (k % 2) * .5, opacity: .55, 'stroke-linecap': 'round' }); } };
  if (hs === 'long') { P('M74 40 Q63 80 65 130 Q65 162 73 180 Q86 186 100 184 Q114 186 127 180 Q135 162 135 130 Q137 80 126 40 Z', hairG); strands(68, 132, 60, 180, 22, 4); }
  if (hs === 'curly') { let d0 = 'M74 36'; for (let y = 50; y <= 170; y += 12) d0 += ` Q${58 + (y % 24 ? 0 : -6)} ${y - 6} ${64 + (y % 24 ? 4 : 0)} ${y}`; d0 += ' Q100 186 136 170'; for (let y = 170; y >= 50; y -= 12) d0 += ` Q${142 + (y % 24 ? 0 : 6)} ${y - 6} ${136 - (y % 24 ? 4 : 0)} ${y - 12}`; P(d0 + ' Z', hairG); for (let k = 0; k < 16; k++) { const x = 66 + k * 4.3; P(`M${x} 60 q-5 10 0 20 q5 10 0 20 q-5 10 0 20 q5 10 0 20 q-4 9 0 18`, 'none', { stroke: k % 2 ? dk(hair, 1.5) : dk(hair, .7), 'stroke-width': .9, opacity: .5 }); } }
  if (hs === 'pony') { P('M120 34 Q150 50 146 100 Q144 140 132 168 Q128 150 130 118 Q132 76 116 48 Z', hairG); strands(126, 142, 50, 160, 8, 3); }
  if (hs === 'bob') { P('M74 40 Q66 70 70 98 Q84 104 100 102 Q116 104 130 98 Q134 70 126 40 Z', hairG); strands(70, 130, 60, 100, 16, 2); }
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
  // ===== الرأس والوجه بأسلوب الرسم التوضيحي الواقعي =====
  const blur = (id, sd) => { const f = sv('filter', { id: u + id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); sv('feGaussianBlur', { stdDeviation: sd }, f); return `url(#${u + id})`; };
  const soft = blur('bl', 1.6), soft2 = blur('bl2', .8);
  const face = 'M79 50 Q79 28 100 27 Q121 28 121 50 Q121 64 115 74 Q108 84 100 85.5 Q92 84 85 74 Q79 64 79 50 Z';
  P('M88 80 Q100 92 112 80 L112 88 Q100 96 88 88 Z', 'rgba(0,0,0,.12)', { filter: soft });
  sv('ellipse', { cx: 79.5, cy: 58, rx: 3, ry: 5.5, fill: skinG }, svg); sv('ellipse', { cx: 120.5, cy: 58, rx: 3, ry: 5.5, fill: skinG }, svg);
  P(face, faceG);
  // تظليل جانبي ناعم وإضاءة للخدين والجبهة
  P(face, grad('fs', [[0, '#000', .1], [.2, '#000', 0], [.8, '#000', 0], [1, '#000', .13]], { a: { x1: 0, y1: 0, x2: 1, y2: 0 } }));
  sv('ellipse', { cx: 100, cy: 40, rx: 10, ry: 5, fill: '#fff', opacity: .16, filter: soft }, svg);
  if (mk.contour) { P('M82 62 Q86 72 92 76', 'none', { stroke: dk(skin, .65), 'stroke-width': 4, opacity: .35 * (mk.k ?? 1), filter: soft }); P('M118 62 Q114 72 108 76', 'none', { stroke: dk(skin, .65), 'stroke-width': 4, opacity: .35 * (mk.k ?? 1), filter: soft }); }
  if (mk.blush) for (const x of [87, 113]) sv('ellipse', { cx: x, cy: 67, rx: 6, ry: 3.6, fill: mk.blush, opacity: .5 * (mk.k ?? 1), filter: soft }, svg);
  if (mk.high) for (const x of [86, 114]) sv('ellipse', { cx: x, cy: 63, rx: 4, ry: 1.6, fill: '#fff8e7', opacity: .42 * (mk.k ?? 1), filter: soft2 }, svg);
  const eyeC = d.eye || '#6b4423';
  for (const [x, f] of [[91, 1], [109, -1]]) {
    const ex = (k) => x + k * f; // f يعكس الاتجاه للعين اليسرى
    if (mk.shadow) P(`M${ex(-7.5)} 56 Q${x} 47 ${ex(8)} 54.5 Q${x} 52 ${ex(-7.5)} 56 Z`, mk.shadow, { opacity: .7 * (mk.k ?? 1), filter: soft2 });
    P(`M${ex(-6)} 51.5 Q${x} 49 ${ex(6.5)} 52.2`, 'none', { stroke: dk(skin, .78), 'stroke-width': .5, opacity: .7 });
    P(`M${ex(-6.5)} 56 Q${x} 51.2 ${ex(6.8)} 55.2 Q${x} 59.6 ${ex(-6.5)} 56 Z`, '#fbfaf7');
    sv('circle', { cx: x, cy: 55.6, r: 2.9, fill: grad('ir' + x, [[0, dk(eyeC, 1.6)], [.6, eyeC], [1, dk(eyeC, .5)]], { r: 1, a: { cx: .5, cy: .55, r: .6 } }) }, svg);
    sv('circle', { cx: x, cy: 55.6, r: 1.25, fill: '#0b0b0b' }, svg); sv('circle', { cx: x - .9, cy: 54.6, r: .7, fill: '#fff' }, svg);
    P(`M${ex(-7)} 56.2 Q${ex(-1)} 50.6 ${ex(6.8)} 55.2 Q${ex(-1)} 51.8 ${ex(-7)} 56.2 Z`, '#1a0f08'); // الجفن العلوي مدبب الطرفين
    if (mk.liner) P(`M${ex(6.6)} 55.3 Q${ex(-1)} 50.4 ${ex(-7)} 55.8 L${ex(-10)} 53.2 L${ex(-7.4)} 56.6 Q${ex(-1)} 52 ${ex(6.6)} 55.6 Z`, mk.liner);
    const lashN = mk.lash ? 7 : 5; for (let k = 0; k < lashN; k++) { const tt = .05 + .6 * k / (lashN - 1), lx = ex(-6.5 + tt * 13.3), ly = 56 - Math.sin(tt * Math.PI) * 4.4, L = (mk.lash ? 1.9 : 1.1) * (1.2 - tt * .6); P(`M${lx} ${ly} q${-f * L * .5} -${L * .6} ${-f * L} -${L * .7}`, 'none', { stroke: '#120a05', 'stroke-width': mk.lash ? .5 : .35, 'stroke-linecap': 'round' }); }
    P(`M${ex(-5)} 58.4 Q${x} 59.8 ${ex(5.5)} 57.8`, 'none', { stroke: dk(skin, .7), 'stroke-width': .35, opacity: .6 });
    // حاجب مدبب طبيعي
    P(`M${ex(-7.5)} 49 Q${ex(-1)} 44.2 ${ex(7.5)} 46.2 Q${ex(-1)} 45.8 ${ex(-7.5)} 49.8 Z`, dk(hair, .85), { opacity: .9 });
  }
  // الأنف: ظل جانبي ولمعة على الجسر
  P('M102.2 62 Q103.4 66 103 68.4', 'none', { stroke: dk(skin, .72), 'stroke-width': .9, 'stroke-linecap': 'round', opacity: .45, filter: soft2 }); P('M97.5 69.4 Q100 70.8 102.5 69.4', 'none', { stroke: dk(skin, .7), 'stroke-width': .5, opacity: .5 });
  for (const nx of [98, 102]) sv('ellipse', { cx: nx, cy: 69.6, rx: .8, ry: .45, fill: dk(skin, .55), opacity: .6 }, svg);
  P('M99.4 58 L99 67', 'none', { stroke: '#fff', 'stroke-width': .9, opacity: .25, filter: soft2 });
  // الشفاه: شفة عليا بقوس كيوبيد وسفلى ممتلئة
  const lip = mk.lip || (() => { const a = parseInt(skin.slice(1), 16), b = 0xc0726a; const m = (sh) => Math.round(((a >> sh) & 255) * .45 + ((b >> sh) & 255) * .55); return '#' + [16, 8, 0].map(sh => m(sh).toString(16).padStart(2, '0')).join(''); })();
  const lipTop = 'M93.6 75.6 Q96 73.6 98.6 74.2 Q100 74.8 101.4 74.2 Q104 73.6 106.4 75.6 Q103 76.4 100 76.3 Q97 76.4 93.6 75.6 Z';
  const lipBot = 'M93.6 75.6 Q97 76.4 100 76.3 Q103 76.4 106.4 75.6 Q104.5 79.8 100 80 Q95.5 79.8 93.6 75.6 Z';
  P(lipTop, grad('lt', [[0, dk(lip, 1.05)], [1, dk(lip, .78)]], { a: { x1: 0, y1: 0, x2: 0, y2: 1 } })); P(lipBot, grad('lb', [[0, dk(lip, .85)], [.5, dk(lip, 1.08)], [1, dk(lip, .8)]], { a: { x1: 0, y1: 0, x2: 0, y2: 1 } }));
  P('M93.6 75.6 Q97 76.6 100 76.4 Q103 76.6 106.4 75.6', 'none', { stroke: dk(lip, .5), 'stroke-width': .45 });
  sv('ellipse', { cx: 100.6, cy: 77.8, rx: mk.gloss ? 2.6 : 1.6, ry: mk.gloss ? .9 : .5, fill: '#fff', opacity: mk.gloss ? .75 : .3 }, svg);
  if (mk.mole) sv('circle', { cx: 109, cy: 72, r: .7, fill: '#3b2416' }, svg);
  if (mk.glitter) for (const [gx, gy] of [[85, 61], [88, 63], [115, 61], [112, 63], [91, 50], [109, 50]]) sv('circle', { cx: gx, cy: gy, r: .45, fill: '#fffbea', opacity: .95 }, svg);
  // الشعر الأمامي: خط منبت ناعم وفرق جانبي وخصلات تؤطر الوجه
  if (!hijab) {
    if (hs === 'bun') { sv('circle', { cx: 100, cy: 22, r: 12, fill: hairG }, svg); for (let k = 0; k < 6; k++) P(`M${92 + k * 3} 14 Q${100} ${22 + k} ${108 - k * 3} 30`, 'none', { stroke: dk(hair, 1.4), 'stroke-width': .6, opacity: .5 }); }
    const cap = 'M77 56 Q74 26 100 24 Q126 26 123 56 Q121 40 111 34 Q104 40 92 38 Q83 42 79 52 Z'; { const cp = sv('clipPath', { id: u + 'cap' }, defs); sv('path', { d: cap }, cp); } P(cap, hairG);
    for (let k = 0; k < 9; k++) { const tt = k / 8; P(`M${103 + tt * 2} 26.5 Q${86 - tt * 2} ${30 + tt * 3} ${79.5 + tt * .5} ${48 + tt * 4}`, 'none', { stroke: k % 3 ? dk(hair, 1.45) : dk(hair, .72), 'stroke-width': .5, opacity: .5, 'stroke-linecap': 'round', 'clip-path': `url(#${u}cap)` }); P(`M${105 + tt * 2} 26.5 Q${116 + tt * 2} ${30 + tt * 2} ${120.5 - tt * .5} ${44 + tt * 6}`, 'none', { stroke: k % 3 ? dk(hair, 1.45) : dk(hair, .72), 'stroke-width': .5, opacity: .5, 'stroke-linecap': 'round', 'clip-path': `url(#${u}cap)` }); }
    if (hs === 'long' || hs === 'bob' || hs === 'curly') { const len = hs === 'bob' ? 96 : 118; for (const sd of [-1, 1]) { const x0 = sd < 0 ? 78 : 122; P(`M${x0} 44 Q${x0 + sd * 5} 70 ${x0 + sd * 3} ${len} Q${x0 + sd * 8} ${len - 6} ${x0 + sd * 8} ${len - 30} Q${x0 + sd * 9} 64 ${x0 + sd * 4} 40 Z`, hairG); for (let k = 0; k < 4; k++) P(`M${x0 + sd * (1 + k * 1.6)} 48 Q${x0 + sd * (5 + k * 1.5)} 74 ${x0 + sd * (3 + k)} ${len - 4 - k * 6}`, 'none', { stroke: k % 2 ? dk(hair, 1.5) : dk(hair, .7), 'stroke-width': .6, opacity: .5 }); } }
    P('M88 30 Q99 26 110 30', 'none', { stroke: '#fff', 'stroke-width': 2.2, opacity: .16, 'stroke-linecap': 'round', filter: soft2 });
  } else {
    P('M78 54 Q78 30 100 28.5 Q122 30 122 54 Q122 38 100 35 Q78 38 78 54 Z', fill(d.c3, 'solid')); P('M77 58 Q74 90 100 99 Q126 90 123 58 Q121 84 100 91 Q79 84 77 58 Z', fill(d.c3, 'solid'), { stroke: 'rgba(0,0,0,.2)', 'stroke-width': .8 });
    P('M68 50 Q66 14 100 12 Q134 14 132 50', 'none', { stroke: shade, 'stroke-width': 3 }); for (const dd of ['M82 40 Q78 70 86 92', 'M118 40 Q122 70 114 92']) P(dd, 'none', { stroke: 'rgba(0,0,0,.15)', 'stroke-width': 1.2, filter: soft2 });
  }
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
  // وضعان: استوديو الجمال برسومات احترافية (افتراضي)، ومصممة الأزياء بالجسم الكامل
  let mode = store.get('fs-mode', 'studio');
  if (!document.getElementById('fp-css')) document.head.append(h('link', { id: 'fp-css', rel: 'stylesheet', href: new URL('./portrait.css', import.meta.url).href }));
  const modes = h('div', { class: 'fs-modes' }); root.append(modes);
  const studioBox = h('div'); root.append(studioBox);
  const view = h('div', { class: 'fs' }); root.append(view);
  const setMode = (m) => { mode = m; store.set('fs-mode', m); modes.innerHTML = ''; modes.append(...[['studio', '💖 استوديو الجمال'], ['design', '✂️ مصممة الأزياء']].map(([k, n]) => h('button', { type: 'button', class: mode === k ? 'on' : '', onclick: () => setMode(k) }, n))); studioBox.style.display = m === 'studio' ? '' : 'none'; view.style.display = m === 'studio' ? 'none' : ''; if (m === 'studio' && !studioBox.firstChild) portraitStudio(studioBox); };
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
        h('button', { type: 'button', class: 'fs-mkbtn', onclick: makeup }, h('span', {}, '💄'), h('b', {}, 'استوديو المكياج'), h('small', {}, 'كبّري الوجه وزيّنيه بأدوات المكياج')),
        h('b', {}, '💇 ', t('fs_hair')), chips(HAIRS, d.hs || 'long', v => d.hs = v),
        h('b', {}, '🎨 ', t('fs_color')),
        h('div', { class: 'fs-chips' }, [['c1', d.dress !== 'none' ? t('fs_dress') : t('fs_top')], ...(d.dress === 'none' ? [['c2', t('fs_bottom')]] : []), ['c3', t('fs_acc')], ['shoes', '👟'], ['skin', t('fs_skin')], ['hair', t('fs_hair')], ['eye', '👁️']].map(([k, n]) => h('button', { type: 'button', class: part === k ? 'on' : '', onclick: () => { part = k; draw(); } }, h('i', { class: 'fs-dot', style: { background: d[k] } }), n))),
        h('div', { class: 'fs-pal' }, (part === 'skin' ? ['#fde3c8', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'] : part === 'hair' ? ['#111827', '#3f2a1d', '#5a3825', '#7c2d12', '#a16207', '#d4a95e', '#9ca3af'] : part === 'eye' ? ['#3b2416', '#6b4423', '#8b6b3d', '#4d7c4a', '#3b6e9e', '#6b7280'] : COLORS).map(c => h('button', { type: 'button', class: d[part] === c ? 'on' : '', style: { background: c }, onclick: () => { d[part] = c; sound('move'); save(); draw(); } }))),
        h('b', {}, '🧵 ', t('fs_pattern')), chips(PATTERNS, part === 'c2' ? d.p2 : d.p1, v => { if (part === 'c2') d.p2 = v; else d.p1 = v; }),
        h('b', {}, '✨ ', t('fs_acc')), h('div', { class: 'fs-chips' }, Object.entries(ACC).map(([k, n]) => h('button', { type: 'button', class: d.acc.includes(k) ? 'on' : '', onclick: () => { d.acc = d.acc.includes(k) ? d.acc.filter(x => x !== k) : [...d.acc, k]; save(); draw(); } }, n))),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => { if (coll.length >= 8) return toast(t('fs_full'), true); coll.push(JSON.parse(JSON.stringify(d))); save(); sound('win'); toast(t('fs_saved'), 'ok'); draw(); } }, ico('heart', 16), t('fs_save')),
          h('button', { type: 'button', class: 'btn gk-go', onclick: show }, t('fs_show'))))),
      h('div', { class: 'fs-coll' }, h('b', {}, '🗂️ ', t('fs_coll'), ' (', num(coll.length), '/8)'), h('div', { class: 'fs-cl' }, coll.map((x, i) => h('div', { class: 'fs-ci' }, figure(x, true), h('button', { type: 'button', class: 'icon-btn', onclick: () => { coll.splice(i, 1); save(); draw(); } }, ico('x', 14)), h('button', { type: 'button', class: 'fs-load', onclick: () => { d = JSON.parse(JSON.stringify(x)); save(); draw(); } }, '✏️'))))));
  }
  // استوديو المكياج: تكبير الوجه وأدوات متعددة
  function makeup() {
    d.mk = d.mk || {}; let tool = 'lip';
    const TOOLS = [['lip', '💋', 'أحمر الشفاه', ['#c9877a', '#b5655b', '#c2185b', '#b71c1c', '#8e244d', '#e57373', '#a0525a', '#d4876f']], ['blush', '🌸', 'أحمر الخدود', ['#f28b82', '#e8a0a0', '#f4a582', '#d9777f', '#c97b84']],
      ['shadow', '👁️', 'ظل العيون', ['#8d6e63', '#a1887f', '#b08d57', '#6d4c41', '#7e5a7e', '#c9a96e', '#5d6470', '#8f6f9a']], ['liner', '✒️', 'محدد العيون', ['#111111', '#3b2416', '#1f2a44']],
      ['contour', '🎨', 'كونتور', null], ['high', '✨', 'هايلايتر', null], ['lash', '👁‍🗨', 'ماسكارا', null], ['gloss', '💧', 'ملمّع الشفاه', null], ['glitter', '💫', 'لمعة براقة', null], ['mole', '•', 'شامة', null]];
    const ov = h('div', { class: 'fs-mk' }); document.body.append(ov);
    const close = () => { ov.remove(); save(); draw(); };
    const paint = () => {
      ov.innerHTML = ''; const face = figure(d); face.setAttribute('viewBox', '70 18 60 74'); face.classList.add('fs-face');
      const T = TOOLS.find(x => x[0] === tool);
      ov.append(h('div', { class: 'fs-mkbox' },
        h('div', { class: 'fs-mkhead' }, h('b', {}, '💄 استوديو المكياج'), h('button', { type: 'button', class: 'btn ghost sm', onclick: close }, '✓ تم')),
        h('div', { class: 'fs-mkstage' }, face),
        h('div', { class: 'fs-mktools' }, TOOLS.map(([k, ic, n]) => h('button', { type: 'button', class: 'fs-mkt' + (tool === k ? ' on' : '') + (d.mk[k] ? ' used' : ''), onclick: () => { tool = k; if (!TOOLS.find(x => x[0] === k)[3]) d.mk[k] = !d.mk[k]; sound('place'); paint(); } }, h('span', {}, ic), h('small', {}, n)))),
        T[3] ? h('div', { class: 'fs-pal' }, h('button', { type: 'button', class: 'fs-none' + (!d.mk[tool] ? ' on' : ''), title: 'بلا', onclick: () => { delete d.mk[tool]; paint(); } }, '⊘'), T[3].map(c => h('button', { type: 'button', class: d.mk[tool] === c ? 'on' : '', style: { background: c }, onclick: () => { d.mk[tool] = c; sound('place'); paint(); } }))) : h('p', { class: 'muted' }, d.mk[tool] ? '✅ مفعّل — اضغطي الأداة مرة أخرى لإزالتها' : 'اضغطي الأداة لتفعيلها'),
        h('label', { class: 'fs-mkk' }, 'الشدة', h('input', { type: 'range', min: .3, max: 1, step: .05, value: d.mk.k ?? 1, oninput: (e) => { d.mk.k = +e.target.value; const f = figure(d); f.setAttribute('viewBox', '70 18 60 74'); f.classList.add('fs-face'); ov.querySelector('.fs-face').replaceWith(f); } })),
        h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { d.mk = {}; paint(); } }, '🧽 إزالة كل المكياج')));
    };
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    paint();
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
  draw(); setMode(mode);
  return { unmount() { document.querySelector('.fs-show')?.remove(); }, onLang() { draw(); } };
}
