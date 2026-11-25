"use strict";
mount({ title: 'Menú para diferencias divididas (Newton)', iter: false, fields: [{ id: 'xs', label: 'x (nodos)', def: '1, 2, 4, 5', wide: true }, { id: 'ys', label: 'y = f(x)', def: '1, 4, 16, 25', wide: true }, { id: 'xe', label: 'x a evaluar', def: '3' }], cols: [],
    run: c => {
        const X = c.list('xs'), Y = c.list('ys'), x = c.n('xe');
        check(X, Y);
        const Q = dd(X, Y);
        return { rows: tri(X, Q), cols: triCols(X.length), msg: `P(x) = ${newtonStr(X, Q)}   |   P(${fmt(x)}) = ${fmt(newtonEval(X, Q, x))}` };
    } });
