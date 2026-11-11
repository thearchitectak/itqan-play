// أيقونات ثلاثية الأبعاد: تستبدل الرموز التعبيرية داخل الصفحة بصور Microsoft Fluent Emoji (ترخيص MIT)
import { ICO, ATL } from './ico-map.js';
const RX = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)\p{Emoji_Modifier}?(?:‍(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️?)\p{Emoji_Modifier}?)*/gu;
const BASE = new URL('../ico/', import.meta.url).href;
const norm = (s) => s.replace(/[️\u{1F3FB}-\u{1F3FF}]/gu, '');
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SELECT', 'TITLE', 'CANVAS']);
function spanFor(g) {
  const k = ICO[norm(g)]; if (!k) return null;
  const [a, i] = k, [cols, rows] = ATL[a], x = i % cols, y = Math.floor(i / cols);
  const s = document.createElement('span'); s.className = 'i3'; s.textContent = g; s.setAttribute('role', 'img'); s.setAttribute('aria-label', g);
  s.style.cssText = `background-image:url(${BASE}${a}.webp);background-size:${cols * 100}% ${rows * 100}%;background-position:${cols > 1 ? x / (cols - 1) * 100 : 0}% ${rows > 1 ? y / (rows - 1) * 100 : 0}%`;
  return s;
}
function skip(n) {
  for (let e = n.parentElement; e; e = e.parentElement) {
    if (SKIP.has(e.tagName) || e.namespaceURI === 'http://www.w3.org/2000/svg' || e.classList.contains('i3') || e.classList.contains('no3d') || e.isContentEditable) return true;
    if (e === document.body) return false;
  }
  return false;
}
function fixText(n) {
  const v = n.nodeValue; if (!v || !RX.test(v) || skip(n)) return; RX.lastIndex = 0;
  const frag = document.createDocumentFragment(); let last = 0, hit = false, m;
  while ((m = RX.exec(v))) { const s = spanFor(m[0]); if (!s) continue; hit = true; if (m.index > last) frag.append(v.slice(last, m.index)); frag.append(s); last = m.index + m[0].length; }
  if (!hit) return; if (last < v.length) frag.append(v.slice(last)); n.replaceWith(frag);
}
function walk(root) {
  if (root.nodeType === 3) return fixText(root);
  if (root.nodeType !== 1 || SKIP.has(root.tagName) || root.namespaceURI === 'http://www.w3.org/2000/svg') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = []; let n; while ((n = w.nextNode())) list.push(n); list.forEach(fixText);
}
export function startIcons(root = document.body) {
  walk(root);
  new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'characterData') fixText(m.target); else m.addedNodes.forEach(walk); } })
    .observe(root, { childList: true, subtree: true, characterData: true });
}
