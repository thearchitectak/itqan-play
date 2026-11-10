// واجهة متجر مرسومة (SVG) تتغير مع نوع المشروع والتحسينات والمستوى.
const C = { bakery: ['#b45309', '#fde68a', '#f59e0b'], gifts: ['#be185d', '#fbcfe8', '#ec4899'], cafe: ['#5b21b6', '#ddd6fe', '#8b5cf6'] };
const goods = {
  bakery: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#d97706"/><path d="M${x - 6} ${y - 2} q3 3 0 5 M${x} ${y - 4} q3 3 0 7 M${x + 6} ${y - 2} q3 3 0 5" stroke="#92400e" stroke-width="1.2" fill="none"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="4" ry="1.5" fill="rgba(255,255,255,.35)"/>`,
  gifts: (x, y) => `<rect x="${x - 8}" y="${y - 7}" width="16" height="12" rx="1" fill="#ec4899"/><rect x="${x - 1.5}" y="${y - 7}" width="3" height="12" fill="#fde047"/><rect x="${x - 8}" y="${y - 2.5}" width="16" height="3" fill="#fde047"/><path d="M${x} ${y - 7} q-6 -6 -6 -1 q0 2 6 1 q6 1 6 -1 q0 -5 -6 1" fill="#facc15"/>`,
  cafe: (x, y) => `<path d="M${x - 7} ${y - 6} h14 l-2 11 h-10 Z" fill="#fff" stroke="#cbd5e1"/><path d="M${x + 7} ${y - 3} q5 0 4 4 q-1 3 -5 2" stroke="#cbd5e1" stroke-width="1.5" fill="none"/><ellipse cx="${x}" cy="${y - 6}" rx="7" ry="1.6" fill="#7c2d12"/><path d="M${x - 2} ${y - 10} q2 -3 0 -6 M${x + 2} ${y - 10} q2 -3 0 -6" stroke="rgba(148,163,184,.8)" stroke-width="1" fill="none"/>`,
};
export function storefront(kind, G, name, lvl) {
  const [main, light, acc] = C[kind] || C.bakery; const up = (k) => G.ups.includes(k);
  const floors = lvl >= 4 ? 2 : 1, top = floors === 2 ? 30 : 70;
  let s = `<svg viewBox="0 0 400 230" xmlns="http://www.w3.org/2000/svg" class="bz-svg"><defs>
  <linearGradient id="bzs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient>
  <linearGradient id="bzw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <linearGradient id="bzg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0f2fe" stop-opacity=".95"/><stop offset=".5" stop-color="#bae6fd" stop-opacity=".7"/><stop offset="1" stop-color="#7dd3fc" stop-opacity=".9"/></linearGradient>
  <pattern id="bzb" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="20" height="10" fill="${main}" opacity=".08"/><path d="M0 9.5 H20 M10 0 V5 M0 5 H20 M20 5 V10" stroke="rgba(0,0,0,.08)"/></pattern></defs>
  <rect width="400" height="230" fill="url(#bzs)"/><circle cx="350" cy="35" r="18" fill="#fde68a"/><ellipse cx="80" cy="30" rx="30" ry="9" fill="#fff" opacity=".9"/>
  <rect x="0" y="196" width="400" height="34" fill="#9ca3af"/><rect x="0" y="196" width="400" height="4" fill="#d1d5db"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 42}" y="200" width="40" height="30" fill="none" stroke="rgba(0,0,0,.08)"/>`).join('')}
  <rect x="60" y="${top}" width="280" height="${196 - top}" fill="url(#bzw)"/><rect x="60" y="${top}" width="280" height="${196 - top}" fill="url(#bzb)"/><rect x="56" y="${top - 8}" width="288" height="10" rx="2" fill="${main}"/>`;
  if (floors === 2) s += [90, 160, 230, 300].map(x => `<rect x="${x - 18}" y="44" width="36" height="22" rx="2" fill="url(#bzg)" stroke="${main}" stroke-width="2"/><rect x="${x - 20}" y="66" width="40" height="3" fill="${main}"/>`).join('');
  // اللافتة
  s += `<rect x="120" y="76" width="160" height="26" rx="6" fill="${main}"/>${up('sign') ? `<rect x="120" y="76" width="160" height="26" rx="6" fill="none" stroke="#fde047" stroke-width="2" stroke-dasharray="3 3"/>` : ''}<text x="200" y="95" font-size="17" font-weight="900" text-anchor="middle" fill="${up('sign') ? '#fef9c3' : '#fff'}" font-family="Cairo, system-ui">${name}</text>`;
  // المظلة المخططة
  s += `<path d="M66 108 H334 L344 130 H56 Z" fill="${acc}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${66 + i * 22.3} 108 h11 l2 22 h-12 Z" fill="#fff" opacity=".9"/>`).join('')}${Array.from({ length: 12 }, (_, i) => `<path d="M${56 + i * 24} 130 q12 10 24 0" fill="${i % 2 ? '#fff' : acc}"/>`).join('')}`;
  // واجهة العرض والباب
  s += `<rect x="76" y="140" width="150" height="54" rx="2" fill="#fff" stroke="${main}" stroke-width="3"/><rect x="80" y="144" width="142" height="46" fill="url(#bzg)"/><rect x="80" y="178" width="142" height="4" fill="${main}" opacity=".6"/>`;
  const n = Math.min(5, 1 + Math.floor(Object.values(G.stock).reduce((a, b) => a + b, 0) / 10));
  for (let i = 0; i < n; i++) s += goods[kind](96 + i * 27, 172);
  s += `<path d="M84 146 l30 0 l-28 26 Z" fill="rgba(255,255,255,.4)"/>`;
  s += `<rect x="248" y="138" width="56" height="58" rx="3" fill="#7c2d12"/><rect x="254" y="144" width="44" height="30" rx="2" fill="url(#bzg)"/><circle cx="292" cy="178" r="2.5" fill="#facc15"/><rect x="258" y="178" width="22" height="10" rx="2" fill="#fff"/><text x="269" y="186" font-size="7" text-anchor="middle" font-weight="900" fill="#16a34a">OPEN</text>`;
  if (up('decor')) s += `<rect x="38" y="176" width="18" height="20" rx="2" fill="#b45309"/><circle cx="47" cy="166" r="14" fill="#16a34a"/><circle cx="42" cy="160" r="7" fill="#22c55e"/><rect x="344" y="176" width="18" height="20" rx="2" fill="#b45309"/><circle cx="353" cy="166" r="14" fill="#16a34a"/><circle cx="358" cy="160" r="7" fill="#22c55e"/>`;
  if (up('quality')) s += `<g transform="translate(316 112)"><circle r="13" fill="#facc15" stroke="#a16207" stroke-width="2"/><text y="5" font-size="14" text-anchor="middle">⭐</text></g>`;
  if (G.brand) s += `<text x="200" y="${floors === 2 ? 26 : 60}" font-size="14" text-anchor="middle">🏆</text>`;
  // زبائن مبسطون على الرصيف
  const people = Math.min(4, Math.round(G.rep / 25));
  for (let i = 0; i < people; i++) { const x = 30 + i * 95 + (i > 1 ? 130 : 0), col = ['#3b82f6', '#ef4444', '#16a34a', '#a855f7'][i]; s += `<ellipse cx="${x}" cy="222" rx="10" ry="3" fill="rgba(0,0,0,.2)"/><rect x="${x - 7}" y="196" width="14" height="22" rx="6" fill="${col}"/><circle cx="${x}" cy="189" r="7" fill="#f1c27d"/><path d="M${x - 7} 187 q7 -9 14 0" fill="#3f2a1d"/>`; }
  return s + '</svg>';
}
