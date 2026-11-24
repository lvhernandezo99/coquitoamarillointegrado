import { Usuario } from "./Usuario.js";

export class Cliente extends Usuario {
  #destino; #puntos = 0;

  constructor(nombre, correo, destino, autorizaTratamiento) {
    super(nombre, correo);
    if (autorizaTratamiento !== true) {
      throw new Error("Debe autorizar el tratamiento de datos personales (Ley 1581 de 2012).");
    }
    this.cambiarDestino(destino);
  }

  cambiarDestino(d) {
    const ok = d && typeof d.nombre === "string" && Number.isFinite(d.lat) && Number.isFinite(d.lon)
      && Math.abs(d.lat) <= 90 && Math.abs(d.lon) <= 180;
    if (!ok) throw new Error("Elija una ciudad de entrega o use su ubicación.");
    this.#destino = Object.freeze({ nombre: d.nombre, lat: d.lat, lon: d.lon });
  }

  get destino() { return this.#destino; }
  get puntos() { return this.#puntos; }
  sumarPuntos(totalCOP) { this.#puntos += Math.floor(totalCOP / 10000); }
  describir() { return `${this.nombre} (${this.correo}) · Envío a ${this.#destino.nombre}`; }
}
