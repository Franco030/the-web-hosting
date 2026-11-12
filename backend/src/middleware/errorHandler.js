import { UniqueConstraintError, ValidationError } from 'sequelize';
import { HttpError } from '../utils/HttpError.js';

const MENSAJES_CAMPO = {
  isEmail: 'Escribe un correo válido, por ejemplo nombre@dominio.com.',
  len: 'Revisa la longitud de este campo.',
  notEmpty: 'Este campo es obligatorio.',
  is_null: 'Este campo es obligatorio.',
  min: 'El valor es menor al permitido.',
  isIn: 'Elige una opción de la lista.',
  isUrl: 'Escribe una dirección web válida.',
};

export function notFound(req, _res, next) {
  next(HttpError.notFound(`No existe la ruta ${req.method} ${req.originalUrl}.`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof UniqueConstraintError) {
    const campo = error.errors?.[0]?.path;
    return res.status(409).json({ error: `Ya existe un registro con ese ${campo || 'valor'}.`, campos: { [campo]: 'Ya está en uso.' } });
  }
  if (error instanceof ValidationError) {
    const campos = {};
    for (const e of error.errors) campos[e.path || 'general'] = MENSAJES_CAMPO[e.validatorKey] || e.message;
    return res.status(400).json({ error: 'Revisa los campos marcados.', campos });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, ...(error.detalles && { detalles: error.detalles }) });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo en unos minutos.' });
}
