/**
 * Genera el diagrama de Gantt a partir de herramientas/gantt.json:
 *   - docs/diagrama-gantt.xlsx  (tabla de tareas + barras por día, color por integrante)
 *   - docs/07-diagrama-gantt.md (diagrama Mermaid y tabla de asignaciones)
 *
 * Uso: node herramientas/generar_gantt.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(raiz, 'backend', 'package.json'));
const ExcelJS = require('exceljs');

const datos = JSON.parse(fs.readFileSync(path.join(raiz, 'herramientas', 'gantt.json'), 'utf8'));
const COLORES = ['456AD1', '0E9F8E', 'D77B0F', 'A14FC9', 'D1426B', '2E7D32'];

const deISO = (iso) => new Date(`${iso}T00:00:00`);
const aISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumar = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const tareas = datos.tareas.map((t) => {
  const inicio = deISO(t.inicio);
  const fin = sumar(inicio, t.dias - 1);
  return { ...t, inicioD: inicio, finD: fin, persona: datos.integrantes[t.responsable] };
});
const primero = new Date(Math.min(...tareas.map((t) => t.inicioD)));
const ultimo = new Date(Math.max(...tareas.map((t) => t.finD)));
const totalDias = Math.round((ultimo - primero) / 86400000) + 1;

// ---------- Excel ----------
const libro = new ExcelJS.Workbook();
const hoja = libro.addWorksheet('Gantt', { views: [{ state: 'frozen', xSplit: 6, ySplit: 3 }] });
hoja.getCell('A1').value = `Diagrama de Gantt · ${datos.proyecto}`;
hoja.getCell('A1').font = { bold: true, size: 14 };
const fijas = ['Fase', 'Tarea', 'Responsable', 'Inicio', 'Fin', 'Días'];
const anchos = [26, 48, 16, 12, 12, 6];
fijas.forEach((t, i) => {
  hoja.getColumn(i + 1).width = anchos[i];
  const c = hoja.getCell(3, i + 1);
  c.value = t;
});
for (let d = 0; d < totalDias; d += 1) {
  const fecha = sumar(primero, d);
  const col = 7 + d;
  hoja.getColumn(col).width = 3.2;
  if (fecha.getDay() === 1 || d === 0) {
    hoja.getCell(2, col).value = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    hoja.getCell(2, col).font = { size: 8 };
  }
  hoja.getCell(3, col).value = fecha.getDate();
  hoja.getCell(3, col).alignment = { horizontal: 'center' };
  hoja.getCell(3, col).font = { size: 8 };
}
const encabezado = hoja.getRow(3);
encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
encabezado.eachCell((c) => {
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF273F83' } };
});

tareas.forEach((t, i) => {
  const fila = hoja.getRow(4 + i);
  fila.values = [t.fase, t.tarea, t.persona, t.inicioD, t.finD, t.dias];
  fila.getCell(4).numFmt = 'dd/mm/yyyy';
  fila.getCell(5).numFmt = 'dd/mm/yyyy';
  const desde = Math.round((t.inicioD - primero) / 86400000);
  for (let d = 0; d < t.dias; d += 1) {
    fila.getCell(7 + desde + d).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORES[t.responsable % COLORES.length]}` } };
  }
});

const filaLeyenda = 5 + tareas.length;
hoja.getCell(filaLeyenda, 1).value = 'Integrantes';
hoja.getCell(filaLeyenda, 1).font = { bold: true };
datos.integrantes.forEach((nombre, i) => {
  hoja.getCell(filaLeyenda + 1 + i, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORES[i % COLORES.length]}` } };
  hoja.getCell(filaLeyenda + 1 + i, 2).value = `${nombre} · ${tareas.filter((t) => t.responsable === i).reduce((s, t) => s + t.dias, 0)} días asignados`;
});

const resumen = libro.addWorksheet('Asignaciones');
resumen.columns = [
  { header: 'Integrante', key: 'persona', width: 20 },
  { header: 'Tarea', key: 'tarea', width: 50 },
  { header: 'Fase', key: 'fase', width: 28 },
  { header: 'Inicio', key: 'inicio', width: 12 },
  { header: 'Fin', key: 'fin', width: 12 },
  { header: 'Días', key: 'dias', width: 8 },
];
[...tareas].sort((a, b) => a.responsable - b.responsable || a.inicioD - b.inicioD).forEach((t) =>
  resumen.addRow({ persona: t.persona, tarea: t.tarea, fase: t.fase, inicio: aISO(t.inicioD), fin: aISO(t.finD), dias: t.dias })
);
resumen.getRow(1).font = { bold: true };

await libro.xlsx.writeFile(path.join(raiz, 'docs', 'diagrama-gantt.xlsx'));

// ---------- Markdown ----------
const fases = [...new Set(tareas.map((t) => t.fase))];
const mermaid = [
  'gantt',
  `  title ${datos.proyecto}`,
  '  dateFormat YYYY-MM-DD',
  '  axisFormat %d %b',
  ...fases.flatMap((fase) => [
    `  section ${fase.replace(/^\d+\.\s*/, '')}`,
    ...tareas.filter((t) => t.fase === fase).map((t) => `  ${t.tarea.replace(/[:#;]/g, ' ')} (${t.persona}) : ${aISO(t.inicioD)}, ${t.dias}d`),
  ]),
].join('\n');

const tabla = [
  '| Fase | Tarea | Responsable | Inicio | Fin | Días |',
  '| --- | --- | --- | --- | --- | --- |',
  ...tareas.map((t) => `| ${t.fase} | ${t.tarea} | ${t.persona} | ${aISO(t.inicioD)} | ${aISO(t.finD)} | ${t.dias} |`),
].join('\n');

const carga = datos.integrantes
  .map((n, i) => `| ${n} | ${tareas.filter((t) => t.responsable === i).length} | ${tareas.filter((t) => t.responsable === i).reduce((s, t) => s + t.dias, 0)} |`)
  .join('\n');

const md = `# 7. Diagrama de Gantt

Asignaciones y tiempos de cada integrante del equipo. La versión con barras de colores está en [\`diagrama-gantt.xlsx\`](diagrama-gantt.xlsx).

> **Antes de entregar:** reemplaza "Integrante 1…4" y las fechas por los datos reales del equipo en \`herramientas/gantt.json\` y ejecuta \`node herramientas/generar_gantt.mjs\`. Se regeneran este archivo y el Excel.

Periodo: ${aISO(primero)} a ${aISO(ultimo)} (${totalDias} días naturales).

\`\`\`mermaid
${mermaid}
\`\`\`

## Asignaciones

${tabla}

## Carga por integrante

| Integrante | Tareas | Días asignados |
| --- | --- | --- |
${carga}
`;
fs.writeFileSync(path.join(raiz, 'docs', '07-diagrama-gantt.md'), md, 'utf8');
console.log(`Gantt generado: ${tareas.length} tareas, ${totalDias} días.`);
