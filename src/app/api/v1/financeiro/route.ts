export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { validarApiKey, registrarWebhookLog } from '@/lib/webhook-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

  const { valida, tenant, erro } = await validarApiKey(apiKey || '')

  if (!valida || !tenant) {
    return NextResponse.json({ error: erro }, { status: 401 })
  }

  try {
    const body = await request.json()
    const lancamentos = Array.isArray(body) ? body : [body]

    let recebimentos = 0
    let pagamentos = 0
    let erros = 0

    for (const lanc of lancamentos) {
      try {
        const tipo = lanc.tipo?.toUpperCase()

        if (tipo === 'RECEBER' || tipo === 'RECEITA') {
          await prisma.receivable.create({
            data: {
              tenantId: tenant.id,
              cliente: lanc.cliente || 'Cliente via API',
              descricao: lanc.descricao,
              valor: parseFloat(lanc.valor),
              dataVencimento: new Date(lanc.dataVencimento || lanc.data),
              dataEmissao: lanc.dataEmissao ? new Date(lanc.dataEmissao) : new Date(),
              status: lanc.status || 'PENDENTE'
            }
          })
          recebimentos++
        } else if (tipo === 'PAGAR' || tipo === 'DESPESA') {
          await prisma.payable.create({
            data: {
              tenantId: tenant.id,
              fornecedor: lanc.fornecedor || 'Fornecedor via API',
              descricao: lanc.descricao,
              valor: parseFloat(lanc.valor),
              dataVencimento: new Date(lanc.dataVencimento || lanc.data),
              dataEmissao: lanc.dataEmissao ? new Date(lanc.dataEmissao) : new Date(),
              status: lanc.status || 'PENDENTE'
            }
          })
          pagamentos++
        } else {
          erros++
        }
      } catch (err) {
        erros++
      }
    }

    await registrarWebhookLog(tenant.id, 'financeiro', body, 'SUCESSO')

    return NextResponse.json({
      sucesso: true,
      recebimentos,
      pagamentos,
      erros,
      total: lancamentos.length
    })
  } catch (error) {
    await registrarWebhookLog(tenant.id, 'financeiro', {}, 'ERRO', String(error))
    return NextResponse.json({ error: 'Erro ao processar dados' }, { status: 500 })
  }
}
