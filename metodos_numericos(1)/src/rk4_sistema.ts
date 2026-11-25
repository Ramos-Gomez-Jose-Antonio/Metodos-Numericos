mount({ title: 'Menú para Runge-Kutta 4 en EDO de orden N', iter: false,
  fields: [{ id: 'eqs', label: 'yᵢ′ = fᵢ(t, y₁, …, yₙ)', def: 'y2; -y1', wide: true, hint: 'Una ecuación por variable, separadas por “;”. Ej: y″ + y = 0  →  y1′ = y2 ; y2′ = −y1' },
    { id: 'y0', label: 'condiciones iniciales y₁(t₀), y₂(t₀), …', def: '1, 0', wide: true }, { id: 'a', label: 't₀', def: '0' }, { id: 'b', label: 'b', def: '2*pi' }, { id: 'N', label: 'pasos N', def: '20' }],
  cols: [],
  run: c => {
    const E = c.raw('eqs').split(';'), v = ['t', ...E.map((_, i) => 'y' + (i + 1))], F = E.map(e => parseFn(e, v)), y0 = c.list('y0');
    if (y0.length !== E.length) throw new Error('Debe haber una condición inicial por ecuación.');
    const a = c.n('a'), b = c.n('b'), N = Math.floor(c.n('N')), h = (b - a) / N; let y = y0.slice();
    const ev = (t: number, u: number[]) => F.map(g => g(t, ...u)), ad = (u: number[], k: number[], s: number) => u.map((q, i) => q + s * k[i]);
    const rows: Cell[][] = [[0, a, ...y]];
    for (let i = 0; i < N; i++) {
      const t = a + i * h, k1 = ev(t, y), k2 = ev(t + h / 2, ad(y, k1, h / 2)), k3 = ev(t + h / 2, ad(y, k2, h / 2)), k4 = ev(t + h, ad(y, k3, h));
      y = y.map((q, j) => q + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); rows.push([i + 1, a + (i + 1) * h, ...y]);
    }
    return { rows, cols: ['i', 'tᵢ', ...v.slice(1).map(s => s + '(tᵢ)')], msg: `y(${fmt(b)}) ≈ [${y.map(fmt).join(', ')}]` };
  } });
