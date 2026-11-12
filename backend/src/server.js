import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { env } from './config/env.js';
import { Database } from './config/Database.js';
import './models/index.js';
import { App } from './app.js';
import { VisitCounter } from './services/VisitCounter.js';
import { sembrarSiVacia } from './seed/seed.js';

async function iniciar() {
  const db = Database.getInstance();
  await db.connect();
  await db.sync();
  await sembrarSiVacia();

  const { express } = new App();
  const servidor = http.createServer(express);
  const io = new SocketServer(servidor, { cors: { origin: env.corsOrigin } });
  VisitCounter.getInstance().attach(io);

  servidor.listen(env.port, () => {
    console.log(`API de The Web Hosting en http://localhost:${env.port}/api`);
  });

  const cerrar = async () => {
    servidor.close();
    await db.close();
    process.exit(0);
  };
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error);
  process.exit(1);
});
