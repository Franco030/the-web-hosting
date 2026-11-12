import { useCallback, useEffect, useState } from "react";
import {
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  Option,
  PresenceBadge,
  SearchBox,
  Spinner,
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
import {
  Delete20Regular,
  DocumentPdf20Regular,
  DocumentTable20Regular,
  MailRead20Regular,
  MailUnread20Regular,
  MoreHorizontal20Regular,
  Open20Regular,
} from "@fluentui/react-icons";
import { Page, PageHeader, Surface } from "../../components/ui/Page";
import { Paginacion } from "../../components/ui/Paginacion";
import { ConfirmarDialog } from "../../components/ui/ConfirmarDialog";
import { useDatos } from "../../hooks/useDatos";
import { useNotificar } from "../../hooks/useNotificar";
import api from "../../services/ApiClient";
import { formatoFecha } from "../../lib/formato";

const useStyles = makeStyles({
  barra: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalM, alignItems: "center" },
  buscador: { width: "100%", maxWidth: "360px" },
  filtro: { minWidth: "160px" },
  scroll: { overflowX: "auto" },
  tabla: { minWidth: "820px" },
  noLeida: { fontWeight: tokens.fontWeightSemibold },
  extracto: {
    display: "block",
    maxWidth: "48ch",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: tokens.colorNeutralForeground3,
  },
  secundario: { color: tokens.colorNeutralForeground3 },
  mensaje: { whiteSpace: "pre-line", marginTop: tokens.spacingVerticalM },
  fecha: { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
});

const LEIDAS = [
  { valor: "", texto: "Todas" },
  { valor: "false", texto: "Sin leer" },
  { valor: "true", texto: "Leídas" },
];

/** Listado paginado de sugerencias con exportación a Excel y PDF. */
export default function AdminSugerencias() {
  const styles = useStyles();
  const notificar = useNotificar();
  const [filtros, setFiltros] = useState({ page: 1, pageSize: 10, q: "", leida: "" });
  const [texto, setTexto] = useState("");
  const [abierta, setAbierta] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [exportando, setExportando] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => (f.q === texto.trim() ? f : { ...f, q: texto.trim(), page: 1 })), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const cargar = useCallback(() => api.get("/sugerencias", filtros), [filtros]);
  const { datos, error, recargar } = useDatos(cargar, { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 });

  const exportar = async (formato) => {
    setExportando(formato);
    try {
      const { q, leida } = filtros;
      await api.descargar(`/sugerencias/exportar/${formato}`, { q, leida }, `sugerencias.${formato === "excel" ? "xlsx" : "pdf"}`);
    } catch (e) {
      notificar("No se pudo exportar", { cuerpo: e.message, intent: "error" });
    } finally {
      setExportando(null);
    }
  };

  const marcar = async (s, leida) => {
    try {
      await api.patch(`/sugerencias/${s.id}`, { leida });
      recargar();
    } catch (e) {
      notificar("No se pudo actualizar", { cuerpo: e.message, intent: "error" });
    }
  };

  const abrir = (s) => {
    setAbierta(s);
    if (!s.leida) marcar(s, true);
  };

  const eliminar = async () => {
    try {
      await api.delete(`/sugerencias/${eliminando.id}`);
      notificar("Se eliminó la sugerencia");
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
        title="Sugerencias"
        description="Mensajes recibidos desde el formulario de contacto. Se exportan con los filtros aplicados."
        actions={
          <>
            <Button
              icon={exportando === "excel" ? <Spinner size="tiny" /> : <DocumentTable20Regular />}
              disabled={Boolean(exportando) || datos.total === 0}
              onClick={() => exportar("excel")}
            >
              Exportar a Excel
            </Button>
            <Button
              icon={exportando === "pdf" ? <Spinner size="tiny" /> : <DocumentPdf20Regular />}
              disabled={Boolean(exportando) || datos.total === 0}
              onClick={() => exportar("pdf")}
            >
              Exportar a PDF
            </Button>
          </>
        }
      />
      {error && <MessageBar intent="error">{error.message}</MessageBar>}
      <div className={styles.barra}>
        <SearchBox
          className={styles.buscador}
          placeholder="Buscar por nombre, correo o texto"
          aria-label="Buscar sugerencias"
          value={texto}
          onChange={(_, d) => setTexto(d.value)}
        />
        <Dropdown
          className={styles.filtro}
          aria-label="Filtrar por lectura"
          value={LEIDAS.find((l) => l.valor === filtros.leida)?.texto}
          selectedOptions={[filtros.leida]}
          onOptionSelect={(_, d) => setFiltros((f) => ({ ...f, leida: d.optionValue, page: 1 }))}
        >
          {LEIDAS.map((l) => (
            <Option key={l.valor} value={l.valor}>
              {l.texto}
            </Option>
          ))}
        </Dropdown>
      </div>

      <Surface flush>
        <div className={styles.scroll}>
          <Table className={styles.tabla} aria-label="Sugerencias recibidas">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Remitente</TableHeaderCell>
                <TableHeaderCell>Asunto</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell style={{ width: 56 }}>
                  <span className="visually-hidden">Acciones</span>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <TableCellLayout
                      media={!s.leida ? <PresenceBadge status="available" size="extra-small" aria-label="Sin leer" /> : undefined}
                      description={s.correo}
                    >
                      <span className={!s.leida ? styles.noLeida : undefined}>{s.nombre}</span>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <Link as="button" onClick={() => abrir(s)} className={!s.leida ? styles.noLeida : undefined}>
                      {s.asunto}
                    </Link>
                    <Caption1 className={styles.extracto}>{s.mensaje}</Caption1>
                  </TableCell>
                  <TableCell className={styles.fecha}>{formatoFecha(s.createdAt)}</TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <Tooltip content={`Acciones de “${s.asunto}”`} relationship="label">
                          <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                        </Tooltip>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem icon={<Open20Regular />} onClick={() => abrir(s)}>
                            Abrir
                          </MenuItem>
                          <MenuItem
                            icon={s.leida ? <MailUnread20Regular /> : <MailRead20Regular />}
                            onClick={() => marcar(s, !s.leida)}
                          >
                            {s.leida ? "Marcar como no leída" : "Marcar como leída"}
                          </MenuItem>
                          <MenuItem icon={<Delete20Regular />} onClick={() => setEliminando(s)}>
                            Eliminar
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
              {datos.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className={styles.secundario}>
                    No hay sugerencias con esos filtros.
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

      <Dialog open={Boolean(abierta)} onOpenChange={(_, d) => !d.open && setAbierta(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{abierta?.asunto}</DialogTitle>
            <DialogContent>
              <Caption1 className={styles.secundario}>
                {abierta && `${abierta.nombre} · ${abierta.correo} · ${formatoFecha(abierta.createdAt)}`}
              </Caption1>
              <Body1 as="p" className={styles.mensaje}>
                {abierta?.mensaje}
              </Body1>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                as="a"
                href={abierta ? `mailto:${abierta.correo}?subject=${encodeURIComponent(`Re: ${abierta.asunto}`)}` : undefined}
              >
                Responder por correo
              </Button>
              <Button onClick={() => setAbierta(null)}>Cerrar</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <ConfirmarDialog
        abierto={Boolean(eliminando)}
        titulo="¿Eliminar esta sugerencia?"
        mensaje={`Se borra de forma permanente el mensaje “${eliminando?.asunto}” de ${eliminando?.nombre}.`}
        onConfirmar={eliminar}
        onCerrar={() => setEliminando(null)}
      />
    </Page>
  );
}
