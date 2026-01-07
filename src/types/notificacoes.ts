// Tipos de notificação disponíveis no sistema
export type TipoNotificacao =
  | 'info'
  | 'sucesso'
  | 'alerta'
  | 'erro'
  | 'tarefa'
  | 'financeiro'
  | 'consultoria'
  | 'okr'
  | 'sistema'

// Interface principal de notificação
export interface Notificacao {
  id: string
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  lida: boolean
  criadoEm: Date | string
  link?: string
  // Campos opcionais para contexto
  userId?: string
  tenantId?: string
}

// Interface para criação de notificação (sem id e criadoEm)
export interface CriarNotificacao {
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  link?: string
  userId?: string
  tenantId?: string
}

// Interface para atualização de notificação
export interface AtualizarNotificacao {
  lida?: boolean
  titulo?: string
  mensagem?: string
}

// Resposta da API de listagem
export interface NotificacoesResponse {
  notificacoes: Notificacao[]
  total: number
  naoLidas: number
}

// Mapeamento de ícones por tipo de notificação
export const iconesPorTipo: Record<TipoNotificacao, string> = {
  info: 'Info',
  sucesso: 'CheckCircle',
  alerta: 'AlertTriangle',
  erro: 'XCircle',
  tarefa: 'CheckSquare',
  financeiro: 'DollarSign',
  consultoria: 'Briefcase',
  okr: 'Target',
  sistema: 'Settings'
}

// Cores por tipo de notificação (para uso com Tailwind)
export const coresPorTipo: Record<TipoNotificacao, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  sucesso: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  alerta: { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  erro: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  tarefa: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  financeiro: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  consultoria: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  okr: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  sistema: { bg: 'bg-gray-50 dark:bg-gray-950', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' }
}
