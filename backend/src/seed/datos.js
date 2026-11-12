/** Datos iniciales de demostración. Las empresas cliente son ficticias. */

export const planes = [
  {
    nombre: 'Inicio', tipo: 'Compartido', precioMensual: 49, almacenamientoGB: 10, transferenciaGB: 100, sitios: 1,
    cuentasCorreo: 5, basesDatos: 2, respaldos: 'Semanales', destacado: false,
    descripcion: 'Para tu primer sitio, portafolio o página personal. Panel de control sencillo, instalador de apps en un clic y SSL gratis.',
  },
  {
    nombre: 'Emprendedor', tipo: 'Compartido', precioMensual: 99, almacenamientoGB: 50, transferenciaGB: null, sitios: 5,
    cuentasCorreo: 25, basesDatos: 10, respaldos: 'Diarios', destacado: true,
    descripcion: 'El favorito de los negocios pequeños: hasta 5 sitios, correo profesional con tu dominio y respaldos diarios.',
  },
  {
    nombre: 'Negocio', tipo: 'Compartido', precioMensual: 179, almacenamientoGB: 100, transferenciaGB: null, sitios: 999,
    cuentasCorreo: 999, basesDatos: 999, respaldos: 'Diarios', soporte: 'Prioritario 24/7',
    descripcion: 'Sitios, correos y bases de datos ilimitados con recursos reservados y soporte prioritario.',
  },
  {
    nombre: 'WP Básico', tipo: 'WordPress', precioMensual: 89, almacenamientoGB: 30, transferenciaGB: 300, sitios: 1,
    cuentasCorreo: 10, basesDatos: 1, respaldos: 'Diarios',
    descripcion: 'WordPress preinstalado, actualizaciones automáticas, caché optimizada y protección contra malware.',
  },
  {
    nombre: 'WP Pro', tipo: 'WordPress', precioMensual: 159, almacenamientoGB: 80, transferenciaGB: null, sitios: 3,
    cuentasCorreo: 50, basesDatos: 3, respaldos: 'Diarios', destacado: true,
    descripcion: 'Para tiendas WooCommerce: entorno de pruebas, CDN global y caché de objetos para cargar en menos de un segundo.',
  },
  {
    nombre: 'VPS 2', tipo: 'VPS', precioMensual: 299, almacenamientoGB: 80, transferenciaGB: 2000, sitios: 999,
    cuentasCorreo: 999, basesDatos: 999, ram: '4 GB', cpu: '2 vCPU', respaldos: 'Diarios',
    descripcion: 'Servidor virtual con acceso root, IP dedicada y recursos garantizados. Elige Ubuntu, Debian o AlmaLinux.',
  },
  {
    nombre: 'VPS 4', tipo: 'VPS', precioMensual: 549, almacenamientoGB: 160, transferenciaGB: 4000, sitios: 999,
    cuentasCorreo: 999, basesDatos: 999, ram: '8 GB', cpu: '4 vCPU', respaldos: 'Diarios', destacado: true,
    descripcion: 'Más memoria y procesador para aplicaciones Node.js, Python o bases de datos con mucho tráfico.',
  },
  {
    nombre: 'Cloud Escala', tipo: 'Cloud', precioMensual: 799, almacenamientoGB: 200, transferenciaGB: null, sitios: 999,
    cuentasCorreo: 999, basesDatos: 999, ram: '12 GB', cpu: '6 vCPU', respaldos: 'Cada 6 horas', soporte: 'Prioritario 24/7',
    descripcion: 'Infraestructura en la nube con escalado automático, balanceo de carga y disponibilidad del 99.99 %.',
  },
  {
    nombre: 'Dedicado E3', tipo: 'Dedicado', precioMensual: 2499, almacenamientoGB: 1000, transferenciaGB: null, sitios: 999,
    cuentasCorreo: 999, basesDatos: 999, ram: '32 GB', cpu: 'Intel Xeon E-2386G 6 núcleos', respaldos: 'Diarios',
    soporte: 'Gerente de cuenta 24/7',
    descripcion: 'Un servidor físico completo solo para ti, con discos NVMe en RAID 1 y protección DDoS incluida.',
  },
  {
    nombre: 'Dedicado EPYC', tipo: 'Dedicado', precioMensual: 4299, almacenamientoGB: 2000, transferenciaGB: null, sitios: 999,
    cuentasCorreo: 999, basesDatos: 999, ram: '128 GB', cpu: 'AMD EPYC 7313P 16 núcleos', respaldos: 'Diarios',
    soporte: 'Gerente de cuenta 24/7', activo: true,
    descripcion: 'Potencia máxima para plataformas SaaS, comercio electrónico de alto volumen y cargas de virtualización.',
  },
];

