import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/ApiClient";

const CLAVE_VISITA = "twh_visita_registrada";

/**
 * Contador de visitas y usuarios conectados. La visita se cuenta una vez por
 * sesión del navegador; los conectados llegan en vivo por Socket.IO.
 */
export function useEstadisticasEnVivo() {
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    let yaContada = false;
    try {
      yaContada = sessionStorage.getItem(CLAVE_VISITA) === "1";
      sessionStorage.setItem(CLAVE_VISITA, "1");
    } catch {
      /* sin almacenamiento: se cuenta igual */
    }
    (yaContada ? api.get("/visitas") : api.post("/visitas"))
      .then((datos) => setEstadisticas((prev) => ({ ...datos, ...(prev && { conectados: prev.conectados }) })))
      .catch(() => {});

    const socket = io({ transports: ["websocket", "polling"] });
    socket.on("estadisticas", (datos) => setEstadisticas(datos));
    return () => {
      socket.disconnect();
    };
  }, []);

  return estadisticas;
}

export default useEstadisticasEnVivo;
