"use strict";
mount({ title: 'Menú para multipaso implícito Adams-Moulton', iter: false, fields: [...ODEF, { id: 'ord', label: 'pasos k (1–3)', def: '3', hint: 'Predictor Adams-Bashforth + corrector implícito (iterado)' }], cols: ODEC, run: c => multi(c, true) });
