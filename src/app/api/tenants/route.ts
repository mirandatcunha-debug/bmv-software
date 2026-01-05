import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { canManageTenants } from '@/lib/permissions'

// GET - Listar todas as empresas
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e verificar permissão
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.ativo = status === 'active'
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Erro ao listar empresas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar empresas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e verificar permissão
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user || !canManageTenants(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, cnpj, email, telefone, endereco, plano } = body

    if (!nome || !cnpj) {
      return NextResponse.json(
        { error: 'Nome e CNPJ são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se CNPJ já existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { cnpj },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      )
    }

    const tenant = await prisma.tenant.create({
      data: {
        nome,
        cnpj,
        email,
        telefone,
        endereco,
        plano: plano || 'BASICO',
        ativo: true,
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar empresa' },
      { status: 500 }
    )
  }
}
