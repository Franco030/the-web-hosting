import { sugerenciaRepository } from '../repositories/index.js';
import { MailService } from './MailService.js';

export class SugerenciaService {
  constructor(repository = sugerenciaRepository, mail = MailService.getInstance()) {
    this.repository = repository;
    this.mail = mail;
  }

  /** Guarda el mensaje y lo envía por correo; si el correo falla, el mensaje queda guardado. */
  async crear({ nombre, correo, asunto, mensaje }) {
    const sugerencia = await this.repository.create({
      nombre: String(nombre || '').trim(),
      correo: String(correo || '').trim().toLowerCase(),
      asunto: String(asunto || '').trim(),
      mensaje: String(mensaje || '').trim(),
    });
    try {
      await this.mail.enviarContacto(sugerencia);
      await sugerencia.update({ correoEnviado: true });
    } catch (error) {
      console.error('[correo] No se pudo enviar:', error.message);
    }
    return sugerencia;
  }

  listar(filtros) {
    return this.repository.listar(filtros);
  }

  todas(filtros) {
    return this.repository.todas(filtros);
  }

  marcarLeida(id, leida = true) {
    return this.repository.update(id, { leida: Boolean(leida) });
  }

  eliminar(id) {
    return this.repository.delete(id);
  }
}

export const sugerenciaService = new SugerenciaService();
