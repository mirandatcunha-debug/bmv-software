export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user } = await getTenantFromSession()

  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const empresa = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      usuarios: true,
      contasBancarias: true,
      _count: {
        select: {
          contasReceber: true,
          contasPagar: true
        }
      }
    }
  })

  if (!empresa) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  return NextResponse.json(empresa)
}
