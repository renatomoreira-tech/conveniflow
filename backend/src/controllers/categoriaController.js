const prisma = require("../database");

// ─── LISTAR CATEGORIAS ───────────────────────────────────
async function getCategorias(req, res) {
  try {
    const { lojaId } = req.usuario;

    const categorias = await prisma.categoria.findMany({
      where: { lojaId },
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
    const { lojaId } = req.usuario;
    const { nome } = req.body;

    // O nome é único por loja (não mais globalmente), então a
    // checagem de duplicidade precisa considerar a lojaId também.
    const existente = await prisma.categoria.findFirst({
      where: { nome, lojaId },
    });
    if (existente) {
      return res.status(409).json({ error: "Categoria já cadastrada" });
    }

    const categoria = await prisma.categoria.create({
      data: { nome, lojaId },
    });
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
    const { lojaId } = req.usuario;
    const { nome } = req.body;

    const resultado = await prisma.categoria.updateMany({
      where: { id: Number(id), lojaId },
      data: { nome },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: Number(id) },
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
    const { lojaId } = req.usuario;

    // Confirma que a categoria pertence à loja do usuário antes de mexer
    const categoria = await prisma.categoria.findFirst({
      where: { id: Number(id), lojaId },
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

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
