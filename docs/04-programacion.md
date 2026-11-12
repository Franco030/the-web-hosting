# 4. Programación

## 4.1 Tecnologías

| Parte | Tecnología |
| --- | --- |
| Lenguaje | JavaScript (ES2023, módulos ES) — **sin PHP** |
| Backend | Node.js 24, Express 5, Socket.IO 4 |
| ORM y BD | Sequelize 6 · SQLite (desarrollo) / MySQL 8 (producción) |
| Seguridad | bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit |
| Documentos | pdfkit (PDF), exceljs (Excel), nodemailer (correo) |
| Frontend | React 19, React Router 7, Vite 8 |
| Interfaz | Fluent UI React v9, Fluent UI Charts, Fluent DatePicker, íconos Fluent |
| Multimedia | Python + Pillow (diapositivas), voz es-MX de Windows, ffmpeg (H.264/AAC, MP3) |
| Pruebas | `node:test` + supertest |

## 4.2 Programación orientada a objetos

Cada pieza del backend es una clase con una sola responsabilidad:

```js
// Modelo: hereda de Model (Sequelize) y agrega comportamiento propio
export class Administrador extends Model {
  async verificarPassword(password) { return bcrypt.compare(password, this.passwordHash); }
  toJSON() { const { passwordHash, ...resto } = this.get(); return resto; } // encapsulamiento
}

// Repositorio: herencia de un CRUD genérico con paginación
export class PlanRepository extends BaseRepository {
  constructor() { super(Plan); }
  buscar(filtros) { /* consulta con Op.like, Op.in, Op.lte… */ }
}

// Singleton: una sola conexión a la base de datos
export class Database {
  static #instance = null;
  static getInstance() { /* crea la instancia la primera vez */ }
}
```

Se usan campos y métodos privados (`#`), herencia (`extends`), polimorfismo (cada repositorio redefine sus consultas sobre la misma interfaz) y composición (los servicios reciben repositorios).

## 4.3 Estrategia ORM

- Ninguna consulta SQL escrita a mano: todo pasa por Sequelize (`findAll`, `findAndCountAll`, `findOrCreate`, `increment`, `transaction`).
- Validaciones en el modelo (`isEmail`, `isIn`, `len`, `min`, validación de vigencia) que el middleware de errores traduce a mensajes por campo.
- Relaciones `hasMany` / `belongsTo` con `include` para traer cliente y plan en una sola consulta.
- Transacción al registrar una contratación con un cliente nuevo.

## 4.4 Estrategia de búsqueda

`PlanRepository.buscar` divide el texto en palabras; cada palabra debe aparecer en el nombre, tipo, descripción, CPU o RAM del plan (AND entre palabras, OR entre campos). Encima se combinan filtros de tipo, precio máximo y almacenamiento mínimo, y cuatro órdenes (recomendados, precio ascendente/descendente, nombre). En el frontend el texto se aplica 300 ms después de dejar de escribir y los filtros viven en la URL (`/planes?q=tienda&tipo=VPS`), así una búsqueda se puede compartir. El mismo filtro genera el PDF de resultados.

## 4.5 Chatbot

`ChatbotService` normaliza el texto (minúsculas, sin acentos) y:
1. Calcula la pregunta frecuente con más palabras clave en común.
2. Detecta intenciones (saludo, despedida, hablar con una persona, planes y precios).
3. Si piden planes de un tipo ("planes vps"), consulta la base y lista los más económicos; si la pregunta frecuente coincide con dos o más palabras, responde con ella.
4. Siempre devuelve sugerencias de respuesta rápida y, cuando aplica, un enlace de acción.

## 4.6 Buenas prácticas aplicadas

- Configuración en `.env` (nunca en el código); `.env.example` documentado.
- Errores con `HttpError` y un solo middleware que responde JSON uniforme.
- Contraseñas con bcrypt y mensaje neutro en el acceso (no revela qué correos existen).
- Límite de peticiones en acceso, contacto y chatbot.
- Validación en el navegador **y** en el servidor.
- Frontend sin colores literales: tokens de Fluent; componentes reutilizables (`Page`, `Surface`, `EmptyState`, `Paginacion`, `ConfirmarDialog`).
- Pantallas cargadas bajo demanda (`React.lazy`).
- Accesibilidad: etiquetas visibles, nombres en botones de ícono, `aria-live` en resultados y chat, subtítulos del video.
