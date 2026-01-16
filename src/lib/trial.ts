import { prisma } from '@/lib/prisma'
import { getLimitesPlano } from './feature-flags'

const DIAS_TRIAL = 14

export interface StatusTrial {
  emTrial: boolean
  diasRestantes: number
  expirado: boolean
  dataExpiracao: Date | null
  limites: {
    analisesIAPorDia: number
    usuarios: number
    empresas: number
    exportarRelatorios: boolean
  }
}

export async function verificarTrial(tenantId: string): Promise<StatusTrial> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plano: true, criadoEm: true }
  })

  const limites = getLimitesPlano(tenant?.plano || 'trial')

  if (!tenant || tenant.plano !== 'trial') {
    return {
      emTrial: false,
      diasRestantes: 0,
      expirado: false,
      dataExpiracao: null,
      limites
    }
  }

  const dataExpiracao = new Date(tenant.criadoEm)
  dataExpiracao.setDate(dataExpiracao.getDate() + DIAS_TRIAL)

  const agora = new Date()
  const diffMs = dataExpiracao.getTime() - agora.getTime()
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return {
    emTrial: true,
    diasRestantes: Math.max(0, diasRestantes),
    expirado: diasRestantes <= 0,
    dataExpiracao,
    limites
  }
}

export async function verificarLimiteIA(tenantId: string): Promise<{ permitido: boolean; usados: number; limite: number }> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plano: true }
  })

  const limites = getLimitesPlano(tenant?.plano || 'trial')

  // -1 significa ilimitado
  if (limites.analisesIAPorDia === -1) {
    return { permitido: true, usados: 0, limite: -1 }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const uso = await prisma.usoIA.findUnique({
    where: { tenantId_data: { tenantId, data: hoje } }
  })

  const usados = uso?.contagem || 0

  return {
    permitido: usados < limites.analisesIAPorDia,
    usados,
    limite: limites.analisesIAPorDia
  }
}

export async function registrarUsoIA(tenantId: string): Promise<void> {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  await prisma.usoIA.upsert({
    where: { tenantId_data: { tenantId, data: hoje } },
    update: { contagem: { increment: 1 } },
    create: { tenantId, data: hoje, contagem: 1 }
  })
}

export async function verificarLimiteUsuarios(tenantId: string): Promise<{ permitido: boolean; atual: number; limite: number }> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plano: true, _count: { select: { usuarios: true } } }
  })

  const limites = getLimitesPlano(tenant?.plano || 'trial')
  const atual = tenant?._count?.usuarios || 0

  // -1 significa ilimitado
  if (limites.usuarios === -1) {
    return { permitido: true, atual, limite: -1 }
  }

  return {
    permitido: atual < limites.usuarios,
    atual,
    limite: limites.usuarios
  }
}

export function podeExportarRelatorios(plano: string): boolean {
  const limites = getLimitesPlano(plano)
  return limites.exportarRelatorios
}
