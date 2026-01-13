export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const PLANOS = {
  basico: { nome: 'Básico', valor: 97 },
  pro: { nome: 'Pro', valor: 197 },
  enterprise: { nome: 'Enterprise', valor: 397 },
} as const

type PlanoKey = keyof typeof PLANOS

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plano } = body as { plano: PlanoKey }

    if (!plano || !PLANOS[plano]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const planoSelecionado = PLANOS[plano]

    // TODO: Integrar Mercado Pago SDK real
    // Por enquanto retorna URL simulada para desenvolvimento
    const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=SIMULADO_${plano}_${Date.now()}`

    return NextResponse.json({
      checkoutUrl,
      plano: planoSelecionado.nome,
      valor: planoSelecionado.valor,
    })
  } catch (error) {
    console.error('Erro ao criar preferência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
