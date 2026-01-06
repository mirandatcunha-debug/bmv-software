import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Obter conta por ID
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

    const conta = await prisma.bankAccount.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { transacoes: true },
        },
      },
    })

    if (!conta) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      id: conta.id,
      tenantId: conta.tenantId,
      nome: conta.nome,
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      tipo: conta.tipo,
      saldoInicial: Number(conta.saldoInicial),
      saldoAtual: Number(conta.saldoAtual),
      cor: conta.cor,
      ativo: conta.ativo,
      totalMovimentacoes: conta._count.transacoes,
      criadoEm: conta.criadoEm,
      atualizadoEm: conta.atualizadoEm,
    })
  } catch (error) {
    console.error('Erro ao buscar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar conta' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar conta
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem editar contas
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, banco, agencia, conta, tipo, cor, ativo } = body

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome
    if (banco !== undefined) updateData.banco = banco
    if (agencia !== undefined) updateData.agencia = agencia
    if (conta !== undefined) updateData.conta = conta
    if (tipo !== undefined) updateData.tipo = tipo
    if (cor !== undefined) updateData.cor = cor
    if (ativo !== undefined) updateData.ativo = ativo

    const contaAtualizada = await prisma.bankAccount.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      id: contaAtualizada.id,
      tenantId: contaAtualizada.tenantId,
      nome: contaAtualizada.nome,
      banco: contaAtualizada.banco,
      agencia: contaAtualizada.agencia,
      conta: contaAtualizada.conta,
      tipo: contaAtualizada.tipo,
      saldoInicial: Number(contaAtualizada.saldoInicial),
      saldoAtual: Number(contaAtualizada.saldoAtual),
      cor: contaAtualizada.cor,
      ativo: contaAtualizada.ativo,
      criadoEm: contaAtualizada.criadoEm,
      atualizadoEm: contaAtualizada.atualizadoEm,
    })
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar conta' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir conta (soft delete - desativar)
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

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Apenas ADMIN_BMV pode excluir contas
    if (user.perfil !== 'ADMIN_BMV') {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se ha movimentacoes
    const conta = await prisma.bankAccount.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { transacoes: true },
        },
      },
    })

    if (!conta) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 })
    }

    if (conta._count.transacoes > 0) {
      // Soft delete - apenas desativar
      await prisma.bankAccount.update({
        where: { id: params.id },
        data: { ativo: false },
      })
      return NextResponse.json({ message: 'Conta desativada com sucesso (possui movimentacoes)' })
    }

    // Hard delete se nao houver movimentacoes
    await prisma.bankAccount.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Conta excluida com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir conta' },
      { status: 500 }
    )
  }
}
