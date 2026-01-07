import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { OkrStatus } from '@prisma/client'

// GET - Buscar tarefa por ID
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

    const tarefa = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
        subtarefas: true,
      },
    })

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      id: tarefa.id,
      keyResultId: tarefa.keyResultId,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      responsavelId: tarefa.responsavelId,
      responsavel: tarefa.responsavel,
      peso: Number(tarefa.peso),
      concluida: tarefa.status === 'CONCLUIDA',
      subtarefas: tarefa.subtarefas.map((s) => ({
        id: s.id,
        tarefaId: s.tarefaId,
        titulo: s.titulo,
        concluida: s.concluida,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tarefa' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar tarefa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, descricao, responsavelId, concluida, peso } = body

    const updateData: any = {}

    if (titulo !== undefined) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (responsavelId !== undefined) updateData.responsavelId = responsavelId
    if (peso !== undefined) updateData.peso = peso

    // Atualizar status baseado em concluida
    if (concluida !== undefined) {
      updateData.status = concluida ? 'CONCLUIDA' : 'A_FAZER'
      updateData.progresso = concluida ? 100 : 0
    }

    const tarefa = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
        subtarefas: true,
        keyResult: {
          select: {
            objetivoId: true,
          },
        },
      },
    })

    // Recalcular progresso do KR e Objetivo
    if (tarefa.keyResultId) {
      await recalcularProgressos(tarefa.keyResultId, tarefa.keyResult?.objetivoId || '')
    }

    return NextResponse.json({
      id: tarefa.id,
      keyResultId: tarefa.keyResultId,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      responsavelId: tarefa.responsavelId,
      responsavel: tarefa.responsavel,
      peso: Number(tarefa.peso),
      concluida: tarefa.status === 'CONCLUIDA',
      subtarefas: tarefa.subtarefas.map((s) => ({
        id: s.id,
        tarefaId: s.tarefaId,
        titulo: s.titulo,
        concluida: s.concluida,
      })),
    })
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir tarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const tarefa = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        keyResult: {
          select: { objetivoId: true },
        },
      },
    })

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    // Recalcular progressos
    if (tarefa.keyResultId && tarefa.keyResult) {
      await recalcularProgressos(tarefa.keyResultId, tarefa.keyResult.objetivoId)
    }

    return NextResponse.json({ message: 'Tarefa excluida com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir tarefa' },
      { status: 500 }
    )
  }
}

// Funcao auxiliar para recalcular progressos
async function recalcularProgressos(keyResultId: string, objetivoId: string) {
  // Recalcular progresso do KR
  const tarefasDoKR = await prisma.task.findMany({
    where: { keyResultId },
  })

  let somaPesos = 0
  let somaProgressoPonderado = 0

  for (const t of tarefasDoKR) {
    const progresso = t.status === 'CONCLUIDA' ? 100 : 0
    somaProgressoPonderado += progresso * Number(t.peso)
    somaPesos += Number(t.peso)
  }

  const progressoKR = somaPesos > 0 ? Math.round(somaProgressoPonderado / somaPesos) : 0

  await prisma.keyResult.update({
    where: { id: keyResultId },
    data: { progresso: progressoKR },
  })

  // Recalcular progresso do Objetivo
  const krsDoObjetivo = await prisma.keyResult.findMany({
    where: { objetivoId },
  })

  somaPesos = 0
  somaProgressoPonderado = 0

  for (const kr of krsDoObjetivo) {
    somaProgressoPonderado += Number(kr.progresso) * Number(kr.peso)
    somaPesos += Number(kr.peso)
  }

  const progressoObjetivo = somaPesos > 0 ? Math.round(somaProgressoPonderado / somaPesos) : 0

  // Determinar status baseado no progresso
  let status: OkrStatus = OkrStatus.EM_ANDAMENTO
  if (progressoObjetivo === 0) status = OkrStatus.NAO_INICIADO
  else if (progressoObjetivo >= 100) status = OkrStatus.CONCLUIDO

  await prisma.objective.update({
    where: { id: objetivoId },
    data: {
      progresso: progressoObjetivo,
      status,
    },
  })
}
