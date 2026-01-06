// Tipos para o sistema de Insights com IA

export type InsightTipo = 'ALERTA' | 'SUGESTAO' | 'POSITIVO' | 'CRITICO'
export type InsightCategoria = 'FINANCEIRO' | 'OKR' | 'CONSULTORIA' | 'GERAL'

export interface Insight {
  id: string
  tipo: InsightTipo
  categoria: InsightCategoria
  titulo: string
  descricao: string
  icone: string
  acao?: {
    texto: string
    link: string
  }
  prioridade: number // 1 = mais urgente
  criadoEm: Date
}

// Cores por tipo de insight
export const insightCores: Record<InsightTipo, {
  bg: string
  border: string
  text: string
  icon: string
}> = {
  CRITICO: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
    text: 'text-red-800 dark:text-red-300',
    icon: 'text-red-600',
  },
  ALERTA: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-800 dark:text-amber-300',
    icon: 'text-amber-600',
  },
  SUGESTAO: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-800 dark:text-blue-300',
    icon: 'text-blue-600',
  },
  POSITIVO: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-800 dark:text-green-300',
    icon: 'text-green-600',
  },
}

// Icones por tipo
export const insightIcones: Record<InsightTipo, string> = {
  CRITICO: '🚨',
  ALERTA: '⚠️',
  SUGESTAO: '💡',
  POSITIVO: '✅',
}

// Labels
export const insightTipoLabels: Record<InsightTipo, string> = {
  CRITICO: 'Crítico',
  ALERTA: 'Alerta',
  SUGESTAO: 'Sugestão',
  POSITIVO: 'Positivo',
}

export const insightCategoriaLabels: Record<InsightCategoria, string> = {
  FINANCEIRO: 'Financeiro',
  OKR: 'OKR',
  CONSULTORIA: 'Consultoria',
  GERAL: 'Geral',
}

// Dados do Dashboard
export interface DashboardData {
  insights: Insight[]
  financeiro: {
    saldoTotal: number
    receitasMes: number
    receitasMesAnterior: number
    despesasMes: number
    despesasMesAnterior: number
    resultado: number
  }
  okrs: {
    id: string
    titulo: string
    progresso: number
    dataFim: Date
    status: 'EM_DIA' | 'ATENCAO' | 'ATRASADO' | 'CRITICO'
  }[]
  projeto: {
    id: string
    nome: string
    consultor: string
    status: string
    progresso: number
    proximaEntrega?: {
      data: Date
      descricao: string
    }
  } | null
}

// Helpers
export function getProgressoColor(progresso: number): string {
  if (progresso >= 70) return 'bg-green-500'
  if (progresso >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getProgressoTextColor(progresso: number): string {
  if (progresso >= 70) return 'text-green-600 dark:text-green-400'
  if (progresso >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}
