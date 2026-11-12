import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { fechaHoraLegible, fechaLegible } from '../utils/fechas.js';

const MARCA = '#456ad1';
const TEXTO = '#242424';
const TEXTO_2 = '#616161';
const BORDE = '#e0e0e0';
const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** Convierte un PDFDocument en Buffer cuando termina de escribirse. */
function aBuffer(doc) {
  return new Promise((resolve, reject) => {
    const partes = [];
    doc.on('data', (p) => partes.push(p));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);
    doc.end();
  });
}

/** Encabezado común: banda de marca con título y fecha de generación. */
function encabezado(doc, titulo, subtitulo) {
  const ancho = doc.page.width;
  doc.rect(0, 0, ancho, 86).fill(MARCA);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text(titulo, 48, 26, { width: ancho - 96 });
  doc.font('Helvetica').fontSize(10).text(subtitulo, 48, 54, { width: ancho - 96 });
  doc.fillColor(TEXTO).moveDown(0);
  doc.y = 110;
}

function piePaginas(doc) {
  const rango = doc.bufferedPageRange();
  for (let i = rango.start; i < rango.start + rango.count; i += 1) {
    doc.switchToPage(i);
    const y = doc.page.height - 40;
    doc.font('Helvetica').fontSize(8).fillColor(TEXTO_2)
      .text(`The Web Hosting · Página ${i + 1} de ${rango.count}`, 48, y, { width: doc.page.width - 96, align: 'center', lineBreak: false });
  }
}

/** Tabla simple con encabezado repetido en cada página. */
function tabla(doc, columnas, filas) {
  const x0 = 48;
  const anchoTotal = doc.page.width - 96;
  const anchos = columnas.map((c) => c.ancho * anchoTotal);

  const dibujarEncabezado = () => {
    const y = doc.y;
    doc.rect(x0, y, anchoTotal, 22).fill('#f0f4fd');
    doc.fillColor(TEXTO).font('Helvetica-Bold').fontSize(9);
    let x = x0;
    columnas.forEach((c, i) => {
      doc.text(c.titulo, x + 6, y + 7, { width: anchos[i] - 12, lineBreak: false, ellipsis: true });
      x += anchos[i];
    });
    doc.y = y + 22;
  };

  dibujarEncabezado();
  doc.font('Helvetica').fontSize(9);
  for (const fila of filas) {
    const valores = columnas.map((c) => String(c.valor(fila) ?? ''));
    const alto = Math.max(...valores.map((v, i) => doc.heightOfString(v, { width: anchos[i] - 12 }))) + 12;
    if (doc.y + alto > doc.page.height - 60) {
      doc.addPage();
      doc.y = 48;
      dibujarEncabezado();
      doc.font('Helvetica').fontSize(9);
    }
    const y = doc.y;
    let x = x0;
    doc.fillColor(TEXTO);
    valores.forEach((v, i) => {
      doc.text(v, x + 6, y + 6, { width: anchos[i] - 12 });
      x += anchos[i];
    });
    doc.moveTo(x0, y + alto).lineTo(x0 + anchoTotal, y + alto).lineWidth(0.5).strokeColor(BORDE).stroke();
    doc.y = y + alto;
  }
}

const especificaciones = (plan) => [
  ['Tipo de plan', plan.tipo],
  ['Precio mensual', moneda.format(plan.precioMensual)],
  ['Almacenamiento', `${plan.almacenamientoGB} GB SSD NVMe`],
  ['Transferencia mensual', plan.transferenciaGB ? `${plan.transferenciaGB} GB` : 'Ilimitada'],
  ['Sitios web', plan.sitios >= 999 ? 'Ilimitados' : String(plan.sitios)],
  ['Cuentas de correo', plan.cuentasCorreo >= 999 ? 'Ilimitadas' : String(plan.cuentasCorreo)],
  ['Bases de datos', plan.basesDatos >= 999 ? 'Ilimitadas' : String(plan.basesDatos)],
  ['Memoria RAM', plan.ram || 'Compartida'],
  ['Procesador', plan.cpu || 'Compartido'],
  ['Certificado SSL gratis', plan.sslGratis ? 'Incluido' : 'No incluido'],
  ['Respaldos', plan.respaldos],
  ['Soporte', plan.soporte],
];

