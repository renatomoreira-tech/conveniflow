const prisma = require("../database");

// ═══════════════════════════════════════════════════════
// SALE CONTROLLER
//
// Venda pertence a uma LOJA específica (lojaId) — cada loja tem
// seu próprio estoque físico e seu próprio caixa, então não faz
// sentido misturar vendas de lojas diferentes aqui.
//
// Já o Cliente (clienteId) é opcional e pertence ao NEGÓCIO inteiro
// (ver clienteController) — um cliente da Jaque pode ser vinculado
// a uma venda em qualquer uma das 4 lojas dela.
//
// O userId (quem registrou a venda) não vem mais do req.body —
// antes o frontend enviava isso manualmente, o que permitiria
// alguém "assinar" uma venda em nome de outro usuário só mudando
// o valor enviado. Agora vem sempre do token JWT (req.usuario.id),
// que é assinado pelo servidor e não pode ser falsificado.
// ═══════════════════════════════════════════════════════

// ─── CRIAR VENDA ─────────────────────────────────────────
// Body esperado agora:
// {
//   "formaPagamento": "DINHEIRO",
//   "desconto": 0,
//   "clienteId": 5,          // opcional — venda sem cliente identificado
//   "itens": [
//     { "productId": 1, "quantidade": 2 },
//     { "productId": 3, "quantidade": 1 }
//   ]
// }
// (userId e lojaId não são mais enviados pelo cliente — vêm do token)
async function createSale(req, res) {
  try {
    const { id: userId, lojaId } = req.usuario;
    const { formaPagamento, desconto = 0, clienteId, itens } = req.body;

    if (!itens || itens.length === 0) {
      return res
        .status(400)
        .json({ error: "A venda deve ter ao menos um item" });
    }

    // Busca os produtos SÓ dentro da loja do usuário — impede que
    // alguém monte uma venda usando o ID de um produto de outra loja
    // (o que bagunçaria o estoque de uma loja que nem participou
    // dessa venda).
    const productIds = itens.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, ativo: true, lojaId },
    });

    // Se o cliente foi informado, confirma que ele pertence ao
    // mesmo negócio do usuário logado (não a outro negócio qualquer).
    if (clienteId) {
      const { negocioId } = req.usuario;
      const cliente = await prisma.cliente.findFirst({
        where: { id: clienteId, negocioId },
      });
      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
    }

    // Valida estoque de cada item
    for (const item of itens) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return res
          .status(404)
          .json({
            error: `Produto ID ${item.productId} não encontrado nesta loja`,
          });
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

    // Cria a venda e os itens em uma única transação — se algo
    // falhar no meio (ex: erro ao atualizar estoque), tudo é
    // desfeito, evitando venda registrada sem baixa de estoque.
    const sale = await prisma.$transaction(async (tx) => {
      const novaVenda = await tx.sale.create({
        data: {
          userId,
          lojaId,
          clienteId: clienteId ?? null,
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
// Sempre filtrado pela loja do usuário logado.
async function getSales(req, res) {
  try {
    const { lojaId } = req.usuario;

    const sales = await prisma.sale.findMany({
      where: { lojaId },
      orderBy: { data_venda: "desc" },
      include: {
        user: { select: { id: true, nome: true } },
        cliente: { select: { id: true, nome: true } },
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
    const { lojaId } = req.usuario;

    const sale = await prisma.sale.findFirst({
      where: { id: Number(id), lojaId },
      include: {
        user: { select: { id: true, nome: true } },
        cliente: { select: { id: true, nome: true } },
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
    const { lojaId } = req.usuario;

    const sale = await prisma.sale.findFirst({
      where: { id: Number(id), lojaId },
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
    const { lojaId } = req.usuario;
    const { inicio, fim } = req.query;

    const sales = await prisma.sale.findMany({
      where: {
        lojaId,
        status: "CONCLUIDA",
        data_venda: {
          gte: new Date(inicio),
          lte: new Date(fim),
        },
      },
      orderBy: { data_venda: "desc" },
      include: {
        user: { select: { nome: true } },
        cliente: { select: { nome: true } },
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
// dias de pouco movimento). Sempre da loja do usuário logado.
async function getResumoHoje(req, res) {
  try {
    const { lojaId } = req.usuario;

    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date();
    fim.setHours(23, 59, 59, 999);

    const [vendasHoje, ultimasVendas] = await Promise.all([
      prisma.sale.findMany({
        where: {
          lojaId,
          status: "CONCLUIDA",
          data_venda: { gte: inicio, lte: fim },
        },
      }),
      prisma.sale.findMany({
        where: { lojaId, status: "CONCLUIDA" },
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
