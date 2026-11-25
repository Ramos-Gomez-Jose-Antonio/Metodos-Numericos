"use strict";
mount({ title: 'Menú para splines cúbicos (naturales)', iter: false, fields: [{ id: 'xs', label: 'x (nodos, crecientes)', def: '0, 1, 2, 3', wide: true }, { id: 'ys', label: 'y = f(x)', def: '0, 1, 8, 27', wide: true }, { id: 'xe', label: 'x a evaluar', def: '1.5' }],
    cols: ['j', 'xⱼ', 'aⱼ', 'bⱼ', 'cⱼ', 'dⱼ'],
    run: c => {
        const X = c.list('xs'), a = c.list('ys'), x = c.n('xe');
        check(X, a);
        const n = X.length - 1;
        if (X.some((v, i) => i > 0 && v <= X[i - 1]))
            throw new Error('Los nodos x deben estar en orden creciente.');
        const h = X.slice(1).map((v, i) => v - X[i]), mu = [0], z = [0], cc = Array(n + 1).fill(0), b = [], d = [];
        for (let i = 1; i < n; i++) {
            const al = 3 * (a[i + 1] - a[i]) / h[i] - 3 * (a[i] - a[i - 1]) / h[i - 1], l = 2 * (X[i + 1] - X[i - 1]) - h[i - 1] * mu[i - 1];
            mu[i] = h[i] / l;
            z[i] = (al - h[i - 1] * z[i - 1]) / l;
        }
        for (let j = n - 1; j >= 0; j--) {
            cc[j] = z[j] - mu[j] * cc[j + 1];
            b[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (cc[j + 1] + 2 * cc[j]) / 3;
            d[j] = (cc[j + 1] - cc[j]) / (3 * h[j]);
        }
        const rows = X.map((xj, j) => [j, xj, a[j], j < n ? b[j] : '', cc[j], j < n ? d[j] : '']);
        const k = X.findIndex((v, i) => i < n && x >= v && x <= X[i + 1]);
        if (k < 0)
            throw new Error(`x = ${fmt(x)} está fuera de [${fmt(X[0])}, ${fmt(X[n])}].`);
        const t = x - X[k], S = a[k] + b[k] * t + cc[k] * t * t + d[k] * t ** 3;
        return { rows, msg: `S(${fmt(x)}) = ${fmt(S)}   (tramo ${k}: [${fmt(X[k])}, ${fmt(X[k + 1])}], Sⱼ(x) = aⱼ + bⱼ(x−xⱼ) + cⱼ(x−xⱼ)² + dⱼ(x−xⱼ)³)` };
    } });
