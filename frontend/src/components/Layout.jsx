import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle/ThemeToggle";
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Wallet,
  Truck,
  BarChart3,
  Users,
  Settings,
  HandCoins as Wallet2,
  Menu,
  X,
} from "lucide-react";

// Cada item de menu carrega um `modulo` correspondente ao nome usado
// em Negocio.modulosAtivos (backend). Dashboard não tem módulo —
// está sempre visível, é a página inicial de qualquer usuário.
// "categorias" foi removido: a gestão de categoria/subcategoria
// agora acontece direto dentro de Produtos, não precisa mais de
// tela própria.
const MENU_ITEMS = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    modulo: null,
  },
  {
    path: "/produtos",
    icon: ShoppingBag,
    label: "Produtos",
    modulo: "produtos",
  },
  { path: "/vendas", icon: Receipt, label: "Vendas", modulo: "vendas" },
  {
    path: "/contas-receber",
    icon: Wallet2,
    label: "Contas a Receber",
    modulo: "vendas",
  },
  { path: "/clientes", icon: Users, label: "Clientes", modulo: "clientes" },
  { path: "/caixa", icon: Wallet, label: "Caixa", modulo: "caixa" },
];

const MENU_ADMIN = [
  {
    path: "/fornecedores",
    icon: Truck,
    label: "Fornecedores",
    modulo: "fornecedores",
  },
  {
    path: "/relatorios",
    icon: BarChart3,
    label: "Relatórios",
    modulo: "relatorios",
  },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const role = usuario?.role;
  const [mobile, setMobile] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const modulosAtivos = usuario?.modulosAtivos ?? [];

  useEffect(() => {
    const atualizar = () => setMobile(window.innerWidth <= 900);
    atualizar();
    window.addEventListener("resize", atualizar);
    return () => window.removeEventListener("resize", atualizar);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobile && menuAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile, menuAberto]);

  const itemsPorRole =
    role === "ADMIN" || role === "GERENTE"
      ? [...MENU_ITEMS, ...MENU_ADMIN]
      : MENU_ITEMS;

  const allItems = itemsPorRole.filter(
    (item) => !item.modulo || modulosAtivos.includes(item.modulo),
  );

  const inicial = usuario?.nome?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={s.layout}>
      {mobile && menuAberto && (
        <div onClick={() => setMenuAberto(false)} style={s.overlay} />
      )}

      <aside
        style={
          mobile
            ? {
                ...s.sidebar,
                ...s.sidebarMobile,
                transform: menuAberto ? "translateX(0)" : "translateX(-100%)",
              }
            : s.sidebar
        }
      >
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
                onClick={() => {
                  navigate(item.path);
                  if (mobile) setMenuAberto(false);
                }}
                style={ativo ? { ...s.item, ...s.itemAtivo } : s.item}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(item.path);
                    if (mobile) setMenuAberto(false);
                  }
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </div>
            );
          })}

          {role === "ADMIN" && (
            <div
              onClick={() => {
                navigate("/configuracoes");
                if (mobile) setMenuAberto(false);
              }}
              style={
                location.pathname === "/configuracoes"
                  ? { ...s.item, ...s.itemAtivo }
                  : s.item
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate("/configuracoes");
                  if (mobile) setMenuAberto(false);
                }
              }}
            >
              <Settings size={16} aria-hidden="true" />
              Configurações
            </div>
          )}
        </nav>

        <div style={s.userBox}>
          <div style={s.avatar}>{inicial}</div>
          <div>
            <p style={s.userName}>{usuario?.nome}</p>
            <p style={s.userRole}>{role}</p>
          </div>
        </div>
      </aside>

      <div
        style={
          mobile
            ? { ...s.content, marginLeft: 0, padding: "16px 16px 24px" }
            : s.content
        }
      >
        <div style={mobile ? { ...s.topBar, ...s.topBarMobile } : s.topBar}>
          <div style={s.topBarEsquerda}>
            {mobile && (
              <button
                type="button"
                onClick={() => setMenuAberto((v) => !v)}
                style={s.menuButton}
                aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              >
                {menuAberto ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
          <div
            style={
              mobile
                ? { ...s.topBarDireita, ...s.topBarDireitaMobile }
                : s.topBarDireita
            }
          >
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
    position: "relative",
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
  sidebarMobile: {
    zIndex: 30,
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s ease",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    zIndex: 20,
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
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  topBarMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
  },
  topBarEsquerda: {
    display: "flex",
    alignItems: "center",
    minWidth: "40px",
  },
  topBarDireita: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  topBarDireitaMobile: {
    width: "100%",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
  },
  menuButton: {
    border: "0.5px solid var(--color-border-primary)",
    backgroundColor: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    borderRadius: "var(--border-radius-md)",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  data: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    whiteSpace: "nowrap",
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
