import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../services/api";

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

  if (carregando) return <p style={styles.carregando}>Carregando...</p>;

  return (
    <div style={styles.container}>
      {/* ─── HEADER ─── */}
      <div style={styles.header}>
        <h2 style={styles.titulo}>💰 Vendas</h2>
        <button onClick={abrirModal} style={styles.botaoNovo}>
          + Nova Venda
        </button>
      </div>

      {sucesso && <p style={styles.sucesso}>{sucesso}</p>}

      {/* ─── TABELA DE VENDAS ─── */}
      <div style={styles.tabelaContainer}>
        <table style={styles.tabela}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Operador</th>
              <th style={styles.th}>Itens</th>
              <th style={styles.th}>Pagamento</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.vazio}>
                  Nenhuma venda registrada
                </td>
              </tr>
            ) : (
              vendas.map((venda) => (
                <tr key={venda.id} style={styles.tr}>
                  <td style={styles.td}>#{venda.id}</td>
                  <td style={styles.td}>
                    {new Date(venda.data_venda).toLocaleDateString("pt-BR")}{" "}
                    {new Date(venda.data_venda).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={styles.td}>{venda.user?.nome || "—"}</td>
                  <td style={styles.td}>
                    {venda.itens.map((item) => (
                      <div key={item.id} style={styles.item}>
                        {item.product?.nome} x{item.quantidade}
                      </div>
                    ))}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.pagamento}>
                      {venda.formaPagamento.replace("_", " ")}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong>R$ {venda.valor_total.toFixed(2)}</strong>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        venda.status === "CONCLUIDA"
                          ? styles.statusConcluida
                          : styles.statusCancelada
                      }
                    >
                      {venda.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {venda.status === "CONCLUIDA" &&
                      (role === "ADMIN" || role === "GERENTE") && (
                        <button
                          onClick={() => handleCancelarVenda(venda.id)}
                          style={styles.botaoCancelar}
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
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitulo}>Nova Venda</h3>

            {/* ─── ITENS ─── */}
            <div style={styles.secao}>
              <h4 style={styles.secaoTitulo}>Produtos</h4>
              {itens.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <select
                    value={item.productId}
                    onChange={(e) =>
                      atualizarItem(index, "productId", e.target.value)
                    }
                    style={styles.selectProduto}
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
                    style={styles.inputQtd}
                    placeholder="Qtd"
                  />
                  <button
                    onClick={() => removerItem(index)}
                    style={styles.botaoRemover}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={adicionarItem} style={styles.botaoAdicionarItem}>
                + Adicionar produto
              </button>
            </div>

            {/* ─── PAGAMENTO ─── */}
            <div style={styles.secao}>
              <h4 style={styles.secaoTitulo}>Pagamento</h4>
              <div style={styles.pagamentoGrid}>
                <div style={styles.campo}>
                  <label style={styles.label}>Forma de pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    style={styles.input}
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO_DEBITO">Cartão Débito</option>
                    <option value="CARTAO_CREDITO">Cartão Crédito</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Desconto (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={desconto}
                    onChange={(e) =>
                      setDesconto(parseFloat(e.target.value) || 0)
                    }
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* ─── TOTAL ─── */}
            <div style={styles.totalBox}>
              <span style={styles.totalLabel}>Total da venda:</span>
              <span style={styles.totalValor}>
                R$ {calcularTotal().toFixed(2)}
              </span>
            </div>

            {erro && <p style={styles.erro}>{erro}</p>}

            <div style={styles.modalBotoes}>
              <button
                onClick={() => setModalAberto(false)}
                style={styles.botaoCancelarModal}
              >
                Cancelar
              </button>
              <button onClick={handleRegistrarVenda} style={styles.botaoSalvar}>
                Registrar Venda
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
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#333",
    verticalAlign: "top",
  },
  item: { fontSize: "13px", color: "#555", marginBottom: "2px" },
  pagamento: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusConcluida: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusCancelada: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  botaoCancelar: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "12px",
  },
  vazio: { padding: "40px", textAlign: "center", color: "#888" },
  sucesso: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "16px",
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
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitulo: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: "24px",
  },
  secao: { marginBottom: "24px" },
  secaoTitulo: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "12px",
  },
  itemRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    alignItems: "center",
  },
  selectProduto: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  inputQtd: {
    width: "70px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    textAlign: "center",
  },
  botaoRemover: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
  },
  botaoAdicionarItem: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    marginTop: "4px",
  },
  pagamentoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  campo: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  },
  totalLabel: { fontSize: "16px", fontWeight: "600", color: "#1a1a2e" },
  totalValor: { fontSize: "24px", fontWeight: "bold", color: "#4f46e5" },
  erro: {
    color: "#e53e3e",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "12px",
  },
  modalBotoes: { display: "flex", justifyContent: "flex-end", gap: "12px" },
  botaoCancelarModal: {
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
