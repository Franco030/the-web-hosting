# 5. Pruebas

## 5.1 Pruebas automáticas de la API

`backend/tests/api.test.js` levanta la aplicación con una base SQLite en memoria, carga los datos de demostración y prueba la API con supertest.

```bash
cd backend
npm test
```

Resultado: **29 pruebas, 29 aprobadas, 0 fallidas** (8 grupos).

| Grupo | Prueba | Resultado |
| --- | --- | --- |
| Singleton | `Database.getInstance()` devuelve la misma instancia | ✔ |
| | `new Database()` lanza error | ✔ |
| | `VisitCounter` es único | ✔ |
| Autenticación | Rechaza credenciales incorrectas (401) | ✔ |
| | Entrega token y no expone el hash | ✔ |
| | Protege rutas privadas sin token (401) | ✔ |
| Búsqueda | Lista planes activos | ✔ |
| | Filtra por texto ("wordpress") | ✔ |
| | Filtra por tipo + precio máximo + orden | ✔ |
| | Genera la ficha técnica en PDF (`%PDF`) | ✔ |
| Mantenimiento | No permite crear sin sesión | ✔ |
| | Crea un plan (201) | ✔ |
| | Valida campos (tipo inválido → 400 con mensaje por campo) | ✔ |
| | Actualiza un plan | ✔ |
| | Elimina un plan sin contrataciones (204) | ✔ |
| | No elimina un plan con contrataciones (409) | ✔ |
| Contacto | Guarda el mensaje y envía el correo | ✔ |
| | Rechaza un correo inválido (400) | ✔ |
| | Pagina las sugerencias (página 2 de 3, 5 por página) | ✔ |
| | Exporta a Excel | ✔ |
| | Exporta a PDF | ✔ |
| Dashboards | Agrupa contrataciones por tipo (21 activas) | ✔ |
| | Lista los 8 vencimientos de los próximos 10 días | ✔ |
| Chatbot y contenido | Responde un saludo | ✔ |
| | Responde con la pregunta frecuente de SSL | ✔ |
| | Entrega las preguntas frecuentes | ✔ |
| | Cuenta las visitas | ✔ |
| Chatbot: prioridad | "planes vps" lista precios de VPS | ✔ |
| | "¿Cuál plan me conviene para WordPress?" usa la pregunta frecuente | ✔ |

## 5.2 Pruebas manuales (navegador)

Estado: **✔ N** = verificado en el navegador · **✔ A** = cubierto por la prueba automática de la API · **☐** = pendiente de ejecutar por el equipo antes de la entrega (marcar al terminar).

| # | Caso | Pasos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| M-01 | Slideshow | Abrir el inicio, esperar 7 s, usar flechas y puntos, pausar | Cambia de diapositiva; se pausa con el botón | ☐ |
| M-02 | Búsqueda | Planes › escribir "wordpress" | 2 planes; contador "2 planes encontrados" | ✔ N |
| M-03 | Sin resultados | Buscar "zzz" | Estado vacío con "Quitar filtros" | ✔ N |
| M-04 | Ficha PDF | "Ficha técnica" en un plan | Descarga `ficha-tecnica-<plan>.pdf` | ✔ A · ☐ N |
| M-05 | PDF de búsqueda | "Descargar resultados en PDF" | PDF con la tabla de resultados | ☐ |
| M-06 | Contacto inválido | Enviar el formulario vacío | Mensajes por campo, no se envía | ✔ N |
| M-07 | Contacto válido | Llenar y enviar | Aviso "Mensaje enviado"; aparece en Sugerencias | ✔ A · ☐ N |
| M-08 | Chatbot | Preguntar "¿Cómo migro mi sitio?" y "planes vps" | Respuesta de migración; lista de VPS con precios | ✔ N |
| M-09 | Contador | Abrir el sitio en dos pestañas | "2 personas conectadas" | ✔ N |
| M-10 | Acceso protegido | Abrir `/admin` sin sesión | Redirige a `/admin/acceso` | ✔ N |
| M-11 | Acceso | Iniciar sesión con el administrador de prueba | Abre el Tablero | ✔ N |
| M-12 | Dashboards | Tablero | Dona por tipo (21) y barras de 10 días (8) | ✔ N |
| M-13 | CRUD planes | Agregar, editar, ocultar y eliminar un plan | Avisos de éxito; el catálogo público refleja el cambio | ✔ A · ☐ N |
| M-14 | CRUD contrataciones | Registrar con cliente nuevo; editar estado | Se crea el cliente; la tabla se actualiza | ☐ |
| M-15 | Sugerencias | Cambiar de página y tamaño; abrir una | Paginación correcta; se marca como leída | ✔ A · ☐ N |
| M-16 | Exportación | "Exportar a Excel" y "Exportar a PDF" | Descarga `.xlsx` y `.pdf` con los filtros aplicados | ✔ A · ☐ N |
| M-17 | Responsivo | 375 px, 768 px y 1280 px | Sin scroll horizontal; menú en cajón en móvil | ✔ N (375 y 1024 px) · ☐ 768 px |
| M-18 | Tema oscuro | Botón de luna en la barra | Cambia el tema y se recuerda al recargar | ☐ |
| M-19 | Video y audio | Reproducir en Conócenos | Video de 2:19 con subtítulos; audio de 43 s | ☐ |
| M-20 | 404 | Abrir `/no-existe` | "Esta página no existe" con "Volver al inicio" | ✔ N |

## 5.3 Defectos encontrados y corregidos

| Defecto | Causa | Corrección |
| --- | --- | --- |
| "planes vps" respondía "no hay planes de ese tipo" | Precedencia de `.replace` generaba el tipo "Vps" | Mapa explícito palabra → tipo + prueba automática |
| La pregunta frecuente ganaba a la intención de planes | Palabras repetidas sumaban doble puntaje | Palabras clave sin duplicados (`Set`) |
| El campo "Estado" del diálogo de contrataciones aparecía vacío | El estado inicial se asignaba en un efecto después del primer render | Estado inicial calculado al montar el diálogo |
| Desbordamiento horizontal en los diálogos | `min-width` de 250 px del Dropdown de Fluent | `min-width: 0` en las rejillas de formulario |
| Archivos inexistentes devolvían el HTML del SPA | Comodín del SPA atrapaba rutas con extensión | El comodín excluye rutas con extensión de archivo |
