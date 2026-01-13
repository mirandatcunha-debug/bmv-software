export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantFromSession } from '@/lib/get-tenant'

interface CenarioCustom {
  nome: string
  receitaMultiplier: number
  despesaMultiplier: number
  meses: number
}

export async function POST(request: NextRequest) {
  try {
    const { tenant, error } = await getTenantFromSession()

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const cenariosCustom: CenarioCustom[] = body.cenarios || []

    // Busca saldo atual das contas bancárias
    const contas = await prisma.bankAccount.findMany({
      where: { tenantId: tenant.id, ativo: true },
      select: { saldoAtual: true },
    })

    const saldoAtual = contas.reduce((acc, conta) => acc + Number(conta.saldoAtual), 0)

    // Calcula médias dos últimos 3 meses
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)

    const movimentacoes = await prisma.transaction.findMany({
      where: {
        tenantId: tenant.id,
        dataMovimento: { gte: tresMesesAtras },
      },
      select: { tipo: true, valor: true },
    })

    const receitas = movimentacoes.filter(m => m.tipo === 'RECEITA')
    const despesas = movimentacoes.filter(m => m.tipo === 'DESPESA')

    const receitaTotal = receitas.reduce((acc, m) => acc + Number(m.valor), 0)
    const despesaTotal = despesas.reduce((acc, m) => acc + Number(m.valor), 0)

    const receitaMedia = receitaTotal / 3
    const despesaMedia = despesaTotal / 3

    // Cenários padrão
    const cenariosPadrao: CenarioCustom[] = [
      { nome: 'Otimista', receitaMultiplier: 1.2, despesaMultiplier: 0.9, meses: 6 },
      { nome: 'Realista', receitaMultiplier: 1.0, despesaMultiplier: 1.0, meses: 6 },
      { nome: 'Pessimista', receitaMultiplier: 0.8, despesaMultiplier: 1.15, meses: 6 },
    ]

    const cenariosParaSimular = cenariosCustom.length > 0 ? cenariosCustom : cenariosPadrao

    // Simula cada cenário
    const resultados = cenariosParaSimular.map(cenario => {
      const receitaProjetada = receitaMedia * cenario.receitaMultiplier
      const despesaProjetada = despesaMedia * cenario.despesaMultiplier
      const fluxoMensal = receitaProjetada - despesaProjetada

      const projecao = []
      let saldoProjetado = saldoAtual

      for (let mes = 1; mes <= cenario.meses; mes++) {
        saldoProjetado += fluxoMensal
        projecao.push({
          mes,
          saldo: Math.round(saldoProjetado * 100) / 100,
          receita: Math.round(receitaProjetada * 100) / 100,
          despesa: Math.round(despesaProjetada * 100) / 100,
        })
      }

      return {
        nome: cenario.nome,
        receitaProjetada: Math.round(receitaProjetada * 100) / 100,
        despesaProjetada: Math.round(despesaProjetada * 100) / 100,
        fluxoMensal: Math.round(fluxoMensal * 100) / 100,
        saldoFinal: Math.round(saldoProjetado * 100) / 100,
        projecao,
      }
    })

    return NextResponse.json({
      saldoAtual: Math.round(saldoAtual * 100) / 100,
      receitaMedia: Math.round(receitaMedia * 100) / 100,
      despesaMedia: Math.round(despesaMedia * 100) / 100,
      resultados,
    })
  } catch (error) {
    console.error('Erro no simulador:', error)
    return NextResponse.json(
      { error: 'Erro ao simular cenários' },
      { status: 500 }
    )
  }
}
