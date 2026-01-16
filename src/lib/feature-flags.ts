// Tipos de planos disponíveis
export type Plano = 'trial' | 'basico' | 'pro' | 'enterprise'

// Features disponíveis no sistema
export type Feature =
  | 'dashboard_basico'
  | 'dashboard_personalizado'
  | 'financeiro_basico'
  | 'financeiro_avancado'
  | 'okr'
  | 'consultoria'
  | 'contabil'
  | 'relatorios_basicos'
  | 'relatorios_avancados'
  | 'exportar_pdf'
  | 'exportar_excel'
  | 'importar_dados'
  | 'integracoes_api'
  | 'ia_insights'
  | 'multi_usuarios'
  | 'suporte_prioritario'
  | 'white_label'

// Tipos de limites de uso
export type TipoLimite =
  | 'usuarios'
  | 'clientes'
  | 'fornecedores'
  | 'projetos'
  | 'okrs'
  | 'movimentacoes_mes'
  | 'armazenamento_mb'

// Hierarquia dos planos (ordem crescente de recursos)
// Trial tem acesso total (igual enterprise) durante os 14 dias
const HIERARQUIA_PLANOS: Record<Plano, number> = {
  trial: 3, // Acesso total durante trial
  basico: 1,
  pro: 2,
  enterprise: 3,
}

// Mapa de features e quais planos têm acesso (plano mínimo necessário)
const FEATURES_POR_PLANO: Record<Feature, Plano> = {
  dashboard_basico: 'trial',
  dashboard_personalizado: 'pro',
  financeiro_basico: 'trial',
  financeiro_avancado: 'basico',
  okr: 'basico',
  consultoria: 'pro',
  contabil: 'pro',
  relatorios_basicos: 'trial',
  relatorios_avancados: 'basico',
  exportar_pdf: 'basico',
  exportar_excel: 'basico',
  importar_dados: 'pro',
  integracoes_api: 'enterprise',
  ia_insights: 'pro',
  multi_usuarios: 'basico',
  suporte_prioritario: 'pro',
  white_label: 'enterprise',
}

// Limites de uso por plano
// Trial tem limites iguais ao Enterprise durante os 14 dias
const LIMITES_POR_PLANO: Record<Plano, Record<TipoLimite, number>> = {
  trial: {
    usuarios: 1, // Trial limitado a 1 usuário
    clientes: -1,
    fornecedores: -1,
    projetos: -1,
    okrs: -1,
    movimentacoes_mes: -1,
    armazenamento_mb: -1,
  },
  basico: {
    usuarios: 3,
    clientes: 100,
    fornecedores: 50,
    projetos: 10,
    okrs: 10,
    movimentacoes_mes: 500,
    armazenamento_mb: 1000,
  },
  pro: {
    usuarios: 10,
    clientes: 500,
    fornecedores: 200,
    projetos: 50,
    okrs: 50,
    movimentacoes_mes: 2000,
    armazenamento_mb: 5000,
  },
  enterprise: {
    usuarios: -1, // -1 = ilimitado
    clientes: -1,
    fornecedores: -1,
    projetos: -1,
    okrs: -1,
    movimentacoes_mes: -1,
    armazenamento_mb: -1,
  },
}

// Nomes amigáveis dos planos
export const NOMES_PLANOS: Record<Plano, string> = {
  trial: 'Trial',
  basico: 'Básico',
  pro: 'Profissional',
  enterprise: 'Enterprise',
}

// Nomes amigáveis das features
export const NOMES_FEATURES: Record<Feature, string> = {
  dashboard_basico: 'Dashboard Básico',
  dashboard_personalizado: 'Dashboard Personalizável',
  financeiro_basico: 'Financeiro Básico',
  financeiro_avancado: 'Financeiro Avançado',
  okr: 'Gestão de OKRs',
  consultoria: 'Módulo Consultoria',
  contabil: 'Módulo Contábil',
  relatorios_basicos: 'Relatórios Básicos',
  relatorios_avancados: 'Relatórios Avançados',
  exportar_pdf: 'Exportar PDF',
  exportar_excel: 'Exportar Excel',
  importar_dados: 'Importar Dados',
  integracoes_api: 'Integrações API',
  ia_insights: 'Insights com IA',
  multi_usuarios: 'Múltiplos Usuários',
  suporte_prioritario: 'Suporte Prioritário',
  white_label: 'White Label',
}

/**
 * Verifica se um plano tem acesso a uma feature
 */
export function hasFeature(plano: Plano, feature: Feature): boolean {
  const planoMinimo = FEATURES_POR_PLANO[feature]
  return HIERARQUIA_PLANOS[plano] >= HIERARQUIA_PLANOS[planoMinimo]
}

/**
 * Retorna o plano mínimo necessário para uma feature
 */
export function getPlanoMinimo(feature: Feature): Plano {
  return FEATURES_POR_PLANO[feature]
}

