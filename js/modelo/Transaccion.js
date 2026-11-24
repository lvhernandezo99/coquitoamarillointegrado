export class Transaccion {
  #id; #fecha; #estado; #cliente; #items; #envio; #pago; #moneda; #tasa;
 
  constructor(d) {
    this.#id = d.id ?? crypto.randomUUID();
    this.#fecha = d.fecha ?? new Date().toISOString();
    this.#estado = d.estado ?? "PENDIENTE";
    this.#cliente = Object.freeze({ ...d.cliente });
    this.#items = Object.freeze(d.items.map((i) => Object.freeze({ ...i })));
    this.#envio = Object.freeze({ ...d.envio });
    this.#pago = d.pago ? Object.freeze({ ...d.pago }) : null;
    this.#moneda = d.moneda;
    this.#tasa = d.tasa;
  }

  get id() { return this.#id; }
  get fecha() { return this.#fecha; }
  get estado() { return this.#estado; }
  get cliente() { return this.#cliente; }
  get items() { return this.#items; }
  get envio() { return this.#envio; }
  get pago() { return this.#pago; }
  get moneda() { return this.#moneda; }
  get tasa() { return this.#tasa; }

  get subtotal() { return this.#items.reduce((s, i) => s + i.precio * i.cantidad, 0); }
  get base() { return this.subtotal + this.#envio.costo; }
  get total() { return this.base + (this.#pago?.comision ?? 0); }
  get totalConvertido() { return this.total * this.#tasa; }

  pagar(medio) {
    if (this.#estado === "APROBADA") throw new Error("Esta transacción ya fue pagada.");
    try {
      const r = medio.procesar(this.base);
      this.#pago = Object.freeze({ medio: medio.nombre, comision: r.comision, referencia: r.referencia });
      this.#estado = "APROBADA";
    } catch (error) {
      this.#estado = "RECHAZADA";
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.#id, fecha: this.#fecha, estado: this.#estado, cliente: this.#cliente,
      items: this.#items, envio: this.#envio, pago: this.#pago, moneda: this.#moneda, tasa: this.#tasa
    };
  }

  static desdeJSON(o) { return new Transaccion(o); }
}
