export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// Função para converter dados para CSV
function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';')
      return String(value).replace(/,/g, ';')
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

// Função para formatar dados do usuário
function formatUserData(user: Record<string, unknown>) {
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil,
    cargo: user.cargo,
    telefone: user.telefone,
    avatar: user.avatar,
    ativo: user.ativo,
    primeiroAcesso: user.primeiroAcesso,
    criadoEm: user.criadoEm,
    atualizadoEm: user.atualizadoEm,
  }
}

// GET: Exportar todos os dados do usuário (LGPD)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Parâmetro de formato
    const { searchParams } = new URL(request.url)
    const formato = searchParams.get('formato') || 'json'

    // Coletar todos os dados do usuário
    const [
      tenant,
      lancamentos,
      clientes,
      fornecedores,
      contasReceber,
      contasPagar,
      contasBancarias,
      objetivos,
      tarefas,
      projetosConsultoria,
      permissoes,
      logs,
    ] = await Promise.all([
      // Dados do tenant
      prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: {
          id: true,
          nome: true,
          cnpj: true,
          email: true,
          telefone: true,
          plano: true,
          criadoEm: true,
        },
      }),
      // Lançamentos financeiros
      prisma.transaction.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          tipo: true,
          categoria: true,
          descricao: true,
          valor: true,
          dataMovimento: true,
          criadoEm: true,
        },
      }),
      // Clientes
      prisma.client.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          codigo: true,
          nome: true,
          tipo: true,
          cpfCnpj: true,
          email: true,
          telefone: true,
          criadoEm: true,
        },
      }),
      // Fornecedores
      prisma.supplier.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          codigo: true,
          nome: true,
          tipo: true,
          cpfCnpj: true,
          email: true,
          telefone: true,
          criadoEm: true,
        },
      }),
      // Contas a receber
      prisma.receivable.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          numeroDocumento: true,
          descricao: true,
          valor: true,
          dataVencimento: true,
          status: true,
          criadoEm: true,
        },
      }),
      // Contas a pagar
      prisma.payable.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          numeroDocumento: true,
          descricao: true,
          valor: true,
          dataVencimento: true,
          status: true,
          criadoEm: true,
        },
      }),
      // Contas bancárias
      prisma.bankAccount.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          nome: true,
          banco: true,
          agencia: true,
          conta: true,
          saldoInicial: true,
          saldoAtual: true,
          criadoEm: true,
        },
      }),
      // Objetivos OKR
      prisma.objective.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          status: true,
          progresso: true,
          periodoInicio: true,
          periodoFim: true,
          criadoEm: true,
        },
      }),
      // Tarefas
      prisma.task.findMany({
        where: { responsavelId: user.id },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          status: true,
          prioridade: true,
          dataFim: true,
          criadoEm: true,
        },
      }),
      // Projetos de consultoria
      prisma.consultingProject.findMany({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          nome: true,
          descricao: true,
          status: true,
          progresso: true,
          dataInicio: true,
          dataFim: true,
          criadoEm: true,
        },
      }),
      // Permissões do usuário
      prisma.userPermission.findMany({
        where: { userId: user.id },
        select: {
          modulo: true,
          acao: true,
          criadoEm: true,
        },
      }),
      // Logs de auditoria do usuário
      prisma.auditLog.findMany({
        where: { userId: user.id },
        select: {
          acao: true,
          entidade: true,
          criadoEm: true,
        },
        take: 100,
        orderBy: { criadoEm: 'desc' },
      }),
    ])

    // Formatar valores decimais
    const lancamentosFormatados = lancamentos.map(l => ({
      ...l,
      valor: Number(l.valor),
    }))

    const contasReceberFormatadas = contasReceber.map(c => ({
      ...c,
      valor: Number(c.valor),
    }))

    const contasPagarFormatadas = contasPagar.map(c => ({
      ...c,
      valor: Number(c.valor),
    }))

    const contasBancariasFormatadas = contasBancarias.map(c => ({
      ...c,
      saldoInicial: Number(c.saldoInicial),
      saldoAtual: Number(c.saldoAtual),
    }))

    // Montar objeto de exportação
    const dadosExportados = {
      exportadoEm: new Date().toISOString(),
      usuario: formatUserData(user as Record<string, unknown>),
      tenant,
      lancamentos: lancamentosFormatados,
      clientes,
      fornecedores,
      contasReceber: contasReceberFormatadas,
      contasPagar: contasPagarFormatadas,
      contasBancarias: contasBancariasFormatadas,
      objetivos,
      tarefas,
      projetosConsultoria,
      permissoes,
      logsAuditoria: logs,
    }

    // Registrar log de exportação
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        acao: 'EXPORTAR_DADOS',
        entidade: 'USER',
        entidadeId: user.id,
        dadosNovos: { formato, exportadoEm: new Date().toISOString() },
      },
    })

    console.log(`Dados exportados em ${new Date().toISOString()} - Usuario: ${user.id}`)

    // Retornar no formato solicitado
    if (formato === 'csv') {
      // Para CSV, criar um arquivo com múltiplas seções
      const sections = [
        '=== DADOS DO USUARIO ===',
        convertToCSV([formatUserData(user as Record<string, unknown>)]),
        '',
        '=== DADOS DO TENANT ===',
        tenant ? convertToCSV([tenant as Record<string, unknown>]) : 'Sem dados',
        '',
        '=== LANCAMENTOS ===',
        convertToCSV(lancamentosFormatados as Record<string, unknown>[]),
        '',
        '=== CLIENTES ===',
        convertToCSV(clientes as Record<string, unknown>[]),
        '',
        '=== FORNECEDORES ===',
        convertToCSV(fornecedores as Record<string, unknown>[]),
        '',
        '=== CONTAS A RECEBER ===',
        convertToCSV(contasReceberFormatadas as Record<string, unknown>[]),
        '',
        '=== CONTAS A PAGAR ===',
        convertToCSV(contasPagarFormatadas as Record<string, unknown>[]),
        '',
        '=== CONTAS BANCARIAS ===',
        convertToCSV(contasBancariasFormatadas as Record<string, unknown>[]),
        '',
        '=== OBJETIVOS OKR ===',
        convertToCSV(objetivos as Record<string, unknown>[]),
        '',
        '=== TAREFAS ===',
        convertToCSV(tarefas as Record<string, unknown>[]),
        '',
        '=== PROJETOS CONSULTORIA ===',
        convertToCSV(projetosConsultoria as Record<string, unknown>[]),
      ]

      const csvContent = sections.join('\n')
      const dataAtual = new Date().toISOString().split('T')[0]

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="dados_usuario_${dataAtual}.csv"`,
        },
      })
    }

    // Retornar JSON
    const dataAtual = new Date().toISOString().split('T')[0]
    return new NextResponse(JSON.stringify(dadosExportados, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="dados_usuario_${dataAtual}.json"`,
      },
    })

  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 })
  }
}
