import { sugerenciaService } from '../services/SugerenciaService.js';
import { exportService } from '../services/ExportService.js';
import { aFechaISO } from '../utils/fechas.js';

export class SugerenciaController {
  constructor(service = sugerenciaService) {
    this.service = service;
  }

  crear = async (req, res) => {
    const sugerencia = await this.service.crear(req.body);
    res.status(201).json({ id: sugerencia.id, correoEnviado: sugerencia.correoEnviado });
  };

  listar = async (req, res) => res.json(await this.service.listar(req.query));

  actualizar = async (req, res) => res.json(await this.service.marcarLeida(req.params.id, req.body.leida));

  eliminar = async (req, res) => {
    await this.service.eliminar(req.params.id);
    res.status(204).end();
  };

  exportarExcel = async (req, res) => {
    const buffer = await exportService.sugerenciasExcel(await this.service.todas(req.query));
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sugerencias-${aFechaISO(new Date())}.xlsx"`,
    });
    res.send(buffer);
  };

  exportarPdf = async (req, res) => {
    const buffer = await exportService.sugerenciasPdf(await this.service.todas(req.query));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="sugerencias-${aFechaISO(new Date())}.pdf"`,
    });
    res.send(buffer);
  };
}
