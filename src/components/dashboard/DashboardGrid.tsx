'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface WidgetPosition {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export interface DashboardGridProps {
  children: React.ReactNode
  layout: WidgetPosition[]
  onLayoutChange?: (layout: WidgetPosition[]) => void
  columns?: number
  gap?: number
  className?: string
}

interface DragState {
  isDragging: boolean
  draggedId: string | null
  startX: number
  startY: number
  dragOverId: string | null
}

export function DashboardGrid({
  children,
  layout,
  onLayoutChange,
  columns = 2,
  gap = 16,
  className,
}: DashboardGridProps) {
  const [dragState, setDragState] = React.useState<DragState>({
    isDragging: false,
    draggedId: null,
    startX: 0,
    startY: 0,
    dragOverId: null,
  })

  const gridRef = React.useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)

    setDragState({
      isDragging: true,
      draggedId: id,
      startX: e.clientX,
      startY: e.clientY,
      dragOverId: null,
    })

    // Add a slight delay to set the dragging class
    setTimeout(() => {
      const element = document.getElementById(`widget-${id}`)
      if (element) {
        element.classList.add('dragging')
      }
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault()

    const element = document.getElementById(`widget-${dragState.draggedId}`)
    if (element) {
      element.classList.remove('dragging')
    }

    // Swap positions if dropping over another widget
    if (dragState.draggedId && dragState.dragOverId && dragState.draggedId !== dragState.dragOverId) {
      const newLayout = [...layout]
      const draggedIndex = newLayout.findIndex(w => w.id === dragState.draggedId)
      const targetIndex = newLayout.findIndex(w => w.id === dragState.dragOverId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Swap y positions
        const tempY = newLayout[draggedIndex].y
        newLayout[draggedIndex].y = newLayout[targetIndex].y
        newLayout[targetIndex].y = tempY

        // Sort by y position
        newLayout.sort((a, b) => a.y - b.y)

        // Reassign y positions sequentially
        newLayout.forEach((item, index) => {
          item.y = index
        })

        onLayoutChange?.(newLayout)
      }
    }

    setDragState({
      isDragging: false,
      draggedId: null,
      startX: 0,
      startY: 0,
      dragOverId: null,
    })
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (id !== dragState.draggedId) {
      setDragState(prev => ({
        ...prev,
        dragOverId: id,
      }))
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragState(prev => ({
      ...prev,
      dragOverId: null,
    }))
  }

  // Sort children by layout position
  const sortedLayout = [...layout].sort((a, b) => a.y - b.y)

  // Create a map of children by their key/id
  const childrenArray = React.Children.toArray(children)
  const childrenMap = new Map<string, React.ReactNode>()

  childrenArray.forEach((child) => {
    if (React.isValidElement(child) && child.props.id) {
      childrenMap.set(child.props.id, child)
    }
  })

  return (
    <div
      ref={gridRef}
      className={cn(
        'grid transition-all duration-200',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {sortedLayout.map((position) => {
        const child = childrenMap.get(position.id)
        if (!child) return null

        const isBeingDragged = dragState.draggedId === position.id
        const isDragOver = dragState.dragOverId === position.id

        return (
          <div
            key={position.id}
            id={`widget-${position.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, position.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, position.id)}
            onDragLeave={handleDragLeave}
            className={cn(
              'transition-all duration-200',
              isBeingDragged && 'opacity-50 scale-95',
              isDragOver && 'ring-2 ring-primary ring-offset-2 rounded-xl',
              position.w === 2 && 'col-span-2',
              position.w === 1 && 'col-span-1',
              // Mobile: sempre full width
              'max-lg:col-span-2'
            )}
            style={{
              gridColumn: position.w === 2 ? 'span 2' : `span ${position.w}`,
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}

// Utility functions for layout management
export function createDefaultLayout(widgetIds: string[]): WidgetPosition[] {
  return widgetIds.map((id, index) => ({
    id,
    x: index % 2,
    y: Math.floor(index / 2),
    w: 1,
    h: 1,
  }))
}

export function saveLayoutToStorage(userId: string, layout: WidgetPosition[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`dashboard-layout-${userId}`, JSON.stringify(layout))
  }
}

export function loadLayoutFromStorage(userId: string): WidgetPosition[] | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`dashboard-layout-${userId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
  }
  return null
}
