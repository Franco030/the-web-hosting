import { useNavigate } from "react-router-dom";
import { Button } from "@fluentui/react-components";
import { Page, PageHeader } from "../components/ui/Page";
import { EmptyState } from "../components/ui/EmptyState";
import { IlustracionBusqueda } from "../components/illustrations/Ilustraciones";

export default function PaginaNoEncontrada() {
  const navigate = useNavigate();
  return (
    <Page centrada>
      <PageHeader title="Esta página no existe" description="Error 404" tituloPestana="Página no encontrada" />
      <EmptyState
        ilustracion={<IlustracionBusqueda />}
        titulo="Puede que el enlace esté mal escrito o que la página se haya movido"
        descripcion="Vuelve al inicio o usa la navegación de arriba."
        accion={
          <Button appearance="primary" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        }
      />
    </Page>
  );
}
