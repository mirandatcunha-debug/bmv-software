'use client'

import { cn } from '@/lib/utils'
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Calendar,
  Target,
  PiggyBank,
} from 'lucide-react'

type InsightType = 'alerta' | 'positivo' | 'sugestao' | 'critico'

interface IAInsightCardProps {
  titulo: string
  descricao: string
  tipo: InsightType
  icone?: 'tendencia_baixa' | 'tendencia_alta' | 'alerta' | 'sugestao' | 'dinheiro' | 'calendario' | 'meta' | 'economia'
  className?: string
}

const iconeMap = {
  tendencia_baixa: TrendingDown,
  tendencia_alta: TrendingUp,
  alerta: AlertTriangle,
  sugestao: Lightbulb,
  dinheiro: DollarSign,
  calendario: Calendar,
  meta: Target,
  economia: PiggyBank,
}

const tipoConfig: Record<InsightType, {
  bg: string
  border: string
  iconBg: string
  iconColor: string
  titleColor: string
}> = {
  critico: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-800 dark:text-red-200',
  },
  alerta: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-800 dark:text-amber-200',
  },
  positivo: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-800 dark:text-green-200',
  },
  sugestao: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-200',
  },
}

export function IAInsightCard({
  titulo,
  descricao,
  tipo,
  icone = 'sugestao',
  className,
}: IAInsightCardProps) {
  const config = tipoConfig[tipo]
  const Icon = iconeMap[icone]

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all hover:shadow-md hover:-translate-y-0.5',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('rounded-lg p-2', config.iconBg)}>
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold text-sm', config.titleColor)}>
            {titulo}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {descricao}
          </p>
        </div>
      </div>
    </div>
  )
}
