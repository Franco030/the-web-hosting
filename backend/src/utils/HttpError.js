/** Error con código HTTP; el middleware de errores lo convierte en respuesta JSON. */
export class HttpError extends Error {
  constructor(status, message, detalles) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.detalles = detalles;
  }

  static badRequest(message, detalles) {
    return new HttpError(400, message, detalles);
  }

  static unauthorized(message = 'Inicia sesión para continuar.') {
    return new HttpError(401, message);
  }

  static notFound(message = 'No se encontró el recurso.') {
    return new HttpError(404, message);
  }

  static conflict(message) {
    return new HttpError(409, message);
  }
}
