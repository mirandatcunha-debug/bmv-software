export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { criarConector } from '@/lib/integracoes/factory'
import { TipoERP } from '@/lib/integracoes/tipos'

export async function POST(request: Request) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { tipo, credenciais } = body as { tipo: TipoERP; credenciais: Record<string, string> }

  // Testar conexão antes de salvar
  const conector = criarConector(tipo, tenant.id, credenciais)

  if (!conector) {
    return NextResponse.json({ error: 'Conector não disponível' }, { status: 400 })
  }

  const teste = await conector.testarConexao()

  if (!teste.sucesso) {
    return NextResponse.json({ error: teste.mensagem }, { status: 400 })
  }

  // Salvar integração
  const integracao = await prisma.integracaoERP.upsert({
    where: { tenantId_tipo: { tenantId: tenant.id, tipo } },
    update: {
      credenciais: JSON.stringify(credenciais),
      ativa: true,
      statusSync: null,
      erroSync: null
    },
    create: {
      tenantId: tenant.id,
      tipo,
      nome: tipo,
      credenciais: JSON.stringify(credenciais),
      ativa: true
    }
  })

  return NextResponse.json({ sucesso: true, mensagem: teste.mensagem, integracao })
}
