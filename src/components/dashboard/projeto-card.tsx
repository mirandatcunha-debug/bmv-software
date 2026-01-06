'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  User,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  PlayCircle,
  Loader2,
} from 'lucide-react'

interface ProjetoData {
  id: string
  nome: string
  consultor: string
  status: string
  progresso: number
  proximaEntrega?: {
    data: Date | string
    descricao: string
  } | null
}

interface ProjetoCardProps {
  projeto: ProjetoData | null
  loading?: boolean
}

const statusConfig: Record<string, {
  label: string
  icon: typeof Briefcase
  color: string
  bgColor: string
  borderColor: string
  headerGradient: string
  badgeClass: string
}> = {
  PLANEJAMENTO: {
    label: 'Planejamento',
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-l-blue-500',
    headerGradient: 'from-blue-500/10 to-transparent',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  EM_ANDAMENTO: {
    label: 'Em Andamento',
    icon: PlayCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-l-green-500',
    headerGradient: 'from-green-500/10 to-transparent',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
  },
  PAUSADO: {
    label: 'Pausado',
    icon: PauseCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-l-amber-500',
    headerGradient: 'from-amber-500/10 to-transparent',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  CONCLUIDO: {
    label: 'Concluido',
    icon: CheckCircle2,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-l-slate-500',
    headerGradient: 'from-slate-500/10 to-transparent',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  CANCELADO: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-l-red-500',
    headerGradient: 'from-red-500/10 to-transparent',
    badgeClass: 'bg-red-100 text-red-700 border-red-300',
  },
}

function getProgressGradient(progresso: number): string {
  if (progresso >= 100) return 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600'
  if (progresso >= 70) return 'bg-gradient-to-r from-green-400 to-green-600'
  if (progresso >= 40) return 'bg-gradient-to-r from-amber-400 to-amber-600'
  return 'bg-gradient-to-r from-red-400 to-red-600'
}

function getProgressTextColor(progresso: number): string {
  if (progresso >= 70) return 'text-green-600 dark:text-green-400'
  if (progresso >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getDiasRestantes(data: Date): { dias: number; label: string; isUrgent: boolean } {
  const dias = Math.ceil((data.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  let label = ''
  let isUrgent = false

  if (dias < 0) {
    label = `Atrasado ${Math.abs(dias)} dias`
    isUrgent = true
  } else if (dias === 0) {
    label = 'Hoje!'
    isUrgent = true
  } else if (dias === 1) {
    label = 'Amanha'
    isUrgent = true
  } else if (dias <= 7) {
    label = `Em ${dias} dias`
    isUrgent = true
  } else {
    label = `Em ${dias} dias`
    isUrgent = false
  }

  return { dias, label, isUrgent }
}

export function ProjetoCard({ projeto, loading }: ProjetoCardProps) {
  const defaultConfig = statusConfig.EM_ANDAMENTO

  if (loading) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-bmv-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-bmv-primary/10">
              <Briefcase className="h-5 w-5 text-bmv-primary" />
            </div>
            <span>Seu Projeto</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="h-6 animate-shimmer rounded w-3/4"></div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-shimmer rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 animate-shimmer rounded w-32"></div>
                <div className="h-3 animate-shimmer rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 animate-shimmer rounded w-full"></div>
              <div className="flex justify-between">
                <div className="h-3 animate-shimmer rounded w-20"></div>
                <div className="h-3 animate-shimmer rounded w-12"></div>
              </div>
            </div>
            <div className="h-20 animate-shimmer rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!projeto) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-bmv-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-bmv-primary/10">
              <Briefcase className="h-5 w-5 text-bmv-primary" />
            </div>
            <span>Seu Projeto</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center py-8 animate-fade-in-up">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum projeto ativo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Entre em contato com seu consultor
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = statusConfig[projeto.status] || defaultConfig
  const StatusIcon = config.icon
  const dataProximaEntrega = projeto.proximaEntrega
    ? new Date(projeto.proximaEntrega.data)
    : null
  const entregaInfo = dataProximaEntrega ? getDiasRestantes(dataProximaEntrega) : null

  return (
    <Card className={cn(
      'h-full overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md',
      config.borderColor
    )}>
      {/* Header com gradiente baseado no status */}
      <CardHeader className={cn(
        'pb-3 bg-gradient-to-r',
        config.headerGradient
      )}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <StatusIcon className={cn('h-5 w-5', config.color, projeto.status === 'EM_ANDAMENTO' && 'animate-pulse-soft')} />
            </div>
            <span>Seu Projeto</span>
          </div>
          <Badge
            variant="outline"
            className={cn(config.badgeClass, 'font-medium')}
          >
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Nome do Projeto */}
        <div className="animate-fade-in-up">
          <h3 className="font-semibold text-lg leading-tight">{projeto.nome}</h3>
        </div>

        {/* Consultor com Avatar */}
        <div className="flex items-center gap-3 animate-fade-in-up animate-stagger-1">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-bmv-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {projeto.consultor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
          </div>
          <div>
            <p className="text-sm font-medium">{projeto.consultor}</p>
            <p className="text-xs text-muted-foreground">Consultor responsavel</p>
          </div>
        </div>

        {/* Progresso com gradiente */}
        <div className="space-y-2 animate-fade-in-up animate-stagger-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progresso do Projeto</span>
            <span className={cn('font-bold text-lg animate-number', getProgressTextColor(projeto.progresso))}>
              {projeto.progresso}%
            </span>
          </div>
          <div className="relative">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  getProgressGradient(projeto.progresso)
                )}
                style={{ width: `${projeto.progresso}%` }}
              />
            </div>
            {/* Marcadores de progresso */}
            <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-0.5 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-0.5 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-0.5 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Proxima Entrega - Timeline visual */}
        {projeto.proximaEntrega && dataProximaEntrega && entregaInfo && (
          <div className={cn(
            'p-4 rounded-lg border-2 animate-fade-in-up animate-stagger-3 transition-all',
            entregaInfo.isUrgent
              ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
          )}>
            <div className="flex items-start gap-3">
              {/* Timeline visual */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'p-2 rounded-full',
                  entregaInfo.isUrgent
                    ? 'bg-amber-100 dark:bg-amber-900/50'
                    : 'bg-slate-100 dark:bg-slate-800'
                )}>
                  <FileText className={cn(
                    'h-4 w-4',
                    entregaInfo.isUrgent
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  )} />
                </div>
                <div className="w-0.5 h-8 bg-gradient-to-b from-amber-300 to-transparent dark:from-amber-700 mt-1"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Proxima Entrega
                  </p>
                  {entregaInfo.isUrgent && (
                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300 animate-pulse-soft">
                      {entregaInfo.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold truncate mb-2">
                  {projeto.proximaEntrega.descricao}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className={cn(
                    'h-3.5 w-3.5',
                    entregaInfo.isUrgent ? 'text-amber-500' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'font-medium',
                    entregaInfo.isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                  )}>
                    {dataProximaEntrega.toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {!entregaInfo.isUrgent && (
                    <span className="text-muted-foreground">
                      ({entregaInfo.label})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
