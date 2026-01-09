export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

interface RegistroRequest {
  nome: string
  email: string
  senha: string
  nomeEmpresa: string
}

// POST - Registrar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body: RegistroRequest = await request.json()
    const { nome, email, senha, nomeEmpresa } = body

    // Validações básicas
    if (!nome || !email || !senha || !nomeEmpresa) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se email já existe no Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Criar usuário no Supabase Auth
    const supabase = await createServerComponentClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (authError) {
      console.error('Erro no Supabase Auth:', authError)

      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário no sistema de autenticação' },
        { status: 500 }
      )
    }

    // Calcular data de expiração do trial (7 dias)
    const trialInicio = new Date()
    const trialExpira = new Date()
    trialExpira.setDate(trialExpira.getDate() + 7)

    // Criar Tenant e User em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar Tenant
      const tenant = await tx.tenant.create({
        data: {
          nome: nomeEmpresa,
          email: email,
          plano: 'TRIAL',
          trialInicio,
          trialExpira,
          assinaturaAtiva: false,
          ativo: true,
        },
      })

      // Criar User
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          authId: authData.user!.id,
          email,
          nome,
          perfil: 'GESTOR',
          ativo: true,
        },
      })

      return { tenant, user }
    })

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso',
      user: {
        id: result.user.id,
        nome: result.user.nome,
        email: result.user.email,
        perfil: result.user.perfil,
        tenantId: result.user.tenantId,
        tenant: {
          id: result.tenant.id,
          nome: result.tenant.nome,
          plano: result.tenant.plano,
          trialExpira: result.tenant.trialExpira,
        },
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao registrar usuário:', error)

    if (error instanceof Error) {
      // Erro de constraint unique do Prisma
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
