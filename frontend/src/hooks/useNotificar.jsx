/* eslint-disable react-refresh/only-export-components */
import { useCallback } from "react";
import { Toast, ToastBody, ToastTitle, Toaster, useToastController } from "@fluentui/react-components";

export const TOASTER_ID = "twh-avisos";

/** Contenedor único de avisos (abajo a la derecha). */
export function Avisos() {
  return <Toaster toasterId={TOASTER_ID} position="bottom-end" pauseOnHover pauseOnWindowBlur />;
}

/** Aviso breve tras una acción cuyo resultado no se ve en la misma vista. */
export function useNotificar() {
  const { dispatchToast } = useToastController(TOASTER_ID);
  return useCallback(
    (titulo, { cuerpo, intent = "success" } = {}) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{titulo}</ToastTitle>
          {cuerpo && <ToastBody>{cuerpo}</ToastBody>}
        </Toast>,
        { intent, timeout: 4000 }
      );
    },
    [dispatchToast]
  );
}

export default useNotificar;
