import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Criar cliente Supabase com service role para criar usuários
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// GET - Validar token de convite
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { tokenConvite: params.token },
      include: {
        tenant: {
          select: {
            nome: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({
        valid: false,
        message: 'Convite não encontrado ou já utilizado',
      })
    }

    // Verificar se o token expirou
    if (user.tokenExpira && new Date() > user.tokenExpira) {
      return NextResponse.json({
        valid: false,
        expired: true,
        message: 'Este convite expirou',
      })
    }

    // Verificar se o usuário já ativou a conta
    if (!user.primeiroAcesso || user.authId) {
      return NextResponse.json({
        valid: false,
        message: 'Este convite já foi utilizado',
      })
    }

    return NextResponse.json({
      valid: true,
      nome: user.nome,
      email: user.email,
      empresa: user.tenant.nome,
    })
  } catch (error) {
    console.error('Erro ao validar convite:', error)
    return NextResponse.json(
      { valid: false, message: 'Erro ao validar convite' },
      { status: 500 }
    )
  }
}

// POST - Ativar conta com o convite
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { senha } = body

    if (!senha || senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo token
    const user = await prisma.user.findUnique({
      where: { tokenConvite: params.token },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou já utilizado' },
        { status: 404 }
      )
    }

    // Verificar se o token expirou
    if (user.tokenExpira && new Date() > user.tokenExpira) {
      return NextResponse.json(
        { error: 'Este convite expirou' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já ativou a conta
    if (!user.primeiroAcesso || user.authId) {
      return NextResponse.json(
        { error: 'Este convite já foi utilizado' },
        { status: 400 }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: senha,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        nome: user.nome,
        perfil: user.perfil,
        tenantId: user.tenantId,
      },
    })

    if (authError) {
      console.error('Erro ao criar usuário no Supabase:', authError)
      return NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      )
    }

    // Atualizar usuário no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authId: authData.user.id,
        primeiroAcesso: false,
        tokenConvite: null,
        tokenExpira: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Conta ativada com sucesso!',
    })
  } catch (error) {
    console.error('Erro ao ativar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao ativar conta' },
      { status: 500 }
    )
  }
}
