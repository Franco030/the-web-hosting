import { useEffect, useState } from "react";
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
  SpinButton,
  Spinner,
  Switch,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import api from "../../services/ApiClient";

const TIPOS = ["Compartido", "WordPress", "VPS", "Cloud", "Dedicado"];
const RESPALDOS = ["Semanales", "Diarios", "Cada 6 horas"];

export const PLAN_VACIO = {
  nombre: "",
  tipo: "Compartido",
  descripcion: "",
  precioMensual: 99,
  almacenamientoGB: 10,
  transferenciaGB: "",
  sitios: 1,
  cuentasCorreo: 5,
  basesDatos: 1,
  ram: "",
  cpu: "",
  sslGratis: true,
  respaldos: "Semanales",
  soporte: "24/7 por chat y correo",
  destacado: false,
  activo: true,
};

const useStyles = makeStyles({
  surface: { maxWidth: "720px", width: "100%" },
  contenido: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL },
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    // Los controles de Fluent traen un ancho mínimo propio (Dropdown: 250 px).
    "& .fui-Dropdown, & .fui-Input, & .fui-SpinButton": { minWidth: 0, width: "100%" },
  },
  switches: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalXL },
});

/** Alta y edición de un plan (mantenimiento solo para administradores). */
export function PlanFormDialog({ abierto, plan, onCerrar, onGuardado }) {
  const styles = useStyles();
  const editando = Boolean(plan?.id);
  const [valores, setValores] = useState(PLAN_VACIO);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setValores(plan ? { ...PLAN_VACIO, ...plan, transferenciaGB: plan.transferenciaGB ?? "", ram: plan.ram ?? "", cpu: plan.cpu ?? "" } : PLAN_VACIO);
      setErrores({});
      setError(null);
    }
  }, [abierto, plan]);

  const set = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  };
  const texto = (campo) => ({ value: String(valores[campo] ?? ""), onChange: (_, d) => set(campo, d.value) });
  const numero = (campo, min = 0) => ({
    value: valores[campo] === "" ? null : Number(valores[campo]),
    min,
    onChange: (_, d) => {
      const v = d.value ?? (d.displayValue !== undefined ? Number(d.displayValue) : null);
      set(campo, Number.isNaN(v) || v === null ? "" : v);
    },
  });

  const guardar = async (e) => {
    e.preventDefault();
    const encontrados = {};
    if (!valores.nombre.trim()) encontrados.nombre = "Escribe el nombre del plan.";
    if (valores.precioMensual === "" || valores.precioMensual < 0) encontrados.precioMensual = "Escribe un precio válido.";
    if (!valores.almacenamientoGB || valores.almacenamientoGB < 1) encontrados.almacenamientoGB = "Mínimo 1 GB.";
    if (!valores.descripcion.trim()) encontrados.descripcion = "Describe el plan en una o dos oraciones.";
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;

    const datos = {
      ...valores,
      nombre: valores.nombre.trim(),
      transferenciaGB: valores.transferenciaGB === "" ? null : Number(valores.transferenciaGB),
      ram: valores.ram || null,
      cpu: valores.cpu || null,
    };
    delete datos.id;
    delete datos.createdAt;
    delete datos.updatedAt;

    setGuardando(true);
    setError(null);
    try {
      const guardado = editando ? await api.put(`/planes/${plan.id}`, datos) : await api.post("/planes", datos);
      onGuardado(guardado, editando);
    } catch (err) {
      setErrores(err.campos || {});
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(_, d) => !d.open && !guardando && onCerrar()}>
      <DialogSurface className={styles.surface}>
        <form onSubmit={guardar} noValidate>
          <DialogBody>
            <DialogTitle>{editando ? `Editar ${plan.nombre}` : "Agregar plan"}</DialogTitle>
            <DialogContent className={styles.contenido}>
              {error && <MessageBar intent="error">{error}</MessageBar>}
              <div className={styles.rejilla}>
                <Field label="Nombre" required validationMessage={errores.nombre}>
                  <Input {...texto("nombre")} maxLength={80} />
                </Field>
                <Field label="Tipo" required validationMessage={errores.tipo}>
                  <Dropdown value={valores.tipo} selectedOptions={[valores.tipo]} onOptionSelect={(_, d) => set("tipo", d.optionValue)}>
                    {TIPOS.map((t) => (
                      <Option key={t}>{t}</Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Precio mensual (MXN)" required validationMessage={errores.precioMensual}>
                  <SpinButton {...numero("precioMensual")} step={10} />
                </Field>
              </div>
              <Field label="Descripción" required validationMessage={errores.descripcion}>
                <Textarea {...texto("descripcion")} rows={3} resize="vertical" />
              </Field>
              <div className={styles.rejilla}>
                <Field label="Almacenamiento (GB)" required validationMessage={errores.almacenamientoGB}>
                  <SpinButton {...numero("almacenamientoGB", 1)} />
                </Field>
                <Field label="Transferencia (GB)" hint="Vacío = ilimitada" validationMessage={errores.transferenciaGB}>
                  <SpinButton {...numero("transferenciaGB")} step={100} />
                </Field>
                <Field label="Sitios web" hint="999 = ilimitados" validationMessage={errores.sitios}>
                  <SpinButton {...numero("sitios", 1)} />
                </Field>
                <Field label="Cuentas de correo" validationMessage={errores.cuentasCorreo}>
                  <SpinButton {...numero("cuentasCorreo")} />
                </Field>
                <Field label="Bases de datos" validationMessage={errores.basesDatos}>
                  <SpinButton {...numero("basesDatos")} />
                </Field>
                <Field label="Respaldos">
                  <Dropdown value={valores.respaldos} selectedOptions={[valores.respaldos]} onOptionSelect={(_, d) => set("respaldos", d.optionValue)}>
                    {RESPALDOS.map((r) => (
                      <Option key={r}>{r}</Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Memoria RAM" hint="Ej. 4 GB; vacío = compartida">
                  <Input {...texto("ram")} maxLength={20} />
                </Field>
                <Field label="Procesador" hint="Ej. 2 vCPU">
                  <Input {...texto("cpu")} maxLength={40} />
                </Field>
                <Field label="Soporte">
                  <Input {...texto("soporte")} maxLength={60} />
                </Field>
              </div>
              <div className={styles.switches}>
                <Switch label="SSL gratis" checked={valores.sslGratis} onChange={(_, d) => set("sslGratis", d.checked)} />
                <Switch label="Destacado en el inicio" checked={valores.destacado} onChange={(_, d) => set("destacado", d.checked)} />
                <Switch label="Visible en el catálogo" checked={valores.activo} onChange={(_, d) => set("activo", d.checked)} />
              </div>
            </DialogContent>
            <DialogActions>
              <Button type="submit" appearance="primary" disabled={guardando} icon={guardando ? <Spinner size="tiny" /> : undefined}>
                {editando ? "Guardar cambios" : "Agregar plan"}
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

export default PlanFormDialog;
