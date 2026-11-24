import { MedioPago } from "./MedioPago.js";

export class PagoPSE extends MedioPago {
  #banco; #documento;

  constructor(banco, documento) {
    super();
    this.#banco = String(banco ?? "").trim();
    this.#documento = String(documento ?? "").trim();
  }

  get nombre() { return "PSE"; }

  validar() {
    if (!this.#banco) throw new Error("Seleccione el banco para PSE.");
    if (!/^\d{6,10}$/.test(this.#documento)) throw new Error("El documento debe tener entre 6 y 10 dígitos.");
  }

  calcularComision() { return 2500; }
}
