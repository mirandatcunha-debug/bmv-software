import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar subtarefas de uma tarefa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const subtarefas = await prisma.subtask.findMany({
      where: { tarefaId: params.id },
      orderBy: { criadoEm: 'asc' },
    })

    const subtarefasFormatadas = subtarefas.map((s) => ({
      id: s.id,
      tarefaId: s.tarefaId,
      titulo: s.titulo,
      concluida: s.concluida,
    }))

    return NextResponse.json(subtarefasFormatadas)
  } catch (error) {
    console.error('Erro ao listar subtarefas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar subtarefas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova subtarefa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo } = body

    if (!titulo) {
      return NextResponse.json(
        { error: 'Titulo e obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar se a tarefa existe
    const tarefa = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    const subtarefa = await prisma.subtask.create({
      data: {
        tarefaId: params.id,
        titulo,
        concluida: false,
      },
    })

    return NextResponse.json({
      id: subtarefa.id,
      tarefaId: subtarefa.tarefaId,
      titulo: subtarefa.titulo,
      concluida: subtarefa.concluida,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar subtarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar subtarefa' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar subtarefa (toggle concluida)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subtarefaId = searchParams.get('subtarefaId')

    if (!subtarefaId) {
      return NextResponse.json(
        { error: 'ID da subtarefa e obrigatorio' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { titulo, concluida } = body

    const updateData: any = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (concluida !== undefined) updateData.concluida = concluida

    const subtarefa = await prisma.subtask.update({
      where: { id: subtarefaId },
      data: updateData,
    })

    return NextResponse.json({
      id: subtarefa.id,
      tarefaId: subtarefa.tarefaId,
      titulo: subtarefa.titulo,
      concluida: subtarefa.concluida,
    })
  } catch (error) {
    console.error('Erro ao atualizar subtarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar subtarefa' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir subtarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subtarefaId = searchParams.get('subtarefaId')

    if (!subtarefaId) {
      return NextResponse.json(
        { error: 'ID da subtarefa e obrigatorio' },
        { status: 400 }
      )
    }

    await prisma.subtask.delete({
      where: { id: subtarefaId },
    })

    return NextResponse.json({ message: 'Subtarefa excluida com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir subtarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir subtarefa' },
      { status: 500 }
    )
  }
}
