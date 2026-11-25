"use strict";
mount({ title: 'Menú para método de Euler', iter: false, fields: ODEF, cols: ODEC, run: c => ode(c, one((f, t, y, h) => y + h * f(t, y))) });