export class ExportService {
  /** Excel de sugerencias con encabezado fijo y filtros. */
  async sugerenciasExcel(sugerencias) {
    const libro = new ExcelJS.Workbook();
    libro.creator = 'The Web Hosting';
    libro.created = new Date();
    const hoja = libro.addWorksheet('Sugerencias', { views: [{ state: 'frozen', ySplit: 1 }] });
    hoja.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm' } },
      { header: 'Nombre', key: 'nombre', width: 26 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Asunto', key: 'asunto', width: 32 },
      { header: 'Mensaje', key: 'mensaje', width: 70 },
      { header: 'Leída', key: 'leida', width: 10 },
    ];
    sugerencias.forEach((s) =>
      hoja.addRow({
        id: s.id,
        fecha: new Date(s.createdAt),
        nombre: s.nombre,
        correo: s.correo,
        asunto: s.asunto,
        mensaje: s.mensaje,
        leida: s.leida ? 'Sí' : 'No',
      })
    );
    const encabezadoFila = hoja.getRow(1);
    encabezadoFila.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezadoFila.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF456AD1' } };
    hoja.getColumn('mensaje').alignment = { wrapText: true, vertical: 'top' };
    hoja.autoFilter = { from: 'A1', to: 'G1' };
    return Buffer.from(await libro.xlsx.writeBuffer());
  }

  async sugerenciasPdf(sugerencias) {
    const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 48, bufferPages: true });
    encabezado(doc, 'Sugerencias recibidas', `${sugerencias.length} mensajes · generado el ${fechaHoraLegible(new Date())}`);
    tabla(
      doc,
      [
        { titulo: 'Fecha', ancho: 0.12, valor: (s) => fechaLegible(s.createdAt) },
        { titulo: 'Nombre', ancho: 0.15, valor: (s) => s.nombre },
        { titulo: 'Correo', ancho: 0.18, valor: (s) => s.correo },
        { titulo: 'Asunto', ancho: 0.17, valor: (s) => s.asunto },
        { titulo: 'Mensaje', ancho: 0.31, valor: (s) => s.mensaje },
        { titulo: 'Leída', ancho: 0.07, valor: (s) => (s.leida ? 'Sí' : 'No') },
      ],
      sugerencias
    );
    piePaginas(doc);
    return aBuffer(doc);
  }

  /** Ficha técnica de un plan de hosting. */
  async fichaTecnicaPdf(plan) {
    const doc = new PDFDocument({ size: 'LETTER', margin: 48, bufferPages: true });
    encabezado(doc, `Ficha técnica · ${plan.nombre}`, `Plan ${plan.tipo} · generada el ${fechaHoraLegible(new Date())}`);

    doc.font('Helvetica-Bold').fontSize(28).fillColor(MARCA).text(moneda.format(plan.precioMensual), 48, doc.y, { continued: true });
    doc.font('Helvetica').fontSize(12).fillColor(TEXTO_2).text('  al mes, IVA incluido');
    doc.moveDown(0.6);
    doc.font('Helvetica').fontSize(11).fillColor(TEXTO).text(plan.descripcion, { width: doc.page.width - 96 });
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(13).text('Especificaciones');
    doc.moveDown(0.4);
    tabla(
      doc,
      [
        { titulo: 'Característica', ancho: 0.45, valor: (f) => f[0] },
        { titulo: 'Valor', ancho: 0.55, valor: (f) => f[1] },
      ],
      especificaciones(plan)
    );
    doc.moveDown(1.5);
    doc.font('Helvetica').fontSize(9).fillColor(TEXTO_2).text(
      'Precios en pesos mexicanos. Garantía de reembolso de 30 días. Disponibilidad garantizada del 99.9 %. ' +
        'Contrata o resuelve dudas en el chat de ayuda, abierto las 24 horas.',
      48,
      doc.y,
      { width: doc.page.width - 96 }
    );
    piePaginas(doc);
    return aBuffer(doc);
  }

  /** Resultado de una búsqueda de planes en un solo PDF comparativo. */
  async catalogoPdf(planes, descripcionBusqueda) {
    const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 48, bufferPages: true });
    encabezado(doc, 'Planes de hosting', `${descripcionBusqueda} · ${planes.length} planes · ${fechaHoraLegible(new Date())}`);
    tabla(
      doc,
      [
        { titulo: 'Plan', ancho: 0.16, valor: (p) => p.nombre },
        { titulo: 'Tipo', ancho: 0.1, valor: (p) => p.tipo },
        { titulo: 'Precio/mes', ancho: 0.11, valor: (p) => moneda.format(p.precioMensual) },
        { titulo: 'Almacenamiento', ancho: 0.12, valor: (p) => `${p.almacenamientoGB} GB` },
        { titulo: 'Transferencia', ancho: 0.11, valor: (p) => (p.transferenciaGB ? `${p.transferenciaGB} GB` : 'Ilimitada') },
        { titulo: 'Sitios', ancho: 0.08, valor: (p) => (p.sitios >= 999 ? 'Ilimitados' : p.sitios) },
        { titulo: 'RAM / CPU', ancho: 0.17, valor: (p) => [p.ram, p.cpu].filter(Boolean).join(' · ') || 'Compartidos' },
        { titulo: 'Respaldos', ancho: 0.15, valor: (p) => p.respaldos },
      ],
      planes
    );
    piePaginas(doc);
    return aBuffer(doc);
  }
}

export const exportService = new ExportService();
