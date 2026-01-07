import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar centros de custo
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
    const apenasAtivos = searchParams.get('ativos') === 'true'

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (apenasAtivos) {
      whereClause.ativo = true
    }

    const centrosCusto = await prisma.costCenter.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { lancamentos: true },
        },
      },
      orderBy: { codigo: 'asc' },
    })

    const centrosFormatados = centrosCusto.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      codigo: c.codigo,
      nome: c.nome,
      descricao: c.descricao,
      responsavel: c.responsavel,
      ativo: c.ativo,
      totalLancamentos: c._count.lancamentos,
      criadoEm: c.criadoEm,
      atualizadoEm: c.atualizadoEm,
    }))

    return NextResponse.json(centrosFormatados)
  } catch (error) {
    console.error('Erro ao listar centros de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao listar centros de custo' },
      { status: 500 }
    )
  }
}

// POST - Criar novo centro de custo
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem criar centros de custo
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { codigo, nome, descricao, responsavel } = body

    if (!codigo || !nome) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: codigo, nome' },
        { status: 400 }
      )
    }

    // Verificar se o codigo ja existe no tenant
    const centroExistente = await prisma.costCenter.findFirst({
      where: {
        tenantId: user.tenantId,
        codigo,
      },
    })

    if (centroExistente) {
      return NextResponse.json(
        { error: 'Ja existe um centro de custo com este codigo' },
        { status: 409 }
      )
    }

    const novoCentro = await prisma.costCenter.create({
      data: {
        tenantId: user.tenantId,
        codigo,
        nome,
        descricao: descricao || null,
        responsavel: responsavel || null,
        ativo: true,
      },
    })

    return NextResponse.json({
      id: novoCentro.id,
      tenantId: novoCentro.tenantId,
      codigo: novoCentro.codigo,
      nome: novoCentro.nome,
      descricao: novoCentro.descricao,
      responsavel: novoCentro.responsavel,
      ativo: novoCentro.ativo,
      criadoEm: novoCentro.criadoEm,
      atualizadoEm: novoCentro.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar centro de custo' },
      { status: 500 }
    )
  }
}
