mount({ title: 'Menú para polinomios de Lagrange', iter: false, fields: [{ id: 'xs', label: 'x (nodos)', def: '1, 2, 4, 5', wide: true }, { id: 'ys', label: 'y = f(x)', def: '1, 4, 16, 25', wide: true }, { id: 'xe', label: 'x a evaluar', def: '3' }],
  cols: ['i', 'xᵢ', 'yᵢ', 'Lᵢ(x)', 'yᵢ·Lᵢ(x)'],
  run: c => {
    const X = c.list('xs'), Y = c.list('ys'), x = c.n('xe'); check(X, Y); let P = 0; const rows: Cell[][] = [];
    X.forEach((xi, i) => { let L = 1; X.forEach((xj, j) => { if (j !== i) L *= (x - xj) / (xi - xj); }); P += Y[i] * L; rows.push([i, xi, Y[i], L, Y[i] * L]); });
    return { rows, msg: `P(${fmt(x)}) = ${fmt(P)}` };
  } });
