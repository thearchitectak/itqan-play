// حل الدوائر الكهربائية بطريقة الجهود العقدية (MNA مبسطة) مع نموذج للصمام الضوئي (LED).
export const PARTS = {
  wire: { R: 0.01 }, bulb: { R: 10 }, motor: { R: 8 }, buzzer: { R: 12 }, resistor: { R: 20 }, switch: { R: 0.01 }, battery: { V: 9, r: 0.5 }, led: { Vf: 2, Rd: 5 },
};
export function solve(comps) {
  // comps: [{ type, a: 'x,y', b: 'x,y', on (للمفتاح) }] — للبطارية: الموجب عند b، وللـLED: الأنود a
  const nodes = [...new Set(comps.flatMap(c => [c.a, c.b]))]; const idx = Object.fromEntries(nodes.map((n, i) => [n, i]));
  const n = nodes.length; if (!n) return { I: [], short: false };
  const ledOn = comps.map(c => c.type === 'led');
  let res = null;
  for (let iter = 0; iter < 8; iter++) {
    const G = Array.from({ length: n }, () => Array(n).fill(0)); const Ivec = Array(n).fill(0);
    const stamp = (a, b, g) => { G[a][a] += g; G[b][b] += g; G[a][b] -= g; G[b][a] -= g; };
    comps.forEach((c, k) => {
      const a = idx[c.a], b = idx[c.b];
      if (c.type === 'switch' && !c.on) return;
      if (c.type === 'battery') { const g = 1 / PARTS.battery.r; stamp(a, b, g); Ivec[b] += PARTS.battery.V * g; Ivec[a] -= PARTS.battery.V * g; return; }
      if (c.type === 'led') { if (!ledOn[k]) { stamp(a, b, 1e-9); return; } const g = 1 / PARTS.led.Rd; stamp(a, b, g); Ivec[a] += PARTS.led.Vf * g; Ivec[b] -= PARTS.led.Vf * g; return; }
      stamp(a, b, 1 / PARTS[c.type].R);
    });
    for (let i = 0; i < n; i++) G[i][i] += 1e-7; // تسريب ضئيل يمنع المصفوفة المفردة
    const v = gauss(G, Ivec);
    const I = comps.map((c, k) => {
      const va = v[idx[c.a]], vb = v[idx[c.b]];
      if (c.type === 'switch' && !c.on) return 0;
      if (c.type === 'battery') return (PARTS.battery.V - (vb - va)) / PARTS.battery.r;
      if (c.type === 'led') return ledOn[k] ? (va - vb - PARTS.led.Vf) / PARTS.led.Rd : 0;
      return (va - vb) / PARTS[c.type].R;
    });
    // تحديث حالة الـLED
    let changed = false;
    comps.forEach((c, k) => { if (c.type !== 'led') return; const va = v[idx[c.a]], vb = v[idx[c.b]]; const want = ledOn[k] ? I[k] > 0 : va - vb > PARTS.led.Vf; if (want !== ledOn[k]) { ledOn[k] = want; changed = true; } });
    res = { I, v, short: comps.some((c, k) => c.type === 'battery' && Math.abs(I[k]) > 6) };
    if (!changed) break;
  }
  return res;
}
function gauss(A, b) {
  const n = b.length; const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]]; const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / (r[i] || 1e-12));
}
