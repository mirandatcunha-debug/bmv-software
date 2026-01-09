export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar orcamentos do tenant
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const ano = searchParams.get('ano')
    const mes = searchParams.get('mes')
    const tipo = searchParams.get('tipo')

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (ano) {
      whereClause.ano = parseInt(ano)
    }

    if (mes) {
      whereClause.mes = parseInt(mes)
    }

    if (tipo && tipo !== 'TODOS') {
      whereClause.tipo = tipo
    }

    const orcamentos = await prisma.budget.findMany({
      where: whereClause,
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' },
        { categoria: 'asc' },
      ],
    })

    const orcamentosFormatados = orcamentos.map((o) => ({
      id: o.id,
      tenantId: o.tenantId,
      ano: o.ano,
      mes: o.mes,
      categoria: o.categoria,
      tipo: o.tipo,
      valorOrcado: Number(o.valorOrcado),
      criadoEm: o.criadoEm,
      atualizadoEm: o.atualizadoEm,
    }))

    return NextResponse.json(orcamentosFormatados)
  } catch (error) {
    console.error('Erro ao listar orcamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar orcamentos' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar orcamento (upsert)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { ano, mes, categoria, tipo, valorOrcado } = body

    if (!ano || !mes || !categoria || !tipo || valorOrcado === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: ano, mes, categoria, tipo, valorOrcado' },
        { status: 400 }
      )
    }

    if (tipo !== 'RECEITA' && tipo !== 'DESPESA') {
      return NextResponse.json(
        { error: 'Tipo deve ser RECEITA ou DESPESA' },
        { status: 400 }
      )
    }

    if (mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: 'Mes deve ser entre 1 e 12' },
        { status: 400 }
      )
    }

    if (valorOrcado < 0) {
      return NextResponse.json(
        { error: 'Valor orcado deve ser maior ou igual a zero' },
        { status: 400 }
      )
    }

    // Upsert: criar ou atualizar por tenant+ano+mes+categoria
    const orcamento = await prisma.budget.upsert({
      where: {
        tenantId_ano_mes_categoria: {
          tenantId: user.tenantId,
          ano,
          mes,
          categoria,
        },
      },
      update: {
        tipo,
        valorOrcado,
      },
      create: {
        tenantId: user.tenantId,
        ano,
        mes,
        categoria,
        tipo,
        valorOrcado,
      },
    })

    return NextResponse.json({
      id: orcamento.id,
      tenantId: orcamento.tenantId,
      ano: orcamento.ano,
      mes: orcamento.mes,
      categoria: orcamento.categoria,
      tipo: orcamento.tipo,
      valorOrcado: Number(orcamento.valorOrcado),
      criadoEm: orcamento.criadoEm,
      atualizadoEm: orcamento.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar/atualizar orcamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar/atualizar orcamento' },
      { status: 500 }
    )
  }
}
