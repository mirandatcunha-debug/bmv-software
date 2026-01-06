import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Obter movimentacao por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const movimentacao = await prisma.transaction.findUnique({
      where: { id: params.id },
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
    })

    if (!movimentacao) {
      return NextResponse.json({ error: 'Movimentacao nao encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      id: movimentacao.id,
      tenantId: movimentacao.tenantId,
      contaId: movimentacao.contaId,
      conta: movimentacao.conta,
      tipo: movimentacao.tipo,
      categoria: movimentacao.categoria,
      subcategoria: movimentacao.subcategoria,
      descricao: movimentacao.descricao,
      valor: Number(movimentacao.valor),
      dataMovimento: movimentacao.dataMovimento,
      dataCompetencia: movimentacao.dataCompetencia,
      recorrente: movimentacao.recorrente,
      observacoes: movimentacao.observacoes,
      tags: movimentacao.tags,
      criadoEm: movimentacao.criadoEm,
      atualizadoEm: movimentacao.atualizadoEm,
    })
  } catch (error) {
    console.error('Erro ao buscar movimentacao:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar movimentacao' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar movimentacao
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar movimentacao atual
    const movimentacaoAtual = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { conta: true },
    })

    if (!movimentacaoAtual) {
      return NextResponse.json({ error: 'Movimentacao nao encontrada' }, { status: 404 })
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
    } = body

    const updateData: any = {}
    if (tipo !== undefined) updateData.tipo = tipo
    if (descricao !== undefined) updateData.descricao = descricao
    if (valor !== undefined) updateData.valor = valor
    if (data !== undefined) updateData.dataMovimento = new Date(data)
    if (categoria !== undefined) updateData.categoria = categoria
    if (contaId !== undefined) updateData.contaId = contaId
    if (subcategoria !== undefined) updateData.subcategoria = subcategoria
    if (observacoes !== undefined) updateData.observacoes = observacoes
    if (recorrente !== undefined) updateData.recorrente = recorrente

    // Reverter saldo antigo
    const valorAntigo = Number(movimentacaoAtual.valor)
    let saldoConta = Number(movimentacaoAtual.conta.saldoAtual)

    if (movimentacaoAtual.tipo === 'RECEITA') {
      saldoConta -= valorAntigo
    } else {
      saldoConta += valorAntigo
    }

    // Aplicar novo valor
    const novoValor = valor !== undefined ? valor : valorAntigo
    const novoTipo = tipo !== undefined ? tipo : movimentacaoAtual.tipo

    if (novoTipo === 'RECEITA') {
      saldoConta += novoValor
    } else {
      saldoConta -= novoValor
    }

    // Atualizar movimentacao e saldo da conta
    const [movimentacao] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: params.id },
        data: updateData,
        include: {
          conta: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      }),
      prisma.bankAccount.update({
        where: { id: movimentacaoAtual.contaId },
        data: { saldoAtual: saldoConta },
      }),
    ])

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
    })
  } catch (error) {
    console.error('Erro ao atualizar movimentacao:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar movimentacao' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir movimentacao
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar movimentacao para reverter saldo
    const movimentacao = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { conta: true },
    })

    if (!movimentacao) {
      return NextResponse.json({ error: 'Movimentacao nao encontrada' }, { status: 404 })
    }

    // Calcular novo saldo
    const valor = Number(movimentacao.valor)
    let novoSaldo = Number(movimentacao.conta.saldoAtual)

    if (movimentacao.tipo === 'RECEITA') {
      novoSaldo -= valor
    } else {
      novoSaldo += valor
    }

    // Excluir movimentacao e atualizar saldo
    await prisma.$transaction([
      prisma.transaction.delete({
        where: { id: params.id },
      }),
      prisma.bankAccount.update({
        where: { id: movimentacao.contaId },
        data: { saldoAtual: novoSaldo },
      }),
    ])

    return NextResponse.json({ message: 'Movimentacao excluida com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir movimentacao:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir movimentacao' },
      { status: 500 }
    )
  }
}
