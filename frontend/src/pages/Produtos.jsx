import { useState, useEffect } from "react";
import api from "../services/api";

export default function Produtos() {
  const [produtos, setProdutos]       = useState([]);
  const [categorias, setCategorias]   = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando]   = useState(true);
  const [erro, setErro]               = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [form, setForm] = useState({
    nome:          "",
    preco:         "",
    precoCusto:    "",
    estoque:       "",
    estoqueMinimo: "",
    codigoBarras:  "",
    categoriaId:   "",
    fornecedorId:  "",
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
        nome:          produto.nome,
        preco:         produto.preco,
        precoCusto:    produto.precoCusto || "",
        estoque:       produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        codigoBarras:  produto.codigoBarras || "",
        categoriaId:   produto.categoriaId || "",
        fornecedorId:  produto.fornecedorId || "",
      });
    } else {
      setProdutoEditando(null);
      setForm({
        nome: "", preco: "", precoCusto: "", estoque: "",
        estoqueMinimo: "", codigoBarras: "", categoriaId: "", fornecedorId: "",
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
        preco:         parseFloat(form.preco),
        precoCusto:    form.precoCusto ? parseFloat(form.precoCusto) : null,
        estoque:       parseInt(form.estoque),
        estoqueMinimo: parseInt(form.estoqueMinimo),
        categoriaId:   form.categoriaId ? parseInt(form.categoriaId) : null,
        fornecedorId:  form.fornecedorId ? parseInt(form.fornecedorId) : null,
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

  if (carregando) return <p style={styles.carregando}>Carregando...</p>;

  return (
    <div style={styles.container}>
      {/* ─── HEADER ─── */}
      <div style={styles.header}>
        <h2 style={styles.titulo}>🛍️ Produtos</h2>
        <button onClick={() => abrirModal()} style={styles.botaoNovo}>
          + Novo Produto
        </button>
      </div>

      {erro && <p style={styles.erro}>{erro}</p>}

      {/* ─── TABELA ─── */}
      <div style={styles.tabelaContainer}>
        <table style={styles.tabela}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Preço</th>
              <th style={styles.th}>Estoque</th>
              <th style={styles.th}>Categoria</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{p.nome}</td>
                <td style={styles.td}>R$ {p.preco.toFixed(2)}</td>
                <td style={styles.td}>
                  <span style={p.estoque <= p.estoqueMinimo ? styles.estoqueAlerta : styles.estoqueOk}>
                    {p.estoque}
                  </span>
                </td>
                <td style={styles.td}>{p.categoria?.nome || "—"}</td>
                <td style={styles.td}>
                  <button onClick={() => abrirModal(p)} style={styles.botaoEditar}>
                    Editar
                  </button>
                  <button onClick={() => handleDesativar(p.id)} style={styles.botaoDesativar}>
                    Desativar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL ─── */}
      {modalAberto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitulo}>
              {produtoEditando ? "Editar Produto" : "Novo Produto"}
            </h3>

            <div style={styles.grid}>
              <div style={styles.campo}>
                <label style={styles.label}>Nome</label>
                <input name="nome" value={form.nome} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Código de Barras</label>
                <input name="codigoBarras" value={form.codigoBarras} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Preço de Venda</label>
                <input name="preco" type="number" value={form.preco} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Preço de Custo</label>
                <input name="precoCusto" type="number" value={form.precoCusto} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Estoque</label>
                <input name="estoque" type="number" value={form.estoque} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Estoque Mínimo</label>
                <input name="estoqueMinimo" type="number" value={form.estoqueMinimo} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Categoria</label>
                <select name="categoriaId" value={form.categoriaId} onChange={handleChange} style={styles.input}>
                  <option value="">Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Fornecedor</label>
                <select name="fornecedorId" value={form.fornecedorId} onChange={handleChange} style={styles.input}>
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.modalBotoes}>
              <button onClick={fecharModal} style={styles.botaoCancelar}>Cancelar</button>
              <button onClick={handleSalvar} style={styles.botaoSalvar}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:       { padding: "32px" },
  header:          { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  titulo:          { fontSize: "22px", fontWeight: "bold", color: "#1a1a2e", margin: 0 },
  botaoNovo:       { backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: "600" },
  tabelaContainer: { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" },
  tabela:          { width: "100%", borderCollapse: "collapse" },
  thead:           { backgroundColor: "#f8f9fa" },
  th:              { padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#555" },
  tr:              { borderTop: "1px solid #f0f0f0" },
  td:              { padding: "14px 16px", fontSize: "14px", color: "#333" },
  estoqueOk:       { backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  estoqueAlerta:   { backgroundColor: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  botaoEditar:     { backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", marginRight: "8px", fontSize: "12px" },
  botaoDesativar:  { backgroundColor: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px" },
  overlay:         { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:           { backgroundColor: "#fff", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" },
  modalTitulo:     { fontSize: "18px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "24px" },
  grid:            { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  campo:           { display: "flex", flexDirection: "column", gap: "6px" },
  label:           { fontSize: "13px", fontWeight: "600", color: "#555" },
  input:           { padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  modalBotoes:     { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" },
  botaoCancelar:   { backgroundColor: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer" },
  botaoSalvar:     { backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: "600" },
  carregando:      { textAlign: "center", marginTop: "40px", color: "#888" },
  erro:            { color: "#e53e3e", textAlign: "center" },
};