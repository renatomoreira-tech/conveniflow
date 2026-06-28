import { useState, useEffect } from "react";
import api from "../services/api";

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

  if (carregando) return <p style={styles.carregando}>Carregando...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.titulo}>🏷️ Categorias</h2>
        </div>
        <button onClick={() => abrirModal()} style={styles.botaoNovo}>
          + Nova Categoria
        </button>
      </div>

      <div style={styles.tabelaContainer}>
        <table style={styles.tabela}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Produtos</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="3" style={styles.vazio}>
                  Nenhuma categoria cadastrada
                </td>
              </tr>
            ) : (
              categorias.map((cat) => (
                <tr key={cat.id} style={styles.tr}>
                  <td style={styles.td}>{cat.nome}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>
                      {cat._count?.produtos || 0}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => abrirModal(cat)}
                      style={styles.botaoEditar}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(cat.id)}
                      style={styles.botaoDeletar}
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
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitulo}>
              {editando ? "Editar Categoria" : "Nova Categoria"}
            </h3>
            <div style={styles.campo}>
              <label style={styles.label}>Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.input}
                placeholder="Ex: Bebidas, Snacks..."
              />
            </div>
            {erro && <p style={styles.erro}>{erro}</p>}
            <div style={styles.modalBotoes}>
              <button
                onClick={() => setModalAberto(false)}
                style={styles.botaoCancelar}
              >
                Cancelar
              </button>
              <button onClick={handleSalvar} style={styles.botaoSalvar}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "0" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  titulo: { fontSize: "22px", fontWeight: "bold", color: "#1a1a2e", margin: 0 },
  botaoNovo: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tabelaContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    overflow: "hidden",
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
  td: { padding: "14px 16px", fontSize: "14px", color: "#333" },
  badge: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  botaoEditar: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
  },
  botaoDeletar: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "12px",
  },
  vazio: { padding: "40px", textAlign: "center", color: "#888" },
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
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    maxWidth: "400px",
  },
  modalTitulo: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: "24px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  erro: { color: "#e53e3e", fontSize: "14px", marginBottom: "12px" },
  modalBotoes: { display: "flex", justifyContent: "flex-end", gap: "12px" },
  botaoCancelar: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
  },
  botaoSalvar: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "600",
  },
  carregando: { textAlign: "center", marginTop: "40px", color: "#888" },
};
