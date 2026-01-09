export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar transferencias do tenant
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
    const contaId = searchParams.get('contaId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (contaId && contaId !== 'TODOS') {
      whereClause.OR = [
        { contaOrigemId: contaId },
        { contaDestinoId: contaId },
      ]
    }

    if (dataInicio) {
      whereClause.data = {
        ...whereClause.data,
        gte: new Date(dataInicio),
      }
    }

    if (dataFim) {
      whereClause.data = {
        ...whereClause.data,
        lte: new Date(dataFim),
      }
    }

    const transferencias = await prisma.transfer.findMany({
      where: whereClause,
      include: {
        contaOrigem: {
          select: {
            id: true,
            nome: true,
            banco: true,
            tipo: true,
          },
        },
        contaDestino: {
          select: {
            id: true,
            nome: true,
            banco: true,
            tipo: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    })

    const transferenciasFormatadas = transferencias.map((t) => ({
      id: t.id,
      tenantId: t.tenantId,
      contaOrigemId: t.contaOrigemId,
      contaDestinoId: t.contaDestinoId,
      contaOrigem: t.contaOrigem,
      contaDestino: t.contaDestino,
      valor: Number(t.valor),
      data: t.data,
      descricao: t.descricao,
      criadoEm: t.criadoEm,
      atualizadoEm: t.atualizadoEm,
    }))

    return NextResponse.json(transferenciasFormatadas)
  } catch (error) {
    console.error('Erro ao listar transferencias:', error)
    return NextResponse.json(
      { error: 'Erro ao listar transferencias' },
      { status: 500 }
    )
  }
}

// POST - Criar nova transferencia
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
      contaOrigemId,
      contaDestinoId,
      valor,
      data,
      descricao,
    } = body

    if (!contaOrigemId || !contaDestinoId || !valor || !data) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: contaOrigemId, contaDestinoId, valor, data' },
        { status: 400 }
      )
    }

    if (contaOrigemId === contaDestinoId) {
      return NextResponse.json(
        { error: 'Conta origem e destino devem ser diferentes' },
        { status: 400 }
      )
    }

    if (valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se as contas pertencem ao tenant
    const [contaOrigem, contaDestino] = await Promise.all([
      prisma.bankAccount.findFirst({
        where: {
          id: contaOrigemId,
          tenantId: user.tenantId,
        },
      }),
      prisma.bankAccount.findFirst({
        where: {
          id: contaDestinoId,
          tenantId: user.tenantId,
        },
      }),
    ])

    if (!contaOrigem) {
      return NextResponse.json({ error: 'Conta origem nao encontrada' }, { status: 404 })
    }

    if (!contaDestino) {
      return NextResponse.json({ error: 'Conta destino nao encontrada' }, { status: 404 })
    }

    // Criar transferencia e atualizar saldos das contas em uma transacao
    const novoSaldoOrigem = Number(contaOrigem.saldoAtual) - valor
    const novoSaldoDestino = Number(contaDestino.saldoAtual) + valor

    const [transferencia] = await prisma.$transaction([
      prisma.transfer.create({
        data: {
          tenantId: user.tenantId,
          contaOrigemId,
          contaDestinoId,
          valor,
          data: new Date(data),
          descricao,
        },
        include: {
          contaOrigem: {
            select: {
              id: true,
              nome: true,
              banco: true,
              tipo: true,
            },
          },
          contaDestino: {
            select: {
              id: true,
              nome: true,
              banco: true,
              tipo: true,
            },
          },
        },
      }),
      prisma.bankAccount.update({
        where: { id: contaOrigemId },
        data: { saldoAtual: novoSaldoOrigem },
      }),
      prisma.bankAccount.update({
        where: { id: contaDestinoId },
        data: { saldoAtual: novoSaldoDestino },
      }),
    ])

    return NextResponse.json({
      id: transferencia.id,
      tenantId: transferencia.tenantId,
      contaOrigemId: transferencia.contaOrigemId,
      contaDestinoId: transferencia.contaDestinoId,
      contaOrigem: transferencia.contaOrigem,
      contaDestino: transferencia.contaDestino,
      valor: Number(transferencia.valor),
      data: transferencia.data,
      descricao: transferencia.descricao,
      criadoEm: transferencia.criadoEm,
      atualizadoEm: transferencia.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar transferencia:', error)
    return NextResponse.json(
      { error: 'Erro ao criar transferencia' },
      { status: 500 }
    )
  }
}
