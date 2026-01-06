'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Bot,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Insight, insightCores, InsightTipo } from '@/types/insights'

interface InsightsCardProps {
  insights: Insight[]
  loading?: boolean
}

const insightIconConfig: Record<InsightTipo, {
  icon: typeof AlertTriangle
  emoji: string
  urgencyClass: string
}> = {
  CRITICO: {
    icon: AlertCircle,
    emoji: '🚨',
    urgencyClass: 'animate-pulse-soft animate-glow',
  },
  ALERTA: {
    icon: AlertTriangle,
    emoji: '⚠️',
    urgencyClass: 'animate-pulse-soft',
  },
  SUGESTAO: {
    icon: Lightbulb,
    emoji: '💡',
    urgencyClass: '',
  },
  POSITIVO: {
    icon: CheckCircle2,
    emoji: '✅',
    urgencyClass: '',
  },
}

function countByType(insights: Insight[]): Record<InsightTipo, number> {
  return insights.reduce((acc, insight) => {
    acc[insight.tipo] = (acc[insight.tipo] || 0) + 1
    return acc
  }, {} as Record<InsightTipo, number>)
}

export function InsightsCard({ insights, loading }: InsightsCardProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-800">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <span className="block">Insights Inteligentes</span>
              <span className="text-xs font-normal text-blue-600 dark:text-blue-400">Analise da IA em tempo real</span>
            </div>
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`animate-fade-in-up animate-stagger-${i} flex items-center gap-4 p-4 rounded-xl border bg-white/50 dark:bg-slate-900/50`}
              >
                <div className="w-12 h-12 animate-shimmer rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 animate-shimmer rounded w-3/4"></div>
                  <div className="h-3 animate-shimmer rounded w-1/2"></div>
                </div>
                <div className="h-8 w-24 animate-shimmer rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-800">
              <Bot className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <span className="block">Insights Inteligentes</span>
              <span className="text-xs font-normal text-green-600 dark:text-green-400">Tudo sob controle</span>
            </div>
            <Sparkles className="h-5 w-5 text-green-500 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 animate-fade-in-up">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce-soft">👍</div>
              <p className="text-green-800 dark:text-green-200 font-semibold text-lg">
                Tudo certo por aqui!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 max-w-xs mx-auto">
                Nossa IA nao encontrou nenhum alerta ou sugestao no momento. Continue assim!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Contagem por tipo
  const countsByType = countByType(insights)

  // Determinar cor do card baseado no insight mais critico
  const temCritico = insights.some((i) => i.tipo === 'CRITICO')
  const temAlerta = insights.some((i) => i.tipo === 'ALERTA')
  const apenasPositivo = insights.every((i) => i.tipo === 'POSITIVO')

  let cardClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
  let titleClass = 'text-blue-900 dark:text-blue-100'
  let subtitleClass = 'text-blue-600 dark:text-blue-400'
  let iconBgClass = 'bg-blue-100 dark:bg-blue-800'
  let iconClass = 'text-blue-600 dark:text-blue-300'

  if (temCritico) {
    cardClass = 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
    titleClass = 'text-red-900 dark:text-red-100'
    subtitleClass = 'text-red-600 dark:text-red-400'
    iconBgClass = 'bg-red-100 dark:bg-red-800'
    iconClass = 'text-red-600 dark:text-red-300'
  } else if (temAlerta) {
    cardClass = 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800'
    titleClass = 'text-amber-900 dark:text-amber-100'
    subtitleClass = 'text-amber-600 dark:text-amber-400'
    iconBgClass = 'bg-amber-100 dark:bg-amber-800'
    iconClass = 'text-amber-600 dark:text-amber-300'
  } else if (apenasPositivo) {
    cardClass = 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
    titleClass = 'text-green-900 dark:text-green-100'
    subtitleClass = 'text-green-600 dark:text-green-400'
    iconBgClass = 'bg-green-100 dark:bg-green-800'
    iconClass = 'text-green-600 dark:text-green-300'
  }

  return (
    <Card className={cn(cardClass, 'transition-all duration-300 overflow-hidden')}>
      <CardHeader className="pb-3">
        <CardTitle className={cn('flex items-center gap-3', titleClass)}>
          <div className={cn(
            'p-2.5 rounded-xl transition-transform hover:scale-110',
            iconBgClass,
            temCritico && 'animate-pulse-soft'
          )}>
            <Bot className={cn('h-6 w-6', iconClass)} />
          </div>
          <div className="flex-1">
            <span className="block">Insights Inteligentes</span>
            <span className={cn('text-xs font-normal', subtitleClass)}>
              {insights.length} {insights.length === 1 ? 'insight' : 'insights'} para voce
            </span>
          </div>

          {/* Contadores por tipo */}
          <div className="flex items-center gap-1.5">
            {countsByType.CRITICO > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs animate-pulse-soft">
                🚨 {countsByType.CRITICO}
              </Badge>
            )}
            {countsByType.ALERTA > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                ⚠️ {countsByType.ALERTA}
              </Badge>
            )}
            {countsByType.POSITIVO > 0 && (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                ✅ {countsByType.POSITIVO}
              </Badge>
            )}
          </div>

          <Sparkles className={cn(
            'h-5 w-5',
            iconClass,
            temCritico && 'animate-pulse'
          )} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const cores = insightCores[insight.tipo]
            const iconConfig = insightIconConfig[insight.tipo]
            const InsightIcon = iconConfig.icon
            const isCritical = insight.tipo === 'CRITICO'

            return (
              <div
                key={insight.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300',
                  'hover:shadow-md hover:-translate-y-0.5',
                  'animate-fade-in-up',
                  cores.bg,
                  cores.border,
                  isCritical && 'animate-glow'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icone grande e expressivo */}
                <div className={cn(
                  'flex-shrink-0 p-3 rounded-xl transition-transform hover:scale-110',
                  isCritical ? 'bg-red-200 dark:bg-red-800' :
                  insight.tipo === 'ALERTA' ? 'bg-amber-200 dark:bg-amber-800' :
                  insight.tipo === 'POSITIVO' ? 'bg-green-200 dark:bg-green-800' :
                  'bg-blue-200 dark:bg-blue-800',
                  iconConfig.urgencyClass
                )}>
                  <span className="text-3xl">{insight.icone || iconConfig.emoji}</span>
                </div>

                {/* Conteudo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn(
                        'font-semibold text-sm',
                        cores.text,
                        isCritical && 'animate-pulse-soft'
                      )}>
                        {insight.titulo}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {insight.descricao}
                      </p>
                    </div>
                  </div>

                  {/* Botao de acao destacado */}
                  {insight.acao && (
                    <div className="mt-3">
                      <Link href={insight.acao.link}>
                        <Button
                          variant={isCritical ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'group transition-all duration-200',
                            isCritical
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : insight.tipo === 'ALERTA'
                              ? 'border-amber-400 text-amber-700 hover:bg-amber-100'
                              : 'border-current hover:bg-opacity-10',
                            cores.text
                          )}
                        >
                          {insight.acao.texto}
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Indicador de urgencia para criticos */}
                {isCritical && (
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
