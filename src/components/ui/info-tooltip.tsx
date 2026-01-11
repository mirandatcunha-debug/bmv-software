'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  titulo: string
  descricao: string
  origem?: string
  periodo?: string
  className?: string
}

export function InfoTooltip({
  titulo,
  descricao,
  origem,
  periodo,
  className,
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        type="button"
        className="inline-flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label={`Informação: ${titulo}`}
      >
        <Info
          className="text-[#9CA3AF] hover:text-gray-500 transition-colors"
          style={{ width: '14px', height: '14px' }}
        />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 animate-fade-in">
          <div className="bg-gray-900 rounded-lg shadow-lg p-3">
            {/* Seta */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />

            {/* Conteúdo */}
            <div className="relative">
              <h4 className="text-sm font-bold text-white mb-1">
                {titulo}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {descricao}
              </p>

              {(origem || periodo) && (
                <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
                  {origem && (
                    <p className="text-[10px] text-gray-400">
                      <span className="font-medium">Fonte:</span> {origem}
                    </p>
                  )}
                  {periodo && (
                    <p className="text-[10px] text-gray-400">
                      <span className="font-medium">Período:</span> {periodo}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
