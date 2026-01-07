import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Obter projeto por ID
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

    const projeto = await prisma.consultingProject.findUnique({
      where: { id: params.id },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            email: true,
            cnpj: true,
          },
        },
        etapas: {
          orderBy: { ordem: 'asc' },
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
        tarefas: {
          orderBy: { criadoEm: 'asc' },
          include: {
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatarUrl: true,
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
        },
      },
    })

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    const projetoFormatado = {
      id: projeto.id,
      tenantId: projeto.tenantId,
      nome: projeto.nome,
      descricao: projeto.descricao,
      cliente: projeto.tenant ? {
        id: projeto.tenant.id,
        nome: projeto.tenant.nome,
        email: projeto.tenant.email,
        cnpj: projeto.tenant.cnpj,
      } : null,
      dataInicio: projeto.dataInicio,
      dataFim: projeto.dataFim,
      status: projeto.status,
      progresso: Number(projeto.progresso),
      etapas: projeto.etapas.map((e) => ({
        id: e.id,
        projetoId: e.projetoId,
        nome: e.nome,
        ordem: e.ordem,
        peso: Number(e.peso),
        progresso: Number(e.progresso),
        tarefas: e.tarefas.map((t) => ({
          id: t.id,
          projetoId: t.projetoId,
          etapaId: t.etapaId,
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
          criadoEm: t.criadoEm,
          atualizadoEm: t.atualizadoEm,
        })),
        criadoEm: e.criadoEm,
      })),
      tarefas: projeto.tarefas.map((t) => ({
        id: t.id,
        projetoId: t.projetoId,
        etapaId: t.etapaId,
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
          tarefaId: e.tarefaId,
          titulo: e.titulo,
          descricao: e.descricao,
          arquivoUrl: e.arquivoUrl,
          tipo: e.tipo,
          criadoEm: e.criadoEm,
        })),
        comentarios: t.comentarios.map((c) => ({
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
        criadoEm: t.criadoEm,
        atualizadoEm: t.atualizadoEm,
      })),
      criadoEm: projeto.criadoEm,
      atualizadoEm: projeto.atualizadoEm,
    }

    return NextResponse.json(projetoFormatado)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projeto' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar projeto
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem editar projetos
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, descricao, dataInicio, dataFim, status, progresso } = body

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome
    if (descricao !== undefined) updateData.descricao = descricao
    if (dataInicio !== undefined) updateData.dataInicio = new Date(dataInicio)
    if (dataFim !== undefined) updateData.dataFim = dataFim ? new Date(dataFim) : null
    if (status !== undefined) updateData.status = status
    if (progresso !== undefined) updateData.progresso = progresso

    const projeto = await prisma.consultingProject.update({
      where: { id: params.id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: projeto.id,
      tenantId: projeto.tenantId,
      nome: projeto.nome,
      descricao: projeto.descricao,
      cliente: projeto.tenant ? {
        id: projeto.tenant.id,
        nome: projeto.tenant.nome,
        email: projeto.tenant.email,
      } : null,
      dataInicio: projeto.dataInicio,
      dataFim: projeto.dataFim,
      status: projeto.status,
      progresso: Number(projeto.progresso),
      criadoEm: projeto.criadoEm,
      atualizadoEm: projeto.atualizadoEm,
    })
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir projeto
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Apenas ADMIN_BMV pode excluir projetos
    if (user.perfil !== 'ADMIN_BMV') {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    await prisma.consultingProject.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Projeto excluido com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir projeto' },
      { status: 500 }
    )
  }
}
