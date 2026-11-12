import {
  bundleIcon,
  Building20Filled,
  Building20Regular,
  ChatHelp20Filled,
  ChatHelp20Regular,
  DataPie20Filled,
  DataPie20Regular,
  DocumentBulletList20Filled,
  DocumentBulletList20Regular,
  Home20Filled,
  Home20Regular,
  Mail20Filled,
  Mail20Regular,
  MailInbox20Filled,
  MailInbox20Regular,
  Server20Filled,
  Server20Regular,
} from "@fluentui/react-icons";

// Íconos con variante Filled en el elemento activo (SideNav pasa `filled`).
const Inicio = bundleIcon(Home20Filled, Home20Regular);
const Planes = bundleIcon(Server20Filled, Server20Regular);
const Clientes = bundleIcon(Building20Filled, Building20Regular);
const Ayuda = bundleIcon(ChatHelp20Filled, ChatHelp20Regular);
const Contacto = bundleIcon(Mail20Filled, Mail20Regular);
const Tablero = bundleIcon(DataPie20Filled, DataPie20Regular);
const Contrataciones = bundleIcon(DocumentBulletList20Filled, DocumentBulletList20Regular);
const Sugerencias = bundleIcon(MailInbox20Filled, MailInbox20Regular);

export const navegacionPublica = [
  {
    items: [
      { to: "/", label: "Inicio", icon: Inicio },
      { to: "/planes", label: "Planes", icon: Planes },
      { to: "/clientes", label: "Clientes", icon: Clientes },
      { to: "/preguntas-frecuentes", label: "Preguntas frecuentes", icon: Ayuda },
      { to: "/contacto", label: "Contacto", icon: Contacto },
    ],
  },
];

export const navegacionAdmin = [
  {
    items: [{ to: "/admin", label: "Tablero", icon: Tablero }],
  },
  {
    title: "Mantenimiento",
    items: [
      { to: "/admin/planes", label: "Planes", icon: Planes },
      { to: "/admin/contrataciones", label: "Contrataciones", icon: Contrataciones },
      { to: "/admin/sugerencias", label: "Sugerencias", icon: Sugerencias },
    ],
  },
];

/** Elemento activo: la ruta más específica que coincide con la actual. */
export function rutaActiva(secciones, pathname) {
  const rutas = secciones.flatMap((s) => s.items.map((i) => i.to));
  return (
    rutas
      .filter((to) => (to === "/" || to === "/admin" ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}
