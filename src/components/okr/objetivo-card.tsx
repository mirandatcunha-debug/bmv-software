'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Calendar, User, ChevronRight } from 'lucide-react'
import { Objetivo } from '@/types/okr'
import { StatusBadge } from './status-badge'
import { ProgressoBar } from './progresso-bar'
import { cn } from '@/lib/utils'

interface ObjetivoCardProps {
  objetivo: Objetivo
  className?: string
}

export function ObjetivoCard({ objetivo, className }: ObjetivoCardProps) {
  const getPeriodoLabel = () => {
    if (objetivo.periodoTipo === 'TRIMESTRE') {
      return `${objetivo.trimestre} ${objetivo.ano}`
    }
    if (objetivo.dataInicio && objetivo.dataFim) {
      const inicio = new Date(objetivo.dataInicio).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      const fim = new Date(objetivo.dataFim).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      return `${inicio} - ${fim}`
    }
    return ''
  }

  return (
    <Link href={`/processos/okr/${objetivo.id}`}>
      <Card
        className={cn(
          'card-hover cursor-pointer transition-all duration-200 hover:shadow-md',
          className
        )}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-bmv-primary/10 shrink-0">
                <Target className="h-5 w-5 text-bmv-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {objetivo.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {objetivo.descricao}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{objetivo.dono.nome}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{getPeriodoLabel()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{objetivo.keyResults.length} KRs</span>
            </div>
          </div>

          {/* Progress and Status */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ProgressoBar
                progresso={objetivo.progresso}
                status={objetivo.status}
                size="md"
                showLabel={false}
              />
            </div>
            <span className="text-sm font-semibold min-w-[40px] text-right">
              {Math.round(objetivo.progresso)}%
            </span>
            <StatusBadge status={objetivo.status} size="sm" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
