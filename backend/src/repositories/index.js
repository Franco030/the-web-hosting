import { Administrador, Cliente, EmpresaCliente, PreguntaFrecuente } from '../models/index.js';
import { BaseRepository } from './BaseRepository.js';
import { PlanRepository } from './PlanRepository.js';
import { ContratacionRepository } from './ContratacionRepository.js';
import { SugerenciaRepository } from './SugerenciaRepository.js';

export const planRepository = new PlanRepository();
export const contratacionRepository = new ContratacionRepository();
export const sugerenciaRepository = new SugerenciaRepository();
export const clienteRepository = new BaseRepository(Cliente);
export const administradorRepository = new BaseRepository(Administrador);
export const preguntaRepository = new BaseRepository(PreguntaFrecuente);
export const empresaRepository = new BaseRepository(EmpresaCliente);
