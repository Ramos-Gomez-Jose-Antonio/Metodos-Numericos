"use strict";
mount({ title: 'Menú para Runge-Kutta de orden 2, 3 y 4', iter: false, fields: [...ODEF, { id: 'ord', label: 'orden (2, 3 o 4)', def: '4' }], cols: ODEC,
    run: c => {
        const k = Math.round(c.n('ord'));
        if (k < 2 || k > 4)
            throw new Error('El orden debe ser 2, 3 o 4.');
        const rk2 = (f, t, y, h) => y + h * f(t + h / 2, y + h / 2 * f(t, y));
        const rk3 = (f, t, y, h) => { const k1 = f(t, y), k2 = f(t + h / 2, y + h / 2 * k1), k3 = f(t + h, y - h * k1 + 2 * h * k2); return y + h / 6 * (k1 + 4 * k2 + k3); };
        return ode(c, one(k === 2 ? rk2 : k === 3 ? rk3 : rk4));
    } });
