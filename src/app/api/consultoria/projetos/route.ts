export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar projetos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar usuario e seu tenant
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Filtros baseados no perfil do usuario
    const whereClause: any = {}

    // ADMIN_BMV e CONSULTOR_BMV podem ver todos os projetos
    // Outros usuarios so veem projetos do seu tenant
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      whereClause.tenantId = user.tenantId
    }

    if (status && status !== 'TODOS') {
      whereClause.status = status
    }

    const projetos = await prisma.consultingProject.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            email: true,
            cnpj: true,
          },
        },
        tarefas: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { atualizadoEm: 'desc' },
    })

    const projetosFormatados = projetos.map((p) => ({
      id: p.id,
      tenantId: p.tenantId,
      nome: p.nome,
      descricao: p.descricao,
      cliente: p.tenant ? {
        id: p.tenant.id,
        nome: p.tenant.nome,
        email: p.tenant.email,
        cnpj: p.tenant.cnpj,
      } : null,
      dataInicio: p.dataInicio,
      dataFim: p.dataFim,
      status: p.status,
      progresso: Number(p.progresso),
      totalTarefas: p.tarefas.length,
      tarefasConcluidas: p.tarefas.filter((t) => t.status === 'CONCLUIDO').length,
      criadoEm: p.criadoEm,
      atualizadoEm: p.atualizadoEm,
    }))

    return NextResponse.json(projetosFormatados)
  } catch (error) {
    console.error('Erro ao listar projetos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar projetos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem criar projetos
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, clienteId, descricao, consultorId, dataInicio, dataPrevista, status } = body

    if (!nome || !clienteId || !dataInicio) {
      return NextResponse.json(
        { error: 'Nome, cliente e data de inicio sao obrigatorios' },
        { status: 400 }
      )
    }

    const projeto = await prisma.consultingProject.create({
      data: {
        tenantId: clienteId,
        nome,
        descricao,
        dataInicio: new Date(dataInicio),
        dataFim: dataPrevista ? new Date(dataPrevista) : null,
        status: status || 'NAO_INICIADO',
        progresso: 0,
      },
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
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    )
  }
}
