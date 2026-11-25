"use strict";
mount({ title: 'Menú para polinomio interpolante de Hermite', iter: false,
    fields: [{ id: 'xs', label: 'x (nodos)', def: '0, 1, 2', wide: true }, { id: 'ys', label: 'f(x)', def: '0, 1, 8', wide: true }, { id: 'ds', label: "f′(x)", def: '0, 3, 12', wide: true }, { id: 'xe', label: 'x a evaluar', def: '1.5' }],
    cols: [],
    run: c => {
        const X = c.list('xs'), Y = c.list('ys'), D = c.list('ds'), x = c.n('xe');
        check(X, Y);
        if (D.length !== X.length)
            throw new Error('f′(x) debe tener un valor por cada nodo.');
        const z = X.flatMap(v => [v, v]), y = Y.flatMap(v => [v, v]), Q = dd(z, y, i => D[i >> 1]);
        return { rows: tri(z, Q), cols: triCols(z.length, 'zᵢ'), msg: `H(x) = ${newtonStr(z, Q)}   |   H(${fmt(x)}) = ${fmt(newtonEval(z, Q, x))}` };
    } });
