import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  DrawerBody,
  DrawerHeader,
  Hamburger,
  makeStyles,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItem,
  MenuItemSwitch,
  MenuList,
  MenuPopover,
  MenuTrigger,
  mergeClasses,
  OverlayDrawer,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { Globe20Regular, SignOut20Regular } from "@fluentui/react-icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { Avisos } from "../../hooks/useNotificar";
import { PanelLateralMotion } from "../../theme/navMotion";
import { veloHover, veloPresionado } from "../../theme/superficies";
import { BrandMark } from "./BrandMark";
import { SideNav } from "./SideNav";
import { navegacionAdmin, rutaActiva } from "./navigation";

const DESKTOP_QUERY = "(min-width: 1024px)";
const RAIL_WIDTH = "56px";

const useStyles = makeStyles({
  // Capa base: material tipo Mica (neutro con un 5 % de la marca).
  root: {
    height: "100dvh",
    display: "grid",
    gridTemplateRows: "48px minmax(0, 1fr)",
    backgroundColor: `color-mix(in srgb, ${tokens.colorBrandBackground} 5%, ${tokens.colorNeutralBackground3})`,
  },
  titleBar: {
    "& .fui-Button:hover": { backgroundColor: veloHover },
    "& .fui-Button:hover:active": { backgroundColor: veloPresionado },
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    paddingInlineStart: "12px",
    paddingInlineEnd: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: tokens.borderRadiusMedium,
    paddingInline: tokens.spacingHorizontalXS,
    color: "inherit",
    textDecorationLine: "none",
    ":focus-visible": { outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}` },
  },
  badge: {
    display: "none",
    "@media (min-width: 640px)": { display: "inline-flex" },
  },
  spacer: { flexGrow: 1 },
  body: { position: "relative", display: "flex", minHeight: 0 },
  rail: { flexShrink: 0, width: RAIL_WIDTH },
  // Un solo menú que es riel cerrado y panel abierto (modo LeftCompact de Windows).
  pane: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    width: "280px",
    overflowY: "auto",
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground3} 82%, transparent)`,
    backdropFilter: "blur(30px) saturate(125%)",
    borderRight: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow28,
    clipPath: "inset(0 -40px 0 0)",
    transitionProperty: "clip-path, box-shadow, background-color",
    transitionDuration: tokens.durationSlow,
    transitionTimingFunction: tokens.curveDecelerateMin,
  },
  paneClosed: {
    clipPath: `inset(0 calc(100% - ${RAIL_WIDTH}) 0 0)`,
    boxShadow: "none",
    backgroundColor: "transparent",
    transitionDuration: tokens.durationNormal,
  },
  // Lienzo: superficie sobre la base, con la esquina interior redondeada desde 1024 px.
  canvas: {
    position: "relative",
    flexGrow: 1,
    minWidth: 0,
    overflowY: "auto",
    scrollbarGutter: "stable",
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    "@media (min-width: 1024px)": {
      borderLeft: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
      borderTopLeftRadius: tokens.borderRadiusXLarge,
    },
  },
  page: { minHeight: "100%", display: "flex", flexDirection: "column" },
  drawer: { width: "300px", maxWidth: "85vw", backgroundColor: tokens.colorNeutralBackground2 },
  drawerBody: { paddingInline: 0 },
});

function MenuUsuario() {
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  return (
    <Menu
      checkedValues={{ tema: isDark ? ["oscuro"] : [] }}
      onCheckedValueChange={(_, data) => data.name === "tema" && toggleTheme()}
    >
      <MenuTrigger disableButtonEnhancement>
        <Tooltip content="Cuenta" relationship="label">
          <Button appearance="subtle" icon={<Avatar name={admin?.nombre} size={28} color="brand" />} />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuGroupHeader>{admin?.correo}</MenuGroupHeader>
          <MenuItemSwitch name="tema" value="oscuro">
            Tema oscuro
          </MenuItemSwitch>
          <MenuItem icon={<Globe20Regular />} onClick={() => navigate("/")}>
            Ver el sitio público
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<SignOut20Regular />}
            onClick={() => {
              logout();
              navigate("/admin/acceso");
            }}
          >
            Cerrar sesión
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

/*
 * Ventana de administración (patrón de app de Windows de TutoriasU): barra de
 * 48 px, riel de íconos fijo y panel acrílico sobre el contenido al abrir el
 * menú; cajón superpuesto en móvil.
 */
export function AdminShell({ children }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const esEscritorio = useMediaQuery(DESKTOP_QUERY);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const paneRef = useRef(null);
  const hamburgerRef = useRef(null);
  const activa = rutaActiva(navegacionAdmin, pathname);

  useEffect(() => {
    if (!esEscritorio || !menuAbierto) return undefined;
    const alPresionar = (event) => {
      if (paneRef.current?.contains(event.target) || hamburgerRef.current?.contains(event.target)) return;
      setMenuAbierto(false);
    };
    const alTeclear = (event) => {
      if (event.key === "Escape") {
        setMenuAbierto(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", alPresionar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPresionar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [esEscritorio, menuAbierto]);

  return (
    <div className={styles.root}>
      <header className={styles.titleBar}>
        <Tooltip content={menuAbierto ? "Cerrar navegación" : "Abrir navegación"} relationship="label">
          <Hamburger ref={hamburgerRef} onClick={() => setMenuAbierto((v) => !v)} aria-expanded={menuAbierto} />
        </Tooltip>
        <a
          href="/admin"
          className={styles.brandLink}
          onClick={(event) => {
            event.preventDefault();
            navigate("/admin");
          }}
        >
          <BrandMark />
        </a>
        <Badge appearance="tint" color="brand" size="small" className={styles.badge}>
          Administración
        </Badge>
        <div className={styles.spacer} />
        <MenuUsuario />
      </header>

      <div className={styles.body}>
        {esEscritorio && (
          <>
            <div className={styles.rail} aria-hidden="true" />
            <div ref={paneRef} className={mergeClasses(styles.pane, !menuAbierto && styles.paneClosed)}>
              <SideNav
                sections={navegacionAdmin}
                selectedValue={activa}
                compact={!menuAbierto}
                onNavigate={() => setMenuAbierto(false)}
              />
            </div>
          </>
        )}
        <div className={styles.canvas}>
          <div key={pathname} className={styles.page}>
            {children}
          </div>
        </div>
      </div>

      <Avisos />

      {!esEscritorio && (
        <OverlayDrawer
          open={menuAbierto}
          onOpenChange={(_, data) => setMenuAbierto(data.open)}
          className={styles.drawer}
          aria-label="Navegación de administración"
          surfaceMotion={{
            children: (_, { children, ...props }) => <PanelLateralMotion {...props}>{children}</PanelLateralMotion>,
          }}
        >
          <DrawerHeader>
            <BrandMark />
          </DrawerHeader>
          <DrawerBody className={styles.drawerBody}>
            <SideNav sections={navegacionAdmin} selectedValue={activa} onNavigate={() => setMenuAbierto(false)} />
          </DrawerBody>
        </OverlayDrawer>
      )}
    </div>
  );
}

export default AdminShell;
