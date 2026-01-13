import { prisma } from '@/lib/prisma'
import { calcularInadimplencia } from './inadimplencia'
import { calcularCicloFinanceiro } from './ciclo-financeiro'

type Classificacao = 'Crítico' | 'Atenção' | 'Saudável' | 'Excelente'

interface Fator {
  nome: string
  valor: number
  peso: number
  pontuacao: number
  status: 'critico' | 'atencao' | 'bom' | 'excelente'
}

interface HealthScoreResult {
  score: number
  classificacao: Classificacao
  fatores: {
    liquidez: Fator
    inadimplencia: Fator
    margem: Fator
    crescimento: Fator
  }
  recomendacoes: string[]
}

function calcularStatusFator(pontuacao: number): 'critico' | 'atencao' | 'bom' | 'excelente' {
  if (pontuacao < 40) return 'critico'
  if (pontuacao < 60) return 'atencao'
  if (pontuacao < 80) return 'bom'
  return 'excelente'
}

function calcularClassificacao(score: number): Classificacao {
  if (score < 40) return 'Crítico'
  if (score < 60) return 'Atenção'
  if (score < 80) return 'Saudável'
  return 'Excelente'
}

export async function calcularHealthScore(tenantId: string): Promise<HealthScoreResult> {
  // Buscar dados necessários
  const [inadimplencia, cicloFinanceiro] = await Promise.all([
    calcularInadimplencia(tenantId),
    calcularCicloFinanceiro(tenantId),
  ])

  // Buscar receitas dos últimos 6 meses para calcular crescimento e margem
  const hoje = new Date()
  const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1)
  const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1)

  const receitasPrimeiroPeriodo = await prisma.receivable.aggregate({
    where: {
      tenantId,
      status: 'PAGO',
      dataPagamento: {
        gte: seisMesesAtras,
        lt: tresMesesAtras,
      },
    },
    _sum: { valor: true },
  })

  const receitasSegundoPeriodo = await prisma.receivable.aggregate({
    where: {
      tenantId,
      status: 'PAGO',
      dataPagamento: {
        gte: tresMesesAtras,
        lte: hoje,
      },
    },
    _sum: { valor: true },
  })

  const despesasPeriodo = await prisma.payable.aggregate({
    where: {
      tenantId,
      status: 'PAGO',
      dataPagamento: {
        gte: tresMesesAtras,
        lte: hoje,
      },
    },
    _sum: { valor: true },
  })

  // 1. LIQUIDEZ (30%) - Baseado na relação receber/pagar
  const totalReceber = cicloFinanceiro.detalhes.totalReceber
  const totalPagar = cicloFinanceiro.detalhes.totalPagar
  const indiceLiquidez = totalPagar > 0 ? totalReceber / totalPagar : totalReceber > 0 ? 2 : 1

  let pontuacaoLiquidez: number
  if (indiceLiquidez >= 1.5) pontuacaoLiquidez = 100
  else if (indiceLiquidez >= 1.2) pontuacaoLiquidez = 80
  else if (indiceLiquidez >= 1.0) pontuacaoLiquidez = 60
  else if (indiceLiquidez >= 0.8) pontuacaoLiquidez = 40
  else pontuacaoLiquidez = 20

  // 2. INADIMPLÊNCIA (25%) - Taxa de inadimplência
  const taxaInadimplencia = inadimplencia.taxaInadimplencia

  let pontuacaoInadimplencia: number
  if (taxaInadimplencia <= 2) pontuacaoInadimplencia = 100
  else if (taxaInadimplencia <= 5) pontuacaoInadimplencia = 80
  else if (taxaInadimplencia <= 10) pontuacaoInadimplencia = 60
  else if (taxaInadimplencia <= 20) pontuacaoInadimplencia = 40
  else pontuacaoInadimplencia = 20

  // 3. MARGEM (25%) - Margem operacional
  const receitaTotal = Number(receitasSegundoPeriodo._sum.valor) || 0
  const despesaTotal = Number(despesasPeriodo._sum.valor) || 0
  const margemOperacional = receitaTotal > 0 ? ((receitaTotal - despesaTotal) / receitaTotal) * 100 : 0

  let pontuacaoMargem: number
  if (margemOperacional >= 20) pontuacaoMargem = 100
  else if (margemOperacional >= 10) pontuacaoMargem = 80
  else if (margemOperacional >= 5) pontuacaoMargem = 60
  else if (margemOperacional >= 0) pontuacaoMargem = 40
  else pontuacaoMargem = 20

  // 4. CRESCIMENTO (20%) - Comparação período atual vs anterior
  const receitaAnterior = Number(receitasPrimeiroPeriodo._sum.valor) || 0
  const receitaAtual = Number(receitasSegundoPeriodo._sum.valor) || 0
  const taxaCrescimento = receitaAnterior > 0 ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100 : 0

  let pontuacaoCrescimento: number
  if (taxaCrescimento >= 15) pontuacaoCrescimento = 100
  else if (taxaCrescimento >= 5) pontuacaoCrescimento = 80
  else if (taxaCrescimento >= 0) pontuacaoCrescimento = 60
  else if (taxaCrescimento >= -10) pontuacaoCrescimento = 40
  else pontuacaoCrescimento = 20

  // Calcular score final (ponderado)
  const score = Math.round(
    pontuacaoLiquidez * 0.30 +
    pontuacaoInadimplencia * 0.25 +
    pontuacaoMargem * 0.25 +
    pontuacaoCrescimento * 0.20
  )

  // Gerar recomendações baseadas nos fatores fracos
  const recomendacoes: string[] = []

  if (pontuacaoLiquidez < 60) {
    recomendacoes.push('Melhore a liquidez: negocie prazos maiores com fornecedores ou antecipe recebíveis')
  }
  if (pontuacaoInadimplencia < 60) {
    recomendacoes.push('Reduza a inadimplência: implemente cobrança preventiva e reavalie política de crédito')
  }
  if (pontuacaoMargem < 60) {
    recomendacoes.push('Aumente a margem: revise custos operacionais e considere reajuste de preços')
  }
  if (pontuacaoCrescimento < 60) {
    recomendacoes.push('Acelere o crescimento: invista em marketing e prospecção de novos clientes')
  }

  if (recomendacoes.length === 0) {
    recomendacoes.push('Continue monitorando os indicadores para manter a saúde financeira')
  }

  return {
    score,
    classificacao: calcularClassificacao(score),
    fatores: {
      liquidez: {
        nome: 'Liquidez',
        valor: Math.round(indiceLiquidez * 100) / 100,
        peso: 30,
        pontuacao: pontuacaoLiquidez,
        status: calcularStatusFator(pontuacaoLiquidez),
      },
      inadimplencia: {
        nome: 'Inadimplência',
        valor: Math.round(taxaInadimplencia * 100) / 100,
        peso: 25,
        pontuacao: pontuacaoInadimplencia,
        status: calcularStatusFator(pontuacaoInadimplencia),
      },
      margem: {
        nome: 'Margem Operacional',
        valor: Math.round(margemOperacional * 100) / 100,
        peso: 25,
        pontuacao: pontuacaoMargem,
        status: calcularStatusFator(pontuacaoMargem),
      },
      crescimento: {
        nome: 'Crescimento',
        valor: Math.round(taxaCrescimento * 100) / 100,
        peso: 20,
        pontuacao: pontuacaoCrescimento,
        status: calcularStatusFator(pontuacaoCrescimento),
      },
    },
    recomendacoes,
  }
}
