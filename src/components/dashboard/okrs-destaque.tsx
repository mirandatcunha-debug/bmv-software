'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Target,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

interface OKR {
  id: string
  titulo: string
  progresso: number
  dataFim: Date | string
  status: 'EM_DIA' | 'ATENCAO' | 'ATRASADO' | 'CRITICO'
}

interface OKRsDestaqueProps {
  okrs: OKR[]
  loading?: boolean
}

const statusConfig = {
  EM_DIA: {
    label: 'Em dia',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-300 dark:border-green-700',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
  },
  ATENCAO: {
    label: 'Atencao',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  ATRASADO: {
    label: 'Atrasado',
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  CRITICO: {
    label: 'Critico',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
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

export function OKRsDestaque({ okrs, loading }: OKRsDestaqueProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <Target className="h-5 w-5 text-bmv-primary" />
              </div>
              <span>Seus OKRs</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`animate-fade-in-up animate-stagger-${i} p-4 rounded-lg border`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 animate-shimmer rounded w-48"></div>
                    <div className="h-5 animate-shimmer rounded-full w-16"></div>
                  </div>
                  <div className="h-3 animate-shimmer rounded-full w-full"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 animate-shimmer rounded w-24"></div>
                    <div className="h-6 animate-shimmer rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (okrs.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <Target className="h-5 w-5 text-bmv-primary" />
              </div>
              <span>Seus OKRs</span>
            </div>
            <Link href="/processos/okr">
              <Button variant="ghost" size="sm" className="transition-interactive hover:bg-bmv-primary/10">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 animate-fade-in-up">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
              <Target className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum OKR em andamento</p>
            <p className="text-sm text-muted-foreground mt-1">Comece a definir seus objetivos</p>
            <Link href="/processos/okr/novo">
              <Button variant="outline" size="sm" className="mt-4 transition-interactive">
                <Target className="h-4 w-4 mr-2" />
                Criar primeiro OKR
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-bmv-primary/10">
              <Target className="h-5 w-5 text-bmv-primary" />
            </div>
            <span>Seus OKRs</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {okrs.length} {okrs.length === 1 ? 'ativo' : 'ativos'}
            </Badge>
          </div>
          <Link href="/processos/okr">
            <Button variant="ghost" size="sm" className="transition-interactive hover:bg-bmv-primary/10">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {okrs.map((okr, index) => {
            const dataFim = new Date(okr.dataFim)
            const diasRestantes = Math.ceil(
              (dataFim.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            const config = statusConfig[okr.status]
            const StatusIcon = config.icon
            const isCompleted = okr.progresso >= 100

            return (
              <Link
                key={okr.id}
                href={`/processos/okr/${okr.id}`}
                className="block"
              >
                <div
                  className={cn(
                    'group p-4 rounded-lg border-2 transition-all duration-300',
                    'hover:shadow-md hover:-translate-y-0.5',
                    'animate-fade-in-up',
                    isCompleted
                      ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-bmv-primary/30'
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header com titulo e badge de status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn(
                        'p-1.5 rounded-lg flex-shrink-0 transition-transform group-hover:scale-110',
                        config.bgColor
                      )}>
                        <StatusIcon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate group-hover:text-bmv-primary transition-colors">
                          {okr.titulo}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn('mt-1 text-xs', config.badgeClass)}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Porcentagem com destaque */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {isCompleted && (
                        <Sparkles className="h-4 w-4 text-green-500 animate-pulse-soft" />
                      )}
                      <span className={cn(
                        'text-lg font-bold animate-number',
                        getProgressTextColor(okr.progresso)
                      )}>
                        {okr.progresso}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progresso com gradiente */}
                  <div className="relative mb-3">
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          getProgressGradient(okr.progresso),
                          isCompleted && 'animate-pulse-soft'
                        )}
                        style={{ width: `${Math.min(okr.progresso, 100)}%` }}
                      />
                    </div>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce-soft" />
                      </div>
                    )}
                  </div>

                  {/* Footer com dias restantes */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className={cn(
                        'h-3.5 w-3.5',
                        diasRestantes < 0
                          ? 'text-red-500'
                          : diasRestantes < 15
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'text-xs font-medium',
                        diasRestantes < 0
                          ? 'text-red-600 dark:text-red-400'
                          : diasRestantes < 15
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground'
                      )}>
                        {diasRestantes < 0
                          ? `Vencido ha ${Math.abs(diasRestantes)} dias`
                          : diasRestantes === 0
                          ? 'Vence hoje!'
                          : `${diasRestantes} dias restantes`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs">Ver detalhes</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Celebracao para OKRs completos */}
                  {isCompleted && (
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Meta alcancada! Parabens!</span>
                        <span className="text-lg">🎉</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
