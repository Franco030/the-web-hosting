/** Fecha local en formato YYYY-MM-DD (sin desfase por zona horaria). */
export function aFechaISO(fecha) {
  const d = new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

const formato = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const formatoHora = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export const fechaLegible = (fecha) => formato.format(new Date(fecha));
export const fechaHoraLegible = (fecha) => formatoHora.format(new Date(fecha));