/**
 * Retorna o limite de uso para um tipo específico em um plano
 * -1 significa ilimitado
 */
export function getUsageLimit(plano: Plano, tipo: TipoLimite): number {
  return LIMITES_POR_PLANO[plano][tipo]
}

/**
 * Verifica se o uso atual está dentro do limite do plano
 */
export function isWithinLimit(plano: Plano, tipo: TipoLimite, usoAtual: number): boolean {
  const limite = getUsageLimit(plano, tipo)
  if (limite === -1) return true // ilimitado
  return usoAtual < limite
}

/**
 * Retorna a porcentagem de uso de um limite
 */
export function getUsagePercentage(plano: Plano, tipo: TipoLimite, usoAtual: number): number {
  const limite = getUsageLimit(plano, tipo)
  if (limite === -1) return 0 // ilimitado
  return Math.min(100, Math.round((usoAtual / limite) * 100))
}

/**
 * Retorna todas as features disponíveis para um plano
 */
export function getFeaturesDisponiveis(plano: Plano): Feature[] {
  return (Object.keys(FEATURES_POR_PLANO) as Feature[]).filter((feature) =>
    hasFeature(plano, feature)
  )
}

/**
 * Retorna as features que o plano não tem acesso
 */
export function getFeaturesBloqueadas(plano: Plano): Feature[] {
  return (Object.keys(FEATURES_POR_PLANO) as Feature[]).filter(
    (feature) => !hasFeature(plano, feature)
  )
}

/**
 * Compara dois planos e retorna qual é superior
 */
export function comparePlanos(planoA: Plano, planoB: Plano): number {
  return HIERARQUIA_PLANOS[planoA] - HIERARQUIA_PLANOS[planoB]
}

/**
 * Retorna o próximo plano na hierarquia (para upgrade)
 */
export function getProximoPlano(plano: Plano): Plano | null {
  const planos: Plano[] = ['trial', 'basico', 'pro', 'enterprise']
  const indexAtual = planos.indexOf(plano)
  if (indexAtual === -1 || indexAtual >= planos.length - 1) return null
  return planos[indexAtual + 1]
}

// ============================================
// FEATURES E LIMITES DETALHADOS POR PLANO
// ============================================

// Features completas do Trial (acesso total com limites específicos)
export const FEATURES_TRIAL = {
  // Acesso a TODAS as features (igual enterprise)
  dashboard: true,
  financeiro: true,
  contasReceber: true,
  contasPagar: true,
  fluxoCaixa: true,
  analytics: true,
  inadimplencia: true,
  cicloFinanceiro: true,
  healthScore: true,
  simulador: true,
  ia: true,
  consultoria: true,      // Pode ver, mas não terá conteúdo
  videoAulas: true,       // Pode ver, mas não terá acesso
  integracoes: true,
  importacao: true,
  api: true,

  // LIMITES ESPECÍFICOS DO TRIAL
  limites: {
    analisesIAPorDia: 10,
    usuarios: 1,
    empresas: 1,
    exportarRelatorios: false
  }
}

/**
 * Retorna os limites específicos do plano Trial
 */
export function getLimitesTrial() {
  return {
    analisesIAPorDia: 10,
    usuarios: 1,
    empresas: 1,
    exportarRelatorios: false
  }
}

/**
 * Retorna os limites específicos de qualquer plano
 * -1 significa ilimitado
 */
export function getLimitesPlano(plano: string) {
  const limites = {
    trial: { analisesIAPorDia: 10, usuarios: 1, empresas: 1, exportarRelatorios: false },
    basico: { analisesIAPorDia: 20, usuarios: 3, empresas: 1, exportarRelatorios: true },
    pro: { analisesIAPorDia: 100, usuarios: 10, empresas: 1, exportarRelatorios: true },
    enterprise: { analisesIAPorDia: -1, usuarios: -1, empresas: -1, exportarRelatorios: true } // -1 = ilimitado
  }
  return limites[plano as keyof typeof limites] || limites.trial
}

/**
 * Verifica se o plano pode exportar relatórios
 */
export function podeExportarRelatorios(plano: string): boolean {
  const limites = getLimitesPlano(plano)
  return limites.exportarRelatorios
}

/**
 * Verifica se atingiu o limite de análises IA por dia
 */
export function atingiuLimiteIA(plano: string, analisesHoje: number): boolean {
  const limites = getLimitesPlano(plano)
  if (limites.analisesIAPorDia === -1) return false // ilimitado
  return analisesHoje >= limites.analisesIAPorDia
}

/**
 * Retorna quantas análises IA restam no dia
 */
export function analisesIARestantes(plano: string, analisesHoje: number): number {
  const limites = getLimitesPlano(plano)
  if (limites.analisesIAPorDia === -1) return -1 // ilimitado
  return Math.max(0, limites.analisesIAPorDia - analisesHoje)
}
