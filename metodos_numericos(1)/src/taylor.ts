mount({ title: 'Menú para series de Taylor', iter: false, fields: [FS, { id: 'x0', label: 'x₀ (centro)', def: '1' }, { id: 'n', label: 'grado n (0–8)', def: '5' }, { id: 'xe', label: 'x a evaluar', def: '1.5' }],
  cols: TAYC, run: c => taylor(c, c.n('x0')) });
