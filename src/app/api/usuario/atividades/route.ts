export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Busca o usuário no banco
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true, tenantId: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Parâmetros de paginação
    const { searchParams } = new URL(request.url)
    const limite = Math.min(parseInt(searchParams.get('limite') || '50'), 100)
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const offset = (pagina - 1) * limite

    // Busca as atividades do usuário
    const [atividades, total] = await Promise.all([
      prisma.logAtividade.findMany({
        where: {
          tenantId: dbUser.tenantId,
          userId: dbUser.id,
        },
        orderBy: {
          criadoEm: 'desc',
        },
        take: limite,
        skip: offset,
      }),
      prisma.logAtividade.count({
        where: {
          tenantId: dbUser.tenantId,
          userId: dbUser.id,
        },
      }),
    ])

    return NextResponse.json({
      atividades,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
}
