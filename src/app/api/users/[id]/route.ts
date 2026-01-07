import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageUsers, canManageTenants } from '@/lib/permissions'
import { randomBytes } from 'crypto'

// GET - Buscar usuário por ID
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

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser || !canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // GESTOR só pode ver usuários da própria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário
export async function PUT(
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

    if (!currentUser || !canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // GESTOR só pode editar usuários da própria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== targetUser.tenantId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, perfil, ativo } = body

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        nome,
        perfil,
        ativo,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar usuário
export async function DELETE(
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

    if (!currentUser || !canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // GESTOR só pode desativar usuários da própria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== targetUser.tenantId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Não permitir desativar a si mesmo
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta' },
        { status: 400 }
      )
    }

    // Soft delete
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { ativo: false },
    })

    return NextResponse.json({ message: 'Usuário desativado com sucesso', user })
  } catch (error) {
    console.error('Erro ao desativar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar usuário' },
      { status: 500 }
    )
  }
}

// PATCH - Reenviar convite (gerar novo token)
export async function PATCH(
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

    if (!currentUser || !canManageUsers(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // GESTOR só pode reenviar convite para usuários da própria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== targetUser.tenantId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Só pode reenviar convite se o usuário ainda não ativou a conta
    if (!targetUser.primeiroAcesso) {
      return NextResponse.json(
        { error: 'Este usuário já ativou a conta' },
        { status: 400 }
      )
    }

    // Gerar novo token
    const tokenConvite = randomBytes(32).toString('hex')
    const tokenExpira = new Date()
    tokenExpira.setDate(tokenExpira.getDate() + 7)

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        tokenConvite,
        tokenExpira,
      },
    })

    return NextResponse.json({
      message: 'Novo convite gerado com sucesso',
      tokenConvite: user.tokenConvite,
    })
  } catch (error) {
    console.error('Erro ao reenviar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao reenviar convite' },
      { status: 500 }
    )
  }
}
