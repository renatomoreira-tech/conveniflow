const prisma = require("../database");

// ═══════════════════════════════════════════════════════
// NEGOCIO CONTROLLER
//
// Por enquanto, só gerencia os módulos ativos do negócio do
// próprio usuário logado (não permite editar outro negócio).
// Isso é suficiente para o ADMIN de cada negócio configurar o
// próprio sistema, sem expor dados de outros negócios.
// ═══════════════════════════════════════════════════════

const MODULOS_DISPONIVEIS = [
  "produtos",
  "vendas",
  "categorias",
  "fornecedores",
  "caixa",
  "relatorios",
  "clientes",
];

// ─── BUSCAR O NEGÓCIO DO USUÁRIO LOGADO ──────────────────
async function getMeuNegocio(req, res) {
  try {
    const { negocioId } = req.usuario;

    if (!negocioId) {
      return res
        .status(404)
        .json({ error: "Usuário não pertence a um negócio" });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: { id: true, nome: true, modulosAtivos: true },
    });

    if (!negocio) {
      return res.status(404).json({ error: "Negócio não encontrado" });
    }

    return res.json({ ...negocio, modulosDisponiveis: MODULOS_DISPONIVEIS });
  } catch (error) {
    console.error("Erro ao buscar negócio:", error);
    return res.status(500).json({ error: "Erro ao buscar negócio" });
  }
}

// ─── ATUALIZAR MÓDULOS ATIVOS ────────────────────────────
// Só ADMIN pode mexer (checado na rota, via middleware autorizar).
async function atualizarModulos(req, res) {
  try {
    const { negocioId } = req.usuario;
    const { modulosAtivos } = req.body;

    if (!Array.isArray(modulosAtivos)) {
      return res
        .status(400)
        .json({ error: "modulosAtivos deve ser uma lista" });
    }

    // Filtra qualquer valor que não seja um módulo reconhecido —
    // evita que o campo fique poluído com strings inválidas caso
    // o frontend envie algo inesperado.
    const modulosValidos = modulosAtivos.filter((m) =>
      MODULOS_DISPONIVEIS.includes(m),
    );

    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: { modulosAtivos: modulosValidos },
      select: { id: true, nome: true, modulosAtivos: true },
    });

    return res.json(negocio);
  } catch (error) {
    console.error("Erro ao atualizar módulos:", error);
    return res.status(500).json({ error: "Erro ao atualizar módulos" });
  }
}

module.exports = { getMeuNegocio, atualizarModulos };
