'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface FluxoMensalData {
  mes: string
  receitas: number
  despesas: number
}

interface GraficoMiniFluxoProps {
  data?: FluxoMensalData[]
  loading?: boolean
}

// Dados mockados dos últimos 6 meses
const dadosMock: FluxoMensalData[] = [
  { mes: 'Ago', receitas: 38500, despesas: 29800 },
  { mes: 'Set', receitas: 42100, despesas: 31200 },
  { mes: 'Out', receitas: 39800, despesas: 34500 },
  { mes: 'Nov', receitas: 44600, despesas: 32100 },
  { mes: 'Dez', receitas: 51200, despesas: 38900 },
  { mes: 'Jan', receitas: 45320, despesas: 32180 },
]

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 dark:text-slate-400">
              {entry.name === 'receitas' ? 'Receitas' : 'Despesas'}:
            </span>
            <span className={entry.name === 'receitas' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {formatCurrency(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function GraficoMiniFluxo({ data = dadosMock, loading }: GraficoMiniFluxoProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 animate-pulse"></div>
            <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Fluxo de Caixa</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">Receitas vs Despesas - Últimos 6 meses</p>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
              />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-500 dark:text-slate-400"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-slate-500 dark:text-slate-400"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorReceitas)"
                name="receitas"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorDespesas)"
                name="despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
