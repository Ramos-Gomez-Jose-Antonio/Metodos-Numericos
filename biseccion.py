import math
import re
import tkinter as tk
from tkinter import font as tkfont
from tkinter import ttk

# =============================================================================
# Lógica numérica
# =============================================================================
FUNCIONES = {k: getattr(math, k) for k in dir(math) if not k.startswith("_")}
FUNCIONES.update({
    "abs": abs,
    "ln": math.log,
    "sen": math.sin,
    "tg": math.tan,
    "cot": lambda x: 1 / math.tan(x),
    "sec": lambda x: 1 / math.cos(x),
    "csc": lambda x: 1 / math.sin(x),
    "arcsin": math.asin,
    "arccos": math.acos,
    "arctan": math.atan,
    "cbrt": lambda x: math.copysign(abs(x) ** (1 / 3), x),  # raíz cúbica real
    "sign": lambda x: (x > 0) - (x < 0),
})


def preparar(texto):
    """Normaliza lo que escribe el usuario a una expresión de Python válida."""
    t = texto.strip().lower()
    for viejo, nuevo in (("×", "*"), ("·", "*"), ("÷", "/"), ("−", "-"), ("–", "-"),
                         ("π", "pi"), ("²", "**2"), ("³", "**3"), ("^", "**")):
        t = t.replace(viejo, nuevo)
    # Multiplicación implícita: 2x -> 2*x, 2(x+1) -> 2*(x+1), 2sin(x) -> 2*sin(x)
    # (no toca la notación científica: 1e-3, 2e5)
    t = re.sub(r"(?<![\w.])(\d+\.?\d*|\.\d+)\s*"
               r"(?=(?:x|pi|e)(?!\w)(?![+\-]?\d)|[a-z_]{2,}|\()", r"\1*", t)
    t = re.sub(r"(?<!\w)(x|pi|e)\s*(?=\()", r"\1*", t)      # x(x+1) -> x*(x+1)
    t = re.sub(r"\)\s*(?=[\w(])", ")*", t)                   # (x+1)(x-1), (x)2
    return t


def _nombres(codigo):
    nombres = set(codigo.co_names)
    for c in codigo.co_consts:
        if hasattr(c, "co_names"):
            nombres |= _nombres(c)
    return nombres


def construir_funcion(texto):
    """Convierte el texto del usuario en una función f(x) evaluable de forma segura."""
    expr = preparar(texto)
    if not expr:
        raise ValueError("Escribe la función f(x).")
    try:
        codigo = compile(expr, "<f(x)>", "eval")
    except SyntaxError:
        raise ValueError("No pude interpretar la función. Revisa paréntesis y operadores.")
    for nombre in _nombres(codigo):
        if nombre != "x" and nombre not in FUNCIONES:
            raise ValueError(f"«{nombre}» no es una función ni una constante conocida.")

    entorno = dict(FUNCIONES)

    def f(x):
        entorno["x"] = x
        try:
            y = eval(codigo, {"__builtins__": {}}, entorno)
        except ZeroDivisionError:
            raise ValueError(f"División entre cero al evaluar f({x:g}).")
        except (ValueError, OverflowError):
            raise ValueError(f"f(x) no está definida (o se desborda) en x = {x:g}.")
        except TypeError:
            raise ValueError("Hay un error en los argumentos de alguna función "
                             "(revisa comas y paréntesis).")
        if isinstance(y, complex) or not isinstance(y, (int, float)):
            raise ValueError(f"f(x) no da un número real en x = {x:g}.")
        if not math.isfinite(y):
            raise ValueError(f"f(x) no es finita en x = {x:g}.")
        return float(y)

    return f


def biseccion(f, a, b, error_max, max_iter):
    """Devuelve filas (i, a, b, c, f(a), f(b), f(c), error). El error es |cₙ − cₙ₋₁|."""
    fa, fb = f(a), f(b)
    if fa * fb > 0:
        raise ValueError("f(a) y f(b) tienen el mismo signo: el intervalo no garantiza "
                         "una raíz. Prueba con otro intervalo.")
    filas, c_anterior = [], None
    for i in range(1, max_iter + 1):
        c = (a + b) / 2
        fc = f(c)
        error = abs(c - c_anterior) if c_anterior is not None else None
        filas.append((i, a, b, c, fa, fb, fc, error))
        if fc == 0 or (error is not None and error < error_max):
            break
        if fa * fc < 0:
            b, fb = c, fc
        else:
            a, fa = c, fc
        c_anterior = c
    return filas


