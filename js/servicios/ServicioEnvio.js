/** Cálculo de distancia (haversine) y costo de envío desde la bodega de Medellín. */
export class ServicioEnvio {
  static ORIGEN = { nombre: "Bodega Medellín", lat: 6.2442, lon: -75.5812 };
  static #RADIO_TIERRA_KM = 6371;

  distanciaKm(destino, origen = ServicioEnvio.ORIGEN) {
    const rad = (g) => (g * Math.PI) / 180;
    const dLat = rad(destino.lat - origen.lat);
    const dLon = rad(destino.lon - origen.lon);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(origen.lat)) * Math.cos(rad(destino.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * ServicioEnvio.#RADIO_TIERRA_KM * Math.asin(Math.sqrt(a));
  }

  costo(km, llueve, subtotal) {
    if (subtotal > 250000) return 0; // envío gratis
    const base = 8000 + Math.round(km) * 35; // tarifa ilustrativa
    return llueve ? base + 3000 : base; // recargo logístico por lluvia
  }
}
