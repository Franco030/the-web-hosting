import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Field,
  Input,
  Link,
  makeStyles,
  MessageBar,
  Spinner,
  Title3,
  tokens,
} from "@fluentui/react-components";
import { useAuth } from "../../context/AuthContext";
import { useTituloPagina } from "../../hooks/useTituloPagina";
import { BrandMark } from "../../components/shell/BrandMark";
import { IlustracionServidores } from "../../components/illustrations/Ilustraciones";
import { pageFade } from "../../theme/motion";

const useStyles = makeStyles({
  // Patrón de cuenta Microsoft: fondo con velo de marca y tarjeta centrada de 440 px.
  root: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingHorizontalL,
    backgroundImage: `radial-gradient(circle at 20% 10%, color-mix(in srgb, ${tokens.colorBrandBackground} 22%, transparent), transparent 55%), radial-gradient(circle at 85% 90%, color-mix(in srgb, ${tokens.colorPaletteTealBorderActive} 18%, transparent), transparent 50%)`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  tarjeta: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "440px",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    padding: "44px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow16,
    ...pageFade,
    "@media (max-width: 479px)": { padding: tokens.spacingHorizontalXL },
  },
  ilustracion: { maxWidth: "200px", alignSelf: "center" },
  texto: { color: tokens.colorNeutralForeground2 },
  acciones: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM, alignItems: "flex-start" },
});

/** Acceso de administradores (parte privada del sitio). */
export default function Acceso() {
  const styles = useStyles();
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useTituloPagina("Acceso de administradores");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    if (!correo.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await login(correo, password);
      navigate(location.state?.desde || "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <main className={styles.root}>
      <form className={styles.tarjeta} onSubmit={enviar} noValidate>
        <BrandMark />
        <div className={styles.ilustracion} aria-hidden="true">
          <IlustracionServidores />
        </div>
        <Title3 as="h1">Iniciar sesión</Title3>
        <Body1 className={styles.texto}>Área privada para administrar planes, contrataciones y sugerencias.</Body1>
        {error && <MessageBar intent="error">{error}</MessageBar>}
        <Field label="Correo electrónico" required>
          <Input type="email" value={correo} onChange={(_, d) => setCorreo(d.value)} autoComplete="username" />
        </Field>
        <Field label="Contraseña" required>
          <Input type="password" value={password} onChange={(_, d) => setPassword(d.value)} autoComplete="current-password" />
        </Field>
        <div className={styles.acciones}>
          <Button type="submit" appearance="primary" disabled={enviando} icon={enviando ? <Spinner size="tiny" /> : undefined}>
            {enviando ? "Iniciando sesión" : "Iniciar sesión"}
          </Button>
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            Volver al sitio público
          </Link>
        </div>
      </form>
    </main>
  );
}
