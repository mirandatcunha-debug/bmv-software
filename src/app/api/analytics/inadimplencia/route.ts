import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { calcularInadimplencia, calcularTendenciaInadimplencia } from '@/lib/analytics/inadimplencia'

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

    const [inadimplencia, tendencia] = await Promise.all([
      calcularInadimplencia(tenant.id),
      calcularTendenciaInadimplencia(tenant.id),
    ])

    return NextResponse.json({
      ...inadimplencia,
      tendencia,
    })
  } catch (error) {
    console.error('Erro ao calcular inadimplência:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular inadimplência' },
      { status: 500 }
    )
  }
}
