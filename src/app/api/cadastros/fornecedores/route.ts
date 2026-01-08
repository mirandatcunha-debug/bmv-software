export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Prisma } from '@prisma/client'

// GET - Listar fornecedores do tenant
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const whereClause: Prisma.SupplierWhereInput = {}

    // Filtro por tenant (exceto para admin/consultor BMV)
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      whereClause.tenantId = user.tenantId
    } else {
      whereClause.tenantId = user.tenantId
    }

    // Filtro por status
    if (status === 'ativos') {
      whereClause.ativo = true
    } else if (status === 'inativos') {
      whereClause.ativo = false
    }

    // Filtro por busca (nome ou CPF/CNPJ)
    if (search) {
      const searchClean = search.replace(/\D/g, '')
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { cpfCnpj: { contains: searchClean } },
      ]
    }

    const fornecedores = await prisma.supplier.findMany({
      where: whereClause,
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json(fornecedores)
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar fornecedores' },
      { status: 500 }
    )
  }
}

// POST - Criar novo fornecedor
export async function POST(request: NextRequest) {
  try {
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
    } = body

    // Validar campos obrigatorios
    if (!nome || !tipo) {
      return NextResponse.json(
        { error: 'Nome e tipo sao obrigatorios' },
        { status: 400 }
      )
    }

    // Verificar se CPF/CNPJ ja existe
    if (cpfCnpj) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: { cpfCnpj },
      })

      if (existingSupplier) {
        return NextResponse.json(
          { error: 'Ja existe um fornecedor com este CPF/CNPJ' },
          { status: 400 }
        )
      }
    }

    // Gerar codigo sequencial para o tenant
    const lastSupplier = await prisma.supplier.findFirst({
      where: { tenantId: user.tenantId },
      orderBy: { codigo: 'desc' },
    })

    let nextCode = 1
    if (lastSupplier && lastSupplier.codigo) {
      const lastCodeNum = parseInt(lastSupplier.codigo.replace('FOR', ''), 10)
      if (!isNaN(lastCodeNum)) {
        nextCode = lastCodeNum + 1
      }
    }

    const codigo = 'FOR' + nextCode.toString().padStart(5, '0')

    const fornecedor = await prisma.supplier.create({
      data: {
        tenantId: user.tenantId,
        codigo,
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
      },
    })

    return NextResponse.json(fornecedor, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro ao criar fornecedor' },
      { status: 500 }
    )
  }
}
