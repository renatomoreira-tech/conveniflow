import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Caixa() {
  const navigate = useNavigate();
  const [caixas, setCaixas] = useState([]);
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [valorInicial, setValorInicial] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [caixasRes, atualRes] = await Promise.all([
        api.get("/caixa"),
        api.get("/caixa/atual").catch(() => ({ data: null })),
      ]);
      setCaixas(caixasRes.data);
      setCaixaAtual(atualRes.data);
    } catch (error) {
      setErro("Erro ao carregar dados");
    } finally {
      setCarregando(false);
    }
  }

  async function handleAbrirCaixa() {
    if (!valorInicial) {
      setErro("Informe o valor inicial");
      return;
    }
    setErro("");
    try {
      await api.post("/caixa/abrir", {
        valorInicial: parseFloat(valorInicial),
      });
      setValorInicial("");
      carregarDados();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao abrir caixa");
    }
  }

  async function handleFecharCaixa() {
    if (!valorFinal) {
      setErro("Informe o valor final");
      return;
    }
    setErro("");
    try {
      await api.patch(`/caixa/${caixaAtual.id}/fechar`, {
        valorFinal: parseFloat(valorFinal),
      });
      setValorFinal("");
      carregarDados();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao fechar caixa");
    }
  }

  if (carregando) return <p style={styles.carregando}>Carregando...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerEsquerda}>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.botaoVoltar}
          >
            ← Voltar
          </button>
          <h2 style={styles.titulo}>📦 Controle de Caixa</h2>
        </div>
      </div>

      {/* ─── CAIXA ATUAL ─── */}
      <div style={styles.caixaCard}>
        {caixaAtual ? (
          <>
            <div style={styles.caixaStatus}>
              <span style={styles.statusAberto}>CAIXA ABERTO</span>
              <span style={styles.caixaInfo}>
                Aberto em{" "}
                {new Date(caixaAtual.abertura).toLocaleDateString("pt-BR")} às{" "}
                {new Date(caixaAtual.abertura).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p style={styles.valorInicialTexto}>
              Valor inicial:{" "}
              <strong>R$ {caixaAtual.valorInicial.toFixed(2)}</strong>
            </p>
            <div style={styles.fecharBox}>
              <input
                type="number"
                placeholder="Valor final em caixa"
                value={valorFinal}
                onChange={(e) => setValorFinal(e.target.value)}
                style={styles.inputFechar}
              />
              <button onClick={handleFecharCaixa} style={styles.botaoFechar}>
                Fechar Caixa
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.caixaStatus}>
              <span style={styles.statusFechado}>CAIXA FECHADO</span>
            </div>
            <div style={styles.abrirBox}>
              <input
                type="number"
                placeholder="Valor inicial em caixa"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                style={styles.inputAbrir}
              />
              <button onClick={handleAbrirCaixa} style={styles.botaoAbrir}>
                Abrir Caixa
              </button>
            </div>
          </>
        )}
        {erro && <p style={styles.erro}>{erro}</p>}
      </div>

      {/* ─── HISTÓRICO ─── */}
      <div style={styles.tabelaContainer}>
        <h3 style={styles.tabelaTitulo}>Histórico de Caixas</h3>
        <table style={styles.tabela}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Abertura</th>
              <th style={styles.th}>Fechamento</th>
              <th style={styles.th}>Valor Inicial</th>
              <th style={styles.th}>Valor Final</th>
              <th style={styles.th}>Diferença</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {caixas.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.vazio}>
                  Nenhum registro de caixa
                </td>
              </tr>
            ) : (
              caixas.map((c) => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>
                    {new Date(c.abertura).toLocaleDateString("pt-BR")}{" "}
                    {new Date(c.abertura).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={styles.td}>
                    {c.fechamento
                      ? `${new Date(c.fechamento).toLocaleDateString("pt-BR")} ${new Date(c.fechamento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                      : "—"}
                  </td>
                  <td style={styles.td}>R$ {c.valorInicial.toFixed(2)}</td>
                  <td style={styles.td}>
                    {c.valorFinal ? `R$ ${c.valorFinal.toFixed(2)}` : "—"}
                  </td>
                  <td style={styles.td}>
                    {c.valorFinal ? (
                      <span
                        style={
                          c.valorFinal - c.valorInicial >= 0
                            ? styles.positivo
                            : styles.negativo
                        }
                      >
                        R$ {(c.valorFinal - c.valorInicial).toFixed(2)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        c.status === "ABERTO"
                          ? styles.statusAberto
                          : styles.statusFechado
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  headerEsquerda: { display: "flex", alignItems: "center", gap: "16px" },
  botaoVoltar: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  titulo: { fontSize: "22px", fontWeight: "bold", color: "#1a1a2e", margin: 0 },
  caixaCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  caixaStatus: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  caixaInfo: { fontSize: "14px", color: "#888" },
  valorInicialTexto: { fontSize: "16px", color: "#333", marginBottom: "16px" },
  statusAberto: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusFechado: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  abrirBox: { display: "flex", gap: "12px", alignItems: "center" },
  fecharBox: { display: "flex", gap: "12px", alignItems: "center" },
  inputAbrir: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "220px",
  },
  inputFechar: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "220px",
  },
  botaoAbrir: {
    backgroundColor: "#065f46",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    cursor: "pointer",
    fontWeight: "600",
  },
  botaoFechar: {
    backgroundColor: "#991b1b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tabelaContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  tabelaTitulo: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  tabela: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f8f9fa" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
  },
  tr: { borderTop: "1px solid #f0f0f0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#333" },
  positivo: { color: "#065f46", fontWeight: "600" },
  negativo: { color: "#991b1b", fontWeight: "600" },
  vazio: { padding: "40px", textAlign: "center", color: "#888" },
  erro: { color: "#e53e3e", fontSize: "14px", marginTop: "12px" },
  carregando: { textAlign: "center", marginTop: "40px", color: "#888" },
};
