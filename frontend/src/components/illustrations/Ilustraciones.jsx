import { tokens } from "@fluentui/react-components";

/*
 * Ilustraciones propias al estilo Fluent: volúmenes que salen de la
 * superficie, una sola metáfora por imagen y colores solo de tokens (así
 * funcionan en claro y oscuro). Lienzo de 480×300; composición en y = 60–240.
 */
const marca = tokens.colorBrandBackground;
const marcaClara = tokens.colorBrandBackground2;
const marcaMedia = tokens.colorBrandStroke2;
const papel = "#ffffff";
const teal = tokens.colorPaletteTealBorderActive;
const durazno = tokens.colorPaletteMarigoldBorderActive;
const berry = tokens.colorPaletteBerryBorderActive;
const lavanda = tokens.colorPaletteLavenderBorderActive;
const suelo = `color-mix(in srgb, ${tokens.colorNeutralForeground1} 8%, transparent)`;
const brillo = "rgba(255,255,255,0.35)";
const sombra = "rgba(0,0,0,0.16)";

function Lienzo({ titulo, children, className }) {
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label={titulo} className={className} style={{ width: "100%", height: "auto" }}>
      <ellipse cx="240" cy="246" rx="170" ry="18" fill={suelo} />
      {children}
    </svg>
  );
}

