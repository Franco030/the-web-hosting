import { authService } from '../services/AuthService.js';
import { HttpError } from '../utils/HttpError.js';

const leerToken = (req) => {
  const encabezado = req.headers.authorization || '';
  return encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;
};

/** Exige un administrador autenticado (parte privada). */
export function requireAdmin(req, _res, next) {
  const token = leerToken(req);
  if (!token) return next(HttpError.unauthorized());
  req.admin = authService.verificarToken(token);
  return next();
}

/** Lee el token si viene, sin exigirlo (rutas públicas con extras para admins). */
export function optionalAdmin(req, _res, next) {
  const token = leerToken(req);
  if (token) {
    try {
      req.admin = authService.verificarToken(token);
    } catch {
      req.admin = null;
    }
  }
  next();
}
