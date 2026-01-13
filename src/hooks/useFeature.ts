'use client'

import { useAuth } from '@/contexts/auth-context'

const PLAN_FEATURES: Record<string, string[]> = {
  trial: ['dashboard', 'financeiro_basico', 'cadastros'],
  starter: ['dashboard', 'financeiro_basico', 'cadastros', 'relatorios_basicos'],
  pro: ['dashboard', 'financeiro_basico', 'financeiro_avancado', 'cadastros', 'relatorios_basicos', 'relatorios_avancados', 'okr', 'consultoria', 'integracao_api'],
  enterprise: ['dashboard', 'financeiro_basico', 'financeiro_avancado', 'cadastros', 'relatorios_basicos', 'relatorios_avancados', 'okr', 'consultoria', 'integracao_api', 'multi_tenant', 'suporte_prioritario', 'personalizacao']
}

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  trial: { usuarios: 2, clientes: 10, projetos: 3 },
  starter: { usuarios: 5, clientes: 50, projetos: 10 },
  pro: { usuarios: 20, clientes: 500, projetos: 100 },
  enterprise: { usuarios: -1, clientes: -1, projetos: -1 }
}

export function useFeature() {
  const { user } = useAuth()

  const tenant = user?.tenant as { plano?: string } | undefined
  const plano = tenant?.plano?.toLowerCase() || 'trial'

  const has = (feature: string): boolean => {
    const features = PLAN_FEATURES[plano] || PLAN_FEATURES.trial
    return features.includes(feature)
  }

  const limit = (tipo: string): number => {
    const limits = PLAN_LIMITS[plano] || PLAN_LIMITS.trial
    return limits[tipo] ?? 0
  }

  const isPro = plano === 'pro' || plano === 'enterprise'
  const isEnterprise = plano === 'enterprise'

  return {
    plano,
    has,
    limit,
    isPro,
    isEnterprise
  }
}
