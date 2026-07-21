import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { ShoppingBag, Plus, X, PackagePlus } from "lucide-react";

// A partir da lista de categorias raiz (cada uma já trazendo suas
// subcategorias aninhadas), monta um mapa simples id -> categoria,
// para conseguir "de trás pra frente" descobrir qual é a categoria-pai
// e qual é a subcategoria de um produto já salvo (usado ao abrir o
// modal de edição, para pré-selecionar os dois dropdowns corretamente).
function montarIndice(categorias) {
  const porId = new Map();
  for (const cat of categorias) {
    porId.set(cat.id, { ...cat, ehRaiz: true });
    for (const sub of cat.subcategorias ?? []) {
      porId.set(sub.id, { ...sub, ehRaiz: false, categoriaPaiId: cat.id });
    }
  }
  return porId;
}

// Monta o texto de exibição da coluna Categoria/Subcategoria na
// tabela. Categoria mostra sempre a raiz; Subcategoria mostra o
// nome da subcategoria ou "—" se o produto está direto na raiz.
function colunasCategoria(produto, indice) {
  if (!produto.categoriaId) return { categoria: "—", subcategoria: "—" };

  const cat = indice.get(produto.categoriaId);
  if (!cat) return { categoria: "—", subcategoria: "—" };

  if (cat.ehRaiz) {
    return { categoria: cat.nome, subcategoria: "—" };
  }

  const pai = indice.get(cat.categoriaPaiId);
  return { categoria: pai?.nome ?? "—", subcategoria: cat.nome };
}

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

  // Estado do modal secundário "Registrar entrada", aberto de dentro
  // do modal de edição do produto.
  const [modalEntradaAberto, setModalEntradaAberto] = useState(false);
  const [quantidadeEntrada, setQuantidadeEntrada] = useState("");
  const [motivoEntrada, setMotivoEntrada] = useState("");
  const [erroEntrada, setErroEntrada] = useState("");

  // Estados dos mini-modais "Nova categoria" e "Nova subcategoria",
  // abertos de dentro do modal de Produto — como a tela de
  // Categorias foi removida, esse é o único lugar onde dá para
  // criar novas categorias/subcategorias agora.
  const [modalNovaCategoriaAberto, setModalNovaCategoriaAberto] =
    useState(false);
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState("");
  const [erroNovaCategoria, setErroNovaCategoria] = useState("");

  const [modalNovaSubcategoriaAberto, setModalNovaSubcategoriaAberto] =
    useState(false);
  const [nomeNovaSubcategoria, setNomeNovaSubcategoria] = useState("");
  const [erroNovaSubcategoria, setErroNovaSubcategoria] = useState("");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const atualizar = () => setMobile(window.innerWidth <= 768);
    atualizar();
    window.addEventListener("resize", atualizar);
    return () => window.removeEventListener("resize", atualizar);
  }, []);

  const [form, setForm] = useState({
    nome: "",
    preco: "",
    precoCusto: "",
    estoque: "",
    estoqueMinimo: "",
    codigoBarras: "",
    categoriaRaizId: "", // controla o 1º dropdown (Categoria)
    categoriaId: "", // valor final salvo: raiz OU subcategoria
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

  const indice = montarIndice(categorias);

  // Subcategorias disponíveis para o dropdown 2, filtradas pela
  // categoria raiz escolhida no dropdown 1. Vazio se a categoria
  // escolhida não tiver subcategorias (aí o produto fica direto nela).
  const categoriaRaizSelecionada = categorias.find(
    (c) => c.id === parseInt(form.categoriaRaizId),
  );
  const subcategoriasDisponiveis =
    categoriaRaizSelecionada?.subcategorias ?? [];

  function abrirModal(produto = null) {
    if (produto && produto.categoriaId) {
      const cat = indice.get(produto.categoriaId);
      const categoriaRaizId = cat?.ehRaiz ? cat.id : cat?.categoriaPaiId;

      setProdutoEditando(produto);
      setForm({
        nome: produto.nome,
        preco: produto.preco,
        precoCusto: produto.precoCusto || "",
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        codigoBarras: produto.codigoBarras || "",
        categoriaRaizId: categoriaRaizId || "",
        categoriaId: produto.categoriaId || "",
        fornecedorId: produto.fornecedorId || "",
      });
    } else if (produto) {
      setProdutoEditando(produto);
      setForm({
        nome: produto.nome,
        preco: produto.preco,
        precoCusto: produto.precoCusto || "",
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        codigoBarras: produto.codigoBarras || "",
        categoriaRaizId: "",
        categoriaId: "",
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
        categoriaRaizId: "",
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

  // Ao trocar a Categoria (dropdown 1), reseta a Subcategoria
  // escolhida e assume, por padrão, a própria categoria raiz como
  // valor final — caso ela não tenha subcategorias, ou caso o
  // usuário não escolha nenhuma subcategoria específica.
  function handleCategoriaRaizChange(e) {
    const categoriaRaizId = e.target.value;
    setForm({
      ...form,
      categoriaRaizId,
      categoriaId: categoriaRaizId,
    });
  }

  function handleSubcategoriaChange(e) {
    const subcategoriaId = e.target.value;
    setForm({
      ...form,
      // Se "nenhuma" for escolhida, volta a usar a categoria raiz
      // como valor final; senão, usa a subcategoria escolhida.
      categoriaId: subcategoriaId || form.categoriaRaizId,
    });
  }

  async function handleSalvar() {
    try {
      const dados = {
        nome: form.nome,
        preco: parseFloat(form.preco),
        precoCusto: form.precoCusto ? parseFloat(form.precoCusto) : null,
        estoque: parseInt(form.estoque),
        estoqueMinimo: parseInt(form.estoqueMinimo),
        codigoBarras: form.codigoBarras,
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

  // Abre o mini-formulário de entrada, dentro do modal de edição
  // já aberto para o produto selecionado.
  function abrirModalEntrada() {
    setQuantidadeEntrada("");
    setMotivoEntrada("");
    setErroEntrada("");
    setModalEntradaAberto(true);
  }

  async function handleRegistrarEntrada() {
    setErroEntrada("");
    const quantidade = parseInt(quantidadeEntrada);

    if (!quantidade || quantidade <= 0) {
      setErroEntrada("Informe uma quantidade válida");
      return;
    }

    try {
      await api.post("/movimentos-estoque/entrada", {
        productId: produtoEditando.id,
        quantidade,
        motivo: motivoEntrada,
      });

      // Atualiza o estoque exibido no próprio modal de edição sem
      // precisar fechar e reabrir tudo.
      setForm((f) => ({ ...f, estoque: f.estoque + quantidade }));
      setProdutoEditando((p) => ({ ...p, estoque: p.estoque + quantidade }));

      setModalEntradaAberto(false);
      carregarDados(); // atualiza a tabela de fundo também
    } catch (error) {
      setErroEntrada(
        error.response?.data?.error || "Erro ao registrar entrada",
      );
    }
  }

  function abrirModalNovaCategoria() {
    setNomeNovaCategoria("");
    setErroNovaCategoria("");
    setModalNovaCategoriaAberto(true);
  }

  async function handleCriarCategoria() {
    setErroNovaCategoria("");
    if (!nomeNovaCategoria.trim()) {
      setErroNovaCategoria("Nome é obrigatório");
      return;
    }
    try {
      const res = await api.post("/categorias", { nome: nomeNovaCategoria });
      // Recarrega a lista de categorias e já seleciona a recém-criada
      // no dropdown 1, poupando o usuário de ter que procurá-la.
      const catRes = await api.get("/categorias");
      setCategorias(catRes.data);
      setForm((f) => ({
        ...f,
        categoriaRaizId: res.data.id,
        categoriaId: res.data.id,
      }));
      setModalNovaCategoriaAberto(false);
    } catch (error) {
      setErroNovaCategoria(
        error.response?.data?.error || "Erro ao criar categoria",
      );
    }
  }

  function abrirModalNovaSubcategoria() {
    setNomeNovaSubcategoria("");
    setErroNovaSubcategoria("");
    setModalNovaSubcategoriaAberto(true);
  }

  async function handleCriarSubcategoria() {
    setErroNovaSubcategoria("");
    if (!nomeNovaSubcategoria.trim()) {
      setErroNovaSubcategoria("Nome é obrigatório");
      return;
    }
    try {
      const res = await api.post("/categorias", {
        nome: nomeNovaSubcategoria,
        categoriaPaiId: parseInt(form.categoriaRaizId),
      });
      const catRes = await api.get("/categorias");
      setCategorias(catRes.data);
      // Já seleciona a subcategoria recém-criada como valor final.
      setForm((f) => ({ ...f, categoriaId: res.data.id }));
      setModalNovaSubcategoriaAberto(false);
    } catch (error) {
      setErroNovaSubcategoria(
        error.response?.data?.error || "Erro ao criar subcategoria",
      );
    }
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={mobile ? { ...s.header, ...s.headerMobile } : s.header}>
        <h2 style={s.titulo}>
          <ShoppingBag size={20} style={s.tituloIcon} aria-hidden="true" />
          Produtos
        </h2>
        {(role === "ADMIN" || role === "GERENTE") && (
          <button
            onClick={() => abrirModal()}
            style={mobile ? { ...s.botaoNovo, width: "100%", justifyContent: "center" } : s.botaoNovo}
          >
            <Plus size={14} aria-hidden="true" />
            Novo Produto
          </button>
        )}
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

      <div style={s.tabelaContainer}>
        <div style={s.tabelaScroll}>
        <table style={s.tabela}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Nome</th>
              <th style={s.th}>Categoria</th>
              <th style={s.th}>Subcategoria</th>
              <th style={s.th}>Preço</th>
              <th style={s.th}>Estoque</th>
              {(role === "ADMIN" || role === "GERENTE") && (
                <th style={s.th}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => {
              const cols = colunasCategoria(p, indice);
              return (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>{p.nome}</td>
                  <td style={s.td}>{cols.categoria}</td>
                  <td style={s.tdSub}>{cols.subcategoria}</td>
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
                  {(role === "ADMIN" || role === "GERENTE") && (
                    <td style={s.td}>
                      <button
                        onClick={() => abrirModal(p)}
                        style={s.botaoEditar}
                      >
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
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {modalAberto && (
        <div style={s.overlay} onClick={fecharModal}>
          <div
            style={mobile ? { ...s.modal, padding: "20px 16px" } : s.modal}
            onClick={(e) => e.stopPropagation()}
          >
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
            <div style={mobile ? { ...s.grid, gridTemplateColumns: "1fr" } : s.grid}>
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
                <div style={s.labelComBotao}>
                  <label style={s.label}>Estoque</label>
                  {produtoEditando && (
                    <button
                      type="button"
                      onClick={abrirModalEntrada}
                      style={s.botaoEntrada}
                    >
                      <PackagePlus size={12} aria-hidden="true" />
                      Registrar entrada
                    </button>
                  )}
                </div>
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

              {/* Dropdown 1: Categoria raiz */}
              <div style={s.campo}>
                <div style={s.labelComBotao}>
                  <label style={s.label}>Categoria</label>
                  <button
                    type="button"
                    onClick={abrirModalNovaCategoria}
                    style={s.botaoEntrada}
                  >
                    <Plus size={11} aria-hidden="true" />
                    Nova categoria
                  </button>
                </div>
                <select
                  name="categoriaRaizId"
                  value={form.categoriaRaizId}
                  onChange={handleCategoriaRaizChange}
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

              {/* Dropdown 2: Subcategoria — só mostra opções da
                  categoria escolhida acima. Fica desabilitado se a
                  categoria não tiver nenhuma subcategoria cadastrada. */}
              <div style={s.campo}>
                <div style={s.labelComBotao}>
                  <label style={s.label}>Subcategoria</label>
                  {form.categoriaRaizId && (
                    <button
                      type="button"
                      onClick={abrirModalNovaSubcategoria}
                      style={s.botaoEntrada}
                    >
                      <Plus size={11} aria-hidden="true" />
                      Nova subcategoria
                    </button>
                  )}
                </div>
                <select
                  name="subcategoriaId"
                  value={
                    form.categoriaId !== form.categoriaRaizId
                      ? form.categoriaId
                      : ""
                  }
                  onChange={handleSubcategoriaChange}
                  style={s.input}
                  disabled={
                    !form.categoriaRaizId ||
                    subcategoriasDisponiveis.length === 0
                  }
                >
                  <option value="">
                    {subcategoriasDisponiveis.length === 0
                      ? "Sem subcategorias"
                      : "Nenhuma (usar categoria)"}
                  </option>
                  {subcategoriasDisponiveis.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nome}
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

      {/* ─── MINI-MODAL: REGISTRAR ENTRADA DE ESTOQUE ─── */}
      {modalEntradaAberto && (
        <div
          style={s.overlayEntrada}
          onClick={() => setModalEntradaAberto(false)}
        >
          <div
            style={mobile ? { ...s.modalEntrada, padding: "20px 16px" } : s.modalEntrada}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>Registrar entrada</h3>
              <button
                onClick={() => setModalEntradaAberto(false)}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p style={s.produtoNomeEntrada}>{produtoEditando?.nome}</p>
            <p style={s.estoqueAtualTexto}>
              Estoque atual: <strong>{produtoEditando?.estoque}</strong>
            </p>

            <div style={s.campo}>
              <label style={s.label}>Quantidade recebida</label>
              <input
                type="number"
                min="1"
                value={quantidadeEntrada}
                onChange={(e) => setQuantidadeEntrada(e.target.value)}
                style={s.input}
                placeholder="Ex: 20"
                autoFocus
              />
            </div>

            <div style={s.campo}>
              <label style={s.label}>Motivo (opcional)</label>
              <input
                value={motivoEntrada}
                onChange={(e) => setMotivoEntrada(e.target.value)}
                style={s.input}
                placeholder="Ex: Reposição fornecedor"
              />
            </div>

            {erroEntrada && <p style={s.erro}>{erroEntrada}</p>}

            <div style={s.modalBotoes}>
              <button
                onClick={() => setModalEntradaAberto(false)}
                style={s.botaoCancelar}
              >
                Cancelar
              </button>
              <button onClick={handleRegistrarEntrada} style={s.botaoSalvar}>
                Confirmar entrada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MINI-MODAL: NOVA CATEGORIA ─── */}
      {modalNovaCategoriaAberto && (
        <div
          style={s.overlayEntrada}
          onClick={() => setModalNovaCategoriaAberto(false)}
        >
          <div
            style={mobile ? { ...s.modalEntrada, padding: "20px 16px" } : s.modalEntrada}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>Nova categoria</h3>
              <button
                onClick={() => setModalNovaCategoriaAberto(false)}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div style={s.campo}>
              <label style={s.label}>Nome</label>
              <input
                value={nomeNovaCategoria}
                onChange={(e) => setNomeNovaCategoria(e.target.value)}
                style={s.input}
                placeholder="Ex: Perfumes, Bebidas..."
                autoFocus
              />
            </div>

            {erroNovaCategoria && <p style={s.erro}>{erroNovaCategoria}</p>}

            <div style={s.modalBotoes}>
              <button
                onClick={() => setModalNovaCategoriaAberto(false)}
                style={s.botaoCancelar}
              >
                Cancelar
              </button>
              <button onClick={handleCriarCategoria} style={s.botaoSalvar}>
                Criar categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MINI-MODAL: NOVA SUBCATEGORIA ─── */}
      {modalNovaSubcategoriaAberto && (
        <div
          style={s.overlayEntrada}
          onClick={() => setModalNovaSubcategoriaAberto(false)}
        >
          <div
            style={mobile ? { ...s.modalEntrada, padding: "20px 16px" } : s.modalEntrada}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>
                Nova subcategoria de {categoriaRaizSelecionada?.nome}
              </h3>
              <button
                onClick={() => setModalNovaSubcategoriaAberto(false)}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div style={s.campo}>
              <label style={s.label}>Nome</label>
              <input
                value={nomeNovaSubcategoria}
                onChange={(e) => setNomeNovaSubcategoria(e.target.value)}
                style={s.input}
                placeholder="Ex: Masculino, Feminino..."
                autoFocus
              />
            </div>

            {erroNovaSubcategoria && (
              <p style={s.erro}>{erroNovaSubcategoria}</p>
            )}

            <div style={s.modalBotoes}>
              <button
                onClick={() => setModalNovaSubcategoriaAberto(false)}
                style={s.botaoCancelar}
              >
                Cancelar
              </button>
              <button onClick={handleCriarSubcategoria} style={s.botaoSalvar}>
                Criar subcategoria
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
  headerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
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
  tabelaScroll: { overflowX: "auto" },
  tabela: { width: "100%", minWidth: "620px", borderCollapse: "collapse" },
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
  tdSub: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "var(--color-text-secondary)",
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
  labelComBotao: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  botaoEntrada: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    border: "none",
    borderRadius: "var(--border-radius-sm)",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
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

  // ─── Mini-modal Registrar Entrada ───
  overlayEntrada: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100, // acima do modal de edição
  },
  modalEntrada: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "24px",
    width: "100%",
    maxWidth: "360px",
  },
  produtoNomeEntrada: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 4px",
  },
  estoqueAtualTexto: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    margin: "0 0 16px",
  },
};
