import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Administrador } from '../models/index.js';
import { HttpError } from '../utils/HttpError.js';

/** Autenticación de administradores con JWT (parte privada del sitio). */
export class AuthService {
  async login(correo, password) {
    if (!correo || !password) throw HttpError.badRequest('Escribe tu correo y tu contraseña.');
    const admin = await Administrador.findOne({ where: { correo: String(correo).toLowerCase().trim() } });
    // Mismo mensaje si el correo no existe o la contraseña no coincide.
    if (!admin || !(await admin.verificarPassword(password))) {
      throw HttpError.unauthorized('El correo o la contraseña no son correctos.');
    }
    await admin.update({ ultimoAcceso: new Date() });
    const token = jwt.sign({ sub: admin.id, nombre: admin.nombre, rol: 'admin' }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });
    return { token, administrador: admin.toJSON() };
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, env.jwt.secret);
    } catch {
      throw HttpError.unauthorized('Tu sesión venció. Vuelve a iniciar sesión.');
    }
  }

  async perfil(id) {
    const admin = await Administrador.findByPk(id);
    if (!admin) throw HttpError.unauthorized();
    return admin.toJSON();
  }
}

export const authService = new AuthService();
