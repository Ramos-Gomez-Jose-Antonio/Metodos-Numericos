"use strict";
mount({ title: 'Menú para extrapolación de Romberg', fields: QF.slice(0, 3), cols: [],
    run: c => { const f = c.fn('fx'), a = c.n('a'), b = c.n('b'); return rich(c, i => { const n = 2 ** i, h = (b - a) / n; let s = (f(a) + f(b)) / 2; for (let k = 1; k < n; k++)
        s += f(a + k * h); return [h, h * s]; }, 'I'); } });
