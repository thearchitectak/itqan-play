// مهندسة الديكور الصغيرة: صمّمي غرفة بتوزيع الأثاث واختيار الألوان والأرضيات، مع الالتزام بالمساحة والميزانية وترك ممر للحركة.
import { h, t, addDict, sound, num, ico, store, toast } from '../../assets/js/core.js';
import { furniture } from './art.js';
addDict({
  ar: { rm_mission: 'المهمة', rm_budget: 'الميزانية', rm_spent: 'المصروف', rm_free: 'المساحة الحرة', rm_walk: 'ممر من الباب', rm_wall: 'لون الجدران', rm_floor: 'الأرضية', rm_rotate: 'دوّر ⟳', rm_remove: 'احذف', rm_check: 'تحقق من التصميم', rm_ok: 'تصميم رائع! أنجزتِ المهمة 🎉', rm_need: 'ينقص: {x}', rm_over: 'تجاوزتِ الميزانية', rm_noWalk: 'لا يوجد ممر من الباب إلى السرير أو الكنبة', rm_tight: 'الغرفة مزدحمة! اتركي 40% على الأقل فارغة', rm_light: 'الإضاءة', rm_day: 'نهار', rm_night: 'ليل', rm_help: 'اختاري قطعة من القائمة ثم اضغطي مكانها في الغرفة. اضغطي قطعة موضوعة لتحديدها ثم دوّريها أو احذفيها.', rm_size: 'كل مربع = 50 سم × 50 سم', rm_cost: 'السعر', rm_m2: 'م²' },
  en: { rm_mission: 'Mission', rm_budget: 'Budget', rm_spent: 'Spent', rm_free: 'Free space', rm_walk: 'Walkway from door', rm_wall: 'Wall colour', rm_floor: 'Floor', rm_rotate: 'Rotate ⟳', rm_remove: 'Remove', rm_check: 'Check design', rm_ok: 'Great design! Mission complete 🎉', rm_need: 'Missing: {x}', rm_over: 'Over budget', rm_noWalk: 'No walkway from the door to the bed or sofa', rm_tight: 'Too crowded! Keep at least 40% free', rm_light: 'Lighting', rm_day: 'Day', rm_night: 'Night', rm_help: 'Pick an item, then tap where it goes. Tap a placed item to select, rotate or remove it.', rm_size: 'Each square = 50 cm × 50 cm', rm_cost: 'Price', rm_m2: 'm²' },
});
export const CAT = {
  bed: { ic: '🛏️', n: 'سرير', w: 4, h: 5, price: 900, col: '#8fa7bf' }, desk: { ic: '🖥️', n: 'مكتب', w: 3, h: 2, price: 450, col: '#d6a76c' }, chair: { ic: '🪑', n: 'كرسي', w: 1, h: 1, price: 120, col: '#a16207' },
  wardrobe: { ic: '🚪', n: 'خزانة ملابس', w: 4, h: 2, price: 700, col: '#92400e' }, shelf: { ic: '📚', n: 'رف كتب', w: 3, h: 1, price: 250, col: '#b45309' }, lamp: { ic: '💡', n: 'مصباح أرضي', w: 1, h: 1, price: 90, col: '#fde047', light: true },
  sofa: { ic: '🛋️', n: 'كنبة', w: 5, h: 2, price: 1100, col: '#6f8a7a' }, tv: { ic: '📺', n: 'تلفاز', w: 3, h: 1, price: 800, col: '#334155' }, table: { ic: '☕', n: 'طاولة', w: 2, h: 2, price: 300, col: '#d97706' },
  rug: { ic: '🟪', n: 'سجادة', w: 4, h: 3, price: 350, col: '#b08d6e', floor: true }, plant: { ic: '🪴', n: 'نبتة', w: 1, h: 1, price: 70, col: '#4ade80' }, bean: { ic: '🫘', n: 'كرسي وسادة', w: 2, h: 2, price: 220, col: '#c2875a' },
  toys: { ic: '🧸', n: 'صندوق ألعاب', w: 2, h: 1, price: 180, col: '#f87171' }, dresser: { ic: '🪞', n: 'تسريحة', w: 2, h: 1, price: 400, col: '#e9d5ff' },
};
const MISSIONS = [
  { n: 'غرفة نوم لطالبة', need: ['bed', 'desk', 'chair', 'wardrobe', 'lamp'], budget: 3000, W: 12, H: 10, anchor: 'bed' },
  { n: 'غرفة جلوس للعائلة', need: ['sofa', 'tv', 'table', 'rug', 'plant'], budget: 3000, W: 14, H: 10, anchor: 'sofa' },
  { n: 'غرفة ألعاب ومطالعة', need: ['bean', 'toys', 'shelf', 'rug', 'lamp'], budget: 1500, W: 10, H: 8, anchor: 'bean' },
  { n: 'غرفة أحلامي (حرة)', need: [], budget: 6000, W: 14, H: 12, anchor: null },
];
const WALLS = ['#f5f0e6', '#e8eef2', '#dfe7dc', '#f3e1dc', '#e4e0ef', '#c9d6df', '#d7c4a3', '#9fb4a8'];
const FLOORS = {
  wood: ['باركيه', 'repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0 1px, transparent 1px 30px), repeating-linear-gradient(0deg, rgba(90,50,20,.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, #c8955e 0 30px, #bd8a52 30px 60px, #d19f68 60px 90px, #b98450 90px 120px)'],
  herring: ['خشب متعرج', 'repeating-linear-gradient(45deg, rgba(0,0,0,.15) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, rgba(0,0,0,.15) 0 1px, transparent 1px 22px), linear-gradient(135deg, #b88a5a, #9c7044)'],
  marble: ['رخام', 'radial-gradient(ellipse at 20% 30%, rgba(160,160,170,.35), transparent 40%), radial-gradient(ellipse at 75% 70%, rgba(150,150,160,.3), transparent 45%), repeating-linear-gradient(0deg, rgba(0,0,0,.1) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, rgba(0,0,0,.1) 0 1px, transparent 1px 60px), linear-gradient(135deg, #f8fafc, #e2e8f0)'],
  tile: ['بلاط', 'repeating-linear-gradient(0deg, #9ca3af 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, #9ca3af 0 1px, transparent 1px 40px), repeating-conic-gradient(#e7e5e4 0 25%, #f5f5f4 0 50%) 0 0/80px 80px'],
  carpet: ['موكيت', 'radial-gradient(rgba(255,255,255,.18) 1px, transparent 1.5px) 0 0/5px 5px, linear-gradient(135deg, #8e9aaf, #6b7a94)'],
};
export async function mount(root) {
  if (!document.getElementById('rm-css')) document.head.append(h('link', { id: 'rm-css', rel: 'stylesheet', href: new URL('./room.css', import.meta.url).href }));
  const view = h('div', { class: 'rm' }); root.append(view);
  let mi = 0, D, pick = null, sel = null, night = false;
  const key = () => 'room-' + mi;
  function load() { D = store.get(key(), { items: [], wall: WALLS[0], floor: 'wood' }); sel = null; pick = null; }
  const save = () => store.set(key(), D);
  const M = () => MISSIONS[mi];
  const dims = (it) => { const c = CAT[it.k]; return it.r ? [c.h, c.w] : [c.w, c.h]; };
  const cellsOf = (it) => { const [w, hh] = dims(it); const out = []; for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) out.push([it.x + x, it.y + y]); return out; };
  const door = () => [Math.floor(M().W / 2), M().H - 1];
  function blocked(exclude) { const m = new Map(); D.items.forEach((it, i) => { if (i === exclude || CAT[it.k].floor) return; cellsOf(it).forEach(([x, y]) => m.set(x + ',' + y, i)); }); return m; }
  function fits(it, ex) { const b = blocked(ex); const [w, hh] = dims(it); if (it.x < 0 || it.y < 0 || it.x + w > M().W || it.y + hh > M().H) return false; if (CAT[it.k].floor) return true; const [dx, dy] = door(); return cellsOf(it).every(([x, y]) => !b.has(x + ',' + y) && !(x === dx && y === dy)); }
  function tap(x, y) {
    if (pick) { const it = { k: pick, x, y, r: false }; if (!fits(it, -1)) { const [w, hh] = dims(it); it.x = Math.min(x, M().W - w); it.y = Math.min(y, M().H - hh); } if (!fits(it, -1)) { sound('error'); return; } D.items.push(it); sel = D.items.length - 1; pick = null; sound('place'); save(); draw(); return; }
    if (sel != null) { const it = { ...D.items[sel], x, y }; if (fits(it, sel)) { D.items[sel] = it; sound('move'); save(); draw(); return; } }
    const hit = [...D.items.keys()].reverse().find(i => cellsOf(D.items[i]).some(([a, b]) => a === x && b === y));
    sel = hit ?? null; draw();
  }
  // سحب قطعة من القائمة مباشرة إلى الغرفة
  function catDrag(e, k, room) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const c = CAT[k], m = M(); const x0 = e.clientX, y0 = e.clientY; let ghost = null;
    const mv = (ev) => { if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return; const cs = room.getBoundingClientRect().width / m.W;
      if (!ghost) { ghost = h('div', { class: 'rm-ghost', style: { width: c.w * cs + 'px', height: c.h * cs + 'px' }, html: furniture(k, c.col, c.w, c.h, false) }); document.body.append(ghost); }
      ghost.style.left = ev.clientX - c.w * cs / 2 + 'px'; ghost.style.top = ev.clientY - c.h * cs / 2 + 'px'; ev.preventDefault(); };
    const up = (ev) => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); if (!ghost) return; ghost.remove();
      const r = room.getBoundingClientRect(), cs = r.width / m.W; const x = Math.round((ev.clientX - r.left) / cs - c.w / 2), y = Math.round((ev.clientY - r.top) / cs - c.h / 2);
      const it = { k, x, y, r: false }; if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom && fits(it, -1)) { D.items.push(it); sel = D.items.length - 1; pick = null; sound('place'); save(); } else sound('error'); setTimeout(draw, 0); };
    window.addEventListener('pointermove', mv, { passive: false }); window.addEventListener('pointerup', up);
  }
  function evaluate() {
    const spent = D.items.reduce((a, it) => a + CAT[it.k].price, 0);
    const b = blocked(-1); const area = M().W * M().H; const free = Math.round((1 - b.size / area) * 100);
    const missing = M().need.filter(k => !D.items.some(it => it.k === k));
    let walk = true;
    if (M().anchor) {
      const targets = new Set(); D.items.forEach(it => { if (it.k === M().anchor) cellsOf(it).forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => targets.add((x + dx) + ',' + (y + dy)))); });
      const [sx, sy] = door(); const seen = new Set([sx + ',' + sy]); const q = [[sx, sy]]; walk = false;
      while (q.length) { const [x, y] = q.shift(); if (targets.has(x + ',' + y)) { walk = true; break; } for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= M().W || ny >= M().H || seen.has(k) || b.has(k)) continue; seen.add(k); q.push([nx, ny]); } }
    }
    return { spent, free, missing, walk, over: spent > M().budget };
  }
  function draw() {
    const ev = evaluate(); const m = M();
    view.innerHTML = '';
    const room = h('div', { class: 'rm-room' + (night ? ' night' : ''), style: { '--w': m.W, '--h': m.H, '--wall': D.wall, '--floor': FLOORS[D.floor][1] } });
    for (let y = 0; y < m.H; y++) for (let x = 0; x < m.W; x++) room.append(h('button', { type: 'button', class: 'rm-cell', style: { gridColumn: x + 1, gridRow: y + 1 }, onclick: () => tap(x, y) }));
    const [dx, dy] = door(); room.append(h('div', { class: 'rm-door', style: { gridColumn: `${dx} / span 3`, gridRow: dy + 1 }, html: '<svg viewBox="0 0 30 10" preserveAspectRatio="none"><path d="M10 10 A10 10 0 0 1 20 0" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".4" stroke-dasharray="1 1"/><rect x="9" y="0" width="1.2" height="10" fill="#92400e"/><rect x="10" y="9.2" width="10" height=".8" fill="#78350f"/></svg>' }));
    D.items.map((it, i) => [it, i]).sort((a, b) => (CAT[b[0].k].floor ? 1 : 0) - (CAT[a[0].k].floor ? 1 : 0)).forEach(([it, i]) => { const c = CAT[it.k]; const [w, hh] = dims(it);
      const el = h('div', { class: 'rm-item' + (c.floor ? ' floor' : '') + (i === sel ? ' sel' : '') + (c.light && night ? ' glow' : ''), style: { gridColumn: `${it.x + 1} / span ${w}`, gridRow: `${it.y + 1} / span ${hh}` }, html: furniture(it.k, it.col || c.col, c.w, c.h, it.r) });
      // السحب والإفلات: اسحب القطعة إلى مكان جديد، والنقر دون سحب يحددها
      el.addEventListener('pointerdown', (e) => {
        if (pick) return; e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId);
        const cs = room.getBoundingClientRect().width / m.W, x0 = e.clientX, y0 = e.clientY; let moved = false;
        el.classList.add('drag');
        const mv = (ev) => { const dx = ev.clientX - x0, dy = ev.clientY - y0; if (Math.hypot(dx, dy) > 4) moved = true; el.style.transform = `translate(${dx}px, ${dy}px)`; const nx = it.x + Math.round(dx / cs), ny = it.y + Math.round(dy / cs); el.classList.toggle('bad', !fits({ ...it, x: nx, y: ny }, i)); };
        const upf = (ev) => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', upf); el.removeEventListener('pointercancel', upf);
          const dx = ev.clientX - x0, dy = ev.clientY - y0; const nx = it.x + Math.round(dx / cs), ny = it.y + Math.round(dy / cs);
          if (!moved) { sel = i === sel ? null : i; draw(); return; }
          const nt = { ...it, x: nx, y: ny }; if (fits(nt, i)) { D.items[i] = nt; sel = i; sound('move'); save(); } else sound('error'); draw(); };
        el.addEventListener('pointermove', mv); el.addEventListener('pointerup', upf); el.addEventListener('pointercancel', upf);
      });
      room.append(el); });
    // أدوات القطعة المحددة فوقها مباشرة
    if (sel != null && D.items[sel]) { const it = D.items[sel], [w, hh] = dims(it);
      room.append(h('div', { class: 'rm-float', style: { gridColumn: `${it.x + 1} / span ${Math.max(w, 3)}`, gridRow: `${Math.max(1, it.y)} / span 1` } },
        h('button', { type: 'button', title: t('rm_rotate'), onclick: () => { const nt = { ...it, r: !it.r }; if (fits(nt, sel)) { D.items[sel] = nt; sound('move'); save(); draw(); } else sound('error'); } }, '⟳'),
        h('button', { type: 'button', title: '+', onclick: () => { for (let yy = 0; yy < m.H; yy++) for (let xx = 0; xx < m.W; xx++) { const nt = { ...it, x: xx, y: yy }; if (fits(nt, -1)) { D.items.push(nt); sel = D.items.length - 1; sound('place'); save(); draw(); return; } } sound('error'); } }, '⧉'),
        h('button', { type: 'button', class: 'del', title: t('rm_remove'), onclick: () => { D.items.splice(sel, 1); sel = null; sound('capture'); save(); draw(); } }, '🗑')));
    }
    // إضاءة ليلية حول المصابيح
    if (night) D.items.forEach(it => { if (!CAT[it.k].light) return; const [w, hh] = dims(it); room.append(h('div', { class: 'rm-glow', style: { gridColumn: `${Math.max(1, it.x - 3)} / span 7`, gridRow: `${Math.max(1, it.y - 3)} / span 7` } })); });
    const s = sel != null ? D.items[sel] : null;
    view.append(h('div', { class: 'rm-top' },
      h('div', { class: 'seg' }, MISSIONS.map((mm, k) => h('button', { type: 'button', class: k === mi ? 'on' : '', onclick: () => { mi = k; load(); draw(); } }, mm.n))),
      h('div', { class: 'rm-stats' }, h('span', { class: ev.over ? 'bad' : '' }, '💰 ', num(ev.spent), ' / ', num(m.budget)), h('span', {}, '📐 ', num(m.W * m.H / 4), ' ', t('rm_m2')), h('span', { class: ev.free < 40 ? 'bad' : '' }, t('rm_free'), ': ', num(ev.free), '%'), m.anchor ? h('span', { class: ev.walk ? '' : 'bad' }, ev.walk ? '✅ ' : '⛔ ', t('rm_walk')) : null)),
      h('div', { class: 'rm-main' },
        h('div', { class: 'rm-left' }, room, h('small', { class: 'muted' }, t('rm_size')),
          s ? h('div', { class: 'rm-selbar' }, h('b', {}, CAT[s.k].ic, ' ', CAT[s.k].n, ' — ', num(CAT[s.k].price)), h('button', { type: 'button', class: 'btn sm', onclick: () => { const it = { ...s, r: !s.r }; if (fits(it, sel)) { D.items[sel] = it; save(); draw(); } else sound('error'); } }, t('rm_rotate')), h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { D.items.splice(sel, 1); sel = null; save(); draw(); } }, t('rm_remove')),
            h('div', { class: 'rm-sw' }, ['#8fa7bf', '#6f8a7a', '#b08d6e', '#c2875a', '#d9c7b0', '#7b6d8d', '#c46b6b', '#3f4a5a', '#e7d9c4', '#9a8f7d'].map(cl => h('button', { type: 'button', class: (s.col || CAT[s.k].col) === cl ? 'on' : '', style: { background: cl }, onclick: () => { D.items[sel] = { ...s, col: cl }; save(); draw(); } })))) : null),
        h('div', { class: 'rm-right' },
          h('div', { class: 'rm-mission' }, h('b', {}, '🎯 ', t('rm_mission'), ': ', m.n), m.need.length ? h('div', { class: 'rm-need' }, m.need.map(k => h('span', { class: D.items.some(it => it.k === k) ? 'ok' : '' }, CAT[k].ic, ' ', CAT[k].n))) : null),
          h('div', { class: 'rm-cat' }, Object.entries(CAT).map(([k, c]) => h('button', { type: 'button', class: 'rm-ci' + (pick === k ? ' on' : ''), onclick: () => { pick = pick === k ? null : k; sel = null; draw(); }, onpointerdown: (e) => catDrag(e, k, room) }, h('span', { class: 'rm-cic', html: furniture(k, c.col, c.w, c.h, false, true) }), h('small', {}, c.n), h('b', {}, num(c.price)), h('em', {}, num(c.w * 50), '×', num(c.h * 50))))),
          h('div', { class: 'field' }, h('span', {}, t('rm_wall')), h('div', { class: 'rm-sw' }, WALLS.map(c => h('button', { type: 'button', class: D.wall === c ? 'on' : '', style: { background: c }, onclick: () => { D.wall = c; save(); draw(); } })))),
          h('div', { class: 'field' }, h('span', {}, t('rm_floor')), h('div', { class: 'seg' }, Object.entries(FLOORS).map(([k, [n]]) => h('button', { type: 'button', class: D.floor === k ? 'on' : '', onclick: () => { D.floor = k; save(); draw(); } }, n)))),
          h('div', { class: 'field' }, h('span', {}, t('rm_light')), h('div', { class: 'seg' }, [[false, '☀️ ' + t('rm_day')], [true, '🌙 ' + t('rm_night')]].map(([v, l]) => h('button', { type: 'button', class: night === v ? 'on' : '', onclick: () => { night = v; draw(); } }, l)))),
          h('button', { type: 'button', class: 'btn gk-go', onclick: () => { const msgs = []; if (ev.missing.length) msgs.push(t('rm_need', { x: ev.missing.map(k => CAT[k].n).join('، ') })); if (ev.over) msgs.push(t('rm_over')); if (!ev.walk) msgs.push(t('rm_noWalk')); if (ev.free < 40) msgs.push(t('rm_tight'));
            if (!msgs.length) { sound('win'); toast(t('rm_ok'), 'ok'); } else { sound('error'); msgs.forEach(x => toast(x, true)); } } }, ico('check', 18), t('rm_check')),
          h('p', { class: 'muted' }, t('rm_help')))));
  }
  load(); draw();
  return { onLang() { draw(); } };
}
