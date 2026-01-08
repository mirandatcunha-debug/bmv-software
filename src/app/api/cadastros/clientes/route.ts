export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Prisma } from '@prisma/client'

// GET - Listar clientes do tenant
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

    const whereClause: Prisma.ClientWhereInput = {}

    // Filtro por tenant (exceto para admin/consultor BMV)
    if (!['ADMIN_BMV', 'CONSULTOR_BMV'].includes(user.perfil)) {
      whereClause.tenantId = user.tenantId
    } else {
      // Se for admin/consultor, pode ver todos mas prefere filtrar pelo tenant atual
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

    const clientes = await prisma.client.findMany({
      where: whereClause,
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
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
      const existingClient = await prisma.client.findFirst({
        where: { cpfCnpj },
      })

      if (existingClient) {
        return NextResponse.json(
          { error: 'Ja existe um cliente com este CPF/CNPJ' },
          { status: 400 }
        )
      }
    }

    // Gerar codigo sequencial para o tenant
    const lastClient = await prisma.client.findFirst({
      where: { tenantId: user.tenantId },
      orderBy: { codigo: 'desc' },
    })

    let nextCode = 1
    if (lastClient && lastClient.codigo) {
      const lastCodeNum = parseInt(lastClient.codigo.replace('CLI', ''), 10)
      if (!isNaN(lastCodeNum)) {
        nextCode = lastCodeNum + 1
      }
    }

    const codigo = `CLI${nextCode.toString().padStart(5, '0')}`

    const cliente = await prisma.client.create({
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

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
