import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { ShoppingBag, Plus, X } from "lucide-react";

export default function Produtos() {
  const { usuario } = useAuth();
  const role = usuario?.role;

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    preco: "",
    precoCusto: "",
    estoque: "",
    estoqueMinimo: "",
    codigoBarras: "",
    categoriaId: "",
    fornecedorId: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [prodRes, catRes, forRes] = await Promise.all([
        api.get("/products"),
        api.get("/categorias"),
        api.get("/fornecedores"),
      ]);
      setProdutos(prodRes.data);
      setCategorias(catRes.data);
      setFornecedores(forRes.data);
    } catch (error) {
      setErro("Erro ao carregar dados");
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(produto = null) {
    if (produto) {
      setProdutoEditando(produto);
      setForm({
        nome: produto.nome,
        preco: produto.preco,
        precoCusto: produto.precoCusto || "",
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        codigoBarras: produto.codigoBarras || "",
        categoriaId: produto.categoriaId || "",
        fornecedorId: produto.fornecedorId || "",
      });
    } else {
      setProdutoEditando(null);
      setForm({
        nome: "",
        preco: "",
        precoCusto: "",
        estoque: "",
        estoqueMinimo: "",
        codigoBarras: "",
        categoriaId: "",
        fornecedorId: "",
      });
    }
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setProdutoEditando(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSalvar() {
    try {
      const dados = {
        ...form,
        preco: parseFloat(form.preco),
        precoCusto: form.precoCusto ? parseFloat(form.precoCusto) : null,
        estoque: parseInt(form.estoque),
        estoqueMinimo: parseInt(form.estoqueMinimo),
        categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
        fornecedorId: form.fornecedorId ? parseInt(form.fornecedorId) : null,
      };
      if (produtoEditando) {
        await api.put(`/products/${produtoEditando.id}`, dados);
      } else {
        await api.post("/products", dados);
      }
      fecharModal();
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar produto");
    }
  }

  async function handleDesativar(id) {
    if (!confirm("Deseja desativar este produto?")) return;
    try {
      await api.delete(`/products/${id}`);
      carregarDados();
    } catch (error) {
      alert("Erro ao desativar produto");
    }
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.titulo}>
          <ShoppingBag size={20} style={s.tituloIcon} aria-hidden="true" />
          Produtos
        </h2>
        {(role === "ADMIN" || role === "GERENTE") && (
          <button onClick={() => abrirModal()} style={s.botaoNovo}>
            <Plus size={14} aria-hidden="true" />
            Novo Produto
          </button>
        )}
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

      <div style={s.tabelaContainer}>
        <table style={s.tabela}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Nome</th>
              <th style={s.th}>Preço</th>
              <th style={s.th}>Estoque</th>
              <th style={s.th}>Categoria</th>
              {(role === "ADMIN" || role === "GERENTE") && (
                <th style={s.th}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} style={s.tr}>
                <td style={s.td}>{p.nome}</td>
                <td style={s.td}>R$ {p.preco.toFixed(2)}</td>
                <td style={s.td}>
                  <span
                    style={
                      p.estoque <= p.estoqueMinimo
                        ? s.estoqueAlerta
                        : s.estoqueOk
                    }
                  >
                    {p.estoque}
                  </span>
                </td>
                <td style={s.td}>{p.categoria?.nome || "—"}</td>
                {(role === "ADMIN" || role === "GERENTE") && (
                  <td style={s.td}>
                    <button onClick={() => abrirModal(p)} style={s.botaoEditar}>
                      Editar
                    </button>
                    {role === "ADMIN" && (
                      <button
                        onClick={() => handleDesativar(p.id)}
                        style={s.botaoDesativar}
                      >
                        Desativar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={s.overlay} onClick={fecharModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>
                {produtoEditando ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button
                onClick={fecharModal}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div style={s.grid}>
              <div style={s.campo}>
                <label style={s.label}>Nome</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Código de Barras</label>
                <input
                  name="codigoBarras"
                  value={form.codigoBarras}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Preço de Venda</label>
                <input
                  name="preco"
                  type="number"
                  value={form.preco}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Preço de Custo</label>
                <input
                  name="precoCusto"
                  type="number"
                  value={form.precoCusto}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Estoque</label>
                <input
                  name="estoque"
                  type="number"
                  value={form.estoque}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Estoque Mínimo</label>
                <input
                  name="estoqueMinimo"
                  type="number"
                  value={form.estoqueMinimo}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Categoria</label>
                <select
                  name="categoriaId"
                  value={form.categoriaId}
                  onChange={handleChange}
                  style={s.input}
                >
                  <option value="">Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.campo}>
                <label style={s.label}>Fornecedor</label>
                <select
                  name="fornecedorId"
                  value={form.fornecedorId}
                  onChange={handleChange}
                  style={s.input}
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={s.modalBotoes}>
              <button onClick={fecharModal} style={s.botaoCancelar}>
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
  tituloIcon: {
    color: "var(--color-text-secondary)",
  },
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
  estoqueOk: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  estoqueAlerta: {
    backgroundColor: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
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
  botaoDesativar: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    border: "none",
    borderRadius: "var(--border-radius-sm)",
    padding: "5px 11px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
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
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitulo: {
    fontSize: "16px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: 0,
  },
  botaoFechar: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--color-text-secondary)",
    display: "flex",
    padding: "4px",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  campo: { display: "flex", flexDirection: "column", gap: "6px" },
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
  modalBotoes: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
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
  erro: { color: "var(--color-danger-text)", textAlign: "center" },
};
