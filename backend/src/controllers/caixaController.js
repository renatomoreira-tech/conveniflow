const prisma = require("../database");

// ─── ABRIR CAIXA ─────────────────────────────────────────
async function abrirCaixa(req, res) {
  try {
    const { valorInicial } = req.body;

    // Verifica se já há um caixa aberto
    const caixaAberto = await prisma.caixa.findFirst({
      where: { status: "ABERTO" },
    });

    if (caixaAberto) {
      return res.status(400).json({ error: "Já existe um caixa aberto" });
    }

    const caixa = await prisma.caixa.create({
      data: { valorInicial },
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
    const { valorFinal } = req.body;

    const caixa = await prisma.caixa.findUnique({
      where: { id: Number(id) },
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
async function getCaixas(req, res) {
  try {
    const caixas = await prisma.caixa.findMany({
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
    const caixa = await prisma.caixa.findFirst({
      where: { status: "ABERTO" },
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
