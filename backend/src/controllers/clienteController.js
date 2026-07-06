const prisma = require("../database");

// ─── CRIAR CLIENTE ───────────────────────────────────────
async function createCliente(req, res) {
  try {
    const { nome, telefone, observacoes } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const cliente = await prisma.cliente.create({
      data: { nome: nome.trim(), telefone, observacoes },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

// ─── LISTAR CLIENTES ─────────────────────────────────────
// Inclui o total devido em vendas PENDENTES de cada cliente,
// já preparando o terreno para a funcionalidade de fiado.
async function getClientes(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { ativo: true },
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
async function getClienteById(req, res) {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
      include: {
        sales: {
          orderBy: { data_venda: "desc" },
          include: {
            itens: { include: { product: { select: { nome: true } } } },
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
    const { nome, telefone, observacoes } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id: Number(id) },
      data: { nome, telefone, observacoes },
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

    await prisma.cliente.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });

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
