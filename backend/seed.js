const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.create({
    data: {
      nome: "Visitante",
      email: "demo@conveniflow.com",
      senha: senha,
      role: "CAIXA",
    },
  });
  console.log("Usuário demo criado!", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
