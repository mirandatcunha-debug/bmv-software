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
    const fornecedores = Array.isArray(body) ? body : [body]

    let criados = 0
    let atualizados = 0
    let erros = 0

    for (const fornecedor of fornecedores) {
      try {
        if (fornecedor.id || fornecedor.cpfCnpj) {
          const existente = await prisma.supplier.findFirst({
            where: {
              tenantId: tenant.id,
              OR: [
                { id: fornecedor.id },
                { cpfCnpj: fornecedor.cpfCnpj }
              ].filter(Boolean)
            }
          })

          if (existente) {
            await prisma.supplier.update({
              where: { id: existente.id },
              data: {
                nome: fornecedor.nome || existente.nome,
                email: fornecedor.email || existente.email,
                telefone: fornecedor.telefone || existente.telefone
              }
            })
            atualizados++
            continue
          }
        }

        // Gerar código único para o fornecedor
        const ultimoFornecedor = await prisma.supplier.findFirst({
          where: { tenantId: tenant.id },
          orderBy: { codigo: 'desc' }
        })
        const proximoCodigo = ultimoFornecedor
          ? String(parseInt(ultimoFornecedor.codigo) + 1).padStart(6, '0')
          : '000001'

        await prisma.supplier.create({
          data: {
            tenantId: tenant.id,
            codigo: fornecedor.codigo || proximoCodigo,
            nome: fornecedor.nome,
            tipo: fornecedor.tipo || 'PJ',
            cpfCnpj: fornecedor.cpfCnpj || null,
            email: fornecedor.email || null,
            telefone: fornecedor.telefone || null
          }
        })
        criados++
      } catch (err) {
        erros++
      }
    }

    await registrarWebhookLog(tenant.id, 'fornecedores', body, 'SUCESSO')

    return NextResponse.json({ sucesso: true, criados, atualizados, erros })
  } catch (error) {
    await registrarWebhookLog(tenant.id, 'fornecedores', {}, 'ERRO', String(error))
    return NextResponse.json({ error: 'Erro ao processar dados' }, { status: 500 })
  }
}
