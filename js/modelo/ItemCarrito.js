export class ItemCarrito {
  #producto; #cantidad;

  constructor(producto, cantidad) {
    this.#producto = producto;
    this.cantidad = cantidad;
  }

  get producto() { return this.#producto; }
  get cantidad() { return this.#cantidad; }
  set cantidad(c) {
    if (!this.#producto.hayStock(c)) {
      throw new Error(`Cantidad no válida para ${this.#producto.nombre}. Disponible: ${this.#producto.stock}.`);
    }
    this.#cantidad = c;
  }
  get subtotal() { return this.#producto.precio * this.#cantidad; }
}
