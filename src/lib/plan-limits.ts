// Limites por plano
export const PLAN_LIMITS = {
  TRIAL: {
    usuarios: 3,
    contasBancarias: 2,
    projetos: 1,
  },
  BASICO: {
    usuarios: 5,
    contasBancarias: 5,
    projetos: 3,
  },
  PROFISSIONAL: {
    usuarios: 15,
    contasBancarias: 10,
    projetos: 10,
  },
  ENTERPRISE: {
    usuarios: -1, // ilimitado
    contasBancarias: -1,
    projetos: -1,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

export function getPlanLimit(plan: string, resource: keyof typeof PLAN_LIMITS.TRIAL): number {
  const planLimits = PLAN_LIMITS[plan as PlanType]
  if (!planLimits) return PLAN_LIMITS.TRIAL[resource]
  return planLimits[resource]
}

export function hasReachedLimit(currentCount: number, plan: string, resource: keyof typeof PLAN_LIMITS.TRIAL): boolean {
  const limit = getPlanLimit(plan, resource)
  if (limit === -1) return false // ilimitado
  return currentCount >= limit
}
