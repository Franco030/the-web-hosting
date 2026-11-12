import { makeStyles, mergeClasses, Text, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
  },
  mark: { flexShrink: 0, display: "block" },
  wordmark: {
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
  accent: { color: tokens.colorBrandForeground1 },
});

/** Logotipo: tres servidores apilados en la rampa de marca. */
export function LogoMark({ size = 24, className }) {
  const styles = useStyles();
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={mergeClasses(styles.mark, className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill={tokens.colorBrandBackground} />
      <rect x="7" y="7" width="18" height="5" rx="1.5" fill="#dae5fe" />
      <rect x="7" y="13.5" width="18" height="5" rx="1.5" fill="#acc2f6" />
      <rect x="7" y="20" width="18" height="5" rx="1.5" fill="#ffffff" />
      <circle cx="21.5" cy="9.5" r="1.2" fill="#456ad1" />
      <circle cx="21.5" cy="16" r="1.2" fill="#456ad1" />
      <circle cx="21.5" cy="22.5" r="1.2" fill="#456ad1" />
    </svg>
  );
}

export function BrandMark({ size = "small", className }) {
  const styles = useStyles();
  const grande = size === "large";
  return (
    <span className={mergeClasses(styles.root, className)}>
      <LogoMark size={grande ? 36 : 24} />
      <Text size={grande ? 600 : 400} className={styles.wordmark}>
        The Web <span className={styles.accent}>Hosting</span>
      </Text>
    </span>
  );
}

export default BrandMark;
