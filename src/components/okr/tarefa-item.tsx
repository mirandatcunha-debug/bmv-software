'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, User } from 'lucide-react'
import { Tarefa, Subtarefa } from '@/types/okr'
import { cn } from '@/lib/utils'

interface TarefaItemProps {
  tarefa: Tarefa
  onToggle?: (tarefaId: string, concluida: boolean) => void
  onSubtarefaToggle?: (subtarefaId: string, concluida: boolean) => void
  className?: string
}

export function TarefaItem({
  tarefa,
  onToggle,
  onSubtarefaToggle,
  className,
}: TarefaItemProps) {
  const [expanded, setExpanded] = useState(false)
  const hasSubtarefas = tarefa.subtarefas && tarefa.subtarefas.length > 0

  const subtarefasConcluidas = tarefa.subtarefas?.filter((s) => s.concluida).length || 0
  const totalSubtarefas = tarefa.subtarefas?.length || 0

  return (
    <div className={cn('', className)}>
      {/* Main Task */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-colors',
          'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        {hasSubtarefas && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        {!hasSubtarefas && <div className="w-6" />}

        <Checkbox
          checked={tarefa.concluida}
          onCheckedChange={(checked) => onToggle?.(tarefa.id, checked as boolean)}
          className="shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium',
              tarefa.concluida && 'line-through text-muted-foreground'
            )}
          >
            {tarefa.titulo}
          </p>
          {tarefa.descricao && (
            <p className="text-xs text-muted-foreground mt-0.5">{tarefa.descricao}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasSubtarefas && (
            <span className="text-xs text-muted-foreground">
              {subtarefasConcluidas}/{totalSubtarefas}
            </span>
          )}
          {tarefa.peso > 1 && (
            <span className="text-xs font-medium px-1.5 py-0.5 bg-bmv-primary/10 text-bmv-primary rounded">
              {tarefa.peso}x
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{tarefa.responsavel.nome}</span>
          </div>
        </div>
      </div>

      {/* Subtasks */}
      {expanded && hasSubtarefas && (
        <div className="ml-9 mt-1 space-y-1">
          {tarefa.subtarefas.map((subtarefa) => (
            <SubtarefaItem
              key={subtarefa.id}
              subtarefa={subtarefa}
              onToggle={onSubtarefaToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SubtarefaItemProps {
  subtarefa: Subtarefa
  onToggle?: (subtarefaId: string, concluida: boolean) => void
}

function SubtarefaItem({ subtarefa, onToggle }: SubtarefaItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/30">
      <Checkbox
        checked={subtarefa.concluida}
        onCheckedChange={(checked) => onToggle?.(subtarefa.id, checked as boolean)}
        className="shrink-0"
      />
      <span
        className={cn(
          'text-sm',
          subtarefa.concluida && 'line-through text-muted-foreground'
        )}
      >
        {subtarefa.titulo}
      </span>
    </div>
  )
}
