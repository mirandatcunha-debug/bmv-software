export type StatusOKR = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'ATRASADO' | 'CONCLUIDO' | 'CANCELADO'

export type PeriodoTipo = 'TRIMESTRE' | 'PERSONALIZADO'

export interface Objetivo {
  id: string
  titulo: string
  descricao: string
  donoId: string
  dono: { id: string; nome: string; avatarUrl?: string }
  periodoTipo: PeriodoTipo
  trimestre?: string // Q1, Q2, Q3, Q4
  ano?: number
  dataInicio?: Date
  dataFim?: Date
  status: StatusOKR
  progresso: number
  keyResults: KeyResult[]
  criadoEm: Date
  atualizadoEm: Date
}

export interface KeyResult {
  id: string
  objetivoId: string
  titulo: string
  metrica: string
  baseline: number
  meta: number
  atual: number
  peso: number
  progresso: number
  tarefas: Tarefa[]
}

export interface Tarefa {
  id: string
  keyResultId?: string
  processoId?: string // vínculo com Consultoria
  titulo: string
  descricao?: string
  responsavelId: string
  responsavel: { id: string; nome: string }
  peso: number
  concluida: boolean
  subtarefas: Subtarefa[]
}

export interface Subtarefa {
  id: string
  tarefaId: string
  titulo: string
  concluida: boolean
}

// Helpers para labels e cores
export const statusLabels: Record<StatusOKR, string> = {
  NAO_INICIADO: 'Não Iniciado',
  EM_ANDAMENTO: 'Em Andamento',
  ATRASADO: 'Atrasado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

export const statusColors: Record<StatusOKR, { bg: string; text: string; border: string }> = {
  NAO_INICIADO: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  EM_ANDAMENTO: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
  ATRASADO: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
  CONCLUIDO: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
  CANCELADO: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
}

export const progressoColors: Record<StatusOKR, string> = {
  NAO_INICIADO: 'bg-slate-400',
  EM_ANDAMENTO: 'bg-blue-500',
  ATRASADO: 'bg-amber-500',
  CONCLUIDO: 'bg-green-500',
  CANCELADO: 'bg-red-500',
}
