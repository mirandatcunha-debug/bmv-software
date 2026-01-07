export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { gerarInsights, DadosParaAnalise } from '@/lib/insights/engine'

// GET - Retorna todos os dados do Dashboard
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

    // Mês anterior
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59)

    // ============ DADOS FINANCEIROS ============
    // Transações do mês atual
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
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const despesasMes = transacoesMes
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    // Transações do mês anterior
    const transacoesMesAnterior = await prisma.transaction.findMany({
      where: {
        tenantId: user.tenantId,
        dataMovimento: {
          gte: inicioMesAnterior,
          lte: fimMesAnterior,
        },
      },
    })

    const receitasMesAnterior = transacoesMesAnterior
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const despesasMesAnterior = transacoesMesAnterior
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    // Saldo total das contas
    const contas = await prisma.bankAccount.findMany({
      where: {
        tenantId: user.tenantId,
        ativo: true,
      },
    })
    const saldoTotal = contas.reduce((acc, c) => acc + Number(c.saldoAtual), 0)

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
      orderBy: { periodoFim: 'asc' },
      take: 5,
    })

    const okrsFormatados = okrs.map((okr) => {
      const progressoTotal = okr.keyResults.reduce((acc: number, kr: { progresso: unknown }) => acc + Number(kr.progresso), 0)
      const progresso = okr.keyResults.length > 0
        ? Math.round(progressoTotal / okr.keyResults.length)
        : 0

      const diasRestantes = Math.ceil(
        (new Date(okr.periodoFim).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      )

      let status: 'EM_DIA' | 'ATENCAO' | 'ATRASADO' | 'CRITICO' = 'EM_DIA'
      if (progresso < 25 && diasRestantes < 15) {
        status = 'CRITICO'
      } else if (progresso < 50 && diasRestantes < 30) {
        status = 'ATRASADO'
      } else if (progresso < 40) {
        status = 'ATENCAO'
      }

      return {
        id: okr.id,
        titulo: okr.titulo,
        progresso,
        dataFim: okr.periodoFim,
        status,
      }
    })

    // Ordenar OKRs: críticos e atrasados primeiro
    const ordem: Record<'CRITICO' | 'ATRASADO' | 'ATENCAO' | 'EM_DIA', number> = { CRITICO: 0, ATRASADO: 1, ATENCAO: 2, EM_DIA: 3 }
    okrsFormatados.sort((a, b) => {
      return ordem[a.status] - ordem[b.status]
    })

    // ============ PROJETO DE CONSULTORIA (para clientes) ============
    let projeto = null

    if (user.perfil === 'CLIENTE' || user.perfil === 'GESTOR' || user.perfil === 'COLABORADOR') {
      const projetoConsultoria = await prisma.consultingProject.findFirst({
        where: {
          tenantId: user.tenantId,
          status: {
            in: ['EM_ANDAMENTO', 'NAO_INICIADO'],
          },
        },
        include: {
          tarefas: {
            where: {
              status: { not: 'CONCLUIDO' },
            },
            orderBy: { prazo: 'asc' },
            take: 1,
          },
        },
      })

      if (projetoConsultoria) {
        projeto = {
          id: projetoConsultoria.id,
          nome: projetoConsultoria.nome,
          consultor: 'Não atribuído',
          status: projetoConsultoria.status,
          progresso: projetoConsultoria.progresso,
          proximaEntrega: projetoConsultoria.tarefas[0]
            ? {
                data: projetoConsultoria.tarefas[0].prazo,
                descricao: projetoConsultoria.tarefas[0].titulo,
              }
            : null,
        }
      }
    }

    // ============ GERAR INSIGHTS ============
    // Calcular médias para insights
    const meses = []
    for (let i = 0; i < 3; i++) {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59)
      meses.push({ inicio, fim })
    }

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

      const recMes = transacoesMesAnt
        .filter((t: { tipo: string }) => t.tipo === 'RECEITA')
        .reduce((acc: number, t: { valor: unknown }) => acc + Number(t.valor), 0)

      const despMes = transacoesMesAnt
        .filter((t: { tipo: string }) => t.tipo === 'DESPESA')
        .reduce((acc: number, t: { valor: unknown }) => acc + Number(t.valor), 0)

      somaReceitas += recMes
      somaDespesas += despMes
      resultadosMeses.push(recMes - despMes)
    }

    // Contas a receber vencidas
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

    // Dados para análise de insights
    interface KeyResultWithTarefas {
      progresso: unknown
      tarefas: Array<{ status: string; dataFim: Date | null }>
    }

    const dadosOKRsParaInsights = okrs.map((okr) => {
      const progressoTotal = okr.keyResults.reduce((acc: number, kr: KeyResultWithTarefas) => acc + Number(kr.progresso), 0)
      const progresso = okr.keyResults.length > 0
        ? Math.round(progressoTotal / okr.keyResults.length)
        : 0

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

    const dadosParaAnalise: DadosParaAnalise = {
      financeiro: {
        saldoTotal,
        receitasMes,
        despesasMes,
        mediaReceitasUltimos3Meses: somaReceitas / 3,
        mediaDespesasUltimos3Meses: somaDespesas / 3,
        contasReceberVencidas: Number(contasReceberVencidas._sum?.valor) || 0,
        resultadoUltimos3Meses: resultadosMeses,
      },
      okrs: dadosOKRsParaInsights,
    }

    const insights = gerarInsights(dadosParaAnalise)

    // ============ RESPOSTA ============
    return NextResponse.json({
      insights: insights.slice(0, 3), // Top 3 insights
      financeiro: {
        saldoTotal,
        receitasMes,
        receitasMesAnterior,
        despesasMes,
        despesasMesAnterior,
        resultado: receitasMes - despesasMes,
      },
      okrs: okrsFormatados.slice(0, 5),
      projeto,
      usuario: {
        nome: user.nome,
        perfil: user.perfil,
      },
    })
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard' },
      { status: 500 }
    )
  }
}
