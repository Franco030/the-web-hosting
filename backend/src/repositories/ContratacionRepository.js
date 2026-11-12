import { Op, fn, col } from 'sequelize';
import { Cliente, Contratacion, Plan } from '../models/index.js';
import { BaseRepository } from './BaseRepository.js';

const INCLUDE = [
  { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'correo', 'empresa'] },
  { model: Plan, as: 'plan', attributes: ['id', 'nombre', 'tipo', 'precioMensual'] },
];

export class ContratacionRepository extends BaseRepository {
  constructor() {
    super(Contratacion);
  }

  listar({ page, pageSize, q, estado } = {}) {
    const where = {};
    if (estado) where.estado = estado;
    if (q) {
      const like = { [Op.like]: `%${q}%` };
      where[Op.or] = [{ dominio: like }, { '$cliente.nombre$': like }, { '$plan.nombre$': like }];
    }
    return this.paginate({ page, pageSize, where, include: INCLUDE, order: [['fechaVencimiento', 'ASC']], subQuery: false });
  }

  obtener(id) {
    return this.findById(id, { include: INCLUDE });
  }

  /** Conteo de contrataciones activas agrupadas por tipo de plan. */
  async contarPorTipo() {
    const filas = await this.model.findAll({
      attributes: [[col('plan.tipo'), 'tipo'], [fn('COUNT', col('Contratacion.id')), 'total']],
      include: [{ model: Plan, as: 'plan', attributes: [] }],
      where: { estado: 'Activa' },
      group: ['plan.tipo'],
      raw: true,
    });
    return filas.map((f) => ({ tipo: f.tipo, total: Number(f.total) }));
  }

  /** Contrataciones activas que vencen entre `desde` y `hasta` (fechas YYYY-MM-DD). */
  porVencerEntre(desde, hasta) {
    return this.model.findAll({
      where: { estado: 'Activa', fechaVencimiento: { [Op.between]: [desde, hasta] } },
      include: INCLUDE,
      order: [['fechaVencimiento', 'ASC']],
    });
  }
}
