export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getPlanLimit } from '@/lib/plan-limits'

interface TenantConfiguracoes {
  analisesIAHoje?: number
  ultimaAnaliseIA?: string
}

// GET - Retornar status de uso de análises IA
export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
      include: { tenant: true }
    })

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const tenant = user.tenant
    const configuracoes = (tenant.configuracoes as TenantConfiguracoes) || {}

    // Verificar se passou da meia-noite (resetar contador)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const ultimaAnalise = configuracoes.ultimaAnaliseIA
      ? new Date(configuracoes.ultimaAnaliseIA)
      : null

    let analisesHoje = configuracoes.analisesIAHoje || 0

    // Se a última análise foi em um dia anterior, contador é zero
    if (ultimaAnalise) {
      const ultimaAnaliseDia = new Date(ultimaAnalise)
      ultimaAnaliseDia.setHours(0, 0, 0, 0)

      if (ultimaAnaliseDia.getTime() < hoje.getTime()) {
        analisesHoje = 0
      }
    }

    // Obter limite do plano
    const limiteAnalisesIA = getPlanLimit(tenant.plano, 'analisesIA')
    const ilimitado = limiteAnalisesIA === -1

    // Calcular percentual de uso
    const percentual = ilimitado ? 0 : Math.round((analisesHoje / limiteAnalisesIA) * 100)

    // Calcular quando reseta (meia-noite do próximo dia)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    return NextResponse.json({
      analisesHoje,
      limite: limiteAnalisesIA,
      ilimitado,
      percentual: Math.min(percentual, 100),
      atingiuLimite: !ilimitado && analisesHoje >= limiteAnalisesIA,
      resetaEm: amanha.toISOString(),
      plano: tenant.plano
    })
  } catch (error) {
    console.error('Erro ao buscar status de análises IA:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar status' },
      { status: 500 }
    )
  }
}
