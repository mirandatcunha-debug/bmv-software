'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, DollarSign, FileText, TrendingDown, Users } from 'lucide-react'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { EMPTY_STATES } from '@/lib/empty-states'

interface FaixaInadimplencia {
  faixa: string
  quantidade: number
  valor: number
  percentual: number
}

interface Devedor {
  id: string
  nome: string
  valor: number
  diasAtraso: number
  vencimento: Date
}

interface DadosInadimplencia {
  totalVencido: number
  quantidadeVencidos: number
  taxaInadimplencia: number
  totalReceber: number
  porFaixa: FaixaInadimplencia[]
  topDevedores: Devedor[]
  tendencia: { mes: string; taxa: number; quantidade: number }[]
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarData(data: Date | string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

function InadimplenciaContent() {
  const [dados, setDados] = useState<DadosInadimplencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDados() {
      try {
        const response = await fetch('/api/analytics/inadimplencia')
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
        <LoadingSpinner size="lg" message="Carregando análise de inadimplência..." />
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

  if (!dados || dados.quantidadeVencidos === 0) {
    return (
      <EmptyState
        icon={EMPTY_STATES.contasReceber.icon}
        title="Nenhuma inadimplência"
        description="Parabéns! Não há títulos vencidos no momento."
      />
    )
  }

  const getFaixaColor = (faixa: string) => {
    switch (faixa) {
      case '1-30': return 'bg-yellow-100 text-yellow-800'
      case '31-60': return 'bg-orange-100 text-orange-800'
      case '61-90': return 'bg-red-100 text-red-800'
      case '90+': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Vencido</p>
              <p className="text-2xl font-bold text-red-600">{formatarMoeda(dados.totalVencido)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Títulos Vencidos</p>
              <p className="text-2xl font-bold text-gray-900">{dados.quantidadeVencidos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxa de Inadimplência</p>
              <p className="text-2xl font-bold text-gray-900">{dados.taxaInadimplencia}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela por faixa de atraso */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Inadimplência por Faixa de Atraso
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Faixa (dias)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Quantidade</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">% do Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dados.porFaixa.map((faixa) => (
                <tr key={faixa.faixa} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getFaixaColor(faixa.faixa)}`}>
                      {faixa.faixa} dias
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{faixa.quantidade}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatarMoeda(faixa.valor)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">
                    {faixa.percentual.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top devedores */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Top 5 Devedores
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Devido</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Dias em Atraso</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dados.topDevedores.map((devedor, index) => (
                <tr key={devedor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{devedor.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                    {formatarMoeda(devedor.valor)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      devedor.diasAtraso > 90 ? 'bg-red-100 text-red-800' :
                      devedor.diasAtraso > 60 ? 'bg-orange-100 text-orange-800' :
                      devedor.diasAtraso > 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {devedor.diasAtraso} dias
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">
                    {formatarData(devedor.vencimento)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tendência */}
      {dados.tendencia && dados.tendencia.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-500" />
              Tendência (Últimos 6 meses)
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-6 gap-2">
              {dados.tendencia.map((item) => (
                <div key={item.mes} className="text-center">
                  <div className="h-24 flex items-end justify-center mb-2">
                    <div
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${Math.max(item.taxa, 5)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{item.mes}</p>
                  <p className="text-sm font-medium text-gray-900">{item.taxa}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InadimplenciaPage() {
  // Em produção, isso viria do contexto do usuário
  const planoAtual = 'pro' as const

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Análise de Inadimplência</h1>
        <p className="text-gray-500">Acompanhe os títulos vencidos e a saúde financeira dos recebíveis</p>
      </div>

      <FeatureGate feature="financeiro_avancado" planoAtual={planoAtual} planoMinimo="pro">
        <InadimplenciaContent />
      </FeatureGate>
    </div>
  )
}
