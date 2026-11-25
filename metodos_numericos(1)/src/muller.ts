mount({ title: 'Menú para método de Müller', fields: [FX, { id: 'x0', label: 'x₀', def: '0' }, { id: 'x1', label: 'x₁', def: '1' }, { id: 'x2', label: 'x₂', def: '2' }],
  cols: ['i', 'x₀', 'x₁', 'x₂', 'x₃', 'f(x₃)', 'error'],
  run: c => {
    const f = c.fn('fx'); let x0 = c.n('x0'), x1 = c.n('x1'), x2 = c.n('x2'), p = x2, ok = false; const rows: Cell[][] = [];
    for (let i = 1; i <= c.max; i++) {
      const f0 = f(x0), f1 = f(x1), f2 = f(x2), h0 = x1 - x0, h1 = x2 - x1, d0 = (f1 - f0) / h0, d1 = (f2 - f1) / h1;
      const a = (d1 - d0) / (h1 + h0), b = a * h1 + d1, D = b * b - 4 * a * f2;
      if (D < 0) throw new Error('Discriminante negativo: raíz compleja (esta versión usa solo reales). Prueba otros x₀, x₁, x₂.');
      const s = Math.sqrt(D), E = Math.abs(b + s) > Math.abs(b - s) ? b + s : b - s;
      if (E === 0) throw new Error('Denominador cero. Cambia los puntos iniciales.');
      const h = -2 * f2 / E; p = x2 + h; rows.push([i, x0, x1, x2, p, f(p), Math.abs(h)]);
      if (Math.abs(h) < c.tol) { ok = true; break; }
      x0 = x1; x1 = x2; x2 = p;
    }
    return { rows, ok, msg: summary(f, p, ok, rows.length, c.max) };
  } });
