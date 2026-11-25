mount({ title: 'Menú para método de Deflación',
  fields: [{ id: 'p', label: 'coeficientes (mayor a menor grado)', def: '1, -6, 11, -6', wide: true, hint: 'Newton + Horner para cada raíz y luego se reduce el polinomio. Solo raíces reales.' }, { id: 'x0', label: 'x₀ inicial', def: '0' }],
  cols: ['k', 'raíz', 'iteraciones', 'P(raíz)', 'grado restante'],
  run: c => {
    const orig = c.list('p'); let a = orig.slice(), k = 0, bad = false; const x0 = c.n('x0'), rows: Cell[][] = [];
    while (a.length > 1) {
      let x = x0, e = 1, it = 0;
      for (; it < c.max && e >= c.tol; it++) { const [p, d] = horner(a, x); if (d === 0) break; const xn = x - p / d; e = Math.abs(xn - x); x = xn; }
      if (e >= c.tol) { bad = true; break; }
      k++; rows.push([k, x, it, horner(orig, x)[0], a.length - 2]); a = deflate(a, x);
    }
    return { rows, ok: !bad, msg: bad ? `Raíces reales halladas: ${k}. El polinomio restante [${a.map(fmt).join(', ')}] no converge (¿raíces complejas?). Prueba otro x₀.` : `Se encontraron las ${k} raíces reales.` };
  } });
