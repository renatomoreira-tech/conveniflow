import { useState, useEffect } from "react";
import api from "../services/api";
import { Wallet } from "lucide-react";

export default function Caixa() {
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

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.titulo}>
          <Wallet size={20} style={s.tituloIcon} aria-hidden="true" />
          Controle de Caixa
        </h2>
      </div>

      {/* ─── CAIXA ATUAL ─── */}
      <div style={s.caixaCard}>
        {caixaAtual ? (
          <>
            <div style={s.caixaStatus}>
              <span style={s.statusAberto}>CAIXA ABERTO</span>
              <span style={s.caixaInfo}>
                Aberto em{" "}
                {new Date(caixaAtual.abertura).toLocaleDateString("pt-BR")} às{" "}
                {new Date(caixaAtual.abertura).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p style={s.valorInicialTexto}>
              Valor inicial:{" "}
              <strong>R$ {caixaAtual.valorInicial.toFixed(2)}</strong>
            </p>
            <div style={s.fecharBox}>
              <input
                type="number"
                placeholder="Valor final em caixa"
                value={valorFinal}
                onChange={(e) => setValorFinal(e.target.value)}
                style={s.inputFechar}
              />
              <button onClick={handleFecharCaixa} style={s.botaoFechar}>
                Fechar Caixa
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={s.caixaStatus}>
              <span style={s.statusFechado}>CAIXA FECHADO</span>
            </div>
            <div style={s.abrirBox}>
              <input
                type="number"
                placeholder="Valor inicial em caixa"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                style={s.inputAbrir}
              />
              <button onClick={handleAbrirCaixa} style={s.botaoAbrir}>
                Abrir Caixa
              </button>
            </div>
          </>
        )}
        {erro && <p style={s.erro}>{erro}</p>}
      </div>

      {/* ─── HISTÓRICO ─── */}
      <div style={s.tabelaContainer}>
        <h3 style={s.tabelaTitulo}>Histórico de Caixas</h3>
        <table style={s.tabela}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Abertura</th>
              <th style={s.th}>Fechamento</th>
              <th style={s.th}>Valor Inicial</th>
              <th style={s.th}>Valor Final</th>
              <th style={s.th}>Diferença</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {caixas.length === 0 ? (
              <tr>
                <td colSpan="6" style={s.vazio}>
                  Nenhum registro de caixa
                </td>
              </tr>
            ) : (
              caixas.map((c) => (
                <tr key={c.id} style={s.tr}>
                  <td style={s.td}>
                    {new Date(c.abertura).toLocaleDateString("pt-BR")}{" "}
                    {new Date(c.abertura).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={s.td}>
                    {c.fechamento
                      ? `${new Date(c.fechamento).toLocaleDateString("pt-BR")} ${new Date(c.fechamento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                      : "—"}
                  </td>
                  <td style={s.td}>R$ {c.valorInicial.toFixed(2)}</td>
                  <td style={s.td}>
                    {c.valorFinal ? `R$ ${c.valorFinal.toFixed(2)}` : "—"}
                  </td>
                  <td style={s.td}>
                    {c.valorFinal ? (
                      <span
                        style={
                          c.valorFinal - c.valorInicial >= 0
                            ? s.positivo
                            : s.negativo
                        }
                      >
                        R$ {(c.valorFinal - c.valorInicial).toFixed(2)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={s.td}>
                    <span
                      style={
                        c.status === "ABERTO" ? s.statusAberto : s.statusFechado
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

const s = {
  container: { padding: "0" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  titulo: {
    fontSize: "18px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tituloIcon: { color: "var(--color-text-secondary)" },
  caixaCard: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "28px",
    marginBottom: "20px",
  },
  caixaStatus: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },
  caixaInfo: { fontSize: "13px", color: "var(--color-text-secondary)" },
  valorInicialTexto: {
    fontSize: "14px",
    color: "var(--color-text-primary)",
    marginBottom: "16px",
  },
  statusAberto: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusFechado: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  abrirBox: { display: "flex", gap: "10px", alignItems: "center" },
  fecharBox: { display: "flex", gap: "10px", alignItems: "center" },
  inputAbrir: {
    padding: "9px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-primary)",
    fontSize: "13px",
    width: "220px",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  inputFechar: {
    padding: "9px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-primary)",
    fontSize: "13px",
    width: "220px",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  botaoAbrir: {
    backgroundColor: "var(--color-success)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 20px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  botaoFechar: {
    backgroundColor: "var(--color-danger-text)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 20px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  tabelaContainer: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "20px",
  },
  tabelaTitulo: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    marginBottom: "14px",
  },
  tabela: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "var(--color-background-secondary)" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--color-text-secondary)",
  },
  tr: { borderTop: "0.5px solid var(--color-border-tertiary)" },
  td: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "var(--color-text-primary)",
  },
  positivo: { color: "var(--color-success)", fontWeight: "500" },
  negativo: { color: "var(--color-danger-text)", fontWeight: "500" },
  vazio: {
    padding: "40px",
    textAlign: "center",
    color: "var(--color-text-secondary)",
  },
  erro: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
    marginTop: "12px",
  },
  carregando: {
    textAlign: "center",
    marginTop: "40px",
    color: "var(--color-text-secondary)",
  },
};
