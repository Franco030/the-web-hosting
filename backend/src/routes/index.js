import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAdmin, requireAdmin } from '../middleware/auth.js';
import {
  AuthController,
  ContenidoController,
  ContratacionController,
  DashboardController,
  PlanController,
  SugerenciaController,
  VisitaController,
} from '../controllers/index.js';

const esPrueba = process.env.NODE_ENV === 'test';
const limitar = (max, minutos = 15) =>
  rateLimit({ windowMs: minutos * 60 * 1000, limit: max, standardHeaders: 'draft-7', legacyHeaders: false, skip: () => esPrueba,
    message: { error: 'Hiciste demasiadas peticiones. Espera unos minutos e intenta de nuevo.' } });

/**
 * API REST de The Web Hosting. Todas las rutas cuelgan de /api.
 * Públicas: catálogo, búsqueda, fichas PDF, contacto, FAQ, clientes, chatbot, visitas.
 * Privadas (Bearer JWT de administrador): mantenimiento, sugerencias, dashboards.
 */
export function crearRutas() {
  const api = Router();
  const auth = new AuthController();
  const planes = new PlanController();
  const sugerencias = new SugerenciaController();
  const contrataciones = new ContratacionController();
  const dashboard = new DashboardController();
  const contenido = new ContenidoController();
  const visitas = new VisitaController();

  api.get('/salud', (_req, res) => res.json({ estado: 'ok', hora: new Date().toISOString() }));

  // Autenticación
  api.post('/auth/login', limitar(20), auth.login);
  api.get('/auth/perfil', requireAdmin, auth.perfil);

  // Planes (servicios del hosting)
  api.get('/planes', optionalAdmin, planes.buscar);
  api.get('/planes/tipos', planes.tipos);
  api.get('/planes/catalogo/pdf', planes.catalogoPdf);
  api.get('/planes/:id', planes.obtener);
  api.get('/planes/:id/ficha', planes.fichaTecnica);
  api.post('/planes', requireAdmin, planes.crear);
  api.put('/planes/:id', requireAdmin, planes.actualizar);
  api.delete('/planes/:id', requireAdmin, planes.eliminar);

  // Contacto / sugerencias
  api.post('/sugerencias', limitar(10), sugerencias.crear);
  api.get('/sugerencias', requireAdmin, sugerencias.listar);
  api.get('/sugerencias/exportar/excel', requireAdmin, sugerencias.exportarExcel);
  api.get('/sugerencias/exportar/pdf', requireAdmin, sugerencias.exportarPdf);
  api.patch('/sugerencias/:id', requireAdmin, sugerencias.actualizar);
  api.delete('/sugerencias/:id', requireAdmin, sugerencias.eliminar);

  // Contrataciones (planes vendidos a clientes)
  api.get('/contrataciones', requireAdmin, contrataciones.listar);
  api.get('/contrataciones/estados', requireAdmin, contrataciones.estados);
  api.get('/contrataciones/:id', requireAdmin, contrataciones.obtener);
  api.post('/contrataciones', requireAdmin, contrataciones.crear);
  api.put('/contrataciones/:id', requireAdmin, contrataciones.actualizar);
  api.delete('/contrataciones/:id', requireAdmin, contrataciones.eliminar);
  api.get('/clientes', requireAdmin, contrataciones.clientes);

  // Dashboards
  api.get('/dashboard/planes-por-tipo', requireAdmin, dashboard.planesPorTipo);
  api.get('/dashboard/vencimientos', requireAdmin, dashboard.vencimientos);

  // Contenido público
  api.get('/preguntas-frecuentes', contenido.preguntas);
  api.get('/empresas-cliente', contenido.empresas);
  api.post('/chatbot', limitar(120, 5), contenido.chatbot);

  // Contador de visitas
  api.post('/visitas', visitas.registrar);
  api.get('/visitas', visitas.resumen);

  return api;
}
