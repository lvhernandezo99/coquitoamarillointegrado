import { Transaccion } from "./Transaccion.js";

export class HistorialTransacciones {
  static #CLAVE = "coquito.historial";

  cargar() {
    try {
      const crudo = localStorage.getItem(HistorialTransacciones.#CLAVE);
      return crudo ? JSON.parse(crudo).map((o) => Transaccion.desdeJSON(o)) : [];
    } catch {
      return [];
    }
  }

  guardar(transaccion) {
    const lista = this.cargar();
    lista.push(transaccion);
    try {
      localStorage.setItem(HistorialTransacciones.#CLAVE, JSON.stringify(lista));
    } catch {
      throw new Error("La compra se realizó, pero no se pudo guardar el historial en el navegador.");
    }
  }

  limpiar() { localStorage.removeItem(HistorialTransacciones.#CLAVE); }
}
