export class MedioPago {
  constructor() {
    if (new.target === MedioPago) throw new TypeError("MedioPago es abstracta y no se puede instanciar.");
  }

  get nombre() { throw new Error("nombre debe implementarse."); }
  validar() { throw new Error("validar() debe implementarse."); }
  calcularComision(monto) { throw new Error("calcularComision() debe implementarse."); }
  procesar(monto) {
    this.validar();
    const comision = Math.round(this.calcularComision(monto));
    const referencia = `${this.nombre.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    return { comision, referencia, total: monto + comision };
  }
}
