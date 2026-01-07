import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageUsers, canManageTenants } from '@/lib/permissions'
import { randomBytes } from 'crypto'

// GET - Buscar usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
          },
        },
        permissoes: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // GESTOR so pode ver usuarios da propria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== usuario.tenantId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Erro ao buscar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuario' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // GESTOR so pode editar usuarios da propria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== targetUser.tenantId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, perfil, ativo } = body

    const usuario = await prisma.user.update({
      where: { id },
      data: {
        nome,
        perfil,
        ativo,
      },
    })

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Erro ao atualizar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar usuario (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // GESTOR so pode desativar usuarios da propria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== targetUser.tenantId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Nao permitir desativar a si mesmo
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: 'Voce nao pode desativar sua propria conta' },
        { status: 400 }
      )
    }

    // Soft delete
    const usuario = await prisma.user.update({
      where: { id },
      data: { ativo: false },
    })

    return NextResponse.json({ message: 'Usuario desativado com sucesso', usuario })
  } catch (error) {
    console.error('Erro ao desativar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar usuario' },
      { status: 500 }
    )
  }
}

// PATCH - Reenviar convite (gerar novo token)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // GESTOR so pode reenviar convite para usuarios da propria empresa
    if (!canManageTenants(currentUser.perfil) && currentUser.tenantId !== targetUser.tenantId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // So pode reenviar convite se o usuario ainda nao ativou a conta
    if (!targetUser.primeiroAcesso) {
      return NextResponse.json(
        { error: 'Este usuario ja ativou a conta' },
        { status: 400 }
      )
    }

    // Gerar novo token
    const tokenConvite = randomBytes(32).toString('hex')
    const tokenExpira = new Date()
    tokenExpira.setDate(tokenExpira.getDate() + 7)

    const usuario = await prisma.user.update({
      where: { id },
      data: {
        tokenConvite,
        tokenExpira,
      },
    })

    return NextResponse.json({
      message: 'Novo convite gerado com sucesso',
      tokenConvite: usuario.tokenConvite,
    })
  } catch (error) {
    console.error('Erro ao reenviar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao reenviar convite' },
      { status: 500 }
    )
  }
}
