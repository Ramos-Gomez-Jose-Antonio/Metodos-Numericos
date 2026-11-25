mount({ title: 'Menú para series de Maclaurin', iter: false, fields: [FS, { id: 'n', label: 'grado n (0–8)', def: '7' }, { id: 'xe', label: 'x a evaluar', def: '1' }],
  cols: TAYC, run: c => taylor(c, 0) });
