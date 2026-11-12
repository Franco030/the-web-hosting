import { useCallback, useMemo, useState } from "react";
import {
  Badge,
  Button,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
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
import { Add20Regular, Delete20Regular, Edit20Regular, Eye20Regular, EyeOff20Regular, MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Page, PageHeader, PageLoading, Surface } from "../../components/ui/Page";
import { ConfirmarDialog } from "../../components/ui/ConfirmarDialog";
import { useDatos } from "../../hooks/useDatos";
import { useNotificar } from "../../hooks/useNotificar";
import api from "../../services/ApiClient";
import { formatoMoneda } from "../../lib/formato";
import { PlanFormDialog } from "./PlanFormDialog";

const useStyles = makeStyles({
  barra: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalM, alignItems: "center" },
  buscador: { width: "100%", maxWidth: "360px" },
  scroll: { overflowX: "auto" },
  tabla: { minWidth: "760px" },
  numero: { fontVariantNumeric: "tabular-nums", textAlign: "end" },
  secundario: { color: tokens.colorNeutralForeground3 },
  acciones: { width: "56px" },
});

/** Mantenimiento de planes: altas, bajas y actualizaciones. */
export default function AdminPlanes() {
  const styles = useStyles();
  const notificar = useNotificar();
  const cargar = useCallback(() => api.get("/planes", { todos: "true", orden: "nombre" }), []);
  const { datos: planes, cargando, error, recargar } = useDatos(cargar, []);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null); // null cerrado · {} nuevo · plan
  const [eliminando, setEliminando] = useState(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q ? planes.filter((p) => `${p.nombre} ${p.tipo}`.toLowerCase().includes(q)) : planes;
  }, [planes, busqueda]);

  const cambiarVisibilidad = async (plan) => {
    try {
      await api.put(`/planes/${plan.id}`, { activo: !plan.activo });
      notificar(plan.activo ? `${plan.nombre} ya no aparece en el catálogo` : `${plan.nombre} volvió al catálogo`);
      recargar();
    } catch (e) {
      notificar("No se pudo actualizar el plan", { cuerpo: e.message, intent: "error" });
    }
  };

  const eliminar = async () => {
    try {
      await api.delete(`/planes/${eliminando.id}`);
      notificar(`Se eliminó ${eliminando.nombre}`);
      setEliminando(null);
      recargar();
    } catch (e) {
      setEliminando(null);
      notificar("No se pudo eliminar", { cuerpo: e.message, intent: "error" });
    }
  };

  if (cargando && planes.length === 0) return <PageLoading label="Cargando planes" />;

  return (
    <Page>
      <PageHeader
        title="Planes"
        description="Agrega, edita o retira los planes de hosting que aparecen en el sitio público."
        actions={
          <Button appearance="primary" icon={<Add20Regular />} onClick={() => setEditando({})}>
            Agregar plan
          </Button>
        }
      />
      {error && <MessageBar intent="error">{error.message}</MessageBar>}
      <div className={styles.barra}>
        <SearchBox
          className={styles.buscador}
          placeholder="Filtrar por nombre o tipo"
          aria-label="Filtrar planes"
          value={busqueda}
          onChange={(_, d) => setBusqueda(d.value)}
        />
      </div>
      <Surface flush className={styles.scroll}>
        <Table className={styles.tabla} aria-label="Planes de hosting">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell className={styles.numero}>Precio/mes</TableHeaderCell>
              <TableHeaderCell className={styles.numero}>Almacenamiento</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell className={styles.acciones}>
                <span className="visually-hidden">Acciones</span>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <TableCellLayout description={plan.destacado ? "Destacado en el inicio" : undefined}>{plan.nombre}</TableCellLayout>
                </TableCell>
                <TableCell>{plan.tipo}</TableCell>
                <TableCell className={styles.numero}>{formatoMoneda(plan.precioMensual)}</TableCell>
                <TableCell className={styles.numero}>{plan.almacenamientoGB} GB</TableCell>
                <TableCell>
                  {plan.activo ? (
                    <Badge appearance="tint" color="success">Visible</Badge>
                  ) : (
                    <Badge appearance="tint" color="subtle">Oculto</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <Tooltip content={`Acciones de ${plan.nombre}`} relationship="label">
                        <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                      </Tooltip>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem icon={<Edit20Regular />} onClick={() => setEditando(plan)}>
                          Editar
                        </MenuItem>
                        <MenuItem icon={plan.activo ? <EyeOff20Regular /> : <Eye20Regular />} onClick={() => cambiarVisibilidad(plan)}>
                          {plan.activo ? "Ocultar del catálogo" : "Mostrar en el catálogo"}
                        </MenuItem>
                        <MenuItem icon={<Delete20Regular />} onClick={() => setEliminando(plan)}>
                          Eliminar
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className={styles.secundario}>
                  Ningún plan coincide con “{busqueda}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Surface>

      <PlanFormDialog
        abierto={editando !== null}
        plan={editando?.id ? editando : null}
        onCerrar={() => setEditando(null)}
        onGuardado={(plan, fueEdicion) => {
          setEditando(null);
          notificar(fueEdicion ? `Se guardaron los cambios de ${plan.nombre}` : `Se agregó ${plan.nombre}`);
          recargar();
        }}
      />
      <ConfirmarDialog
        abierto={Boolean(eliminando)}
        titulo={`¿Eliminar ${eliminando?.nombre}?`}
        mensaje="El plan se borra del catálogo de forma permanente. Si tiene contrataciones, no se puede eliminar: ocúltalo en su lugar."
        onConfirmar={eliminar}
        onCerrar={() => setEliminando(null)}
      />
    </Page>
  );
}
