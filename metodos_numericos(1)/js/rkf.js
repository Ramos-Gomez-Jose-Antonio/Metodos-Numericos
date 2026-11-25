"use strict";
mount({ title: 'Menú para Runge-Kutta-Fehlberg (RKF45)',
    fields: [ODEF[0], ODEF[1], ODEF[2], ODEF[3], { id: 'hmax', label: 'h máx', def: '0.25' }, { id: 'hmin', label: 'h mín', def: '0.01' }], cols: ['i', 'tᵢ', 'wᵢ', 'hᵢ', 'R (error est.)'],
    run: c => {
        const f = c.fn('f', ['t', 'y']), a = c.n('a'), b = c.n('b'), hM = c.n('hmax'), hm = c.n('hmin');
        let t = a, w = c.n('y0'), h = hM, ok = true;
        const rows = [[0, t, w, null, null]];
        while (t < b && rows.length <= c.max) {
            const k1 = h * f(t, w), k2 = h * f(t + h / 4, w + k1 / 4), k3 = h * f(t + 3 * h / 8, w + 3 * k1 / 32 + 9 * k2 / 32);
            const k4 = h * f(t + 12 * h / 13, w + 1932 * k1 / 2197 - 7200 * k2 / 2197 + 7296 * k3 / 2197), k5 = h * f(t + h, w + 439 * k1 / 216 - 8 * k2 + 3680 * k3 / 513 - 845 * k4 / 4104);
            const k6 = h * f(t + h / 2, w - 8 * k1 / 27 + 2 * k2 - 3544 * k3 / 2565 + 1859 * k4 / 4104 - 11 * k5 / 40), R = Math.abs(k1 / 360 - 128 * k3 / 4275 - 2197 * k4 / 75240 + k5 / 50 + 2 * k6 / 55) / h;
            if (R <= c.tol) {
                t += h;
                w += 25 * k1 / 216 + 1408 * k3 / 2565 + 2197 * k4 / 4104 - k5 / 5;
                rows.push([rows.length, t, w, h, R]);
            }
            h = Math.min(h * (R === 0 ? 4 : Math.min(4, Math.max(.1, .84 * (c.tol / R) ** .25))), hM);
            if (t + h > b)
                h = b - t;
            if (h < hm && b - t > 1e-12) {
                ok = false;
                break;
            }
        }
        if (t < b - 1e-12)
            ok = false;
        return { rows, ok, msg: (ok ? '' : 'No se llegó a b (h bajó de h mín o se agotaron los pasos). ') + `w(${fmt(t)}) ≈ ${fmt(w)}  |  pasos aceptados: ${rows.length - 1}` };
    } });
