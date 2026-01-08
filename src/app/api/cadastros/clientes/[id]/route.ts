export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Buscar cliente por ID
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

    const cliente = await prisma.client.findUnique({
      where: { id },
      include: {
        contasReceber: {
          orderBy: { dataVencimento: 'desc' },
          take: 10,
        },
      },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente nao encontrado' }, { status: 404 })
    }

    // Verificar se o usuario tem acesso ao cliente
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil) && cliente.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente
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

    const cliente = await prisma.client.findUnique({
      where: { id },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente nao encontrado' }, { status: 404 })
    }

    // Verificar se o usuario tem acesso ao cliente
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil) && cliente.tenantId !== user.tenantId) {
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

    // Verificar se CPF/CNPJ ja existe em outro cliente
    if (cpfCnpj) {
      const existingClient = await prisma.client.findFirst({
        where: {
          cpfCnpj,
          NOT: { id },
        },
      })

      if (existingClient) {
        return NextResponse.json(
          { error: 'Ja existe outro cliente com este CPF/CNPJ' },
          { status: 400 }
        )
      }
    }

    const clienteAtualizado = await prisma.client.update({
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
        ativo: ativo !== undefined ? ativo : cliente.ativo,
      },
      include: {
        contasReceber: {
          orderBy: { dataVencimento: 'desc' },
          take: 10,
        },
      },
    })

    return NextResponse.json(clienteAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar cliente (soft delete)
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

    const cliente = await prisma.client.findUnique({
      where: { id },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente nao encontrado' }, { status: 404 })
    }

    // Verificar se o usuario tem acesso ao cliente
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil) && cliente.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Soft delete - apenas desativa o cliente
    const clienteDesativado = await prisma.client.update({
      where: { id },
      data: { ativo: false },
    })

    return NextResponse.json(clienteDesativado)
  } catch (error) {
    console.error('Erro ao desativar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar cliente' },
      { status: 500 }
    )
  }
}
