const prisma = require("../database");

// ─── LISTAR FORNECEDORES ─────────────────────────────────
async function getFornecedores(req, res) {
  try {
    const fornecedores = await prisma.fornecedor.findMany({
      include: { _count: { select: { produtos: true } } },
    });
    return res.json(fornecedores);
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error);
    return res.status(500).json({ error: "Erro ao buscar fornecedores" });
  }
}

// ─── BUSCAR FORNECEDOR POR ID ────────────────────────────
async function getFornecedorById(req, res) {
  try {
    const { id } = req.params;

    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
      include: { produtos: { select: { id: true, nome: true, preco: true } } },
    });

    if (!fornecedor) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    return res.json(fornecedor);
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);
    return res.status(500).json({ error: "Erro ao buscar fornecedor" });
  }
}

// ─── CRIAR FORNECEDOR ────────────────────────────────────
async function createFornecedor(req, res) {
  try {
    const { nome, telefone, email } = req.body;

    const fornecedor = await prisma.fornecedor.create({
      data: { nome, telefone, email },
    });

    return res.status(201).json(fornecedor);
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error);
    return res.status(500).json({ error: "Erro ao criar fornecedor" });
  }
}

// ─── ATUALIZAR FORNECEDOR ────────────────────────────────
async function updateFornecedor(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;

    const fornecedor = await prisma.fornecedor.update({
      where: { id: Number(id) },
      data: { nome, telefone, email },
    });

    return res.json(fornecedor);
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    return res.status(500).json({ error: "Erro ao atualizar fornecedor" });
  }
}

// ─── DELETAR FORNECEDOR ──────────────────────────────────
async function deleteFornecedor(req, res) {
  try {
    const { id } = req.params;

    const produtos = await prisma.product.count({
      where: { fornecedorId: Number(id) },
    });

    if (produtos > 0) {
      return res.status(400).json({
        error: "Não é possível excluir fornecedor com produtos vinculados",
      });
    }

    await prisma.fornecedor.delete({ where: { id: Number(id) } });
    return res.json({ message: "Fornecedor excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error);
    return res.status(500).json({ error: "Erro ao excluir fornecedor" });
  }
}

module.exports = {
  getFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
};
