import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
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
    <div style={styles.layout}>
      {/* ─── SIDEBAR ─── */}
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>GestorFlow</h1>
        <nav style={styles.nav}>
          {allItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={
                location.pathname === item.path
                  ? { ...styles.item, ...styles.itemAtivo }
                  : styles.item
              }
            >
              <span style={styles.icone}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div style={styles.userBox}>
          <div style={styles.avatar}>{usuario?.nome?.charAt(0) || "U"}</div>
          <div>
            <p style={styles.userName}>{usuario?.nome}</p>
            <p style={styles.userRole}>{usuario?.role}</p>
          </div>
        </div>
      </div>

      {/* ─── CONTEÚDO ─── */}
      <div style={styles.content}>
        <div style={styles.topBar}>
          <div></div>
          <div style={styles.topBarDireita}>
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
        {children}
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
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
  content: {
    flex: 1,
    marginLeft: "220px",
    padding: "24px 32px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  topBarDireita: {
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
};
