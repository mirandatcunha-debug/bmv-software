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
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 dark:focus:ring-slate-600"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label={`Informação: ${titulo}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
            {/* Seta */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-gray-200 dark:border-slate-700 rotate-45" />

            {/* Conteúdo */}
            <div className="relative">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
                {titulo}
              </h4>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                {descricao}
              </p>

              {(origem || periodo) && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 space-y-1">
                  {origem && (
                    <p className="text-[10px] text-gray-500 dark:text-slate-500">
                      <span className="font-medium">Origem:</span> {origem}
                    </p>
                  )}
                  {periodo && (
                    <p className="text-[10px] text-gray-500 dark:text-slate-500">
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
