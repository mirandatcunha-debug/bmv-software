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
    const clientes = Array.isArray(body) ? body : [body]

    let criados = 0
    let atualizados = 0
    let erros = 0

    for (const cliente of clientes) {
      try {
        if (cliente.id || cliente.cpfCnpj) {
          // Tentar atualizar
          const existente = await prisma.client.findFirst({
            where: {
              tenantId: tenant.id,
              OR: [
                { id: cliente.id },
                { cpfCnpj: cliente.cpfCnpj }
              ].filter(Boolean)
            }
          })

          if (existente) {
            await prisma.client.update({
              where: { id: existente.id },
              data: {
                nome: cliente.nome || existente.nome,
                email: cliente.email || existente.email,
                telefone: cliente.telefone || existente.telefone,
                endereco: cliente.endereco || existente.endereco,
                cidade: cliente.cidade || existente.cidade,
                uf: cliente.uf || cliente.estado || existente.uf,
                cep: cliente.cep || existente.cep
              }
            })
            atualizados++
            continue
          }
        }

        // Gerar código único para o cliente
        const ultimoCliente = await prisma.client.findFirst({
          where: { tenantId: tenant.id },
          orderBy: { codigo: 'desc' }
        })
        const proximoCodigo = ultimoCliente
          ? String(parseInt(ultimoCliente.codigo) + 1).padStart(6, '0')
          : '000001'

        // Criar novo
        await prisma.client.create({
          data: {
            tenantId: tenant.id,
            codigo: cliente.codigo || proximoCodigo,
            nome: cliente.nome,
            tipo: cliente.tipo || 'PF',
            cpfCnpj: cliente.cpfCnpj || null,
            email: cliente.email || null,
            telefone: cliente.telefone || null,
            endereco: cliente.endereco || null,
            cidade: cliente.cidade || null,
            uf: cliente.uf || cliente.estado || null,
            cep: cliente.cep || null
          }
        })
        criados++
      } catch (err) {
        erros++
      }
    }

    await registrarWebhookLog(tenant.id, 'clientes', body, 'SUCESSO')

    return NextResponse.json({
      sucesso: true,
      criados,
      atualizados,
      erros,
      total: clientes.length
    })
  } catch (error) {
    await registrarWebhookLog(tenant.id, 'clientes', {}, 'ERRO', String(error))
    return NextResponse.json({ error: 'Erro ao processar dados' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

  const { valida, tenant, erro } = await validarApiKey(apiKey || '')

  if (!valida || !tenant) {
    return NextResponse.json({ error: erro }, { status: 401 })
  }

  const clientes = await prisma.client.findMany({
    where: { tenantId: tenant.id },
    orderBy: { criadoEm: 'desc' }
  })

  return NextResponse.json(clientes)
}
