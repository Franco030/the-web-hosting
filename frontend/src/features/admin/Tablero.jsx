import { useCallback } from "react";
import {
  Badge,
  Body1,
  Caption1,
  makeStyles,
  MessageBar,
  Subtitle2,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tokens,
} from "@fluentui/react-components";
import { DonutChart, VerticalBarChart } from "@fluentui/react-charts";
import { Page, PageHeader, PageLoading, PageSection, Surface } from "../../components/ui/Page";
import { useDatos } from "../../hooks/useDatos";
import api from "../../services/ApiClient";
import { diasHasta, formatoFecha, formatoFechaCorta, formatoMoneda, formatoNumero } from "../../lib/formato";

// Paleta categórica (validada para claro y oscuro) en el orden de los tipos.
const COLORES_TIPO = {
  Compartido: "#456ad1",
  WordPress: "#0e9f8e",
  VPS: "#d77b0f",
  Cloud: "#a14fc9",
  Dedicado: "#d1426b",
};

const useStyles = makeStyles({
  kpis: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  },
  kpi: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalXS },
  kpiValor: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: "tabular-nums",
  },
  secundario: { color: tokens.colorNeutralForeground3 },
  graficas: {
    display: "grid",
    gap: tokens.spacingHorizontalXL,
    gridTemplateColumns: "1fr",
    "@media (min-width: 1200px)": { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" },
  },
  tarjeta: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL, minWidth: 0 },
  encabezado: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalXXS },
  grafica: { width: "100%", minHeight: "300px" },
  numero: { fontVariantNumeric: "tabular-nums", textAlign: "end" },
  tablaScroll: { overflowX: "auto" },
});

function Kpi({ etiqueta, valor, detalle }) {
  const styles = useStyles();
  return (
    <Surface className={styles.kpi}>
      <Caption1 className={styles.secundario}>{etiqueta}</Caption1>
      <span className={styles.kpiValor}>{valor}</span>
      {detalle && <Caption1 className={styles.secundario}>{detalle}</Caption1>}
    </Surface>
  );
}

function insigniaDias(dias) {
  if (dias <= 0) return <Badge appearance="tint" color="danger">Vence hoy</Badge>;
  if (dias <= 3) return <Badge appearance="tint" color="warning">{`En ${dias} ${dias === 1 ? "día" : "días"}`}</Badge>;
  return <Badge appearance="tint" color="informative">{`En ${dias} días`}</Badge>;
}

