import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Body1,
  Button,
  Caption1,
  Input,
  makeStyles,
  mergeClasses,
  Subtitle2,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { Bot24Regular, Chat24Filled, Dismiss20Regular, Send20Filled } from "@fluentui/react-icons";
import api from "../services/ApiClient";
import { keyframes } from "../theme/motion";

const useStyles = makeStyles({
  fab: {
    position: "fixed",
    right: tokens.spacingHorizontalXL,
    bottom: tokens.spacingVerticalXL,
    zIndex: 20,
    boxShadow: tokens.shadow16,
    minWidth: "56px",
    height: "56px",
  },
  panel: {
    position: "fixed",
    zIndex: 21,
    right: tokens.spacingHorizontalXL,
    bottom: tokens.spacingVerticalXL,
    width: "380px",
    height: "min(580px, calc(100dvh - 96px))",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow28,
    overflow: "hidden",
    animationName: keyframes.fadeIn,
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveDecelerateMid,
    // En móvil el panel ocupa la pantalla y toca los bordes: esquinas rectas.
    "@media (max-width: 479px)": {
      inset: 0,
      width: "100%",
      height: "100dvh",
      borderRadius: 0,
      border: "none",
    },
  },
  encabezado: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  encabezadoTexto: { display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 },
  estado: { color: tokens.colorPaletteGreenForeground1 },
  mensajes: {
    flexGrow: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  burbuja: {
    maxWidth: "85%",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusLarge,
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground1,
  },
  usuario: {
    alignSelf: "flex-end",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  sugerencias: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalS },
  escribiendo: { color: tokens.colorNeutralForeground3 },
  formulario: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingHorizontalM,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  input: { flexGrow: 1 },
});

const BIENVENIDA = {
  autor: "bot",
  texto: "Hola, soy Hosti. Estoy disponible las 24 horas para ayudarte con planes, dominios, correo y dudas técnicas.",
  sugerencias: ["Ver planes y precios", "¿Incluye SSL gratis?", "¿Cómo migro mi sitio?", "Hablar con una persona"],
};

/** Chat de ayuda en línea las 24 horas (botón flotante + panel). */
export function Chatbot() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const listaRef = useRef(null);
  const inputRef = useRef(null);
  const botonRef = useRef(null);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, enviando]);

  useEffect(() => {
    if (!abierto) return undefined;
    inputRef.current?.focus();
    const alTeclear = (e) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    requestAnimationFrame(() => botonRef.current?.focus());
  };

  const enviar = async (contenido) => {
    const mensaje = contenido.trim();
    if (!mensaje || enviando) return;
    setTexto("");
    setMensajes((m) => [...m, { autor: "usuario", texto: mensaje }]);
    setEnviando(true);
    try {
      const respuesta = await api.post("/chatbot", { mensaje });
      setMensajes((m) => [...m, { autor: "bot", ...respuesta }]);
    } catch (error) {
      setMensajes((m) => [...m, { autor: "bot", texto: `${error.message} También puedes escribirnos desde Contacto.` }]);
    } finally {
      setEnviando(false);
    }
  };

  const ultimo = mensajes[mensajes.length - 1];

  if (!abierto) {
    return (
      <Tooltip content="Chat de ayuda 24 h" relationship="label">
        <Button
          ref={botonRef}
          appearance="primary"
          shape="circular"
          size="large"
          className={styles.fab}
          icon={<Chat24Filled />}
          onClick={() => setAbierto(true)}
        />
      </Tooltip>
    );
  }

  return (
    <section className={styles.panel} role="dialog" aria-label="Chat de ayuda">
      <div className={styles.encabezado}>
        <Avatar icon={<Bot24Regular />} color="brand" size={36} aria-hidden="true" />
        <div className={styles.encabezadoTexto}>
          <Subtitle2 as="h2">Hosti · Ayuda 24 h</Subtitle2>
          <Caption1 className={styles.estado}>En línea</Caption1>
        </div>
        <Tooltip content="Cerrar el chat" relationship="label">
          <Button appearance="subtle" icon={<Dismiss20Regular />} onClick={cerrar} />
        </Tooltip>
      </div>

      <div ref={listaRef} className={styles.mensajes} aria-live="polite">
        {mensajes.map((m, i) => (
          <div key={i} className={mergeClasses(styles.burbuja, m.autor === "bot" ? styles.bot : styles.usuario)}>
            <Body1>{m.texto}</Body1>
            {m.enlace && (
              <Button
                size="small"
                onClick={() => {
                  navigate(m.enlace.ruta);
                  if (window.matchMedia("(max-width: 479px)").matches) cerrar();
                }}
              >
                {m.enlace.texto}
              </Button>
            )}
          </div>
        ))}
        {enviando && <Caption1 className={styles.escribiendo}>Hosti está escribiendo…</Caption1>}
        {!enviando && ultimo.autor === "bot" && ultimo.sugerencias?.length > 0 && (
          <div className={styles.sugerencias}>
            {ultimo.sugerencias.map((s) => (
              <Button key={s} size="small" shape="circular" onClick={() => enviar(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}
      </div>

      <form
        className={styles.formulario}
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
      >
        <Input
          ref={inputRef}
          className={styles.input}
          value={texto}
          onChange={(_, d) => setTexto(d.value)}
          placeholder="Escribe tu pregunta"
          aria-label="Tu pregunta"
          maxLength={500}
        />
        <Tooltip content="Enviar" relationship="label">
          <Button type="submit" appearance="primary" icon={<Send20Filled />} disabled={!texto.trim() || enviando} />
        </Tooltip>
      </form>
    </section>
  );
}

export default Chatbot;
