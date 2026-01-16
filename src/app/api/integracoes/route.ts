export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { ERPS_DISPONIVEIS } from '@/lib/integracoes/tipos'

export async function GET() {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Buscar integrações ativas do tenant
  const integracoes = await prisma.integracaoERP.findMany({
    where: { tenantId: tenant.id },
    select: {
      id: true,
      tipo: true,
      nome: true,
      ativa: true,
      ultimaSync: true,
      statusSync: true,
      erroSync: true,
      createdAt: true
    }
  })

  // Combinar com ERPs disponíveis
  const erpsComStatus = ERPS_DISPONIVEIS.map(erp => {
    const integracao = integracoes.find(i => i.tipo === erp.tipo)
    return {
      ...erp,
      conectado: !!integracao,
      integracao: integracao || null
    }
  })

  return NextResponse.json(erpsComStatus)
}
