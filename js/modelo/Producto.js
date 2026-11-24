export class Producto {
  #sku; #nombre; #precio; #stock;

  constructor(sku, nombre, precio, stock) {
    if (!String(sku ?? "").trim() || !String(nombre ?? "").trim()) throw new Error("SKU y nombre son obligatorios.");
    if (!Number.isFinite(precio) || precio <= 0) throw new Error(`Precio inválido para ${nombre}.`);
    if (!Number.isInteger(stock) || stock < 0) throw new Error(`Stock inválido para ${nombre}.`);
    this.#sku = String(sku).trim();
    this.#nombre = String(nombre).trim();
    this.#precio = precio;
    this.#stock = stock;
  }

  get sku() { return this.#sku; }
  get nombre() { return this.#nombre; }
  get precio() { return this.#precio; }
  get stock() { return this.#stock; }

  hayStock(cantidad) { return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= this.#stock; }
 
  reservar(cantidad) {
    if (!this.hayStock(cantidad)) throw new Error(`Stock insuficiente de ${this.#nombre} (disponible: ${this.#stock}).`);
    this.#stock -= cantidad;
  }

  static desdeJSON(o) { return new Producto(o.sku, o.nombre, Number(o.precio), Number(o.stock)); }
}
