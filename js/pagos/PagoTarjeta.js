import { MedioPago } from "./MedioPago.js";

/** Tarjeta: los datos viven solo en memoria y jamás se guardan ni se envían. */
export class PagoTarjeta extends MedioPago {
  #numero; #vence; #cvv;

  constructor(numero, vence, cvv) {
    super();
    this.#numero = String(numero ?? "").replace(/\s+/g, "");
    this.#vence = String(vence ?? "").trim();
    this.#cvv = String(cvv ?? "").trim();
  }

  get nombre() { return "Tarjeta"; }

  static #luhn(num) {
    let suma = 0;
    [...num].reverse().forEach((c, i) => {
      let d = Number(c);
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      suma += d;
    });
    return suma % 10 === 0;
  }

  validar() {
    if (!/^\d{13,19}$/.test(this.#numero) || !PagoTarjeta.#luhn(this.#numero)) {
      throw new Error("Número de tarjeta inválido.");
    }
    const m = /^(\d{2})\/(\d{2})$/.exec(this.#vence);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) throw new Error("Fecha de vencimiento inválida (use MM/AA).");
    if (new Date(2000 + Number(m[2]), Number(m[1]), 1) <= new Date()) throw new Error("La tarjeta está vencida.");
    if (!/^\d{3,4}$/.test(this.#cvv)) throw new Error("CVV inválido.");
  }

  calcularComision(monto) { return monto * 0.029 + 900; }
}
