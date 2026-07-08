const prisma = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "conveniflow_secret";

// ─── LISTAR USUÁRIOS ─────────────────────────────────────
async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        usuario: true,
        ativo: true,
        createdAt: true,
        precisaTrocarSenha: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}

// ─── BUSCAR USUÁRIO POR ID ───────────────────────────────
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nome: true,
        usuario: true,
        ativo: true,
        createdAt: true,
        precisaTrocarSenha: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}

// ─── CRIAR USUÁRIO ───────────────────────────────────────
// Novo usuário sempre nasce com precisaTrocarSenha = true,
// forçando a troca no primeiro acesso.
async function createUser(req, res) {
  try {
    const { nome, usuario, senha } = req.body;

    const usuarioExistente = await prisma.user.findUnique({
      where: { usuario },
    });
    if (usuarioExistente) {
      return res.status(409).json({ error: "Nome de usuário já cadastrado" });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        nome,
        usuario,
        senha: senhaCriptografada,
        precisaTrocarSenha: true,
      },
      select: {
        id: true,
        nome: true,
        usuario: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}

// ─── ATUALIZAR USUÁRIO ───────────────────────────────────
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nome, usuario } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { nome, usuario },
      select: {
        id: true,
        nome: true,
        usuario: true,
      },
    });

    return res.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
}

// ─── DESATIVAR USUÁRIO (soft delete) ────────────────────
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id: Number(id) },
      data: { ativo: false },
    });

    return res.json({ message: "Usuário desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return res.status(500).json({ error: "Erro ao desativar usuário" });
  }
}

// ─── RESETAR SENHA (ADMIN/GERENTE) ───────────────────────
// Define uma nova senha temporária e força a troca no próximo login.
async function resetarSenha(req, res) {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 4) {
      return res
        .status(400)
        .json({ error: "A senha deve ter ao menos 4 caracteres" });
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        senha: senhaCriptografada,
        precisaTrocarSenha: true,
      },
    });

    return res.json({
      message: "Senha redefinida. O usuário deverá trocá-la no próximo login.",
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return res.status(500).json({ error: "Erro ao resetar senha" });
  }
}

// ─── TROCAR SENHA (o próprio usuário, após login) ────────
async function trocarSenha(req, res) {
  try {
    const userId = req.usuario.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 4) {
      return res
        .status(400)
        .json({ error: "A nova senha deve ter ao menos 4 caracteres" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        senha: novaSenhaCriptografada,
        precisaTrocarSenha: false,
      },
    });

    return res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    return res.status(500).json({ error: "Erro ao trocar senha" });
  }
}

// ─── LOGIN ───────────────────────────────────────────────
async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    const user = await prisma.user.findUnique({
      where: { usuario },
      include: {
        lojas: {
          include: { loja: true },
        },
        negocio: true, // para pegar modulosAtivos
      },
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Por enquanto assume a primeira loja vinculada como "loja atual".
    // Quando o seletor de loja existir, isso passa a ser escolhido
    // pelo usuário e enviado a cada requisição.
    const vinculoAtual = user.lojas[0];
    const role = vinculoAtual?.role ?? "CAIXA";
    const lojaId = vinculoAtual?.lojaId ?? null;

    const token = jwt.sign(
      {
        id: user.id,
        nome: user.nome,
        isSuperAdmin: user.isSuperAdmin,
        role,
        lojaId,
        negocioId: user.negocioId,
      },
      SECRET,
      { expiresIn: "8h" },
    );

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        usuario: user.usuario,
        role,
        lojaId,
        precisaTrocarSenha: user.precisaTrocarSenha,
        // Lista de módulos que o negócio deste usuário tem ativados
        // (ex: ["produtos","vendas","clientes"]). O frontend usa isso
        // para decidir quais itens mostrar no menu lateral.
        modulosAtivos: user.negocio?.modulosAtivos ?? [],
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  resetarSenha,
  trocarSenha,
};
