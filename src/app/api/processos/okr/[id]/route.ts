import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Obter objetivo por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const objetivo = await prisma.objective.findUnique({
      where: { id },
      include: {
        keyResults: {
          include: {
            tarefas: {
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
            },
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
          },
        },
        tenant: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    if (!objetivo) {
      return NextResponse.json({ error: 'Objetivo nao encontrado' }, { status: 404 })
    }

    const objetivoFormatado = {
      id: objetivo.id,
      tenantId: objetivo.tenantId,
      tenant: objetivo.tenant ? {
        id: objetivo.tenant.id,
        nome: objetivo.tenant.nome,
      } : null,
      responsavelId: objetivo.responsavelId,
      responsavel: objetivo.responsavel ? {
        id: objetivo.responsavel.id,
        nome: objetivo.responsavel.nome,
        email: objetivo.responsavel.email,
        avatarUrl: objetivo.responsavel.avatarUrl,
      } : null,
      titulo: objetivo.titulo,
      descricao: objetivo.descricao,
      periodoInicio: objetivo.periodoInicio,
      periodoFim: objetivo.periodoFim,
      status: objetivo.status,
      progresso: Number(objetivo.progresso),
      keyResults: objetivo.keyResults.map((kr) => ({
        id: kr.id,
        objetivoId: kr.objetivoId,
        titulo: kr.titulo,
        metrica: kr.metrica,
        valorBaseline: Number(kr.valorBaseline),
        valorMeta: Number(kr.valorMeta),
        valorAtual: Number(kr.valorAtual),
        peso: Number(kr.peso),
        progresso: Number(kr.progresso),
        tarefas: kr.tarefas.map((t) => ({
          id: t.id,
          keyResultId: t.keyResultId,
          responsavelId: t.responsavelId,
          responsavel: t.responsavel ? {
            id: t.responsavel.id,
            nome: t.responsavel.nome,
            email: t.responsavel.email,
            avatarUrl: t.responsavel.avatarUrl,
          } : null,
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: t.prioridade,
          status: t.status,
          dataInicio: t.dataInicio,
          dataFim: t.dataFim,
          peso: Number(t.peso),
          progresso: Number(t.progresso),
          criadoEm: t.criadoEm,
          atualizadoEm: t.atualizadoEm,
        })),
        criadoEm: kr.criadoEm,
        atualizadoEm: kr.atualizadoEm,
      })),
      criadoEm: objetivo.criadoEm,
      atualizadoEm: objetivo.atualizadoEm,
    }

    return NextResponse.json(objetivoFormatado)
  } catch (error) {
    console.error('Erro ao buscar objetivo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar objetivo' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar objetivo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem editar objetivos
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { titulo, descricao, responsavelId, periodoInicio, periodoFim, status, progresso } = body

    const updateData: Record<string, unknown> = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (responsavelId !== undefined) updateData.responsavelId = responsavelId
    if (periodoInicio !== undefined) updateData.periodoInicio = new Date(periodoInicio)
    if (periodoFim !== undefined) updateData.periodoFim = new Date(periodoFim)
    if (status !== undefined) updateData.status = status
    if (progresso !== undefined) updateData.progresso = progresso

    const objetivo = await prisma.objective.update({
      where: { id },
      data: updateData,
      include: {
        keyResults: true,
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
          },
        },
        tenant: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: objetivo.id,
      tenantId: objetivo.tenantId,
      tenant: objetivo.tenant ? {
        id: objetivo.tenant.id,
        nome: objetivo.tenant.nome,
      } : null,
      responsavelId: objetivo.responsavelId,
      responsavel: objetivo.responsavel ? {
        id: objetivo.responsavel.id,
        nome: objetivo.responsavel.nome,
        email: objetivo.responsavel.email,
        avatarUrl: objetivo.responsavel.avatarUrl,
      } : null,
      titulo: objetivo.titulo,
      descricao: objetivo.descricao,
      periodoInicio: objetivo.periodoInicio,
      periodoFim: objetivo.periodoFim,
      status: objetivo.status,
      progresso: Number(objetivo.progresso),
      keyResults: objetivo.keyResults.map((kr) => ({
        id: kr.id,
        objetivoId: kr.objetivoId,
        titulo: kr.titulo,
        metrica: kr.metrica,
        valorBaseline: Number(kr.valorBaseline),
        valorMeta: Number(kr.valorMeta),
        valorAtual: Number(kr.valorAtual),
        peso: Number(kr.peso),
        progresso: Number(kr.progresso),
        criadoEm: kr.criadoEm,
        atualizadoEm: kr.atualizadoEm,
      })),
      criadoEm: objetivo.criadoEm,
      atualizadoEm: objetivo.atualizadoEm,
    })
  } catch (error) {
    console.error('Erro ao atualizar objetivo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar objetivo' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir objetivo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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

    // Apenas ADMIN_BMV pode excluir objetivos
    if (user.perfil !== 'ADMIN_BMV') {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    await prisma.objective.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Objetivo excluido com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir objetivo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir objetivo' },
      { status: 500 }
    )
  }
}
