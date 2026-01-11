export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Prisma } from '@prisma/client'

// GET - Listar todas as tarefas do tenant
export async function GET(request: NextRequest) {
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

    // Parâmetros de filtro
    const searchParams = request.nextUrl.searchParams
    const colaboradorId = searchParams.get('colaboradorId')
    const status = searchParams.get('status')
    const prioridade = searchParams.get('prioridade')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    // Construir filtro dinâmico
    const where: Prisma.TaskWhereInput = {
      responsavel: {
        tenantId: user.tenantId,
      },
    }

    // Filtro por colaborador
    if (colaboradorId) {
      where.responsavelId = colaboradorId
    }

    // Filtro por status
    if (status && status !== 'ATRASADA') {
      where.status = status as any
    }

    // Filtro por prioridade
    if (prioridade) {
      where.prioridade = prioridade as any
    }

    // Filtro por período (data de prazo)
    if (dataInicio || dataFim) {
      where.dataFim = {}
      if (dataInicio) {
        where.dataFim.gte = new Date(dataInicio)
      }
      if (dataFim) {
        where.dataFim.lte = new Date(dataFim + 'T23:59:59.999Z')
      }
    }

    // Buscar tarefas
    let tarefas = await prisma.task.findMany({
      where,
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
        keyResult: {
          select: {
            id: true,
            titulo: true,
            objetivo: {
              select: {
                id: true,
                titulo: true,
              },
            },
          },
        },
      },
      orderBy: [
        { dataFim: 'asc' },
        { prioridade: 'desc' },
        { criadoEm: 'desc' },
      ],
    })

    // Se filtro for "ATRASADA", filtrar manualmente
    if (status === 'ATRASADA') {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      tarefas = tarefas.filter((tarefa) => {
        if (!tarefa.dataFim) return false
        if (tarefa.status === 'CONCLUIDA' || tarefa.status === 'CANCELADA') return false
        return tarefa.dataFim < hoje
      })
    }

    // Formatar resposta
    const tarefasFormatadas = tarefas.map((tarefa) => ({
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      prioridade: tarefa.prioridade,
      dataFim: tarefa.dataFim?.toISOString(),
      responsavel: tarefa.responsavel,
      keyResult: tarefa.keyResult
        ? {
            id: tarefa.keyResult.id,
            titulo: tarefa.keyResult.titulo,
            objetivo: tarefa.keyResult.objetivo
              ? {
                  id: tarefa.keyResult.objetivo.id,
                  titulo: tarefa.keyResult.objetivo.titulo,
                }
              : null,
          }
        : null,
    }))

    return NextResponse.json({
      tarefas: tarefasFormatadas,
      total: tarefasFormatadas.length,
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
}
