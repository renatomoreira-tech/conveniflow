import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { usuario } = useAuth();
  const role = usuario?.role;
  const navigate = useNavigate();

  const [vendasHoje, setVendasHoje] = useState([]);
  const [totalHoje, setTotalHoje] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const amanha = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

      const [vendasRes, produtosRes, caixaRes] = await Promise.all([
        api.get(`/sales/relatorio?inicio=${hoje}&fim=${amanha}`).catch(() => ({
          data: { sales: [], totalPeriodo: 0, quantidade: 0 },
        })),
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/caixa/atual").catch(() => ({ data: null })),
      ]);

      setVendasHoje(vendasRes.data.sales || []);
      setTotalHoje(vendasRes.data.totalPeriodo || 0);

      const baixo = produtosRes.data.filter(
        (p) => p.estoque <= p.estoqueMinimo,
      ).length;
      setEstoqueBaixo(baixo);

      setCaixaAtual(caixaRes.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setCarregando(false);
    }
  }

  const ticketMedio = vendasHoje.length > 0 ? totalHoje / vendasHoje.length : 0;

  if (carregando) return <p style={styles.carregando}>Carregando...</p>;

  return (
    <div>
      {/* ─── HEADER ─── */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.saudacao}>Bom dia, {usuario?.nome} 👋</h2>
          <p style={styles.subtitulo}>Aqui está o resumo do seu negócio</p>
        </div>
        <span style={styles.data}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* ─── MÉTRICAS ─── */}
      <div style={styles.metricasGrid}>
        <div style={styles.metricaCard}>
          <div style={styles.metricaIconBox}>
            <span style={styles.metricaIcon}>💰</span>
          </div>
          <p style={styles.metricaLabel}>Vendas hoje</p>
          <p style={styles.metricaValor}>R$ {totalHoje.toFixed(2)}</p>
        </div>
        <div style={styles.metricaCard}>
          <div style={{ ...styles.metricaIconBox, backgroundColor: "#e1f5ee" }}>
            <span style={styles.metricaIcon}>🛒</span>
          </div>
          <p style={styles.metricaLabel}>Pedidos</p>
          <p style={styles.metricaValor}>{vendasHoje.length}</p>
        </div>
        <div style={styles.metricaCard}>
          <div style={{ ...styles.metricaIconBox, backgroundColor: "#eeedfe" }}>
            <span style={styles.metricaIcon}>🎯</span>
          </div>
          <p style={styles.metricaLabel}>Ticket médio</p>
          <p style={styles.metricaValor}>R$ {ticketMedio.toFixed(2)}</p>
        </div>
        <div style={styles.metricaCard}>
          <div
            style={{
              ...styles.metricaIconBox,
              backgroundColor: estoqueBaixo > 0 ? "#fee2e2" : "#d1fae5",
            }}
          >
            <span style={styles.metricaIcon}>
              {estoqueBaixo > 0 ? "⚠️" : "✅"}
            </span>
          </div>
          <p style={styles.metricaLabel}>Estoque baixo</p>
          <p
            style={{
              ...styles.metricaValor,
              color: estoqueBaixo > 0 ? "#991b1b" : "#065f46",
            }}
          >
            {estoqueBaixo}
          </p>
        </div>
      </div>

      {/* ─── CONTEÚDO INFERIOR ─── */}
      <div style={styles.bottomGrid}>
        {/* ─── ÚLTIMAS VENDAS ─── */}
        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Últimas vendas</h3>
          {vendasHoje.length === 0 ? (
            <p style={styles.vazio}>Nenhuma venda hoje</p>
          ) : (
            vendasHoje.slice(0, 5).map((venda) => (
              <div key={venda.id} style={styles.vendaItem}>
                <div>
                  <p style={styles.vendaNome}>
                    {venda.itens
                      ?.map((i) => `${i.product?.nome} x${i.quantidade}`)
                      .join(", ")}
                  </p>
                  <p style={styles.vendaHora}>
                    {new Date(venda.data_venda).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {venda.user?.nome}
                  </p>
                </div>
                <div style={styles.vendaDireita}>
                  <p style={styles.vendaValor}>
                    R$ {venda.valor_total.toFixed(2)}
                  </p>
                  <span style={styles.vendaPagamento}>
                    {venda.formaPagamento.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── LADO DIREITO ─── */}
        <div style={styles.rightCol}>
          {/* ─── CAIXA ─── */}
          <div style={styles.card}>
            <h3 style={styles.cardTitulo}>Caixa</h3>
            {caixaAtual ? (
              <>
                <div style={styles.caixaStatus}>
                  <div style={styles.caixaDot}></div>
                  <span style={styles.caixaTexto}>Aberto</span>
                </div>
                <p style={styles.caixaInfo}>
                  Abertura: R$ {caixaAtual.valorInicial.toFixed(2)}
                </p>
                <p style={styles.caixaInfo}>
                  Desde{" "}
                  {new Date(caixaAtual.abertura).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </>
            ) : (
              <div style={styles.caixaStatus}>
                <div
                  style={{ ...styles.caixaDot, backgroundColor: "#991b1b" }}
                ></div>
                <span style={styles.caixaTexto}>Fechado</span>
              </div>
            )}
          </div>

          {/* ─── AÇÕES RÁPIDAS ─── */}
          <div style={styles.card}>
            <h3 style={styles.cardTitulo}>Ações rápidas</h3>
            <button onClick={() => navigate("/vendas")} style={styles.acaoBtn}>
              ➕ Nova venda
            </button>
            {(role === "ADMIN" || role === "GERENTE") && (
              <button
                onClick={() => navigate("/produtos")}
                style={styles.acaoBtn}
              >
                📦 Novo produto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
