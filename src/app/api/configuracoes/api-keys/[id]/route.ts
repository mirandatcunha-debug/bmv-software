export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()

  const apiKey = await prisma.apiKey.updateMany({
    where: { id: params.id, tenantId: tenant.id },
    data: { ativa: body.ativa }
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  await prisma.apiKey.deleteMany({
    where: { id: params.id, tenantId: tenant.id }
  })

  return NextResponse.json({ success: true })
}
