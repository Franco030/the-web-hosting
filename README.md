# The Web Hosting

Sitio web de una compañía de hosting: catálogo de planes con búsqueda y fichas técnicas en PDF, slideshow, video y audio, clientes, preguntas frecuentes en acordeón, contacto por correo, chat de ayuda 24 h y contador de visitas y conectados. La parte privada permite a los administradores dar de alta, editar y eliminar planes y contrataciones, revisar las sugerencias (paginadas y exportables a Excel y PDF) y consultar dos dashboards.

- **Backend:** Node.js · Express 5 · Sequelize (ORM) · SQLite/MySQL · Socket.IO · JWT
- **Frontend:** React 19 · Vite · Fluent UI v9 con el sistema de diseño Fluent 2 de TutoriasU
- **Sin PHP · POO · patrón Singleton · API REST**

## Inicio rápido

```bash
npm run instalar
cp backend/.env.example backend/.env
npm run dev
```

Abre http://localhost:5173. La parte privada está en `/admin` (correo y contraseña de prueba en `backend/.env`).

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | API (:4000) y frontend con recarga en caliente (:5173) |
| `npm run build` y `npm start` | Producción: Express sirve la API y el sitio en :4000 |
| `npm test` | 29 pruebas de la API |
| `npm run seed` | Reinicia la base con datos de demostración |
| `npm run gantt` | Regenera el diagrama de Gantt desde `herramientas/gantt.json` |
| `python herramientas/generar_multimedia.py` | Regenera video, subtítulos, póster y audio |

## Documentación de entrega

1. [Análisis de requerimientos](docs/01-analisis-requerimientos.md)
2. [Diseño y arquitectura](docs/02-diseno-arquitectura.md)
3. [Modelo físico de la base de datos](docs/03-modelo-fisico-bd.md) · [`schema.sql`](docs/schema.sql)
4. [Programación](docs/04-programacion.md)
5. [Pruebas](docs/05-pruebas.md)
6. [Implementación](docs/06-implementacion.md)
7. [Diagrama de Gantt](docs/07-diagrama-gantt.md) · [`diagrama-gantt.xlsx`](docs/diagrama-gantt.xlsx)
