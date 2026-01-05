'use client'

import { StatusOKR, statusLabels, statusColors } from '@/types/okr'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StatusOKR
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const colors = statusColors[status]
  const label = statusLabels[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  )
}
