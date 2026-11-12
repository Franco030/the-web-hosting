import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Carousel,
  CarouselCard,
  CarouselNav,
  CarouselNavButton,
  CarouselNavContainer,
  CarouselSlider,
  CarouselViewport,
  LargeTitle,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  IlustracionServidores,
  IlustracionSeguridad,
  IlustracionSitio,
  IlustracionSoporte,
} from "../../components/illustrations/Ilustraciones";

const DIAPOSITIVAS = [
  {
    titulo: "Tu sitio en línea hoy mismo",
    texto: "Hosting con discos NVMe, SSL gratis y el instalador de WordPress en un clic. Planes desde $49 al mes.",
    accion: { texto: "Ver planes", ruta: "/planes" },
    Ilustracion: IlustracionSitio,
  },
  {
    titulo: "Velocidad que se nota",
    texto: "Servidores con caché optimizada y CDN global: tus páginas cargan en menos de un segundo desde cualquier lugar.",
    accion: { texto: "Comparar planes VPS", ruta: "/planes?tipo=VPS" },
    Ilustracion: IlustracionServidores,
  },
  {
    titulo: "Seguridad incluida",
    texto: "Certificado SSL automático, protección contra malware y respaldos diarios que restauras en un clic.",
    accion: { texto: "Ver preguntas de seguridad", ruta: "/preguntas-frecuentes" },
    Ilustracion: IlustracionSeguridad,
  },
  {
    titulo: "Ayuda las 24 horas",
    texto: "Nuestro asistente responde al instante a cualquier hora, y el equipo humano te atiende por correo y teléfono.",
    accion: { texto: "Escríbenos", ruta: "/contacto" },
    Ilustracion: IlustracionSoporte,
  },
];

const useStyles = makeStyles({
  carousel: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  viewport: {
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  card: { width: "100%" },
  diapositiva: {
    display: "grid",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXL,
    padding: tokens.spacingHorizontalXXL,
    minHeight: "380px",
    boxSizing: "border-box",
    backgroundImage: `linear-gradient(120deg, ${tokens.colorNeutralBackground1} 40%, color-mix(in srgb, ${tokens.colorBrandBackground} 10%, ${tokens.colorNeutralBackground1}))`,
    gridTemplateColumns: "1fr",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      padding: "48px",
    },
  },
  texto: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalL,
  },
  titulo: {
    fontSize: tokens.fontSizeHero800,
    lineHeight: tokens.lineHeightHero800,
    "@media (min-width: 1024px)": {
      fontSize: tokens.fontSizeHero900,
      lineHeight: tokens.lineHeightHero900,
    },
  },
  cuerpo: { color: tokens.colorNeutralForeground2, maxWidth: "48ch", fontSize: tokens.fontSizeBase400, lineHeight: tokens.lineHeightBase400 },
  imagen: {
    maxWidth: "440px",
    width: "100%",
    justifySelf: "center",
    "@media (max-width: 767px)": { maxWidth: "300px" },
  },
  nav: { alignSelf: "center" },
});

/** Slideshow principal (sección superior del inicio) con el Carousel de Fluent 2. */
export function Slideshow() {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <Carousel
      groupSize={1}
      circular
      autoplayInterval={7000}
      className={styles.carousel}
      announcement={(index, total) => `Diapositiva ${index + 1} de ${total}`}
    >
      <CarouselViewport className={styles.viewport}>
        <CarouselSlider>
          {DIAPOSITIVAS.map(({ titulo, texto, accion, Ilustracion }, i) => (
            <CarouselCard key={titulo} className={styles.card} aria-label={`${i + 1} de ${DIAPOSITIVAS.length}`}>
              <div className={styles.diapositiva}>
                <div className={styles.texto}>
                  {i === 0 ? (
                    <LargeTitle as="h1" className={styles.titulo}>
                      {titulo}
                    </LargeTitle>
                  ) : (
                    <LargeTitle as="h2" className={styles.titulo}>
                      {titulo}
                    </LargeTitle>
                  )}
                  <Body1 className={styles.cuerpo}>{texto}</Body1>
                  <Button appearance="primary" size="large" onClick={() => navigate(accion.ruta)}>
                    {accion.texto}
                  </Button>
                </div>
                <div className={styles.imagen} aria-hidden="true">
                  <Ilustracion />
                </div>
              </div>
            </CarouselCard>
          ))}
        </CarouselSlider>
      </CarouselViewport>
      <CarouselNavContainer
        className={styles.nav}
        layout="inline"
        autoplay={{ "aria-label": "Reproducción automática" }}
        next={{ "aria-label": "Siguiente diapositiva" }}
        prev={{ "aria-label": "Diapositiva anterior" }}
      >
        <CarouselNav>{(index) => <CarouselNavButton aria-label={`Ir a la diapositiva ${index + 1}`} />}</CarouselNav>
      </CarouselNavContainer>
    </Carousel>
  );
}

export default Slideshow;
