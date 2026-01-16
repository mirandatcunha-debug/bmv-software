export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { criarConector } from '@/lib/integracoes/factory'
import { TipoERP } from '@/lib/integracoes/tipos'

export async function POST(request: Request, { params }: { params: { tipo: string } }) {
  const { user, tenant } = await getTenantFromSession()
  if (!user || !tenant) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const tipo = params.tipo.toUpperCase() as TipoERP

  // Buscar integração
  const integracao = await prisma.integracaoERP.findUnique({
    where: { tenantId_tipo: { tenantId: tenant.id, tipo } }
  })

  if (!integracao || !integracao.ativa) {
    return NextResponse.json({ error: 'Integração não encontrada ou inativa' }, { status: 404 })
  }

  // Atualizar status
  await prisma.integracaoERP.update({
    where: { id: integracao.id },
    data: { statusSync: 'SINCRONIZANDO' }
  })

  try {
    const credenciais = JSON.parse(integracao.credenciais)
    const conector = criarConector(tipo, tenant.id, credenciais)

    if (!conector) {
      throw new Error('Conector não disponível')
    }

    // Sincronizar tudo
    const resultados = {
      clientes: await conector.sincronizarClientes(),
      fornecedores: await conector.sincronizarFornecedores(),
      contasReceber: await conector.sincronizarContasReceber(),
      contasPagar: await conector.sincronizarContasPagar()
    }

    // Atualizar status
    await prisma.integracaoERP.update({
      where: { id: integracao.id },
      data: {
        statusSync: 'SUCESSO',
        ultimaSync: new Date(),
        erroSync: null
      }
    })

    return NextResponse.json({ sucesso: true, resultados })
  } catch (error) {
    await prisma.integracaoERP.update({
      where: { id: integracao.id },
      data: {
        statusSync: 'ERRO',
        erroSync: String(error)
      }
    })

    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
