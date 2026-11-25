"use strict";
mount({ title: 'Menú para método de Punto Fijo',
    fields: [{ id: 'gx', label: 'g(x)  (despeje de x = g(x))', def: '(x+2)^(1/3)', wide: true, hint: 'Para x³ − x − 2 = 0 puedes usar g(x) = (x+2)^(1/3)' }, { id: 'x0', label: 'x₀', def: '1.5' }],
    cols: ['i', 'xᵢ', 'g(xᵢ)', 'error'],
    run: c => {
        const g = c.fn('gx');
        let x = c.n('x0'), ok = false;
        const rows = [];
        for (let i = 1; i <= c.max; i++) {
            const gx = g(x), e = Math.abs(gx - x);
            rows.push([i, x, gx, e]);
            x = gx;
            if (e < c.tol) {
                ok = true;
                break;
            }
        }
        return { rows, ok, msg: summary(t => g(t) - t, x, ok, rows.length, c.max, 'g(x) − x') };
    } });
