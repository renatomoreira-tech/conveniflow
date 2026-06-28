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
    } catch (error) {
      setErro("Email ou senha inválidos");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>GestorFlow</h1>
        <p style={styles.subtitulo}>Sistema de Gestão</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && <p style={styles.erro}>{erro}</p>}

          <button
            type="submit"
            style={carregando ? styles.botaoDesabilitado : styles.botao}
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  titulo: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  subtitulo: {
    textAlign: "center",
    color: "#888",
    marginBottom: "32px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },
  botao: {
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  botaoDesabilitado: {
    padding: "12px",
    backgroundColor: "#a5a3e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginTop: "8px",
  },
  erro: {
    color: "#e53e3e",
    fontSize: "14px",
    textAlign: "center",
  },
};
