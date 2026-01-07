export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar tarefas de um objetivo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar todas as tarefas dos KRs deste objetivo
    const keyResults = await prisma.keyResult.findMany({
      where: { objetivoId: params.id },
      select: { id: true },
    })

    const krIds = keyResults.map((kr) => kr.id)

    const tarefas = await prisma.task.findMany({
      where: {
        keyResultId: { in: krIds },
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
        subtarefas: true,
      },
      orderBy: { criadoEm: 'desc' },
    })

    const tarefasFormatadas = tarefas.map((t) => ({
      id: t.id,
      keyResultId: t.keyResultId,
      titulo: t.titulo,
      descricao: t.descricao,
      responsavelId: t.responsavelId,
      responsavel: t.responsavel,
      peso: Number(t.peso),
      concluida: t.status === 'CONCLUIDA',
      subtarefas: t.subtarefas.map((s) => ({
        id: s.id,
        tarefaId: s.tarefaId,
        titulo: s.titulo,
        concluida: s.concluida,
      })),
    }))

    return NextResponse.json(tarefasFormatadas)
  } catch (error) {
    console.error('Erro ao listar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar tarefas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova tarefa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { titulo, descricao, responsavelId, keyResultId, peso } = body

    if (!titulo) {
      return NextResponse.json(
        { error: 'Titulo e obrigatorio' },
        { status: 400 }
      )
    }

    if (!keyResultId) {
      return NextResponse.json(
        { error: 'Key Result e obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar se o KR existe e pertence ao objetivo
    const keyResult = await prisma.keyResult.findFirst({
      where: {
        id: keyResultId,
        objetivoId: params.id,
      },
    })

    if (!keyResult) {
      return NextResponse.json({ error: 'Key Result nao encontrado' }, { status: 404 })
    }

    const tarefa = await prisma.task.create({
      data: {
        keyResultId,
        responsavelId: responsavelId || user.id,
        titulo,
        descricao,
        peso: peso || 1,
        status: 'A_FAZER',
        progresso: 0,
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: tarefa.id,
      keyResultId: tarefa.keyResultId,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      responsavelId: tarefa.responsavelId,
      responsavel: tarefa.responsavel,
      peso: Number(tarefa.peso),
      concluida: false,
      subtarefas: [],
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    )
  }
}
