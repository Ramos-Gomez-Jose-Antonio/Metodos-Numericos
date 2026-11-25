mount({ title: 'Menú para extrapolación de Richardson (derivada)', fields: [FS, { id: 'x0', label: 'x₀', def: '1' }, { id: 'h', label: 'h inicial', def: '0.5' }],
  cols: [], run: c => { const f = c.fn('fx'), x = c.n('x0'), h0 = c.n('h'); return rich(c, i => { const h = h0 / 2 ** i; return [h, (f(x + h) - f(x - h)) / (2 * h)]; }, 'f′(x₀)'); } });
