import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  makeStyles,
  MessageBar,
  Option,
  Spinner,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import api from "../../services/ApiClient";
import { calendarioEs } from "../../lib/calendarioEs";
import { formatoFecha, hoyISO } from "../../lib/formato";

const ESTADOS = ["Activa", "Suspendida", "Cancelada"];

const aISO = (fecha) =>
  fecha ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}` : "";
const deISO = (iso) => (iso ? new Date(`${iso}T00:00:00`) : null);
const enUnAno = (iso) => {
  const d = deISO(iso);
  d.setFullYear(d.getFullYear() + 1);
  return aISO(d);
};

const useStyles = makeStyles({
  surface: { maxWidth: "640px", width: "100%" },
  contenido: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL },
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    // Los controles de Fluent traen un ancho mínimo propio (Dropdown: 250 px).
    "& .fui-Dropdown, & .fui-Input": { minWidth: 0, width: "100%" },
  },
});

/** Alta y edición de una contratación (cliente + plan + vigencia). */
export function ContratacionFormDialog({ abierto, contratacion, planes, onCerrar, onGuardado }) {
  const styles = useStyles();
  const editando = Boolean(contratacion?.id);
  // El padre monta el diálogo con una `key` por apertura: el estado inicial se
  // calcula una sola vez y los controles nunca reciben valores vacíos.
  const [v, setV] = useState(() => {
    const inicio = hoyISO();
    return contratacion?.id
      ? {
          planId: contratacion.planId,
          dominio: contratacion.dominio,
          fechaInicio: contratacion.fechaInicio,
          fechaVencimiento: contratacion.fechaVencimiento,
          estado: contratacion.estado,
        }
      : { nombre: "", correo: "", empresa: "", planId: planes[0]?.id, dominio: "", fechaInicio: inicio, fechaVencimiento: enUnAno(inicio), estado: "Activa" };
  });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const set = (campo, valor) => {
    setV((x) => ({ ...x, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    const encontrados = {};
    if (!editando && !v.nombre?.trim()) encontrados.nombre = "Escribe el nombre del cliente.";
    if (!editando && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo || "")) encontrados.correo = "Escribe un correo válido.";
    if (!v.dominio?.trim()) encontrados.dominio = "Escribe el dominio, por ejemplo minegocio.mx.";
    if (v.fechaVencimiento < v.fechaInicio) encontrados.fechaVencimiento = "Debe ser posterior a la fecha de inicio.";
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;

    const datos = { planId: v.planId, dominio: v.dominio.trim().toLowerCase(), fechaInicio: v.fechaInicio, fechaVencimiento: v.fechaVencimiento, estado: v.estado };
    setGuardando(true);
    setError(null);
    try {
      const guardada = editando
        ? await api.put(`/contrataciones/${contratacion.id}`, datos)
        : await api.post("/contrataciones", { ...datos, cliente: { nombre: v.nombre, correo: v.correo, empresa: v.empresa } });
      onGuardado(guardada, editando);
    } catch (err) {
      setErrores(err.campos || {});
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const planSeleccionado = planes.find((p) => p.id === v.planId);

  return (
    <Dialog open={abierto} onOpenChange={(_, d) => !d.open && !guardando && onCerrar()}>
      <DialogSurface className={styles.surface}>
        <form onSubmit={guardar} noValidate>
          <DialogBody>
            <DialogTitle>{editando ? `Editar ${contratacion.dominio}` : "Registrar contratación"}</DialogTitle>
            <DialogContent className={styles.contenido}>
              {error && <MessageBar intent="error">{error}</MessageBar>}
              {editando ? (
                <Subtitle2>{contratacion.cliente?.nombre} · {contratacion.cliente?.correo}</Subtitle2>
              ) : (
                <div className={styles.rejilla}>
                  <Field label="Nombre del cliente" required validationMessage={errores.nombre}>
                    <Input value={v.nombre || ""} onChange={(_, d) => set("nombre", d.value)} />
                  </Field>
                  <Field label="Correo del cliente" required validationMessage={errores.correo} hint="Si ya existe, se usa ese cliente">
                    <Input type="email" value={v.correo || ""} onChange={(_, d) => set("correo", d.value)} />
                  </Field>
                  <Field label="Empresa">
                    <Input value={v.empresa || ""} onChange={(_, d) => set("empresa", d.value)} />
                  </Field>
                </div>
              )}
              <div className={styles.rejilla}>
                <Field label="Plan" required>
                  <Dropdown
                    value={planSeleccionado ? `${planSeleccionado.nombre} · ${planSeleccionado.tipo}` : ""}
                    selectedOptions={v.planId ? [String(v.planId)] : []}
                    onOptionSelect={(_, d) => set("planId", Number(d.optionValue))}
                  >
                    {planes.map((p) => (
                      <Option key={p.id} value={String(p.id)} text={`${p.nombre} · ${p.tipo}`}>
                        {`${p.nombre} · ${p.tipo}`}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Dominio" required validationMessage={errores.dominio}>
                  <Input value={v.dominio || ""} onChange={(_, d) => set("dominio", d.value)} placeholder="minegocio.mx" />
                </Field>
                <Field label="Fecha de inicio" required validationMessage={errores.fechaInicio}>
                  <DatePicker
                    value={deISO(v.fechaInicio)}
                    onSelectDate={(d) => d && set("fechaInicio", aISO(d))}
                    formatDate={(d) => (d ? formatoFecha(d) : "")}
                    strings={calendarioEs}
                    firstDayOfWeek={1}
                  />
                </Field>
                <Field label="Fecha de vencimiento" required validationMessage={errores.fechaVencimiento}>
                  <DatePicker
                    value={deISO(v.fechaVencimiento)}
                    onSelectDate={(d) => d && set("fechaVencimiento", aISO(d))}
                    formatDate={(d) => (d ? formatoFecha(d) : "")}
                    strings={calendarioEs}
                    firstDayOfWeek={1}
                    minDate={deISO(v.fechaInicio) || undefined}
                  />
                </Field>
                <Field label="Estado">
                  <Dropdown value={v.estado} selectedOptions={[v.estado]} onOptionSelect={(_, d) => set("estado", d.optionValue)}>
                    {ESTADOS.map((e) => (
                      <Option key={e}>{e}</Option>
                    ))}
                  </Dropdown>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button type="submit" appearance="primary" disabled={guardando} icon={guardando ? <Spinner size="tiny" /> : undefined}>
                {editando ? "Guardar cambios" : "Registrar"}
              </Button>
              <Button onClick={onCerrar} disabled={guardando}>
                Cancelar
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}

export default ContratacionFormDialog;
