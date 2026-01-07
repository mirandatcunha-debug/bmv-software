import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar movimentacoes
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
    const tipo = searchParams.get('tipo')
    const contaId = searchParams.get('contaId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (tipo && tipo !== 'TODOS') {
      whereClause.tipo = tipo
    }

    if (contaId && contaId !== 'TODOS') {
      whereClause.contaId = contaId
    }

    if (dataInicio) {
      whereClause.dataMovimento = {
        ...whereClause.dataMovimento,
        gte: new Date(dataInicio),
      }
    }

    if (dataFim) {
      whereClause.dataMovimento = {
        ...whereClause.dataMovimento,
        lte: new Date(dataFim),
      }
    }

    const movimentacoes = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        conta: {
          select: {
            id: true,
            nome: true,
            banco: true,
            tipo: true,
          },
        },
      },
      orderBy: { dataMovimento: 'desc' },
    })

    const movimentacoesFormatadas = movimentacoes.map((m) => ({
      id: m.id,
      tenantId: m.tenantId,
      contaId: m.contaId,
      conta: m.conta ? {
        id: m.conta.id,
        nome: m.conta.nome,
        banco: m.conta.banco,
        tipo: m.conta.tipo,
      } : null,
      tipo: m.tipo,
      categoria: m.categoria,
      subcategoria: m.subcategoria,
      descricao: m.descricao,
      valor: Number(m.valor),
      dataMovimento: m.dataMovimento,
      dataCompetencia: m.dataCompetencia,
      recorrente: m.recorrente,
      observacoes: m.observacoes,
      tags: m.tags,
      criadoEm: m.criadoEm,
      atualizadoEm: m.atualizadoEm,
    }))

    return NextResponse.json(movimentacoesFormatadas)
  } catch (error) {
    console.error('Erro ao listar movimentacoes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar movimentacoes' },
      { status: 500 }
    )
  }
}

// POST - Criar nova movimentacao
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
    const {
      tipo,
      descricao,
      valor,
      data,
      categoria,
      contaId,
      subcategoria,
      observacoes,
      recorrente,
      frequencia,
    } = body

    if (!tipo || !descricao || !valor || !data || !categoria || !contaId) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: tipo, descricao, valor, data, categoria, contaId' },
        { status: 400 }
      )
    }

    // Verificar se a conta pertence ao tenant
    const conta = await prisma.bankAccount.findFirst({
      where: {
        id: contaId,
        tenantId: user.tenantId,
      },
    })

    if (!conta) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 })
    }

    // Criar movimentacao
    const movimentacao = await prisma.transaction.create({
      data: {
        tenantId: user.tenantId,
        contaId,
        tipo,
        categoria,
        subcategoria,
        descricao,
        valor,
        dataMovimento: new Date(data),
        recorrente: recorrente || false,
        observacoes,
      },
      include: {
        conta: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    // Atualizar saldo da conta
    const novoSaldo = tipo === 'RECEITA'
      ? Number(conta.saldoAtual) + valor
      : Number(conta.saldoAtual) - valor

    await prisma.bankAccount.update({
      where: { id: contaId },
      data: { saldoAtual: novoSaldo },
    })

    return NextResponse.json({
      id: movimentacao.id,
      tenantId: movimentacao.tenantId,
      contaId: movimentacao.contaId,
      conta: movimentacao.conta,
      tipo: movimentacao.tipo,
      categoria: movimentacao.categoria,
      descricao: movimentacao.descricao,
      valor: Number(movimentacao.valor),
      dataMovimento: movimentacao.dataMovimento,
      recorrente: movimentacao.recorrente,
      criadoEm: movimentacao.criadoEm,
      atualizadoEm: movimentacao.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar movimentacao:', error)
    return NextResponse.json(
      { error: 'Erro ao criar movimentacao' },
      { status: 500 }
    )
  }
}
