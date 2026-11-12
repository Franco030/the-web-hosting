import { useCallback } from "react";
import { Body1, Caption1, makeStyles, MessageBar, Skeleton, SkeletonItem, Subtitle2, tokens } from "@fluentui/react-components";
import { Open16Regular } from "@fluentui/react-icons";
import api from "../../services/ApiClient";
import { useDatos } from "../../hooks/useDatos";
import { liftOnHover } from "../../theme/motion";

const useStyles = makeStyles({
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  },
  tarjeta: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow4,
    color: tokens.colorNeutralForeground1,
    textDecorationLine: "none",
    ...liftOnHover,
    ":focus-visible": { outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`, outlineOffset: "2px" },
  },
  // Placa clara fija para el logo: los logotipos están pensados sobre blanco.
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "88px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "#ffffff",
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke3}`,
  },
  img: { maxHeight: "56px", width: "auto" },
  nombre: { display: "flex", alignItems: "center", gap: tokens.spacingHorizontalXS },
  giro: { color: tokens.colorNeutralForeground3 },
});

/** Logos con enlace de las empresas (hipotéticas) que son clientes. */
export function ListaClientes() {
  const styles = useStyles();
  const cargar = useCallback(() => api.get("/empresas-cliente"), []);
  const { datos, cargando, error } = useDatos(cargar, []);

  if (error) return <MessageBar intent="error">No pudimos cargar los clientes. {error.message}</MessageBar>;

  return (
    <div className={styles.rejilla}>
      {cargando
        ? Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} aria-label="Cargando clientes">
              <SkeletonItem style={{ height: 160, borderRadius: 12 }} />
            </Skeleton>
          ))
        : datos.map((empresa) => (
            <a key={empresa.id} href={empresa.sitioWeb} target="_blank" rel="noopener noreferrer" className={styles.tarjeta}>
              <div className={styles.logo}>
                <img src={empresa.logo} alt={`Logotipo de ${empresa.nombre}`} width="160" height="56" loading="lazy" className={styles.img} />
              </div>
              <Subtitle2 className={styles.nombre}>
                {empresa.nombre}
                <Open16Regular aria-label="(abre en otra pestaña)" />
              </Subtitle2>
              <Caption1 className={styles.giro}>{empresa.giro}</Caption1>
            </a>
          ))}
      {!cargando && datos.length === 0 && <Body1>Aún no hay clientes para mostrar.</Body1>}
    </div>
  );
}

export default ListaClientes;
