import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageTenants } from '@/lib/permissions'

// GET - Buscar empresa por ID
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

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar empresa' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar empresa
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, email, telefone, endereco, ativo } = body

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        nome,
        email,
        telefone,
        endereco,
        ativo,
      },
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir empresa (soft delete - desativar)
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Soft delete - apenas desativar
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: { ativo: false },
    })

    return NextResponse.json({ message: 'Empresa desativada com sucesso', tenant })
  } catch (error) {
    console.error('Erro ao excluir empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir empresa' },
      { status: 500 }
    )
  }
}
