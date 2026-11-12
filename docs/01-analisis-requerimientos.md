# 1. Análisis de requerimientos

**Proyecto:** The Web Hosting · aplicación web de una compañía de hosting
**Materia:** Desarrollo Web · evaluación por proyecto

## 1.1 Objetivo

Construir el sitio web de una compañía de hosting con una parte **pública** (catálogo de planes con búsqueda, fichas técnicas en PDF, multimedia, clientes, preguntas frecuentes, contacto y chat de ayuda 24 h) y una parte **privada** para administradores (mantenimiento de datos, sugerencias exportables y dos dashboards).

## 1.2 Alcance

| Incluido | Fuera de alcance |
| --- | --- |
| Catálogo y búsqueda de planes, ficha técnica PDF | Cobro en línea / pasarela de pago |
| Altas, bajas y cambios de planes y contrataciones | Aprovisionamiento real de servidores |
| Formulario de contacto con envío de correo | Panel de cliente final (cPanel) |
| Listado paginado de sugerencias, exportación Excel/PDF | Registro de clientes en el sitio |
| Dashboards de tipos de plan y vencimientos | |
| Chatbot de ayuda, contador de visitas y conectados | |

## 1.3 Actores

| Actor | Descripción |
| --- | --- |
| Visitante | Cualquier persona en la parte pública. No necesita cuenta. |
| Administrador | Personal de la compañía. Inicia sesión con correo y contraseña (JWT). |
| Servidor de correo | Recibe los mensajes del formulario de contacto (SMTP / Ethereal). |

## 1.4 Requerimientos funcionales

| ID | Requerimiento (del documento de evaluación) | Dónde se cumple |
| --- | --- | --- |
| RF-01 | Sitio acorde al diseño | Sistema de diseño Fluent 2 de TutoriasU (`frontend/src/theme`, `docs/02`) |
| RF-02 | Estrategia de búsqueda de servicios | `/planes`: texto libre por palabra + tipo + presupuesto + orden (`PlanRepository.buscar`) |
| RF-03 | Mantenimiento (altas, bajas, cambios) solo para administradores | `/admin/planes`, `/admin/contrataciones` (rutas `POST/PUT/DELETE` con JWT) |
| RF-04 | Autenticación de administradores, actividad pública y privada | `/admin/acceso`, middleware `requireAdmin` |
| RF-05 | Diseño responsivo | Rejillas `auto-fill`, menú en cajón < 960 px, verificado a 375 px |
| RF-06 | Video de 2 a 4 minutos (objetivo, promoción, consejos) | Inicio › Conócenos (`media/video-promocional.mp4`, 2 min 19 s, con subtítulos) |
| RF-07 | Slideshow en la sección superior | `Slideshow.jsx` (Carousel de Fluent con autoplay, pausa y navegación) |
| RF-08 | Formulario de contacto por correo electrónico | `/contacto` → `POST /api/sugerencias` → `MailService` |
| RF-09 | Listado de sugerencias paginado y exportable a Excel y PDF | `/admin/sugerencias` |
| RF-10 | Sección clientes con imágenes y enlace | `/clientes` y en el inicio (`empresas_cliente`) |
| RF-11 | Búsqueda y PDF con la ficha técnica de cada plan | Botón "Ficha técnica" y "Descargar resultados en PDF" |
| RF-12 | Contador de visitas y usuarios conectados | Pie del sitio (Socket.IO + tabla `estadisticas`) |
| RF-13 | Preguntas frecuentes con acordeón | `/preguntas-frecuentes` (Accordion de Fluent) |
| RF-14 | Dashboard 1: análisis de los tipos de planes registrados | `/admin` gráfica de dona + tabla |
| RF-15 | Dashboard 2: planes a vencer en los próximos 10 días | `/admin` gráfica de barras + detalle |
| RF-16 | Chatbot de ayuda 24 h | Botón flotante "Hosti" (`POST /api/chatbot`) |
| RF-17 | Base de datos | 8 tablas (`docs/03`, `docs/schema.sql`) |
| RF-18 | ORM para las operaciones con la base de datos | Sequelize (modelos en `backend/src/models`) |
| RF-19 | Patrón Singleton | `Database`, `MailService`, `VisitCounter` (backend) y `ApiClient` (frontend) |
| RF-20 | Al menos una API REST | 31 rutas bajo `/api` (`docs/02`) |
| RF-21 | Audio | Inicio › "Mensaje de bienvenida" (`media/mensaje-bienvenida.mp3`) |
| RF-22 | Imágenes optimizadas | Ilustraciones y logos en SVG (< 1 KB), póster JPG progresivo de 40 KB |

## 1.5 Requerimientos no funcionales

| ID | Requerimiento | Criterio |
| --- | --- | --- |
| RNF-01 | No usar PHP | Backend Node.js + Express, frontend React |
| RNF-02 | Programación orientada a objetos | Clases para modelos, repositorios, servicios, controladores y la app |
| RNF-03 | Estructura de directorios ordenada | Capas separadas (`docs/02 §2.4`) |
| RNF-04 | Seguridad | Contraseñas con bcrypt, JWT con caducidad, Helmet, CORS, límite de peticiones en login/contacto/chat |
| RNF-05 | Accesibilidad | Etiquetas visibles en formularios, nombres accesibles en botones de ícono, subtítulos en el video, `prefers-reduced-motion` |
| RNF-06 | Rendimiento | Pantallas bajo demanda (`lazy`), video con `faststart`, audio 64 kbps |
| RNF-07 | Tema claro y oscuro | Interruptor en la barra; preferencia del sistema por defecto |

## 1.6 Casos de uso principales

1. **Buscar un plan.** El visitante escribe "tienda" en Planes → el sistema filtra por nombre, tipo y descripción → el visitante descarga la ficha técnica en PDF.
2. **Enviar una sugerencia.** El visitante llena el formulario → se valida en el navegador y en el servidor → se guarda y se envía por correo al equipo y una confirmación al remitente.
3. **Pedir ayuda al chatbot.** El visitante pregunta "¿incluye SSL?" → Hosti busca la intención o la pregunta frecuente más parecida y responde con enlaces de acción.
4. **Administrar planes.** El administrador inicia sesión → agrega, edita, oculta o elimina un plan (no se puede eliminar si tiene contrataciones).
5. **Revisar renovaciones.** El administrador abre el tablero → ve cuántas contrataciones vencen en los próximos 10 días y el ingreso por renovar.
6. **Exportar sugerencias.** El administrador filtra las sugerencias → exporta a Excel o PDF con los mismos filtros.
