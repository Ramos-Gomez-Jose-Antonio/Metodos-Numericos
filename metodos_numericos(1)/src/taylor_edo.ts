mount({ title: 'Menú para método de Taylor (EDO)', iter: false, fields: [...ODEF, { id: 'ord', label: 'orden (1–4)', def: '3', hint: 'Las derivadas de f se calculan numéricamente' }], cols: ODEC,
  run: c => {
    const k = Math.round(c.n('ord')); if (k < 1 || k > 4) throw new Error('El orden debe estar entre 1 y 4.');
    return ode(c, one((f, t, y, h) => {
      const e = 5e-3, D = (g: F2): F2 => (s, u) => (g(s + e, u) - g(s - e, u)) / (2 * e) + (g(s, u + e) - g(s, u - e)) / (2 * e) * f(s, u);
      let g: F2 = f, s = 0, fk = 1; for (let j = 0; j < k; j++) { fk *= j + 1; s += h ** (j + 1) / fk * g(t, y); g = D(g); }
      return y + s;
    }));
  } });
