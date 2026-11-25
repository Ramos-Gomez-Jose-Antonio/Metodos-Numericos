"use strict";
mount({ title: 'Menú para método de Newton-Raphson',
    fields: [FX, { id: 'dfx', label: 'f′(x) (opcional)', def: '3*x^2 - 1', wide: true, hint: 'Déjalo vacío para usar derivada numérica' }, { id: 'x0', label: 'x₀', def: '1.5' }],
    cols: ['i', 'xᵢ', 'f(xᵢ)', 'f′(xᵢ)', 'xᵢ₊₁', 'error'],
    run: c => {
        const f = c.fn('fx'), h = 1e-6, df = c.raw('dfx').trim() ? c.fn('dfx') : (t) => (f(t + h) - f(t - h)) / (2 * h);
        let x = c.n('x0'), xn = x, ok = false;
        const rows = [];
        for (let i = 1; i <= c.max; i++) {
            const fx = f(x), d = df(x);
            if (d === 0)
                throw new Error(`f′(${fmt(x)}) = 0: no se puede continuar. Cambia x₀.`);
            xn = x - fx / d;
            const e = Math.abs(xn - x);
            rows.push([i, x, fx, d, xn, e]);
            x = xn;
            if (e < c.tol) {
                ok = true;
                break;
            }
        }
        return { rows, ok, msg: summary(f, xn, ok, rows.length, c.max) };
    } });
