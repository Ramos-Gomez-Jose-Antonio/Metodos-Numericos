mount({ title: 'Menú para cuadratura Gaussiana compuesta', iter: false, fields: [...QF.slice(0, 3), { id: 'n', label: 'puntos por tramo n', def: '3' }, { id: 'm', label: 'subintervalos m', def: '4' }], cols: ['k', 'aₖ', 'bₖ', 'Iₖ (Gauss)'],
  run: c => {
    const f = c.fn('fx'), a = c.n('a'), b = c.n('b'), n = Math.floor(c.n('n')), m = Math.floor(c.n('m')), h = (b - a) / m; let I = 0;
    if (!(n >= 1 && n <= 40 && m >= 1)) throw new Error('n entre 1 y 40, m ≥ 1.');
    const rows: Cell[][] = Array.from({ length: m }, (_, k) => { const v = gl(f, a + k * h, a + (k + 1) * h, n); I += v; return [k + 1, a + k * h, a + (k + 1) * h, v]; });
    return { rows, msg: `I ≈ ${fmt(I)}` };
  } });
