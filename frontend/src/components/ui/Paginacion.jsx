import { Button, Caption1, Dropdown, makeStyles, Option, tokens, Tooltip } from "@fluentui/react-components";
import { ChevronLeft20Regular, ChevronRight20Regular } from "@fluentui/react-icons";
import { formatoNumero } from "../../lib/formato";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: "tabular-nums",
  },
  grupo: { display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS },
  tamano: { minWidth: "80px" },
});

/** Paginación al pie de una tabla: rango visible, tamaño de página y anterior/siguiente. */
export function Paginacion({ page, pageSize, total, totalPages, onPage, onPageSize, tamanos = [5, 10, 20, 50] }) {
  const styles = useStyles();
  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  return (
    <nav className={styles.root} aria-label="Paginación">
      <Caption1>
        {formatoNumero(desde)}–{formatoNumero(hasta)} de {formatoNumero(total)}
      </Caption1>
      <div className={styles.grupo}>
        {onPageSize && (
          <>
            <Caption1 id="filas-por-pagina">Filas por página</Caption1>
            <Dropdown
              size="small"
              className={styles.tamano}
              aria-labelledby="filas-por-pagina"
              value={String(pageSize)}
              selectedOptions={[String(pageSize)]}
              onOptionSelect={(_, d) => onPageSize(Number(d.optionValue))}
            >
              {tamanos.map((t) => (
                <Option key={t} value={String(t)}>
                  {String(t)}
                </Option>
              ))}
            </Dropdown>
          </>
        )}
        <Caption1>
          Página {page} de {totalPages}
        </Caption1>
        <Tooltip content="Página anterior" relationship="label">
          <Button appearance="subtle" icon={<ChevronLeft20Regular />} disabled={page <= 1} onClick={() => onPage(page - 1)} />
        </Tooltip>
        <Tooltip content="Página siguiente" relationship="label">
          <Button
            appearance="subtle"
            icon={<ChevronRight20Regular />}
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
          />
        </Tooltip>
      </div>
    </nav>
  );
}

export default Paginacion;
