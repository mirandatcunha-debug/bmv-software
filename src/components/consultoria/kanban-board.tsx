'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, GripVertical, User, Calendar, AlertCircle } from 'lucide-react'
import {
  TarefaProjeto,
  StatusTarefa,
  kanbanColumns,
  prioridadeLabels,
  prioridadeCores,
} from '@/types/consultoria'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  tarefas: TarefaProjeto[]
  onTarefaMove: (tarefaId: string, novoStatus: StatusTarefa) => void
  projetoId: string
}

export function KanbanBoard({ tarefas, onTarefaMove, projetoId }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<StatusTarefa | null>(null)

  const getTarefasByStatus = (status: StatusTarefa) => {
    return tarefas
      .filter((t) => t.status === status)
      .sort((a, b) => a.ordem - b.ordem)
  }

  const handleDragStart = (e: React.DragEvent, tarefaId: string) => {
    setDraggedTask(tarefaId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: StatusTarefa) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, status: StatusTarefa) => {
    e.preventDefault()
    if (draggedTask) {
      onTarefaMove(draggedTask, status)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  const isOverdue = (prazo: Date | string | undefined) => {
    if (!prazo) return false
    return new Date(prazo) < new Date()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kanbanColumns.map((column) => {
        const columnTarefas = getTarefasByStatus(column.id)
        const isOver = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            className={cn(
              'flex flex-col min-h-[500px] rounded-lg bg-slate-50 dark:bg-slate-800/30 transition-colors',
              isOver && 'bg-bmv-primary/5 ring-2 ring-bmv-primary/20'
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div
              className={cn(
                'px-4 py-3 border-b-2',
                column.cor
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  {column.titulo}
                </h3>
                <span className="text-xs font-medium text-muted-foreground bg-white dark:bg-slate-700 px-2 py-1 rounded">
                  {columnTarefas.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {columnTarefas.map((tarefa) => (
                <Card
                  key={tarefa.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tarefa.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
                    draggedTask === tarefa.id && 'opacity-50'
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                          {tarefa.titulo}
                        </h4>

                        {tarefa.descricao && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {tarefa.descricao}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={cn(
                              'text-xs font-medium px-1.5 py-0.5 rounded',
                              prioridadeCores[tarefa.prioridade]
                            )}
                          >
                            {prioridadeLabels[tarefa.prioridade]}
                          </span>

                          {tarefa.prazo && (
                            <span
                              className={cn(
                                'flex items-center gap-1 text-xs',
                                isOverdue(tarefa.prazo) && tarefa.status !== 'CONCLUIDO'
                                  ? 'text-red-600'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {isOverdue(tarefa.prazo) && tarefa.status !== 'CONCLUIDO' && (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              <Calendar className="h-3 w-3" />
                              {formatDate(tarefa.prazo)}
                            </span>
                          )}
                        </div>

                        {tarefa.responsavel && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-5 h-5 rounded-full bg-bmv-primary/20 flex items-center justify-center">
                              <User className="h-3 w-3 text-bmv-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground truncate">
                              {tarefa.responsavel.nome}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnTarefas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma tarefa
                </div>
              )}
            </div>

            {/* Add Task Button */}
            <div className="p-2 border-t">
              <Link href={`/consultoria/projetos/${projetoId}/nova-tarefa?status=${column.id}`}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar tarefa
                </Button>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
