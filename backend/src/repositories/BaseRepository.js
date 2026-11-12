import { HttpError } from '../utils/HttpError.js';

/**
 * Acceso a datos genérico sobre un modelo de Sequelize (ORM).
 * Los repositorios concretos heredan y añaden sus consultas propias.
 */
export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id, options = {}) {
    const registro = await this.model.findByPk(id, options);
    if (!registro) throw HttpError.notFound(`No existe ${this.model.name.toLowerCase()} con id ${id}.`);
    return registro;
  }

  create(datos, options = {}) {
    return this.model.create(datos, options);
  }

  async update(id, datos) {
    const registro = await this.findById(id);
    return registro.update(datos);
  }

  async delete(id) {
    const registro = await this.findById(id);
    await registro.destroy();
    return registro;
  }

  count(options = {}) {
    return this.model.count(options);
  }

  /** Página de resultados: { items, total, page, pageSize, totalPages }. */
  async paginate({ page = 1, pageSize = 10, ...options } = {}) {
    const limite = Math.min(Math.max(Number(pageSize) || 10, 1), 100);
    const pagina = Math.max(Number(page) || 1, 1);
    const { rows, count } = await this.model.findAndCountAll({
      ...options,
      limit: limite,
      offset: (pagina - 1) * limite,
      distinct: true,
    });
    return {
      items: rows,
      total: count,
      page: pagina,
      pageSize: limite,
      totalPages: Math.max(Math.ceil(count / limite), 1),
    };
  }
}
