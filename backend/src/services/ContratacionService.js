import { Database } from '../config/Database.js';
import { ESTADOS_CONTRATACION } from '../models/index.js';
import { clienteRepository, contratacionRepository, planRepository } from '../repositories/index.js';
import { HttpError } from '../utils/HttpError.js';

export class ContratacionService {
  estados() {
    return ESTADOS_CONTRATACION;
  }

  listar(filtros) {
    return contratacionRepository.listar(filtros);
  }

  obtener(id) {
    return contratacionRepository.obtener(id);
  }

  clientes() {
    return clienteRepository.findAll({ order: [['nombre', 'ASC']] });
  }

  /** Busca al cliente por correo o lo crea; todo en una transacción. */
  async crear(datos) {
    const { cliente, planId, dominio, fechaInicio, fechaVencimiento, estado } = datos;
    if (!cliente?.correo || !cliente?.nombre) throw HttpError.badRequest('Escribe el nombre y el correo del cliente.');
    await planRepository.findById(planId);

    const { sequelize } = Database.getInstance();
    const id = await sequelize.transaction(async (transaction) => {
      const [registroCliente] = await clienteRepository.model.findOrCreate({
        where: { correo: cliente.correo.trim().toLowerCase() },
        defaults: { nombre: cliente.nombre.trim(), empresa: cliente.empresa || null, telefono: cliente.telefono || null },
        transaction,
      });
      const contratacion = await contratacionRepository.create(
        { clienteId: registroCliente.id, planId, dominio, fechaInicio, fechaVencimiento, estado },
        { transaction }
      );
      return contratacion.id;
    });
    return this.obtener(id);
  }

  async actualizar(id, { planId, dominio, fechaInicio, fechaVencimiento, estado }) {
    if (planId) await planRepository.findById(planId);
    await contratacionRepository.update(id, { planId, dominio, fechaInicio, fechaVencimiento, estado });
    return this.obtener(id);
  }

  eliminar(id) {
    return contratacionRepository.delete(id);
  }
}

export const contratacionService = new ContratacionService();
