import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle/ThemeToggle";
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Wallet,
  Tag,
  Truck,
  BarChart3,
} from "lucide-react";

const MENU_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/produtos", icon: ShoppingBag, label: "Produtos" },
  { path: "/vendas", icon: Receipt, label: "Vendas" },
  { path: "/caixa", icon: Wallet, label: "Caixa" },
];

const MENU_ADMIN = [
  { path: "/categorias", icon: Tag, label: "Categorias" },
  { path: "/fornecedores", icon: Truck, label: "Fornecedores" },
  { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const role = usuario?.role;

  const allItems =
    role === "ADMIN" || role === "GERENTE"
      ? [...MENU_ITEMS, ...MENU_ADMIN]
      : MENU_ITEMS;

  const inicial = usuario?.nome?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={s.layout}>
      {/* ─── SIDEBAR ─── */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <img src="/icon.svg" alt="" style={s.logoIcon} />
          GestorFlow
        </div>

        <nav style={s.nav}>
          {allItems.map((item) => {
            const ativo = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={ativo ? { ...s.item, ...s.itemAtivo } : s.item}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(item.path)}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div style={s.userBox}>
          <div style={s.avatar}>{inicial}</div>
          <div>
            <p style={s.userName}>{usuario?.nome}</p>
            <p style={s.userRole}>{role}</p>
          </div>
        </div>
      </aside>

      {/* ─── CONTEÚDO ─── */}
      <div style={s.content}>
        <div style={s.topBar}>
          <div />
          <div style={s.topBarDireita}>
            <span style={s.data}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <ThemeToggle />
            <button onClick={logout} style={s.botaoSair}>
              Sair
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const s = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "var(--color-background-tertiary)",
  },
  sidebar: {
    width: "200px",
    backgroundColor: "var(--color-background-primary)",
    borderRight: "0.5px solid var(--color-border-tertiary)",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "17px",
    fontWeight: "500",
    padding: "0 20px",
    margin: "0 0 24px",
    color: "var(--color-text-primary)",
  },
  logoIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "0 8px",
    flex: 1,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    cursor: "pointer",
  },
  itemAtivo: {
    backgroundColor: "var(--color-background-info)",
    color: "var(--color-text-info)",
    fontWeight: "500",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 20px",
    borderTop: "0.5px solid var(--color-border-tertiary)",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--color-background-info)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--color-text-info)",
    flexShrink: 0,
  },
  userName: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
  },
  userRole: {
    margin: 0,
    fontSize: "11px",
    color: "var(--color-text-secondary)",
  },
  content: {
    flex: 1,
    marginLeft: "200px",
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
    gap: "12px",
  },
  data: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
  },
  botaoSair: {
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
    border: "0.5px solid var(--color-border-primary)",
    borderRadius: "var(--border-radius-md)",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },
};
