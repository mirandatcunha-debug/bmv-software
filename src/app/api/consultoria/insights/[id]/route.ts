export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user } = await getTenantFromSession()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()

  const insight = await prisma.insight.update({
    where: { id: params.id },
    data: {
      lido: body.lido ?? undefined,
      lidoEm: body.lido ? new Date() : undefined
    }
  })

  return NextResponse.json(insight)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await prisma.insight.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
