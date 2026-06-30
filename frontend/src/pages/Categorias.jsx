import { useState, useEffect } from "react";
import api from "../services/api";
import { Tag, Plus } from "lucide-react";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
    } catch (error) {
      setErro("Erro ao carregar categorias");
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(categoria = null) {
    if (categoria) {
      setEditando(categoria);
      setNome(categoria.nome);
    } else {
      setEditando(null);
      setNome("");
    }
    setErro("");
    setModalAberto(true);
  }

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }
    try {
      if (editando) {
        await api.put(`/categorias/${editando.id}`, { nome });
      } else {
        await api.post("/categorias", { nome });
      }
      setModalAberto(false);
      carregarCategorias();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao salvar categoria");
    }
  }

  async function handleDeletar(id) {
    if (!confirm("Deseja excluir esta categoria?")) return;
    try {
      await api.delete(`/categorias/${id}`);
      carregarCategorias();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao excluir categoria");
    }
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.titulo}>
          <Tag size={20} style={s.tituloIcon} aria-hidden="true" />
          Categorias
        </h2>
        <button onClick={() => abrirModal()} style={s.botaoNovo}>
          <Plus size={14} aria-hidden="true" />
          Nova Categoria
        </button>
      </div>

      <div style={s.tabelaContainer}>
        <table style={s.tabela}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Nome</th>
              <th style={s.th}>Produtos</th>
              <th style={s.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="3" style={s.vazio}>
                  Nenhuma categoria cadastrada
                </td>
              </tr>
            ) : (
              categorias.map((cat) => (
                <tr key={cat.id} style={s.tr}>
                  <td style={s.td}>{cat.nome}</td>
                  <td style={s.td}>
                    <span style={s.badge}>{cat._count?.produtos || 0}</span>
                  </td>
                  <td style={s.td}>
                    <button
                      onClick={() => abrirModal(cat)}
                      style={s.botaoEditar}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(cat.id)}
                      style={s.botaoDeletar}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={s.overlay} onClick={() => setModalAberto(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitulo}>
              {editando ? "Editar Categoria" : "Nova Categoria"}
            </h3>
            <div style={s.campo}>
              <label style={s.label}>Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={s.input}
                placeholder="Ex: Bebidas, Snacks..."
              />
            </div>
            {erro && <p style={s.erro}>{erro}</p>}
            <div style={s.modalBotoes}>
              <button
                onClick={() => setModalAberto(false)}
                style={s.botaoCancelar}
              >
                Cancelar
              </button>
              <button onClick={handleSalvar} style={s.botaoSalvar}>
                Salvar
              </button>
            </div>
          </div>
        </div>
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
  botaoNovo: {
    backgroundColor: "var(--color-text-info)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
  },
  tabelaContainer: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    overflow: "hidden",
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
  badge: {
    backgroundColor: "var(--color-badge-purple-bg)",
    color: "var(--color-badge-purple-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  botaoEditar: {
    backgroundColor: "var(--color-text-info)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-sm)",
    padding: "5px 11px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
    fontFamily: "inherit",
  },
  botaoDeletar: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    border: "none",
    borderRadius: "var(--border-radius-sm)",
    padding: "5px 11px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  },
  vazio: {
    padding: "40px",
    textAlign: "center",
    color: "var(--color-text-secondary)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "28px",
    width: "100%",
    maxWidth: "400px",
  },
  modalTitulo: {
    fontSize: "16px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    marginBottom: "20px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
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
  erro: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
    marginBottom: "12px",
  },
  modalBotoes: { display: "flex", justifyContent: "flex-end", gap: "10px" },
  botaoCancelar: {
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    border: "0.5px solid var(--color-border-primary)",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 18px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  botaoSalvar: {
    backgroundColor: "var(--color-text-info)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 18px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  carregando: {
    textAlign: "center",
    marginTop: "40px",
    color: "var(--color-text-secondary)",
  },
};
