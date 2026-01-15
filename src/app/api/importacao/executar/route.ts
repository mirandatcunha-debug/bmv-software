export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { TipoImportacao } from '@/lib/importacao/templates'

// Gerar código único para cliente/fornecedor
async function gerarCodigo(tenantId: string, tipo: 'cliente' | 'fornecedor'): Promise<string> {
  const prefixo = tipo === 'cliente' ? 'CLI' : 'FOR'
  const count = tipo === 'cliente'
    ? await prisma.client.count({ where: { tenantId } })
    : await prisma.supplier.count({ where: { tenantId } })
  return `${prefixo}${String(count + 1).padStart(4, '0')}`
}

export async function POST(request: Request) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { tipo, linhas } = await request.json() as {
      tipo: TipoImportacao
      linhas: { dados: Record<string, any>; valido: boolean }[]
    }

    const linhasValidas = linhas.filter(l => l.valido)
    let importados = 0
    let erros = 0

    for (const linha of linhasValidas) {
      try {
        switch (tipo) {
          case 'clientes':
            const codigoCliente = await gerarCodigo(tenant.id, 'cliente')
            await prisma.client.create({
              data: {
                tenantId: tenant.id,
                codigo: codigoCliente,
                nome: linha.dados.nome,
                tipo: 'PJ', // Default para importação
                cpfCnpj: linha.dados.cpfCnpj || null,
                email: linha.dados.email || null,
                telefone: linha.dados.telefone || null,
                endereco: linha.dados.endereco || null,
                cidade: linha.dados.cidade || null,
                uf: linha.dados.estado || null,
                cep: linha.dados.cep || null,
                observacoes: linha.dados.observacoes || null
              }
            })
            break

          case 'fornecedores':
            const codigoFornecedor = await gerarCodigo(tenant.id, 'fornecedor')
            await prisma.supplier.create({
              data: {
                tenantId: tenant.id,
                codigo: codigoFornecedor,
                nome: linha.dados.nome,
                tipo: 'PJ', // Default para importação
                cpfCnpj: linha.dados.cpfCnpj || null,
                email: linha.dados.email || null,
                telefone: linha.dados.telefone || null,
                endereco: linha.dados.endereco || null,
                cidade: linha.dados.cidade || null,
                uf: linha.dados.estado || null,
                cep: linha.dados.cep || null,
                observacoes: linha.dados.observacoes || null
              }
            })
            break

          case 'contasReceber':
            await prisma.receivable.create({
              data: {
                tenantId: tenant.id,
                cliente: linha.dados.cliente || 'Importado',
                descricao: linha.dados.descricao,
                valor: linha.dados.valor,
                dataVencimento: new Date(linha.dados.dataVencimento),
                dataEmissao: linha.dados.dataEmissao ? new Date(linha.dados.dataEmissao) : new Date(),
                status: 'PENDENTE',
                observacoes: linha.dados.observacoes || null
              }
            })
            break

          case 'contasPagar':
            await prisma.payable.create({
              data: {
                tenantId: tenant.id,
                fornecedor: linha.dados.fornecedor || 'Importado',
                descricao: linha.dados.descricao,
                valor: linha.dados.valor,
                dataVencimento: new Date(linha.dados.dataVencimento),
                dataEmissao: linha.dados.dataEmissao ? new Date(linha.dados.dataEmissao) : new Date(),
                status: 'PENDENTE',
                observacoes: linha.dados.observacoes || null
              }
            })
            break

          case 'movimentacoes':
            // Buscar primeira conta bancária
            const conta = await prisma.bankAccount.findFirst({
              where: { tenantId: tenant.id }
            })

            if (conta) {
              await prisma.transaction.create({
                data: {
                  tenantId: tenant.id,
                  contaId: conta.id,
                  descricao: linha.dados.descricao,
                  valor: linha.dados.valor,
                  tipo: linha.dados.tipo,
                  categoria: linha.dados.categoria || 'Importado',
                  dataMovimento: new Date(linha.dados.data),
                  observacoes: linha.dados.observacoes || null
                }
              })
            }
            break
        }
        importados++
      } catch (err) {
        console.error('Erro ao importar linha:', err)
        erros++
      }
    }

    return NextResponse.json({
      sucesso: true,
      importados,
      erros,
      total: linhasValidas.length
    })
  } catch (error) {
    console.error('Erro na importação:', error)
    return NextResponse.json({ error: 'Erro ao importar dados' }, { status: 500 })
  }
}
