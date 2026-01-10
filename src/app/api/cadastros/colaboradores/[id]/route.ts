export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Buscar colaborador por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params

    const colaborador = await prisma.user.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
        ultimoAcesso: true,
        emailVerificado: true,
      },
    })

    if (!colaborador) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 })
    }

    return NextResponse.json(colaborador)
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar colaborador' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar colaborador
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    // Verificar se é gestor ou admin
    if (!['GESTOR', 'ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      return NextResponse.json(
        { error: 'Sem permissão para editar colaboradores' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { nome, email, perfil, ativo } = body

    // Verificar se colaborador existe e pertence ao tenant
    const colaboradorExistente = await prisma.user.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!colaboradorExistente) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 })
    }

    // Não permitir editar ADMIN_BMV ou CONSULTOR_BMV
    if (['ADMIN_BMV', 'CONSULTOR_BMV'].includes(colaboradorExistente.perfil)) {
      return NextResponse.json(
        { error: 'Não é possível editar usuários BMV' },
        { status: 403 }
      )
    }

    // Validar perfil se estiver sendo alterado
    if (perfil && !['GESTOR', 'COLABORADOR'].includes(perfil)) {
      return NextResponse.json(
        { error: 'Perfil inválido. Use GESTOR ou COLABORADOR' },
        { status: 400 }
      )
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (email && email !== colaboradorExistente.email) {
      const emailExistente = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      })

      if (emailExistente) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este email' },
          { status: 400 }
        )
      }
    }

    const colaboradorAtualizado = await prisma.user.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(perfil && { perfil }),
        ...(typeof ativo === 'boolean' && { ativo }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    })

    return NextResponse.json(colaboradorAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar colaborador' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar colaborador
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    // Verificar se é gestor ou admin
    if (!['GESTOR', 'ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      return NextResponse.json(
        { error: 'Sem permissão para desativar colaboradores' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    // Verificar se colaborador existe e pertence ao tenant
    const colaborador = await prisma.user.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!colaborador) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 })
    }

    // Não permitir desativar ADMIN_BMV ou CONSULTOR_BMV
    if (['ADMIN_BMV', 'CONSULTOR_BMV'].includes(colaborador.perfil)) {
      return NextResponse.json(
        { error: 'Não é possível desativar usuários BMV' },
        { status: 403 }
      )
    }

    // Não permitir desativar a si mesmo
    if (colaborador.id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode desativar seu próprio usuário' },
        { status: 400 }
      )
    }

    // Desativar (soft delete)
    await prisma.user.update({
      where: { id },
      data: { ativo: false },
    })

    return NextResponse.json({ message: 'Colaborador desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao desativar colaborador:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar colaborador' },
      { status: 500 }
    )
  }
}
