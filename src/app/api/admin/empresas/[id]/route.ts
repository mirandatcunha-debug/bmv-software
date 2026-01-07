import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageTenants } from '@/lib/permissions'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET - Buscar empresa por ID com usuarios
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params
    const id = params.id
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const empresa = await prisma.tenant.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            ultimoAcesso: true,
            criadoEm: true,
          },
          orderBy: { criadoEm: 'desc' },
        },
        _count: {
          select: { usuarios: true },
        },
      },
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(empresa)
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
  context: RouteContext
) {
  try {
    const params = await context.params
    const id = params.id
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se empresa existe
    const existingEmpresa = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!existingEmpresa) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { nome, cnpj, email, telefone, endereco, logoUrl, configuracoes, ativo } = body

    // Se CNPJ foi alterado, verificar unicidade
    if (cnpj && cnpj !== existingEmpresa.cnpj) {
      const cnpjExists = await prisma.tenant.findUnique({
        where: { cnpj },
      })

      if (cnpjExists) {
        return NextResponse.json(
          { error: 'CNPJ ja cadastrado em outra empresa' },
          { status: 400 }
        )
      }
    }

    const empresa = await prisma.tenant.update({
      where: { id },
      data: {
        nome,
        cnpj,
        email,
        telefone,
        endereco,
        logoUrl,
        configuracoes,
        ativo,
      },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar empresa (soft delete)
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params
    const id = params.id
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se empresa existe
    const existingEmpresa = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!existingEmpresa) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    // Soft delete - apenas desativar
    const empresa = await prisma.tenant.update({
      where: { id },
      data: { ativo: false },
    })

    return NextResponse.json({ message: 'Empresa desativada com sucesso', empresa })
  } catch (error) {
    console.error('Erro ao desativar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar empresa' },
      { status: 500 }
    )
  }
}
