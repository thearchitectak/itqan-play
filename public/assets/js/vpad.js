// عصا تحكم افتراضية للمس: تعيد متجهًا بين −1 و1، وتطلق اتجاهًا منفصلًا (L/R/U/D) عند تجاوز العتبة.
import { h } from './core.js';
export function joystick({ onMove, onDir, size = 130 } = {}) {
  const knob = h('div', { class: 'vj-knob' });
  const base = h('div', { class: 'vj', style: { width: size + 'px', height: size + 'px' } }, h('i', { class: 'vj-ring' }), knob);
  let id = null, cx = 0, cy = 0, last = null;
  const R = size / 2 - 18;
  const set = (x, y) => { knob.style.transform = `translate(${x * R}px, ${y * R}px)`; onMove?.(x, y);
    const m = Math.hypot(x, y); let d = null; if (m > .55) d = Math.abs(x) > Math.abs(y) ? (x > 0 ? 'R' : 'L') : (y > 0 ? 'D' : 'U');
    if (d !== last) { last = d; if (d) { onDir?.(d); try { navigator.vibrate?.(8); } catch { } } } };
  base.addEventListener('pointerdown', (e) => { e.preventDefault(); id = e.pointerId; base.setPointerCapture(id); const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; move(e); base.classList.add('on'); });
  const move = (e) => { if (e.pointerId !== id) return; let x = (e.clientX - cx) / R, y = (e.clientY - cy) / R; const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } set(x, y); };
  base.addEventListener('pointermove', move);
  const up = (e) => { if (e.pointerId !== id) return; id = null; base.classList.remove('on'); set(0, 0); };
  base.addEventListener('pointerup', up); base.addEventListener('pointercancel', up);
  return base;
}
// زر لمس يدعم الضغط المستمر
export function holdBtn(label, cls, onDown, onUp) {
  const b = h('button', { type: 'button', class: 'vb ' + (cls || '') }, label);
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('on'); onDown?.(); try { navigator.vibrate?.(10); } catch { } });
  const off = (e) => { b.classList.remove('on'); onUp?.(); };
  b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off);
  return b;
}
