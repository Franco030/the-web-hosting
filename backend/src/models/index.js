import { Database } from '../config/Database.js';
import { Administrador } from './Administrador.js';
import { Plan } from './Plan.js';
import { Cliente } from './Cliente.js';
import { Contratacion } from './Contratacion.js';
import { Sugerencia } from './Sugerencia.js';
import { PreguntaFrecuente } from './PreguntaFrecuente.js';
import { EmpresaCliente } from './EmpresaCliente.js';
import { Estadistica } from './Estadistica.js';

const { sequelize } = Database.getInstance();

[Administrador, Plan, Cliente, Contratacion, Sugerencia, PreguntaFrecuente, EmpresaCliente, Estadistica].forEach((M) =>
  M.initModel(sequelize)
);

// Relaciones: un cliente y un plan tienen muchas contrataciones.
const fkCliente = { name: 'clienteId', field: 'cliente_id', allowNull: false };
const fkPlan = { name: 'planId', field: 'plan_id', allowNull: false };
Cliente.hasMany(Contratacion, { foreignKey: fkCliente, as: 'contrataciones', onDelete: 'CASCADE' });
Contratacion.belongsTo(Cliente, { foreignKey: fkCliente, as: 'cliente' });
Plan.hasMany(Contratacion, { foreignKey: fkPlan, as: 'contrataciones', onDelete: 'RESTRICT' });
Contratacion.belongsTo(Plan, { foreignKey: fkPlan, as: 'plan' });

export { Administrador, Plan, Cliente, Contratacion, Sugerencia, PreguntaFrecuente, EmpresaCliente, Estadistica };
export { TIPOS_PLAN } from './Plan.js';
export { ESTADOS_CONTRATACION } from './Contratacion.js';
