// الواجهة الرئيسية: الترويسة، التنقل بين الصفحات، الصفحة الرئيسية، الإعدادات، الملف التعريفي والدعم.
import { h, ico, $, t, tr, settings, setSetting, applyLang, num, modal, toast, copyText, sound, onSettings, store, displayName, viewToggle, applyView } from './core.js';
import { GAMES } from './games.js';
import { ART } from './art.js';
import { startIcons } from './ico3d.js';
import { SITE_CONFIG } from './site-config.js';
import { BRANDS, BRAND_ORDER } from './brands.js';

let CONFIG = structuredClone(SITE_CONFIG);
let current = null; // اللعبة المفتوحة حاليًا

// ---------- البيانات المشتركة مع أدوات إتقان ----------
async function loadShared() {
  if (!/^https?:$/.test(location.protocol)) return;
  try {
    const r = await fetch('/api/site', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    if (j.profile) CONFIG.profile = { ...CONFIG.profile, ...j.profile, links: { ...CONFIG.profile.links, ...(j.profile.links || {}) } };
    if (j.donation) CONFIG.donation = { ...CONFIG.donation, ...j.donation };
  } catch { }
}

// ---------- الملف التعريفي ----------
const BASE = {
  telegram: 'https://t.me/', x: 'https://x.com/', instagram: 'https://instagram.com/', snapchat: 'https://snapchat.com/add/',
  tiktok: 'https://www.tiktok.com/@', youtube: 'https://www.youtube.com/@', linkedin: 'https://www.linkedin.com/in/',
  facebook: 'https://facebook.com/', threads: 'https://www.threads.net/@', github: 'https://github.com/',
};
function linkFor(key, value) {
  let v = String(value || '').trim(); if (!v) return null;
  if (key === 'whatsapp') { if (/^https?:/i.test(v)) return v; const n = v.replace(/[^\d]/g, '').replace(/^00/, ''); return n ? `https://wa.me/${n}` : null; }
  if (key === 'phone') return `tel:${v.replace(/[^\d+]/g, '')}`;
  if (key === 'email') return /^mailto:/i.test(v) ? v : `mailto:${v}`;
  if (/^https?:\/\//i.test(v)) return v;
  if (key === 'website') return 'https://' + v.replace(/^\/+/, '');
  return (BASE[key] || '') + v.replace(/^@/, '');
}
function socialIcons(links, size = 20) {
  const wrap = h('div', { class: 'socials' });
  for (const k of BRAND_ORDER) {
    const url = linkFor(k, links?.[k]); if (!url) continue;
    const b = BRANDS[k]; const ext = /^https?:/.test(url);
    wrap.append(h('a', { class: 'social', href: url, target: ext ? '_blank' : null, rel: ext ? 'noopener' : null, title: b.name, 'aria-label': b.name, style: { '--brand': b.color }, html: b.svg.replace('<svg ', `<svg width="${size}" height="${size}" `) }));
  }
  return wrap.children.length ? wrap : null;
}
function profileCard() {
  const p = CONFIG.profile; if (!p || p.enabled === false) return null;
  const name = settings.lang === 'en' ? (p.nameEn || 'Eng. Ahmed Khaled') : (p.name || 'المهندس/ أحمد خالد');
  return h('div', { class: 'panel profile-card', id: 'about' },
    /^(data:image\/|https:\/\/)/.test(p.photo || '') ? h('img', { class: 'avatar', src: p.photo, alt: name }) : h('div', { class: 'avatar' }, ico('user-round', 38)),
    h('div', { class: 'pc-name' }, name),
    h('div', { class: 'pc-role' }, t('role')),
    socialIcons(p.links));
}
function hasAccounts() { const d = CONFIG.donation; return d && ((d.accounts || []).some(a => a.iban || a.number) || (d.links || []).some(l => l.url)); }
const copyRow = (label, value, ltr = true) => value ? h('div', { class: 'acc-row' }, h('span', { class: 'muted' }, label), h('b', { dir: ltr ? 'ltr' : null }, value), h('button', { class: 'icon-btn', type: 'button', title: t('copy'), onclick: () => copyText(value.replace(/\s+/g, ltr ? '' : ' ')) }, ico('copy', 16))) : null;
function openDonation() {
  const d = CONFIG.donation;
  modal(t('donDetails'), h('div', {},
    h('div', { class: 'accounts' }, (d.accounts || []).filter(a => a.iban || a.number).map(a => h('div', { class: 'account' },
      h('div', { class: 'acc-head' }, ico('landmark', 18), h('b', {}, a.bank || t('bankAcc')), a.country ? h('span', { class: 'muted' }, ' — ' + a.country) : null),
      copyRow(t('beneficiary'), a.holder, false), copyRow(t('iban'), a.iban), copyRow(t('accNo'), a.number), a.note ? h('small', { class: 'muted' }, a.note) : null,
      /^data:image\//.test(a.qr || '') ? h('div', { class: 'acc-qr' }, h('img', { src: a.qr, alt: 'QR' }), h('small', { class: 'muted' }, t('scanQr'))) : null))),
    (d.links || []).some(l => l.url) ? h('div', { class: 'row', style: { marginTop: '12px', justifyContent: 'center' } }, (d.links || []).filter(l => l.url).map(l => h('a', { class: 'btn', href: l.url, target: '_blank', rel: 'noopener' }, ico('heart', 18), l.label || t('donNow')))) : null,
    h('p', { class: 'muted center', style: { margin: '14px 0 0' } }, d.thanks || t('donThanks'))), [], { icon: 'hand-heart' });
}
function donationCard() {
  const d = CONFIG.donation; if (!d || d.enabled === false) return null;
  const btn = hasAccounts()
    ? h('button', { class: 'btn accent', type: 'button', onclick: openDonation }, ico('heart', 18), t('donNow'))
    : h('a', { class: 'btn accent', href: d.fallbackUrl || SITE_CONFIG.donation.fallbackUrl, target: '_blank', rel: 'noopener' }, ico('heart', 18), t('donNow'));
  return h('div', { class: 'panel donation-card', id: 'support' },
    h('span', { class: 'don-ic big' }, ico('hand-heart', 30)), h('h2', {}, t('donTitle')), h('p', {}, t('donText')), btn);
}

// ---------- الترويسة والتذييل ----------
function header() {
  return h('header', { class: 'site-header' }, h('div', { class: 'container bar' },
    h('a', { class: 'brand', href: '#home' }, h('span', { class: 'logo' }, ico('gamepad-2', 22)), h('span', {}, t('siteName'), h('small', {}, t('siteSub')))),
    h('nav', { class: 'nav' },
      h('a', { href: '#home' }, ico('house', 18), h('span', { class: 'lbl' }, t('games'))),
      h('a', { href: '#about-me' }, ico('user-round', 18), h('span', { class: 'lbl' }, t('about'))),
      h('a', { href: '#support-us' }, ico('heart', 18), h('span', { class: 'lbl' }, t('support'))),
      viewToggle(),
      h('button', { type: 'button', onclick: openSettings, title: t('settings') }, ico('settings', 18), h('span', { class: 'lbl' }, t('settings'))),
      h('button', { type: 'button', title: t('language'), onclick: () => setSetting('lang', settings.lang === 'ar' ? 'en' : 'ar') }, ico('languages', 18), h('span', {}, settings.lang === 'ar' ? 'EN' : 'ع')))));
}
function footer() {
  return h('footer', { class: 'site-footer' }, h('div', { class: 'container row' },
    h('span', {}, '© ', num(new Date().getFullYear()), ' ', settings.lang === 'en' ? (CONFIG.profile.nameEn || 'Eng. Ahmed Khaled') : CONFIG.profile.name, ' — ', t('footer')),
    h('span', {}, t('siteName'), ' · ', t('openSource'))));
}

// ---------- الإعدادات ----------
export function seg(options, value, onpick) {
  const el = h('div', { class: 'seg' });
  for (const [v, label] of options) el.append(h('button', { type: 'button', class: v === value ? 'on' : '', onclick: () => { el.querySelectorAll('button').forEach(b => b.classList.remove('on')); el.querySelector(`[data-v="${v}"]`).classList.add('on'); onpick(v); }, 'data-v': v }, label));
  return el;
}
export function openSettings() {
  const draft = { ...settings };
  const nameIn = h('input', { class: 'input', value: settings.playerName, maxlength: 24, placeholder: `${t('player')} ${num(1)}` });
  const vol = h('input', { type: 'range', min: 0, max: 1, step: 0.1, value: settings.volume, oninput: (e) => draft.volume = +e.target.value });
  const body = h('div', { class: 'opts' },
    h('label', { class: 'field', style: { gridColumn: '1 / -1' } }, h('span', {}, t('playerName')), nameIn, h('small', {}, t('playerNameHint'))),
    h('div', { class: 'field' }, h('span', {}, t('language')), seg([['ar', 'العربية'], ['en', 'English']], draft.lang, v => draft.lang = v)),
    h('div', { class: 'field' }, h('span', {}, t('digits')), seg([['latin', '123'], ['arabic', '١٢٣']], draft.digits, v => draft.digits = v)),
    h('div', { class: 'field' }, h('span', {}, t('sound')), seg([[true, t('on')], [false, t('off')]].map(([a, b]) => [String(a), b]), String(draft.sound), v => draft.sound = v === 'true')),
    h('div', { class: 'field' }, h('span', {}, t('soundSet')), seg([['wood', t('wood')], ['digital', t('digital')], ['soft', t('soft')]], draft.soundSet, v => { draft.soundSet = v; const old = settings.soundSet; settings.soundSet = v; sound('move'); settings.soundSet = old; })),
    h('label', { class: 'field' }, h('span', {}, t('volume')), vol),
    h('div', { class: 'field' }, h('span', {}, t('boardTheme')), seg(Object.entries({ green: ['#eeeed2', '#769656'], brown: ['#f0d9b5', '#b58863'], blue: ['#dee3e6', '#8ca2ad'], gray: ['#ebecd0', '#a7a7a7'], purple: ['#ece4f7', '#9c7fc6'] }).map(([k, [a, b]]) => [k, h('span', { class: 'swatch', style: { background: `conic-gradient(${b} 0 25%, ${a} 0 50%, ${b} 0 75%, ${a} 0)` } })]), draft.boardTheme, v => draft.boardTheme = v)),
    h('div', { class: 'field' }, h('span', {}, t('pieceSet')), seg([['cburnett', 'Classic'], ['merida', 'Merida']], draft.pieceSet, v => draft.pieceSet = v)));
  modal(t('settings'), body, [{ label: t('cancel'), kind: 'ghost', value: false }, { label: t('save'), value: true, icon: 'check' }], { icon: 'settings' }).then(ok => {
    if (!ok) return;
    draft.playerName = nameIn.value.trim().slice(0, 24);
    const langChanged = draft.lang !== settings.lang || draft.digits !== settings.digits;
    for (const [k, v] of Object.entries(draft)) if (settings[k] !== v) { if (langChanged && (k === 'lang' || k === 'digits')) continue; setSetting(k, v); }
    if (langChanged) { settings.digits = draft.digits; setSetting('lang', draft.lang); }
    toast(t('settingsSaved'), 'ok');
  });
}

// ---------- الصفحات ----------
// تصنيفات الصفحة الرئيسية
const CATS = [
  ['all', { ar: 'كل الألعاب', en: 'All games' }, '✨', null],
  ['online', { ar: 'جماعية وأونلاين', en: 'Multiplayer & online' }, '🌐', ['multiplication', 'chess', 'ludo', 'domino', 'tawla', 'baloot', 'genius', 'connect4', 'xo', 'snakes', 'draw', 'bank', 'basra', 'shayeb', 'tarneeb', 'likha', 'trix', 'hand']],
  ['cards', { ar: 'الكوتشينة', en: 'Card games' }, '🃏', ['solitaire', 'baloot', 'basra', 'shayeb', 'tarneeb', 'likha', 'trix', 'hand']],
  ['action', { ar: 'مغامرات وحركة', en: 'Action & adventure' }, '🏃', ['jumper', 'runner', 'fish', 'zuma']],
  ['board', { ar: 'ألعاب الطاولة', en: 'Board games' }, '🎲', ['bank', 'chess', 'ludo', 'domino', 'tawla', 'connect4', 'xo', 'snakes']],
  ['math', { ar: 'الرياضيات', en: 'Math' }, '🔢', ['multiplication', 'fractions', 'clock', 'g2048', 'sudoku', 'domino', 'snakes', 'business', 'basra', 'bank']],
  ['biz', { ar: 'المال والاستثمار', en: 'Money & investing' }, '💰', ['restaurant', 'farm', 'business', 'bank']],
  ['lang', { ar: 'اللغة العربية', en: 'Arabic' }, '📚', ['words', 'irab', 'draw', 'genius']],
  ['sci', { ar: 'العلوم والهندسة', en: 'Science & engineering' }, '🔬', ['bridge', 'inventor', 'architect', 'robot', 'city', 'geo']],
  ['logic', { ar: 'التفكير والألغاز', en: 'Logic & puzzles' }, '🧩', ['solitaire', 'chess', 'chesslearn', 'sudoku', 'shapes', 'escape', 'robot', 'zuma', 'connect4', 'xo']],
  ['create', { ar: 'التصميم والإبداع', en: 'Design & creativity' }, '🎨', ['fashion', 'room', 'architect', 'draw', 'business', 'city']],
];
let homeCat = 'all';
function artFor(g) {
  const s = ART[g.id]; if (!s) return null;
  const el = h('div', { class: 'art-svg', html: s.replace(/id="([\w-]+)"/g, `id="${g.id}-$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${g.id}-$1)`) });
  return el;
}
function homeView() {
  const list = GAMES.filter(g => g.status === 'ready');
  const grid = h('div', { class: 'grid' });
  const fill = () => {
    const c = CATS.find(x => x[0] === homeCat); grid.innerHTML = '';
    for (const g of list.filter(g => !c[3] || c[3].includes(g.id))) grid.append(h('a', { class: 'game-card', href: '#' + g.id },
      h('div', { class: 'art' + (ART[g.id] ? ' has-svg' : ''), style: { background: g.color } }, artFor(g) || ico(g.icon, 56)),
      h('div', { class: 'body' },
        h('small', { class: 'muted', style: { fontWeight: 700 } }, tr(g.field)),
        h('h3', {}, tr(g.title)), h('p', {}, tr(g.desc)),
        h('div', { class: 'tags' }, h('span', { class: 'tag' }, ico('users', 13), ' ', tr(g.players)), (g.tags || []).map(x => h('span', { class: 'tag' }, tr(x)))))));
  };
  const chips = h('div', { class: 'cat-chips' }, CATS.map(([k, n, ic, ids]) => h('button', { type: 'button', class: k === homeCat ? 'on' : '', onclick: (e) => { homeCat = k; chips.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget)); fill(); } }, ic, ' ', tr(n), h('small', {}, ' ', num(ids ? list.filter(g => ids.includes(g.id)).length : list.length)))));
  fill();
  return h('div', { class: 'container' },
    h('section', { class: 'hero' }, h('span', { class: 'kicker' }, ico('sparkles', 16), t('heroKicker')), h('h1', { html: t('heroTitle') }), h('p', {}, t('heroText'))),
    h('h2', { class: 'section-title' }, ico('gamepad-2', 22), t('gamesTitle'), h('small', { class: 'muted', style: { fontSize: '15px' } }, ' (', num(list.length), ')')), chips, grid,
    h('div', { class: 'about-grid', id: 'about-me' }, profileCard(), h('div', { id: 'support-us' }, donationCard())));
}

function gameHead(g) {
  return h('div', { class: 'game-headbox no-print' },
    h('div', { class: 'crumbs' }, h('a', { href: '#home' }, t('home')), ' / ', tr(g.title)),
    h('div', { class: 'game-head' }, h('span', { class: 'ic' + (ART[g.id] ? ' has-svg' : ''), style: { background: g.color } }, artFor(g) || ico(g.icon, 26)), h('div', { class: 'grow' }, h('h1', {}, tr(g.title)), h('p', {}, tr(g.desc)))));
}
async function gameView(g, root) {
  const box = h('div', { class: 'container game-page' },
    gameHead(g),
    h('div', { class: 'game-root' }, h('p', { class: 'muted center' }, t('loading'))));
  root.append(box);
  try {
    const mod = await import(g.module);
    const gr = box.querySelector('.game-root'); gr.innerHTML = '';
    const api = await mod.mount(gr, { openSettings, seg, CONFIG });
    return api;
  } catch (e) {
    console.error(e);
    box.querySelector('.game-root').innerHTML = '';
    box.querySelector('.game-root').append(h('div', { class: 'panel center' }, String(e.message || e)));
  }
}

async function render() {
  applyLang();
  try { current?.unmount?.(); } catch { }
  current = null;
  document.querySelectorAll('dialog.modal').forEach(d => { try { d.close(); } catch { } d.remove(); });
  const app = $('#app'); app.innerHTML = '';
  const hash = decodeURIComponent(location.hash.slice(1));
  let route = hash.split('-')[0] || 'home';
  app.append(header());
  const main = h('main'); app.append(main);
  const g = GAMES.find(x => x.id === route && x.status === 'ready');
  if (g) { document.title = `${tr(g.title)} — ${t('siteName')}`; current = await gameView(g, main); }
  else {
    document.title = `${t('siteName')} — ${t('siteSub')}`;
    main.append(homeView());
    if (hash === 'about-me' || hash === 'support-us') setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
    else window.scrollTo(0, 0);
  }
  app.append(footer());
}

let lastRoute = null;
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1); const route = hash.split('-')[0];
  // التنقل داخل الصفحة الرئيسية بين أقسامها لا يعيد بناءها
  if ((hash === 'about-me' || hash === 'support-us') && (lastRoute === 'home' || lastRoute === 'about' || lastRoute === 'support')) { document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); lastRoute = route; return; }
  // روابط داخلية للعبة المفتوحة (مثل chess-join-123456) تعالجها اللعبة نفسها
  if (current?.onHash && route === lastRoute) { current.onHash(hash); return; }
  lastRoute = route; render();
});
onSettings((k) => { if (k === 'lang' || k === 'digits') { if (current?.onLang) { applyLang(); const app = $('#app'); app.querySelector('.site-header')?.replaceWith(header()); app.querySelector('.site-footer')?.replaceWith(footer()); const g = GAMES.find(x => x.id === lastRoute); if (g) { app.querySelector('.game-headbox')?.replaceWith(gameHead(g)); document.title = `${tr(g.title)} — ${t('siteName')}`; } current.onLang(); } else render(); } else current?.onSettings?.(k); });

