import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Dropdown,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  Option,
  SearchBox,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import { Add20Regular, Delete20Regular, Edit20Regular, MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Page, PageHeader, Surface } from "../../components/ui/Page";
import { Paginacion } from "../../components/ui/Paginacion";
import { ConfirmarDialog } from "../../components/ui/ConfirmarDialog";
import { useDatos } from "../../hooks/useDatos";
import { useNotificar } from "../../hooks/useNotificar";
import api from "../../services/ApiClient";
import { diasHasta, formatoFecha } from "../../lib/formato";
import { ContratacionFormDialog } from "./ContratacionFormDialog";

const COLOR_ESTADO = { Activa: "success", Suspendida: "warning", Cancelada: "subtle" };

const useStyles = makeStyles({
  barra: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalM, alignItems: "center" },
  buscador: { width: "100%", maxWidth: "360px" },
  estado: { minWidth: "180px" },
  scroll: { overflowX: "auto" },
  tabla: { minWidth: "820px" },
  secundario: { color: tokens.colorNeutralForeground3 },
});

/** Mantenimiento de contrataciones (qué cliente tiene qué plan y hasta cuándo). */
export default function AdminContrataciones() {
  const styles = useStyles();
  const notificar = useNotificar();
  const [filtros, setFiltros] = useState({ page: 1, pageSize: 10, q: "", estado: "" });
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => (f.q === texto.trim() ? f : { ...f, q: texto.trim(), page: 1 })), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const cargar = useCallback(() => api.get("/contrataciones", filtros), [filtros]);
  const { datos, error, recargar } = useDatos(cargar, { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const cargarPlanes = useCallback(() => api.get("/planes", { todos: "true", orden: "nombre" }), []);
  const { datos: planes } = useDatos(cargarPlanes, []);

  const eliminar = async () => {
    try {
      await api.delete(`/contrataciones/${eliminando.id}`);
      notificar(`Se eliminó la contratación de ${eliminando.dominio}`);
      setEliminando(null);
      recargar();
    } catch (e) {
      setEliminando(null);
      notificar("No se pudo eliminar", { cuerpo: e.message, intent: "error" });
    }
  };

  return (
    <Page>
      <PageHeader
        title="Contrataciones"
        description="Planes contratados por cada cliente, con su dominio y vigencia."
        actions={
          <Button appearance="primary" icon={<Add20Regular />} onClick={() => setEditando({})} disabled={planes.length === 0}>
            Registrar contratación
          </Button>
        }
      />
      {error && <MessageBar intent="error">{error.message}</MessageBar>}
      <div className={styles.barra}>
        <SearchBox
          className={styles.buscador}
          placeholder="Buscar por dominio, cliente o plan"
          aria-label="Buscar contrataciones"
          value={texto}
          onChange={(_, d) => setTexto(d.value)}
        />
        <Dropdown
          className={styles.estado}
          aria-label="Filtrar por estado"
          value={filtros.estado || "Todos los estados"}
          selectedOptions={[filtros.estado]}
          onOptionSelect={(_, d) => setFiltros((f) => ({ ...f, estado: d.optionValue, page: 1 }))}
        >
          <Option value="">Todos los estados</Option>
          {Object.keys(COLOR_ESTADO).map((e) => (
            <Option key={e}>{e}</Option>
          ))}
        </Dropdown>
      </div>
      <Surface flush>
        <div className={styles.scroll}>
          <Table className={styles.tabla} aria-label="Contrataciones">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Dominio</TableHeaderCell>
                <TableHeaderCell>Cliente</TableHeaderCell>
                <TableHeaderCell>Plan</TableHeaderCell>
                <TableHeaderCell>Vencimiento</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell style={{ width: 56 }}>
                  <span className="visually-hidden">Acciones</span>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.items.map((c) => {
                const dias = diasHasta(c.fechaVencimiento);
                return (
                  <TableRow key={c.id}>
                    <TableCell>{c.dominio}</TableCell>
                    <TableCell>
                      <TableCellLayout description={c.cliente?.empresa || c.cliente?.correo}>{c.cliente?.nombre}</TableCellLayout>
                    </TableCell>
                    <TableCell>
                      <TableCellLayout description={c.plan?.tipo}>{c.plan?.nombre}</TableCellLayout>
                    </TableCell>
                    <TableCell>
                      <TableCellLayout
                        description={c.estado === "Activa" ? (dias < 0 ? "Vencida" : dias === 0 ? "Vence hoy" : `En ${dias} días`) : undefined}
                      >
                        {formatoFecha(c.fechaVencimiento)}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell>
                      <Badge appearance="tint" color={COLOR_ESTADO[c.estado]}>
                        {c.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Menu>
                        <MenuTrigger disableButtonEnhancement>
                          <Tooltip content={`Acciones de ${c.dominio}`} relationship="label">
                            <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                          </Tooltip>
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem icon={<Edit20Regular />} onClick={() => setEditando(c)}>
                              Editar
                            </MenuItem>
                            <MenuItem icon={<Delete20Regular />} onClick={() => setEliminando(c)}>
                              Eliminar
                            </MenuItem>
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {datos.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className={styles.secundario}>
                    No hay contrataciones con esos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Paginacion
          {...datos}
          onPage={(page) => setFiltros((f) => ({ ...f, page }))}
          onPageSize={(pageSize) => setFiltros((f) => ({ ...f, pageSize, page: 1 }))}
        />
      </Surface>

      {editando !== null && (
      <ContratacionFormDialog
        key={editando.id ?? "nueva"}
        abierto
        contratacion={editando?.id ? editando : null}
        planes={planes}
        onCerrar={() => setEditando(null)}
        onGuardado={(c, fueEdicion) => {
          setEditando(null);
          notificar(fueEdicion ? `Se guardaron los cambios de ${c.dominio}` : `Se registró ${c.dominio}`);
          recargar();
        }}
      />
      )}
      <ConfirmarDialog
        abierto={Boolean(eliminando)}
        titulo={`¿Eliminar la contratación de ${eliminando?.dominio}?`}
        mensaje="Se borra el registro de forma permanente. Si solo quieres pausar el servicio, edítala y cámbiala a Suspendida."
        onConfirmar={eliminar}
        onCerrar={() => setEliminando(null)}
      />
    </Page>
  );
}
