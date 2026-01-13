import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { calcularCicloFinanceiro } from '@/lib/analytics/ciclo-financeiro'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { error, tenant } = await getTenantFromSession()

    if (error || !tenant) {
      return NextResponse.json(
        { error: error || 'Tenant não encontrado' },
        { status: 401 }
      )
    }

    const ciclo = await calcularCicloFinanceiro(tenant.id)

    return NextResponse.json({
      success: true,
      data: ciclo
    })
  } catch (error) {
    console.error('Erro ao calcular ciclo financeiro:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular ciclo financeiro' },
      { status: 500 }
    )
  }
}
