export class Usuario {
  #id; #nombre; #correo;

  constructor(nombre, correo) {
    if (new.target === Usuario) throw new TypeError("Usuario es abstracta y no se puede instanciar.");
    this.#nombre = Usuario.#validarNombre(nombre);
    this.#correo = Usuario.#validarCorreo(correo);
    this.#id = crypto.randomUUID();
  }

  static #validarNombre(valor) {
    const t = String(valor ?? "").trim();
    if (t.length < 2 || t.length > 100) throw new Error("El nombre debe tener entre 2 y 100 caracteres.");
    return t;
  }

  static #validarCorreo(valor) {
    const t = String(valor ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) throw new Error("El correo electrónico no es válido.");
    return t;
  }

  get id() { return this.#id; }
  get nombre() { return this.#nombre; }
  get correo() { return this.#correo; }

  describir() { throw new Error("describir() debe implementarse en la subclase."); }
}
