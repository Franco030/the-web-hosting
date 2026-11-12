import { Sequelize } from 'sequelize';
import { env } from './env.js';

/**
 * Patrón Singleton: una sola conexión (pool) de Sequelize para toda la app.
 * `Database.getInstance()` siempre devuelve el mismo objeto; el constructor
 * no se puede usar directamente.
 */
export class Database {
  static #instance = null;
  static #creando = false;

  #sequelize;

  constructor() {
    if (!Database.#creando) {
      throw new Error('Usa Database.getInstance(): Database es un Singleton.');
    }
    const { db, nodeEnv } = env;
    const logging = nodeEnv === 'development' && process.env.DB_LOG === 'true' ? console.log : false;

    this.#sequelize =
      db.dialect === 'sqlite'
        ? new Sequelize({
            dialect: 'sqlite',
            storage: nodeEnv === 'test' ? ':memory:' : db.storage,
            logging,
          })
        : new Sequelize(db.name, db.user, db.password, {
            host: db.host,
            port: db.port,
            dialect: db.dialect,
            logging,
            pool: { max: 10, min: 0, idle: 10000 },
          });
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#creando = true;
      Database.#instance = new Database();
      Database.#creando = false;
    }
    return Database.#instance;
  }

  get sequelize() {
    return this.#sequelize;
  }

  async connect() {
    await this.#sequelize.authenticate();
  }

  async sync(options = {}) {
    await this.#sequelize.sync(options);
  }

  async close() {
    await this.#sequelize.close();
  }
}

export default Database;
