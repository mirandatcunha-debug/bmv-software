import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Relatorio de fluxo de caixa
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
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
    const mes = searchParams.get('mes') || new Date().getMonth() + 1
    const ano = searchParams.get('ano') || new Date().getFullYear()

    // Calcular inicio e fim do mes
    const dataInicio = new Date(Number(ano), Number(mes) - 1, 1)
    const dataFim = new Date(Number(ano), Number(mes), 0, 23, 59, 59)

    // Buscar movimentacoes do mes
    const movimentacoes = await prisma.transaction.findMany({
      where: {
        tenantId: user.tenantId,
        dataMovimento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        conta: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { dataMovimento: 'asc' },
    })

    // Buscar saldo inicial (soma dos saldos das contas no inicio do mes)
    const contas = await prisma.bankAccount.findMany({
      where: {
        tenantId: user.tenantId,
        ativo: true,
      },
    })

    // Calcular saldo inicial estimado (saldo atual - movimentacoes do mes)
    let saldoInicial = contas.reduce((acc, c) => acc + Number(c.saldoAtual), 0)

    // Subtrair receitas e somar despesas do mes atual para obter saldo inicial
    movimentacoes.forEach((m) => {
      if (m.tipo === 'RECEITA') {
        saldoInicial -= Number(m.valor)
      } else {
        saldoInicial += Number(m.valor)
      }
    })

    // Montar fluxo de caixa
    let saldoAcumulado = saldoInicial
    const fluxo = [
      {
        data: dataInicio.toISOString(),
        descricao: 'Saldo Inicial',
        tipo: 'RECEITA',
        entrada: saldoInicial,
        saida: 0,
        saldo: saldoInicial,
      },
      ...movimentacoes.map((m) => {
        const entrada = m.tipo === 'RECEITA' ? Number(m.valor) : 0
        const saida = m.tipo === 'DESPESA' ? Number(m.valor) : 0
        saldoAcumulado = saldoAcumulado + entrada - saida

        return {
          data: m.dataMovimento.toISOString(),
          descricao: m.descricao,
          tipo: m.tipo,
          categoria: m.categoria,
          conta: m.conta?.nome,
          entrada,
          saida,
          saldo: saldoAcumulado,
        }
      }),
    ]

    // Calcular totais
    const totalEntradas = movimentacoes
      .filter((m) => m.tipo === 'RECEITA')
      .reduce((acc, m) => acc + Number(m.valor), 0) + saldoInicial
    const totalSaidas = movimentacoes
      .filter((m) => m.tipo === 'DESPESA')
      .reduce((acc, m) => acc + Number(m.valor), 0)

    return NextResponse.json({
      mes: Number(mes),
      ano: Number(ano),
      saldoInicial,
      saldoFinal: saldoAcumulado,
      totalEntradas,
      totalSaidas,
      resultado: totalEntradas - totalSaidas,
      fluxo,
    })
  } catch (error) {
    console.error('Erro ao gerar fluxo de caixa:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar fluxo de caixa' },
      { status: 500 }
    )
  }
}
