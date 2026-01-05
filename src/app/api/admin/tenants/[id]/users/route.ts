import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageUsers, canManageTenants } from '@/lib/permissions'
import { randomBytes } from 'crypto'

// GET - Listar usuarios de uma empresa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
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

    // ADMIN_BMV e CONSULTOR_BMV podem ver usuarios de qualquer empresa
    // GESTOR so pode ver usuarios da propria empresa
    if (!canManageTenants(user.perfil) && user.tenantId !== params.id) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    if (!canManageUsers(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { tenantId: params.id },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        primeiroAcesso: true,
        tokenConvite: true,
        tokenExpira: true,
        ultimoAcesso: true,
        criadoEm: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao listar usuarios:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuarios' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuario (gerar convite)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // ADMIN_BMV e CONSULTOR_BMV podem criar usuarios em qualquer empresa
    // GESTOR so pode criar usuarios na propria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== params.id) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    if (!canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, email, perfil } = body

    if (!nome || !email || !perfil) {
      return NextResponse.json(
        { error: 'Nome, email e perfil sao obrigatorios' },
        { status: 400 }
      )
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
      where: { id: params.id },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    // Gerar token de convite
    const tokenConvite = randomBytes(32).toString('hex')
    const tokenExpira = new Date()
    tokenExpira.setDate(tokenExpira.getDate() + 7) // 7 dias

    const user = await prisma.user.create({
      data: {
        tenantId: params.id,
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
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      tokenConvite: user.tokenConvite,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuario' },
      { status: 500 }
    )
  }
}
