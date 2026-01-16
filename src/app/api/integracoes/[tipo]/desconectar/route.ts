export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { TipoERP } from '@/lib/integracoes/tipos'

export async function POST(request: Request, { params }: { params: { tipo: string } }) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const tipo = params.tipo.toUpperCase() as TipoERP

  await prisma.integracaoERP.deleteMany({
    where: { tenantId: tenant.id, tipo }
  })

  return NextResponse.json({ sucesso: true })
}
