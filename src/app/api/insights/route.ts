import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { gerarInsights, DadosParaAnalise } from '@/lib/insights/engine'

// GET - Retorna insights calculados para o tenant do usuário logado
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

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)

    // Calcular datas dos últimos 3 meses
    const meses = []
    for (let i = 0; i < 3; i++) {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59)
      meses.push({ inicio, fim })
    }

    // ============ DADOS FINANCEIROS ============
    // Buscar transações do mês atual
    const transacoesMes = await prisma.transaction.findMany({
      where: {
        tenantId: user.tenantId,
        dataMovimento: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    })

    const receitasMes = transacoesMes
      .filter((t: { tipo: string }) => t.tipo === 'RECEITA')
      .reduce((acc: number, t: { valor: unknown }) => acc + Number(t.valor), 0)

    const despesasMes = transacoesMes
      .filter((t: { tipo: string }) => t.tipo === 'DESPESA')
      .reduce((acc: number, t: { valor: unknown }) => acc + Number(t.valor), 0)

    // Buscar saldo total das contas
    const contas = await prisma.bankAccount.findMany({
      where: {
        tenantId: user.tenantId,
        ativo: true,
      },
    })
    const saldoTotal = contas.reduce((acc, c) => acc + Number(c.saldoAtual), 0)

    // Calcular médias dos últimos 3 meses
    let somaReceitas = 0
    let somaDespesas = 0
    const resultadosMeses: number[] = []

    for (const mes of meses) {
      const transacoesMesAnt = await prisma.transaction.findMany({
        where: {
          tenantId: user.tenantId,
          dataMovimento: {
            gte: mes.inicio,
            lte: mes.fim,
          },
        },
      })

      const receitasMesAnt = transacoesMesAnt
        .filter((t: { tipo: string }) => t.tipo === 'RECEITA')
        .reduce((acc: number, t: { valor: unknown }) => acc + Number(t.valor), 0)

      const despesasMesAnt = transacoesMesAnt
        .filter((t: { tipo: string }) => t.tipo === 'DESPESA')
        .reduce((acc: number, t: { valor: unknown }) => acc + Number(t.valor), 0)

      somaReceitas += receitasMesAnt
      somaDespesas += despesasMesAnt
      resultadosMeses.push(receitasMesAnt - despesasMesAnt)
    }

    const mediaReceitasUltimos3Meses = somaReceitas / 3
    const mediaDespesasUltimos3Meses = somaDespesas / 3

    // Buscar contas a receber vencidas (> 30 dias)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

    const contasReceberVencidas = await prisma.receivable.aggregate({
      where: {
        tenantId: user.tenantId,
        status: 'VENCIDO',
        dataVencimento: {
          lt: trintaDiasAtras,
        },
      },
      _sum: {
        valor: true,
      },
    })

    // ============ DADOS OKR ============
    const okrs = await prisma.objective.findMany({
      where: {
        tenantId: user.tenantId,
        status: {
          in: ['EM_ANDAMENTO', 'NAO_INICIADO'],
        },
      },
      include: {
        keyResults: {
          include: {
            tarefas: true,
          },
        },
      },
    })

    interface KeyResultWithTarefas {
      progresso: unknown
      tarefas: Array<{ status: string; dataFim: Date | null }>
    }

    const dadosOKRs = okrs.map((okr) => {
      // Calcular progresso médio dos KRs
      const progressoTotal = okr.keyResults.reduce((acc: number, kr: KeyResultWithTarefas) => acc + Number(kr.progresso), 0)
      const progresso = okr.keyResults.length > 0
        ? Math.round(progressoTotal / okr.keyResults.length)
        : 0

      // Contar tarefas atrasadas
      let tarefasAtrasadas = 0
      let totalTarefas = 0
      okr.keyResults.forEach((kr: KeyResultWithTarefas) => {
        kr.tarefas.forEach((tarefa: { status: string; dataFim: Date | null }) => {
          totalTarefas++
          if (
            tarefa.status !== 'CONCLUIDA' &&
            tarefa.dataFim &&
            new Date(tarefa.dataFim) < hoje
          ) {
            tarefasAtrasadas++
          }
        })
      })

      return {
        id: okr.id,
        titulo: okr.titulo,
        progresso,
        dataFim: okr.periodoFim,
        tarefasAtrasadas,
        totalTarefas,
      }
    })

    // ============ DADOS COLABORADORES ============
    const colaboradores = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        ativo: true,
      },
      include: {
        _count: {
          select: {
            tarefas: true,
          },
        },
      },
    })

    const dadosColaboradores = colaboradores.map((c: { id: string; nome: string; _count: { tarefas: number } }) => ({
      id: c.id,
      nome: c.nome,
      tarefasAtrasadas: c._count.tarefas,
    }))

    // ============ GERAR INSIGHTS ============
    const dadosParaAnalise: DadosParaAnalise = {
      financeiro: {
        saldoTotal,
        receitasMes,
        despesasMes,
        mediaReceitasUltimos3Meses,
        mediaDespesasUltimos3Meses,
        contasReceberVencidas: Number(contasReceberVencidas._sum?.valor) || 0,
        resultadoUltimos3Meses: resultadosMeses,
      },
      okrs: dadosOKRs,
      colaboradores: dadosColaboradores,
    }

    const insights = gerarInsights(dadosParaAnalise)

    return NextResponse.json({
      insights,
      resumo: {
        totalInsights: insights.length,
        criticos: insights.filter((i) => i.tipo === 'CRITICO').length,
        alertas: insights.filter((i) => i.tipo === 'ALERTA').length,
        positivos: insights.filter((i) => i.tipo === 'POSITIVO').length,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar insights:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar insights' },
      { status: 500 }
    )
  }
}
