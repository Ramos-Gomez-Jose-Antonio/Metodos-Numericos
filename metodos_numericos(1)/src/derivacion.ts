mount({ title: 'Menú para derivación numérica', iter: false, fields: [FS, { id: 'x0', label: 'x₀', def: '1' }, { id: 'h', label: 'h', def: '0.1' }], cols: ['i', 'fórmula', 'f′(x₀)', 'f″(x₀)'],
  run: c => {
    const f = c.fn('fx'), x = c.n('x0'), h = c.n('h'), f0 = f(x), p = f(x + h), m = f(x - h), p2 = f(x + 2 * h), m2 = f(x - 2 * h);
    const rows: Cell[][] = [[0, 'Hacia adelante (2 pts)', (p - f0) / h, null], [1, 'Hacia atrás (2 pts)', (f0 - m) / h, null],
      [2, 'Centrada (3 pts)', (p - m) / (2 * h), (p - 2 * f0 + m) / (h * h)], [3, 'Centrada (5 pts)', (m2 - 8 * m + 8 * p - p2) / (12 * h), (-m2 + 16 * m - 30 * f0 + 16 * p - p2) / (12 * h * h)]];
    return { rows, msg: `Derivadas en x₀ = ${fmt(x)} con h = ${fmt(h)}` };
  } });