// ===== مؤثرات العمق: تدرجات SVG مشتركة وإمالة بطاقات الألعاب =====
document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="fx-ivory" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#fffefa"/><stop offset=".6" stop-color="#f7f0dc"/><stop offset="1" stop-color="#e6dabb"/></linearGradient><filter id="fx-bevel" primitiveUnits="objectBoundingBox" x="-15%" y="-15%" width="130%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation=".06" result="b"/><feSpecularLighting in="b" surfaceScale="4" specularConstant="1.3" specularExponent="40" lighting-color="#ffffff" result="s"><feDistantLight azimuth="235" elevation="40"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".85" k4="0" result="lit"/><feGaussianBlur in="SourceAlpha" stdDeviation=".05" result="sh"/><feOffset in="sh" dx=".02" dy=".09" result="sho"/><feComponentTransfer in="sho" result="sha"><feFuncA type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode in="sha"/><feMergeNode in="lit"/></feMerge></filter><filter id="fx-wood" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".18 3.2" numOctaves="3" seed="7" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .22  0 0 0 0 .11  0 0 0 0 .03  0 0 0 -2.2 1.35" result="w"/><feComposite in="w" in2="SourceAlpha" operator="in" result="w2"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="w2"/></feMerge></filter><radialGradient id="fx-gloss" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs></svg>');
startIcons(); applyView(); onSettings((k) => { if (k === 'view') { applyView(); try { current?.onLang?.(); } catch (e) { console.error(e); } } });
if (matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest?.('.game-card'); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
    c.style.setProperty('--mx', (-x * 10).toFixed(1) + 'px'); c.style.setProperty('--my', (-y * 8).toFixed(1) + 'px');
  });
  document.addEventListener('pointerout', (e) => { const c = e.target.closest?.('.game-card'); if (c && !c.contains(e.relatedTarget)) ['--rx', '--ry', '--mx', '--my'].forEach(k => c.style.removeProperty(k)); });
}

lastRoute = location.hash.slice(1).split('-')[0] || 'home';
loadShared().finally(render);
