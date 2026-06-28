  import { useState, useEffect } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import { useAuth } from "../context/AuthContext";
  import api from "../services/api";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const role = usuario?.role;

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/produtos", icon: "🛍️", label: "Produtos" },
    { path: "/vendas", icon: "💰", label: "Vendas" },
    { path: "/caixa", icon: "📦", label: "Caixa" },
  ];

  const menuAdmin = [
    { path: "/categorias", icon: "🏷️", label: "Categorias" },
    { path: "/fornecedores", icon: "🚚", label: "Fornecedores" },
    { path: "/relatorios", icon: "📈", label: "Relatórios" },
  ];

  const allItems =
    role === "ADMIN" || role === "GERENTE"
      ? [...menuItems, ...menuAdmin]
      : menuItems;

  return (
    <div style={sidebarStyles.container}>
      <h1 style={sidebarStyles.logo}>GestorFlow</h1>
      <nav style={sidebarStyles.nav}>
        {allItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={
              location.pathname === item.path
                ? { ...sidebarStyles.item, ...sidebarStyles.itemAtivo }
                : sidebarStyles.item
            }
          >
            <span style={sidebarStyles.icone}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
      <div style={sidebarStyles.userBox}>
        <div style={sidebarStyles.avatar}>
          {usuario?.nome?.charAt(0) || "U"}
        </div>
        <div>
          <p style={sidebarStyles.userName}>{usuario?.nome}</p>
          <p style={sidebarStyles.userRole}>{usuario?.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const role = usuario?.role;

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
        api
          .get(`/sales/relatorio?inicio=${hoje}&fim=${amanha}`)
          .catch(() => ({
            data: { sales: [], totalPeriodo: 0, quantidade: 0 },
          })),
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/caixa/atual").catch(() => ({ data: null })),
      ]);

      const vendas = vendasRes.data;
      setVendasHoje(vendas.sales || []);
      setTotalHoje(vendas.totalPeriodo || 0);

      const produtos = produtosRes.data;
      const baixo = produtos.filter((p) => p.estoque <= p.estoqueMinimo).length;
      setEstoqueBaixo(baixo);

      setCaixaAtual(caixaRes.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setCarregando(false);
    }
  }

  const ticketMedio = vendasHoje.length > 0 ? totalHoje / vendasHoje.length : 0;

  return (
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.content}>
        {/* ─── HEADER ─── */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.saudacao}>Bom dia, {usuario?.nome} 👋</h2>
            <p style={styles.subtitulo}>Aqui está o resumo do seu negócio</p>
          </div>
          <div style={styles.headerDireita}>
            <span style={styles.data}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <button onClick={logout} style={styles.botaoSair}>
              Sair
            </button>
          </div>
        </div>

        {carregando ? (
          <p style={styles.carregando}>Carregando...</p>
        ) : (
          <>
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
                <div
                  style={{
                    ...styles.metricaIconBox,
                    backgroundColor: "#e1f5ee",
                  }}
                >
                  <span style={styles.metricaIcon}>🛒</span>
                </div>
                <p style={styles.metricaLabel}>Pedidos</p>
                <p style={styles.metricaValor}>{vendasHoje.length}</p>
              </div>
              <div style={styles.metricaCard}>
                <div
                  style={{
                    ...styles.metricaIconBox,
                    backgroundColor: "#eeedfe",
                  }}
                >
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
                          {new Date(venda.data_venda).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
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
                        {new Date(caixaAtual.abertura).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </>
                  ) : (
                    <div style={styles.caixaStatus}>
                      <div
                        style={{
                          ...styles.caixaDot,
                          backgroundColor: "#991b1b",
                        }}
                      ></div>
                      <span style={styles.caixaTexto}>Fechado</span>
                    </div>
                  )}
                </div>

                {/* ─── AÇÕES RÁPIDAS ─── */}
                <div style={styles.card}>
                  <h3 style={styles.cardTitulo}>Ações rápidas</h3>
                  <button
                    onClick={() => (window.location.href = "/vendas")}
                    style={styles.acaoBtn}
                  >
                    ➕ Nova venda
                  </button>
                  {(role === "ADMIN" || role === "GERENTE") && (
                    <button
                      onClick={() => (window.location.href = "/produtos")}
                      style={styles.acaoBtn}
                    >
                      📦 Novo produto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const sidebarStyles = {
  container: {
    width: "220px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    padding: "0 24px",
    margin: "0 0 32px",
    color: "#fff",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "0 12px",
    flex: 1,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#a0a0b8",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  itemAtivo: {
    backgroundColor: "#4f46e5",
    color: "#fff",
  },
  icone: {
    fontSize: "18px",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 24px",
    borderTop: "1px solid #2a2a40",
    marginTop: "auto",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    margin: 0,
    fontSize: "13px",
    color: "#fff",
  },
  userRole: {
    margin: 0,
    fontSize: "11px",
    color: "#a0a0b8",
  },
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  content: {
    flex: 1,
    marginLeft: "220px",
    padding: "32px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  saudacao: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  subtitulo: {
    color: "#888",
    fontSize: "14px",
    margin: 0,
  },
  headerDireita: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  data: {
    fontSize: "13px",
    color: "#888",
  },
  botaoSair: {
    backgroundColor: "transparent",
    color: "#1a1a2e",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "6px 16px",
    cursor: "pointer",
    fontSize: "13px",
  },
  carregando: {
    textAlign: "center",
    color: "#888",
    marginTop: "40px",
  },

  metricasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  metricaCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  metricaIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#e6f1fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  metricaIcon: {
    fontSize: "20px",
  },
  metricaLabel: {
    fontSize: "13px",
    color: "#888",
    margin: "0 0 6px",
  },
  metricaValor: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: 0,
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardTitulo: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: "0 0 16px",
  },
  vazio: {
    color: "#888",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px 0",
  },

  vendaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  vendaNome: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  },
  vendaHora: {
    fontSize: "11px",
    color: "#888",
    margin: "4px 0 0",
  },
  vendaDireita: {
    textAlign: "right",
  },
  vendaValor: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  vendaPagamento: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "12px",
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
  },

  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  caixaStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  caixaDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#065f46",
  },
  caixaTexto: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a2e",
  },
  caixaInfo: {
    fontSize: "13px",
    color: "#888",
    margin: "6px 0 0",
  },
  acaoBtn: {
    width: "100%",
    padding: "10px 16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    marginBottom: "8px",
    color: "#1a1a2e",
  },
};
