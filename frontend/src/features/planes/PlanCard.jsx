import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  makeStyles,
  mergeClasses,
  Spinner,
  Subtitle1,
  tokens,
} from "@fluentui/react-components";
import { Checkmark16Regular, DocumentPdf20Regular } from "@fluentui/react-icons";
import { Surface } from "../../components/ui/Page";
import { formatoMoneda, ilimitado } from "../../lib/formato";
import { liftOnHover } from "../../theme/motion";
import api from "../../services/ApiClient";
import { useNotificar } from "../../hooks/useNotificar";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    height: "100%",
    ...liftOnHover,
  },
  destacado: {
    border: `${tokens.strokeWidthThick} solid ${tokens.colorBrandStroke1}`,
  },
  cabecera: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: tokens.spacingHorizontalS },
  insignias: { display: "flex", gap: tokens.spacingHorizontalXS, flexWrap: "wrap" },
  precio: {
    display: "flex",
    alignItems: "baseline",
    gap: tokens.spacingHorizontalXS,
    fontVariantNumeric: "tabular-nums",
  },
  monto: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    fontWeight: tokens.fontWeightSemibold,
  },
  periodo: { color: tokens.colorNeutralForeground3 },
  descripcion: { color: tokens.colorNeutralForeground2 },
  lista: {
    listStyleType: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    flexGrow: 1,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
  },
  check: { color: tokens.colorPaletteGreenForeground1, flexShrink: 0 },
  acciones: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalS },
});

export const caracteristicasPlan = (plan) =>
  [
    `${plan.almacenamientoGB} GB de almacenamiento SSD`,
    `Transferencia ${plan.transferenciaGB ? `de ${plan.transferenciaGB} GB` : "ilimitada"}`,
    `${ilimitado(plan.sitios)} ${plan.sitios === 1 ? "sitio web" : "sitios web"}`,
    `${ilimitado(plan.cuentasCorreo, "", true)} cuentas de correo`,
    plan.ram && `${plan.ram} de RAM · ${plan.cpu}`,
    plan.sslGratis && "Certificado SSL gratis",
    `Respaldos ${plan.respaldos.toLowerCase()}`,
  ].filter(Boolean);

/** Descarga la ficha técnica en PDF y avisa si falla. */
export function useDescargarFicha() {
  const notificar = useNotificar();
  const [descargando, setDescargando] = useState(null);
  const descargar = async (plan) => {
    setDescargando(plan.id);
    try {
      await api.descargar(`/planes/${plan.id}/ficha`, null, `ficha-${plan.id}.pdf`);
    } catch (error) {
      notificar("No se pudo descargar la ficha", { cuerpo: error.message, intent: "error" });
    } finally {
      setDescargando(null);
    }
  };
  return { descargar, descargando };
}

export function PlanCard({ plan, onFicha, descargando }) {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <Surface as="article" className={mergeClasses(styles.card, plan.destacado && styles.destacado)}>
      <div className={styles.cabecera}>
        <Subtitle1 as="h3">{plan.nombre}</Subtitle1>
        <div className={styles.insignias}>
          {plan.destacado && (
            <Badge appearance="filled" color="brand">
              Más elegido
            </Badge>
          )}
          <Badge appearance="tint" color="informative">
            {plan.tipo}
          </Badge>
        </div>
      </div>
      <div className={styles.precio}>
        <span className={styles.monto}>{formatoMoneda(plan.precioMensual)}</span>
        <Caption1 className={styles.periodo}>al mes</Caption1>
      </div>
      <Body1 className={styles.descripcion}>{plan.descripcion}</Body1>
      <ul className={styles.lista}>
        {caracteristicasPlan(plan).slice(0, 5).map((c) => (
          <li key={c} className={styles.item}>
            <Checkmark16Regular className={styles.check} aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>
      <div className={styles.acciones}>
        <Button onClick={() => navigate(`/planes/${plan.id}`)}>Ver detalles</Button>
        {onFicha && (
          <Button
            appearance="subtle"
            icon={descargando ? <Spinner size="tiny" /> : <DocumentPdf20Regular />}
            disabled={descargando}
            onClick={() => onFicha(plan)}
          >
            Ficha técnica
          </Button>
        )}
      </div>
    </Surface>
  );
}

export default PlanCard;
