'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  DollarSign,
  Lightbulb,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Fator {
  nome: string
  valor: number
  peso: number
  pontuacao: number
  status: 'critico' | 'atencao' | 'bom' | 'excelente'
}

interface HealthScoreData {
  score: number
  classificacao: 'Crítico' | 'Atenção' | 'Saudável' | 'Excelente'
  fatores: {
    liquidez: Fator
    inadimplencia: Fator
    margem: Fator
    crescimento: Fator
  }
  recomendacoes: string[]
}

function getScoreColor(score: number): string {
  if (score < 40) return 'text-red-600'
  if (score < 60) return 'text-orange-500'
  if (score < 80) return 'text-blue-600'
  return 'text-green-600'
}

function getScoreGradient(score: number): string {
  if (score < 40) return 'from-red-500 to-red-600'
  if (score < 60) return 'from-orange-400 to-orange-500'
  if (score < 80) return 'from-blue-500 to-blue-600'
  return 'from-green-500 to-green-600'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'critico': return 'bg-red-100 text-red-700 border-red-200'
    case 'atencao': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'bom': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'excelente': return 'bg-green-100 text-green-700 border-green-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'critico': return 'Crítico'
    case 'atencao': return 'Atenção'
    case 'bom': return 'Bom'
    case 'excelente': return 'Excelente'
    default: return status
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'critico': return <XCircle className="w-4 h-4" />
    case 'atencao': return <AlertTriangle className="w-4 h-4" />
    case 'bom': return <CheckCircle2 className="w-4 h-4" />
    case 'excelente': return <CheckCircle2 className="w-4 h-4" />
    default: return null
  }
}

function getFatorIcon(fator: string) {
  switch (fator) {
    case 'liquidez': return <DollarSign className="w-5 h-5" />
    case 'inadimplencia': return <AlertTriangle className="w-5 h-5" />
    case 'margem': return <Activity className="w-5 h-5" />
    case 'crescimento': return <TrendingUp className="w-5 h-5" />
    default: return null
  }
}

function getFatorDescricao(fator: string, valor: number): string {
  switch (fator) {
    case 'liquidez': return `Índice de ${valor}x (receber/pagar)`
    case 'inadimplencia': return `Taxa de ${valor}% dos recebíveis`
    case 'margem': return `Margem operacional de ${valor}%`
    case 'crescimento': return `Variação de ${valor > 0 ? '+' : ''}${valor}% no período`
    default: return ''
  }
}

// Componente de Gauge circular
function GaugeChart({ score, size = 200 }: { score: number; size?: number }) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const rotation = -90

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {score < 40 && (
              <>
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </>
            )}
            {score >= 40 && score < 60 && (
              <>
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f97316" />
              </>
            )}
            {score >= 60 && score < 80 && (
              <>
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </>
            )}
            {score >= 80 && (
              <>
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-sm text-gray-500 mt-1">de 100</span>
      </div>
    </div>
  )
}

function SaudeFinanceiraContent() {
  const [dados, setDados] = useState<HealthScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDados() {
      try {
        const response = await fetch('/api/analytics/health-score')
        if (!response.ok) throw new Error('Erro ao carregar dados')
        const data = await response.json()
        setDados(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchDados()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Calculando saúde financeira..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Erro ao carregar dados</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Não foi possível calcular o health score.</p>
        <p className="text-sm text-gray-500 mt-1">Verifique se há dados financeiros cadastrados.</p>
      </div>
    )
  }

  const fatoresArray = [
    { key: 'liquidez', ...dados.fatores.liquidez },
    { key: 'inadimplencia', ...dados.fatores.inadimplencia },
    { key: 'margem', ...dados.fatores.margem },
    { key: 'crescimento', ...dados.fatores.crescimento },
  ]

  return (
    <div className="space-y-6">
      {/* Health Score Central */}
      <div className="bg-white rounded-xl border shadow-sm p-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <GaugeChart score={dados.score} size={220} />

          <div className="text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold bg-gradient-to-r ${getScoreGradient(dados.score)} text-white`}>
              {dados.classificacao === 'Excelente' && <CheckCircle2 className="w-5 h-5" />}
              {dados.classificacao === 'Saudável' && <CheckCircle2 className="w-5 h-5" />}
              {dados.classificacao === 'Atenção' && <AlertTriangle className="w-5 h-5" />}
              {dados.classificacao === 'Crítico' && <XCircle className="w-5 h-5" />}
              {dados.classificacao}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">Health Score da Empresa</h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Índice composto que avalia a saúde financeira considerando liquidez, inadimplência, margem operacional e crescimento.
            </p>
          </div>
        </div>
      </div>

      {/* Cards dos Fatores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fatoresArray.map((fator) => (
          <div key={fator.key} className="bg-white rounded-lg border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${getStatusColor(fator.status)}`}>
                {getFatorIcon(fator.key)}
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(fator.status)}`}>
                {getStatusIcon(fator.status)}
                {getStatusLabel(fator.status)}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">{fator.nome}</h3>
            <p className="text-sm text-gray-500 mt-1">{getFatorDescricao(fator.key, fator.valor)}</p>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Pontuação</span>
                <span className="text-lg font-bold text-gray-900">{fator.pontuacao}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    fator.pontuacao < 40 ? 'from-red-400 to-red-500' :
                    fator.pontuacao < 60 ? 'from-orange-400 to-orange-500' :
                    fator.pontuacao < 80 ? 'from-blue-400 to-blue-500' :
                    'from-green-400 to-green-500'
                  }`}
                  style={{ width: `${fator.pontuacao}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">Peso: {fator.peso}%</span>
                <span className="text-xs text-gray-400">Contribuição: {Math.round(fator.pontuacao * fator.peso / 100)} pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recomendações */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Recomendações
          </h2>
          <p className="text-sm text-gray-500 mt-1">Ações sugeridas para melhorar a saúde financeira</p>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            {dados.recomendacoes.map((recomendacao, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{recomendacao}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-gray-50 rounded-lg border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Escala de Classificação</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">Crítico (0-39)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-600">Atenção (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Saudável (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Excelente (80-100)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SaudeFinanceiraPage() {
  const planoAtual = 'pro' as const

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saúde Financeira</h1>
        <p className="text-gray-500">Visão consolidada da saúde financeira da empresa</p>
      </div>

      <FeatureGate feature="financeiro_avancado" planoAtual={planoAtual} planoMinimo="pro">
        <SaudeFinanceiraContent />
      </FeatureGate>
    </div>
  )
}
