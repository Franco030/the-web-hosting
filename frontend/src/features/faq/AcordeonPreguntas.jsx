import { useCallback } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Body1,
  makeStyles,
  MessageBar,
  Skeleton,
  SkeletonItem,
  tokens,
} from "@fluentui/react-components";
import api from "../../services/ApiClient";
import { useDatos } from "../../hooks/useDatos";
import { Surface } from "../../components/ui/Page";

const useStyles = makeStyles({
  // Lista a sangre dentro de la tarjeta: las filas heredan el radio en los extremos.
  item: {
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    ":last-child": { borderBottom: "none" },
  },
  header: {
    "& .fui-AccordionHeader__button": {
      minHeight: "52px",
      paddingInline: tokens.spacingHorizontalL,
      fontWeight: tokens.fontWeightSemibold,
    },
  },
  panel: {
    marginInline: 0,
    paddingInline: `${tokens.spacingHorizontalXXXL} ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground2,
    maxWidth: "75ch",
  },
  esqueleto: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM, padding: tokens.spacingHorizontalL },
});

/** Preguntas frecuentes en un control tipo acordeón (Accordion de Fluent). */
export function AcordeonPreguntas({ limite }) {
  const styles = useStyles();
  const cargar = useCallback(() => api.get("/preguntas-frecuentes"), []);
  const { datos, cargando, error } = useDatos(cargar, []);

  if (error) return <MessageBar intent="error">No pudimos cargar las preguntas. {error.message}</MessageBar>;

  const preguntas = limite ? datos.slice(0, limite) : datos;

  return (
    <Surface flush>
      {cargando ? (
        <Skeleton className={styles.esqueleto} aria-label="Cargando preguntas">
          {Array.from({ length: limite || 6 }, (_, i) => (
            <SkeletonItem key={i} size={24} />
          ))}
        </Skeleton>
      ) : (
        <Accordion collapsible defaultOpenItems={preguntas[0]?.id}>
          {preguntas.map((p) => (
            <AccordionItem key={p.id} value={p.id} className={styles.item}>
              <AccordionHeader as="h3" expandIconPosition="end" className={styles.header}>
                {p.pregunta}
              </AccordionHeader>
              <AccordionPanel className={styles.panel}>
                <Body1>{p.respuesta}</Body1>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Surface>
  );
}

export default AcordeonPreguntas;
