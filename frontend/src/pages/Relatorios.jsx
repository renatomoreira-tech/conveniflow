import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Relatorios() {
  const navigate = useNavigate();
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function buscarRelatorio() {
    if (!inicio || !fim) {
      setErro("Selecione o período completo");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      const res = await api.get(`/sales/relatorio?inicio=${inicio}&fim=${fim}`);
      setDados(res.data);
    } catch (error) {
      setErro("Erro ao buscar relatório");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* ─── HEADER ─── */}
      <div style={styles.header}>
        <div style={styles.headerEsquerda}>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.botaoVoltar}
          >
            ← Voltar
          </button>
          <h2 style={styles.titulo}>📊 Relatórios de Vendas</h2>
        </div>
      </div>

      {/* ─── FILTROS ─── */}
      <div style={styles.filtroCard}>
        <h3 style={styles.filtroTitulo}>Selecione o período</h3>
        <div style={styles.filtroGrid}>
          <div style={styles.campo}>
            <label style={styles.label}>Data inicial</label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Data final</label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.campoBotao}>
            <button
              onClick={buscarRelatorio}
              style={styles.botaoBuscar}
              disabled={carregando}
            >
              {carregando ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>
        {erro && <p style={styles.erro}>{erro}</p>}
      </div>

      {/* ─── RESULTADOS ─── */}
      {dados && (
        <>
          {/* ─── CARDS DE RESUMO ─── */}
          <div style={styles.resumoGrid}>
            <div style={styles.resumoCard}>
              <p style={styles.resumoLabel}>Total de Vendas</p>
              <p style={styles.resumoValor}>{dados.quantidade}</p>
            </div>
            <div style={styles.resumoCard}>
              <p style={styles.resumoLabel}>Faturamento Total</p>
              <p style={styles.resumoValorDestaque}>
                R$ {dados.totalPeriodo.toFixed(2)}
              </p>
            </div>
            <div style={styles.resumoCard}>
              <p style={styles.resumoLabel}>Ticket Médio</p>
              <p style={styles.resumoValor}>
                R${" "}
                {dados.quantidade > 0
                  ? (dados.totalPeriodo / dados.quantidade).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>

          {/* ─── TABELA DE VENDAS ─── */}
          {dados.sales.length === 0 ? (
            <div style={styles.vazio}>
              <p>Nenhuma venda encontrada no período selecionado.</p>
            </div>
          ) : (
            <div style={styles.tabelaContainer}>
              <h3 style={styles.tabelaTitulo}>Detalhamento das Vendas</h3>
              <table style={styles.tabela}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Operador</th>
                    <th style={styles.th}>Itens</th>
                    <th style={styles.th}>Pagamento</th>
                    <th style={styles.th}>Desconto</th>
                    <th style={styles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.sales.map((venda) => (
                    <tr key={venda.id} style={styles.tr}>
                      <td style={styles.td}>#{venda.id}</td>
                      <td style={styles.td}>
                        {new Date(venda.data_venda).toLocaleDateString("pt-BR")}{" "}
                        {new Date(venda.data_venda).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td style={styles.td}>{venda.user?.nome || "—"}</td>
                      <td style={styles.td}>
                        {venda.itens.map((item) => (
                          <div key={item.id} style={styles.item}>
                            {item.product?.nome} x{item.quantidade}
                          </div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.pagamento}>
                          {venda.formaPagamento.replace("_", " ")}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {venda.desconto > 0
                          ? `R$ ${venda.desconto.toFixed(2)}`
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        <strong>R$ {venda.valor_total.toFixed(2)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
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
  filtroCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  filtroTitulo: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  filtroGrid: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  campo: { display: "flex", flexDirection: "column", gap: "6px" },
  campoBotao: { display: "flex", alignItems: "flex-end" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  botaoBuscar: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  erro: { color: "#e53e3e", fontSize: "14px", marginTop: "12px" },
  resumoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  resumoCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  resumoLabel: { fontSize: "13px", color: "#888", margin: "0 0 8px" },
  resumoValor: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: 0,
  },
  resumoValorDestaque: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#4f46e5",
    margin: 0,
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
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#333",
    verticalAlign: "top",
  },
  item: { fontSize: "13px", color: "#555", marginBottom: "2px" },
  pagamento: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  vazio: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    color: "#888",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
};
