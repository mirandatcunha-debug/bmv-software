import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Obter lancamento por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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

    const lancamento = await prisma.journalEntry.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
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

    if (!lancamento) {
      return NextResponse.json({ error: 'Lancamento nao encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: lancamento.id,
      tenantId: lancamento.tenantId,
      contaId: lancamento.contaId,
      centroCustoId: lancamento.centroCustoId,
      data: lancamento.data,
      tipo: lancamento.tipo,
      valor: Number(lancamento.valor),
      historico: lancamento.historico,
      documento: lancamento.documento,
      conta: lancamento.conta,
      centroCusto: lancamento.centroCusto,
      criadoEm: lancamento.criadoEm,
    })
  } catch (error) {
    console.error('Erro ao buscar lancamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lancamento' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar lancamento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem editar lancamentos
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se o lancamento pertence ao tenant
    const lancamentoExistente = await prisma.journalEntry.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!lancamentoExistente) {
      return NextResponse.json({ error: 'Lancamento nao encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { contaId, centroCustoId, data, tipo, valor, historico, documento } = body

    const updateData: any = {}

    if (contaId !== undefined) {
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
      updateData.contaId = contaId
    }

    if (centroCustoId !== undefined) {
      if (centroCustoId === null) {
        updateData.centroCustoId = null
      } else {
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
        updateData.centroCustoId = centroCustoId
      }
    }

    if (data !== undefined) updateData.data = new Date(data)
    if (tipo !== undefined) {
      if (tipo !== 'DEBITO' && tipo !== 'CREDITO') {
        return NextResponse.json(
          { error: 'Tipo deve ser DEBITO ou CREDITO' },
          { status: 400 }
        )
      }
      updateData.tipo = tipo
    }
    if (valor !== undefined) updateData.valor = valor
    if (historico !== undefined) updateData.historico = historico
    if (documento !== undefined) updateData.documento = documento

    const lancamentoAtualizado = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
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
      id: lancamentoAtualizado.id,
      tenantId: lancamentoAtualizado.tenantId,
      contaId: lancamentoAtualizado.contaId,
      centroCustoId: lancamentoAtualizado.centroCustoId,
      data: lancamentoAtualizado.data,
      tipo: lancamentoAtualizado.tipo,
      valor: Number(lancamentoAtualizado.valor),
      historico: lancamentoAtualizado.historico,
      documento: lancamentoAtualizado.documento,
      conta: lancamentoAtualizado.conta,
      centroCusto: lancamentoAtualizado.centroCusto,
      criadoEm: lancamentoAtualizado.criadoEm,
    })
  } catch (error) {
    console.error('Erro ao atualizar lancamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar lancamento' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir lancamento
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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

    // Apenas ADMIN_BMV pode excluir lancamentos
    if (user.perfil !== 'ADMIN_BMV') {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se o lancamento pertence ao tenant
    const lancamento = await prisma.journalEntry.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!lancamento) {
      return NextResponse.json({ error: 'Lancamento nao encontrado' }, { status: 404 })
    }

    await prisma.journalEntry.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Lancamento excluido com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir lancamento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir lancamento' },
      { status: 500 }
    )
  }
}
