mount({ title: 'Menú para método de Falsa Posición', fields: [FX, { id: 'a', label: 'a', def: '1' }, { id: 'b', label: 'b', def: '2' }],
  cols: ['i', 'a', 'b', 'c', 'f(a)', 'f(b)', 'f(c)', 'error'], run: c => bracket(c, (a, b, fa, fb) => (a * fb - b * fa) / (fb - fa)) });
