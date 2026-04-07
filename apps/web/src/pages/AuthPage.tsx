import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("Synapse Pilot");
  const [email, setEmail] = useState("pilot@synapsestudios.app");
  const [password, setPassword] = useState("studio123");
  const [status, setStatus] = useState(
    "Accede para vincular guiones, vault y progreso a una sesión."
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async () => {
    try {
      if (mode === "login") {
        await login({ email, password });
        return;
      }

      await register({ name, email, password });
    } catch (_error) {
      setStatus(
        mode === "login"
          ? "No pudimos iniciar sesión con esas credenciales."
          : "No pudimos crear la cuenta con esos datos."
      );
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Synapse Access</p>
        <h1 className="topbar-title">Entra a tu workspace educativo</h1>
        <p className="lede">{status}</p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "nav-pill nav-pill--active" : "nav-pill"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "nav-pill nav-pill--active" : "nav-pill"}
            onClick={() => setMode("register")}
          >
            Registro
          </button>
        </div>

        {mode === "register" ? (
          <label className="editor-field">
            <span>Nombre</span>
            <input
              className="script-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="editor-field">
          <span>Email</span>
          <input
            className="script-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="editor-field">
          <span>Password</span>
          <input
            className="script-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="button" className="primary-button auth-submit" onClick={submit}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </section>
    </main>
  );
}
