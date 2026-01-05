'use client'

import { StatusOKR, progressoColors } from '@/types/okr'
import { cn } from '@/lib/utils'

interface ProgressoBarProps {
  progresso: number
  status: StatusOKR
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ProgressoBar({
  progresso,
  status,
  size = 'md',
  showLabel = true,
  className,
}: ProgressoBarProps) {
  const progressColor = progressoColors[status]

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Progresso</span>
          <span className="text-xs font-medium">{Math.round(progresso)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', progressColor)}
          style={{ width: `${Math.min(100, Math.max(0, progresso))}%` }}
        />
      </div>
    </div>
  )
}
