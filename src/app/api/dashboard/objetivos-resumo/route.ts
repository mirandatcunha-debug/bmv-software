export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Buscar objetivos do tenant
    const objetivos = await prisma.objective.findMany({
      where: {
        tenantId: user.tenantId,
      },
      orderBy: { periodoFim: 'asc' },
    })

    const total = objetivos.length

    if (total === 0) {
      return NextResponse.json({
        total: 0,
        concluidos: 0,
        emAndamento: 0,
        progressoMedio: 0,
        proximoPrazo: null,
      })
    }

    const concluidos = objetivos.filter(o => o.status === 'CONCLUIDO').length
    const emAndamento = objetivos.filter(o => o.status === 'EM_ANDAMENTO').length

    // Calcular progresso medio
    const somaProgresso = objetivos.reduce((acc, o) => acc + Number(o.progresso), 0)
    const progressoMedio = Math.round(somaProgresso / total)

    // Encontrar proximo prazo (objetivos nao concluidos)
    const objetivosAtivos = objetivos.filter(o => o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO')
    const proximoPrazo = objetivosAtivos.length > 0 ? objetivosAtivos[0].periodoFim : null

    return NextResponse.json({
      total,
      concluidos,
      emAndamento,
      progressoMedio,
      proximoPrazo,
    })
  } catch (error) {
    console.error('Erro ao buscar resumo de objetivos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar resumo de objetivos' },
      { status: 500 }
    )
  }
}
