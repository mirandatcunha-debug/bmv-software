import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageUsers, canManageTenants } from '@/lib/permissions'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Listar usuários de uma empresa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // ADMIN_BMV e CONSULTOR_BMV podem ver usuários de qualquer empresa
    // GESTOR só pode ver usuários da própria empresa
    if (!canManageTenants(user.perfil) && user.tenantId !== params.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    if (!canManageUsers(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
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
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário (gerar convite)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // ADMIN_BMV e CONSULTOR_BMV podem criar usuários em qualquer empresa
    // GESTOR só pode criar usuários na própria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== params.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    if (!canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, email, perfil } = body

    if (!nome || !email || !perfil) {
      return NextResponse.json(
        { error: 'Nome, email e perfil são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se a empresa existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
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
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
