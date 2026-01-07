export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar objetivos OKR
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: Record<string, unknown> = {}

    // ADMIN_BMV e CONSULTOR_BMV podem ver todos os objetivos
    // Outros usuarios so veem objetivos do seu tenant
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      whereClause.tenantId = user.tenantId
    }

    if (status && status !== 'TODOS') {
      whereClause.status = status
    }

    const objetivos = await prisma.objective.findMany({
      where: whereClause,
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
      orderBy: { atualizadoEm: 'desc' },
    })

    const objetivosFormatados = objetivos.map((obj) => ({
      id: obj.id,
      tenantId: obj.tenantId,
      tenant: obj.tenant ? {
        id: obj.tenant.id,
        nome: obj.tenant.nome,
      } : null,
      responsavelId: obj.responsavelId,
      responsavel: obj.responsavel ? {
        id: obj.responsavel.id,
        nome: obj.responsavel.nome,
        email: obj.responsavel.email,
        avatarUrl: obj.responsavel.avatarUrl,
      } : null,
      titulo: obj.titulo,
      descricao: obj.descricao,
      periodoInicio: obj.periodoInicio,
      periodoFim: obj.periodoFim,
      status: obj.status,
      progresso: Number(obj.progresso),
      keyResults: obj.keyResults.map((kr) => ({
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
      criadoEm: obj.criadoEm,
      atualizadoEm: obj.atualizadoEm,
    }))

    return NextResponse.json(objetivosFormatados)
  } catch (error) {
    console.error('Erro ao listar objetivos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar objetivos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo objetivo OKR
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem criar objetivos
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { titulo, descricao, responsavelId, periodoInicio, periodoFim, status, tenantId } = body

    if (!titulo || !periodoInicio || !periodoFim) {
      return NextResponse.json(
        { error: 'Titulo, periodo de inicio e periodo de fim sao obrigatorios' },
        { status: 400 }
      )
    }

    // Determinar o tenantId correto
    const targetTenantId = tenantId || user.tenantId
    const targetResponsavelId = responsavelId || user.id

    const objetivo = await prisma.objective.create({
      data: {
        tenantId: targetTenantId,
        responsavelId: targetResponsavelId,
        titulo,
        descricao,
        periodoInicio: new Date(periodoInicio),
        periodoFim: new Date(periodoFim),
        status: status || 'NAO_INICIADO',
        progresso: 0,
      },
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
      keyResults: [],
      criadoEm: objetivo.criadoEm,
      atualizadoEm: objetivo.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar objetivo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar objetivo' },
      { status: 500 }
    )
  }
}
