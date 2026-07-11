import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Wallet, X } from "lucide-react";

export default function ContasReceber() {
  const { usuario } = useAuth();
  const role = usuario?.role;
  const podeReceberPagamento = role === "ADMIN" || role === "GERENTE";

  const [contas, setContas] = useState([]);
  const [totalGeralDevido, setTotalGeralDevido] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarContas();
  }, []);

  async function carregarContas() {
    try {
      const res = await api.get("/contas-receber");
      setContas(res.data.contas);
      setTotalGeralDevido(res.data.totalGeralDevido);
    } catch (error) {
      setErro("Erro ao carregar contas a receber");
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalPagamento(conta) {
    setVendaSelecionada(conta);
    setValorPagamento("");
    setErroModal("");
    setModalAberto(true);
  }

  async function handleRegistrarPagamento() {
    setErroModal("");
    const valor = parseFloat(valorPagamento);

    if (!valor || valor <= 0) {
      setErroModal("Informe um valor válido");
      return;
    }
    if (valor > vendaSelecionada.saldoDevedor + 0.01) {
      setErroModal(
        `Valor maior que o saldo devedor (R$ ${vendaSelecionada.saldoDevedor.toFixed(2)})`,
      );
      return;
    }

    setSalvando(true);
    try {
      await api.post("/contas-receber/pagamento", {
        saleId: vendaSelecionada.saleId,
        valor,
      });
      setModalAberto(false);
      carregarContas();
    } catch (error) {
      setErroModal(
        error.response?.data?.error || "Erro ao registrar pagamento",
      );
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.titulo}>
          <Wallet size={20} style={s.tituloIcon} aria-hidden="true" />
          Contas a Receber
        </h2>
        <div style={s.totalGeral}>
          <span style={s.totalGeralLabel}>Total a receber</span>
          <span style={s.totalGeralValor}>
            R$ {totalGeralDevido.toFixed(2)}
          </span>
        </div>
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

      {contas.length === 0 ? (
        <div style={s.vazioContainer}>
          <p style={s.vazio}>Nenhuma venda a prazo em aberto</p>
        </div>
      ) : (
        contas.map((conta) => (
          <div key={conta.saleId} style={s.contaCard}>
            <div style={s.contaHeader}>
              <div>
                <p style={s.contaCliente}>
                  {conta.cliente?.nome || "Cliente não identificado"}
                </p>
                <p style={s.contaInfo}>
                  Venda #{conta.saleId} — {formatarData(conta.data_venda)} —
                  Total: R$ {conta.valorTotal.toFixed(2)}
                </p>
              </div>
              <div style={s.saldoBox}>
                <span style={s.saldoLabel}>Saldo devedor</span>
                <span style={s.saldoValor}>
                  R$ {conta.saldoDevedor.toFixed(2)}
                </span>
              </div>
            </div>

            <div style={s.parcelasContainer}>
              {conta.parcelas.map((parcela) => (
                <div key={parcela.id} style={s.parcelaRow}>
                  <div>
                    <p style={s.parcelaNumero}>
                      Parcela {parcela.numero} de {conta.parcelas.length}
                    </p>
                    <p style={s.parcelaVencimento}>
                      {parcela.status === "PAGA"
                        ? "Quitada"
                        : `Vence ${formatarData(parcela.dataVencimento)}`}
                      {parcela.diasAtraso > 0 &&
                        ` — ${parcela.diasAtraso} dias em atraso`}
                    </p>
                  </div>
                  <div style={s.parcelaDireita}>
                    <span style={s.parcelaValor}>
                      R$ {parcela.valorAtual.toFixed(2)}
                      {parcela.valorAtual !== parcela.valorOriginal &&
                        parcela.status === "PENDENTE" && (
                          <span style={s.valorOriginalRiscado}>
                            {" "}
                            (era R$ {parcela.valorOriginal.toFixed(2)})
                          </span>
                        )}
                    </span>
                    <span
                      style={
                        parcela.status === "PAGA"
                          ? s.badgePaga
                          : parcela.diasAtraso > 0
                            ? s.badgeAtrasada
                            : s.badgePendente
                      }
                    >
                      {parcela.status === "PAGA"
                        ? "Paga"
                        : parcela.diasAtraso > 0
                          ? "Atrasada"
                          : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {podeReceberPagamento && conta.saldoDevedor > 0 && (
              <button
                onClick={() => abrirModalPagamento(conta)}
                style={s.botaoReceber}
              >
                Registrar pagamento
              </button>
            )}
          </div>
        ))
      )}

      {/* ─── MODAL REGISTRAR PAGAMENTO ─── */}
      {modalAberto && (
        <div style={s.overlay} onClick={() => setModalAberto(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>Registrar pagamento</h3>
              <button
                onClick={() => setModalAberto(false)}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p style={s.modalCliente}>{vendaSelecionada?.cliente?.nome}</p>
            <p style={s.modalSaldo}>
              Saldo devedor:{" "}
              <strong>R$ {vendaSelecionada?.saldoDevedor.toFixed(2)}</strong>
            </p>

            <div style={s.campo}>
              <label style={s.label}>Valor recebido</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={valorPagamento}
                onChange={(e) => setValorPagamento(e.target.value)}
                style={s.input}
                placeholder="Ex: 150.00"
                autoFocus
              />
            </div>

            <p style={s.avisoRedistribuicao}>
              Se o valor pago for maior que a parcela mais próxima, o restante é
              abatido igualmente das parcelas futuras.
            </p>

            {erroModal && <p style={s.erro}>{erroModal}</p>}

            <div style={s.modalBotoes}>
              <button
                onClick={() => setModalAberto(false)}
                style={s.botaoCancelar}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarPagamento}
                style={s.botaoSalvar}
                disabled={salvando}
              >
                {salvando ? "Registrando..." : "Confirmar pagamento"}
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
  totalGeral: {
    backgroundColor: "var(--color-warning-bg)",
    borderRadius: "var(--border-radius-md)",
    padding: "8px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  totalGeralLabel: {
    fontSize: "11px",
    color: "var(--color-warning-text)",
  },
  totalGeralValor: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--color-warning-text)",
  },
  erro: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "12px",
  },
  vazioContainer: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "40px",
  },
  vazio: {
    textAlign: "center",
    color: "var(--color-text-secondary)",
    fontSize: "13px",
    margin: 0,
  },
  contaCard: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "18px",
    marginBottom: "12px",
  },
  contaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
    paddingBottom: "14px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  },
  contaCliente: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 3px",
  },
  contaInfo: {
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    margin: 0,
  },
  saldoBox: {
    textAlign: "right",
  },
  saldoLabel: {
    display: "block",
    fontSize: "11px",
    color: "var(--color-text-secondary)",
  },
  saldoValor: {
    display: "block",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--color-warning-text)",
  },
  parcelasContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  parcelaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "var(--color-background-secondary)",
    borderRadius: "var(--border-radius-md)",
  },
  parcelaNumero: {
    fontSize: "12.5px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: 0,
  },
  parcelaVencimento: {
    fontSize: "11.5px",
    color: "var(--color-text-secondary)",
    margin: "2px 0 0",
  },
  parcelaDireita: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  parcelaValor: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
  },
  valorOriginalRiscado: {
    fontSize: "11px",
    color: "var(--color-text-muted)",
    fontWeight: "400",
    textDecoration: "line-through",
  },
  badgePaga: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "10.5px",
    fontWeight: "500",
  },
  badgePendente: {
    backgroundColor: "var(--color-badge-blue-bg)",
    color: "var(--color-badge-blue-text)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "10.5px",
    fontWeight: "500",
  },
  badgeAtrasada: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "10.5px",
    fontWeight: "500",
  },
  botaoReceber: {
    width: "100%",
    backgroundColor: "var(--color-text-info)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--border-radius-md)",
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
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
    maxWidth: "400px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
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
  modalCliente: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 4px",
  },
  modalSaldo: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    margin: "0 0 16px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
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
  avisoRedistribuicao: {
    fontSize: "11.5px",
    color: "var(--color-text-secondary)",
    lineHeight: "1.5",
    margin: "0 0 12px",
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
