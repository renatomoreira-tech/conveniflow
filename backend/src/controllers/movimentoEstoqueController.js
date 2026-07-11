const prisma = require("../database");

// ═══════════════════════════════════════════════════════
// MOVIMENTO DE ESTOQUE CONTROLLER
//
// Todo movimento (entrada ou saída) atualiza o campo `estoque` do
// Product na mesma transação que grava o registro no histórico —
// isso garante que os dois nunca ficam dessincronizados (o número
// atual sempre bate com a soma dos movimentos).
// ═══════════════════════════════════════════════════════

// ─── REGISTRAR ENTRADA DE ESTOQUE ────────────────────────
// Usado pelo botão "+ Registrar entrada" na tela de Produtos.
async function registrarEntrada(req, res) {
  try {
    const { lojaId, id: userId } = req.usuario;
    const { productId, quantidade, motivo } = req.body;

    if (!quantidade || quantidade <= 0) {
      return res
        .status(400)
        .json({ error: "Quantidade deve ser maior que zero" });
    }

    // Confirma que o produto pertence à loja do usuário antes de mexer
    const product = await prisma.product.findFirst({
      where: { id: Number(productId), lojaId },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Cria o registro do movimento e atualiza o estoque do produto
    // na mesma transação — se uma parte falhar, a outra é desfeita.
    const resultado = await prisma.$transaction(async (tx) => {
      const movimento = await tx.movimentoEstoque.create({
        data: {
          productId: product.id,
          tipo: "ENTRADA",
          quantidade,
          motivo: motivo || null,
          userId,
        },
      });

      const produtoAtualizado = await tx.product.update({
        where: { id: product.id },
        data: { estoque: { increment: quantidade } },
      });

      return { movimento, produtoAtualizado };
    });

    return res.status(201).json(resultado);
  } catch (error) {
    console.error("Erro ao registrar entrada de estoque:", error);
    return res
      .status(500)
      .json({ error: "Erro ao registrar entrada de estoque" });
  }
}

// ─── HISTÓRICO DE MOVIMENTOS DE UM PRODUTO ───────────────
async function getHistoricoPorProduto(req, res) {
  try {
    const { productId } = req.params;
    const { lojaId } = req.usuario;

    // Confirma que o produto é da loja do usuário antes de expor
    // o histórico dele.
    const product = await prisma.product.findFirst({
      where: { id: Number(productId), lojaId },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const movimentos = await prisma.movimentoEstoque.findMany({
      where: { productId: Number(productId) },
      orderBy: { data: "desc" },
      include: {
        user: { select: { nome: true } },
      },
    });

    return res.json(movimentos);
  } catch (error) {
    console.error("Erro ao buscar histórico de estoque:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar histórico de estoque" });
  }
}

module.exports = { registrarEntrada, getHistoricoPorProduto };
