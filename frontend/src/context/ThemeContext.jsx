/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const CLAVE = "twh_theme";
const ThemeContext = createContext(null);

const leerTema = () => {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === "light" || guardado === "dark") return guardado;
  } catch {
    /* almacenamiento bloqueado */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/** Tema claro / oscuro: clase .dark en <html> y preferencia en localStorage. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(leerTema);
  const inicial = useRef(theme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    let limpiar;
    // El cambio es instantáneo: se suspenden las transiciones un momento.
    if (theme !== inicial.current) {
      inicial.current = null;
      root.classList.add("theme-switching");
      const quitar = () => root.classList.remove("theme-switching");
      const frame = requestAnimationFrame(() => requestAnimationFrame(quitar));
      const temporizador = setTimeout(quitar, 100);
      limpiar = () => {
        cancelAnimationFrame(frame);
        clearTimeout(temporizador);
        quitar();
      };
    }
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(CLAVE, theme);
    } catch {
      /* almacenamiento bloqueado */
    }
    return limpiar;
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const alCambiar = (e) => {
      try {
        if (!localStorage.getItem(CLAVE)) setTheme(e.matches ? "dark" : "light");
      } catch {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", alCambiar);
    return () => media.removeEventListener("change", alCambiar);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}
