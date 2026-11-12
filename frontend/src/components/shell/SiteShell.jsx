import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Caption1,
  DrawerBody,
  DrawerHeader,
  Hamburger,
  makeStyles,
  OverlayDrawer,
  Tab,
  TabList,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { PersonLock20Regular, WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import { useTheme } from "../../context/ThemeContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useEstadisticasEnVivo } from "../../hooks/useEstadisticasEnVivo";
import { formatoNumero } from "../../lib/formato";
import { PanelLateralMotion } from "../../theme/navMotion";
import { veloHover, veloPresionado } from "../../theme/superficies";
import { BrandMark } from "./BrandMark";
import { SideNav } from "./SideNav";
import { navegacionPublica, rutaActiva } from "./navigation";
import { Chatbot } from "../Chatbot";
import { Avisos } from "../../hooks/useNotificar";

const DESKTOP_QUERY = "(min-width: 960px)";

const useStyles = makeStyles({
  root: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  // Barra superior de 56 px sobre la base tipo Mica (5 % de marca).
  barra: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    height: "56px",
    paddingInline: tokens.spacingHorizontalM,
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 5%, ${tokens.colorNeutralBackground3})`,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    "& .fui-Button:hover": { backgroundColor: veloHover },
    "& .fui-Button:hover:active": { backgroundColor: veloPresionado },
    "@media (min-width: 640px)": {
      paddingInline: tokens.spacingHorizontalXL,
    },
  },
  marca: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: tokens.borderRadiusMedium,
    paddingInline: tokens.spacingHorizontalXS,
    textDecorationLine: "none",
    color: "inherit",
    ":focus-visible": { outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}` },
  },
  tabs: { marginInlineStart: tokens.spacingHorizontalL },
  espacio: { flexGrow: 1 },
  adminTexto: {
    display: "none",
    "@media (min-width: 480px)": { display: "inline" },
  },
  contenido: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  // Pie del sitio público: enlaces, contadores y aviso legal.
  pie: {
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 5%, ${tokens.colorNeutralBackground3})`,
    paddingBlock: tokens.spacingVerticalXXL,
    paddingInline: tokens.spacingHorizontalL,
    "@media (min-width: 640px)": { paddingInline: tokens.spacingHorizontalXXXL },
  },
  pieInterior: {
    maxWidth: "1280px",
    marginInline: "auto",
    display: "grid",
    gap: tokens.spacingVerticalXL,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  pieColumna: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground2,
  },
  pieEnlace: {
    color: tokens.colorNeutralForeground2,
    textDecorationLine: "none",
    width: "fit-content",
    ":hover": { color: tokens.colorBrandForeground1, textDecorationLine: "underline" },
    ":focus-visible": { outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}` },
  },
  pieTitulo: { fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  contador: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    fontVariantNumeric: "tabular-nums",
  },
  enVivo: {
    width: "8px",
    height: "8px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorPaletteGreenBackground3,
    flexShrink: 0,
  },
  legal: {
    maxWidth: "1280px",
    marginInline: "auto",
    marginTop: tokens.spacingVerticalXL,
    color: tokens.colorNeutralForeground3,
  },
  drawer: { width: "300px", maxWidth: "85vw", backgroundColor: tokens.colorNeutralBackground2 },
  drawerBody: { paddingInline: 0 },
});

function ContadorVisitas() {
  const styles = useStyles();
  const datos = useEstadisticasEnVivo();
  return (
    <div className={styles.pieColumna} aria-live="polite">
      <span className={styles.pieTitulo}>En este momento</span>
      <span className={styles.contador}>
        <span className={styles.enVivo} aria-hidden="true" />
        {datos ? `${formatoNumero(datos.conectados)} ${datos.conectados === 1 ? "persona conectada" : "personas conectadas"}` : "Conectando…"}
      </span>
      <span className={styles.contador}>{datos ? `${formatoNumero(datos.visitas)} visitas en total` : ""}</span>
    </div>
  );
}

/** Ventana del sitio público: barra con navegación, contenido, pie y chat de ayuda. */
export function SiteShell({ children }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const esEscritorio = useMediaQuery(DESKTOP_QUERY);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const activa = rutaActiva(navegacionPublica, pathname);
  const items = navegacionPublica[0].items;

  return (
    <div className={styles.root}>
      <header className={styles.barra}>
        {!esEscritorio && (
          <Tooltip content="Abrir navegación" relationship="label">
            <Hamburger onClick={() => setMenuAbierto(true)} aria-expanded={menuAbierto} />
          </Tooltip>
        )}
        <RouterLink to="/" className={styles.marca}>
          <BrandMark />
        </RouterLink>

        {esEscritorio && (
          <TabList
            className={styles.tabs}
            selectedValue={activa}
            onTabSelect={(_, data) => navigate(data.value)}
            aria-label="Navegación principal"
          >
            {items.map(({ to, label }) => (
              <Tab key={to} value={to}>
                {label}
              </Tab>
            ))}
          </TabList>
        )}

        <div className={styles.espacio} />

        <Tooltip content={isDark ? "Usar tema claro" : "Usar tema oscuro"} relationship="label">
          <Button
            appearance="subtle"
            icon={isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
            onClick={toggleTheme}
          />
        </Tooltip>
        <Button appearance="subtle" icon={<PersonLock20Regular />} onClick={() => navigate("/admin")}>
          <span className={styles.adminTexto}>Administración</span>
        </Button>
      </header>

      <div className={styles.contenido} key={pathname}>
        {children}
      </div>

      <footer className={styles.pie}>
        <div className={styles.pieInterior}>
          <div className={styles.pieColumna}>
            <BrandMark />
            <span>Hosting rápido y seguro para tu sitio, tu tienda y tu correo, con soporte las 24 horas.</span>
          </div>
          <nav className={styles.pieColumna} aria-label="Enlaces del pie">
            <span className={styles.pieTitulo}>Sitio</span>
            {items.map(({ to, label }) => (
              <RouterLink key={to} to={to} className={styles.pieEnlace}>
                {label}
              </RouterLink>
            ))}
          </nav>
          <div className={styles.pieColumna}>
            <span className={styles.pieTitulo}>Contacto</span>
            <span>contacto@thewebhosting.test</span>
            <span>55 0000 0000 · lunes a sábado, 9:00 a 20:00</span>
            <span>Chat de ayuda abierto las 24 horas</span>
          </div>
          <ContadorVisitas />
        </div>
        <Caption1 as="p" className={styles.legal}>
          © {new Date().getFullYear()} The Web Hosting. Proyecto académico; las empresas cliente son ficticias.
        </Caption1>
      </footer>

      <Chatbot />
      <Avisos />

      {!esEscritorio && (
        <OverlayDrawer
          open={menuAbierto}
          onOpenChange={(_, data) => setMenuAbierto(data.open)}
          className={styles.drawer}
          aria-label="Navegación principal"
          surfaceMotion={{
            children: (_, { children, ...props }) => <PanelLateralMotion {...props}>{children}</PanelLateralMotion>,
          }}
        >
          <DrawerHeader>
            <BrandMark />
          </DrawerHeader>
          <DrawerBody className={styles.drawerBody}>
            <SideNav sections={navegacionPublica} selectedValue={activa} onNavigate={() => setMenuAbierto(false)} />
          </DrawerBody>
        </OverlayDrawer>
      )}
    </div>
  );
}

export default SiteShell;
