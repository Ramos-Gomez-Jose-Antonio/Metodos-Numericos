mount({ title: 'Menú para método de Steffensen (Δ² de Aitken)',
  fields: [{ id: 'gx', label: 'g(x)  (x = g(x))', def: '(x+2)^(1/3)', wide: true }, { id: 'p0', label: 'p₀', def: '1.5' }],
  cols: ['i', 'p₀', 'p₁ = g(p₀)', 'p₂ = g(p₁)', 'p (Aitken)', 'error'],
  run: c => {
    const g = c.fn('gx'); let p0 = c.n('p0'), p = p0, ok = false; const rows: Cell[][] = [];
    for (let i = 1; i <= c.max; i++) {
      const p1 = g(p0), p2 = g(p1), den = p2 - 2 * p1 + p0;
      p = den === 0 ? p2 : p0 - (p1 - p0) ** 2 / den; const e = Math.abs(p - p0);
      rows.push([i, p0, p1, p2, p, e]); p0 = p;
      if (e < c.tol || den === 0) { ok = true; break; }
    }
    return { rows, ok, msg: summary(t => g(t) - t, p, ok, rows.length, c.max, 'g(x) − x') };
  } });
