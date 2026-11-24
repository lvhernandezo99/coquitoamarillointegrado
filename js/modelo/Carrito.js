import { ItemCarrito } from "./ItemCarrito.js";

export class Carrito {
  #items = new Map();

  agregar(producto, cantidad = 1) {
    const item = this.#items.get(producto.sku);
    if (item) item.cantidad = item.cantidad + cantidad;
    else this.#items.set(producto.sku, new ItemCarrito(producto, cantidad));
  }

  establecer(sku, cantidad) {
    const item = this.#items.get(sku);
    if (item) item.cantidad = cantidad;
  }

  quitar(sku, cantidad = Infinity) {
    const item = this.#items.get(sku);
    if (!item) return;
    const resto = item.cantidad - cantidad;
    if (resto <= 0) this.#items.delete(sku);
    else item.cantidad = resto;
  }

  vaciar() { this.#items.clear(); }
  get items() { return [...this.#items.values()]; }
  get vacio() { return this.#items.size === 0; }
  get subtotal() { return this.items.reduce((s, i) => s + i.subtotal, 0); }
}
