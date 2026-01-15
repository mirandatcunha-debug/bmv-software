export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { gerarApiKey } from '@/lib/api-keys'

export async function GET() {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const apiKeys = await prisma.apiKey.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nome: true,
      chave: true,
      ativa: true,
      ultimoUso: true,
      criadoPor: true,
      createdAt: true
    }
  })

  // Mascarar chaves (mostrar só últimos 8 caracteres)
  const apiKeysMascaradas = apiKeys.map(key => ({
    ...key,
    chaveMascarada: 'bmv_live_****' + key.chave.slice(-8),
    chaveCompleta: key.chave // Mostrar completa só na criação
  }))

  return NextResponse.json(apiKeysMascaradas)
}

export async function POST(request: Request) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { nome } = body

  if (!nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const chave = gerarApiKey()

  const apiKey = await prisma.apiKey.create({
    data: {
      tenantId: tenant.id,
      nome,
      chave,
      criadoPor: user.email
    }
  })

  return NextResponse.json({
    ...apiKey,
    mensagem: 'Guarde esta chave! Ela não será mostrada novamente.'
  })
}
