export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantIdParam = searchParams.get('tenantId')

  const { user, tenant } = await getTenantFromSession()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const targetTenantId = isSuperAdminEmail(user.email) && tenantIdParam ? tenantIdParam : tenant?.id
  if (!targetTenantId) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })

  const acoes = await prisma.acaoConsultoria.findMany({
    where: { tenantId: targetTenantId },
    orderBy: [{ concluida: 'asc' }, { prioridade: 'desc' }, { createdAt: 'desc' }]
  })

  return NextResponse.json(acoes)
}

export async function POST(request: Request) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { tenantId, titulo, descricao, insightId, prioridade } = body

  const acao = await prisma.acaoConsultoria.create({
    data: { tenantId, titulo, descricao, insightId, prioridade: prioridade || 0 }
  })

  return NextResponse.json(acao)
}
