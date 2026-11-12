import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { crearRutas } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');

/** Aplicación Express: middlewares, API REST y, en producción, el frontend compilado. */
export class App {
  constructor() {
    this.express = express();
    this.#middlewares();
    this.#rutas();
  }

  #middlewares() {
    const app = this.express;
    app.disable('x-powered-by');
    app.set('trust proxy', 1);
    app.use(
      helmet({
        contentSecurityPolicy: false, // la CSP la define el frontend
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      })
    );
    app.use(cors({ origin: env.corsOrigin, exposedHeaders: ['Content-Disposition'] }));
    app.use(express.json({ limit: '100kb' }));
    if (env.nodeEnv !== 'test') app.use(morgan('dev'));
  }

  #rutas() {
    const app = this.express;
    app.use('/api', crearRutas());
    app.use('/api', notFound);

    // Implementación en un solo servidor: Express sirve el build de Vite.
    if (fs.existsSync(FRONTEND_DIST)) {
      app.use(express.static(FRONTEND_DIST, { maxAge: '7d', index: false }));
      // Rutas del SPA (sin extensión de archivo); un archivo inexistente responde 404.
      app.get(/^\/(?!api(\/|$))(?!.*\.[a-z0-9]+$).*/i, (_req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));
    }
    app.use(errorHandler);
  }
}

export default App;
