const prisma = require("../database");

// ─── LISTAR CATEGORIAS ───────────────────────────────────
// Retorna só as categorias RAIZ (categoriaPaiId: null), cada uma
// já trazendo suas subcategorias aninhadas. O frontend usa isso
// para montar a árvore visual sem precisar de uma segunda chamada.
async function getCategorias(req, res) {
  try {
    const { lojaId } = req.usuario;

    const categorias = await prisma.categoria.findMany({
      where: { lojaId, categoriaPaiId: null },
      include: {
        _count: { select: { produtos: true } },
        subcategorias: {
          include: {
            _count: { select: { produtos: true } },
          },
        },
      },
    });
    return res.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return res.status(500).json({ error: "Erro ao buscar categorias" });
  }
}

// ─── CRIAR CATEGORIA ─────────────────────────────────────
// Aceita categoriaPaiId opcional para criar uma subcategoria.
// Regra: só permite 2 níveis — uma subcategoria NÃO pode virar
// pai de outra (impede Categoria > Sub > Sub-sub).
async function createCategoria(req, res) {
  try {
    const { lojaId } = req.usuario;
    const { nome, categoriaPaiId } = req.body;

    if (categoriaPaiId) {
      // Confirma que a categoria-pai existe, pertence à mesma loja,
      // e que ELA MESMA não é uma subcategoria (ou seja, ela precisa
      // ser uma categoria raiz — isso é o que limita a 2 níveis).
      const pai = await prisma.categoria.findFirst({
        where: { id: Number(categoriaPaiId), lojaId },
      });

      if (!pai) {
        return res.status(404).json({ error: "Categoria-pai não encontrada" });
      }

      if (pai.categoriaPaiId) {
        return res.status(400).json({
          error:
            "Não é possível criar uma subcategoria dentro de outra subcategoria",
        });
      }
    }

    // O nome é único por loja e por pai — permite repetir o mesmo
    // nome de subcategoria em pais diferentes (ex: "Masculino" tanto
    // em "Perfumes" quanto em "Roupas").
    const existente = await prisma.categoria.findFirst({
      where: {
        nome,
        lojaId,
        categoriaPaiId: categoriaPaiId ? Number(categoriaPaiId) : null,
      },
    });
    if (existente) {
      return res.status(409).json({ error: "Categoria já cadastrada" });
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        lojaId,
        categoriaPaiId: categoriaPaiId ? Number(categoriaPaiId) : null,
      },
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

    // Verifica se há subcategorias vinculadas — sem essa checagem,
    // apagar uma categoria-pai deixaria as subcategorias "órfãs"
    // (apontando para um categoriaPaiId que não existe mais).
    const subcategorias = await prisma.categoria.count({
      where: { categoriaPaiId: Number(id) },
    });

    if (subcategorias > 0) {
      return res.status(400).json({
        error: "Não é possível excluir categoria com subcategorias vinculadas",
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
