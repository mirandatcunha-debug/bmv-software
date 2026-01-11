export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Retornar 5 atividades mais relevantes para o dashboard
// Prioridade: atrasadas > vencem hoje > em andamento
export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e tenant
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const fimHoje = new Date()
    fimHoje.setHours(23, 59, 59, 999)

    // Buscar todas as tarefas ativas (não concluídas/canceladas) do tenant
    const tarefas = await prisma.task.findMany({
      where: {
        responsavel: {
          tenantId: user.tenantId,
        },
        status: {
          notIn: ['CONCLUIDA', 'CANCELADA'],
        },
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: [
        { dataFim: 'asc' },
        { prioridade: 'desc' },
        { criadoEm: 'desc' },
      ],
    })

    // Categorizar as tarefas por prioridade
    const atrasadas: typeof tarefas = []
    const venceHoje: typeof tarefas = []
    const emAndamento: typeof tarefas = []
    const outras: typeof tarefas = []

    for (const tarefa of tarefas) {
      if (tarefa.dataFim) {
        const prazo = new Date(tarefa.dataFim)
        prazo.setHours(0, 0, 0, 0)

        if (prazo < hoje) {
          atrasadas.push(tarefa)
        } else if (prazo.getTime() === hoje.getTime()) {
          venceHoje.push(tarefa)
        } else if (tarefa.status === 'EM_ANDAMENTO') {
          emAndamento.push(tarefa)
        } else {
          outras.push(tarefa)
        }
      } else if (tarefa.status === 'EM_ANDAMENTO') {
        emAndamento.push(tarefa)
      } else {
        outras.push(tarefa)
      }
    }

    // Combinar na ordem de prioridade e pegar as 5 primeiras
    const tarefasPriorizadas = [
      ...atrasadas,
      ...venceHoje,
      ...emAndamento,
      ...outras,
    ].slice(0, 5)

    // Formatar resposta
    const atividadesFormatadas = tarefasPriorizadas.map((tarefa) => ({
      id: tarefa.id,
      titulo: tarefa.titulo,
      status: tarefa.status,
      prioridade: tarefa.prioridade,
      dataFim: tarefa.dataFim?.toISOString() || null,
      responsavel: tarefa.responsavel,
    }))

    return NextResponse.json({
      atividades: atividadesFormatadas,
      total: atividadesFormatadas.length,
    })
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
}
