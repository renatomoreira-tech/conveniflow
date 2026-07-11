-- AlterTable
ALTER TABLE "Negocio" ADD COLUMN     "diaVencimentoFiado" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "dataVencimento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PagamentoFiado" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PagamentoFiado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PagamentoFiado" ADD CONSTRAINT "PagamentoFiado_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoFiado" ADD CONSTRAINT "PagamentoFiado_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
