/**
 * Cliente HTTP de la API REST (patrón Singleton): una sola instancia guarda
 * el token del administrador y lo agrega a cada petición.
 */
export class ApiError extends Error {
  constructor(status, message, campos) {
    super(message);
    this.status = status;
    this.campos = campos || {};
  }
}

const CLAVE_TOKEN = "twh_token";

export class ApiClient {
  static #instance = null;
  #token = null;
  #alExpirar = new Set();

  static getInstance() {
    if (!ApiClient.#instance) ApiClient.#instance = new ApiClient();
    return ApiClient.#instance;
  }

  constructor() {
    try {
      this.#token = sessionStorage.getItem(CLAVE_TOKEN);
    } catch {
      this.#token = null;
    }
  }

  get token() {
    return this.#token;
  }

  set token(valor) {
    this.#token = valor;
    try {
      if (valor) sessionStorage.setItem(CLAVE_TOKEN, valor);
      else sessionStorage.removeItem(CLAVE_TOKEN);
    } catch {
      /* almacenamiento bloqueado: el token vive solo en memoria */
    }
  }

  /** Avisa cuando el servidor responde 401 con sesión iniciada. */
  onSesionExpirada(fn) {
    this.#alExpirar.add(fn);
    return () => this.#alExpirar.delete(fn);
  }

  #url(ruta, query) {
    const url = new URL(`/api${ruta}`, window.location.origin);
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
    return url;
  }

  async #peticion(metodo, ruta, { body, query, comoBlob = false } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (this.#token) headers.Authorization = `Bearer ${this.#token}`;

    let respuesta;
    try {
      respuesta = await fetch(this.#url(ruta, query), {
        method: metodo,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError(0, "No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.");
    }

    if (respuesta.status === 401 && this.#token) {
      this.token = null;
      this.#alExpirar.forEach((fn) => fn());
    }
    if (!respuesta.ok) {
      const datos = await respuesta.json().catch(() => ({}));
      throw new ApiError(respuesta.status, datos.error || "No se pudo completar la acción.", datos.campos);
    }
    if (respuesta.status === 204) return null;
    return comoBlob ? respuesta : respuesta.json();
  }

  get(ruta, query) {
    return this.#peticion("GET", ruta, { query });
  }

  post(ruta, body) {
    return this.#peticion("POST", ruta, { body });
  }

  put(ruta, body) {
    return this.#peticion("PUT", ruta, { body });
  }

  patch(ruta, body) {
    return this.#peticion("PATCH", ruta, { body });
  }

  delete(ruta) {
    return this.#peticion("DELETE", ruta);
  }

  /** Descarga un archivo (PDF, Excel) respetando el nombre que manda el servidor. */
  async descargar(ruta, query, nombrePorDefecto = "archivo") {
    const respuesta = await this.#peticion("GET", ruta, { query, comoBlob: true });
    const disposicion = respuesta.headers.get("Content-Disposition") || "";
    const nombre = /filename="?([^"]+)"?/.exec(disposicion)?.[1] || nombrePorDefecto;
    const blob = await respuesta.blob();
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  }
}

export const api = ApiClient.getInstance();
export default api;
