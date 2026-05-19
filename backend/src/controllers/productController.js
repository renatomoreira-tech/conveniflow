const prisma = require("../database");

// ─── CRIAR PRODUTO ───────────────────────────────────────
async function createProduct(req, res) {
  try {
    const {
      nome,
      preco,
      precoCusto,
      estoque,
      estoqueMinimo,
      codigoBarras,
      categoriaId,
      fornecedorId,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        nome,
        preco,
        precoCusto,
        estoque: estoque ?? 0,
        estoqueMinimo: estoqueMinimo ?? 5,
        codigoBarras,
        categoriaId,
        fornecedorId,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({ error: "Erro ao criar produto" });
  }
}

// ─── LISTAR PRODUTOS ─────────────────────────────────────
async function getProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      include: {
        categoria: true,
        fornecedor: true,
      },
    });

    return res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
}

// ─── BUSCAR PRODUTO POR ID ───────────────────────────────
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
        fornecedor: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
}

// ─── ATUALIZAR PRODUTO ───────────────────────────────────
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      nome,
      preco,
      precoCusto,
      estoque,
      estoqueMinimo,
      codigoBarras,
      categoriaId,
      fornecedorId,
    } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        nome,
        preco,
        precoCusto,
        estoque,
        estoqueMinimo,
        codigoBarras,
        categoriaId,
        fornecedorId,
      },
    });

    return res.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return res.status(500).json({ error: "Erro ao atualizar produto" });
  }
}

// ─── DESATIVAR PRODUTO (soft delete) ────────────────────
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });

    return res.json({ message: "Produto desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar produto:", error);
    return res.status(500).json({ error: "Erro ao desativar produto" });
  }
}

// ─── PRODUTOS COM ESTOQUE BAIXO ──────────────────────────
async function getLowStockProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: {
        ativo: true,
        estoque: { lte: prisma.product.fields.estoqueMinimo },
      },
    });

    return res.json(products);
  } catch (error) {
    console.error("Erro ao buscar estoque baixo:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar produtos com estoque baixo" });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
};
