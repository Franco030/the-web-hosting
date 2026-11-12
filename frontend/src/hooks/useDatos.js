import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Carga datos de la API: { datos, cargando, error, recargar }.
 * `cargar` debe ser estable (useCallback) o cambiar solo cuando cambian sus filtros.
 */
export function useDatos(cargar, inicial = null) {
  const [estado, setEstado] = useState({ datos: inicial, cargando: true, error: null });
  const peticion = useRef(0);

  const recargar = useCallback(async () => {
    const id = ++peticion.current;
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    try {
      const datos = await cargar();
      if (id === peticion.current) setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      if (id === peticion.current) setEstado((e) => ({ ...e, cargando: false, error }));
    }
  }, [cargar]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { ...estado, recargar };
}

export default useDatos;
