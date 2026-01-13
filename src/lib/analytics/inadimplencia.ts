import { prisma } from '@/lib/prisma'

interface FaixaInadimplencia {
  faixa: string
  quantidade: number
  valor: number
  percentual: number
}

interface Devedor {
  id: string
  nome: string
  valor: number
  diasAtraso: number
  vencimento: Date
}

interface AnaliseInadimplencia {
  totalVencido: number
  quantidadeVencidos: number
  taxaInadimplencia: number
  totalReceber: number
  porFaixa: FaixaInadimplencia[]
  topDevedores: Devedor[]
}

/**
 * Calcula a análise de inadimplência para um tenant
 */
export async function calcularInadimplencia(tenantId: string): Promise<AnaliseInadimplencia> {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Busca todas as contas a receber do tenant
  const contasReceber = await prisma.receivable.findMany({
    where: {
      tenantId,
      status: { in: ['PENDENTE', 'VENCIDO'] },
    },
    include: {
      clienteRef: true,
    },
    orderBy: {
      dataVencimento: 'asc',
    },
  })

  // Filtra contas vencidas
  const contasVencidas = contasReceber.filter(
    (conta) => conta.dataVencimento && new Date(conta.dataVencimento) < hoje
  )

  // Calcula totais
  const totalReceber = contasReceber.reduce((sum, conta) => sum + Number(conta.valor), 0)
  const totalVencido = contasVencidas.reduce((sum, conta) => sum + Number(conta.valor), 0)
  const quantidadeVencidos = contasVencidas.length
  const taxaInadimplencia = totalReceber > 0 ? (totalVencido / totalReceber) * 100 : 0

  // Agrupa por faixa de atraso
  const faixas = {
    '1-30': { quantidade: 0, valor: 0 },
    '31-60': { quantidade: 0, valor: 0 },
    '61-90': { quantidade: 0, valor: 0 },
    '90+': { quantidade: 0, valor: 0 },
  }

  contasVencidas.forEach((conta) => {
    if (!conta.dataVencimento) return

    const diasAtraso = Math.floor(
      (hoje.getTime() - new Date(conta.dataVencimento).getTime()) / (1000 * 60 * 60 * 24)
    )
    const valor = Number(conta.valor)

    if (diasAtraso <= 30) {
      faixas['1-30'].quantidade++
      faixas['1-30'].valor += valor
    } else if (diasAtraso <= 60) {
      faixas['31-60'].quantidade++
      faixas['31-60'].valor += valor
    } else if (diasAtraso <= 90) {
      faixas['61-90'].quantidade++
      faixas['61-90'].valor += valor
    } else {
      faixas['90+'].quantidade++
      faixas['90+'].valor += valor
    }
  })

  const porFaixa: FaixaInadimplencia[] = Object.entries(faixas).map(([faixa, dados]) => ({
    faixa,
    quantidade: dados.quantidade,
    valor: dados.valor,
    percentual: totalVencido > 0 ? (dados.valor / totalVencido) * 100 : 0,
  }))

  // Top 5 devedores
  const devedoresMap = new Map<string, { nome: string; valor: number; diasAtraso: number; vencimento: Date; id: string }>()

  contasVencidas.forEach((conta) => {
    if (!conta.dataVencimento) return

    const clienteId = conta.clienteId || conta.clientId || 'sem-cliente'
    const clienteNome = conta.clienteRef?.nome || conta.cliente || 'Não identificado'
    const diasAtraso = Math.floor(
      (hoje.getTime() - new Date(conta.dataVencimento).getTime()) / (1000 * 60 * 60 * 24)
    )

    const existing = devedoresMap.get(clienteId)
    if (existing) {
      existing.valor += Number(conta.valor)
      if (diasAtraso > existing.diasAtraso) {
        existing.diasAtraso = diasAtraso
        existing.vencimento = new Date(conta.dataVencimento)
      }
    } else {
      devedoresMap.set(clienteId, {
        id: clienteId,
        nome: clienteNome,
        valor: Number(conta.valor),
        diasAtraso,
        vencimento: new Date(conta.dataVencimento),
      })
    }
  })

  const topDevedores: Devedor[] = Array.from(devedoresMap.values())
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)

  return {
    totalVencido,
    quantidadeVencidos,
    taxaInadimplencia: Math.round(taxaInadimplencia * 100) / 100,
    totalReceber,
    porFaixa,
    topDevedores,
  }
}

/**
 * Calcula tendência de inadimplência (últimos 6 meses)
 */
export async function calcularTendenciaInadimplencia(tenantId: string) {
  const resultado = []
  const hoje = new Date()

  for (let i = 5; i >= 0; i--) {
    const dataReferencia = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const primeiroDia = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), 1)
    const ultimoDia = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0)

    const contasVencidas = await prisma.receivable.count({
      where: {
        tenantId,
        status: { in: ['PENDENTE', 'VENCIDO'] },
        dataVencimento: {
          gte: primeiroDia,
          lte: ultimoDia,
        },
      },
    })

    const totalContas = await prisma.receivable.count({
      where: {
        tenantId,
        dataVencimento: {
          gte: primeiroDia,
          lte: ultimoDia,
        },
      },
    })

    resultado.push({
      mes: dataReferencia.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      taxa: totalContas > 0 ? Math.round((contasVencidas / totalContas) * 100) : 0,
      quantidade: contasVencidas,
    })
  }

  return resultado
}
