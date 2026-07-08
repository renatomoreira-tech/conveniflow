// prisma/seed.js
//
// Popula o banco com dados iniciais para desenvolvimento/teste,
// já na estrutura multi-tenant (Negocio > Loja > tudo mais).
//
// Rodar com: node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // ─── NEGÓCIO DE TESTE ─────────────────────────────────
  const negocio = await prisma.negocio.create({
    data: {
      nome: "GestorFlow Demo",
      modulosAtivos: [
        "produtos",
        "vendas",
        "categorias",
        "fornecedores",
        "caixa",
        "relatorios",
        "clientes",
      ],
    },
  });
  console.log(`Negócio criado: ${negocio.nome} (id: ${negocio.id})`);

  // ─── LOJA ÚNICA ────────────────────────────────────────
  const loja = await prisma.loja.create({
    data: {
      nome: "Loja Principal",
      negocioId: negocio.id,
    },
  });
  console.log(`Loja criada: ${loja.nome} (id: ${loja.id})`);

  // ─── USUÁRIO ADMIN (login: admin / senha: admin123) ────
  const senhaHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      nome: "Administrador",
      usuario: "admin",
      senha: senhaHash,
      negocioId: negocio.id,
      isSuperAdmin: false,
    },
  });
  console.log(`Usuário criado: ${admin.usuario} (senha: admin123)`);

  // Vincula o admin à loja com role ADMIN
  await prisma.usuarioLoja.create({
    data: {
      userId: admin.id,
      lojaId: loja.id,
      role: "ADMIN",
    },
  });

  await prisma.usuarioNegocio.create({
    data: {
      userId: admin.id,
      negocioId: negocio.id,
    },
  });

  // ─── USUÁRIO DEMO (login: demo / senha: demo123) ───────
  const demoSenhaHash = await bcrypt.hash("demo123", 10);
  const demo = await prisma.user.create({
    data: {
      nome: "Usuário Demo",
      usuario: "demo",
      senha: demoSenhaHash,
      negocioId: negocio.id,
      isSuperAdmin: false,
    },
  });
  console.log(`Usuário criado: ${demo.usuario} (senha: demo123)`);

  await prisma.usuarioLoja.create({
    data: {
      userId: demo.id,
      lojaId: loja.id,
      role: "CAIXA",
    },
  });

  await prisma.usuarioNegocio.create({
    data: {
      userId: demo.id,
      negocioId: negocio.id,
    },
  });

  // ─── CATEGORIA DE EXEMPLO ───────────────────────────────
  const categoria = await prisma.categoria.create({
    data: { nome: "Bebidas", lojaId: loja.id },
  });

  // ─── PRODUTO DE EXEMPLO ─────────────────────────────────
  await prisma.product.create({
    data: {
      nome: "Coca-Cola 2L",
      preco: 7.99,
      precoCusto: 5.0,
      estoque: 20,
      estoqueMinimo: 5,
      lojaId: loja.id,
      categoriaId: categoria.id,
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
