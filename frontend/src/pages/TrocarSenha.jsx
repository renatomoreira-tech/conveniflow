import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function TrocarSenha() {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 4) {
      setErro("A nova senha deve ter ao menos 4 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    setCarregando(true);
    try {
      await api.patch("/users/trocar-senha", { senhaAtual, novaSenha });
      navigate("/dashboard");
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao trocar senha");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <img src="/icon.svg" alt="" style={s.logo} />
        <h1 style={s.titulo}>Troque sua senha</h1>
        <p style={s.subtitulo}>
          Por segurança, defina uma nova senha antes de continuar.
        </p>

        <form onSubmit={handleSalvar} style={s.form}>
          <div style={s.campo}>
            <label style={s.label}>Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              style={s.input}
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              style={s.input}
              placeholder="Mínimo 4 caracteres"
              required
            />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              style={s.input}
              placeholder="Repita a nova senha"
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
            type="submit"
            style={
              carregando ? { ...s.botao, ...s.botaoDesabilitado } : s.botao
            }
            disabled={carregando}
          >
            {carregando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
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
    fontSize: "22px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 4px",
  },
  subtitulo: {
    textAlign: "center",
    color: "var(--color-text-secondary)",
    marginBottom: "28px",
    fontSize: "13px",
    lineHeight: "1.5",
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
};
