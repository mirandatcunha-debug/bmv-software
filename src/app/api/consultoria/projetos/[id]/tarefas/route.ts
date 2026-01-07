import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ConsultingProjectStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

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

// GET - Listar tarefas do projeto
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: any = { projetoId: params.id }
    if (status && status !== 'TODOS') {
      whereClause.status = status
    }

    const tarefas = await prisma.consultingTask.findMany({
      where: whereClause,
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
        _count: {
          select: { comentarios: true },
        },
      },
      orderBy: { criadoEm: 'asc' },
    })

    const tarefasFormatadas = tarefas.map((t) => ({
      id: t.id,
      projetoId: t.projetoId,
      etapaId: t.etapaId,
      etapa: t.etapa ? {
        id: t.etapa.id,
        nome: t.etapa.nome,
      } : null,
      responsavelId: t.responsavelId,
      responsavel: t.responsavel ? {
        id: t.responsavel.id,
        nome: t.responsavel.nome,
        email: t.responsavel.email,
        avatarUrl: t.responsavel.avatarUrl,
      } : null,
      titulo: t.titulo,
      descricao: t.descricao,
      status: t.status,
      prioridade: t.prioridade,
      prazo: t.prazo,
      requerEvidencia: t.requerEvidencia,
      evidencias: t.evidencias.map((e) => ({
        id: e.id,
        titulo: e.titulo,
        arquivoUrl: e.arquivoUrl,
        tipo: e.tipo,
      })),
      totalComentarios: t._count.comentarios,
      criadoEm: t.criadoEm,
      atualizadoEm: t.atualizadoEm,
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

    // Verificar se o projeto existe
    const projeto = await prisma.consultingProject.findUnique({
      where: { id: params.id },
    })

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { titulo, descricao, responsavelId, etapaId, status, prioridade, prazo, requerEvidencia } = body

    if (!titulo) {
      return NextResponse.json(
        { error: 'Titulo e obrigatorio' },
        { status: 400 }
      )
    }

    if (!responsavelId) {
      return NextResponse.json(
        { error: 'Responsavel e obrigatorio' },
        { status: 400 }
      )
    }

    const tarefa = await prisma.consultingTask.create({
      data: {
        projetoId: params.id,
        etapaId: etapaId || null,
        responsavelId,
        titulo,
        descricao,
        status: status || 'A_FAZER',
        prioridade: prioridade || 'MEDIA',
        prazo: prazo ? new Date(prazo) : null,
        requerEvidencia: requerEvidencia || false,
      },
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

    // Recalcular progresso do projeto
    await recalcularProgressoProjeto(params.id)

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
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    )
  }
}
