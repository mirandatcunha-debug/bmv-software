import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Obter dados da empresa
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

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      id: tenant.id,
      nome: tenant.nome,
      cnpj: tenant.cnpj,
      email: tenant.email,
      telefone: tenant.telefone,
      endereco: tenant.endereco,
      logoUrl: tenant.logoUrl,
      configuracoes: tenant.configuracoes,
    })
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da empresa' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar dados da empresa
export async function PUT(request: NextRequest) {
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

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, cnpj, email, telefone, endereco, logoUrl, configuracoes } = body

    if (!nome) {
      return NextResponse.json(
        { message: 'Nome da empresa e obrigatorio' },
        { status: 400 }
      )
    }

    const updateData: {
      nome: string
      cnpj?: string
      email?: string
      telefone?: string
      endereco?: string
      logoUrl?: string
      configuracoes?: object
    } = { nome }
    if (cnpj !== undefined) updateData.cnpj = cnpj
    if (email !== undefined) updateData.email = email
    if (telefone !== undefined) updateData.telefone = telefone
    if (endereco !== undefined) updateData.endereco = endereco
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (configuracoes !== undefined) updateData.configuracoes = configuracoes as object

    const tenant = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: updateData,
    })

    return NextResponse.json({
      id: tenant.id,
      nome: tenant.nome,
      cnpj: tenant.cnpj,
      email: tenant.email,
      telefone: tenant.telefone,
      endereco: tenant.endereco,
      logoUrl: tenant.logoUrl,
      configuracoes: tenant.configuracoes,
    })
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    )
  }
}