export const preguntas = [
  {
    pregunta: '¿Qué es un hosting y para qué lo necesito?',
    respuesta: 'El hosting es el espacio en un servidor donde viven los archivos, correos y bases de datos de tu sitio. Sin hosting, tu dominio no tiene a dónde apuntar y nadie podría ver tu página.',
    palabrasClave: 'hosting que es servidor necesito alojamiento',
  },
  {
    pregunta: '¿Los planes incluyen certificado SSL?',
    respuesta: 'Sí. Todos los planes incluyen un certificado SSL gratis que se instala y renueva solo, así tu sitio carga con https y el candado de seguridad.',
    palabrasClave: 'ssl certificado https candado seguridad seguro',
  },
  {
    pregunta: '¿Pueden migrar mi sitio desde otro proveedor?',
    respuesta: 'Sí, la migración es gratis. Al contratar, abre una solicitud desde el chat o el formulario de contacto y nuestro equipo mueve tus archivos, bases de datos y correos sin tiempo fuera de línea.',
    palabrasClave: 'migrar migracion mover cambiar proveedor transferir sitio',
  },
  {
    pregunta: '¿Qué diferencia hay entre hosting compartido, VPS y dedicado?',
    respuesta: 'En el compartido varios sitios usan los recursos de un mismo servidor (ideal para empezar). Un VPS te da recursos garantizados y acceso root. Un dedicado es un servidor físico completo solo para ti.',
    palabrasClave: 'diferencia compartido vps dedicado cloud cual conviene elegir',
  },
  {
    pregunta: '¿Cuál plan me conviene para WordPress?',
    respuesta: 'Para un blog o sitio informativo, WP Básico es suficiente. Si tienes tienda en línea o mucho tráfico, WP Pro incluye CDN, caché de objetos y entorno de pruebas.',
    palabrasClave: 'wordpress woocommerce blog tienda conviene',
  },
  {
    pregunta: '¿Hacen respaldos de mi información?',
    respuesta: 'Sí. Dependiendo del plan, los respaldos son semanales, diarios o cada 6 horas, y los puedes restaurar en un clic desde el panel.',
    palabrasClave: 'respaldo respaldos backup copia seguridad restaurar',
  },
  {
    pregunta: '¿Qué formas de pago aceptan?',
    respuesta: 'Aceptamos tarjeta de crédito o débito, transferencia SPEI, pago en tiendas de conveniencia y PayPal. Puedes pagar mensual, anual o cada dos años con descuento.',
    palabrasClave: 'pago pagar tarjeta transferencia paypal factura facturacion',
  },
  {
    pregunta: '¿Tienen garantía de reembolso?',
    respuesta: 'Sí. Si no estás satisfecho, te devolvemos tu dinero durante los primeros 30 días, sin preguntas.',
    palabrasClave: 'reembolso garantia devolucion cancelar dinero',
  },
  {
    pregunta: '¿Cómo creo cuentas de correo con mi dominio?',
    respuesta: 'Desde el panel de control entra a Correo, elige "Crear cuenta", escribe el nombre (por ejemplo ventas@tudominio.com) y una contraseña. Puedes usarla en Outlook, Gmail o el webmail.',
    palabrasClave: 'correo email cuenta crear dominio outlook webmail',
  },
];

export const empresas = [
  { nombre: 'Café Altura', giro: 'Cafetería de especialidad', sitioWeb: 'https://cafe-altura.example.com', logo: '/img/clientes/cafe-altura.svg' },
  { nombre: 'Ruta Norte Logística', giro: 'Transporte y paquetería', sitioWeb: 'https://rutanorte.example.com', logo: '/img/clientes/ruta-norte.svg' },
  { nombre: 'Clínica Dental Sonríe', giro: 'Salud', sitioWeb: 'https://sonrie.example.com', logo: '/img/clientes/sonrie.svg' },
  { nombre: 'Verde Vivo', giro: 'Vivero y jardinería', sitioWeb: 'https://verdevivo.example.com', logo: '/img/clientes/verde-vivo.svg' },
  { nombre: 'Taller Pixel', giro: 'Estudio de diseño', sitioWeb: 'https://tallerpixel.example.com', logo: '/img/clientes/taller-pixel.svg' },
  { nombre: 'Academia Kodo', giro: 'Escuela de programación', sitioWeb: 'https://kodo.example.com', logo: '/img/clientes/kodo.svg' },
];

