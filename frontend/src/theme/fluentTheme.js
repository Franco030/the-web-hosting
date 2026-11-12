import { createDarkTheme, createLightTheme } from "@fluentui/react-components";

/*
 * Rampa de marca (la misma de TutoriasU) generada en OKLCH a partir de
 * #456ad1 (tono 80). 80 es el fondo de marca en claro (blanco encima: 4.96:1).
 * En oscuro el texto de marca usa 110/120 (≥ 5.6:1 sobre #292929).
 */
export const brandHosting = {
  10: "#050d28",
  20: "#0c183d",
  30: "#142553",
  40: "#1d326b",
  50: "#273f83",
  60: "#304d9c",
  70: "#3b5bb6",
  80: "#456ad1",
  90: "#587cd9",
  100: "#6d8ee1",
  110: "#81a0e8",
  120: "#96b1ef",
  130: "#acc2f6",
  140: "#c2d4fc",
  150: "#dae5fe",
  160: "#f3f7fe",
};

const fontFamilyBase =
  "'Segoe UI Variable Text', 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif";

export const lightTheme = {
  ...createLightTheme(brandHosting),
  fontFamilyBase,
};

export const darkTheme = {
  ...createDarkTheme(brandHosting),
  fontFamilyBase,
  colorBrandForeground1: brandHosting[110],
  colorBrandForeground2: brandHosting[120],
  colorBrandForegroundLink: brandHosting[110],
  colorBrandForegroundLinkHover: brandHosting[120],
  colorBrandForegroundLinkPressed: brandHosting[100],
  colorBrandForegroundLinkSelected: brandHosting[110],
  colorCompoundBrandForeground1: brandHosting[110],
  colorCompoundBrandForeground1Hover: brandHosting[120],
  colorCompoundBrandForeground1Pressed: brandHosting[100],
  colorCompoundBrandStroke: brandHosting[110],
  colorCompoundBrandStrokeHover: brandHosting[120],
  colorCompoundBrandStrokePressed: brandHosting[100],
  colorNeutralForeground2BrandHover: brandHosting[110],
  colorNeutralForeground2BrandPressed: brandHosting[100],
  colorNeutralForeground2BrandSelected: brandHosting[110],
  colorNeutralForeground3BrandHover: brandHosting[110],
  colorNeutralForeground3BrandPressed: brandHosting[100],
  colorNeutralForeground3BrandSelected: brandHosting[110],
};
