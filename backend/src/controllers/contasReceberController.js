const prisma = require("../database");

// ═══════════════════════════════════════════════════════
// CONTAS A RECEBER CONTROLLER
//
// Gerencia vendas "a prazo" parceladas: listagem consolidada por
// parcela, e o registro de pagamentos com a lógica de abatimento
// e redistribuição descrita abaixo.
//
// REGRA DE ABATIMENTO (definida com o usuário):
// 1. Um pagamento sempre abate primeiro a parcela PENDENTE mais
//    próxima do vencimento (a mais antiga).
// 2. Se o valor pago for maior que o valorAtual dessa parcela, ela
//    é quitada (status PAGA) e o EXCEDENTE é redistribuído
//    igualmente entre as parcelas futuras ainda PENDENTES,
//    reduzindo o valorAtual de cada uma.
// 3. Se todas as parcelas ficarem PAGAS, a Sale inteira vira
//    CONCLUIDA.
//
// Exemplo: venda R$300 em 3x de R$100 (ago/set/out). Pagamento de
// R$150 registrado antes do vencimento de agosto:
//   - Parcela ago (R$100): quitada, sobra R$50
//   - R$50 dividido pelas 2 parcelas restantes (set, out) = R$25
//     de abatimento em cada uma
//   - Parcela set: R$100 - R$25 = R$75
//   - Parcela out: R$100 - R$25 = R$75
// ═══════════════════════════════════════════════════════

// ─── LISTAR CONTAS A RECEBER ──────────────────────────────
// Retorna todas as parcelas PENDENTES da loja, agrupadas por
// venda/cliente, com dias de atraso calculados em relação a hoje.
async function getContasReceber(req, res) {
  try {
    const { lojaId } = req.usuario;

    const vendas = await prisma.sale.findMany({
      where: { lojaId, status: "PENDENTE" },
      orderBy: { data_venda: "desc" },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        parcelas: { orderBy: { numero: "asc" } },
      },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const contas = vendas.map((venda) => {
      const parcelas = venda.parcelas.map((parcela) => {
        let diasAtraso = 0;
        if (parcela.status === "PENDENTE" && parcela.dataVencimento < hoje) {
          const diffMs = hoje - new Date(parcela.dataVencimento);
          diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
        return {
          id: parcela.id,
          numero: parcela.numero,
          dataVencimento: parcela.dataVencimento,
          valorOriginal: parcela.valorOriginal,
          valorAtual: parcela.valorAtual,
          status: parcela.status,
          diasAtraso,
        };
      });

      const saldoDevedor = parcelas
        .filter((p) => p.status === "PENDENTE")
        .reduce((acc, p) => acc + p.valorAtual, 0);

      return {
        saleId: venda.id,
        cliente: venda.cliente,
        data_venda: venda.data_venda,
        valorTotal: venda.valor_total,
        saldoDevedor,
        parcelas,
      };
    });

    const totalGeralDevido = contas.reduce((acc, c) => acc + c.saldoDevedor, 0);

    return res.json({ contas, totalGeralDevido });
  } catch (error) {
    console.error("Erro ao buscar contas a receber:", error);
    return res.status(500).json({ error: "Erro ao buscar contas a receber" });
  }
}

// ─── REGISTRAR PAGAMENTO ──────────────────────────────────
// Restrito a ADMIN/GERENTE (checado na rota). Aplica a regra de
// abatimento na parcela mais próxima + redistribuição do excedente
// descrita no topo do arquivo.
async function registrarPagamento(req, res) {
  try {
    const { id: userId, lojaId } = req.usuario;
    const { saleId, valor } = req.body;

    if (!valor || valor <= 0) {
      return res
        .status(400)
        .json({ error: "Valor do pagamento deve ser maior que zero" });
    }

    const venda = await prisma.sale.findFirst({
      where: { id: Number(saleId), lojaId, status: "PENDENTE" },
      include: {
        parcelas: {
          where: { status: "PENDENTE" },
          orderBy: { numero: "asc" },
        },
      },
    });

    if (!venda) {
      return res.status(404).json({
        error: "Venda a prazo não encontrada (já pode ter sido quitada)",
      });
    }

    if (venda.parcelas.length === 0) {
      return res
        .status(400)
        .json({ error: "Não há parcelas pendentes nesta venda" });
    }

    const saldoTotalDevido = venda.parcelas.reduce(
      (acc, p) => acc + p.valorAtual,
      0,
    );
    if (valor > saldoTotalDevido + 0.01) {
      return res.status(400).json({
        error: `Valor informado (R$ ${valor.toFixed(2)}) é maior que o saldo devedor total (R$ ${saldoTotalDevido.toFixed(2)})`,
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      let valorRestante = valor;
      const parcelaMaisProxima = venda.parcelas[0];

      await tx.pagamentoFiado.create({
        data: {
          saleId: venda.id,
          parcelaId: parcelaMaisProxima.id,
          valor,
          userId,
        },
      });

      const abatimento = Math.min(valorRestante, parcelaMaisProxima.valorAtual);
      const novoValorParcelaAtual = parcelaMaisProxima.valorAtual - abatimento;
      valorRestante -= abatimento;

      const parcelaQuitada = novoValorParcelaAtual <= 0.01;
      await tx.parcelaFiado.update({
        where: { id: parcelaMaisProxima.id },
        data: {
          valorAtual: parcelaQuitada ? 0 : novoValorParcelaAtual,
          status: parcelaQuitada ? "PAGA" : "PENDENTE",
        },
      });

      if (valorRestante > 0.01) {
        const parcelasFuturas = venda.parcelas.slice(1);

        if (parcelasFuturas.length > 0) {
          const abatimentoPorParcela = valorRestante / parcelasFuturas.length;

          for (const parcela of parcelasFuturas) {
            const novoValor = Math.max(
              0,
              parcela.valorAtual - abatimentoPorParcela,
            );
            await tx.parcelaFiado.update({
              where: { id: parcela.id },
              data: {
                valorAtual: novoValor,
                status: novoValor <= 0.01 ? "PAGA" : "PENDENTE",
              },
            });
          }
        }
      }

      const parcelasAtualizadas = await tx.parcelaFiado.findMany({
        where: { saleId: venda.id },
      });
      const todasPagas = parcelasAtualizadas.every((p) => p.status === "PAGA");

      if (todasPagas) {
        await tx.sale.update({
          where: { id: venda.id },
          data: { status: "CONCLUIDA" },
        });
      }

      return { quitada: todasPagas };
    });

    return res.status(201).json(resultado);
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);
    return res.status(500).json({ error: "Erro ao registrar pagamento" });
  }
}

module.exports = { getContasReceber, registrarPagamento };
