const prisma = require("../database");

// ═══════════════════════════════════════════════════════
// FORNECEDOR CONTROLLER
//
// Assim como Categoria e Product, Fornecedor pertence a uma Loja
// específica (não ao Negócio inteiro) — cada loja física tem seus
// próprios fornecedores cadastrados, mesmo que sejam duas lojas do
// mesmo dono.
//
// Toda operação aqui usa `req.usuario.lojaId`, que vem do token JWT
// gerado no login (ver userController.login). Isso garante que o
// filtro de loja não pode ser manipulado pelo cliente — o valor
// nunca vem do req.body ou de query params, sempre do token
// assinado pelo servidor.
// ═══════════════════════════════════════════════════════

// ─── LISTAR FORNECEDORES ─────────────────────────────────
// Retorna só os fornecedores da loja do usuário logado.
async function getFornecedores(req, res) {
  try {
    const { lojaId } = req.usuario;

    const fornecedores = await prisma.fornecedor.findMany({
      where: { lojaId },
      include: { _count: { select: { produtos: true } } },
    });
    return res.json(fornecedores);
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error);
    return res.status(500).json({ error: "Erro ao buscar fornecedores" });
  }
}

// ─── BUSCAR FORNECEDOR POR ID ────────────────────────────
// Usa findFirst (não findUnique) com lojaId no where, porque
// precisamos confirmar que o fornecedor pertence à loja do usuário
// antes de retornar qualquer dado. Sem essa checagem, um usuário
// da Loja Centro poderia acessar /fornecedores/5 mesmo que o
// fornecedor 5 seja da Loja Norte, só sabendo o ID.
async function getFornecedorById(req, res) {
  try {
    const { id } = req.params;
    const { lojaId } = req.usuario;

    const fornecedor = await prisma.fornecedor.findFirst({
      where: { id: Number(id), lojaId },
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
// O fornecedor criado é automaticamente vinculado à loja do
// usuário logado — ele nunca escolhe a loja manualmente, isso
// evitaria erro (ou má-fé) de cadastrar na loja errada.
async function createFornecedor(req, res) {
  try {
    const { lojaId } = req.usuario;
    const { nome, telefone, email } = req.body;

    const fornecedor = await prisma.fornecedor.create({
      data: { nome, telefone, email, lojaId },
    });

    return res.status(201).json(fornecedor);
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error);
    return res.status(500).json({ error: "Erro ao criar fornecedor" });
  }
}

// ─── ATUALIZAR FORNECEDOR ────────────────────────────────
// updateMany (em vez de update) permite combinar o id com o lojaId
// no mesmo where. Se o fornecedor existir mas for de outra loja,
// count retorna 0 e sabemos que não é "não encontrado" por acaso —
// é porque não pertence a essa loja.
async function updateFornecedor(req, res) {
  try {
    const { id } = req.params;
    const { lojaId } = req.usuario;
    const { nome, telefone, email } = req.body;

    const resultado = await prisma.fornecedor.updateMany({
      where: { id: Number(id), lojaId },
      data: { nome, telefone, email },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    // updateMany não retorna o registro atualizado, então buscamos
    // de novo para devolver os dados completos ao frontend.
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
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
    const { lojaId } = req.usuario;

    // Primeiro confirma que o fornecedor é da loja do usuário —
    // sem isso, alguém poderia excluir um fornecedor de outra loja
    // só adivinhando o ID.
    const fornecedor = await prisma.fornecedor.findFirst({
      where: { id: Number(id), lojaId },
    });

    if (!fornecedor) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    // Não permite excluir se ainda houver produtos vinculados —
    // evita produtos "órfãos" apontando para um fornecedorId que
    // não existe mais.
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
