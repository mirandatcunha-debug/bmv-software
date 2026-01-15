import { prisma } from '@/lib/prisma'

interface ValidacaoResult {
  valida: boolean
  tenant: { id: string; nome: string } | null
  erro: string | null
}

export async function validarApiKey(chave: string): Promise<ValidacaoResult> {
  if (!chave) {
    return { valida: false, tenant: null, erro: 'API Key não fornecida' }
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { chave },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            ativo: true
          }
        }
      }
    })

    if (!apiKey) {
      return { valida: false, tenant: null, erro: 'API Key inválida' }
    }

    if (!apiKey.ativa) {
      return { valida: false, tenant: null, erro: 'API Key desativada' }
    }

    if (!apiKey.tenant.ativo) {
      return { valida: false, tenant: null, erro: 'Tenant inativo' }
    }

    // Atualizar último uso
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { ultimoUso: new Date() }
    })

    return {
      valida: true,
      tenant: { id: apiKey.tenant.id, nome: apiKey.tenant.nome },
      erro: null
    }
  } catch (error) {
    console.error('Erro ao validar API Key:', error)
    return { valida: false, tenant: null, erro: 'Erro interno ao validar API Key' }
  }
}

export async function registrarWebhookLog(
  tenantId: string,
  tipo: string,
  payload: unknown,
  status: string,
  erro?: string
): Promise<void> {
  try {
    await prisma.webhookLog.create({
      data: {
        tenantId,
        tipo,
        payload: JSON.stringify(payload),
        status,
        erro: erro || null
      }
    })
  } catch (error) {
    console.error('Erro ao registrar webhook log:', error)
  }
}
