import 'dotenv/config';

/**
 * Configuración leída del entorno, en un solo objeto inmutable.
 */
export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
  db: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './data/hosting.sqlite',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-cambiar',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  adminSeed: {
    email: process.env.ADMIN_SEED_EMAIL || 'admin@thewebhosting.test',
    password: process.env.ADMIN_SEED_PASSWORD || 'Admin123!',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  contactTo: process.env.CONTACT_TO || 'contacto@thewebhosting.test',
});
