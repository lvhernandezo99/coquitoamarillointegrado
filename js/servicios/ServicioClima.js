/** API 2: clima actual en el destino (Open-Meteo, uso no comercial). */
export class ServicioClima {
  #cache = new Map();

  async actual(lat, lon) {
    const clave = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    if (this.#cache.has(clave)) return this.#cache.get(clave);
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({ latitude: lat, longitude: lon, current: "temperature_2m,weather_code" });
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const { current } = await resp.json();
    const dato = {
      temperatura: current.temperature_2m,
      codigo: current.weather_code,
      llueve: current.weather_code >= 51 // códigos WMO de precipitación
    };
    this.#cache.set(clave, dato);
    return dato;
  }
}
