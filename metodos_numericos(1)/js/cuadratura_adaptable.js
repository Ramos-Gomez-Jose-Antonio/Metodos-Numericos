"use strict";
mount({ title: 'Menú para cuadratura adaptable (Simpson)', fields: QF.slice(0, 3), cols: ['i', 'a', 'b', 'S(a,b)', 'S(a,m)+S(m,b)', '|error est.|', 'tol local', 'estado'],
    run: c => {
        const f = c.fn('fx'), a = c.n('a'), b = c.n('b'), rows = [];
        let I = 0, ok = true;
        const S = (p, q, fp, fm, fq) => (q - p) / 6 * (fp + 4 * fm + fq);
        const rec = (p, q, fp, fm, fq, whole, tol) => {
            const m = (p + q) / 2, lm = f((p + m) / 2), rm = f((m + q) / 2), L = S(p, m, fp, lm, fm), R = S(m, q, fm, rm, fq), d = (L + R - whole) / 15;
            const acc = Math.abs(d) <= tol || rows.length >= c.max;
            rows.push([rows.length + 1, p, q, whole, L + R, Math.abs(d), tol, acc ? 'acepta' : 'divide']);
            if (acc) {
                I += L + R + d;
                if (Math.abs(d) > tol)
                    ok = false;
            }
            else {
                rec(p, m, fp, lm, fm, L, tol / 2);
                rec(m, q, fm, rm, fq, R, tol / 2);
            }
        };
        const fa = f(a), fb = f(b), fm = f((a + b) / 2);
        rec(a, b, fa, fm, fb, S(a, b, fa, fm, fb), c.tol);
        return { rows, ok, msg: (ok ? '' : 'Se alcanzó el máximo de intervalos sin cumplir el error. ') + `I ≈ ${fmt(I)}  |  intervalos evaluados: ${rows.length}` };
    } });
