export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { verificarTrial, verificarLimiteIA, verificarLimiteUsuarios } from '@/lib/trial'
import { getLimitesPlano } from '@/lib/feature-flags'

export async function GET() {
  const { user, tenant } = await getTenantFromSession()

  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const statusTrial = await verificarTrial(tenant.id)
  const limiteIA = await verificarLimiteIA(tenant.id)
  const limiteUsuarios = await verificarLimiteUsuarios(tenant.id)
  const limites = getLimitesPlano(tenant.plano)

  return NextResponse.json({
    planoAtual: tenant.plano,
    ...statusTrial,
    uso: {
      ia: {
        usados: limiteIA.usados,
        limite: limiteIA.limite,
        restantes: limiteIA.limite === -1 ? 'Ilimitado' : limiteIA.limite - limiteIA.usados
      },
      usuarios: {
        atual: limiteUsuarios.atual,
        limite: limiteUsuarios.limite
      },
      exportarRelatorios: limites.exportarRelatorios
    }
  })
}
