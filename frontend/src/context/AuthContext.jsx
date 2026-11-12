/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/ApiClient";

const AuthContext = createContext(null);

/** Sesión del administrador (JWT guardado en sessionStorage por ApiClient). */
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [cargando, setCargando] = useState(Boolean(api.token));

  useEffect(() => {
    if (!api.token) return undefined;
    let vigente = true;
    api
      .get("/auth/perfil")
      .then((perfil) => vigente && setAdmin(perfil))
      .catch(() => {
        api.token = null;
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => api.onSesionExpirada(() => setAdmin(null)), []);

  const login = useCallback(async (correo, password) => {
    const { token, administrador } = await api.post("/auth/login", { correo, password });
    api.token = token;
    setAdmin(administrador);
    return administrador;
  }, []);

  const logout = useCallback(() => {
    api.token = null;
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, cargando, login, logout }), [admin, cargando, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
