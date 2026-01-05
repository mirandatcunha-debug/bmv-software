'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Plus, Flag } from 'lucide-react'
import { KeyResult } from '@/types/okr'
import { ProgressoBar } from './progresso-bar'
import { TarefaItem } from './tarefa-item'
import { cn } from '@/lib/utils'

interface KRCardProps {
  kr: KeyResult
  index: number
  onAddTarefa?: (krId: string) => void
  onTarefaToggle?: (tarefaId: string, concluida: boolean) => void
  onSubtarefaToggle?: (subtarefaId: string, concluida: boolean) => void
  className?: string
}

export function KRCard({
  kr,
  index,
  onAddTarefa,
  onTarefaToggle,
  onSubtarefaToggle,
  className,
}: KRCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasTarefas = kr.tarefas && kr.tarefas.length > 0

  const getProgressStatus = () => {
    if (kr.progresso >= 100) return 'CONCLUIDO' as const
    if (kr.progresso >= 70) return 'EM_ANDAMENTO' as const
    if (kr.progresso >= 30) return 'ATRASADO' as const
    return 'NAO_INICIADO' as const
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-bmv-primary/10 text-bmv-primary font-semibold text-sm shrink-0">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {kr.titulo}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{kr.metrica}</p>
              </div>
              {kr.peso > 1 && (
                <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded shrink-0">
                  Peso {kr.peso}x
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Baseline: </span>
                <span className="font-medium">{kr.baseline}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="h-4 w-4 text-bmv-primary" />
                <span className="text-muted-foreground">Atual: </span>
                <span className="font-semibold text-bmv-primary">{kr.atual}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Meta: </span>
                <span className="font-medium">{kr.meta}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-3">
              <ProgressoBar
                progresso={kr.progresso}
                status={getProgressStatus()}
                size="md"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Tasks Section */}
      <div className="border-t">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span>
            Tarefas ({kr.tarefas?.length || 0})
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expanded && (
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {hasTarefas ? (
                kr.tarefas.map((tarefa) => (
                  <TarefaItem
                    key={tarefa.id}
                    tarefa={tarefa}
                    onToggle={onTarefaToggle}
                    onSubtarefaToggle={onSubtarefaToggle}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tarefa criada
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => onAddTarefa?.(kr.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Tarefa
              </Button>
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  )
}
