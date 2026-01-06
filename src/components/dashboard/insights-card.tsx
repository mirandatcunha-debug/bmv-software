'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bot, ChevronRight, Sparkles } from 'lucide-react'
import { Insight, insightCores } from '@/types/insights'

interface InsightsCardProps {
  insights: Insight[]
  loading?: boolean
}

export function InsightsCard({ insights, loading }: InsightsCardProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <span>Insights Inteligentes</span>
            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 dark:bg-blue-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4"></div>
                  <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800">
              <Bot className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <span>Insights Inteligentes</span>
            <Sparkles className="h-4 w-4 text-green-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-4xl mb-2">👍</div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                Tudo certo por aqui!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Nenhum alerta ou sugestão no momento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determinar cor do card baseado no insight mais crítico
  const temCritico = insights.some((i) => i.tipo === 'CRITICO')
  const temAlerta = insights.some((i) => i.tipo === 'ALERTA')
  const apenasPositivo = insights.every((i) => i.tipo === 'POSITIVO')

  let cardClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
  let titleClass = 'text-blue-900 dark:text-blue-100'
  let iconBgClass = 'bg-blue-100 dark:bg-blue-800'
  let iconClass = 'text-blue-600 dark:text-blue-300'

  if (temCritico) {
    cardClass = 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
    titleClass = 'text-red-900 dark:text-red-100'
    iconBgClass = 'bg-red-100 dark:bg-red-800'
    iconClass = 'text-red-600 dark:text-red-300'
  } else if (temAlerta) {
    cardClass = 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800'
    titleClass = 'text-amber-900 dark:text-amber-100'
    iconBgClass = 'bg-amber-100 dark:bg-amber-800'
    iconClass = 'text-amber-600 dark:text-amber-300'
  } else if (apenasPositivo) {
    cardClass = 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
    titleClass = 'text-green-900 dark:text-green-100'
    iconBgClass = 'bg-green-100 dark:bg-green-800'
    iconClass = 'text-green-600 dark:text-green-300'
  }

  return (
    <Card className={cn(cardClass, 'transition-all')}>
      <CardHeader className="pb-3">
        <CardTitle className={cn('flex items-center gap-2', titleClass)}>
          <div className={cn('p-2 rounded-lg', iconBgClass)}>
            <Bot className={cn('h-5 w-5', iconClass)} />
          </div>
          <span>Insights Inteligentes</span>
          <Sparkles className={cn('h-4 w-4', iconClass, temCritico && 'animate-pulse')} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => {
            const cores = insightCores[insight.tipo]
            return (
              <div
                key={insight.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  cores.bg,
                  cores.border
                )}
              >
                <div className="text-2xl flex-shrink-0">{insight.icone}</div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-sm', cores.text)}>
                    {insight.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {insight.descricao}
                  </p>
                </div>
                {insight.acao && (
                  <Link href={insight.acao.link}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn('flex-shrink-0 h-8 px-2', cores.text)}
                    >
                      {insight.acao.texto}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
