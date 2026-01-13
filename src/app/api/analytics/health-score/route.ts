import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { calcularHealthScore } from '@/lib/analytics/health-score'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { tenant, error } = await getTenantFromSession()

    if (error || !tenant) {
      return NextResponse.json(
        { error: error || 'Não autorizado' },
        { status: 401 }
      )
    }

    const healthScore = await calcularHealthScore(tenant.id)

    return NextResponse.json(healthScore)
  } catch (error) {
    console.error('Erro ao calcular health score:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular health score' },
      { status: 500 }
    )
  }
}
