import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Body1,
  Button,
  Field,
  Input,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { Call20Regular, Chat20Regular, Clock20Regular, Mail20Regular } from "@fluentui/react-icons";
import { FormActions, Page, PageHeader, Surface } from "../../components/ui/Page";
import api from "../../services/ApiClient";

const useStyles = makeStyles({
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
    gridTemplateColumns: "1fr",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" },
  },
  formulario: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL },
  dosColumnas: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  datos: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL },
  dato: { display: "flex", gap: tokens.spacingHorizontalM, alignItems: "flex-start" },
  icono: { color: tokens.colorBrandForeground1, flexShrink: 0, marginTop: "2px" },
  datoTexto: { display: "flex", flexDirection: "column" },
  secundario: { color: tokens.colorNeutralForeground3 },
});

const VACIO = { nombre: "", correo: "", asunto: "", mensaje: "" };
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(valores) {
  const errores = {};
  if (valores.nombre.trim().length < 2) errores.nombre = "Escribe tu nombre.";
  if (!CORREO_VALIDO.test(valores.correo.trim())) errores.correo = "Escribe un correo válido, por ejemplo nombre@dominio.com.";
  if (valores.asunto.trim().length < 3) errores.asunto = "Escribe el asunto (mínimo 3 caracteres).";
  if (valores.mensaje.trim().length < 10) errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  return errores;
}

/** Formulario de contacto: guarda la sugerencia y la envía por correo electrónico. */
export default function Contacto() {
  const styles = useStyles();
  const [params] = useSearchParams();
  const plan = params.get("plan");
  const [valores, setValores] = useState({ ...VACIO, asunto: plan ? `Quiero contratar el plan ${plan}` : "" });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const campo = (nombre) => ({
    value: valores[nombre],
    onChange: (_, d) => {
      setValores((v) => ({ ...v, [nombre]: d.value }));
      if (errores[nombre]) setErrores((e) => ({ ...e, [nombre]: undefined }));
    },
  });

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validar(valores);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    setEnviando(true);
    setResultado(null);
    try {
      await api.post("/sugerencias", valores);
      setResultado({ tipo: "success", texto: `Gracias, ${valores.nombre.split(" ")[0]}. Te enviamos una confirmación a ${valores.correo} y te responderemos en menos de 24 horas.` });
      setValores(VACIO);
    } catch (error) {
      setErrores(error.campos || {});
      setResultado({ tipo: "error", texto: error.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Page centrada>
      <PageHeader
        title="Contacto"
        description="Déjanos tu pregunta, sugerencia o solicitud de contratación. Te llega una copia por correo."
      />
      <div className={styles.rejilla}>
        <Surface as="form" className={styles.formulario} onSubmit={enviar} noValidate>
          {resultado && (
            <MessageBar intent={resultado.tipo}>
              <MessageBarBody>
                <MessageBarTitle>{resultado.tipo === "success" ? "Mensaje enviado" : "No se envió tu mensaje"}</MessageBarTitle>
                {resultado.texto}
              </MessageBarBody>
            </MessageBar>
          )}
          <div className={styles.dosColumnas}>
            <Field label="Nombre" required validationMessage={errores.nombre}>
              <Input {...campo("nombre")} autoComplete="name" maxLength={120} />
            </Field>
            <Field label="Correo electrónico" required validationMessage={errores.correo}>
              <Input {...campo("correo")} type="email" autoComplete="email" maxLength={160} />
            </Field>
          </div>
          <Field label="Asunto" required validationMessage={errores.asunto}>
            <Input {...campo("asunto")} maxLength={160} />
          </Field>
          <Field
            label="Mensaje"
            required
            validationMessage={errores.mensaje}
            hint={`${valores.mensaje.length} de 4,000 caracteres`}
          >
            <Textarea {...campo("mensaje")} rows={6} resize="vertical" maxLength={4000} />
          </Field>
          <FormActions>
            <Button type="submit" appearance="primary" disabled={enviando} icon={enviando ? <Spinner size="tiny" /> : undefined}>
              {enviando ? "Enviando" : "Enviar mensaje"}
            </Button>
          </FormActions>
        </Surface>

        <Surface className={styles.datos}>
          <Subtitle2 as="h2">Otras formas de contactarnos</Subtitle2>
          {[
            [Chat20Regular, "Chat de ayuda", "Abierto las 24 horas, botón abajo a la derecha"],
            [Mail20Regular, "Correo", "contacto@thewebhosting.test"],
            [Call20Regular, "Teléfono", "55 0000 0000"],
            [Clock20Regular, "Horario de asesores", "Lunes a sábado, de 9:00 a 20:00"],
          ].map(([Icono, titulo, texto]) => (
            <div key={titulo} className={styles.dato}>
              <Icono className={styles.icono} aria-hidden="true" />
              <div className={styles.datoTexto}>
                <Body1>
                  <strong>{titulo}</strong>
                </Body1>
                <Body1 className={styles.secundario}>{texto}</Body1>
              </div>
            </div>
          ))}
        </Surface>
      </div>
    </Page>
  );
}
