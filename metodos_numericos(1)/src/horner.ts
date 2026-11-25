mount({ title: 'Menú para método de Horner', iter: false,
  fields: [{ id: 'p', label: 'coeficientes (mayor a menor grado)', def: '1, -6, 11, -6', wide: true, hint: 'x³ − 6x² + 11x − 6  →  1, -6, 11, -6' }, { id: 'x0', label: 'x₀', def: '2.5' }],
  cols: ['j', 'grado', 'aⱼ', 'bⱼ  (P)', 'cⱼ  (P′)'],
  run: c => {
    const a = c.list('p'), x = c.n('x0'), n = a.length - 1; let y = a[0], z = y; const rows: Cell[][] = [[0, n, a[0], y, n > 0 ? z : null]];
    for (let j = 1; j <= n; j++) { y = x * y + a[j]; if (j < n) z = x * z + y; rows.push([j, n - j, a[j], y, j < n ? z : null]); }
    return { rows, msg: `P(${fmt(x)}) = ${fmt(y)}  |  P′(${fmt(x)}) = ${fmt(n > 0 ? z : 0)}` };
  } });
