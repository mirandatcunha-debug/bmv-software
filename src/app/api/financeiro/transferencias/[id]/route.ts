export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Buscar transferencia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const transferencia = await prisma.transfer.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
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
    })

    if (!transferencia) {
      return NextResponse.json({ error: 'Transferencia nao encontrada' }, { status: 404 })
    }

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
    })
  } catch (error) {
    console.error('Erro ao buscar transferencia:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar transferencia' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir transferencia e reverter saldos
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar transferencia para reverter saldos
    const transferencia = await prisma.transfer.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        contaOrigem: true,
        contaDestino: true,
      },
    })

    if (!transferencia) {
      return NextResponse.json({ error: 'Transferencia nao encontrada' }, { status: 404 })
    }

    // Calcular novos saldos (reverter a transferencia)
    const valor = Number(transferencia.valor)
    const novoSaldoOrigem = Number(transferencia.contaOrigem.saldoAtual) + valor
    const novoSaldoDestino = Number(transferencia.contaDestino.saldoAtual) - valor

    // Excluir transferencia e atualizar saldos em uma transacao
    await prisma.$transaction([
      prisma.transfer.delete({
        where: { id: params.id },
      }),
      prisma.bankAccount.update({
        where: { id: transferencia.contaOrigemId },
        data: { saldoAtual: novoSaldoOrigem },
      }),
      prisma.bankAccount.update({
        where: { id: transferencia.contaDestinoId },
        data: { saldoAtual: novoSaldoDestino },
      }),
    ])

    return NextResponse.json({ message: 'Transferencia excluida com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir transferencia:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir transferencia' },
      { status: 500 }
    )
  }
}
