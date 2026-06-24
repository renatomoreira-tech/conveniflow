const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash("123456", 10);
  const user = await prisma.user.create({
    data: {
      nome: "Renato",
      email: "renato@email.com",
      senha: senha,
      role: "ADMIN",
    },
  });
  console.log("Usuário criado!", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
