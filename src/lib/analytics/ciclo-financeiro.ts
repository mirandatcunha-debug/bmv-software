import { prisma } from '@/lib/prisma'

interface CicloFinanceiroResult {
  pmr: number // Prazo Médio Recebimento (dias)
  pmp: number // Prazo Médio Pagamento (dias)
  cicloOperacional: number // PMR + PME (dias)
  cicloFinanceiro: number // Ciclo Operacional - PMP (dias)
  necessidadeCapitalGiro: number // Valor estimado
  detalhes: {
    totalReceber: number
    totalPagar: number
    receitaMensal: number
    despesaMensal: number
  }
}

export async function calcularCicloFinanceiro(tenantId: string): Promise<CicloFinanceiroResult> {
  const agora = new Date()
  const noventaDiasAtras = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000)

  // Buscar contas a receber (últimos 90 dias)
  const contasReceber = await prisma.receivable.findMany({
    where: {
      tenantId,
      dataEmissao: {
        gte: noventaDiasAtras
      }
    },
    select: {
      valor: true,
      dataEmissao: true,
      dataVencimento: true,
      dataPagamento: true,
      status: true
    }
  })

  // Buscar contas a pagar (últimos 90 dias)
  const contasPagar = await prisma.payable.findMany({
    where: {
      tenantId,
      dataEmissao: {
        gte: noventaDiasAtras
      }
    },
    select: {
      valor: true,
      dataEmissao: true,
      dataVencimento: true,
      dataPagamento: true,
      status: true
    }
  })

  // Calcular PMR (Prazo Médio de Recebimento)
  let somaDiasRecebimento = 0
  let contasPagasReceber = 0

  for (const conta of contasReceber) {
    if (conta.dataPagamento && conta.dataEmissao) {
      const dias = Math.floor(
        (new Date(conta.dataPagamento).getTime() - new Date(conta.dataEmissao).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (dias >= 0) {
        somaDiasRecebimento += dias
        contasPagasReceber++
      }
    }
  }

  const pmr = contasPagasReceber > 0 ? Math.round(somaDiasRecebimento / contasPagasReceber) : 30

  // Calcular PMP (Prazo Médio de Pagamento)
  let somaDiasPagamento = 0
  let contasPagasPagar = 0

  for (const conta of contasPagar) {
    if (conta.dataPagamento && conta.dataEmissao) {
      const dias = Math.floor(
        (new Date(conta.dataPagamento).getTime() - new Date(conta.dataEmissao).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (dias >= 0) {
        somaDiasPagamento += dias
        contasPagasPagar++
      }
    }
  }

  const pmp = contasPagasPagar > 0 ? Math.round(somaDiasPagamento / contasPagasPagar) : 30

  // Totais pendentes
  const totalReceber = contasReceber
    .filter(c => c.status !== 'PAGO')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  const totalPagar = contasPagar
    .filter(c => c.status !== 'PAGO')
    .reduce((acc, c) => acc + Number(c.valor), 0)

  // Receita e despesa mensal média (últimos 3 meses)
  const receitaMensal = contasReceber.reduce((acc, c) => acc + Number(c.valor), 0) / 3
  const despesaMensal = contasPagar.reduce((acc, c) => acc + Number(c.valor), 0) / 3

  // Ciclo Operacional = PMR (considerando PME = 0 para serviços)
  const cicloOperacional = pmr

  // Ciclo Financeiro = Ciclo Operacional - PMP
  const cicloFinanceiro = cicloOperacional - pmp

  // Necessidade de Capital de Giro
  // NCG = (Ciclo Financeiro / 30) * Despesa Mensal
  const necessidadeCapitalGiro = cicloFinanceiro > 0
    ? Math.round((cicloFinanceiro / 30) * despesaMensal)
    : 0

  return {
    pmr,
    pmp,
    cicloOperacional,
    cicloFinanceiro,
    necessidadeCapitalGiro,
    detalhes: {
      totalReceber,
      totalPagar,
      receitaMensal: Math.round(receitaMensal),
      despesaMensal: Math.round(despesaMensal)
    }
  }
}
