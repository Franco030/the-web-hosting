import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Caption1,
  Dropdown,
  Field,
  makeStyles,
  MessageBar,
  Option,
  SearchBox,
  Skeleton,
  SkeletonItem,
  Spinner,
  tokens,
} from "@fluentui/react-components";
import { DocumentPdf20Regular } from "@fluentui/react-icons";
import { Page, PageHeader } from "../../components/ui/Page";
import { EmptyState } from "../../components/ui/EmptyState";
import { IlustracionBusqueda } from "../../components/illustrations/Ilustraciones";
import { useDatos } from "../../hooks/useDatos";
import { useNotificar } from "../../hooks/useNotificar";
import api from "../../services/ApiClient";
import { PlanCard, useDescargarFicha } from "./PlanCard";

const TIPOS = ["Compartido", "WordPress", "VPS", "Cloud", "Dedicado"];
const PRECIOS = [
  { valor: "", texto: "Cualquier precio" },
  { valor: "100", texto: "Hasta $100" },
  { valor: "300", texto: "Hasta $300" },
  { valor: "1000", texto: "Hasta $1,000" },
];
const ORDENES = [
  { valor: "relevancia", texto: "Recomendados" },
  { valor: "precio_asc", texto: "Precio: menor a mayor" },
  { valor: "precio_desc", texto: "Precio: mayor a menor" },
  { valor: "nombre", texto: "Nombre" },
];

const useStyles = makeStyles({
  filtros: {
    display: "grid",
    gap: tokens.spacingHorizontalM,
    alignItems: "end",
    gridTemplateColumns: "1fr",
    "@media (min-width: 640px) and (max-width: 1023px)": { gridTemplateColumns: "1fr 1fr" },
    "@media (min-width: 1024px)": { gridTemplateColumns: "minmax(0, 2fr) repeat(3, minmax(0, 1fr))" },
  },
  buscador: { maxWidth: "none", width: "100%" },
  dropdown: { minWidth: 0, width: "100%" },
  resumen: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  rejilla: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  },
});

/** Catálogo con estrategia de búsqueda: texto + tipo + precio + orden (en la URL). */
export default function Planes() {
  const styles = useStyles();
  const notificar = useNotificar();
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState(params.get("q") || "");
  const [exportando, setExportando] = useState(false);
  const { descargar, descargando } = useDescargarFicha();

  const filtros = {
    q: params.get("q") || "",
    tipo: params.get("tipo") || "",
    precioMax: params.get("precioMax") || "",
    orden: params.get("orden") || "relevancia",
  };
  const clave = JSON.stringify(filtros);

  const cambiar = useCallback(
    (cambios) => {
      setParams(
        (actual) => {
          const siguiente = new URLSearchParams(actual);
          Object.entries(cambios).forEach(([k, v]) => (v ? siguiente.set(k, v) : siguiente.delete(k)));
          return siguiente;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // El texto se aplica 300 ms después de dejar de escribir.
  useEffect(() => {
    const t = setTimeout(() => {
      if (texto.trim() !== filtros.q) cambiar({ q: texto.trim() });
    }, 300);
    return () => clearTimeout(t);
  }, [texto, filtros.q, cambiar]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cargar = useCallback(() => api.get("/planes", JSON.parse(clave)), [clave]);
  const { datos: planes, cargando, error } = useDatos(cargar, []);

  const exportar = async () => {
    setExportando(true);
    try {
      await api.descargar("/planes/catalogo/pdf", filtros, "planes.pdf");
    } catch (e) {
      notificar("No se pudo generar el PDF", { cuerpo: e.message, intent: "error" });
    } finally {
      setExportando(false);
    }
  };

  const hayFiltros = filtros.q || filtros.tipo || filtros.precioMax;
  const textoPrecio = PRECIOS.find((p) => p.valor === filtros.precioMax)?.texto;
  const textoOrden = ORDENES.find((o) => o.valor === filtros.orden)?.texto;

  return (
    <Page centrada>
      <PageHeader
        title="Planes de hosting"
        description="Busca por nombre, tecnología o necesidad (por ejemplo: tienda, WordPress, 8 GB) y filtra por tipo y presupuesto."
      />

      <div className={styles.filtros} role="search">
        <Field label="Buscar planes">
          <SearchBox
            className={styles.buscador}
            value={texto}
            onChange={(_, d) => setTexto(d.value)}
            placeholder="Ej. WordPress, tienda, 8 GB"
          />
        </Field>
        <Field label="Tipo de plan">
          <Dropdown
            className={styles.dropdown}
            value={filtros.tipo || "Todos los tipos"}
            selectedOptions={[filtros.tipo]}
            onOptionSelect={(_, d) => cambiar({ tipo: d.optionValue })}
          >
            <Option value="">Todos los tipos</Option>
            {TIPOS.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Presupuesto mensual">
          <Dropdown
            className={styles.dropdown}
            value={textoPrecio}
            selectedOptions={[filtros.precioMax]}
            onOptionSelect={(_, d) => cambiar({ precioMax: d.optionValue })}
          >
            {PRECIOS.map((p) => (
              <Option key={p.valor} value={p.valor}>
                {p.texto}
              </Option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Ordenar por">
          <Dropdown
            className={styles.dropdown}
            value={textoOrden}
            selectedOptions={[filtros.orden]}
            onOptionSelect={(_, d) => cambiar({ orden: d.optionValue === "relevancia" ? "" : d.optionValue })}
          >
            {ORDENES.map((o) => (
              <Option key={o.valor} value={o.valor}>
                {o.texto}
              </Option>
            ))}
          </Dropdown>
        </Field>
      </div>

      <div className={styles.resumen}>
        <Caption1 aria-live="polite">
          {cargando ? "Buscando…" : `${planes.length} ${planes.length === 1 ? "plan encontrado" : "planes encontrados"}`}
        </Caption1>
        <Button
          icon={exportando ? <Spinner size="tiny" /> : <DocumentPdf20Regular />}
          onClick={exportar}
          disabled={exportando || planes.length === 0}
        >
          Descargar resultados en PDF
        </Button>
      </div>

      {error && <MessageBar intent="error">No pudimos buscar los planes. {error.message}</MessageBar>}

      {!cargando && !error && planes.length === 0 ? (
        <EmptyState
          ilustracion={<IlustracionBusqueda />}
          titulo="No hay planes con esos filtros"
          descripcion="Prueba con otras palabras o quita algún filtro. Si buscas algo a la medida, escríbenos y lo armamos contigo."
          accion={
            hayFiltros && (
              <Button
                onClick={() => {
                  setTexto("");
                  cambiar({ q: "", tipo: "", precioMax: "", orden: "" });
                }}
              >
                Quitar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className={styles.rejilla}>
          {cargando && planes.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} aria-label="Cargando planes">
                  <SkeletonItem style={{ height: 380, borderRadius: 12 }} />
                </Skeleton>
              ))
            : planes.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onFicha={descargar} descargando={descargando === plan.id} />
              ))}
        </div>
      )}
    </Page>
  );
}
