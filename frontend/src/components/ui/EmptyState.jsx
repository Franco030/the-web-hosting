import { Body1, makeStyles, Subtitle2, tokens } from "@fluentui/react-components";
import { Surface } from "./Page";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacingHorizontalXXL,
    },
  },
  imagen: {
    flexShrink: 0,
    width: "160px",
    color: tokens.colorBrandForeground1,
  },
  texto: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalS,
  },
  descripcion: { color: tokens.colorNeutralForeground3, maxWidth: "60ch" },
});

/** Estado vacío o de error: ilustración, título, descripción y la acción debajo del texto. */
export function EmptyState({ ilustracion, titulo, descripcion, accion }) {
  const styles = useStyles();
  return (
    <Surface className={styles.root}>
      {ilustracion && <div className={styles.imagen}>{ilustracion}</div>}
      <div className={styles.texto}>
        <Subtitle2 as="h2">{titulo}</Subtitle2>
        {descripcion && <Body1 className={styles.descripcion}>{descripcion}</Body1>}
        {accion}
      </div>
    </Surface>
  );
}

export default EmptyState;
