import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../services/api";
import { Receipt, Plus, X } from "lucide-react";

export default function Vendas() {
  const { usuario } = useAuth();
  const role = usuario?.role;
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [itens, setItens] = useState([{ productId: "", quantidade: 1 }]);
  const [formaPagamento, setFormaPagamento] = useState("DINHEIRO");
  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [vendasRes, produtosRes] = await Promise.all([
        api.get("/sales"),
        api.get("/products"),
      ]);
      setVendas(vendasRes.data);
      setProdutos(produtosRes.data);
    } catch (error) {
      setErro("Erro ao carregar dados");
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setItens([{ productId: "", quantidade: 1 }]);
    setFormaPagamento("DINHEIRO");
    setDesconto(0);
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function adicionarItem() {
    setItens([...itens, { productId: "", quantidade: 1 }]);
  }

  function removerItem(index) {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== index));
  }

  function atualizarItem(index, campo, valor) {
    const novos = [...itens];
    novos[index][campo] = valor;
    setItens(novos);
  }

  function calcularTotal() {
    let total = 0;
    for (const item of itens) {
      const produto = produtos.find((p) => p.id === parseInt(item.productId));
      if (produto) {
        total += produto.preco * item.quantidade;
      }
    }
    return total - desconto;
  }

  async function handleRegistrarVenda() {
    setErro("");
    setSucesso("");

    const itensValidos = itens.filter((i) => i.productId && i.quantidade > 0);
    if (itensValidos.length === 0) {
      setErro("Adicione ao menos um produto à venda");
      return;
    }

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      await api.post("/sales", {
        userId: usuario.id,
        formaPagamento,
        desconto,
        itens: itensValidos.map((i) => ({
          productId: parseInt(i.productId),
          quantidade: parseInt(i.quantidade),
        })),
      });

      setSucesso("Venda registrada com sucesso!");
      setModalAberto(false);
      carregarDados();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao registrar venda");
    }
  }

  async function handleCancelarVenda(id) {
    if (!confirm("Deseja cancelar esta venda?")) return;
    try {
      await api.patch(`/sales/${id}/cancelar`);
      carregarDados();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao cancelar venda");
    }
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      {/* ─── HEADER ─── */}
      <div style={s.header}>
        <h2 style={s.titulo}>
          <Receipt size={20} style={s.tituloIcon} aria-hidden="true" />
          Vendas
        </h2>
        <button onClick={abrirModal} style={s.botaoNovo}>
          <Plus size={14} aria-hidden="true" />
          Nova Venda
        </button>
      </div>

      {sucesso && <p style={s.sucesso}>{sucesso}</p>}

      {/* ─── TABELA DE VENDAS ─── */}
      <div style={s.tabelaContainer}>
        <table style={s.tabela}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>#</th>
              <th style={s.th}>Data</th>
              <th style={s.th}>Operador</th>
              <th style={s.th}>Itens</th>
              <th style={s.th}>Pagamento</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan="8" style={s.vazio}>
                  Nenhuma venda registrada
                </td>
              </tr>
            ) : (
              vendas.map((venda) => (
                <tr key={venda.id} style={s.tr}>
                  <td style={s.td}>#{venda.id}</td>
                  <td style={s.td}>
                    {new Date(venda.data_venda).toLocaleDateString("pt-BR")}{" "}
                    {new Date(venda.data_venda).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={s.td}>{venda.user?.nome || "—"}</td>
                  <td style={s.td}>
                    {venda.itens.map((item) => (
                      <div key={item.id} style={s.item}>
                        {item.product?.nome} x{item.quantidade}
                      </div>
                    ))}
                  </td>
                  <td style={s.td}>
                    <span style={s.pagamento}>
                      {venda.formaPagamento.replace("_", " ")}
                    </span>
                  </td>
                  <td style={s.td}>
                    <strong>R$ {venda.valor_total.toFixed(2)}</strong>
                  </td>
                  <td style={s.td}>
                    <span
                      style={
                        venda.status === "CONCLUIDA"
                          ? s.statusConcluida
                          : s.statusCancelada
                      }
                    >
                      {venda.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    {venda.status === "CONCLUIDA" &&
                      (role === "ADMIN" || role === "GERENTE") && (
                        <button
                          onClick={() => handleCancelarVenda(venda.id)}
                          style={s.botaoCancelar}
                        >
                          Cancelar
                        </button>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL NOVA VENDA ─── */}
      {modalAberto && (
        <div style={s.overlay} onClick={() => setModalAberto(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>Nova Venda</h3>
              <button
                onClick={() => setModalAberto(false)}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* ─── ITENS ─── */}
            <div style={s.secao}>
              <h4 style={s.secaoTitulo}>Produtos</h4>
              {itens.map((item, index) => (
                <div key={index} style={s.itemRow}>
                  <select
                    value={item.productId}
                    onChange={(e) =>
                      atualizarItem(index, "productId", e.target.value)
                    }
                    style={s.selectProduto}
                  >
                    <option value="">Selecione...</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — R$ {p.preco.toFixed(2)} (est: {p.estoque})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(index, "quantidade", e.target.value)
                    }
                    style={s.inputQtd}
                    placeholder="Qtd"
                  />
                  <button
                    onClick={() => removerItem(index)}
                    style={s.botaoRemover}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button onClick={adicionarItem} style={s.botaoAdicionarItem}>
                <Plus size={13} aria-hidden="true" />
                Adicionar produto
              </button>
            </div>

            {/* ─── PAGAMENTO ─── */}
            <div style={s.secao}>
              <h4 style={s.secaoTitulo}>Pagamento</h4>
              <div style={s.pagamentoGrid}>
                <div style={s.campo}>
                  <label style={s.label}>Forma de pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    style={s.input}
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO_DEBITO">Cartão Débito</option>
                    <option value="CARTAO_CREDITO">Cartão Crédito</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Desconto (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={desconto}
                    onChange={(e) =>
                      setDesconto(parseFloat(e.target.value) || 0)
                    }
                    style={s.input}
                  />
                </div>
              </div>
            </div>

            {/* ─── TOTAL ─── */}
            <div style={s.totalBox}>
              <span style={s.totalLabel}>Total da venda:</span>
              <span style={s.totalValor}>R$ {calcularTotal().toFixed(2)}</span>
            </div>

            {erro && <p style={s.erro}>{erro}</p>}

            <div style={s.modalBotoes}>
              <button
                onClick={() => setModalAberto(false)}
                style={s.botaoCancelarModal}
              >
                Cancelar
              </button>
              <button onClick={handleRegistrarVenda} style={s.botaoSalvar}>
                Registrar Venda
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
    verticalAlign: "top",
  },
  item: {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    marginBottom: "2px",
  },
  pagamento: {
    backgroundColor: "var(--color-badge-blue-bg)",
    color: "var(--color-badge-blue-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  statusConcluida: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  statusCancelada: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  botaoCancelar: {
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
  sucesso: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "12px",
    borderRadius: "var(--border-radius-md)",
    textAlign: "center",
    marginBottom: "16px",
    fontSize: "13px",
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
  secao: { marginBottom: "20px" },
  secaoTitulo: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--color-text-secondary)",
    marginBottom: "10px",
  },
  itemRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    alignItems: "center",
  },
  selectProduto: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-primary)",
    fontSize: "13px",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  inputQtd: {
    width: "64px",
    padding: "9px 10px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-primary)",
    fontSize: "13px",
    textAlign: "center",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  botaoRemover: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "8px 10px",
    cursor: "pointer",
    display: "flex",
  },
  botaoAdicionarItem: {
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    border: "0.5px solid var(--color-border-primary)",
    borderRadius: "var(--border-radius-md)",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "inherit",
  },
  pagamentoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
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
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--color-background-secondary)",
    borderRadius: "var(--border-radius-md)",
    padding: "16px",
    marginBottom: "16px",
  },
  totalLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
  },
  totalValor: {
    fontSize: "22px",
    fontWeight: "600",
    color: "var(--color-text-info)",
  },
  erro: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "12px",
  },
  modalBotoes: { display: "flex", justifyContent: "flex-end", gap: "10px" },
  botaoCancelarModal: {
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
