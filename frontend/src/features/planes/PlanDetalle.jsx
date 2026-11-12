import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Body1,
  Button,
  Caption1,
  makeStyles,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  tokens,
} from "@fluentui/react-components";
import { DocumentPdf20Regular } from "@fluentui/react-icons";
import { Page, PageHeader, PageLoading, PageSection, Surface } from "../../components/ui/Page";
import { EmptyState } from "../../components/ui/EmptyState";
import { IlustracionBusqueda } from "../../components/illustrations/Ilustraciones";
import { useDatos } from "../../hooks/useDatos";
import api from "../../services/ApiClient";
import { formatoMoneda, ilimitado } from "../../lib/formato";
import { useDescargarFicha } from "./PlanCard";

const useStyles = makeStyles({
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
    gridTemplateColumns: "1fr",
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" },
  },
  resumen: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM },
  monto: {
    fontSize: tokens.fontSizeHero900,
    lineHeight: tokens.lineHeightHero900,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: "tabular-nums",
  },
  secundario: { color: tokens.colorNeutralForeground3 },
  etiqueta: { color: tokens.colorNeutralForeground2, width: "45%" },
  valor: { fontWeight: tokens.fontWeightSemibold },
  acciones: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalS },
});

export default function PlanDetalle() {
  const styles = useStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const cargar = useCallback(() => api.get(`/planes/${id}`), [id]);
  const { datos: plan, cargando, error } = useDatos(cargar);
  const { descargar, descargando } = useDescargarFicha();

  if (cargando) return <PageLoading label="Cargando el plan" />;
  if (error || !plan) {
    return (
      <Page centrada>
        <PageHeader title="No encontramos este plan" backTo="/planes" backLabel="Planes" />
        <EmptyState
          ilustracion={<IlustracionBusqueda />}
          titulo="El plan no existe o ya no está disponible"
          descripcion="Revisa el catálogo para ver los planes vigentes."
          accion={<Button appearance="primary" onClick={() => navigate("/planes")}>Ver planes</Button>}
        />
      </Page>
    );
  }

  const filas = [
    ["Tipo de plan", plan.tipo],
    ["Almacenamiento", `${plan.almacenamientoGB} GB SSD NVMe`],
    ["Transferencia mensual", plan.transferenciaGB ? `${plan.transferenciaGB} GB` : "Ilimitada"],
    ["Sitios web", ilimitado(plan.sitios)],
    ["Cuentas de correo", ilimitado(plan.cuentasCorreo, "", true)],
    ["Bases de datos", ilimitado(plan.basesDatos, "", true)],
    ["Memoria RAM", plan.ram || "Compartida"],
    ["Procesador", plan.cpu || "Compartido"],
    ["Certificado SSL", plan.sslGratis ? "Gratis, con renovación automática" : "No incluido"],
    ["Respaldos", plan.respaldos],
    ["Soporte", plan.soporte],
  ];

  return (
    <Page centrada>
      <PageHeader title={plan.nombre} description={plan.descripcion} backTo="/planes" backLabel="Planes" />
      <div className={styles.rejilla}>
        <PageSection title="Especificaciones">
          <Surface flush>
            <Table aria-label={`Especificaciones del plan ${plan.nombre}`}>
              <TableBody>
                {filas.map(([etiqueta, valor]) => (
                  <TableRow key={etiqueta}>
                    <TableCell className={styles.etiqueta}>{etiqueta}</TableCell>
                    <TableCell className={styles.valor}>{valor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Surface>
        </PageSection>
        <Surface className={styles.resumen}>
          <div>
            <Badge appearance="tint" color="informative">
              {plan.tipo}
            </Badge>
          </div>
          <span className={styles.monto}>{formatoMoneda(plan.precioMensual)}</span>
          <Caption1 className={styles.secundario}>al mes, IVA incluido · 30 días de garantía</Caption1>
          <Body1 className={styles.secundario}>
            Contrata con un asesor: te ayudamos a migrar tu sitio y configurar tu dominio sin costo.
          </Body1>
          <div className={styles.acciones}>
            <Button appearance="primary" onClick={() => navigate(`/contacto?plan=${encodeURIComponent(plan.nombre)}`)}>
              Contratar este plan
            </Button>
            <Button
              icon={descargando ? <Spinner size="tiny" /> : <DocumentPdf20Regular />}
              disabled={Boolean(descargando)}
              onClick={() => descargar(plan)}
            >
              Ficha técnica (PDF)
            </Button>
          </div>
        </Surface>
      </div>
    </Page>
  );
}
