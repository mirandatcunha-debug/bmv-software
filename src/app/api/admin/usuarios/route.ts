import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageUsers, canManageTenants } from '@/lib/permissions'
import { randomBytes } from 'crypto'

// GET - Listar todos os usuarios
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser || !canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const tenantId = searchParams.get('tenantId') || ''
    const perfil = searchParams.get('perfil') || ''

    const where: Record<string, unknown> = {}

    // GESTOR so pode ver usuarios da propria empresa
    if (!canManageTenants(currentUser.perfil)) {
      where.tenantId = currentUser.tenantId
    } else if (tenantId) {
      where.tenantId = tenantId
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.ativo = status === 'active'
    }

    if (perfil) {
      where.perfil = perfil
    }

    const usuarios = await prisma.user.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Erro ao listar usuarios:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuarios' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuario
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser || !canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { tenantId, nome, email, perfil } = body

    if (!tenantId || !nome || !email || !perfil) {
      return NextResponse.json(
        { error: 'TenantId, nome, email e perfil sao obrigatorios' },
        { status: 400 }
      )
    }

    // GESTOR so pode criar usuarios na propria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se email ja existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ja cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se a empresa existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    // Gerar token de convite
    const tokenConvite = randomBytes(32).toString('hex')
    const tokenExpira = new Date()
    tokenExpira.setDate(tokenExpira.getDate() + 7) // 7 dias

    const usuario = await prisma.user.create({
      data: {
        tenantId,
        nome,
        email,
        perfil,
        ativo: true,
        primeiroAcesso: true,
        tokenConvite,
        tokenExpira,
      },
    })

    return NextResponse.json({
      id: usuario.id,
      tenantId: usuario.tenantId,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      tokenConvite: usuario.tokenConvite,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuario' },
      { status: 500 }
    )
  }
}
