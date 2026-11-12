import { Op } from 'sequelize';
import { Sugerencia } from '../models/index.js';
import { BaseRepository } from './BaseRepository.js';

export class SugerenciaRepository extends BaseRepository {
  constructor() {
    super(Sugerencia);
  }

  #where({ q, leida } = {}) {
    const where = {};
    if (leida === 'true' || leida === 'false') where.leida = leida === 'true';
    if (q) {
      const like = { [Op.like]: `%${q}%` };
      where[Op.or] = [{ nombre: like }, { correo: like }, { asunto: like }, { mensaje: like }];
    }
    return where;
  }

  listar({ page, pageSize, ...filtros } = {}) {
    return this.paginate({ page, pageSize, where: this.#where(filtros), order: [['createdAt', 'DESC']] });
  }

  todas(filtros = {}) {
    return this.model.findAll({ where: this.#where(filtros), order: [['createdAt', 'DESC']] });
  }
}
