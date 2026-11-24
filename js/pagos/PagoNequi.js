import { MedioPago } from "./MedioPago.js";

export class PagoNequi extends MedioPago {
  #celular;
  constructor(celular) {
    super();
    this.#celular = String(celular ?? "").replace(/\s+/g, "");
  }
  get nombre() { return "Nequi"; }

  validar() {
    if (!/^3\d{9}$/.test(this.#celular)) throw new Error("El celular Nequi debe tener 10 dígitos y empezar por 3.");
  }
  calcularComision(monto) { return monto * 0.01; }
}
