const prisma = require("../database");

// ─── CRIAR PRODUTO ───────────────────────────────────────
async function createProduct(req, res) {
  try {
    const { lojaId } = req.usuario;
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
        lojaId,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({ error: "Erro ao criar produto" });
  }
}

// ─── LISTAR PRODUTOS ─────────────────────────────────────
// Sempre filtrado pela loja do usuário logado (via token).
async function getProducts(req, res) {
  try {
    const { lojaId } = req.usuario;

    const products = await prisma.product.findMany({
      where: { ativo: true, lojaId },
      include: {
        categoria: {
          include: { categoriaPai: true }, // para montar "Perfumes > Masculino" no frontend
        },
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
// Garante que o produto pertence à loja do usuário — evita que
// alguém acesse /products/123 de outra loja só trocando o ID na URL.
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const { lojaId } = req.usuario;

    const product = await prisma.product.findFirst({
      where: { id: Number(id), lojaId },
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
    const { lojaId } = req.usuario;
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

    // updateMany + where com lojaId garante que só atualiza se o
    // produto realmente pertencer à loja do usuário logado.
    const resultado = await prisma.product.updateMany({
      where: { id: Number(id), lojaId },
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

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
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
    const { lojaId } = req.usuario;

    const resultado = await prisma.product.updateMany({
      where: { id: Number(id), lojaId },
      data: { ativo: false },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json({ message: "Produto desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar produto:", error);
    return res.status(500).json({ error: "Erro ao desativar produto" });
  }
}

// ─── PRODUTOS COM ESTOQUE BAIXO ──────────────────────────
async function getLowStockProducts(req, res) {
  try {
    const { lojaId } = req.usuario;

    // Prisma não permite comparar duas colunas direto no findMany,
    // então busca tudo da loja e filtra em JS.
    const products = await prisma.product.findMany({
      where: { ativo: true, lojaId },
    });

    const comEstoqueBaixo = products.filter(
      (p) => p.estoque <= p.estoqueMinimo,
    );

    return res.json(comEstoqueBaixo);
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
