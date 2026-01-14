export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { tenantId, cursoId, motivo } = body

  if (!tenantId || !cursoId) {
    return NextResponse.json({ error: 'tenantId e cursoId são obrigatórios' }, { status: 400 })
  }

  const acesso = await prisma.acessoCurso.upsert({
    where: { tenantId_cursoId: { tenantId, cursoId } },
    update: { liberadoPor: user.email, motivo },
    create: { tenantId, cursoId, liberadoPor: user.email, motivo }
  })

  return NextResponse.json(acesso)
}

export async function DELETE(request: Request) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId')
  const cursoId = searchParams.get('cursoId')

  if (!tenantId || !cursoId) {
    return NextResponse.json({ error: 'tenantId e cursoId são obrigatórios' }, { status: 400 })
  }

  await prisma.acessoCurso.delete({
    where: { tenantId_cursoId: { tenantId, cursoId } }
  })

  return NextResponse.json({ success: true })
}
