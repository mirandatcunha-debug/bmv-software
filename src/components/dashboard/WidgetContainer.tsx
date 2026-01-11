'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react'

export interface WidgetContainerProps {
  id: string
  titulo: string
  children: React.ReactNode
  onRemove?: (id: string) => void
  onResize?: (id: string, minimized: boolean) => void
  isDraggable?: boolean
  className?: string
  headerClassName?: string
  icon?: React.ReactNode
}

export function WidgetContainer({
  id,
  titulo,
  children,
  onRemove,
  onResize,
  isDraggable = true,
  className,
  headerClassName,
  icon,
}: WidgetContainerProps) {
  const [isMinimized, setIsMinimized] = React.useState(false)

  const handleToggleMinimize = () => {
    const newState = !isMinimized
    setIsMinimized(newState)
    onResize?.(id, newState)
  }

  const handleRemove = () => {
    onRemove?.(id)
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800',
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400 drag-handle">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          {icon && (
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-sm">
            {titulo}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400"
            onClick={handleToggleMinimize}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
              onClick={handleRemove}
              title="Remover widget"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'transition-all duration-200 overflow-hidden',
          isMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        )}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
