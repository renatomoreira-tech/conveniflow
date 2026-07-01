const prisma = require("../database");

// ─── CRIAR VENDA ─────────────────────────────────────────
// Body esperado:
// {
//   "userId": 1,
//   "formaPagamento": "DINHEIRO",
//   "desconto": 0,
//   "itens": [
//     { "productId": 1, "quantidade": 2 },
//     { "productId": 3, "quantidade": 1 }
//   ]
// }
async function createSale(req, res) {
  try {
    const { userId, formaPagamento, desconto = 0, itens } = req.body;

    if (!itens || itens.length === 0) {
      return res
        .status(400)
        .json({ error: "A venda deve ter ao menos um item" });
    }

    // Busca todos os produtos dos itens de uma vez
    const productIds = itens.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, ativo: true },
    });

    // Valida estoque de cada item
    for (const item of itens) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ error: `Produto ID ${item.productId} não encontrado` });
      }

      if (product.estoque < item.quantidade) {
        return res.status(400).json({
          error: `Estoque insuficiente para o produto: ${product.nome}`,
        });
      }
    }

    // Calcula subtotais e valor total
    const itensComSubtotal = itens.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const subtotal = product.preco * item.quantidade;
      return {
        productId: item.productId,
        quantidade: item.quantidade,
        precoUnitario: product.preco,
        subtotal,
      };
    });

    const valorBruto = itensComSubtotal.reduce(
      (acc, item) => acc + item.subtotal,
      0,
    );
    const valor_total = valorBruto - desconto;

    // Cria a venda e os itens em uma única transação
    const sale = await prisma.$transaction(async (tx) => {
      const novaVenda = await tx.sale.create({
        data: {
          userId,
          formaPagamento,
          desconto,
          valor_total,
          itens: {
            create: itensComSubtotal,
          },
        },
        include: { itens: true },
      });

      // Atualiza estoque de cada produto
      for (const item of itens) {
        const product = products.find((p) => p.id === item.productId);
        await tx.product.update({
          where: { id: item.productId },
          data: { estoque: product.estoque - item.quantidade },
        });
      }

      return novaVenda;
    });

    return res.status(201).json(sale);
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    return res.status(500).json({ error: "Erro ao registrar venda" });
  }
}

// ─── LISTAR VENDAS ───────────────────────────────────────
async function getSales(req, res) {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { data_venda: "desc" },
      include: {
        user: { select: { id: true, nome: true } },
        itens: {
          include: {
            product: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return res.json(sales);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return res.status(500).json({ error: "Erro ao buscar vendas" });
  }
}

// ─── BUSCAR VENDA POR ID ─────────────────────────────────
async function getSaleById(req, res) {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, nome: true } },
        itens: {
          include: {
            product: { select: { id: true, nome: true, preco: true } },
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    return res.json(sale);
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    return res.status(500).json({ error: "Erro ao buscar venda" });
  }
}

// ─── CANCELAR VENDA ──────────────────────────────────────
async function cancelSale(req, res) {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: { itens: true },
    });

    if (!sale) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    if (sale.status === "CANCELADA") {
      return res.status(400).json({ error: "Venda já cancelada" });
    }

    // Cancela a venda e devolve o estoque em uma transação
    await prisma.$transaction(async (tx) => {
      await tx.sale.update({
        where: { id: Number(id) },
        data: { status: "CANCELADA" },
      });

      for (const item of sale.itens) {
        await tx.product.update({
          where: { id: item.productId },
          data: { estoque: { increment: item.quantidade } },
        });
      }
    });

    return res.json({
      message: "Venda cancelada e estoque devolvido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar venda:", error);
    return res.status(500).json({ error: "Erro ao cancelar venda" });
  }
}

// ─── RELATÓRIO DE VENDAS POR PERÍODO (ADMIN/GERENTE) ─────
async function getSalesByPeriod(req, res) {
  try {
    const { inicio, fim } = req.query;

    const sales = await prisma.sale.findMany({
      where: {
        status: "CONCLUIDA",
        data_venda: {
          gte: new Date(inicio),
          lte: new Date(fim),
        },
      },
      orderBy: { data_venda: "desc" },
      include: {
        user: { select: { nome: true } },
        itens: { include: { product: { select: { nome: true } } } },
      },
    });

    const totalPeriodo = sales.reduce((acc, sale) => acc + sale.valor_total, 0);

    return res.json({ totalPeriodo, quantidade: sales.length, sales });
  } catch (error) {
    console.error("Erro ao buscar vendas por período:", error);
    return res.status(500).json({ error: "Erro ao buscar vendas por período" });
  }
}

// ─── RESUMO DE HOJE (TODOS OS PERFIS) ────────────────────
// Versão enxuta para o Dashboard: números agregados do dia
// (vendas, pedidos, ticket médio) + as 5 últimas vendas em
// geral (não só de hoje, para o card nunca ficar vazio em
// dias de pouco movimento). Liberada para ADMIN, GERENTE e CAIXA.
async function getResumoHoje(req, res) {
  try {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date();
    fim.setHours(23, 59, 59, 999);

    const [vendasHoje, ultimasVendas] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: "CONCLUIDA",
          data_venda: { gte: inicio, lte: fim },
        },
      }),
      prisma.sale.findMany({
        where: { status: "CONCLUIDA" },
        orderBy: { data_venda: "desc" },
        take: 5,
        include: {
          user: { select: { nome: true } },
          itens: { include: { product: { select: { nome: true } } } },
        },
      }),
    ]);

    const totalHoje = vendasHoje.reduce(
      (acc, sale) => acc + sale.valor_total,
      0,
    );

    return res.json({
      totalHoje,
      quantidade: vendasHoje.length,
      ultimasVendas,
    });
  } catch (error) {
    console.error("Erro ao buscar resumo do dia:", error);
    return res.status(500).json({ error: "Erro ao buscar resumo do dia" });
  }
}

module.exports = {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
  getSalesByPeriod,
  getResumoHoje,
};
