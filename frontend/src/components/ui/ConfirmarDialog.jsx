import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Spinner,
} from "@fluentui/react-components";
import { DangerButton } from "./DangerButton";

/**
 * Confirmación de una acción destructiva. Sin tacha en el título (el pie ya
 * tiene Cancelar); al terminar se cierra y el resultado lo confirma un aviso.
 */
export function ConfirmarDialog({ abierto, titulo, mensaje, textoConfirmar = "Eliminar", onConfirmar, onCerrar }) {
  const [trabajando, setTrabajando] = useState(false);

  const confirmar = async () => {
    setTrabajando(true);
    try {
      await onConfirmar();
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(_, d) => !d.open && !trabajando && onCerrar()} modalType="alert">
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogContent>{mensaje}</DialogContent>
          <DialogActions>
            <DangerButton onClick={confirmar} disabled={trabajando} icon={trabajando ? <Spinner size="tiny" /> : undefined}>
              {textoConfirmar}
            </DangerButton>
            <Button onClick={onCerrar} disabled={trabajando}>
              Cancelar
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

export default ConfirmarDialog;
