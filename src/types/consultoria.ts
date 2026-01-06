// Tipos para o módulo de Consultoria

export type StatusProjeto = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'PAUSADO' | 'CONCLUIDO' | 'CANCELADO'
export type StatusTarefa = 'A_FAZER' | 'EM_ANDAMENTO' | 'EM_VALIDACAO' | 'CONCLUIDO'
export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'

export interface Usuario {
  id: string
  nome: string
  email: string
  avatarUrl?: string
}

export interface Cliente {
  id: string
  nome: string
  cnpj?: string
  email: string
}

export interface Evidencia {
  id: string
  tarefaId: string
  titulo: string
  descricao?: string
  arquivoUrl?: string
  tipo?: string
  criadoEm: Date
}

export interface Comentario {
  id: string
  tarefaId: string
  autorId: string
  autor?: Usuario
  conteudo: string
  criadoEm: Date
}

export interface TarefaProjeto {
  id: string
  projetoId: string
  etapaId?: string
  responsavelId: string
  responsavel?: Usuario
  titulo: string
  descricao?: string
  status: StatusTarefa
  prioridade: Prioridade
  prazo?: Date | string
  requerEvidencia: boolean
  ordem: number
  evidencias?: Evidencia[]
  comentarios?: Comentario[]
  criadoEm: Date
  atualizadoEm: Date
}

export interface EtapaProjeto {
  id: string
  projetoId: string
  nome: string
  ordem: number
  peso: number
  progresso: number
  tarefas?: TarefaProjeto[]
  criadoEm: Date
}

export interface Projeto {
  id: string
  tenantId: string
  cliente?: Cliente
  nome: string
  descricao?: string
  dataInicio: Date | string
  dataFim?: Date | string
  status: StatusProjeto
  progresso: number
  etapas?: EtapaProjeto[]
  tarefas?: TarefaProjeto[]
  criadoEm: Date
  atualizadoEm: Date
}

// Labels para exibição
export const statusProjetoLabels: Record<StatusProjeto, string> = {
  NAO_INICIADO: 'Não Iniciado',
  EM_ANDAMENTO: 'Em Andamento',
  PAUSADO: 'Pausado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

export const statusTarefaLabels: Record<StatusTarefa, string> = {
  A_FAZER: 'A Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  EM_VALIDACAO: 'Em Validação',
  CONCLUIDO: 'Concluído',
}

export const prioridadeLabels: Record<Prioridade, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

// Cores para status
export const statusProjetoCores: Record<StatusProjeto, string> = {
  NAO_INICIADO: 'bg-slate-100 text-slate-700',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  PAUSADO: 'bg-amber-100 text-amber-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
}

export const statusTarefaCores: Record<StatusTarefa, string> = {
  A_FAZER: 'bg-slate-100 text-slate-700',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  EM_VALIDACAO: 'bg-amber-100 text-amber-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
}

export const prioridadeCores: Record<Prioridade, string> = {
  BAIXA: 'bg-slate-100 text-slate-700',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-amber-100 text-amber-700',
  URGENTE: 'bg-red-100 text-red-700',
}

// Colunas do Kanban
export const kanbanColumns: { id: StatusTarefa; titulo: string; cor: string }[] = [
  { id: 'A_FAZER', titulo: 'A Fazer', cor: 'border-slate-300' },
  { id: 'EM_ANDAMENTO', titulo: 'Em Andamento', cor: 'border-blue-400' },
  { id: 'EM_VALIDACAO', titulo: 'Em Revisão', cor: 'border-amber-400' },
  { id: 'CONCLUIDO', titulo: 'Concluído', cor: 'border-green-400' },
]
