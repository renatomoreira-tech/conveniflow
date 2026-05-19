const prisma = require("../database");

// ─── LISTAR CATEGORIAS ───────────────────────────────────
async function getCategorias(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
      include: { _count: { select: { produtos: true } } },
    });
    return res.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return res.status(500).json({ error: "Erro ao buscar categorias" });
  }
}

// ─── CRIAR CATEGORIA ─────────────────────────────────────
async function createCategoria(req, res) {
  try {
    const { nome } = req.body;

    const existente = await prisma.categoria.findUnique({ where: { nome } });
    if (existente) {
      return res.status(409).json({ error: "Categoria já cadastrada" });
    }

    const categoria = await prisma.categoria.create({ data: { nome } });
    return res.status(201).json(categoria);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return res.status(500).json({ error: "Erro ao criar categoria" });
  }
}

// ─── ATUALIZAR CATEGORIA ─────────────────────────────────
async function updateCategoria(req, res) {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    const categoria = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nome },
    });

    return res.json(categoria);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
}

// ─── DELETAR CATEGORIA ───────────────────────────────────
async function deleteCategoria(req, res) {
  try {
    const { id } = req.params;

    // Verifica se há produtos vinculados
    const produtos = await prisma.product.count({
      where: { categoriaId: Number(id) },
    });

    if (produtos > 0) {
      return res.status(400).json({
        error: "Não é possível excluir categoria com produtos vinculados",
      });
    }

    await prisma.categoria.delete({ where: { id: Number(id) } });
    return res.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return res.status(500).json({ error: "Erro ao excluir categoria" });
  }
}

module.exports = {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
