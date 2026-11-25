type Cell = number | string | null;
interface Res { rows: Cell[][]; msg: string; ok?: boolean; cols?: string[] }
interface Ctx { n(id: string): number; fn(id: string, v?: string[]): (...a: number[]) => number; list(id: string): number[]; raw(id: string): string; tol: number; max: number }
interface Field { id: string; label: string; def: string; hint?: string; wide?: boolean }
interface Cfg { title: string; fields: Field[]; cols: string[]; iter?: boolean; run(c: Ctx): Res }

const FN: Record<string, string> = { sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan', sqrt: 'Math.sqrt', exp: 'Math.exp', ln: 'Math.log', log: 'Math.log10', abs: 'Math.abs', pi: 'Math.PI', e: 'Math.E' };
const FX: Field = { id: 'fx', label: 'f(x)', def: 'x^3 - x - 2', wide: true, hint: 'Usa x, + − * / ^ y sin, cos, tan, sqrt, exp, ln, log, abs, pi, e. Ej: 2*x^2 - cos(x)' };

// Convierte texto del usuario en una función de x
function parseFn(src: string, vars: string[] = ['x']): (...a: number[]) => number {
  const s = src.trim().replace(/\^/g, '**');
  if (!s) throw new Error('Hay un campo vacío.');
  const js = s.replace(/\d+\.?\d*(?:e[+-]?\d+)?|[A-Za-z_]\w*/gi, (m: string) => {
    if (/^\d/.test(m)) return m;
    const k = m.toLowerCase();
    if (vars.includes(k)) return k;
    if (!(k in FN)) throw new Error('Símbolo no reconocido: "' + m + '"');
    return FN[k];
  });
  if (/[^0-9a-zA-Z_+\-*\/().,\s]/.test(js)) throw new Error('Caracteres no permitidos en: ' + src);
  let f: (...a: number[]) => number;
  try { f = new Function(...vars, 'return (' + js + ');') as (...a: number[]) => number; } catch { throw new Error('Expresión inválida: ' + src); }
  return (...a: number[]) => { const v = f(...a); if (!isFinite(v)) throw new Error('La función no está definida en ' + a.join(', ')); return v; };
}
function fmt(v: Cell): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v;
  return v !== 0 && Math.abs(v) < 1e-4 ? v.toExponential(4) : String(+v.toFixed(8));
}
function summary(f: (x: number) => number, x: number, ok: boolean, n: number, max: number, lab = 'f(raíz)'): string {
  return (ok ? 'Raíz aproximada = ' : `No se alcanzó el error máx. en ${max} iteraciones. Última aproximación = `) + fmt(x) + `  |  ${lab} = ${fmt(f(x))}  |  iteraciones: ${n}`;
}
// Intervalos: Bisección y Falsa Posición comparten el ciclo
function bracket(c: Ctx, pt: (a: number, b: number, fa: number, fb: number) => number): Res {
  const f = c.fn('fx'); let a = c.n('a'), b = c.n('b'), fa = f(a), fb = f(b), x = a, xp: number | null = null, ok = false;
  const rows: Cell[][] = [];
  if (a >= b) throw new Error('Se requiere a < b.');
  if (fa * fb > 0) throw new Error('f(a) y f(b) deben tener signo opuesto.');
  for (let i = 1; i <= c.max; i++) {
    x = pt(a, b, fa, fb); const fc = f(x), e = xp === null ? null : Math.abs(x - xp);
    rows.push([i, a, b, x, fa, fb, fc, e]);
    if (fc === 0 || (e !== null && e < c.tol)) { ok = true; break; }
    if (fa * fc < 0) { b = x; fb = fc; } else { a = x; fa = fc; }
    xp = x;
  }
  return { rows, ok, msg: summary(f, x, ok, rows.length, c.max) };
}
// Polinomios (coeficientes de mayor a menor grado)
function horner(a: number[], x: number): [number, number] {
  let y = a[0], z = 0;
  for (let j = 1; j < a.length; j++) { z = z * x + y; y = y * x + a[j]; }
  return [y, z];
}
function deflate(a: number[], r: number): number[] {
  const b = [a[0]]; for (let j = 1; j < a.length - 1; j++) b.push(a[j] + r * b[j - 1]); return b;
}
// Interpolación
function check(X: number[], Y: number[]): void {
  if (X.length < 2 || X.length !== Y.length) throw new Error('Se necesitan al menos 2 nodos y la misma cantidad de x e y.');
  if (new Set(X).size !== X.length) throw new Error('Los valores de x deben ser distintos.');
}
function dd(z: number[], y: number[], d?: (i: number) => number): number[][] {
  const Q: number[][] = z.map((_, i) => [y[i]]);
  for (let j = 1; j < z.length; j++) for (let i = j; i < z.length; i++)
    Q[i][j] = (j === 1 && d && z[i] === z[i - 1]) ? d(i) : (Q[i][j - 1] - Q[i - 1][j - 1]) / (z[i] - z[i - j]);
  return Q;
}
function newtonEval(z: number[], Q: number[][], x: number): number {
  let p = 0, m = 1; Q.forEach((q, i) => { p += q[i] * m; m *= x - z[i]; }); return p;
}
function newtonStr(z: number[], Q: number[][]): string {
  return Q.map((q, i) => fmt(q[i]) + z.slice(0, i).map(v => `(x − ${fmt(v)})`).join('')).join('  +  ');
}
function tri(z: number[], Q: number[][]): Cell[][] {
  return Q.map((q, i) => [i, z[i], ...q, ...Array<Cell>(Q.length - 1 - i).fill('')]);
}
function triCols(m: number, z = 'xᵢ'): string[] {
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

function mount(cfg: Cfg): void {
  const fonts = document.createElement('link'); fonts.rel = 'stylesheet'; fonts.href = 'https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Inter:wght@400;600&display=swap';
  const st = document.createElement('style'); st.textContent = STYLE; document.head.append(fonts, st);
  document.title = cfg.title;
  const iter = cfg.iter !== false;
  const field = (f: Field) => `<label class="${f.wide ? 'full' : ''}">${f.label} =<input id="${f.id}" value="${f.def}" spellcheck="false" autocomplete="off">${f.hint ? `<span class="hint">${f.hint}</span>` : ''}</label>`;
  document.body.innerHTML = `<main class="card"><h1>${cfg.title}</h1><div class="grid">${cfg.fields.map(field).join('')}${iter ? '<label>error máx =<input id="tol" value="0.0001"></label><label>número máx. iteraciones =<input id="max" value="50"></label>' : ''}</div>
<div class="bar"><button class="main" id="calc">Calcular</button><a href="index.html">Menú de métodos</a></div><div id="msg" class="msg"></div>
<div class="tw"><table><thead id="head"></thead><tbody id="out"></tbody></table></div><div class="bar"><span></span><button id="close">Cerrar</button></div></main>`;
  const $ = (id: string) => document.getElementById(id) as HTMLElement;
  const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
  const head = (cols: string[]) => { $('head').innerHTML = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>'; };
  head(cfg.cols);
  const ctx: Ctx = {
    n: id => parseFn(val(id))(0), fn: (id, v) => parseFn(val(id), v), raw: val, tol: 0, max: 0,
    list: id => val(id).split(/[\s,;]+/).filter(Boolean).map(s => parseFn(s)(0)),
  };
  $('calc').onclick = () => {
    const msg = $('msg'); $('out').innerHTML = ''; msg.className = 'msg'; msg.textContent = '';
    try {
      if (iter) { ctx.tol = ctx.n('tol'); ctx.max = Math.floor(ctx.n('max')); if (!(ctx.tol > 0) || !(ctx.max >= 1)) throw new Error('El error máx. y las iteraciones deben ser positivos.'); }
      const r = cfg.run(ctx); head(r.cols ?? cfg.cols);
      $('out').innerHTML = r.rows.map(w => '<tr>' + w.map((c, i) => `<td>${i === 0 ? c : fmt(c)}</td>`).join('') + '</tr>').join('');
      msg.className = 'msg ' + (r.ok === false ? 'err' : 'ok'); msg.textContent = r.msg;
    } catch (e) { msg.className = 'msg err'; msg.textContent = (e as Error).message; }
  };
  $('close').onclick = () => { window.close(); if (history.length > 1) history.back(); };
}

// ===== Derivación, integración y EDO =====
type F2 = (t: number, y: number) => number;
const FS: Field = { ...FX, def: 'sin(x)' };
const QF: Field[] = [FS, { id: 'a', label: 'a', def: '0' }, { id: 'b', label: 'b', def: 'pi' }, { id: 'n', label: 'subintervalos n', def: '6' }];
const fact = (k: number): number => (k < 2 ? 1 : k * fact(k - 1));
const bn = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
// k-ésima derivada: diferencias centradas + extrapolación de Richardson (h, h/2, h/4)
function dk(f: (x: number) => number, x: number, k: number): number {
  if (k === 0) return f(x);
  const D = (h: number) => { let s = 0; for (let j = 0; j <= k; j++) s += (j % 2 ? -1 : 1) * bn(k, j) * f(x + (k / 2 - j) * h); return s / h ** k; };
  const a = (4 * D(.1) - D(.2)) / 3, b = (4 * D(.05) - D(.1)) / 3; return (16 * b - a) / 15;
}
function taylor(c: Ctx, x0: number): Res {
  const f = c.fn('fx'), n = Math.floor(c.n('n')), x = c.n('xe'), fx = f(x); let S = 0;
  if (!(n >= 0 && n <= 8)) throw new Error('El grado n debe estar entre 0 y 8 (las derivadas son numéricas).');
  const rows: Cell[][] = [];
  for (let k = 0; k <= n; k++) { const d = dk(f, x0, k), a = d / fact(k), t = a * (x - x0) ** k; S += t; rows.push([k, d, a, t, S, Math.abs(fx - S)]); }
  return { rows, msg: `P${n}(${fmt(x)}) = ${fmt(S)}  |  f(${fmt(x)}) = ${fmt(fx)}  |  error = ${fmt(Math.abs(fx - S))}` };
}
const TAYC = ['k', 'f⁽ᵏ⁾(x₀)', 'f⁽ᵏ⁾/k!', 'término', 'Pₖ(x)', '|f − Pₖ|'];
// Extrapolación (Richardson / Romberg): base(i) = [h, valor con paso h/2^i]
function rich(c: Ctx, base: (i: number) => [number, number], lab: string): Res {
  const R: number[][] = [], H: number[] = []; let ok = false;
  for (let i = 0; i < Math.min(c.max, 15); i++) {
    const [h, v] = base(i); H[i] = h; R[i] = [v];
    for (let j = 1; j <= i; j++) R[i][j] = R[i][j - 1] + (R[i][j - 1] - R[i - 1][j - 1]) / (4 ** j - 1);
    if (i > 0 && Math.abs(R[i][i] - R[i - 1][i - 1]) < c.tol) { ok = true; break; }
  }
  const L = R.length - 1;
  return { rows: tri(H, R), cols: triCols(R.length, 'h'), ok, msg: (ok ? '' : 'No se alcanzó el error máx. — ') + `${lab} ≈ ${fmt(R[L][L])}  |  niveles: ${R.length}` };
}
// Pesos: t = trapecio, s13 = Simpson 1/3, s38 = Simpson 3/8 (se multiplican por h)
function qw(k: string, n: number): number[] | null {
  if (n < 1 || (k === 's13' && n % 2) || (k === 's38' && n % 3)) return null;
  return Array.from({ length: n + 1 }, (_, i) => { const e = i === 0 || i === n; return k === 't' ? (e ? .5 : 1) : k === 's13' ? (e ? 1 : i % 2 ? 4 : 2) / 3 : (e ? 1 : i % 3 ? 3 : 2) * 3 / 8; });
}
function comp(c: Ctx, k: string, n?: number): Res {
  const f = c.fn('fx'), a = c.n('a'), b = c.n('b'), N = n ?? Math.floor(c.n('n')), h = (b - a) / N, w = qw(k, N); let I = 0;
  if (!w) throw new Error('n no es válido para esta regla (Simpson 1/3: n par; Simpson 3/8: múltiplo de 3).');
  const rows: Cell[][] = w.map((wi, i) => { const x = a + i * h, fx = f(x); I += wi * fx; return [i, x, fx, wi, wi * fx]; });
  return { rows, msg: `I ≈ ${fmt(h * I)}  |  h = ${fmt(h)}` };
}
const COMPC = ['i', 'xᵢ', 'f(xᵢ)', 'peso', 'peso·f(xᵢ)'];
// Nodos y pesos de Gauss-Legendre en [-1, 1]
function gauss(n: number): [number[], number[]] {
  const x: number[] = [], w: number[] = [];
  for (let i = 0; i < n; i++) {
    let z = Math.cos(Math.PI * (i + .75) / (n + .5)), pp = 1, z1 = 0;
    do { let p0 = 1, p1 = z; for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * z * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      pp = n * (z * p1 - p0) / (z * z - 1); z1 = z; z = z1 - p1 / pp; } while (Math.abs(z - z1) > 1e-14);
    x.push(z1); w.push(2 / ((1 - z1 * z1) * pp * pp));
  }
  return [x.reverse(), w.reverse()];
}
const gl = (f: (x: number) => number, a: number, b: number, n: number): number => {
  const [t, w] = gauss(n), h = (b - a) / 2, m = (a + b) / 2; return h * w.reduce((s, wi, i) => s + wi * f(m + h * t[i]), 0);
};
const DBLF: Field[] = [{ id: 'fx', label: 'f(x, y)', def: 'x*y', wide: true, hint: 'Variables: x, y' }, { id: 'a', label: 'a (x desde)', def: '0' }, { id: 'b', label: 'b (x hasta)', def: '1' },
  { id: 'cx', label: 'c(x)  (y desde)', def: '0', hint: 'Constante o función de x' }, { id: 'dx', label: 'd(x)  (y hasta)', def: 'x', hint: 'Constante o función de x' },
  { id: 'n', label: 'n (en x)', def: '4' }, { id: 'm', label: 'm (en y)', def: '4' }];
function dbl(c: Ctx, k: string): Res {
  const f = c.fn('fx', ['x', 'y']), g0 = c.fn('cx'), g1 = c.fn('dx'), a = c.n('a'), b = c.n('b'), n = Math.floor(c.n('n')), m = Math.floor(c.n('m')), wx = qw(k, n), wy = qw(k, m);
  if (!wx || !wy) throw new Error('n y m no son válidos para esta regla (Simpson 1/3: pares).');
  const h = (b - a) / n; let I = 0;
  const rows: Cell[][] = wx.map((w, i) => {
    const x = a + i * h, lo = g0(x), hi = g1(x), k2 = (hi - lo) / m; let s = 0;
    wy.forEach((v, j) => { s += v * f(x, lo + j * k2); }); s *= k2; I += w * s; return [i, x, lo, hi, s, w];
  });
  return { rows, msg: `∬ f dA ≈ ${fmt(h * I)}  |  hₓ = ${fmt(h)}` };
}
const DBLC = ['i', 'xᵢ', 'c(xᵢ)', 'd(xᵢ)', '∫ f(xᵢ, y) dy', 'peso'];
// EDO y′ = f(t, y)
const ODEF: Field[] = [{ id: 'f', label: 'f(t, y)', def: 'y - t^2 + 1', wide: true, hint: 'y′ = f(t, y).  Variables: t, y' },
  { id: 'a', label: 't₀ (a)', def: '0' }, { id: 'b', label: 'b', def: '2' }, { id: 'y0', label: 'y(t₀)', def: '0.5' }, { id: 'N', label: 'pasos N', def: '10' },
  { id: 'ex', label: 'solución exacta (opcional)', def: '(t+1)^2 - 0.5*exp(t)', wide: true, hint: 'Para mostrar el error. Variable: t' }];
const ODEC = ['i', 'tᵢ', 'wᵢ', 'y(tᵢ)', 'error'];
function ode(c: Ctx, sol: (f: F2, a: number, y0: number, h: number, N: number) => number[]): Res {
  const f = c.fn('f', ['t', 'y']) as F2, a = c.n('a'), b = c.n('b'), y0 = c.n('y0'), N = Math.floor(c.n('N')), h = (b - a) / N;
  if (!(N >= 1) || !(b > a)) throw new Error('Se requiere b > a y N ≥ 1.');
  const ex = c.raw('ex').trim() ? c.fn('ex', ['t']) : null, w = sol(f, a, y0, h, N);
  const rows: Cell[][] = w.map((v, i) => { const t = a + i * h, e = ex ? ex(t) : null; return [i, t, v, e, e === null ? null : Math.abs(e - v)]; });
  return { rows, msg: `y(${fmt(b)}) ≈ ${fmt(w[N])}  |  h = ${fmt(h)}` };
}
const rk4 = (f: F2, t: number, y: number, h: number): number => { const k1 = f(t, y), k2 = f(t + h / 2, y + h / 2 * k1), k3 = f(t + h / 2, y + h / 2 * k2), k4 = f(t + h, y + h * k3); return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); };
const one = (s: (f: F2, t: number, y: number, h: number) => number) => (f: F2, a: number, y0: number, h: number, N: number): number[] => { const w = [y0]; for (let i = 0; i < N; i++) w.push(s(f, a + i * h, w[i], h)); return w; };
const AB = [[1], [3, -1], [23, -16, 5], [55, -59, 37, -9]], DB = [1, 2, 12, 24], AM = [[1, 1], [5, 8, -1], [9, 19, -5, 1]], DM = [2, 12, 24];
function multi(c: Ctx, implicit: boolean): Res {
  const k = Math.round(c.n('ord'));
  if (k < 1 || k > (implicit ? 3 : 4)) throw new Error(`El número de pasos debe estar entre 1 y ${implicit ? 3 : 4}.`);
  return ode(c, (f, a, y0, h, N) => {
    const w = one(rk4)(f, a, y0, h, Math.min(k - 1, N)), F = (i: number) => f(a + i * h, w[i]);   // arranque con RK4
    for (let i = k - 1; i < N; i++) {
      let s = 0; AB[k - 1].forEach((q, j) => { s += q * F(i - j); }); let y = w[i] + h * s / DB[k - 1];   // predictor Adams-Bashforth
      if (implicit) for (let it = 0; it < 10; it++) { let s2 = AM[k - 1][0] * f(a + (i + 1) * h, y); AM[k - 1].slice(1).forEach((q, j) => { s2 += q * F(i - j); }); y = w[i] + h * s2 / DM[k - 1]; }   // corrector Adams-Moulton
      w.push(y);
    }
    return w;
  });
}
