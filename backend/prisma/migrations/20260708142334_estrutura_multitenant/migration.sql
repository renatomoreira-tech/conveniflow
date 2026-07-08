/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome,lojaId]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigoBarras,lojaId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuario]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lojaId` to the `Caixa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lojaId` to the `Categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `negocioId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lojaId` to the `Fornecedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lojaId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lojaId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Categoria_nome_key";

-- DropIndex
DROP INDEX "Product_codigoBarras_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Caixa" ADD COLUMN     "lojaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "lojaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "negocioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Fornecedor" ADD COLUMN     "lojaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "lojaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "lojaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "role",
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "negocioId" INTEGER,
ADD COLUMN     "usuario" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Negocio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulosAtivos" TEXT[] DEFAULT ARRAY['produtos', 'vendas', 'categorias', 'fornecedores', 'caixa', 'relatorios', 'clientes']::TEXT[],

    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loja" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "negocioId" INTEGER NOT NULL,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioLoja" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CAIXA',
    "userId" INTEGER NOT NULL,
    "lojaId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioLoja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioNegocio" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "negocioId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioLoja_userId_lojaId_key" ON "UsuarioLoja"("userId", "lojaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioNegocio_userId_negocioId_key" ON "UsuarioNegocio"("userId", "negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_lojaId_key" ON "Categoria"("nome", "lojaId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_codigoBarras_lojaId_key" ON "Product"("codigoBarras", "lojaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_usuario_key" ON "User"("usuario");

-- AddForeignKey
ALTER TABLE "Loja" ADD CONSTRAINT "Loja_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioLoja" ADD CONSTRAINT "UsuarioLoja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioLoja" ADD CONSTRAINT "UsuarioLoja_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioNegocio" ADD CONSTRAINT "UsuarioNegocio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioNegocio" ADD CONSTRAINT "UsuarioNegocio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
