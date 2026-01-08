export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Prisma, PaymentStatus } from '@prisma/client'

// GET - Listar contas a receber do tenant
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
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const clienteId = searchParams.get('clienteId')
    const periodo = searchParams.get('periodo')

    const whereClause: Prisma.ReceivableWhereInput = {
      tenantId: user.tenantId,
    }

    // Filtro por status
    if (status && status !== 'todos') {
      whereClause.status = status as PaymentStatus
    }

    // Filtro por cliente
    if (clienteId && clienteId !== 'todos') {
      whereClause.OR = [
        { clienteId },
        { clientId: clienteId },
      ]
    }

    // Filtro por periodo
    if (periodo && periodo !== 'todos') {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const fimHoje = new Date(hoje)
      fimHoje.setHours(23, 59, 59, 999)

      switch (periodo) {
        case 'hoje':
          whereClause.dataVencimento = {
            gte: hoje,
            lte: fimHoje,
          }
          break
        case 'semana':
          const fimSemana = new Date(hoje)
          fimSemana.setDate(fimSemana.getDate() + 7)
          whereClause.dataVencimento = {
            gte: hoje,
            lte: fimSemana,
          }
          break
        case 'mes':
          const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
          whereClause.dataVencimento = {
            gte: hoje,
            lte: fimMes,
          }
          break
        case 'vencidos':
          whereClause.dataVencimento = {
            lt: hoje,
          }
          whereClause.status = {
            in: ['PENDENTE', 'PARCIAL'],
          }
          break
      }
    }

    // Filtro por busca
    if (search) {
      whereClause.OR = [
        { cliente: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { numeroDocumento: { contains: search, mode: 'insensitive' } },
      ]
    }

    const contas = await prisma.receivable.findMany({
      where: whereClause,
      orderBy: { dataVencimento: 'asc' },
      include: {
        clienteRef: {
          select: { id: true, nome: true },
        },
        client: {
          select: { id: true, nome: true },
        },
      },
    })

    // Atualizar status VENCIDO automaticamente
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const contasFormatadas = contas.map(conta => {
      let statusAtual = conta.status

      // Se esta pendente e venceu, marcar como vencido
      if (conta.status === 'PENDENTE' && new Date(conta.dataVencimento) < hoje) {
        statusAtual = 'VENCIDO'
      }

      return {
        id: conta.id,
        cliente: conta.cliente,
        clienteId: conta.clienteId || conta.clientId,
        descricao: conta.descricao,
        documento: conta.numeroDocumento,
        parcela: conta.totalParcelas > 1 ? `${conta.parcela}/${conta.totalParcelas}` : undefined,
        valor: Number(conta.valor),
        valorPago: conta.valorPago ? Number(conta.valorPago) : undefined,
        dataEmissao: conta.dataEmissao.toISOString(),
        dataVencimento: conta.dataVencimento.toISOString(),
        dataPagamento: conta.dataPagamento?.toISOString(),
        status: statusAtual,
        observacoes: conta.observacoes,
      }
    })

    return NextResponse.json(contasFormatadas)
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar contas a receber' },
      { status: 500 }
    )
  }
}

// POST - Criar nova conta a receber com parcelas
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
      clienteId,
      cliente,
      documento,
      descricao,
      valorTotal,
      quantidadeParcelas,
      primeiroVencimento,
      observacoes,
    } = body

    // Validacoes
    if (!clienteId || !descricao || !valorTotal || !primeiroVencimento) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: cliente, descricao, valor e data de vencimento' },
        { status: 400 }
      )
    }

    const qtdParcelas = parseInt(quantidadeParcelas) || 1
    if (qtdParcelas < 1 || qtdParcelas > 48) {
      return NextResponse.json(
        { error: 'Quantidade de parcelas deve ser entre 1 e 48' },
        { status: 400 }
      )
    }

    const valor = parseFloat(valorTotal)
    if (valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Calcular valor de cada parcela
    const valorParcela = valor / qtdParcelas
    const dataEmissao = new Date()

    // Criar todas as parcelas
    const parcelasData = []
    for (let i = 0; i < qtdParcelas; i++) {
      const dataVencimento = new Date(primeiroVencimento + 'T12:00:00')
      dataVencimento.setMonth(dataVencimento.getMonth() + i)

      parcelasData.push({
        tenantId: user.tenantId,
        clienteId,
        cliente,
        descricao,
        valor: new Prisma.Decimal(valorParcela.toFixed(2)),
        dataEmissao,
        dataVencimento,
        numeroDocumento: documento || null,
        parcela: i + 1,
        totalParcelas: qtdParcelas,
        observacoes: observacoes || null,
        status: 'PENDENTE' as PaymentStatus,
      })
    }

    // Criar todas as parcelas de uma vez
    const result = await prisma.receivable.createMany({
      data: parcelasData,
    })

    return NextResponse.json(
      {
        message: `${result.count} parcela(s) criada(s) com sucesso`,
        count: result.count,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta a receber' },
      { status: 500 }
    )
  }
}
