'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { Subtarefa } from '@/types/okr'
import { cn } from '@/lib/utils'

interface SubtarefaItemProps {
  subtarefa: Subtarefa
  onToggle?: (subtarefaId: string, concluida: boolean) => void
  onDelete?: (subtarefaId: string) => void
  showDelete?: boolean
  className?: string
}

export function SubtarefaItem({
  subtarefa,
  onToggle,
  onDelete,
  showDelete = false,
  className,
}: SubtarefaItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/30 group',
        className
      )}
    >
      <Checkbox
        checked={subtarefa.concluida}
        onCheckedChange={(checked) => onToggle?.(subtarefa.id, checked as boolean)}
        className="shrink-0"
      />
      <span
        className={cn(
          'flex-1 text-sm',
          subtarefa.concluida && 'line-through text-muted-foreground'
        )}
      >
        {subtarefa.titulo}
      </span>
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
          onClick={() => onDelete(subtarefa.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
