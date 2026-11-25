mount({ title: 'Menú para interpolación de Neville', iter: false, fields: [{ id: 'xs', label: 'x (nodos)', def: '1, 2, 4, 5', wide: true }, { id: 'ys', label: 'y = f(x)', def: '1, 4, 16, 25', wide: true }, { id: 'xe', label: 'x a evaluar', def: '3' }], cols: [],
  run: c => {
    const X = c.list('xs'), Y = c.list('ys'), x = c.n('xe'); check(X, Y); const Q: number[][] = Y.map(y => [y]);
    for (let i = 1; i < X.length; i++) for (let j = 1; j <= i; j++) Q[i][j] = ((x - X[i - j]) * Q[i][j - 1] - (x - X[i]) * Q[i - 1][j - 1]) / (X[i] - X[i - j]);
    return { rows: tri(X, Q), cols: triCols(X.length), msg: `P(${fmt(x)}) = ${fmt(Q[X.length - 1][X.length - 1])}` };
  } });
