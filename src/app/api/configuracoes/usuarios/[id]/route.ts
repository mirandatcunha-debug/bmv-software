import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Obter usuario por ID
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

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        tenantId: currentUser.tenantId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      perfil: user.perfil,
      ativo: user.ativo,
      primeiroAcesso: user.primeiroAcesso,
      ultimoAcesso: user.ultimoAcesso,
      criadoEm: user.criadoEm,
    })
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

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se usuario pertence ao mesmo tenant
    const targetUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        tenantId: currentUser.tenantId,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Gestor nao pode editar ADMIN_BMV ou CONSULTOR_BMV
    if (currentUser.perfil === 'GESTOR' && ['ADMIN_BMV', 'CONSULTOR_BMV'].includes(targetUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao para editar este usuario' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, telefone, perfil, ativo } = body

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome
    if (telefone !== undefined) updateData.telefone = telefone
    if (perfil !== undefined) {
      // Validar perfil
      const perfisValidos = ['GESTOR', 'COLABORADOR', 'CLIENTE']
      if (!perfisValidos.includes(perfil)) {
        return NextResponse.json({ message: 'Perfil invalido' }, { status: 400 })
      }
      updateData.perfil = perfil
    }
    if (ativo !== undefined) updateData.ativo = ativo

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      id: updatedUser.id,
      nome: updatedUser.nome,
      email: updatedUser.email,
      perfil: updatedUser.perfil,
      ativo: updatedUser.ativo,
    })
  } catch (error) {
    console.error('Erro ao atualizar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuario' },
      { status: 500 }
    )
  }
}
