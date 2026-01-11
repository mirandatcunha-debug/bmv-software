export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Prisma } from '@prisma/client'
import { hasReachedLimit, getPlanLimit } from '@/lib/plan-limits'

// GET - Listar colaboradores do tenant
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const perfil = searchParams.get('perfil')

    const whereClause: Prisma.UserWhereInput = {
      tenantId: user.tenantId,
    }

    // Filtro por status
    if (status === 'ativos') {
      whereClause.ativo = true
    } else if (status === 'inativos') {
      whereClause.ativo = false
    }

    // Filtro por perfil
    if (perfil && ['GESTOR', 'COLABORADOR'].includes(perfil)) {
      whereClause.perfil = perfil as 'GESTOR' | 'COLABORADOR'
    }

    // Filtro por busca (nome ou email)
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const colaboradores = await prisma.user.findMany({
      where: whereClause,
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        cargo: true,
        ativo: true,
        criadoEm: true,
        ultimoAcesso: true,
        emailVerificado: true,
      },
    })

    // Contar total de usuários do tenant
    const totalUsuarios = await prisma.user.count({
      where: { tenantId: user.tenantId },
    })

    // Obter limite do plano
    const limiteUsuarios = getPlanLimit(user.tenant.plano, 'usuarios')

    return NextResponse.json({
      colaboradores,
      total: colaboradores.length,
      totalUsuarios,
      limiteUsuarios,
      plano: user.tenant.plano,
    })
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar colaboradores' },
      { status: 500 }
    )
  }
}

// POST - Criar novo colaborador
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se é gestor ou admin
    if (!['GESTOR', 'ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar colaboradores' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nome, email, perfil, cargo } = body

    // Validar campos obrigatórios
    if (!nome || !email || !perfil || !cargo) {
      return NextResponse.json(
        { error: 'Nome, email, perfil e cargo são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar cargo
    const cargosValidos = ['DIRETOR', 'GERENTE', 'ANALISTA', 'ASSISTENTE']
    if (!cargosValidos.includes(cargo.toUpperCase())) {
      return NextResponse.json(
        { error: 'Cargo inválido. Use DIRETOR, GERENTE, ANALISTA ou ASSISTENTE' },
        { status: 400 }
      )
    }

    // Validar perfil
    if (!['GESTOR', 'COLABORADOR'].includes(perfil)) {
      return NextResponse.json(
        { error: 'Perfil inválido. Use GESTOR ou COLABORADOR' },
        { status: 400 }
      )
    }

    // Verificar limite de usuários do plano
    const totalUsuarios = await prisma.user.count({
      where: { tenantId: user.tenantId },
    })

    if (hasReachedLimit(totalUsuarios, user.tenant.plano, 'usuarios')) {
      const limite = getPlanLimit(user.tenant.plano, 'usuarios')
      return NextResponse.json(
        {
          error: 'Limite de usuários atingido',
          message: `Seu plano ${user.tenant.plano} permite até ${limite} usuários. Faça upgrade para adicionar mais colaboradores.`,
          limite,
          atual: totalUsuarios,
        },
        { status: 403 }
      )
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findFirst({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 400 }
      )
    }

    // Gerar token de convite (válido por 7 dias)
    const tokenConvite = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`
    const tokenExpira = new Date()
    tokenExpira.setDate(tokenExpira.getDate() + 7)

    // Criar usuário no banco (sem authId ainda)
    const novoColaborador = await prisma.user.create({
      data: {
        tenantId: user.tenantId,
        email,
        nome,
        perfil,
        cargo: cargo.toUpperCase(),
        tokenConvite,
        tokenExpira,
        ativo: true,
        emailVerificado: false,
        primeiroAcesso: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        cargo: true,
        ativo: true,
        criadoEm: true,
        tokenConvite: true,
      },
    })

    // TODO: Enviar email de convite com link para definir senha
    // Link seria algo como: /convite?token=${tokenConvite}
    // Por enquanto, retornamos o token para simular

    return NextResponse.json({
      ...novoColaborador,
      conviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/convite?token=${tokenConvite}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar colaborador:', error)
    return NextResponse.json(
      { error: 'Erro ao criar colaborador' },
      { status: 500 }
    )
  }
}
