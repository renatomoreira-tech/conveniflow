import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>ConveniFlow</h1>
        <div style={styles.headerDireita}>
          <span style={styles.nomeUsuario}>Olá, {usuario?.nome}</span>
          <span style={styles.role}>{usuario?.role}</span>
          <button onClick={logout} style={styles.botaoLogout}>
            Sair
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.bemVindo}>Bem-vindo ao sistema! 👋</h2>
        <p style={styles.subtitulo}>Selecione uma opção para começar</p>

        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate("/produtos")}>
            <span style={styles.icone}>🛍️</span>
            <h3 style={styles.cardTitulo}>Produtos</h3>
            <p style={styles.cardDesc}>Gerencie o catálogo de produtos</p>
          </div>
          <div style={styles.card} onClick={() => navigate("/vendas")}>
            <span style={styles.icone}>💰</span>
            <h3 style={styles.cardTitulo}>Vendas</h3>
            <p style={styles.cardDesc}>Registre e acompanhe as vendas</p>
          </div>
          <div style={styles.card} onClick={() => navigate("/caixa")}>
            <span style={styles.icone}>📦</span>
            <h3 style={styles.cardTitulo}>Caixa</h3>
            <p style={styles.cardDesc}>Controle abertura e fechamento</p>
          </div>
          <div style={styles.card} onClick={() => navigate("/categorias")}>
            <span style={styles.icone}>🏷️</span>
            <h3 style={styles.cardTitulo}>Categorias</h3>
            <p style={styles.cardDesc}>Organize os produtos por categoria</p>
          </div>
          <div style={styles.card} onClick={() => navigate("/fornecedores")}>
            <span style={styles.icone}>🚚</span>
            <h3 style={styles.cardTitulo}>Fornecedores</h3>
            <p style={styles.cardDesc}>Gerencie seus fornecedores</p>
          </div>
          <div style={styles.card} onClick={() => navigate("/relatorios")}>
            <span style={styles.icone}>📊</span>
            <h3 style={styles.cardTitulo}>Relatórios</h3>
            <p style={styles.cardDesc}>Visualize o desempenho do negócio</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#1a1a2e",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { color: "#fff", fontSize: "22px", fontWeight: "bold", margin: 0 },
  headerDireita: { display: "flex", alignItems: "center", gap: "16px" },
  nomeUsuario: { color: "#fff", fontSize: "14px" },
  role: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  botaoLogout: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "8px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },
  main: { padding: "40px 32px" },
  bemVindo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 8px",
  },
  subtitulo: { color: "#888", marginBottom: "32px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  icone: { fontSize: "32px" },
  cardTitulo: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "12px 0 4px",
  },
  cardDesc: { fontSize: "13px", color: "#888", margin: 0 },
};
