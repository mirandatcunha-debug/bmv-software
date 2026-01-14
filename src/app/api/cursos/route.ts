export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { isSuperAdminEmail } from '@/lib/superadmin'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { user, tenant } = await getTenantFromSession()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const cursos = await prisma.curso.findMany({
    where: { ativo: true },
    include: {
      aulas: {
        where: { ativo: true },
        orderBy: { ordem: 'asc' }
      },
      _count: { select: { aulas: true } }
    },
    orderBy: { ordem: 'asc' }
  })

  // Verificar acesso de cada curso
  const cursosComAcesso = await Promise.all(cursos.map(async (curso) => {
    let temAcesso = false

    // Enterprise tem acesso total
    if (tenant?.plano === 'enterprise') {
      temAcesso = true
    } else if (tenant) {
      // Verificar compra ou liberação manual
      const compra = await prisma.compraCurso.findUnique({
        where: { tenantId_cursoId: { tenantId: tenant.id, cursoId: curso.id } }
      })
      const liberado = await prisma.acessoCurso.findUnique({
        where: { tenantId_cursoId: { tenantId: tenant.id, cursoId: curso.id } }
      })
      temAcesso = compra?.status === 'APROVADO' || !!liberado
    }

    // SuperAdmin sempre tem acesso
    if (isSuperAdminEmail(user.email)) {
      temAcesso = true
    }

    return { ...curso, temAcesso }
  }))

  return NextResponse.json(cursosComAcesso)
}

export async function POST(request: Request) {
  const { user } = await getTenantFromSession()
  if (!user || !isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { titulo, descricao, preco, thumbnail } = body

  const curso = await prisma.curso.create({
    data: { titulo, descricao, preco: preco || 0, thumbnail }
  })

  return NextResponse.json(curso)
}
