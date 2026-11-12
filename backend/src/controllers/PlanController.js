import { planService } from '../services/PlanService.js';
import { exportService } from '../services/ExportService.js';

const nombreArchivo = (texto) =>
  String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();

const enviarPdf = (res, buffer, archivo) => {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${archivo}.pdf"`,
    'Content-Length': buffer.length,
  });
  res.send(buffer);
};

export class PlanController {
  constructor(service = planService) {
    this.service = service;
  }

  tipos = (_req, res) => res.json(this.service.tipos());

  buscar = async (req, res) => {
    const incluirInactivos = Boolean(req.admin) && req.query.todos === 'true';
    res.json(await this.service.buscar({ ...req.query, incluirInactivos }));
  };

  obtener = async (req, res) => res.json(await this.service.obtener(req.params.id));

  crear = async (req, res) => res.status(201).json(await this.service.crear(req.body));

  actualizar = async (req, res) => res.json(await this.service.actualizar(req.params.id, req.body));

  eliminar = async (req, res) => {
    await this.service.eliminar(req.params.id);
    res.status(204).end();
  };

  fichaTecnica = async (req, res) => {
    const plan = await this.service.obtener(req.params.id);
    enviarPdf(res, await exportService.fichaTecnicaPdf(plan), `ficha-tecnica-${nombreArchivo(plan.nombre)}`);
  };

  catalogoPdf = async (req, res) => {
    const planes = await this.service.buscar(req.query);
    const descripcion = req.query.q ? `Búsqueda: "${req.query.q}"` : 'Catálogo completo';
    enviarPdf(res, await exportService.catalogoPdf(planes, descripcion), 'planes-the-web-hosting');
  };
}
