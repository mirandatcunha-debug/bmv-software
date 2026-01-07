export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar lancamentos contabeis
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
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const contaId = searchParams.get('contaId')
    const centroCustoId = searchParams.get('centroCustoId')
    const tipo = searchParams.get('tipo')

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (dataInicio && dataFim) {
      whereClause.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    } else if (dataInicio) {
      whereClause.data = { gte: new Date(dataInicio) }
    } else if (dataFim) {
      whereClause.data = { lte: new Date(dataFim) }
    }

    if (contaId) {
      whereClause.contaId = contaId
    }

    if (centroCustoId) {
      whereClause.centroCustoId = centroCustoId
    }

    if (tipo && (tipo === 'DEBITO' || tipo === 'CREDITO')) {
      whereClause.tipo = tipo
    }

    const lancamentos = await prisma.journalEntry.findMany({
      where: whereClause,
      include: {
        conta: {
          select: {
            id: true,
            codigo: true,
            nome: true,
            tipo: true,
            natureza: true,
          },
        },
        centroCusto: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    })

    const lancamentosFormatados = lancamentos.map((l) => ({
      id: l.id,
      tenantId: l.tenantId,
      contaId: l.contaId,
      centroCustoId: l.centroCustoId,
      data: l.data,
      tipo: l.tipo,
      valor: Number(l.valor),
      historico: l.historico,
      documento: l.documento,
      conta: l.conta,
      centroCusto: l.centroCusto,
      criadoEm: l.criadoEm,
    }))

    return NextResponse.json(lancamentosFormatados)
  } catch (error) {
    console.error('Erro ao listar lancamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar lancamentos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo lancamento contabil
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem criar lancamentos
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { contaId, centroCustoId, data, tipo, valor, historico, documento } = body

    if (!contaId || !data || !tipo || !valor || !historico) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: contaId, data, tipo, valor, historico' },
        { status: 400 }
      )
    }

    if (tipo !== 'DEBITO' && tipo !== 'CREDITO') {
      return NextResponse.json(
        { error: 'Tipo deve ser DEBITO ou CREDITO' },
        { status: 400 }
      )
    }

    // Verificar se a conta pertence ao tenant
    const conta = await prisma.chartOfAccount.findFirst({
      where: {
        id: contaId,
        tenantId: user.tenantId,
      },
    })

    if (!conta) {
      return NextResponse.json(
        { error: 'Conta contabil nao encontrada' },
        { status: 404 }
      )
    }

    // Verificar centro de custo se informado
    if (centroCustoId) {
      const centroCusto = await prisma.costCenter.findFirst({
        where: {
          id: centroCustoId,
          tenantId: user.tenantId,
        },
      })

      if (!centroCusto) {
        return NextResponse.json(
          { error: 'Centro de custo nao encontrado' },
          { status: 404 }
        )
      }
    }

    const novoLancamento = await prisma.journalEntry.create({
      data: {
        tenantId: user.tenantId,
        contaId,
        centroCustoId: centroCustoId || null,
        data: new Date(data),
        tipo,
        valor,
        historico,
        documento: documento || null,
      },
      include: {
        conta: {
          select: {
            id: true,
            codigo: true,
            nome: true,
            tipo: true,
            natureza: true,
          },
        },
        centroCusto: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: novoLancamento.id,
      tenantId: novoLancamento.tenantId,
      contaId: novoLancamento.contaId,
      centroCustoId: novoLancamento.centroCustoId,
      data: novoLancamento.data,
      tipo: novoLancamento.tipo,
      valor: Number(novoLancamento.valor),
      historico: novoLancamento.historico,
      documento: novoLancamento.documento,
      conta: novoLancamento.conta,
      centroCusto: novoLancamento.centroCusto,
      criadoEm: novoLancamento.criadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar lancamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar lancamento' },
      { status: 500 }
    )
  }
}
