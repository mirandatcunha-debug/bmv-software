import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Buscar objetivo por ID
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

    const objetivo = await prisma.objective.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            avatarUrl: true,
          },
        },
        keyResults: {
          include: {
            tarefas: {
              include: {
                responsavel: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
                subtarefas: true,
              },
            },
          },
        },
      },
    })

    if (!objetivo) {
      return NextResponse.json({ error: 'Objetivo nao encontrado' }, { status: 404 })
    }

    // Formatar para o frontend
    const objetivoFormatado = {
      id: objetivo.id,
      titulo: objetivo.titulo,
      descricao: objetivo.descricao,
      donoId: objetivo.responsavelId,
      dono: {
        id: objetivo.responsavel.id,
        nome: objetivo.responsavel.nome,
        avatarUrl: objetivo.responsavel.avatarUrl,
      },
      periodoTipo: 'TRIMESTRE',
      periodoInicio: objetivo.periodoInicio,
      periodoFim: objetivo.periodoFim,
      status: objetivo.status,
      progresso: Number(objetivo.progresso),
      keyResults: objetivo.keyResults.map((kr) => ({
        id: kr.id,
        objetivoId: kr.objetivoId,
        titulo: kr.titulo,
        metrica: kr.metrica,
        baseline: Number(kr.valorBaseline),
        meta: Number(kr.valorMeta),
        atual: Number(kr.valorAtual),
        peso: Number(kr.peso),
        progresso: Number(kr.progresso),
        tarefas: kr.tarefas.map((t) => ({
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
        })),
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

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { titulo, descricao, status, responsavelId, progresso } = body

    const objetivo = await prisma.objective.update({
      where: { id: params.id },
      data: {
        titulo,
        descricao,
        status,
        responsavelId,
        progresso,
      },
    })

    return NextResponse.json(objetivo)
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

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se o objetivo pertence ao tenant do usuario
    const objetivo = await prisma.objective.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    })

    if (!objetivo) {
      return NextResponse.json({ error: 'Objetivo nao encontrado' }, { status: 404 })
    }

    // Excluir (cascade vai excluir KRs e tarefas relacionadas)
    await prisma.objective.delete({
      where: { id: params.id },
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
