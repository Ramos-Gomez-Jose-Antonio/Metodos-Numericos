"use strict";
const FN = { sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan', sqrt: 'Math.sqrt', exp: 'Math.exp', ln: 'Math.log', log: 'Math.log10', abs: 'Math.abs', pi: 'Math.PI', e: 'Math.E', x: 'x' };
const FX = { id: 'fx', label: 'f(x)', def: 'x^3 - x - 2', wide: true, hint: 'Usa x, + − * / ^ y sin, cos, tan, sqrt, exp, ln, log, abs, pi, e. Ej: 2*x^2 - cos(x)' };
// Convierte texto del usuario en una función de x
function parseFn(src) {
    const s = src.trim().replace(/\^/g, '**');
    if (!s)
        throw new Error('Hay un campo vacío.');
    const js = s.replace(/\d+\.?\d*(?:e[+-]?\d+)?|[A-Za-z_]+/gi, (m) => {
        if (/^\d/.test(m))
            return m;
        const k = m.toLowerCase();
        if (!(k in FN))
            throw new Error('Símbolo no reconocido: "' + m + '"');
        return FN[k];
    });
    if (/[^0-9a-zA-Z_+\-*\/().,\s]/.test(js))
        throw new Error('Caracteres no permitidos en: ' + src);
    let f;
    try {
        f = new Function('x', 'return (' + js + ');');
    }
    catch {
        throw new Error('Expresión inválida: ' + src);
    }
    return (x) => { const v = f(x); if (!isFinite(v))
        throw new Error('f no está definida en x = ' + x); return v; };
}
function fmt(v) {
    if (v === null || v === undefined)
        return '—';
    if (typeof v === 'string')
        return v;
    return v !== 0 && Math.abs(v) < 1e-4 ? v.toExponential(4) : String(+v.toFixed(8));
}
function summary(f, x, ok, n, max, lab = 'f(raíz)') {
    return (ok ? 'Raíz aproximada = ' : `No se alcanzó el error máx. en ${max} iteraciones. Última aproximación = `) + fmt(x) + `  |  ${lab} = ${fmt(f(x))}  |  iteraciones: ${n}`;
}
// Intervalos: Bisección y Falsa Posición comparten el ciclo
function bracket(c, pt) {
    const f = c.fn('fx');
    let a = c.n('a'), b = c.n('b'), fa = f(a), fb = f(b), x = a, xp = null, ok = false;
    const rows = [];
    if (a >= b)
        throw new Error('Se requiere a < b.');
    if (fa * fb > 0)
        throw new Error('f(a) y f(b) deben tener signo opuesto.');
    for (let i = 1; i <= c.max; i++) {
        x = pt(a, b, fa, fb);
        const fc = f(x), e = xp === null ? null : Math.abs(x - xp);
        rows.push([i, a, b, x, fa, fb, fc, e]);
        if (fc === 0 || (e !== null && e < c.tol)) {
            ok = true;
            break;
        }
        if (fa * fc < 0) {
            b = x;
            fb = fc;
        }
        else {
            a = x;
            fa = fc;
        }
        xp = x;
    }
    return { rows, ok, msg: summary(f, x, ok, rows.length, c.max) };
}
// Polinomios (coeficientes de mayor a menor grado)
function horner(a, x) {
    let y = a[0], z = 0;
    for (let j = 1; j < a.length; j++) {
        z = z * x + y;
        y = y * x + a[j];
    }
    return [y, z];
}
function deflate(a, r) {
    const b = [a[0]];
    for (let j = 1; j < a.length - 1; j++)
        b.push(a[j] + r * b[j - 1]);
    return b;
}
// Interpolación
function check(X, Y) {
    if (X.length < 2 || X.length !== Y.length)
        throw new Error('Se necesitan al menos 2 nodos y la misma cantidad de x e y.');
    if (new Set(X).size !== X.length)
        throw new Error('Los valores de x deben ser distintos.');
}
function dd(z, y, d) {
    const Q = z.map((_, i) => [y[i]]);
    for (let j = 1; j < z.length; j++)
        for (let i = j; i < z.length; i++)
            Q[i][j] = (j === 1 && d && z[i] === z[i - 1]) ? d(i) : (Q[i][j - 1] - Q[i - 1][j - 1]) / (z[i] - z[i - j]);
    return Q;
}
function newtonEval(z, Q, x) {
    let p = 0, m = 1;
    Q.forEach((q, i) => { p += q[i] * m; m *= x - z[i]; });
    return p;
}
function newtonStr(z, Q) {
    return Q.map((q, i) => fmt(q[i]) + z.slice(0, i).map(v => `(x − ${fmt(v)})`).join('')).join('  +  ');
}
function tri(z, Q) {
    return Q.map((q, i) => [i, z[i], ...q, ...Array(Q.length - 1 - i).fill('')]);
}
function triCols(m, z = 'xᵢ') {
    return ['i', z, ...Array.from({ length: m }, (_, j) => 'orden ' + j)];
}
const STYLE = `:root{--bg:#121417;--panel:#171a1e;--line:#3a3f47;--chalk:#f2efe6;--dim:#9a9fa8;--acc:#8fd0ee}*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;color:var(--chalk);font:15px/1.5 Inter,system-ui,sans-serif;background:var(--bg) linear-gradient(#ffffff08 1px,transparent 1px) 0 0/28px 28px,linear-gradient(90deg,#ffffff08 1px,transparent 1px) 0 0/28px 28px}
.card{width:min(960px,100%);background:var(--panel);border:2px solid var(--chalk);border-radius:6px;padding:28px 32px}
h1{font:400 1.9rem 'Patrick Hand',cursive;margin:0 0 20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px 22px}.full{grid-column:1/-1}
label{display:flex;flex-direction:column;gap:5px;font:400 1.15rem 'Patrick Hand',cursive}
input{background:var(--bg);border:1.5px solid var(--chalk);border-radius:3px;padding:9px 11px;color:var(--chalk);font:15px Inter,sans-serif}
input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
button{font:400 1.2rem 'Patrick Hand',cursive;background:transparent;color:var(--chalk);border:2px solid var(--chalk);border-radius:4px;padding:6px 22px;cursor:pointer}
button.main{border-color:var(--acc);color:var(--acc)}button:hover{background:#ffffff14}
.bar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px}.bar a{color:var(--dim)}
.tw{overflow-x:auto;margin-top:18px;border:2px solid var(--chalk);border-radius:4px}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th{font:400 1.1rem 'Patrick Hand',cursive;text-align:center;border-bottom:2px solid var(--chalk)}
th,td{padding:7px 12px;border-right:1.5px solid var(--line);border-bottom:1.5px solid var(--line);text-align:right;white-space:nowrap}
th:last-child,td:last-child{border-right:0}tr:last-child td{border-bottom:0}td:first-child{text-align:center;color:var(--dim)}
tbody:empty::after{content:"Escribe tus datos y pulsa Calcular";display:block;padding:14px;color:var(--dim)}
.msg{margin-top:14px;padding:10px 14px;border-radius:4px;border:1.5px solid;overflow-wrap:anywhere}.msg:empty{display:none}.ok{border-color:#7ee2a0;color:#7ee2a0}.err{border-color:#ff8a9b;color:#ff8a9b}.hint{color:var(--dim);font:12.5px Inter,sans-serif}`;
function mount(cfg) {
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Inter:wght@400;600&display=swap';
    const st = document.createElement('style');
    st.textContent = STYLE;
    document.head.append(fonts, st);
    document.title = cfg.title;
    const iter = cfg.iter !== false;
    const field = (f) => `<label class="${f.wide ? 'full' : ''}">${f.label} =<input id="${f.id}" value="${f.def}" spellcheck="false" autocomplete="off">${f.hint ? `<span class="hint">${f.hint}</span>` : ''}</label>`;
    document.body.innerHTML = `<main class="card"><h1>${cfg.title}</h1><div class="grid">${cfg.fields.map(field).join('')}${iter ? '<label>error máx =<input id="tol" value="0.0001"></label><label>número máx. iteraciones =<input id="max" value="50"></label>' : ''}</div>
<div class="bar"><button class="main" id="calc">Calcular</button><a href="index.html">Menú de métodos</a></div><div id="msg" class="msg"></div>
<div class="tw"><table><thead id="head"></thead><tbody id="out"></tbody></table></div><div class="bar"><span></span><button id="close">Cerrar</button></div></main>`;
    const $ = (id) => document.getElementById(id);
    const val = (id) => document.getElementById(id).value;
    const head = (cols) => { $('head').innerHTML = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>'; };
    head(cfg.cols);
    const ctx = {
        n: id => parseFn(val(id))(0), fn: id => parseFn(val(id)), raw: val, tol: 0, max: 0,
        list: id => val(id).split(/[\s,;]+/).filter(Boolean).map(s => parseFn(s)(0)),
    };
    $('calc').onclick = () => {
        var _a;
        const msg = $('msg');
        $('out').innerHTML = '';
        msg.className = 'msg';
        msg.textContent = '';
        try {
            if (iter) {
                ctx.tol = ctx.n('tol');
                ctx.max = Math.floor(ctx.n('max'));
                if (!(ctx.tol > 0) || !(ctx.max >= 1))
                    throw new Error('El error máx. y las iteraciones deben ser positivos.');
            }
            const r = cfg.run(ctx);
            head((_a = r.cols) !== null && _a !== void 0 ? _a : cfg.cols);
            $('out').innerHTML = r.rows.map(w => '<tr>' + w.map((c, i) => `<td>${i === 0 ? c : fmt(c)}</td>`).join('') + '</tr>').join('');
            msg.className = 'msg ' + (r.ok === false ? 'err' : 'ok');
            msg.textContent = r.msg;
        }
        catch (e) {
            msg.className = 'msg err';
            msg.textContent = e.message;
        }
    };
    $('close').onclick = () => { window.close(); if (history.length > 1)
        history.back(); };
}
