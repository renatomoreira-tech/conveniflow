/*
  Warnings:

  - You are about to drop the column `dataVencimento` on the `Sale` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'PAGA');

-- AlterTable
ALTER TABLE "PagamentoFiado" ADD COLUMN     "parcelaId" INTEGER;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "dataVencimento";

-- CreateTable
CREATE TABLE "ParcelaFiado" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorOriginal" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION NOT NULL,
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',
    "saleId" INTEGER NOT NULL,

    CONSTRAINT "ParcelaFiado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParcelaFiado" ADD CONSTRAINT "ParcelaFiado_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoFiado" ADD CONSTRAINT "PagamentoFiado_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "ParcelaFiado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
