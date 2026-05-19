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
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
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
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
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
async function createUser(req, res) {
  try {
    const { nome, email, senha, role } = req.body;

    const emailExistente = await prisma.user.findUnique({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        role: role ?? "CAIXA",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
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
    const { nome, email, role } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { nome, email, role },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
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

// ─── LOGIN ───────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.ativo) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, role: user.role },
      SECRET,
      { expiresIn: "8h" },
    );

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
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
};
