export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Buscar fornecedor por ID
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const fornecedor = await prisma.supplier.findUnique({
      where: { id },
      include: {
        contasPagar: {
          orderBy: { dataVencimento: 'desc' },
          take: 10,
        },
      },
    })

    if (!fornecedor) {
      return NextResponse.json({ error: 'Fornecedor nao encontrado' }, { status: 404 })
    }

    // Verificar se o usuario tem acesso ao fornecedor
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil) && fornecedor.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(fornecedor)
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar fornecedor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar fornecedor
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const fornecedor = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!fornecedor) {
      return NextResponse.json({ error: 'Fornecedor nao encontrado' }, { status: 404 })
    }

    // Verificar se o usuario tem acesso ao fornecedor
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil) && fornecedor.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      nome,
      tipo,
      cpfCnpj,
      endereco,
      cidade,
      uf,
      cep,
      telefone,
      email,
      nomeContato,
      observacoes,
      ativo,
    } = body

    // Validar campos obrigatorios
    if (!nome || !tipo) {
      return NextResponse.json(
        { error: 'Nome e tipo sao obrigatorios' },
        { status: 400 }
      )
    }

    // Verificar se CPF/CNPJ ja existe em outro fornecedor
    if (cpfCnpj) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          cpfCnpj,
          NOT: { id },
        },
      })

      if (existingSupplier) {
        return NextResponse.json(
          { error: 'Ja existe outro fornecedor com este CPF/CNPJ' },
          { status: 400 }
        )
      }
    }

    const fornecedorAtualizado = await prisma.supplier.update({
      where: { id },
      data: {
        nome,
        tipo,
        cpfCnpj: cpfCnpj || null,
        endereco: endereco || null,
        cidade: cidade || null,
        uf: uf || null,
        cep: cep || null,
        telefone: telefone || null,
        email: email || null,
        nomeContato: nomeContato || null,
        observacoes: observacoes || null,
        ativo: ativo !== undefined ? ativo : fornecedor.ativo,
      },
      include: {
        contasPagar: {
          orderBy: { dataVencimento: 'desc' },
          take: 10,
        },
      },
    })

    return NextResponse.json(fornecedorAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar fornecedor' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar fornecedor (soft delete)
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const fornecedor = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!fornecedor) {
      return NextResponse.json({ error: 'Fornecedor nao encontrado' }, { status: 404 })
    }

    // Verificar se o usuario tem acesso ao fornecedor
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil) && fornecedor.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Soft delete - apenas desativa o fornecedor
    const fornecedorDesativado = await prisma.supplier.update({
      where: { id },
      data: { ativo: false },
    })

    return NextResponse.json(fornecedorDesativado)
  } catch (error) {
    console.error('Erro ao desativar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar fornecedor' },
      { status: 500 }
    )
  }
}
