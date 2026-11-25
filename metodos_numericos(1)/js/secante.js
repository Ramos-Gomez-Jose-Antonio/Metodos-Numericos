"use strict";
mount({ title: 'Menú para método de la Secante', fields: [FX, { id: 'x0', label: 'x₀', def: '1' }, { id: 'x1', label: 'x₁', def: '2' }],
    cols: ['i', 'xᵢ₋₁', 'xᵢ', 'xᵢ₊₁', 'f(xᵢ₋₁)', 'f(xᵢ)', 'error'],
    run: c => {
        const f = c.fn('fx');
        let x0 = c.n('x0'), x1 = c.n('x1'), x2 = x1, ok = false;
        const rows = [];
        for (let i = 1; i <= c.max; i++) {
            const f0 = f(x0), f1 = f(x1);
            if (f1 === f0)
                throw new Error('f(xᵢ) = f(xᵢ₋₁): división entre cero. Cambia x₀ o x₁.');
            x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
            const e = Math.abs(x2 - x1);
            rows.push([i, x0, x1, x2, f0, f1, e]);
            if (e < c.tol) {
                ok = true;
                break;
            }
            x0 = x1;
            x1 = x2;
        }
        return { rows, ok, msg: summary(f, x2, ok, rows.length, c.max) };
    } });
