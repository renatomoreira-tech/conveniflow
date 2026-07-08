import { useState, useEffect } from "react";
import api from "../services/api";
import { Settings, Save } from "lucide-react";

// Rótulos amigáveis para cada módulo — o backend trabalha com os
// nomes técnicos (ex: "produtos"), mas a tela mostra em português
// e com contexto do que cada um faz.
const LABELS_MODULOS = {
  produtos: "Produtos",
  vendas: "Vendas",
  categorias: "Categorias",
  fornecedores: "Fornecedores",
  caixa: "Caixa",
  relatorios: "Relatórios",
  clientes: "Clientes",
};

export default function Configuracoes() {
  const [negocio, setNegocio] = useState(null);
  const [modulosDisponiveis, setModulosDisponiveis] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    carregarNegocio();
  }, []);

  async function carregarNegocio() {
    try {
      const res = await api.get("/negocios/meu");
      setNegocio(res.data);
      setModulosDisponiveis(res.data.modulosDisponiveis);
      setSelecionados(res.data.modulosAtivos);
    } catch (error) {
      setErro("Erro ao carregar configurações");
    } finally {
      setCarregando(false);
    }
  }

  function alternarModulo(modulo) {
    setSelecionados((atual) =>
      atual.includes(modulo)
        ? atual.filter((m) => m !== modulo)
        : [...atual, modulo],
    );
  }

  async function handleSalvar() {
    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      await api.patch("/negocios/meu/modulos", { modulosAtivos: selecionados });
      setSucesso(
        "Configurações salvas! Faça login novamente para ver o menu atualizado.",
      );
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao salvar configurações");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p style={s.carregando}>Carregando...</p>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.titulo}>
          <Settings size={20} style={s.tituloIcon} aria-hidden="true" />
          Configurações
        </h2>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitulo}>{negocio?.nome}</h3>
        <p style={s.cardDescricao}>
          Escolha quais módulos aparecem no menu do sistema. Módulos desmarcados
          ficam completamente ocultos para todos os usuários deste negócio.
        </p>

        <div style={s.listaModulos}>
          {modulosDisponiveis.map((modulo) => (
            <label key={modulo} style={s.itemModulo}>
              <input
                type="checkbox"
                checked={selecionados.includes(modulo)}
                onChange={() => alternarModulo(modulo)}
                style={s.checkbox}
              />
              <span style={s.labelModulo}>
                {LABELS_MODULOS[modulo] ?? modulo}
              </span>
            </label>
          ))}
        </div>

        {erro && <p style={s.erro}>{erro}</p>}
        {sucesso && <p style={s.sucesso}>{sucesso}</p>}

        <button
          onClick={handleSalvar}
          style={s.botaoSalvar}
          disabled={salvando}
        >
          <Save size={14} aria-hidden="true" />
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
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
  card: {
    backgroundColor: "var(--color-background-primary)",
    borderRadius: "var(--border-radius-lg)",
    border: "0.5px solid var(--color-border-tertiary)",
    padding: "24px",
    maxWidth: "480px",
  },
  cardTitulo: {
    fontSize: "15px",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    margin: "0 0 6px",
  },
  cardDescricao: {
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    lineHeight: "1.6",
    margin: "0 0 20px",
  },
  listaModulos: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "20px",
  },
  itemModulo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "var(--border-radius-md)",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "var(--color-text-info)",
  },
  labelModulo: {
    fontSize: "13px",
    color: "var(--color-text-primary)",
  },
  erro: {
    color: "var(--color-danger-text)",
    fontSize: "13px",
    marginBottom: "12px",
  },
  sucesso: {
    backgroundColor: "var(--color-badge-green-bg)",
    color: "var(--color-badge-green-text)",
    padding: "10px 12px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "13px",
    marginBottom: "12px",
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
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
  },
  carregando: {
    textAlign: "center",
    marginTop: "40px",
    color: "var(--color-text-secondary)",
  },
};
