export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Comparativo Orcado x Realizado
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
    const ano = searchParams.get('ano')
    const mes = searchParams.get('mes')

    if (!ano) {
      return NextResponse.json(
        { error: 'Parametro ano e obrigatorio' },
        { status: 400 }
      )
    }

    const anoNum = parseInt(ano)
    const mesNum = mes ? parseInt(mes) : null

    // Buscar orcamentos do periodo
    const whereOrcamento: any = {
      tenantId: user.tenantId,
      ano: anoNum,
    }

    if (mesNum) {
      whereOrcamento.mes = mesNum
    }

    const orcamentos = await prisma.budget.findMany({
      where: whereOrcamento,
    })

    // Definir periodo para buscar realizados
    let dataInicio: Date
    let dataFim: Date

    if (mesNum) {
      dataInicio = new Date(anoNum, mesNum - 1, 1)
      dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59)
    } else {
      dataInicio = new Date(anoNum, 0, 1)
      dataFim = new Date(anoNum, 11, 31, 23, 59, 59)
    }

    // Buscar receitas realizadas (Receivable com status PAGO)
    const receitasRealizadas = await prisma.receivable.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'PAGO',
        dataPagamento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
    })

    // Buscar despesas realizadas (Payable com status PAGO)
    const despesasRealizadas = await prisma.payable.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'PAGO',
        dataPagamento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
    })

    // Calcular totais orcados por tipo
    const totalOrcadoReceitas = orcamentos
      .filter((o) => o.tipo === 'RECEITA')
      .reduce((acc, o) => acc + Number(o.valorOrcado), 0)

    const totalOrcadoDespesas = orcamentos
      .filter((o) => o.tipo === 'DESPESA')
      .reduce((acc, o) => acc + Number(o.valorOrcado), 0)

    // Calcular totais realizados
    const totalRealizadoReceitas = receitasRealizadas.reduce(
      (acc, r) => acc + Number(r.valorPago || r.valor),
      0
    )

    const totalRealizadoDespesas = despesasRealizadas.reduce(
      (acc, p) => acc + Number(p.valorPago || p.valor),
      0
    )

    // Calcular diferencas e percentuais
    const diferencaReceitas = totalRealizadoReceitas - totalOrcadoReceitas
    const diferencaDespesas = totalRealizadoDespesas - totalOrcadoDespesas

    const percentualReceitas = totalOrcadoReceitas > 0
      ? (totalRealizadoReceitas / totalOrcadoReceitas) * 100
      : 0

    const percentualDespesas = totalOrcadoDespesas > 0
      ? (totalRealizadoDespesas / totalOrcadoDespesas) * 100
      : 0

    // Montar comparativo por categoria
    const comparativoPorCategoria: any[] = []

    // Agrupar orcamentos por categoria
    const orcamentosPorCategoria = orcamentos.reduce((acc: any, o) => {
      const key = `${o.categoria}-${o.tipo}`
      if (!acc[key]) {
        acc[key] = {
          categoria: o.categoria,
          tipo: o.tipo,
          valorOrcado: 0,
        }
      }
      acc[key].valorOrcado += Number(o.valorOrcado)
      return acc
    }, {})

    // Para cada categoria orcada, calcular o realizado
    Object.values(orcamentosPorCategoria).forEach((orcamento: any) => {
      let valorRealizado = 0

      if (orcamento.tipo === 'RECEITA') {
        // Não temos categoria em Receivable, então usamos o total
        valorRealizado = totalRealizadoReceitas
      } else {
        // Não temos categoria em Payable, então usamos o total
        valorRealizado = totalRealizadoDespesas
      }

      const diferenca = valorRealizado - orcamento.valorOrcado
      const percentual = orcamento.valorOrcado > 0
        ? (valorRealizado / orcamento.valorOrcado) * 100
        : 0

      comparativoPorCategoria.push({
        categoria: orcamento.categoria,
        tipo: orcamento.tipo,
        valorOrcado: orcamento.valorOrcado,
        valorRealizado,
        diferenca,
        percentualExecucao: Math.round(percentual * 100) / 100,
      })
    })

    return NextResponse.json({
      periodo: {
        ano: anoNum,
        mes: mesNum,
        dataInicio,
        dataFim,
      },
      resumo: {
        receitas: {
          orcado: totalOrcadoReceitas,
          realizado: totalRealizadoReceitas,
          diferenca: diferencaReceitas,
          percentualExecucao: Math.round(percentualReceitas * 100) / 100,
        },
        despesas: {
          orcado: totalOrcadoDespesas,
          realizado: totalRealizadoDespesas,
          diferenca: diferencaDespesas,
          percentualExecucao: Math.round(percentualDespesas * 100) / 100,
        },
        saldo: {
          orcado: totalOrcadoReceitas - totalOrcadoDespesas,
          realizado: totalRealizadoReceitas - totalRealizadoDespesas,
          diferenca: (totalRealizadoReceitas - totalRealizadoDespesas) - (totalOrcadoReceitas - totalOrcadoDespesas),
        },
      },
      detalhes: comparativoPorCategoria,
    })
  } catch (error) {
    console.error('Erro ao gerar comparativo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar comparativo' },
      { status: 500 }
    )
  }
}
