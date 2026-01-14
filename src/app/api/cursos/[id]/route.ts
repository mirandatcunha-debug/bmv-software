export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user, tenant } = await getTenantFromSession()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const curso = await prisma.curso.findUnique({
    where: { id: params.id },
    include: {
      aulas: {
        where: { ativo: true },
        orderBy: { ordem: 'asc' }
      }
    }
  })

  if (!curso) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })

  // Verificar acesso
  let temAcesso = isSuperAdminEmail(user.email) || tenant?.plano === 'enterprise'

  if (!temAcesso && tenant) {
    const compra = await prisma.compraCurso.findUnique({
      where: { tenantId_cursoId: { tenantId: tenant.id, cursoId: curso.id } }
    })
    const liberado = await prisma.acessoCurso.findUnique({
      where: { tenantId_cursoId: { tenantId: tenant.id, cursoId: curso.id } }
    })
    temAcesso = compra?.status === 'APROVADO' || !!liberado
  }

  return NextResponse.json({ ...curso, temAcesso })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()

  const curso = await prisma.curso.update({
    where: { id: params.id },
    data: body
  })

  return NextResponse.json(curso)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await prisma.curso.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
