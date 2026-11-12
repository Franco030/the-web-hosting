import { Page, PageHeader } from "../../components/ui/Page";
import { ListaClientes } from "./ListaClientes";

export default function Clientes() {
  return (
    <Page centrada>
      <PageHeader
        title="Nuestros clientes"
        description="Negocios de todos los tamaños tienen su sitio con nosotros. Elige uno para visitar su página."
      />
      <ListaClientes />
    </Page>
  );
}