export const clientes = [
  ['Mariana López', 'mariana.lopez@correo.test', 'Café Altura'],
  ['Jorge Ramírez', 'jorge.ramirez@correo.test', 'Ruta Norte Logística'],
  ['Lucía Hernández', 'lucia.hernandez@correo.test', 'Clínica Dental Sonríe'],
  ['Andrés Castillo', 'andres.castillo@correo.test', 'Verde Vivo'],
  ['Sofía Martínez', 'sofia.martinez@correo.test', 'Taller Pixel'],
  ['Diego Torres', 'diego.torres@correo.test', 'Academia Kodo'],
  ['Valeria Gómez', 'valeria.gomez@correo.test', null],
  ['Ricardo Flores', 'ricardo.flores@correo.test', 'Ferretería Flores'],
  ['Camila Ruiz', 'camila.ruiz@correo.test', 'Estudio Ruiz Arquitectos'],
  ['Fernando Díaz', 'fernando.diaz@correo.test', null],
  ['Paola Vargas', 'paola.vargas@correo.test', 'Boutique Aurora'],
  ['Miguel Ángel Soto', 'miguel.soto@correo.test', 'Soto Contadores'],
  ['Daniela Ortiz', 'daniela.ortiz@correo.test', 'Pastelería Dulce Ortiz'],
  ['Héctor Morales', 'hector.morales@correo.test', 'Gimnasio Fuerza'],
  ['Ana Karen Reyes', 'ana.reyes@correo.test', null],
  ['Luis Medina', 'luis.medina@correo.test', 'Medina Abogados'],
];

export const sugerencias = [
  ['Carlos Peña', 'carlos.pena@correo.test', 'Precio del plan VPS', '¿Tienen descuento si pago el VPS 4 por un año completo? Me interesa para una tienda en línea.'],
  ['Elena Juárez', 'elena.juarez@correo.test', 'Migración de WordPress', 'Tengo un sitio en otro proveedor con 3 GB de archivos. ¿Cuánto tarda la migración gratuita?'],
  ['Raúl Ibarra', 'raul.ibarra@correo.test', 'Sugerencia para el panel', 'Sería útil poder ver el consumo de transferencia por día en el panel de control.'],
  ['Mónica Salas', 'monica.salas@correo.test', 'Factura', 'Necesito la factura del último pago con mi RFC actualizado. ¿A qué correo la solicito?'],
  ['Tomás Aguilar', 'tomas.aguilar@correo.test', 'Correo corporativo', 'Quiero 40 cuentas de correo para mi empresa. ¿Qué plan me recomiendan?'],
  ['Isabel Navarro', 'isabel.navarro@correo.test', 'Felicitación al soporte', 'El chat me ayudó a resolver un problema con mi DNS a las 3 de la mañana. Excelente servicio.'],
  ['Pablo Herrera', 'pablo.herrera@correo.test', 'Node.js en compartido', '¿Puedo ejecutar una app de Node.js en el plan Negocio o necesito un VPS?'],
  ['Gabriela León', 'gabriela.leon@correo.test', 'Dominio .mx', '¿Venden dominios .com.mx? Me gustaría tener todo en el mismo lugar.'],
  ['Ernesto Campos', 'ernesto.campos@correo.test', 'Velocidad', 'Mi sitio en el plan Inicio carga lento por la tarde. ¿Pueden revisarlo?'],
  ['Natalia Ríos', 'natalia.rios@correo.test', 'Más métodos de pago', 'Sugiero aceptar pagos con Mercado Pago, sería más cómodo para muchos clientes.'],
  ['Óscar Fuentes', 'oscar.fuentes@correo.test', 'Certificado SSL comodín', '¿El SSL gratis cubre subdominios o necesito comprar un certificado comodín?'],
  ['Adriana Mejía', 'adriana.mejia@correo.test', 'Cambio de plan', 'Quiero pasar de Emprendedor a WP Pro sin perder mis correos. ¿Cómo se hace?'],
  ['Jaime Cordero', 'jaime.cordero@correo.test', 'Respaldos externos', '¿Puedo descargar mis respaldos automáticos a mi computadora o a Google Drive?'],
];