/** Tablero: (1) análisis de tipos de planes y (2) planes que vencen en los próximos 10 días. */
export default function Tablero() {
  const styles = useStyles();
  const cargar = useCallback(
    () => Promise.all([api.get("/dashboard/planes-por-tipo"), api.get("/dashboard/vencimientos", { dias: 10 })]),
    []
  );
  const { datos, cargando, error } = useDatos(cargar);

  if (cargando && !datos) return <PageLoading label="Cargando el tablero" />;

  const [tipos, vencimientos] = datos || [];

  return (
    <Page>
      <PageHeader title="Tablero" description="Resumen de los planes contratados y de las renovaciones próximas." />
      {error && <MessageBar intent="error">No pudimos cargar el tablero. {error.message}</MessageBar>}
      {tipos && vencimientos && (
        <>
          <div className={styles.kpis}>
            <Kpi etiqueta="Contrataciones activas" valor={formatoNumero(tipos.totalContrataciones)} />
            <Kpi etiqueta="Planes en el catálogo" valor={formatoNumero(tipos.totalPlanes)} />
            <Kpi
              etiqueta="Vencen en 10 días"
              valor={formatoNumero(vencimientos.contrataciones.length)}
              detalle={`${formatoFechaCorta(vencimientos.desde)} – ${formatoFechaCorta(vencimientos.hasta)}`}
            />
            <Kpi etiqueta="Ingreso mensual por renovar" valor={formatoMoneda(vencimientos.ingresoEnRiesgo)} />
          </div>

          <div className={styles.graficas}>
            <Surface className={styles.tarjeta}>
              <div className={styles.encabezado}>
                <Subtitle2 as="h2">Contrataciones por tipo de plan</Subtitle2>
                <Body1 className={styles.secundario}>Contrataciones activas agrupadas por el tipo del plan contratado.</Body1>
              </div>
              <div className={styles.grafica}>
                <DonutChart
                  data={{
                    chartTitle: "Contrataciones por tipo de plan",
                    chartData: tipos.porTipo
                      .filter((t) => t.contrataciones > 0)
                      .map((t) => ({ legend: t.tipo, data: t.contrataciones, color: COLORES_TIPO[t.tipo] })),
                  }}
                  innerRadius={70}
                  height={300}
                  valueInsideDonut={formatoNumero(tipos.totalContrataciones)}
                  hideLabels={false}
                  showLabelsInPercent
                  culture="es-MX"
                />
              </div>
              <div className={styles.tablaScroll}>
                <Table size="small" aria-label="Detalle por tipo de plan">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Tipo</TableHeaderCell>
                      <TableHeaderCell className={styles.numero}>Planes ofertados</TableHeaderCell>
                      <TableHeaderCell className={styles.numero}>Contrataciones</TableHeaderCell>
                      <TableHeaderCell className={styles.numero}>Porcentaje</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tipos.porTipo.map((t) => (
                      <TableRow key={t.tipo}>
                        <TableCell>{t.tipo}</TableCell>
                        <TableCell className={styles.numero}>{t.planesOfertados}</TableCell>
                        <TableCell className={styles.numero}>{t.contrataciones}</TableCell>
                        <TableCell className={styles.numero}>
                          {tipos.totalContrataciones ? `${Math.round((t.contrataciones / tipos.totalContrataciones) * 100)} %` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Surface>

            <Surface className={styles.tarjeta}>
              <div className={styles.encabezado}>
                <Subtitle2 as="h2">Planes por vencer en los próximos 10 días</Subtitle2>
                <Body1 className={styles.secundario}>Número de contrataciones activas que vencen cada día.</Body1>
              </div>
              <div className={styles.grafica}>
                <VerticalBarChart
                  chartTitle="Vencimientos por día"
                  data={vencimientos.porDia.map((d) => ({
                    x: formatoFechaCorta(d.fecha),
                    y: d.total,
                    legend: "Vencimientos",
                    xAxisCalloutData: formatoFecha(d.fecha),
                    yAxisCalloutData: `${d.total} ${d.total === 1 ? "plan" : "planes"}`,
                  }))}
                  height={300}
                  useSingleColor
                  colors={["#456ad1"]}
                  hideLegend
                  roundCorners
                  maxBarWidth={36}
                  culture="es-MX"
                  yAxisTickCount={4}
                />
              </div>
            </Surface>
          </div>

          <PageSection title="Detalle de vencimientos" id="vencimientos">
            {vencimientos.contrataciones.length === 0 ? (
              <MessageBar intent="success">Ningún plan vence en los próximos 10 días.</MessageBar>
            ) : (
              <Surface flush className={styles.tablaScroll}>
                <Table aria-label="Contrataciones por vencer">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Cliente</TableHeaderCell>
                      <TableHeaderCell>Dominio</TableHeaderCell>
                      <TableHeaderCell>Plan</TableHeaderCell>
                      <TableHeaderCell>Vence</TableHeaderCell>
                      <TableHeaderCell className={styles.numero}>Precio mensual</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vencimientos.contrataciones.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.cliente?.empresa || c.cliente?.nombre}</TableCell>
                        <TableCell>{c.dominio}</TableCell>
                        <TableCell>{`${c.plan?.nombre} · ${c.plan?.tipo}`}</TableCell>
                        <TableCell>
                          {formatoFechaCorta(c.fechaVencimiento)} {insigniaDias(diasHasta(c.fechaVencimiento))}
                        </TableCell>
                        <TableCell className={styles.numero}>{formatoMoneda(c.plan?.precioMensual)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Surface>
            )}
          </PageSection>
        </>
      )}
    </Page>
  );
}
