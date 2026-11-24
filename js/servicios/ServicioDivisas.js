/** API 1: tasas de cambio (ExchangeRate-API, acceso abierto). */
export class ServicioDivisas {
  static #URL = "https://open.er-api.com/v6/latest/USD";
  static #RESPALDO = { USD: 1, COP: 4000, EUR: 0.92 }; // valores aproximados de respaldo
  #cache = null;

  async #tasas() {
    if (this.#cache) return this.#cache;
    const resp = await fetch(ServicioDivisas.#URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.result !== "success") throw new Error("Respuesta inválida de la API");
    this.#cache = { rates: data.rates, fecha: data.time_last_update_utc };
    return this.#cache;
  }

  /** Factor para multiplicar un valor en `de` y obtenerlo en `a` (las tasas tienen base USD). */
  async factor(de, a) {
    const { rates, fecha } = await this.#tasas();
    if (!rates[de] || !rates[a]) throw new Error(`Moneda no disponible (${de}/${a})`);
    return { tasa: rates[a] / rates[de], fecha };
  }

  static respaldo(de, a) { return ServicioDivisas.#RESPALDO[a] / ServicioDivisas.#RESPALDO[de]; }
}