# =============================================================================
# Apariencia
# =============================================================================
BG = "#1c1d20"
PANEL = "#25272b"
BORDE = "#3a3d43"
TEXTO = "#e8eaed"
TENUE = "#9aa0a6"
ACENTO = "#c62a47"
ACENTO_H = "#d8405c"
TECLADO = "#141518"
TECLA = "#2c2f34"
TECLA_H = "#3d4148"
ROJO = "#ff7b7b"
AMBAR = "#e5b567"

# (etiqueta, texto a insertar, cuántos caracteres retroceder el cursor)
TECLAS = {
    "Básico": [
        [("x²", "^2"), ("xⁿ", "^"), ("√□", "sqrt()", 1), ("∛□", "cbrt()", 1),
         ("□/□", "()/()", 4), ("|□|", "abs()", 1), ("(□)", "()", 1),
         ("π", "pi"), ("e", "e"), ("x", "x")],
        [("+", "+"), ("−", "-"), ("×", "*"), ("÷", "/"), ("(", "("), (")", ")"),
         (",", ","), (".", "."), ("eˣ", "exp()", 1), ("ln", "ln()", 1)],
    ],
    "sin cos": [
        [("sin", "sin()", 1), ("cos", "cos()", 1), ("tan", "tan()", 1),
         ("cot", "cot()", 1), ("sec", "sec()", 1), ("csc", "csc()", 1)],
        [("sin⁻¹", "asin()", 1), ("cos⁻¹", "acos()", 1), ("tan⁻¹", "atan()", 1),
         ("sinh", "sinh()", 1), ("cosh", "cosh()", 1), ("tanh", "tanh()", 1)],
    ],
    "log eˣ": [
        [("ln", "ln()", 1), ("log₁₀", "log10()", 1), ("log₂", "log2()", 1),
         ("logₐ", "log(,)", 2), ("eˣ", "exp()", 1), ("10ˣ", "10^()", 1), ("2ˣ", "2^()", 1)],
        [("√□", "sqrt()", 1), ("∛□", "cbrt()", 1), ("|□|", "abs()", 1),
         ("⌊□⌋", "floor()", 1), ("⌈□⌉", "ceil()", 1), ("sgn", "sign()", 1)],
    ],
}
COLUMNAS_TECLADO = 10


