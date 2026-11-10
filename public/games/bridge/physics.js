// محاكاة فيزيائية مبسطة للجسور (XPBD): عقد وروابط بمواد مختلفة، وحمل سيارة متحرك، وكسر عند تجاوز قوة الاحتمال.
export const MAT = {
  road: { name: 'طريق', color: '#6b7280', dens: 60, k: 4e6, strength: 4.2e4, cost: 30, max: 4, road: true },
  wood: { name: 'خشب', color: '#b45309', dens: 25, k: 2.5e6, strength: 3.2e4, cost: 15, max: 4 },
  steel: { name: 'فولاذ', color: '#475569', dens: 55, k: 1e7, strength: 9e4, cost: 45, max: 5 },
  rope: { name: 'حبل فولاذي', color: '#a16207', dens: 6, k: 3e6, strength: 6e4, cost: 20, max: 8, tension: true },
};
export const G = 9.8;
export function makeSim(nodes, beams, car) {
  // nodes: [{x,y,fixed}] ، beams: [{a,b,mat}]
  const N = nodes.map(n => ({ x: n.x, y: n.y, px: n.x, py: n.y, vx: 0, vy: 0, m: 5, fixed: !!n.fixed, fx: 0, fy: 0 }));
  const Bm = beams.map(b => { const A = N[b.a], C = N[b.b]; const L = Math.hypot(A.x - C.x, A.y - C.y); const M = MAT[b.mat]; const mass = M.dens * L; A.m += mass / 2; C.m += mass / 2; return { ...b, L0: L, M, lam: 0, stress: 0, broken: false }; });
  return { N, B: Bm, car: { x: car.x0, y: 0, vy: 0, m: car.m, speed: car.speed, onRoad: true, done: false, fell: false }, t: 0, xEnd: car.xEnd };
}
export function step(S, dt = 1 / 60, sub = 12) {
  const h = dt / sub, car = S.car;
  for (let s = 0; s < sub; s++) {
    for (const n of S.N) { n.fx = 0; n.fy = 0; }
    // الحمل: نجد طريقًا تحت السيارة
    let under = null, f = 0, best = -Infinity;
    if (!car.fell && !car.done) {
      for (const b of S.B) { if (b.broken || !b.M.road) continue; const A = S.N[b.a], C = S.N[b.b]; const x0 = Math.min(A.x, C.x), x1 = Math.max(A.x, C.x); if (car.x < x0 || car.x > x1 || x1 - x0 < .01) continue; const ff = (car.x - A.x) / (C.x - A.x); const y = A.y + (C.y - A.y) * ff; if (y > best) { best = y; under = b; f = ff; } }
      if (under) { const W = car.m * G; S.N[under.a].fy -= W * (1 - f); S.N[under.b].fy -= W * f; car.y = best; car.onRoad = true; }
      else if (car.x < S.xStart || car.x > S.xEnd) car.y = 0; else { car.fell = true; }
      car.x += car.speed * h;
      if (car.x >= S.xEnd + 1) car.done = true;
    }
    if (car.fell) { car.vy -= G * h; car.y += car.vy * h; car.x += car.speed * .3 * h; }
    for (const n of S.N) { if (n.fixed) continue; n.vy += (-G + n.fy / n.m) * h; n.vx += (n.fx / n.m) * h; n.vx *= .9995; n.vy *= .9995; n.px = n.x; n.py = n.y; n.x += n.vx * h; n.y += n.vy * h; }
    for (const b of S.B) b.lam = 0;
    for (let it = 0; it < 6; it++) for (const b of S.B) {
      if (b.broken) continue; const A = S.N[b.a], C = S.N[b.b];
      const dx = C.x - A.x, dy = C.y - A.y, L = Math.hypot(dx, dy) || 1e-6, Cc = L - b.L0;
      if (b.M.tension && Cc < 0) continue;
      const wa = A.fixed ? 0 : 1 / A.m, wc = C.fixed ? 0 : 1 / C.m; if (!wa && !wc) continue;
      const at = 1 / b.M.k / (h * h);
      const dl = (-Cc - at * b.lam) / (wa + wc + at); b.lam += dl;
      const nx = dx / L, ny = dy / L;
      A.x -= nx * dl * wa; A.y -= ny * dl * wa; C.x += nx * dl * wc; C.y += ny * dl * wc;
    }
    for (const b of S.B) { if (b.broken) continue; const force = Math.abs(b.lam) / (h * h); b.stress = force / b.M.strength; if (b.stress > 1) b.broken = true; }
    for (const n of S.N) { if (n.fixed) continue; n.vx = (n.x - n.px) / h; n.vy = (n.y - n.py) / h; }
  }
  S.t += dt;
}
