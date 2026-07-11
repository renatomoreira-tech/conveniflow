/*
  Warnings:

  - A unique constraint covering the columns `[nome,lojaId,categoriaPaiId]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Categoria_nome_lojaId_key";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "categoriaPaiId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_lojaId_categoriaPaiId_key" ON "Categoria"("nome", "lojaId", "categoriaPaiId");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_categoriaPaiId_fkey" FOREIGN KEY ("categoriaPaiId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
