import { Producto } from "../modelo/Producto.js";
import { Cliente } from "../modelo/Cliente.js";
import { Carrito } from "../modelo/Carrito.js";
import { Transaccion } from "../modelo/Transaccion.js";
import { HistorialTransacciones } from "../modelo/HistorialTransacciones.js";
import { PagoTarjeta } from "../pagos/PagoTarjeta.js";
import { PagoPSE } from "../pagos/PagoPSE.js";
import { PagoNequi } from "../pagos/PagoNequi.js";
import { ServicioDivisas } from "../servicios/ServicioDivisas.js";
import { ServicioClima } from "../servicios/ServicioClima.js";
import { ServicioEnvio } from "../servicios/ServicioEnvio.js"; 
export class CheckoutUI {
  #d; #carrito = new Carrito(); #divisas = new ServicioDivisas(); #clima = new ServicioClima();
  #envio = new ServicioEnvio(); #historial = new HistorialTransacciones();
  #productos = new Map(); #ciudades = []; #cliente = null; #destino = null;
  #cotizacion = null; #tasa = { moneda: "COP", factor: 1, fuente: "sin conversión" };

  constructor(documento) { this.#d = documento; } 

  #q(id) { return this.#d.getElementById(id); }
  #v(id) { return this.#q(id).value; }
  #el(tag, texto = "", clase = "") {
    const e = this.#d.createElement(tag);
    e.textContent = texto;
    if (clase) e.className = clase;
    return e;
  }
  #fmt(valor, moneda = "COP") {
    return new Intl.NumberFormat("es-CO", {
      style: "currency", currency: moneda, maximumFractionDigits: moneda === "COP" ? 0 : 2
    }).format(valor);
  }
  #aviso(texto, error = false) {
    const a = this.#q("avisos");
    a.textContent = texto;
    a.className = error ? "aviso error" : "aviso ok";
  }
  async #json(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
    return r.json();
  } 

  async iniciar() {
    try {
      const [prods, ciudades] = await Promise.all([this.#json("data/productos.json"), this.#json("data/ciudades.json")]);
      prods.forEach((o) => { const p = Producto.desdeJSON(o); this.#productos.set(p.sku, p); });
      this.#ciudades = ciudades;
    } catch (error) {
      this.#aviso(`No se pudo cargar el catálogo: ${error.message}. Abra la app con un servidor local.`, true);
      return;
    }
    this.#pintarCiudades();
    this.#pintarCatalogo();
    this.#pintarCarrito();
    this.#pintarHistorial();
    this.#mostrarCamposPago();
    this.#enlazar();
  }

  #enlazar() {
    this.#q("formCliente").addEventListener("submit", (e) => this.#registrarCliente(e));
    this.#q("ciudad").addEventListener("change", () => this.#elegirCiudad());
    this.#q("btnUbicacion").addEventListener("click", () => this.#ubicar());
    this.#q("btnCotizar").addEventListener("click", () => this.cotizar());
    this.#q("moneda").addEventListener("change", () => this.convertir());
    this.#q("medio").addEventListener("change", () => this.#mostrarCamposPago());
    this.#q("formPago").addEventListener("submit", (e) => this.pagar(e));
    this.#q("btnLimpiar").addEventListener("click", () => { this.#historial.limpiar(); this.#pintarHistorial(); });
  }

  #pintarCiudades() {
    const sel = this.#q("ciudad");
    this.#ciudades.forEach((c, i) => sel.append(new Option(c.nombre, String(i))));
  }

  #fijarDestino(destino) {
    this.#destino = destino;
    this.#cotizacion = null;
    try { this.#cliente?.cambiarDestino(destino); } catch (error) { this.#aviso(error.message, true); }
    this.#q("destinoActual").textContent = `Destino: ${destino.nombre}`;
    this.#pintarTotales();
  }

  #elegirCiudad() {
    const i = this.#v("ciudad");
    if (i !== "") this.#fijarDestino(this.#ciudades[Number(i)]);
  }

  async #ubicar() {
    if (!navigator.geolocation) return this.#aviso("Su navegador no soporta geolocalización; elija una ciudad.", true);
    try {
      const pos = await new Promise((ok, mal) => navigator.geolocation.getCurrentPosition(ok, mal, { timeout: 8000 }));
      this.#q("ciudad").value = "";
      this.#fijarDestino({ nombre: "Mi ubicación", lat: pos.coords.latitude, lon: pos.coords.longitude });
      this.#aviso("Ubicación obtenida.");
    } catch {
      this.#aviso("No se pudo obtener la ubicación; elija una ciudad.", true);
    }
  }

  #registrarCliente(e) {
    e.preventDefault();
    try {
      this.#cliente = new Cliente(this.#v("nombre"), this.#v("correo"), this.#destino, this.#q("autoriza").checked);
      this.#aviso(`Cliente registrado: ${this.#cliente.describir()}`);
    } catch (error) {
      this.#cliente = null;
      this.#aviso(error.message, true);
    }
  }

  #pintarCatalogo() {
    const cont = this.#q("catalogo");
    cont.replaceChildren();
    for (const p of this.#productos.values()) {
      const tarjeta = this.#el("article", "", "producto");
      const boton = this.#el("button", "Agregar");
      boton.type = "button";
      boton.disabled = p.stock === 0;
      boton.addEventListener("click", () => this.#cambiarCarrito(() => this.#carrito.agregar(p, 1)));
      tarjeta.append(this.#el("h3", p.nombre), this.#el("p", this.#fmt(p.precio), "precio"),
        this.#el("p", p.stock > 0 ? `Disponibles: ${p.stock}` : "Agotado", "stock"), boton);
      cont.append(tarjeta);
    }
  }

  #cambiarCarrito(accion) {
    try { accion(); } catch (error) { this.#aviso(error.message, true); }
    this.#cotizacion = null;
    this.#pintarCarrito();
  }

  #pintarCarrito() {
    const lista = this.#q("carrito");
    lista.replaceChildren();
    if (this.#carrito.vacio) lista.append(this.#el("li", "El carrito está vacío.", "vacio"));
    for (const item of this.#carrito.items) {
      const sku = item.producto.sku;
      const menos = this.#el("button", "−"); menos.type = "button"; menos.setAttribute("aria-label", "Quitar una unidad");
      const mas = this.#el("button", "+"); mas.type = "button"; mas.setAttribute("aria-label", "Agregar una unidad");
      const quitar = this.#el("button", "Quitar", "secundario"); quitar.type = "button";
      menos.addEventListener("click", () => this.#cambiarCarrito(() => this.#carrito.quitar(sku, 1)));
      mas.addEventListener("click", () => this.#cambiarCarrito(() => this.#carrito.establecer(sku, item.cantidad + 1)));
      quitar.addEventListener("click", () => this.#cambiarCarrito(() => this.#carrito.quitar(sku)));
      const li = this.#el("li");
      li.append(this.#el("span", item.producto.nombre, "nombre"), menos, this.#el("span", String(item.cantidad), "cant"),
        mas, this.#el("span", this.#fmt(item.subtotal), "monto"), quitar);
      lista.append(li);
    }
    this.#pintarTotales();
  }

  async cotizar() {
    if (!this.#destino) return this.#aviso("Elija una ciudad de entrega o use su ubicación.", true);
    if (this.#carrito.vacio) return this.#aviso("Agregue productos al carrito para cotizar.", true);
    let clima = { llueve: false, fuente: "valor por defecto (tiempo seco)" };
    try {
      clima = { ...(await this.#clima.actual(this.#destino.lat, this.#destino.lon)), fuente: "Open-Meteo" };
    } catch (error) {
      this.#aviso(`Clima no disponible (${error.message}); se asume tiempo seco.`, true);
    }
    const km = this.#envio.distanciaKm(this.#destino);
    this.#cotizacion = {
      km: Math.round(km), llueve: clima.llueve, fuenteClima: clima.fuente,
      costo: this.#envio.costo(km, clima.llueve, this.#carrito.subtotal)
    };
    await this.convertir();
  }

  async convertir() {
    const moneda = this.#v("moneda");
    if (moneda === "COP") {
      this.#tasa = { moneda, factor: 1, fuente: "sin conversión" };
    } else {
      try {
        const r = await this.#divisas.factor("COP", moneda);
        this.#tasa = { moneda, factor: r.tasa, fuente: `ExchangeRate-API (${r.fecha})` };
      } catch (error) {
        this.#tasa = { moneda, factor: ServicioDivisas.respaldo("COP", moneda), fuente: "valor de respaldo" };
        this.#aviso(`Tasa en línea no disponible (${error.message}); se usa un valor de respaldo aproximado.`, true);
      }
    }
    this.#pintarTotales();
  }

  #pintarTotales() {
    const sub = this.#carrito.subtotal;
    const envio = this.#cotizacion?.costo;
    const total = sub + (envio ?? 0);
    const filas = [["Subtotal", this.#fmt(sub)],
      ["Envío", envio === undefined ? "Sin cotizar" : `${this.#fmt(envio)} (${this.#cotizacion.km} km${this.#cotizacion.llueve ? ", lluvia" : ""})`],
      ["Total (COP)", this.#fmt(total)]];
    if (this.#tasa.moneda !== "COP") {
      filas.push([`Total (${this.#tasa.moneda})`, this.#fmt(total * this.#tasa.factor, this.#tasa.moneda)],
        ["Tasa usada", `${this.#tasa.factor.toFixed(6)} · ${this.#tasa.fuente}`]);
    }
    const dl = this.#q("totales");
    dl.replaceChildren();
    filas.forEach(([k, v]) => dl.append(this.#el("dt", k), this.#el("dd", v)));
  }

   
  #mostrarCamposPago() {
    const medio = this.#v("medio");
    ["tarjeta", "pse", "nequi"].forEach((m) => { this.#q(`campos-${m}`).hidden = m !== medio; });
  }

  #crearMedio() {
    switch (this.#v("medio")) {
      case "tarjeta": return new PagoTarjeta(this.#v("tarNumero"), this.#v("tarVence"), this.#v("tarCvv"));
      case "pse": return new PagoPSE(this.#v("pseBanco"), this.#v("pseDoc"));
      case "nequi": return new PagoNequi(this.#v("neqCel"));
      default: throw new Error("Seleccione un medio de pago.");
    }
  }

  async pagar(e) {
    e.preventDefault();
    try {
      if (!this.#cliente) throw new Error("Registre primero sus datos de cliente.");
      if (this.#carrito.vacio) throw new Error("El carrito está vacío.");
      if (!this.#cotizacion) await this.cotizar();
      if (!this.#cotizacion) return;
      const medio = this.#crearMedio();
      const t = new Transaccion({
        cliente: { nombre: this.#cliente.nombre, correo: this.#cliente.correo, ciudad: this.#cliente.destino.nombre },
        items: this.#carrito.items.map((i) => ({ sku: i.producto.sku, nombre: i.producto.nombre, cantidad: i.cantidad, precio: i.producto.precio })),
        envio: { ...this.#cotizacion }, moneda: this.#tasa.moneda, tasa: this.#tasa.factor
      });
      t.pagar(medio);
      this.#carrito.items.forEach((i) => i.producto.reservar(i.cantidad));
      this.#cliente.sumarPuntos(t.total);
      this.#historial.guardar(t);
      this.#carrito.vaciar();
      this.#cotizacion = null;
      this.#q("formPago").reset();
      this.#mostrarCamposPago();
      this.#pintarCatalogo();
      this.#pintarCarrito();
      this.#pintarHistorial();
      this.#pintarRecibo(t);
      this.#aviso(`Pago aprobado. Referencia ${t.pago.referencia}.`);
    } catch (error) {
      this.#aviso(error.message, true);
    }
  }
 
  #pintarRecibo(t) {
    const sec = this.#q("recibo");
    sec.hidden = false;
    const dl = this.#q("reciboDatos");
    dl.replaceChildren();
    const m = t.moneda;
    const filas = [["Transacción", t.id], ["Fecha", new Date(t.fecha).toLocaleString("es-CO")], ["Estado", t.estado],
      ["Cliente", `${t.cliente.nombre} (${t.cliente.correo})`], ["Entrega en", t.cliente.ciudad],
      ...t.items.map((i) => [`${i.cantidad} × ${i.nombre}`, this.#fmt(i.precio * i.cantidad)]),
      ["Envío", this.#fmt(t.envio.costo)], [`Comisión ${t.pago.medio}`, this.#fmt(t.pago.comision)],
      ["Total (COP)", this.#fmt(t.total)]];
    if (m !== "COP") filas.push([`Total (${m})`, this.#fmt(t.totalConvertido, m)], ["Tasa usada", `${t.tasa.toFixed(6)} · ${this.#tasa.fuente}`]);
    filas.forEach(([k, v]) => dl.append(this.#el("dt", k), this.#el("dd", v)));
    sec.scrollIntoView({ behavior: "smooth" });
  }

  #pintarHistorial() {
    const ul = this.#q("historial");
    ul.replaceChildren();
    const lista = this.#historial.cargar();
    if (lista.length === 0) ul.append(this.#el("li", "Aún no hay compras registradas."));
    lista.slice().reverse().forEach((t) => ul.append(this.#el("li",
      `${new Date(t.fecha).toLocaleString("es-CO")} · ${t.id.slice(0, 8)} · ${this.#fmt(t.totalConvertido, t.moneda)} · ${t.estado}`)));
  }
}
