const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.sale.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Deletado com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
