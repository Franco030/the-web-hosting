import { authService } from '../services/AuthService.js';
import { contratacionService } from '../services/ContratacionService.js';
import { dashboardService } from '../services/DashboardService.js';
import { chatbotService } from '../services/ChatbotService.js';
import { VisitCounter } from '../services/VisitCounter.js';
import { empresaRepository, preguntaRepository } from '../repositories/index.js';
import { PlanController } from './PlanController.js';
import { SugerenciaController } from './SugerenciaController.js';

export class AuthController {
  login = async (req, res) => res.json(await authService.login(req.body.correo, req.body.password));
  perfil = async (req, res) => res.json(await authService.perfil(req.admin.sub));
}

export class ContratacionController {
  listar = async (req, res) => res.json(await contratacionService.listar(req.query));
  obtener = async (req, res) => res.json(await contratacionService.obtener(req.params.id));
  crear = async (req, res) => res.status(201).json(await contratacionService.crear(req.body));
  actualizar = async (req, res) => res.json(await contratacionService.actualizar(req.params.id, req.body));
  eliminar = async (req, res) => {
    await contratacionService.eliminar(req.params.id);
    res.status(204).end();
  };
  estados = (_req, res) => res.json(contratacionService.estados());
  clientes = async (_req, res) => res.json(await contratacionService.clientes());
}

export class DashboardController {
  planesPorTipo = async (_req, res) => res.json(await dashboardService.planesPorTipo());
  vencimientos = async (req, res) => res.json(await dashboardService.vencimientos(req.query.dias));
}

export class ContenidoController {
  preguntas = async (_req, res) => res.json(await preguntaRepository.findAll({ order: [['orden', 'ASC']] }));
  empresas = async (_req, res) => res.json(await empresaRepository.findAll({ order: [['orden', 'ASC']] }));
  chatbot = async (req, res) => res.json(await chatbotService.responder(req.body?.mensaje));
}

export class VisitaController {
  constructor(contador = VisitCounter.getInstance()) {
    this.contador = contador;
  }
  registrar = async (_req, res) => res.status(201).json(await this.contador.registrarVisita());
  resumen = async (_req, res) => res.json(await this.contador.resumen());
}

export { PlanController, SugerenciaController };
