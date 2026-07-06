import { useState, useEffect } from "react";
import api from "../services/api";
import { Users, Plus, X } from "lucide-react";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    observacoes: "",
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (error) {
      setErro("Erro ao carregar clientes");
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(cliente = null) {
    if (cliente) {
      setClienteEditando(cliente);
      setForm({
        nome: cliente.nome,
        telefone: cliente.telefone || "",
        observacoes: cliente.observacoes || "",
      });
    } else {
      setClienteEditando(null);
      setForm({ nome: "", telefone: "", observacoes: "" });
    }
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setClienteEditando(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSalvar() {
    if (!form.nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }
    try {
      if (clienteEditando) {
        await api.put(`/clientes/${clienteEditando.id}`, form);
      } else {
        await api.post("/clientes", form);
      }
      fecharModal();
      carregarClientes();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao salvar cliente");
    }
  }

  async function handleDesativar(id) {
    if (!confirm("Deseja desativar este cliente?")) return;
    try {
      await api.delete(`/clientes/${id}`);
      carregarClientes();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao desativar cliente");
    }
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.titulo}>
          <Users size={20} style={s.tituloIcon} aria-hidden="true" />
          Clientes
        </h2>
        <button onClick={() => abrirModal()} style={s.botaoNovo}>
          <Plus size={14} aria-hidden="true" />
          Novo Cliente
        </button>
      </div>

      {erro && !modalAberto && <p style={s.erroGeral}>{erro}</p>}

      <div style={s.tabelaContainer}>
        <table style={s.tabela}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Nome</th>
              <th style={s.th}>Telefone</th>
              <th style={s.th}>Em aberto</th>
              <th style={s.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="4" style={s.vazio}>
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} style={s.tr}>
                  <td style={s.td}>{cliente.nome}</td>
                  <td style={s.td}>{cliente.telefone || "—"}</td>
                  <td style={s.td}>
                    {cliente.totalDevido > 0 ? (
                      <span style={s.badgeDevendo}>
                        R$ {cliente.totalDevido.toFixed(2)}
                      </span>
                    ) : (
                      <span style={s.badgeOk}>Em dia</span>
                    )}
                  </td>
                  <td style={s.td}>
                    <button
                      onClick={() => abrirModal(cliente)}
                      style={s.botaoEditar}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDesativar(cliente.id)}
                      style={s.botaoDesativar}
                    >
                      Desativar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={s.overlay} onClick={fecharModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitulo}>
                {clienteEditando ? "Editar Cliente" : "Novo Cliente"}
              </h3>
              <button
                onClick={fecharModal}
                style={s.botaoFechar}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div style={s.campo}>
              <label style={s.label}>Nome</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                style={s.input}
                placeholder="Nome do cliente"
              />
            </div>

            <div style={s.campo}>
              <label style={s.label}>Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                style={s.input}
                placeholder="51999999999"
              />
            </div>

            <div style={s.campo}>
              <label style={s.label}>Observações</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                style={{ ...s.input, ...s.textarea }}
                placeholder="Opcional"
              />
            </div>

            {erro && <p style={s.erro}>{erro}</p>}

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
  badgeOk: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  badgeDevendo: {
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
  vazio: {
    padding: "40px",
    textAlign: "center",
    color: "var(--color-text-secondary)",
  },
  erroGeral: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
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
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "28px",
    width: "100%",
    maxWidth: "440px",
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
  textarea: {
    resize: "vertical",
    minHeight: "60px",
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
