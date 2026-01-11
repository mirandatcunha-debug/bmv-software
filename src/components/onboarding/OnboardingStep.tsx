'use client'

import { useEffect, useState, useRef } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface OnboardingStepProps {
  titulo: string
  descricao: string
  posicao: 'top' | 'bottom' | 'left' | 'right'
  targetId: string
  passoAtual: number
  totalPassos: number
  onProximo: () => void
  onAnterior: () => void
  onPular: () => void
  isFirst: boolean
  isLast: boolean
}

export function OnboardingStep({
  titulo,
  descricao,
  posicao,
  targetId,
  passoAtual,
  totalPassos,
  onProximo,
  onAnterior,
  onPular,
  isFirst,
  isLast
}: OnboardingStepProps) {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const targetElement = document.getElementById(targetId)
    if (!targetElement || !tooltipRef.current) return

    const updatePosition = () => {
      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()

      if (!tooltipRect) return

      const gap = 12
      let style: React.CSSProperties = {}
      let arrow: React.CSSProperties = {}

      switch (posicao) {
        case 'top':
          style = {
            position: 'fixed',
            left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
            top: targetRect.top - tooltipRect.height - gap,
          }
          arrow = {
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 12,
            height: 12,
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb',
          }
          break
        case 'bottom':
          style = {
            position: 'fixed',
            left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
            top: targetRect.bottom + gap,
          }
          arrow = {
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 12,
            height: 12,
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            borderTop: '1px solid #e5e7eb',
          }
          break
        case 'left':
          style = {
            position: 'fixed',
            left: targetRect.left - tooltipRect.width - gap,
            top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
          }
          arrow = {
            position: 'absolute',
            right: -6,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: 12,
            height: 12,
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            borderRight: '1px solid #e5e7eb',
          }
          break
        case 'right':
          style = {
            position: 'fixed',
            left: targetRect.right + gap,
            top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
          }
          arrow = {
            position: 'absolute',
            left: -6,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: 12,
            height: 12,
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb',
          }
          break
      }

      // Ajustar para não sair da tela
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (typeof style.left === 'number') {
        if (style.left < 16) style.left = 16
        if (style.left + tooltipRect.width > viewportWidth - 16) {
          style.left = viewportWidth - tooltipRect.width - 16
        }
      }

      if (typeof style.top === 'number') {
        if (style.top < 16) style.top = 16
        if (style.top + tooltipRect.height > viewportHeight - 16) {
          style.top = viewportHeight - tooltipRect.height - 16
        }
      }

      setTooltipStyle(style)
      setArrowStyle(arrow)
    }

    // Atualiza posição inicial e em resize/scroll
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [targetId, posicao])

  return (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className={cn(
        'z-[10001] bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80',
        'animate-in fade-in-0 zoom-in-95 duration-200'
      )}
    >
      {/* Seta apontando para o elemento */}
      <div style={arrowStyle} />

      {/* Header com botão fechar */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-base">{titulo}</h3>
        <button
          onClick={onPular}
          className="text-gray-400 hover:text-gray-600 -mr-1 -mt-1 p-1"
          aria-label="Fechar tour"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Descrição */}
      <p className="text-sm text-gray-600 mb-4">{descricao}</p>

      {/* Indicador de progresso */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: totalPassos }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === passoAtual - 1
                ? 'w-6 bg-[#1E3A5F]'
                : i < passoAtual - 1
                ? 'w-3 bg-[#1E3A5F]/60'
                : 'w-3 bg-gray-200'
            )}
          />
        ))}
        <span className="ml-2 text-xs text-gray-500">
          {passoAtual} de {totalPassos}
        </span>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPular}
          className="text-gray-500 hover:text-gray-700"
        >
          Pular tour
        </Button>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAnterior}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
          )}

          <Button
            size="sm"
            onClick={onProximo}
            className="gap-1 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90"
          >
            {isLast ? 'Finalizar' : 'Próximo'}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
