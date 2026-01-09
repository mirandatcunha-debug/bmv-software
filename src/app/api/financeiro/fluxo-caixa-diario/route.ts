export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

interface FluxoDiario {
  dia: number
  data: string
  saldoInicial: number
  entradas: number
  saidas: number
  saldoFinal: number
}

// GET - Fluxo de caixa diario do mes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const mes = parseInt(searchParams.get('mes') || String(new Date().getMonth() + 1))
    const ano = parseInt(searchParams.get('ano') || String(new Date().getFullYear()))
    const contaId = searchParams.get('contaId')

    // Calcular inicio e fim do mes
    const dataInicio = new Date(ano, mes - 1, 1)
    const dataFim = new Date(ano, mes, 0, 23, 59, 59)
    const diasNoMes = new Date(ano, mes, 0).getDate()

    // Construir filtro de conta
    const contaFilter = contaId ? { contaId } : {}

    // Buscar contas do tenant
    const contas = await prisma.bankAccount.findMany({
      where: {
        tenantId: user.tenantId,
        ativo: true,
        ...(contaId ? { id: contaId } : {}),
      },
    })

    // Calcular saldo inicial do mes (antes do primeiro dia)
    // Saldo atual - todas as movimentacoes a partir do inicio do mes
    let saldoInicialMes = contas.reduce((acc, c) => acc + Number(c.saldoAtual), 0)

    // Buscar todas as movimentacoes do mes selecionado ate hoje para calcular saldo inicial
    const movimentacoesMes = await prisma.transaction.findMany({
      where: {
        tenantId: user.tenantId,
        dataMovimento: {
          gte: dataInicio,
        },
        ...contaFilter,
      },
      orderBy: { dataMovimento: 'asc' },
    })

    // Subtrair movimentacoes do mes para obter saldo inicial
    movimentacoesMes.forEach((m) => {
      if (m.tipo === 'RECEITA') {
        saldoInicialMes -= Number(m.valor)
      } else if (m.tipo === 'DESPESA') {
        saldoInicialMes += Number(m.valor)
      }
    })

    // Buscar movimentacoes apenas do mes selecionado
    const movimentacoes = await prisma.transaction.findMany({
      where: {
        tenantId: user.tenantId,
        dataMovimento: {
          gte: dataInicio,
          lte: dataFim,
        },
        ...contaFilter,
      },
      orderBy: { dataMovimento: 'asc' },
    })

    // Agrupar movimentacoes por dia
    const movimentacoesPorDia: Record<number, { entradas: number; saidas: number }> = {}

    movimentacoes.forEach((m) => {
      const dia = m.dataMovimento.getDate()
      if (!movimentacoesPorDia[dia]) {
        movimentacoesPorDia[dia] = { entradas: 0, saidas: 0 }
      }
      if (m.tipo === 'RECEITA') {
        movimentacoesPorDia[dia].entradas += Number(m.valor)
      } else if (m.tipo === 'DESPESA') {
        movimentacoesPorDia[dia].saidas += Number(m.valor)
      }
    })

    // Montar fluxo diario
    const fluxoDiario: FluxoDiario[] = []
    let saldoAcumulado = saldoInicialMes

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const movDia = movimentacoesPorDia[dia] || { entradas: 0, saidas: 0 }
      const saldoInicial = saldoAcumulado
      const saldoFinal = saldoInicial + movDia.entradas - movDia.saidas

      fluxoDiario.push({
        dia,
        data: new Date(ano, mes - 1, dia).toISOString(),
        saldoInicial,
        entradas: movDia.entradas,
        saidas: movDia.saidas,
        saldoFinal,
      })

      saldoAcumulado = saldoFinal
    }

    // Calcular totais
    const totalEntradas = fluxoDiario.reduce((acc, d) => acc + d.entradas, 0)
    const totalSaidas = fluxoDiario.reduce((acc, d) => acc + d.saidas, 0)
    const variacaoPeriodo = totalEntradas - totalSaidas

    return NextResponse.json({
      mes,
      ano,
      contaId: contaId || null,
      saldoInicialMes,
      saldoFinalMes: saldoAcumulado,
      totalEntradas,
      totalSaidas,
      variacaoPeriodo,
      fluxoDiario,
    })
  } catch (error) {
    console.error('Erro ao gerar fluxo de caixa diario:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar fluxo de caixa diario' },
      { status: 500 }
    )
  }
}
