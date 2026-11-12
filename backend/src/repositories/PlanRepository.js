import { Op } from 'sequelize';
import { Plan } from '../models/index.js';
import { BaseRepository } from './BaseRepository.js';

const ORDENES = {
  precio_asc: [['precioMensual', 'ASC']],
  precio_desc: [['precioMensual', 'DESC']],
  nombre: [['nombre', 'ASC']],
  relevancia: [['destacado', 'DESC'], ['precioMensual', 'ASC']],
};

export class PlanRepository extends BaseRepository {
  constructor() {
    super(Plan);
  }

  /**
   * Estrategia de búsqueda: texto libre en nombre, tipo y descripción
   * (cada palabra debe aparecer en alguno de esos campos) más filtros
   * opcionales por tipo, precio máximo, almacenamiento mínimo y SSL.
   */
  buscar({ q, tipo, precioMax, almacenamientoMin, ssl, orden = 'relevancia', incluirInactivos = false } = {}) {
    const and = [];
    if (!incluirInactivos) and.push({ activo: true });

    const palabras = String(q || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8);
    for (const palabra of palabras) {
      const like = { [Op.like]: `%${palabra}%` };
      and.push({ [Op.or]: [{ nombre: like }, { tipo: like }, { descripcion: like }, { cpu: like }, { ram: like }] });
    }

    const tipos = [].concat(tipo || []).flatMap((t) => String(t).split(',')).filter(Boolean);
    if (tipos.length) and.push({ tipo: { [Op.in]: tipos } });
    if (precioMax !== undefined && precioMax !== '') and.push({ precioMensual: { [Op.lte]: Number(precioMax) } });
    if (almacenamientoMin) and.push({ almacenamientoGB: { [Op.gte]: Number(almacenamientoMin) } });
    if (ssl === 'true' || ssl === true) and.push({ sslGratis: true });

    return this.model.findAll({ where: { [Op.and]: and }, order: ORDENES[orden] || ORDENES.relevancia });
  }
}
