export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { criarAssinatura, PRECOS_PLANOS, PlanoType, PeriodoType } from '@/lib/pagamento'

// POST: Criar sessão de checkout
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar usuário no banco
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { tenant: true },
    })

    if (!dbUser || !dbUser.tenant) {
      return NextResponse.json(
        { error: 'Usuário ou empresa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já tem assinatura ativa
    if (dbUser.tenant.assinaturaAtiva && dbUser.tenant.plano !== 'TRIAL') {
      return NextResponse.json(
        { error: 'Você já possui uma assinatura ativa. Gerencie sua assinatura nas configurações.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { plano, periodo = 'mensal' } = body as { plano: string; periodo?: PeriodoType }

    // Validar plano
    const planoUpper = plano?.toUpperCase() as PlanoType
    if (!planoUpper || !PRECOS_PLANOS[planoUpper]) {
      return NextResponse.json(
        { error: 'Plano inválido. Escolha: BASICO, PROFISSIONAL ou ENTERPRISE' },
        { status: 400 }
      )
    }

    // Criar registro de tentativa de pagamento
    // Em produção, isso seria salvo em uma tabela de pagamentos
    console.log(`[Checkout] Tentativa de pagamento:`, {
      tenantId: dbUser.tenantId,
      userId: dbUser.id,
      plano: planoUpper,
      periodo,
      timestamp: new Date().toISOString(),
    })

    // Criar sessão de checkout (mockada por enquanto)
    const resultado = await criarAssinatura(
      planoUpper,
      dbUser.tenantId,
      periodo,
      dbUser.email
    )

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error || 'Erro ao criar sessão de checkout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: resultado.checkoutUrl,
      sessionId: resultado.sessionId,
      plano: PRECOS_PLANOS[planoUpper],
      periodo,
    })
  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET: Obter informações de preços dos planos
export async function GET() {
  try {
    return NextResponse.json({
      planos: PRECOS_PLANOS,
      moeda: 'BRL',
      gateway: 'stripe', // ou 'mercadopago'
    })
  } catch (error) {
    console.error('Erro ao obter planos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
