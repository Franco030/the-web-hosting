import { Estadistica } from '../models/index.js';

const CLAVE_VISITAS = 'visitas_totales';

/**
 * Singleton: contador de visitas (persistido en la base de datos) y usuarios
 * conectados en tiempo real (sockets abiertos). Una sola instancia garantiza
 * que todas las rutas y el servidor de Socket.IO compartan el mismo estado.
 */
export class VisitCounter {
  static #instance = null;

  #io = null;
  #conectados = new Set();

  static getInstance() {
    if (!VisitCounter.#instance) VisitCounter.#instance = new VisitCounter();
    return VisitCounter.#instance;
  }

  /** Conecta el contador con Socket.IO para contar las pestañas abiertas. */
  attach(io) {
    this.#io = io;
    io.on('connection', async (socket) => {
      this.#conectados.add(socket.id);
      this.#emitir();
      socket.emit('estadisticas', await this.resumen());
      socket.on('disconnect', () => {
        this.#conectados.delete(socket.id);
        this.#emitir();
      });
    });
  }

  get conectados() {
    return this.#conectados.size;
  }

  async #registro() {
    const [registro] = await Estadistica.findOrCreate({ where: { clave: CLAVE_VISITAS }, defaults: { valor: 0 } });
    return registro;
  }

  async registrarVisita() {
    const registro = await this.#registro();
    await registro.increment('valor');
    await registro.reload();
    this.#emitir(registro.valor);
    return this.resumen(registro.valor);
  }

  async resumen(visitas) {
    const total = visitas ?? (await this.#registro()).valor;
    return { visitas: total, conectados: this.conectados };
  }

  async #emitir(visitas) {
    if (!this.#io) return;
    this.#io.emit('estadisticas', await this.resumen(visitas));
  }
}

export default VisitCounter;
