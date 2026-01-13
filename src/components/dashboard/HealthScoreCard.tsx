'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Activity, ArrowRight, TrendingUp } from 'lucide-react'

interface HealthScoreData {
  score: number
  classificacao: 'Critico' | 'Atencao' | 'Saudavel' | 'Excelente'
  recomendacoes: string[]
}

export function HealthScoreCard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HealthScoreData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchHealthScore()
  }, [])

  const fetchHealthScore = async () => {
    try {
      const response = await fetch('/api/analytics/health-score')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Erro ao carregar health score:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 40) return { ring: 'stroke-red-500', text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' }
    if (score <= 70) return { ring: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' }
    return { ring: 'stroke-green-500', text: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
  }

  const getClassificacaoStyle = (classificacao: string) => {
    switch (classificacao) {
      case 'Critico':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Atencao':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'Saudavel':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Excelente':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800">
              <Activity className="h-5 w-5 text-gray-600 dark:text-slate-300" />
            </div>
            <span>Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full animate-shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-24 animate-shimmer rounded"></div>
              <div className="h-4 w-full animate-shimmer rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800">
              <Activity className="h-5 w-5 text-gray-600 dark:text-slate-300" />
            </div>
            <span>Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500 dark:text-slate-400">
            <p>Nao foi possivel carregar o Health Score.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchHealthScore}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const colors = getScoreColor(data.score)
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (data.score / 100) * circumference

  return (
    <Card className={cn('border transition-all duration-300', colors.bg, 'border-gray-200 dark:border-slate-800')}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
            <div className={cn('p-2 rounded-xl', colors.bg)}>
              <Activity className={cn('h-5 w-5', colors.text)} />
            </div>
            <div>
              <span className="block">Health Score</span>
              <span className="text-xs font-normal text-gray-500 dark:text-slate-400">
                Saude financeira da empresa
              </span>
            </div>
          </div>
          <TrendingUp className={cn('h-4 w-4', colors.text)} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circulo com score */}
          <div className="relative flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={colors.ring}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-2xl font-bold', colors.text)}>
                {data.score}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className={cn(
              'inline-block px-3 py-1 rounded-full text-sm font-medium mb-2',
              getClassificacaoStyle(data.classificacao)
            )}>
              {data.classificacao}
            </div>

            {data.recomendacoes.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                {data.recomendacoes[0]}
              </p>
            )}

            <Link href="/financeiro/saude">
              <Button
                variant="ghost"
                size="sm"
                className={cn('mt-2 p-0 h-auto font-medium group', colors.text)}
              >
                Ver detalhes
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
