import { useEffect } from "react";

export const TITULO_APP = "The Web Hosting";

// Título de la pestaña con el formato "Pantalla · The Web Hosting".
export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${TITULO_APP}` : TITULO_APP;
    return () => {
      document.title = TITULO_APP;
    };
  }, [titulo]);
}

export default useTituloPagina;
