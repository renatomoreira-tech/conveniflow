import { useState } from "react";
import api from "../services/api";
import { BarChart3 } from "lucide-react";

export default function Relatorios() {
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
    <div style={s.container}>
      {/* ─── HEADER ─── */}
      <div style={s.header}>
        <h2 style={s.titulo}>
          <BarChart3 size={20} style={s.tituloIcon} aria-hidden="true" />
          Relatórios de Vendas
        </h2>
      </div>

      {/* ─── FILTROS ─── */}
      <div style={s.filtroCard}>
        <h3 style={s.filtroTitulo}>Selecione o período</h3>
        <div style={s.filtroGrid}>
          <div style={s.campo}>
            <label style={s.label}>Data inicial</label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              style={s.input}
            />
          </div>
          <div style={s.campo}>
            <label style={s.label}>Data final</label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              style={s.input}
            />
          </div>
          <div style={s.campoBotao}>
            <button
              onClick={buscarRelatorio}
              style={s.botaoBuscar}
              disabled={carregando}
            >
              {carregando ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>
        {erro && <p style={s.erro}>{erro}</p>}
      </div>

      {/* ─── RESULTADOS ─── */}
      {dados && (
        <>
          <div style={s.resumoGrid}>
            <div style={s.resumoCard}>
              <p style={s.resumoLabel}>Total de Vendas</p>
              <p style={s.resumoValor}>{dados.quantidade}</p>
            </div>
            <div style={s.resumoCard}>
              <p style={s.resumoLabel}>Faturamento Total</p>
              <p style={s.resumoValorDestaque}>
                R$ {dados.totalPeriodo.toFixed(2)}
              </p>
            </div>
            <div style={s.resumoCard}>
              <p style={s.resumoLabel}>Ticket Médio</p>
              <p style={s.resumoValor}>
                R${" "}
                {dados.quantidade > 0
                  ? (dados.totalPeriodo / dados.quantidade).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>

          {dados.sales.length === 0 ? (
            <div style={s.vazio}>
              <p>Nenhuma venda encontrada no período selecionado.</p>
            </div>
          ) : (
            <div style={s.tabelaContainer}>
              <h3 style={s.tabelaTitulo}>Detalhamento das Vendas</h3>
              <table style={s.tabela}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Data</th>
                    <th style={s.th}>Operador</th>
                    <th style={s.th}>Itens</th>
                    <th style={s.th}>Pagamento</th>
                    <th style={s.th}>Desconto</th>
                    <th style={s.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.sales.map((venda) => (
                    <tr key={venda.id} style={s.tr}>
                      <td style={s.td}>#{venda.id}</td>
                      <td style={s.td}>
                        {new Date(venda.data_venda).toLocaleDateString("pt-BR")}{" "}
                        {new Date(venda.data_venda).toLocaleTimeString(
                          "pt-BR",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </td>
                      <td style={s.td}>{venda.user?.nome || "—"}</td>
                      <td style={s.td}>
                        {venda.itens.map((item) => (
                          <div key={item.id} style={s.item}>
                            {item.product?.nome} x{item.quantidade}
                          </div>
                        ))}
                      </td>
                      <td style={s.td}>
                        <span style={s.pagamento}>
                          {venda.formaPagamento.replace("_", " ")}
                        </span>
                      </td>
                      <td style={s.td}>
                        {venda.desconto > 0
                          ? `R$ ${venda.desconto.toFixed(2)}`
                          : "—"}
                      </td>
                      <td style={s.td}>
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
  filtroCard: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "20px",
    marginBottom: "20px",
  },
  filtroTitulo: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    marginBottom: "14px",
  },
  filtroGrid: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  campo: { display: "flex", flexDirection: "column", gap: "6px" },
  campoBotao: { display: "flex", alignItems: "flex-end" },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--color-text-secondary)",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-primary)",
    fontSize: "13px",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  botaoBuscar: {
    backgroundColor: "var(--color-text-info)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 22px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  erro: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
    marginTop: "12px",
  },
  resumoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  resumoCard: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "20px",
    textAlign: "center",
  },
  resumoLabel: {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    margin: "0 0 8px",
  },
  resumoValor: {
    fontSize: "24px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: 0,
  },
  resumoValorDestaque: {
    fontSize: "24px",
    fontWeight: "500",
    color: "var(--color-text-info)",
    margin: 0,
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
    verticalAlign: "top",
  },
  item: {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    marginBottom: "2px",
  },
  pagamento: {
    backgroundColor: "var(--color-badge-blue-bg)",
    color: "var(--color-badge-blue-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  vazio: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "40px",
    textAlign: "center",
    color: "var(--color-text-secondary)",
  },
};
