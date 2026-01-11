'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ObjetivosResumoData {
  total: number
  concluidos: number
  emAndamento: number
  progressoMedio: number
  proximoPrazo: string | null
}

export function ObjetivosResumo() {
  const [data, setData] = useState<ObjetivosResumoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumo()
  }, [])

  const fetchResumo = async () => {
    try {
      const response = await fetch('/api/dashboard/objetivos-resumo')
      if (response.ok) {
        const resumo = await response.json()
        setData(resumo)
      }
    } catch (error) {
      console.error('Erro ao buscar resumo de objetivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  const objetivosAtivos = data ? data.total - data.concluidos : 0

  return (
    <Link href="/processos/okr" className="block">
      <div
        className={cn(
          'group p-4 rounded-xl border-2 transition-all duration-300',
          'hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]',
          'animate-fade-in-up cursor-pointer',
          'bg-indigo-50 dark:bg-indigo-900/20',
          'border-indigo-200 dark:border-indigo-800',
          'hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:border-indigo-300'
        )}
      >
        {/* Icone */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
            'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
            'bg-white dark:bg-slate-800 shadow-sm'
          )}
        >
          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Titulo */}
        <h3
          className={cn(
            'font-semibold text-sm mb-1 transition-colors',
            'text-slate-900 dark:text-slate-100',
            'group-hover:text-bmv-primary'
          )}
        >
          Objetivos
        </h3>

        {/* Conteudo dinamico */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 w-20 bg-indigo-200 dark:bg-indigo-800 rounded animate-pulse" />
            <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-800 rounded animate-pulse" />
          </div>
        ) : data && data.total > 0 ? (
          <div className="space-y-2">
            {/* Mini resumo */}
            <p className="text-xs text-muted-foreground">
              {objetivosAtivos} objetivo{objetivosAtivos !== 1 ? 's' : ''} ativo{objetivosAtivos !== 1 ? 's' : ''}
            </p>

            {/* Barra de progresso */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Progresso
                </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {data.progressoMedio}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${data.progressoMedio}%` }}
                />
              </div>
            </div>

            {/* Proximo prazo */}
            {data.proximoPrazo && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Prazo: {formatDate(data.proximoPrazo)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Defina seus objetivos</p>
        )}

        {/* Indicador de acao */}
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-xs font-medium',
            'text-indigo-600 dark:text-indigo-400',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <Target className="h-3 w-3" />
          <span>Acessar</span>
        </div>
      </div>
    </Link>
  )
}
