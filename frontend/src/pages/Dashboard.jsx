import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  CircleCheck,
  Plus,
  Package,
} from "lucide-react";

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

  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (carregando) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "var(--color-text-secondary)",
          marginTop: "40px",
        }}
      >
        Carregando...
      </p>
    );
  }

  return (
    <div>
      {/* ─── HEADER ─── */}
      <div style={s.header}>
        <div>
          <h2 style={s.saudacao}>
            {saudacao()}, {usuario?.nome}
          </h2>
          <p style={s.subtitulo}>Aqui está o resumo do seu negócio</p>
        </div>
        <div />
      </div>

      {/* ─── MÉTRICAS ─── */}
      <div style={s.metricasGrid}>
        <MetricaCard
          iconBg="var(--color-badge-blue-bg)"
          iconColor="var(--color-badge-blue-text)"
          Icon={DollarSign}
          label="Vendas hoje"
          valor={`R$ ${totalHoje.toFixed(2)}`}
        />
        <MetricaCard
          iconBg="var(--color-badge-green-bg)"
          iconColor="var(--color-badge-green-text)"
          Icon={ShoppingCart}
          label="Pedidos"
          valor={vendasHoje.length}
        />
        <MetricaCard
          iconBg="var(--color-badge-purple-bg)"
          iconColor="var(--color-badge-purple-text)"
          Icon={Receipt}
          label="Ticket médio"
          valor={`R$ ${ticketMedio.toFixed(2)}`}
        />
        <MetricaCard
          iconBg={
            estoqueBaixo > 0
              ? "var(--color-warning-bg)"
              : "var(--color-badge-green-bg)"
          }
          iconColor={
            estoqueBaixo > 0
              ? "var(--color-warning-text)"
              : "var(--color-badge-green-text)"
          }
          Icon={estoqueBaixo > 0 ? AlertTriangle : CircleCheck}
          label="Estoque baixo"
          valor={estoqueBaixo}
          delta={estoqueBaixo > 0 ? "produtos abaixo do mínimo" : "estoque OK"}
          deltaColor={
            estoqueBaixo > 0 ? "var(--color-warning)" : "var(--color-success)"
          }
        />
      </div>

      {/* ─── CONTEÚDO INFERIOR ─── */}
      <div style={s.bottomGrid}>
        {/* ─── ÚLTIMAS VENDAS ─── */}
        <div style={s.card}>
          <h3 style={s.cardTitulo}>Últimas vendas</h3>
          {vendasHoje.length === 0 ? (
            <p style={s.vazio}>Nenhuma venda hoje</p>
          ) : (
            vendasHoje.slice(0, 5).map((venda) => (
              <div key={venda.id} style={s.vendaItem}>
                <div>
                  <p style={s.vendaNome}>
                    {venda.itens
                      ?.map((i) => `${i.product?.nome} x${i.quantidade}`)
                      .join(", ")}
                  </p>
                  <p style={s.vendaHora}>
                    {new Date(venda.data_venda).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {venda.user?.nome}
                  </p>
                </div>
                <div style={s.vendaDireita}>
                  <p style={s.vendaValor}>R$ {venda.valor_total.toFixed(2)}</p>
                  <BadgePagamento forma={venda.formaPagamento} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── LADO DIREITO ─── */}
        <div style={s.rightCol}>
          {/* ─── CAIXA ─── */}
          <div style={s.card}>
            <h3 style={s.cardTitulo}>Caixa</h3>
            {caixaAtual ? (
              <>
                <div style={s.caixaStatus}>
                  <div
                    style={{
                      ...s.caixaDot,
                      backgroundColor: "var(--color-success)",
                    }}
                  />
                  <span style={s.caixaTexto}>Aberto</span>
                </div>
                <p style={s.caixaInfo}>
                  Abertura: R$ {caixaAtual.valorInicial.toFixed(2)}
                </p>
                <p style={s.caixaInfo}>
                  Desde{" "}
                  {new Date(caixaAtual.abertura).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </>
            ) : (
              <div style={s.caixaStatus}>
                <div
                  style={{
                    ...s.caixaDot,
                    backgroundColor: "var(--color-warning)",
                  }}
                />
                <span style={s.caixaTexto}>Fechado</span>
              </div>
            )}
          </div>

          {/* ─── AÇÕES RÁPIDAS ─── */}
          <div style={s.card}>
            <h3 style={s.cardTitulo}>Ações rápidas</h3>
            <button onClick={() => navigate("/vendas")} style={s.acaoBtn}>
              <Plus size={14} style={s.acaoBtnIcon} aria-hidden="true" />
              Nova venda ↗
            </button>
            {(role === "ADMIN" || role === "GERENTE") && (
              <button onClick={() => navigate("/produtos")} style={s.acaoBtn}>
                <Package size={14} style={s.acaoBtnIcon} aria-hidden="true" />
                Novo produto ↗
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-componentes ─── */

function MetricaCard({
  iconBg,
  iconColor,
  Icon,
  label,
  valor,
  delta,
  deltaColor,
}) {
  return (
    <div style={s.metricaCard}>
      <div style={{ ...s.metricaIconBox, backgroundColor: iconBg }}>
        <Icon size={15} color={iconColor} aria-hidden="true" />
      </div>
      <p style={s.metricaLabel}>{label}</p>
      <p style={s.metricaValor}>{valor}</p>
      {delta && <p style={{ ...s.metricaDelta, color: deltaColor }}>{delta}</p>}
    </div>
  );
}

function BadgePagamento({ forma }) {
  const mapa = {
    DINHEIRO: {
      bg: "var(--color-badge-green-bg)",
      color: "var(--color-badge-green-text)",
      label: "Dinheiro",
    },
    PIX: {
      bg: "var(--color-badge-green-bg)",
      color: "var(--color-badge-green-text)",
      label: "PIX",
    },
    CARTAO_DEBITO: {
      bg: "var(--color-badge-blue-bg)",
      color: "var(--color-badge-blue-text)",
      label: "Débito",
    },
    CARTAO_CREDITO: {
      bg: "var(--color-badge-purple-bg)",
      color: "var(--color-badge-purple-text)",
      label: "Crédito",
    },
  };
  const estilo = mapa[forma] ?? {
    bg: "var(--color-background-tertiary)",
    color: "var(--color-text-secondary)",
    label: forma,
  };
  return (
    <span
      style={{ ...s.badge, backgroundColor: estilo.bg, color: estilo.color }}
    >
      {estilo.label}
    </span>
  );
}

/* ─── Estilos ─── */
const s = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  saudacao: {
    fontSize: "18px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 4px",
  },
  subtitulo: {
    color: "var(--color-text-secondary)",
    fontSize: "13px",
    margin: 0,
  },
  metricasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  metricaCard: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "16px",
    border: "0.5px solid var(--color-border-tertiary)",
  },
  metricaIconBox: {
    width: "28px",
    height: "28px",
    borderRadius: "var(--border-radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  metricaLabel: {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    margin: "0 0 4px",
  },
  metricaValor: {
    fontSize: "22px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: 0,
  },
  metricaDelta: {
    fontSize: "11px",
    margin: "4px 0 0",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "12px",
  },
  card: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "20px",
    border: "0.5px solid var(--color-border-tertiary)",
  },
  cardTitulo: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 14px",
  },
  vazio: {
    color: "var(--color-text-secondary)",
    fontSize: "13px",
    textAlign: "center",
    padding: "20px 0",
  },
  vendaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  },
  vendaNome: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: 0,
  },
  vendaHora: {
    fontSize: "11px",
    color: "var(--color-text-secondary)",
    margin: "2px 0 0",
  },
  vendaDireita: {
    textAlign: "right",
  },
  vendaValor: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 3px",
  },
  badge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "var(--border-radius-md)",
    display: "inline-block",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  caixaStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  caixaDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  caixaTexto: {
    fontSize: "13px",
    color: "var(--color-text-primary)",
  },
  caixaInfo: {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    margin: "4px 0 0",
  },
  acaoBtn: {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-primary)",
    borderRadius: "var(--border-radius-md)",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    marginBottom: "8px",
    color: "var(--color-text-primary)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
  },
  acaoBtnIcon: {
    flexShrink: 0,
  },
};
