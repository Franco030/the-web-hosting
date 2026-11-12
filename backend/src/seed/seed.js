import { pathToFileURL } from 'node:url';
import { env } from '../config/env.js';
import { Database } from '../config/Database.js';
import {
  Administrador, Cliente, Contratacion, EmpresaCliente, Estadistica, Plan, PreguntaFrecuente, Sugerencia,
} from '../models/index.js';
import { aFechaISO, sumarDias } from '../utils/fechas.js';
import * as datos from './datos.js';

/** Inserta los datos de demostración. Las fechas son relativas a hoy. */
export async function sembrar() {
  const { sequelize } = Database.getInstance();
  await sequelize.transaction(async (transaction) => {
    await Administrador.create(
      {
        nombre: 'Administrador',
        correo: env.adminSeed.email,
        passwordHash: await Administrador.hashPassword(env.adminSeed.password),
      },
      { transaction }
    );
    const planes = await Plan.bulkCreate(datos.planes, { transaction });
    await PreguntaFrecuente.bulkCreate(datos.preguntas.map((p, i) => ({ ...p, orden: i + 1 })), { transaction });
    await EmpresaCliente.bulkCreate(datos.empresas.map((e, i) => ({ ...e, orden: i + 1 })), { transaction });
    const clientes = await Cliente.bulkCreate(
      datos.clientes.map(([nombre, correo, empresa]) => ({ nombre, correo, empresa })),
      { transaction }
    );

    // Contrataciones: algunas vencen en los próximos 10 días (dashboard 2).
    const hoy = new Date();
    const vencimientos = [1, 2, 2, 4, 5, 7, 9, 10, 15, 22, 30, 45, 60, 90, 120, 150, 180, 210, 240, 300, 330, 365];
    const pesosPlan = [0, 1, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6, 7, 1, 4, 2, 8, 1, 3, 0, 9, 5];
    const contrataciones = vencimientos.map((dias, i) => {
      const cliente = clientes[i % clientes.length];
      const vence = sumarDias(hoy, dias - 1);
      return {
        clienteId: cliente.id,
        planId: planes[pesosPlan[i]].id,
        dominio: `${(cliente.empresa || cliente.nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '')}${i > 15 ? i : ''}.mx`,
        fechaInicio: aFechaISO(sumarDias(vence, -365)),
        fechaVencimiento: aFechaISO(vence),
        estado: i === 19 ? 'Suspendida' : 'Activa',
      };
    });
    await Contratacion.bulkCreate(contrataciones, { transaction });

    await Sugerencia.bulkCreate(
      datos.sugerencias.map(([nombre, correo, asunto, mensaje], i) => {
        const fecha = sumarDias(hoy, -i * 2);
        return { nombre, correo, asunto, mensaje, leida: i > 4, correoEnviado: true, createdAt: fecha, updatedAt: fecha };
      }),
      { transaction }
    );
    await Estadistica.create({ clave: 'visitas_totales', valor: 1280 }, { transaction });
  });
}

/** Siembra solo si la base está vacía (primer arranque). */
export async function sembrarSiVacia() {
  if ((await Administrador.count()) === 0) {
    await sembrar();
    console.log(`Base de datos inicial creada. Administrador: ${env.adminSeed.email}`);
  }
}

// `npm run seed`: borra y vuelve a crear todas las tablas con los datos de demostración.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = Database.getInstance();
  await db.sync({ force: true });
  await sembrar();
  console.log('Datos de demostración cargados.');
  await db.close();
}
