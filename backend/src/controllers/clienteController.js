const prisma = require("../database");

// ═══════════════════════════════════════════════════════
// CLIENTE CONTROLLER
//
// Diferente de Product/Categoria/Fornecedor/Caixa (que pertencem
// a uma Loja específica), Cliente pertence ao NEGÓCIO inteiro.
//
// Isso reflete uma decisão de negócio: um cliente da Jaque pode
// comprar em qualquer uma das 4 lojas dela, e ela quer enxergar
// o histórico e o total devido daquele cliente de forma unificada,
// não separado por loja.
//
// Por isso, aqui filtramos por `req.usuario.negocioId`, não por
// `lojaId` como nos outros controllers.
// ═══════════════════════════════════════════════════════

// ─── CRIAR CLIENTE ───────────────────────────────────────
async function createCliente(req, res) {
  try {
    const { negocioId } = req.usuario;
    const { nome, telefone, observacoes } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const cliente = await prisma.cliente.create({
      data: { nome: nome.trim(), telefone, observacoes, negocioId },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

// ─── LISTAR CLIENTES ─────────────────────────────────────
// Inclui o total devido em vendas PENDENTES de cada cliente,
// somando vendas de TODAS as lojas do negócio (não só uma).
async function getClientes(req, res) {
  try {
    const { negocioId } = req.usuario;

    const clientes = await prisma.cliente.findMany({
      where: { ativo: true, negocioId },
      orderBy: { nome: "asc" },
      include: {
        sales: {
          where: { status: "PENDENTE" },
          select: { valor_total: true },
        },
      },
    });

    const clientesComDebito = clientes.map((cliente) => {
      const totalDevido = cliente.sales.reduce(
        (acc, sale) => acc + sale.valor_total,
        0,
      );
      const { sales, ...clienteSemSales } = cliente;
      return { ...clienteSemSales, totalDevido };
    });

    return res.json(clientesComDebito);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ error: "Erro ao buscar clientes" });
  }
}

// ─── BUSCAR CLIENTE POR ID (com histórico de compras) ────
// findFirst com negocioId garante que um usuário de um negócio
// nunca acesse o cliente de outro negócio só adivinhando o ID.
async function getClienteById(req, res) {
  try {
    const { id } = req.params;
    const { negocioId } = req.usuario;

    const cliente = await prisma.cliente.findFirst({
      where: { id: Number(id), negocioId },
      include: {
        sales: {
          orderBy: { data_venda: "desc" },
          include: {
            itens: { include: { product: { select: { nome: true } } } },
            loja: { select: { nome: true } }, // mostra em qual loja foi a compra
          },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const totalDevido = cliente.sales
      .filter((sale) => sale.status === "PENDENTE")
      .reduce((acc, sale) => acc + sale.valor_total, 0);

    return res.json({ ...cliente, totalDevido });
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return res.status(500).json({ error: "Erro ao buscar cliente" });
  }
}

// ─── ATUALIZAR CLIENTE ───────────────────────────────────
async function updateCliente(req, res) {
  try {
    const { id } = req.params;
    const { negocioId } = req.usuario;
    const { nome, telefone, observacoes } = req.body;

    const resultado = await prisma.cliente.updateMany({
      where: { id: Number(id), negocioId },
      data: { nome, telefone, observacoes },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    });
    return res.json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
}

// ─── DESATIVAR CLIENTE (soft delete) ─────────────────────
async function deleteCliente(req, res) {
  try {
    const { id } = req.params;
    const { negocioId } = req.usuario;

    const resultado = await prisma.cliente.updateMany({
      where: { id: Number(id), negocioId },
      data: { ativo: false },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.json({ message: "Cliente desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar cliente:", error);
    return res.status(500).json({ error: "Erro ao desativar cliente" });
  }
}

module.exports = {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
};
