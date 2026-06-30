import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await login(email, senha);
    } catch {
      setErro("Email ou senha inválidos");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <img src="/icon.svg" alt="" style={s.logo} />
        <h1 style={s.titulo}>GestorFlow</h1>
        <p style={s.subtitulo}>Sistema de Gestão</p>

        <div style={s.form}>
          <div style={s.campo}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={s.input}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <p style={s.erro}>
              <i
                className="ti ti-alert-circle"
                style={{
                  fontSize: "14px",
                  verticalAlign: "-1px",
                  marginRight: "5px",
                }}
                aria-hidden="true"
              />
              {erro}
            </p>
          )}

          <button
            onClick={handleLogin}
            style={
              carregando ? { ...s.botao, ...s.botaoDesabilitado } : s.botao
            }
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <p style={s.demoHint}>
          Demo: <span style={s.demoCode}>demo@gestorflow.com</span> /{" "}
          <span style={s.demoCode}>demo123</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--color-background-tertiary)",
  },
  card: {
    backgroundColor: "var(--color-background-primary)",
    padding: "40px",
    borderRadius: "var(--border-radius-xl)",
    border: "0.5px solid var(--color-border-tertiary)",
    width: "100%",
    maxWidth: "380px",
    textAlign: "center",
  },
  logo: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    marginBottom: "16px",
  },
  titulo: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 4px",
  },
  subtitulo: {
    textAlign: "center",
    color: "var(--color-text-secondary)",
    marginBottom: "28px",
    fontSize: "13px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    textAlign: "left",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-primary)",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  botao: {
    padding: "10px",
    backgroundColor: "var(--color-text-info)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "6px",
    fontFamily: "inherit",
  },
  botaoDesabilitado: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  erro: {
    color: "var(--color-danger-text, #a32d2d)",
    backgroundColor: "var(--color-danger-bg, #fcebeb)",
    fontSize: "13px",
    textAlign: "center",
    padding: "8px 12px",
    borderRadius: "var(--border-radius-md)",
    margin: 0,
  },
  demoHint: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "12px",
    color: "var(--color-text-muted)",
  },
  demoCode: {
    fontFamily: "monospace",
    color: "var(--color-text-secondary)",
  },
};
