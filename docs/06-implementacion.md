# 6. Implementación

## 6.1 Requisitos

- Node.js 20 o superior (probado con 24.14) y npm.
- Opcional para producción: MySQL 8 o MariaDB.
- Opcional para regenerar el video y el audio: Windows, Python 3 con Pillow y ffmpeg.

## 6.2 Instalación local

```bash
# 1. Dependencias de backend y frontend
npm run instalar

# 2. Variables de entorno (copiar y ajustar)
cp backend/.env.example backend/.env

# 3. Desarrollo: API en :4000 y Vite en :5173 (abre http://localhost:5173)
npm run dev
```

En el primer arranque se crea la base SQLite (`backend/data/hosting.sqlite`) con datos de demostración. Para reiniciarla: `npm run seed`.

**Administrador de prueba:** el correo y la contraseña están en `backend/.env` (`ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`). Cámbialos antes de publicar.

## 6.3 Producción (un solo servidor)

```bash
npm run build      # compila el frontend en frontend/dist
npm start          # Express sirve la API y el sitio en http://localhost:4000
```

Variables mínimas en producción:

| Variable | Ejemplo |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | `4000` (o la que asigne el hosting) |
| `CORS_ORIGIN` | `https://tudominio.com` |
| `JWT_SECRET` | cadena aleatoria de 32+ caracteres |
| `DB_DIALECT`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | `mysql`, … |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` | datos del correo |

Con MySQL hay que instalar su controlador: `npm install mysql2 --prefix backend`. Las tablas las crea el ORM al arrancar (o con `docs/schema.sql`).

### Opciones de despliegue

- **Render / Railway (Node):** comando de build `npm run instalar && npm run build`, comando de inicio `npm start`, base MySQL administrada y variables de entorno en el panel.
- **VPS con Ubuntu:** clonar, `npm run instalar && npm run build`, ejecutar con `pm2 start backend/src/server.js --name the-web-hosting`, y Nginx como proxy inverso hacia el puerto 4000 (con `proxy_set_header Upgrade` para Socket.IO) y certificado de Let's Encrypt.

## 6.4 Correo del formulario de contacto

Sin `SMTP_HOST`, el servidor crea una cuenta de prueba de **Ethereal** y escribe en la consola la URL para ver cada correo enviado. Con Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587` y una contraseña de aplicación.

## 6.5 Multimedia

`herramientas/generar_multimedia.py` genera el video (2 min 19 s, 1280×720, H.264 con `faststart`), los subtítulos `.vtt`, el póster JPG progresivo y el audio MP3 de 64 kbps con la voz es-MX del sistema. Si el equipo graba su propio video, basta con reemplazar `frontend/public/media/video-promocional.mp4` (y su `.vtt`).

## 6.6 Verificación después de publicar

1. `GET /api/salud` responde `{ "estado": "ok" }`.
2. El inicio carga planes, clientes y preguntas.
3. El pie muestra visitas y personas conectadas (WebSocket activo).
4. El formulario de contacto envía y la sugerencia aparece en `/admin/sugerencias`.
