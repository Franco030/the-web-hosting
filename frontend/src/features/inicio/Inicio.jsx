import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Body1, Button, makeStyles, MessageBar, Skeleton, SkeletonItem, Subtitle2, tokens } from "@fluentui/react-components";
import {
  ArrowSync24Regular,
  CloudCheckmark24Regular,
  HeadsetVr24Regular,
  ShieldLock24Regular,
} from "@fluentui/react-icons";
import { Page, PageSection, Surface } from "../../components/ui/Page";
import { useTituloPagina } from "../../hooks/useTituloPagina";
import { useDatos } from "../../hooks/useDatos";
import api from "../../services/ApiClient";
import { Slideshow } from "./Slideshow";
import { Multimedia } from "./Multimedia";
import { PlanCard, useDescargarFicha } from "../planes/PlanCard";
import { ListaClientes } from "../clientes/ListaClientes";
import { AcordeonPreguntas } from "../faq/AcordeonPreguntas";

const VENTAJAS = [
  { icono: CloudCheckmark24Regular, titulo: "99.9 % en línea", texto: "Garantía de disponibilidad por contrato y monitoreo constante." },
  { icono: ShieldLock24Regular, titulo: "SSL y antimalware", texto: "Certificados automáticos y análisis diario de archivos." },
  { icono: ArrowSync24Regular, titulo: "Migración gratis", texto: "Movemos tu sitio, correos y bases de datos sin tiempo fuera de línea." },
  { icono: HeadsetVr24Regular, titulo: "Soporte 24/7", texto: "Chat inmediato a cualquier hora y asesores por correo y teléfono." },
];

const useStyles = makeStyles({
  rejillaPlanes: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  },
  ventajas: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  },
  ventaja: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS },
  ventajaIcono: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
  },
  ventajaTexto: { color: tokens.colorNeutralForeground2 },
  cta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalM,
    "@media (min-width: 768px)": { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  },
  ctaTexto: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalXS },
});

export default function Inicio() {
  const styles = useStyles();
  const navigate = useNavigate();
  useTituloPagina(null);
  const cargarPlanes = useCallback(() => api.get("/planes", { orden: "relevancia" }), []);
  const { datos: planes, cargando, error } = useDatos(cargarPlanes, []);
  const { descargar, descargando } = useDescargarFicha();
  const destacados = planes.filter((p) => p.destacado).slice(0, 3);

  return (
    <Page centrada>
      <Slideshow />

      <PageSection
        id="planes"
        title="Planes más elegidos"
        description="Precios en pesos mexicanos, IVA incluido. Cambia de plan cuando quieras."
        actions={<Button onClick={() => navigate("/planes")}>Ver todos los planes</Button>}
      >
        {error && <MessageBar intent="error">No pudimos cargar los planes. {error.message}</MessageBar>}
        <div className={styles.rejillaPlanes}>
          {cargando
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} aria-label="Cargando planes">
                  <SkeletonItem style={{ height: 380, borderRadius: 12 }} />
                </Skeleton>
              ))
            : destacados.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onFicha={descargar} descargando={descargando === plan.id} />
              ))}
        </div>
      </PageSection>

      <PageSection id="ventajas" title="Todo lo que necesitas, incluido">
        <div className={styles.ventajas}>
          {VENTAJAS.map(({ icono: Icono, titulo, texto }) => (
            <Surface key={titulo} className={styles.ventaja}>
              <span className={styles.ventajaIcono} aria-hidden="true">
                <Icono />
              </span>
              <Subtitle2 as="h3">{titulo}</Subtitle2>
              <Body1 className={styles.ventajaTexto}>{texto}</Body1>
            </Surface>
          ))}
        </div>
      </PageSection>

      <PageSection id="conocenos" title="Conócenos" description="Nuestro objetivo, la promoción del mes y consejos en video y audio.">
        <Multimedia />
      </PageSection>

      <PageSection
        id="clientes"
        title="Empresas que confían en nosotros"
        actions={<Button onClick={() => navigate("/clientes")}>Ver todos los clientes</Button>}
      >
        <ListaClientes />
      </PageSection>

      <PageSection
        id="preguntas"
        title="Preguntas frecuentes"
        actions={<Button onClick={() => navigate("/preguntas-frecuentes")}>Ver todas</Button>}
      >
        <AcordeonPreguntas limite={4} />
      </PageSection>

      <Surface className={styles.cta}>
        <div className={styles.ctaTexto}>
          <Subtitle2 as="h2">¿Tienes un proyecto en mente?</Subtitle2>
          <Body1 className={styles.ventajaTexto}>Cuéntanos qué necesitas y te recomendamos el plan ideal en menos de 24 horas.</Body1>
        </div>
        <Button onClick={() => navigate("/contacto")}>Escríbenos</Button>
      </Surface>
    </Page>
  );
}
