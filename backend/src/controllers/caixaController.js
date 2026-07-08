const prisma = require("../database");

// ─── ABRIR CAIXA ─────────────────────────────────────────
async function abrirCaixa(req, res) {
  try {
    const { lojaId } = req.usuario;
    const { valorInicial } = req.body;

    // Verifica se já há um caixa aberto NESTA loja especificamente
    // (cada loja tem seu próprio caixa físico, independente das outras).
    const caixaAberto = await prisma.caixa.findFirst({
      where: { status: "ABERTO", lojaId },
    });

    if (caixaAberto) {
      return res
        .status(400)
        .json({ error: "Já existe um caixa aberto nesta loja" });
    }

    const caixa = await prisma.caixa.create({
      data: { valorInicial, lojaId },
    });

    return res.status(201).json(caixa);
  } catch (error) {
    console.error("Erro ao abrir caixa:", error);
    return res.status(500).json({ error: "Erro ao abrir caixa" });
  }
}

// ─── FECHAR CAIXA ────────────────────────────────────────
async function fecharCaixa(req, res) {
  try {
    const { id } = req.params;
    const { lojaId } = req.usuario;
    const { valorFinal } = req.body;

    const caixa = await prisma.caixa.findFirst({
      where: { id: Number(id), lojaId },
    });

    if (!caixa) {
      return res.status(404).json({ error: "Caixa não encontrado" });
    }

    if (caixa.status === "FECHADO") {
      return res.status(400).json({ error: "Caixa já está fechado" });
    }

    const caixaFechado = await prisma.caixa.update({
      where: { id: Number(id) },
      data: {
        valorFinal,
        fechamento: new Date(),
        status: "FECHADO",
      },
    });

    return res.json({
      message: "Caixa fechado com sucesso",
      caixa: caixaFechado,
      diferenca: valorFinal - caixa.valorInicial,
    });
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    return res.status(500).json({ error: "Erro ao fechar caixa" });
  }
}

// ─── LISTAR CAIXAS ───────────────────────────────────────
// Histórico sempre da loja do usuário logado.
async function getCaixas(req, res) {
  try {
    const { lojaId } = req.usuario;

    const caixas = await prisma.caixa.findMany({
      where: { lojaId },
      orderBy: { abertura: "desc" },
    });
    return res.json(caixas);
  } catch (error) {
    console.error("Erro ao buscar caixas:", error);
    return res.status(500).json({ error: "Erro ao buscar caixas" });
  }
}

// ─── CAIXA ATUAL (aberto) ────────────────────────────────
async function getCaixaAtual(req, res) {
  try {
    const { lojaId } = req.usuario;

    const caixa = await prisma.caixa.findFirst({
      where: { status: "ABERTO", lojaId },
    });

    if (!caixa) {
      return res.status(404).json({ error: "Nenhum caixa aberto no momento" });
    }

    return res.json(caixa);
  } catch (error) {
    console.error("Erro ao buscar caixa atual:", error);
    return res.status(500).json({ error: "Erro ao buscar caixa atual" });
  }
}

module.exports = { abrirCaixa, fecharCaixa, getCaixas, getCaixaAtual };