/** Rack de servidores con luces: velocidad e infraestructura. */
export function IlustracionServidores(props) {
  return (
    <Lienzo titulo="Servidores de alto rendimiento" {...props}>
      <rect x="150" y="56" width="180" height="190" rx="14" fill={marca} />
      <rect x="150" y="56" width="180" height="22" rx="11" fill={brillo} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(166 ${86 + i * 38})`}>
          <rect width="148" height="28" rx="6" fill={papel} />
          <rect x="12" y="11" width="64" height="6" rx="3" fill={marcaMedia} />
          <circle cx="118" cy="14" r="5" fill={i === 1 ? durazno : teal} />
          <circle cx="134" cy="14" r="5" fill={marcaClara} />
        </g>
      ))}
      <rect x="318" y="56" width="12" height="190" rx="6" fill={sombra} />
      <g stroke={teal} strokeWidth="8" strokeLinecap="round">
        <line x1="62" y1="110" x2="126" y2="110" />
        <line x1="84" y1="146" x2="126" y2="146" />
        <line x1="70" y1="182" x2="126" y2="182" />
      </g>
      <circle cx="372" cy="92" r="26" fill={lavanda} />
      <circle cx="364" cy="84" r="10" fill={brillo} />
    </Lienzo>
  );
}

/** Escudo con candado: seguridad y SSL. */
export function IlustracionSeguridad(props) {
  return (
    <Lienzo titulo="Seguridad y certificado SSL" {...props}>
      <path d="M240 50 L330 84 V146 C330 196 292 228 240 246 C188 228 150 196 150 146 V84 Z" fill={marca} />
      <path d="M240 50 L330 84 V146 C330 196 292 228 240 246 Z" fill={sombra} />
      <path d="M240 50 L272 62 L240 74 L176 98 L150 84 Z" fill={brillo} />
      <rect x="206" y="138" width="68" height="58" rx="10" fill={papel} />
      <path d="M220 138 V122 a20 20 0 0 1 40 0 V138" fill="none" stroke={papel} strokeWidth="10" />
      <circle cx="240" cy="162" r="8" fill={marca} />
      <rect x="236" y="164" width="8" height="18" rx="4" fill={marca} />
      <circle cx="116" cy="200" r="22" fill={teal} />
      <path d="M106 200 l7 8 l14 -16" stroke={papel} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="368" cy="96" r="14" fill={durazno} />
    </Lienzo>
  );
}

/** Burbujas de conversación: soporte las 24 horas. */
export function IlustracionSoporte(props) {
  return (
    <Lienzo titulo="Soporte las 24 horas" {...props}>
      <path d="M104 76 h170 a18 18 0 0 1 18 18 v74 a18 18 0 0 1 -18 18 h-118 l-34 28 v-28 h-18 a18 18 0 0 1 -18 -18 v-74 a18 18 0 0 1 18 -18 Z" fill={marca} />
      <path d="M104 76 h170 a18 18 0 0 1 18 18 v10 h-206 v-10 a18 18 0 0 1 18 -18 Z" fill={brillo} />
      <rect x="114" y="122" width="140" height="10" rx="5" fill={papel} />
      <rect x="114" y="144" width="96" height="10" rx="5" fill={papel} opacity="0.8" />
      <path d="M232 132 h134 a16 16 0 0 1 16 16 v56 a16 16 0 0 1 -16 16 h-12 v24 l-30 -24 h-92 a16 16 0 0 1 -16 -16 v-56 a16 16 0 0 1 16 -16 Z" fill={papel} stroke={marcaMedia} strokeWidth="2" />
      <circle cx="270" cy="176" r="8" fill={teal} />
      <circle cx="298" cy="176" r="8" fill={durazno} />
      <circle cx="326" cy="176" r="8" fill={berry} />
      <circle cx="386" cy="84" r="30" fill={lavanda} />
      <path d="M386 66 v18 l12 8" stroke={papel} strokeWidth="6" fill="none" strokeLinecap="round" />
    </Lienzo>
  );
}

/** Ventana de navegador con bloques: tu sitio en línea. */
export function IlustracionSitio(props) {
  return (
    <Lienzo titulo="Tu sitio web en línea" {...props}>
      <rect x="96" y="58" width="288" height="188" rx="14" fill={papel} stroke={marcaMedia} strokeWidth="2" />
      <path d="M96 72 a14 14 0 0 1 14 -14 h260 a14 14 0 0 1 14 14 v16 h-288 Z" fill={marca} />
      <circle cx="116" cy="73" r="5" fill={papel} />
      <circle cx="132" cy="73" r="5" fill={papel} opacity="0.7" />
      <circle cx="148" cy="73" r="5" fill={papel} opacity="0.5" />
      <rect x="116" y="104" width="120" height="78" rx="8" fill={teal} />
      <rect x="116" y="104" width="120" height="20" rx="8" fill={brillo} />
      <rect x="252" y="104" width="112" height="12" rx="6" fill={marcaClara} />
      <rect x="252" y="126" width="88" height="12" rx="6" fill={marcaClara} />
      <rect x="252" y="160" width="72" height="22" rx="6" fill={marca} />
      <rect x="116" y="198" width="248" height="30" rx="8" fill={marcaClara} />
      <circle cx="392" cy="222" r="24" fill={durazno} />
      <circle cx="86" cy="96" r="16" fill={berry} />
    </Lienzo>
  );
}

/** Lupa sobre un documento: sin resultados / página no encontrada. */
export function IlustracionBusqueda(props) {
  return (
    <Lienzo titulo="Búsqueda sin resultados" {...props}>
      <rect x="150" y="60" width="150" height="186" rx="12" fill={papel} stroke={marcaMedia} strokeWidth="2" />
      <rect x="172" y="88" width="106" height="10" rx="5" fill={marcaClara} />
      <rect x="172" y="110" width="80" height="10" rx="5" fill={marcaClara} />
      <rect x="172" y="132" width="96" height="10" rx="5" fill={marcaClara} />
      <circle cx="286" cy="170" r="48" fill={marca} opacity="0.9" />
      <circle cx="286" cy="170" r="32" fill={papel} />
      <circle cx="274" cy="158" r="10" fill={brillo} />
      <rect x="318" y="204" width="20" height="58" rx="10" fill={marca} transform="rotate(-45 328 233)" />
      <circle cx="122" cy="214" r="18" fill={teal} />
    </Lienzo>
  );
}
