export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { user } = await getTenantFromSession()

  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const empresas = await prisma.tenant.findMany({
    include: {
      _count: { select: { usuarios: true } }
    },
    orderBy: { criadoEm: 'desc' }
  })

  return NextResponse.json(empresas)
}