class Boton(tk.Label):
    """Botón plano hecho con Label: no roba el foco del campo de texto."""

    def __init__(self, master, texto, comando, bg, hover, fg=TEXTO, retardo=None, **kw):
        super().__init__(master, text=texto, bg=bg, fg=fg, cursor="hand2", **kw)
        self._bg, self._hover = bg, hover
        self.bind("<Enter>", lambda _e: self.config(bg=self._hover))
        self.bind("<Leave>", lambda _e: self.config(bg=self._bg))
        if retardo is None:
            self.bind("<ButtonPress-1>", lambda _e: comando())
        else:  # deja que primero se oculte el teclado y luego ejecuta la acción
            self.bind("<ButtonPress-1>", lambda _e: self.after(retardo, comando))


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Método de bisección")
        self.configure(bg=BG)
        self.geometry("920x720")
        self.minsize(780, 600)
        self._crear_fuentes()
        self._crear_estilos()

        cont = tk.Frame(self, bg=BG)
        cont.pack(fill="both", expand=True, padx=32, pady=26)
        cont.columnconfigure(0, weight=1)
        cont.rowconfigure(7, weight=1)

        # --- Encabezado ---------------------------------------------------
        tk.Label(cont, text="Método de bisección", bg=BG, fg=TEXTO,
                 font=self.f_titulo).grid(row=0, column=0, sticky="w")
        tk.Label(cont, text="Aproxima una raíz de f(x) dentro del intervalo [a, b].",
                 bg=BG, fg=TENUE, font=self.f_peq).grid(row=1, column=0, sticky="w",
                                                        pady=(2, 18))

        # --- Función --------------------------------------------------------
        fila_lbl = tk.Frame(cont, bg=BG)
        fila_lbl.grid(row=2, column=0, sticky="ew")
        tk.Label(fila_lbl, text="Función  f(x)", bg=BG, fg=TENUE,
                 font=self.f_peq).pack(side="left")
        tk.Label(fila_lbl, text="ej.  x^3 - x - 2", bg=BG, fg="#6b7078",
                 font=self.f_peq).pack(side="right")
        self.ent_f = self._entrada(cont, self.f_campo)
        self.ent_f.grid(row=3, column=0, sticky="ew", pady=(4, 0), ipady=8)

        # --- Teclado (oculto hasta que se enfoca la función) ------------------
        self._crear_teclado(cont)
        self.teclado.grid(row=4, column=0, sticky="ew", pady=(8, 0))
        self.teclado.grid_remove()
        self.teclado_visible = False

        # --- Parámetros -----------------------------------------------------
        params = tk.Frame(cont, bg=BG)
        params.grid(row=5, column=0, sticky="ew", pady=(18, 0))
        self.ent_a = self._campo(params, "Límite izquierdo (a)", 0)
        self.ent_b = self._campo(params, "Límite derecho (b)", 1)
        self.ent_err = self._campo(params, "Error máximo", 2)
        self.ent_iter = self._campo(params, "Máx. iteraciones", 3)

        # --- Calcular + estado ------------------------------------------------
        accion = tk.Frame(cont, bg=BG)
        accion.grid(row=6, column=0, sticky="ew", pady=18)
        accion.columnconfigure(1, weight=1)
        Boton(accion, "Calcular", self.calcular, ACENTO, ACENTO_H, fg="#ffffff",
              retardo=15, font=self.f_boton, padx=26, pady=9).grid(row=0, column=0)
        self.lbl_estado = tk.Label(accion, text="", bg=BG, fg=TEXTO, font=self.f_norm,
                                   justify="left", anchor="w", wraplength=560)
        self.lbl_estado.grid(row=0, column=1, sticky="w", padx=18)

        # --- Tabla ------------------------------------------------------------
        marco_tabla = tk.Frame(cont, bg=BORDE, padx=1, pady=1)
        marco_tabla.grid(row=7, column=0, sticky="nsew")
        marco_tabla.columnconfigure(0, weight=1)
        marco_tabla.rowconfigure(0, weight=1)
        columnas = ("i", "a", "b", "c", "f(a)", "f(b)", "f(c)", "error")
        self.tabla = ttk.Treeview(marco_tabla, columns=columnas, show="headings",
                                  style="Bis.Treeview", selectmode="browse")
        for col in columnas:
            self.tabla.heading(col, text=col)
            self.tabla.column(col, width=44 if col == "i" else 100, minwidth=44,
                              anchor="center", stretch=True)
        scroll = ttk.Scrollbar(marco_tabla, orient="vertical", command=self.tabla.yview,
                               style="Bis.Vertical.TScrollbar")
        self.tabla.configure(yscrollcommand=scroll.set)
        self.tabla.grid(row=0, column=0, sticky="nsew")
        scroll.grid(row=0, column=1, sticky="ns")

        # --- Pie ----------------------------------------------------------------
        pie = tk.Frame(cont, bg=BG)
        pie.grid(row=8, column=0, sticky="e", pady=(16, 0))
        Boton(pie, "Cerrar", self.destroy, PANEL, TECLA_H, retardo=15, font=self.f_boton,
              padx=26, pady=8, highlightthickness=1,
              highlightbackground=BORDE).pack()

        # --- Eventos: el teclado solo vive mientras se edita la función ------------
        self.bind("<FocusIn>", self._al_enfocar)
        self.bind("<Button-1>", self._al_clic, add="+")
        self.bind("<Escape>", lambda _e: self._salir_de_funcion())
        self.bind("<Return>", lambda _e: self._enter())
        self.focus_set()

    # ------------------------------------------------------------------ estilo
    def _crear_fuentes(self):
        disponibles = set(tkfont.families())
        fam = next((f for f in ("Segoe UI", "SF Pro Text", "Helvetica Neue", "Noto Sans",
                                "DejaVu Sans", "Arial") if f in disponibles), "TkDefaultFont")
        self.fam = fam
        self.f_titulo = tkfont.Font(family=fam, size=18, weight="bold")
        self.f_norm = tkfont.Font(family=fam, size=11)
        self.f_peq = tkfont.Font(family=fam, size=10)
        self.f_campo = tkfont.Font(family=fam, size=14)
        self.f_boton = tkfont.Font(family=fam, size=11, weight="bold")
        self.f_tecla = tkfont.Font(family=fam, size=12)
        self.f_tab = tkfont.Font(family=fam, size=11, weight="bold")

    def _crear_estilos(self):
        s = ttk.Style(self)
        s.theme_use("clam")
        s.layout("Bis.Treeview", [("Treeview.treearea", {"sticky": "nswe"})])
        s.configure("Bis.Treeview", background=BG, fieldbackground=BG, foreground=TEXTO,
                    rowheight=30, borderwidth=0, font=(self.fam, 10))
        s.map("Bis.Treeview", background=[("selected", TECLA_H)],
              foreground=[("selected", TEXTO)])
        s.configure("Bis.Treeview.Heading", background=PANEL, foreground=TENUE,
                    relief="flat", borderwidth=0, padding=(4, 8), font=(self.fam, 10, "bold"))
        s.map("Bis.Treeview.Heading", background=[("active", PANEL)])
        s.configure("Bis.Vertical.TScrollbar", background=TECLA, troughcolor=BG,
                    bordercolor=BG, lightcolor=TECLA, darkcolor=TECLA, arrowcolor=TENUE)
        s.map("Bis.Vertical.TScrollbar", background=[("active", TECLA_H)])

    def _entrada(self, padre, fuente):
        return tk.Entry(padre, bg=PANEL, fg=TEXTO, insertbackground=TEXTO, font=fuente,
                        relief="flat", highlightthickness=1, highlightbackground=BORDE,
                        highlightcolor=ACENTO, selectbackground=ACENTO,
                        selectforeground="#ffffff")

    def _campo(self, padre, etiqueta, col):
        padre.columnconfigure(col, weight=1, uniform="param")
        tk.Label(padre, text=etiqueta, bg=BG, fg=TENUE, font=self.f_peq).grid(
            row=0, column=col, sticky="w", padx=(0 if col == 0 else 7, 7 if col < 3 else 0))
        e = self._entrada(padre, self.f_norm)
        e.grid(row=1, column=col, sticky="ew", pady=(4, 0), ipady=6,
               padx=(0 if col == 0 else 7, 7 if col < 3 else 0))
        return e

    # ----------------------------------------------------------------- teclado
    def _crear_teclado(self, padre):
        self.teclado = tk.Frame(padre, bg=TECLADO, highlightthickness=1,
                                highlightbackground=BORDE)
        barra = tk.Frame(self.teclado, bg=TECLADO)
        barra.pack(fill="x")
        self.tabs = {}
        for nombre in TECLAS:
            lbl = tk.Label(barra, text=nombre, font=self.f_tab, padx=20, pady=10,
                           cursor="hand2", bg=TECLADO, fg=TENUE)
            lbl.pack(side="left")
            lbl.bind("<ButtonPress-1>", lambda _e, n=nombre: self._elegir_tab(n))
            self.tabs[nombre] = lbl
        for texto, comando in (("Limpiar", self._limpiar), ("⌫", self._retroceso)):
            Boton(barra, texto, comando, TECLADO, TECLA_H, fg=TENUE, font=self.f_tab,
                  padx=14, pady=10).pack(side="right")

        self.zona_teclas = tk.Frame(self.teclado, bg=TECLADO)
        self.zona_teclas.pack(fill="x", padx=10, pady=(4, 10))
        for c in range(COLUMNAS_TECLADO):
            self.zona_teclas.columnconfigure(c, weight=1, uniform="tecla")
        self._elegir_tab("Básico")

    def _elegir_tab(self, nombre):
        for n, lbl in self.tabs.items():
            activa = n == nombre
            lbl.config(bg=ACENTO if activa else TECLADO, fg="#ffffff" if activa else TENUE)
        for w in self.zona_teclas.winfo_children():
            w.destroy()
        for r, fila in enumerate(TECLAS[nombre]):
            for c, (etiqueta, texto, *resto) in enumerate(fila):
                atras = resto[0] if resto else 0
                Boton(self.zona_teclas, etiqueta,
                      lambda t=texto, a=atras: self._insertar(t, a),
                      TECLA, TECLA_H, font=self.f_tecla, pady=8).grid(
                    row=r, column=c, sticky="nsew", padx=3, pady=3)

    def _insertar(self, texto, atras=0):
        e = self.ent_f
        if e.selection_present():
            e.delete("sel.first", "sel.last")
        e.insert("insert", texto)
        if atras:
            e.icursor(e.index("insert") - atras)
        e.focus_set()

    def _retroceso(self):
        e = self.ent_f
        if e.selection_present():
            e.delete("sel.first", "sel.last")
        elif e.index("insert") > 0:
            e.delete(e.index("insert") - 1)
        e.focus_set()

    def _limpiar(self):
        self.ent_f.delete(0, "end")
        self.ent_f.focus_set()

    def _mostrar_teclado(self, mostrar):
        if mostrar and not self.teclado_visible:
            self.teclado.grid()
            self.teclado_visible = True
        elif not mostrar and self.teclado_visible:
            self.teclado.grid_remove()
            self.teclado_visible = False

    def _en_teclado(self, w):
        ruta, base = str(w), str(self.teclado)
        return ruta == base or ruta.startswith(base + ".")

    def _al_enfocar(self, event):
        w = event.widget
        if str(w) == str(self.ent_f):
            self._mostrar_teclado(True)
        elif str(w) == "." or self._en_teclado(w):
            pass  # el foco de la ventana o un clic en el teclado no cambian nada
        else:
            self._mostrar_teclado(False)

    def _al_clic(self, event):
        w = event.widget
        if str(w) == str(self.ent_f) or self._en_teclado(w):
            return
        self._mostrar_teclado(False)
        if not isinstance(w, (tk.Entry, ttk.Treeview)):
            self.focus_set()  # clic en zona vacía: se quita el foco del campo

    def _salir_de_funcion(self):
        self._mostrar_teclado(False)
        self.focus_set()

    def _enter(self):
        self._salir_de_funcion()
        self.calcular()

    # ---------------------------------------------------------------- cálculo
    def _estado(self, texto, color=TEXTO):
        self.lbl_estado.config(text=texto, fg=color)

    def _numero(self, entrada, nombre, entero=False):
        t = entrada.get().strip().replace(",", ".")
        if not t:
            raise ValueError(f"Falta {nombre}.")
        try:
            return int(t) if entero else float(t)
        except ValueError:
            raise ValueError(f"{nombre[0].upper() + nombre[1:]} debe ser "
                             f"{'un número entero' if entero else 'un número'}.")

    def calcular(self):
        self.tabla.delete(*self.tabla.get_children())
        self._estado("")
        try:
            f = construir_funcion(self.ent_f.get())
            a = self._numero(self.ent_a, "el límite izquierdo (a)")
            b = self._numero(self.ent_b, "el límite derecho (b)")
            error_max = self._numero(self.ent_err, "el error máximo")
            max_iter = self._numero(self.ent_iter, "el número máximo de iteraciones", True)
            if a >= b:
                raise ValueError("Debe cumplirse a < b.")
            if error_max <= 0 or max_iter <= 0:
                raise ValueError("El error máximo y las iteraciones deben ser positivos.")
            filas = biseccion(f, a, b, error_max, max_iter)
        except ValueError as e:
            self._estado(str(e), ROJO)
            return

        fmt = lambda v: format(v, ".6g")
        for i, a_i, b_i, c, fa, fb, fc, err in filas:
            self.tabla.insert("", "end", values=(
                i, fmt(a_i), fmt(b_i), fmt(c), fmt(fa), fmt(fb), fmt(fc),
                "—" if err is None else fmt(err)))

        i, *_, c, _fa, _fb, fc, err = filas[-1]
        convergio = fc == 0 or (err is not None and err < error_max)
        texto = f"Raíz aproximada  x ≈ {fmt(c)}   ·   {i} iteraciones"
        if convergio:
            self._estado(texto)
        else:
            self._estado(texto + "\nSe alcanzó el máximo de iteraciones sin llegar "
                         "al error deseado.", AMBAR)


if __name__ == "__main__":
    App().mainloop()