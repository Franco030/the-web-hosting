const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const numero = new Intl.NumberFormat("es-MX");
const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });
const fechaCorta = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });

export const formatoMoneda = (v) => moneda.format(Number(v) || 0);
export const formatoNumero = (v) => numero.format(Number(v) || 0);
/** Acepta Date, ISO o "YYYY-MM-DD" (fecha local, sin desfase de zona). */
const aFecha = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00`) : new Date(v));
export const formatoFecha = (v) => fecha.format(aFecha(v));
export const formatoFechaCorta = (v) => fechaCorta.format(aFecha(v));

export const ilimitado = (v, unidad = "", femenino = false) =>
  v === null || v === undefined || v >= 999 ? (femenino ? "Ilimitadas" : "Ilimitados") : `${numero.format(v)}${unidad}`;

/** Días entre hoy y una fecha "YYYY-MM-DD" (0 = hoy). */
export const diasHasta = (v) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((aFecha(v) - hoy) / 86400000);
};

export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
