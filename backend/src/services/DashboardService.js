import { TIPOS_PLAN } from '../models/index.js';
import { contratacionRepository, planRepository } from '../repositories/index.js';
import { aFechaISO, sumarDias } from '../utils/fechas.js';

export class DashboardService {
  /** Dashboard 1: análisis de los tipos de planes registrados. */
  async planesPorTipo() {
    const [contratados, planes] = await Promise.all([
      contratacionRepository.contarPorTipo(),
      planRepository.findAll({ attributes: ['tipo', 'activo'] }),
    ]);
    const porTipo = TIPOS_PLAN.map((tipo) => ({
      tipo,
      contrataciones: contratados.find((c) => c.tipo === tipo)?.total ?? 0,
      planesOfertados: planes.filter((p) => p.tipo === tipo && p.activo).length,
    }));
    return {
      porTipo,
      totalContrataciones: porTipo.reduce((s, t) => s + t.contrataciones, 0),
      totalPlanes: planes.filter((p) => p.activo).length,
    };
  }

  /** Dashboard 2: planes que vencen en los próximos `dias` días (hoy incluido). */
  async vencimientos(dias = 10) {
    const n = Math.min(Math.max(Number(dias) || 10, 1), 90);
    const hoy = new Date();
    const desde = aFechaISO(hoy);
    const hasta = aFechaISO(sumarDias(hoy, n - 1));
    const contrataciones = await contratacionRepository.porVencerEntre(desde, hasta);

    const porDia = Array.from({ length: n }, (_, i) => {
      const fecha = aFechaISO(sumarDias(hoy, i));
      return { fecha, total: contrataciones.filter((c) => c.fechaVencimiento === fecha).length };
    });
    const ingresoEnRiesgo = contrataciones.reduce((s, c) => s + Number(c.plan?.precioMensual || 0), 0);
    return { dias: n, desde, hasta, porDia, contrataciones, ingresoEnRiesgo };
  }
}

export const dashboardService = new DashboardService();
