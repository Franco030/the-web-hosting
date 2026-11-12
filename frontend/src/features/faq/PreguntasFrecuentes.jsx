import { useNavigate } from "react-router-dom";
import { Body1, Button, makeStyles, Subtitle2, tokens } from "@fluentui/react-components";
import { Page, PageHeader, Surface } from "../../components/ui/Page";
import { AcordeonPreguntas } from "./AcordeonPreguntas";

const useStyles = makeStyles({
  ayuda: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: tokens.spacingVerticalS },
  texto: { color: tokens.colorNeutralForeground2 },
});

export default function PreguntasFrecuentes() {
  const styles = useStyles();
  const navigate = useNavigate();
  return (
    <Page centrada>
      <PageHeader
        title="Preguntas frecuentes"
        description="Respuestas rápidas sobre planes, pagos, seguridad y migraciones. Abre una pregunta para ver la respuesta."
      />
      <AcordeonPreguntas />
      <Surface className={styles.ayuda}>
        <Subtitle2 as="h2">¿No encontraste tu respuesta?</Subtitle2>
        <Body1 className={styles.texto}>
          Pregúntale a Hosti con el botón de chat (abajo a la derecha) o deja tu mensaje a un asesor.
        </Body1>
        <Button onClick={() => navigate("/contacto")}>Ir a contacto</Button>
      </Surface>
    </Page>
  );
}
