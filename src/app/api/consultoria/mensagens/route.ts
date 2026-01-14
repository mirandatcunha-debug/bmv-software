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

  const mensagens = await prisma.mensagemConsultor.findMany({
    where: { tenantId: targetTenantId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(mensagens)
}

export async function POST(request: Request) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { tenantId, mensagem } = body

  const msg = await prisma.mensagemConsultor.create({
    data: {
      tenantId,
      mensagem,
      autor: user.nome || user.email
    }
  })

  return NextResponse.json(msg)
}
