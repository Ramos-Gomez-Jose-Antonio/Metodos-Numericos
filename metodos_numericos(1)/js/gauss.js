"use strict";
mount({ title: 'Menú para cuadratura Gaussiana (Legendre)', iter: false, fields: [...QF.slice(0, 3), { id: 'n', label: 'puntos n (≥1)', def: '3' }], cols: ['i', 'tᵢ', 'wᵢ', 'xᵢ', 'f(xᵢ)', 'wᵢ·f(xᵢ)'],
    run: c => {
        const f = c.fn('fx'), a = c.n('a'), b = c.n('b'), n = Math.floor(c.n('n')), [t, w] = gauss(n), h = (b - a) / 2;
        let I = 0;
        if (!(n >= 1 && n <= 40))
            throw new Error('n debe estar entre 1 y 40.');
        const rows = t.map((ti, i) => { const x = h * ti + (a + b) / 2, fx = f(x); I += w[i] * fx; return [i + 1, ti, w[i], x, fx, w[i] * fx]; });
        return { rows, msg: `I ≈ ${fmt(h * I)}  =  (b−a)/2 · Σ wᵢ f(xᵢ)` };
    } });
