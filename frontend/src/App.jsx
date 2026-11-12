import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SiteShell } from "./components/shell/SiteShell";
import { AdminShell } from "./components/shell/AdminShell";
import { PageLoading } from "./components/ui/Page";
import Inicio from "./features/inicio/Inicio";

// Pantallas secundarias en archivos aparte (se descargan al visitarlas).
const Planes = lazy(() => import("./features/planes/Planes"));
const PlanDetalle = lazy(() => import("./features/planes/PlanDetalle"));
const Clientes = lazy(() => import("./features/clientes/Clientes"));
const PreguntasFrecuentes = lazy(() => import("./features/faq/PreguntasFrecuentes"));
const Contacto = lazy(() => import("./features/contacto/Contacto"));
const PaginaNoEncontrada = lazy(() => import("./features/PaginaNoEncontrada"));
const Acceso = lazy(() => import("./features/admin/Acceso"));
const Tablero = lazy(() => import("./features/admin/Tablero"));
const AdminPlanes = lazy(() => import("./features/admin/AdminPlanes"));
const AdminContrataciones = lazy(() => import("./features/admin/AdminContrataciones"));
const AdminSugerencias = lazy(() => import("./features/admin/AdminSugerencias"));

function LayoutPublico() {
  return (
    <SiteShell>
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </SiteShell>
  );
}

/** Parte privada: solo administradores autenticados. */
function LayoutAdmin() {
  const { admin, cargando } = useAuth();
  const location = useLocation();
  if (cargando) return <PageLoading label="Verificando tu sesión" />;
  if (!admin) return <Navigate to="/admin/acceso" replace state={{ desde: location.pathname }} />;
  return (
    <AdminShell>
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </AdminShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutPublico />}>
        <Route index element={<Inicio />} />
        <Route path="planes" element={<Planes />} />
        <Route path="planes/:id" element={<PlanDetalle />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="preguntas-frecuentes" element={<PreguntasFrecuentes />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
      <Route
        path="admin/acceso"
        element={
          <Suspense fallback={<PageLoading />}>
            <Acceso />
          </Suspense>
        }
      />
      <Route path="admin" element={<LayoutAdmin />}>
        <Route index element={<Tablero />} />
        <Route path="planes" element={<AdminPlanes />} />
        <Route path="contrataciones" element={<AdminContrataciones />} />
        <Route path="sugerencias" element={<AdminSugerencias />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
