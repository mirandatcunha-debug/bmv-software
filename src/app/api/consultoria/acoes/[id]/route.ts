export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user } = await getTenantFromSession()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()

  const acao = await prisma.acaoConsultoria.update({
    where: { id: params.id },
    data: {
      concluida: body.concluida ?? undefined,
      concluidaEm: body.concluida ? new Date() : null
    }
  })

  return NextResponse.json(acao)
}
