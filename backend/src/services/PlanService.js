import { ForeignKeyConstraintError } from 'sequelize';
import { TIPOS_PLAN } from '../models/index.js';
import { planRepository } from '../repositories/index.js';
import { HttpError } from '../utils/HttpError.js';

const CAMPOS = [
  'nombre', 'tipo', 'descripcion', 'precioMensual', 'almacenamientoGB', 'transferenciaGB', 'sitios',
  'cuentasCorreo', 'basesDatos', 'ram', 'cpu', 'sslGratis', 'respaldos', 'soporte', 'destacado', 'activo',
];

export class PlanService {
  constructor(repository = planRepository) {
    this.repository = repository;
  }

  #limpiar(datos) {
    const limpio = {};
    for (const campo of CAMPOS) if (datos[campo] !== undefined) limpio[campo] = datos[campo];
    if (limpio.transferenciaGB === '' ) limpio.transferenciaGB = null;
    return limpio;
  }

  tipos() {
    return TIPOS_PLAN;
  }

  buscar(filtros) {
    return this.repository.buscar(filtros);
  }

  obtener(id) {
    return this.repository.findById(id);
  }

  crear(datos) {
    return this.repository.create(this.#limpiar(datos));
  }

  actualizar(id, datos) {
    return this.repository.update(id, this.#limpiar(datos));
  }

  async eliminar(id) {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        throw HttpError.conflict('Este plan tiene contrataciones. Desactívalo en lugar de eliminarlo.');
      }
      throw error;
    }
  }
}

export const planService = new PlanService();
