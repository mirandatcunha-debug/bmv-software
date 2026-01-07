import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { gerarExcelMovimentacoes, gerarNomeArquivo } from '@/lib/excel-generator'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const contaId = searchParams.get('contaId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    // Construir filtro
    const whereClause: Record<string, unknown> = {
      tenantId: user.tenantId,
    }

    if (tipo && tipo !== 'TODOS') {
      whereClause.tipo = tipo
    }

    if (contaId && contaId !== 'TODOS') {
      whereClause.contaId = contaId
    }

    if (dataInicio || dataFim) {
      whereClause.dataMovimento = {}
      if (dataInicio) {
        (whereClause.dataMovimento as Record<string, Date>).gte = new Date(dataInicio)
      }
      if (dataFim) {
        (whereClause.dataMovimento as Record<string, Date>).lte = new Date(dataFim)
      }
    }

    // Buscar movimentações
    const movimentacoes = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        conta: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { dataMovimento: 'desc' },
    })

    // Formatar dados para o Excel
    const dadosExcel = movimentacoes.map((m) => ({
      id: m.id,
      tipo: m.tipo as 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA',
      categoria: m.categoria,
      subcategoria: m.subcategoria || undefined,
      descricao: m.descricao,
      valor: Number(m.valor),
      dataMovimento: m.dataMovimento,
      conta: m.conta ? { nome: m.conta.nome } : undefined,
      observacoes: m.observacoes || undefined,
    }))

    // Configuração da exportação
    const config = {
      periodo: dataInicio && dataFim ? {
        inicio: new Date(dataInicio),
        fim: new Date(dataFim),
      } : undefined,
      tipo: tipo && tipo !== 'TODOS' ? tipo as 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' : undefined,
      contaId: contaId && contaId !== 'TODOS' ? contaId : undefined,
      titulo: 'movimentacoes',
    }

    // Gerar Excel
    const buffer = await gerarExcelMovimentacoes(dadosExcel, config)
    const nomeArquivo = gerarNomeArquivo(config)

    // Retornar arquivo
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar Excel' },
      { status: 500 }
    )
  }
}
