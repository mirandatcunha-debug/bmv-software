export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import {
  gerarRelatorioFinanceiroPDF,
  calcularTotaisMovimentacoes,
  RelatorioFinanceiroData,
} from '@/lib/pdf-generator'
import { Movimentacao, TipoTransacao } from '@/types/financeiro'

// GET - Gerar PDF das movimentacoes
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
    const tipo = searchParams.get('tipo') as TipoTransacao | null
    const contaId = searchParams.get('contaId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    // Definir período padrão (último mês)
    const hoje = new Date()
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    const inicio = dataInicio ? new Date(dataInicio) : primeiroDiaMes
    const fim = dataFim ? new Date(dataFim) : ultimoDiaMes

    // Construir query
    const whereClause: {
      tenantId: string
      tipo?: TipoTransacao
      contaId?: string
      dataMovimento?: {
        gte?: Date
        lte?: Date
      }
    } = {
      tenantId: user.tenantId,
      dataMovimento: {
        gte: inicio,
        lte: fim,
      },
    }

    if (tipo && tipo !== 'TODOS' as unknown) {
      whereClause.tipo = tipo
    }

    if (contaId && contaId !== 'TODOS') {
      whereClause.contaId = contaId
    }

    // Buscar movimentações
    const movimentacoesDB = await prisma.transaction.findMany({
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

    // Formatar movimentações para o tipo esperado
    const movimentacoes: Movimentacao[] = movimentacoesDB.map((m) => ({
      id: m.id,
      tenantId: m.tenantId,
      contaId: m.contaId,
      conta: m.conta ? {
        id: m.conta.id,
        tenantId: m.tenantId,
        nome: m.conta.nome,
        banco: m.conta.banco ?? undefined,
        tipo: m.conta.tipo as 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'CAIXA',
        saldoInicial: 0,
        saldoAtual: 0,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      } : undefined,
      tipo: m.tipo as TipoTransacao,
      categoria: m.categoria,
      subcategoria: m.subcategoria || undefined,
      descricao: m.descricao,
      valor: Number(m.valor),
      dataMovimento: m.dataMovimento,
      dataCompetencia: m.dataCompetencia || undefined,
      recorrente: m.recorrente,
      frequencia: undefined,
      observacoes: m.observacoes || undefined,
      tags: m.tags || undefined,
      criadoEm: m.criadoEm,
      atualizadoEm: m.atualizadoEm,
    }))

    // Buscar nome da conta se filtrada
    let nomeConta: string | undefined
    if (contaId && contaId !== 'TODOS') {
      const conta = await prisma.bankAccount.findUnique({
        where: { id: contaId },
        select: { nome: true },
      })
      nomeConta = conta?.nome
    }

    // Calcular totais
    const totais = calcularTotaisMovimentacoes(movimentacoes)

    // Preparar dados do relatório
    const dadosRelatorio: RelatorioFinanceiroData = {
      movimentacoes,
      periodo: {
        inicio: inicio.toLocaleDateString('pt-BR'),
        fim: fim.toLocaleDateString('pt-BR'),
      },
      filtros: {
        tipo: tipo || undefined,
        conta: nomeConta,
      },
      totais,
    }

    // Gerar PDF
    const pdfBuffer = await gerarRelatorioFinanceiroPDF(dadosRelatorio)

    // Retornar PDF como download
    const nomeArquivo = `relatorio-financeiro-${inicio.toISOString().split('T')[0]}-a-${fim.toISOString().split('T')[0]}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatorio PDF' },
      { status: 500 }
    )
  }
}
