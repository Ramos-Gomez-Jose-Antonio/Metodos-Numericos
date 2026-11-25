"use strict";
mount({ title: 'Menú para Simpson 1/3 y 3/8', iter: false, fields: [...QF.slice(0, 3), { ...QF[3], hint: 'Par para 1/3, múltiplo de 3 para 3/8 (usa 6, 12, …)' }], cols: ['i', 'xᵢ', 'f(xᵢ)', 'peso 1/3', 'peso 3/8'],
    run: c => {
        const f = c.fn('fx'), a = c.n('a'), b = c.n('b'), n = Math.floor(c.n('n')), h = (b - a) / n, p = qw('s13', n), q = qw('s38', n);
        let I1 = 0, I2 = 0;
        if (!p && !q)
            throw new Error('n debe ser par (1/3) o múltiplo de 3 (3/8).');
        const rows = Array.from({ length: n + 1 }, (_, i) => { const x = a + i * h, fx = f(x); I1 += (p ? p[i] : 0) * fx; I2 += (q ? q[i] : 0) * fx; return [i, x, fx, p ? p[i] : '—', q ? q[i] : '—']; });
        return { rows, msg: `Simpson 1/3: ${p ? fmt(h * I1) : 'n debe ser par'}  |  Simpson 3/8: ${q ? fmt(h * I2) : 'n debe ser múltiplo de 3'}` };
    } });
