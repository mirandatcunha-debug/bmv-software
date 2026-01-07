export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ConsultingProjectStatus } from '@prisma/client'

// Funcao auxiliar para recalcular progresso do projeto
async function recalcularProgressoProjeto(projetoId: string) {
  const tarefas = await prisma.consultingTask.findMany({
    where: { projetoId },
  })

  if (tarefas.length === 0) {
    await prisma.consultingProject.update({
      where: { id: projetoId },
      data: { progresso: 0 },
    })
    return
  }

  const concluidas = tarefas.filter((t) => t.status === 'CONCLUIDO').length
  const progresso = Math.round((concluidas / tarefas.length) * 100)

  // Determinar status do projeto baseado no progresso
  let status: ConsultingProjectStatus = ConsultingProjectStatus.EM_ANDAMENTO
  if (progresso === 0) {
    status = ConsultingProjectStatus.NAO_INICIADO
  } else if (progresso === 100) {
    status = ConsultingProjectStatus.CONCLUIDO
  }

  await prisma.consultingProject.update({
    where: { id: projetoId },
    data: { progresso, status },
  })
}

// GET - Obter tarefa por ID
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

    const tarefa = await prisma.consultingTask.findUnique({
      where: { id: params.id },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nome: true,
          },
        },
        evidencias: true,
        comentarios: {
          include: {
            autor: {
              select: {
                id: true,
                nome: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
    })

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      id: tarefa.id,
      projetoId: tarefa.projetoId,
      etapaId: tarefa.etapaId,
      etapa: tarefa.etapa ? {
        id: tarefa.etapa.id,
        nome: tarefa.etapa.nome,
      } : null,
      responsavelId: tarefa.responsavelId,
      responsavel: tarefa.responsavel ? {
        id: tarefa.responsavel.id,
        nome: tarefa.responsavel.nome,
        email: tarefa.responsavel.email,
        avatarUrl: tarefa.responsavel.avatarUrl,
      } : null,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      prioridade: tarefa.prioridade,
      prazo: tarefa.prazo,
      requerEvidencia: tarefa.requerEvidencia,
      evidencias: tarefa.evidencias.map((e) => ({
        id: e.id,
        tarefaId: e.tarefaId,
        titulo: e.titulo,
        descricao: e.descricao,
        arquivoUrl: e.arquivoUrl,
        tipo: e.tipo,
        criadoEm: e.criadoEm,
      })),
      comentarios: tarefa.comentarios.map((c) => ({
        id: c.id,
        tarefaId: c.tarefaId,
        autorId: c.autorId,
        autor: c.autor ? {
          id: c.autor.id,
          nome: c.autor.nome,
          avatarUrl: c.autor.avatarUrl,
        } : null,
        conteudo: c.conteudo,
        criadoEm: c.criadoEm,
      })),
      criadoEm: tarefa.criadoEm,
      atualizadoEm: tarefa.atualizadoEm,
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

    // Buscar tarefa para obter projetoId
    const tarefaExistente = await prisma.consultingTask.findUnique({
      where: { id: params.id },
    })

    if (!tarefaExistente) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { titulo, descricao, responsavelId, etapaId, status, prioridade, prazo, requerEvidencia } = body

    const updateData: any = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (responsavelId !== undefined) updateData.responsavelId = responsavelId
    if (etapaId !== undefined) updateData.etapaId = etapaId
    if (status !== undefined) updateData.status = status
    if (prioridade !== undefined) updateData.prioridade = prioridade
    if (prazo !== undefined) updateData.prazo = prazo ? new Date(prazo) : null
    if (requerEvidencia !== undefined) updateData.requerEvidencia = requerEvidencia

    const tarefa = await prisma.consultingTask.update({
      where: { id: params.id },
      data: updateData,
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Recalcular progresso do projeto se o status mudou
    if (status !== undefined) {
      await recalcularProgressoProjeto(tarefa.projetoId)
    }

    return NextResponse.json({
      id: tarefa.id,
      projetoId: tarefa.projetoId,
      etapaId: tarefa.etapaId,
      responsavelId: tarefa.responsavelId,
      responsavel: tarefa.responsavel ? {
        id: tarefa.responsavel.id,
        nome: tarefa.responsavel.nome,
        email: tarefa.responsavel.email,
        avatarUrl: tarefa.responsavel.avatarUrl,
      } : null,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      prioridade: tarefa.prioridade,
      prazo: tarefa.prazo,
      requerEvidencia: tarefa.requerEvidencia,
      criadoEm: tarefa.criadoEm,
      atualizadoEm: tarefa.atualizadoEm,
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

    // Buscar tarefa para obter projetoId
    const tarefa = await prisma.consultingTask.findUnique({
      where: { id: params.id },
    })

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    const projetoId = tarefa.projetoId

    await prisma.consultingTask.delete({
      where: { id: params.id },
    })

    // Recalcular progresso do projeto
    await recalcularProgressoProjeto(projetoId)

    return NextResponse.json({ message: 'Tarefa excluida com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir tarefa' },
      { status: 500 }
    )
  }
}
