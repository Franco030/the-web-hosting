import { useState } from "react";
import { Body1, Caption1, makeStyles, MessageBar, Subtitle2, tokens } from "@fluentui/react-components";
import { Speaker220Regular, Video20Regular } from "@fluentui/react-icons";
import { Surface } from "../../components/ui/Page";

const useStyles = makeStyles({
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalXL,
    gridTemplateColumns: "1fr",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" },
  },
  // Video a sangre en la tarjeta: el contenedor recorta las esquinas.
  video: {
    display: "block",
    width: "100%",
    aspectRatio: "16 / 9",
    backgroundColor: "#000",
  },
  pieVideo: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalL,
  },
  titulo: { display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS },
  icono: { color: tokens.colorBrandForeground1, flexShrink: 0 },
  texto: { color: tokens.colorNeutralForeground2 },
  audioTarjeta: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM },
  audio: { width: "100%" },
  lista: {
    margin: 0,
    paddingInlineStart: tokens.spacingHorizontalXL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground2,
  },
});

/** Video institucional (2–4 min) y mensaje de audio. Archivos en public/media. */
export function Multimedia() {
  const styles = useStyles();
  const [videoFalla, setVideoFalla] = useState(false);
  const [audioFalla, setAudioFalla] = useState(false);

  return (
    <div className={styles.rejilla}>
      <Surface flush>
        {videoFalla ? (
          <MessageBar intent="warning">No se pudo cargar el video. Recarga la página para intentarlo de nuevo.</MessageBar>
        ) : (
          <video
            className={styles.video}
            controls
            preload="metadata"
            poster="/media/video-poster.jpg"
            width="1280"
            height="720"
            onError={() => setVideoFalla(true)}
          >
            <source src="/media/video-promocional.mp4" type="video/mp4" onError={() => setVideoFalla(true)} />
            <track kind="captions" src="/media/video-promocional.vtt" srcLang="es" label="Español" default />
          </video>
        )}
        <div className={styles.pieVideo}>
          <Subtitle2 as="h3" className={styles.titulo}>
            <Video20Regular className={styles.icono} aria-hidden="true" />
            Quiénes somos y cómo te ayudamos
          </Subtitle2>
          <Body1 className={styles.texto}>
            Conoce el objetivo de The Web Hosting, la promoción de temporada y consejos para elegir el plan adecuado para tu
            proyecto.
          </Body1>
        </div>
      </Surface>

      <Surface className={styles.audioTarjeta}>
        <Subtitle2 as="h3" className={styles.titulo}>
          <Speaker220Regular className={styles.icono} aria-hidden="true" />
          Mensaje de bienvenida
        </Subtitle2>
        <Body1 className={styles.texto}>Escucha en un minuto lo que incluye cada plan y cómo aprovechar la promoción.</Body1>
        {audioFalla ? (
          <MessageBar intent="warning">No se pudo cargar el audio.</MessageBar>
        ) : (
          <audio className={styles.audio} controls preload="none" onError={() => setAudioFalla(true)}>
            <source src="/media/mensaje-bienvenida.mp3" type="audio/mpeg" />
          </audio>
        )}
        <Caption1 className={styles.texto}>Promoción vigente</Caption1>
        <ul className={styles.lista}>
          <li>Dominio .com gratis el primer año en planes anuales.</li>
          <li>Migración de tu sitio sin costo.</li>
          <li>30 días de garantía de reembolso.</li>
        </ul>
      </Surface>
    </div>
  );
}

export default Multimedia;
