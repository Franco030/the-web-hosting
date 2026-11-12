import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  makeStyles,
  mergeClasses,
  Spinner,
  Subtitle1,
  Title2,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft20Regular } from "@fluentui/react-icons";
import { delayedFade, pageFade } from "../../theme/motion";
import { useTituloPagina } from "../../hooks/useTituloPagina";

const useStyles = makeStyles({
  page: {
    boxSizing: "border-box",
    width: "100%",
    paddingBlock: `${tokens.spacingVerticalXXL} ${tokens.spacingVerticalXXXL}`,
    paddingInline: tokens.spacingHorizontalL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
    ...pageFade,
    // Rangos sin solaparse: Griffel no ordena las media queries por ancho.
    "@media (min-width: 640px) and (max-width: 1439px)": {
      paddingInline: tokens.spacingHorizontalXXXL,
    },
    "@media (min-width: 1440px)": {
      paddingInline: "48px",
    },
  },
  // Sitio público: columna centrada con ancho de lectura cómodo.
  centrada: {
    maxWidth: "1280px",
    marginInline: "auto",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  back: {
    alignSelf: "flex-start",
    marginInlineStart: `calc(${tokens.spacingHorizontalS} * -1)`,
    marginBlockEnd: tokens.spacingVerticalXS,
  },
  title: {
    margin: 0,
    overflowWrap: "anywhere",
    fontSize: tokens.fontSizeBase600,
    lineHeight: tokens.lineHeightBase600,
    "@media (min-width: 640px)": {
      fontSize: tokens.fontSizeHero800,
      lineHeight: tokens.lineHeightHero800,
    },
  },
  description: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "65ch",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    scrollMarginTop: "72px",
  },
  sectionHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    minHeight: "32px",
  },
  sectionHeaderText: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  sectionTitle: { margin: 0 },
  sectionDescription: {
    color: tokens.colorNeutralForeground3,
    maxWidth: "65ch",
  },
  surface: {
    boxSizing: "border-box",
    minWidth: 0,
    padding: tokens.spacingHorizontalXL,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    "@media (max-width: 479px)": {
      padding: tokens.spacingHorizontalL,
    },
  },
  flush: {
    padding: 0,
    overflow: "hidden",
    "@media (max-width: 479px)": {
      padding: 0,
    },
  },
  loading: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "30dvh",
    ...delayedFade,
  },
  footerActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
});

// Tarjeta estándar (fondo 1, borde sutil, shadow4, radio 12 px).
export function Surface({ children, flush = false, className, as: Component = "div", ...props }) {
  const styles = useStyles();
  return (
    <Component className={mergeClasses(styles.surface, flush && styles.flush, className)} {...props}>
      {children}
    </Component>
  );
}

// Spinner diferido: solo aparece si la espera supera 300 ms.
export function PageLoading({ label = "Cargando" }) {
  const styles = useStyles();
  return (
    <div className={styles.loading}>
      <Spinner label={label} />
    </div>
  );
}

// Acciones al final de un formulario, alineadas a la izquierda; la primaria primero.
export function FormActions({ children }) {
  const styles = useStyles();
  return <div className={styles.footerActions}>{children}</div>;
}

export function Page({ children, className, centrada = false }) {
  const styles = useStyles();
  return <main className={mergeClasses(styles.page, centrada && styles.centrada, className)}>{children}</main>;
}

export function PageHeader({ title, description, actions, backTo, backLabel = "Volver", tituloPestana }) {
  const styles = useStyles();
  const navigate = useNavigate();
  useTituloPagina(tituloPestana === undefined ? (typeof title === "string" ? title : null) : tituloPestana);

  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        {backTo !== undefined && (
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowLeft20Regular />}
            className={styles.back}
            onClick={() => (backTo === -1 ? navigate(-1) : navigate(backTo))}
          >
            {backLabel}
          </Button>
        )}
        <Title2 as="h1" className={styles.title}>
          {title}
        </Title2>
        {description && <Body1 className={styles.description}>{description}</Body1>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export function PageSection({ title, description, actions, children, id }) {
  const styles = useStyles();
  const headingId = id ? `${id}-titulo` : undefined;

  return (
    <section className={styles.section} aria-labelledby={headingId} id={id}>
      {(title || actions) && (
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderText}>
            {title && (
              <Subtitle1 as="h2" id={headingId} className={styles.sectionTitle}>
                {title}
              </Subtitle1>
            )}
            {description && <Body1 className={styles.sectionDescription}>{description}</Body1>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
