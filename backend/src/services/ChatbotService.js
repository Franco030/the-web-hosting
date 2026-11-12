import { planRepository, preguntaRepository } from '../repositories/index.js';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** Minúsculas y sin acentos para comparar palabras. */
const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ');

const SUGERENCIAS_INICIALES = ['Ver planes y precios', '¿Incluye SSL gratis?', '¿Cómo migro mi sitio?', 'Hablar con una persona'];

/**
 * Asistente de ayuda disponible las 24 horas. Reconoce intenciones con
 * palabras clave y, si no encuentra una, busca la pregunta frecuente con más
 * coincidencias en la base de datos.
 */
export class ChatbotService {
  #intenciones = [
    {
      nombre: 'saludo',
      palabras: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hey'],
      responder: async () => ({
        texto: 'Hola, soy Hosti, el asistente de The Web Hosting. Te ayudo a elegir un plan, resolver dudas técnicas o contactar al equipo. ¿Qué necesitas?',
        sugerencias: SUGERENCIAS_INICIALES,
      }),
    },
    {
      nombre: 'despedida',
      palabras: ['gracias', 'adios', 'hasta luego', 'bye', 'eso es todo'],
      responder: async () => ({ texto: 'Con gusto. Aquí sigo las 24 horas si necesitas algo más.', sugerencias: [] }),
    },
    {
      nombre: 'humano',
      palabras: ['persona', 'humano', 'asesor', 'agente', 'contacto', 'contactar', 'llamar', 'telefono', 'correo'],
      responder: async () => ({
        texto: 'Escríbenos desde el formulario de contacto y un asesor te responde en menos de 24 horas. También puedes llamar al 55 0000 0000 de lunes a sábado, de 9:00 a 20:00.',
        enlace: { texto: 'Ir a contacto', ruta: '/contacto' },
        sugerencias: ['Ver planes y precios'],
      }),
    },
    {
      nombre: 'planes',
      palabras: ['plan', 'planes', 'precio', 'precios', 'costo', 'cuesta', 'barato', 'economico', 'tarifa', 'contratar'],
      responder: async (texto) => {
        const tipos = { wordpress: 'WordPress', vps: 'VPS', cloud: 'Cloud', nube: 'Cloud', dedicado: 'Dedicado', compartido: 'Compartido' };
        const tipo = Object.keys(tipos).find((t) => texto.includes(t));
        const planes = await planRepository.buscar({ tipo: tipo ? tipos[tipo] : undefined, orden: 'precio_asc' });
        const lista = planes
          .slice(0, 4)
          .map((p) => `• ${p.nombre} (${p.tipo}): ${moneda.format(p.precioMensual)} al mes`)
          .join('\n');
        return {
          texto: planes.length
            ? `Estos son ${tipo ? `los planes ${tipo}` : 'algunos de nuestros planes'} más accesibles:\n${lista}`
            : 'Por ahora no hay planes de ese tipo. Revisa el catálogo completo.',
          enlace: { texto: 'Ver todos los planes', ruta: '/planes' },
          sugerencias: ['¿Cuál me conviene para WordPress?', 'Planes VPS'],
        };
      },
    },
  ];

  #pareceIntencion(texto, palabras) {
    return palabras.some((p) => new RegExp(`(^|\\s)${p}(\\s|$)`).test(texto));
  }

  async #buscarEnPreguntas(texto) {
    const preguntas = await preguntaRepository.findAll();
    const palabrasUsuario = new Set(texto.split(/\s+/).filter((p) => p.length > 2));
    let mejor = null;
    let mejorPuntaje = 0;
    for (const p of preguntas) {
      const claves = [...new Set(normalizar(`${p.palabrasClave} ${p.pregunta}`).split(/\s+/).filter((c) => c.length > 2))];
      const puntaje = claves.reduce((s, c) => s + (palabrasUsuario.has(c) ? 1 : 0), 0);
      if (puntaje > mejorPuntaje) {
        mejor = p;
        mejorPuntaje = puntaje;
      }
    }
    return mejorPuntaje > 0 ? { pregunta: mejor, puntaje: mejorPuntaje } : null;
  }

  async responder(mensaje) {
    const texto = normalizar(mensaje).trim();
    if (!texto) return { texto: 'Escribe tu pregunta y te ayudo.', sugerencias: SUGERENCIAS_INICIALES };

    // Una pregunta frecuente gana si no hay intención, o si coincide con 2+ palabras
    // frente a la intención de planes ("¿cuál plan me conviene para WordPress?").
    const encontrada = await this.#buscarEnPreguntas(texto);
    const intencion = this.#intenciones.find((i) => this.#pareceIntencion(texto, i.palabras));

    if (encontrada && (!intencion || (intencion.nombre === 'planes' && encontrada.puntaje >= 2))) {
      return { texto: encontrada.pregunta.respuesta, sugerencias: ['Ver planes y precios', 'Hablar con una persona'] };
    }
    if (intencion) return intencion.responder(texto);

    return {
      texto: 'No encontré una respuesta para eso. Puedes reformular la pregunta o dejar tu mensaje a un asesor en el formulario de contacto.',
      enlace: { texto: 'Ir a contacto', ruta: '/contacto' },
      sugerencias: SUGERENCIAS_INICIALES,
    };
  }
}

export const chatbotService = new ChatbotService();
