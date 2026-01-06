'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react'

interface ResumoFinanceiroProps {
  saldoTotal: number
  receitasMes: number
  receitasMesAnterior: number
  despesasMes: number
  despesasMesAnterior: number
  resultado: number
  loading?: boolean
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function calcularVariacao(atual: number, anterior: number): number {
  if (anterior === 0) return atual > 0 ? 100 : 0
  return ((atual - anterior) / anterior) * 100
}

export function ResumoFinanceiro({
  saldoTotal,
  receitasMes,
  receitasMesAnterior,
  despesasMes,
  despesasMesAnterior,
  resultado,
  loading,
}: ResumoFinanceiroProps) {
  const variacaoReceitas = calcularVariacao(receitasMes, receitasMesAnterior)
  const variacaoDespesas = calcularVariacao(despesasMes, despesasMesAnterior)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className={`animate-fade-in-up animate-stagger-${i}`}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 animate-shimmer rounded w-24"></div>
                  <div className="h-8 w-8 animate-shimmer rounded-lg"></div>
                </div>
                <div className="h-8 animate-shimmer rounded w-32"></div>
                <div className="h-3 animate-shimmer rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Saldo Total */}
      <Card className="card-interactive animate-fade-in-up animate-stagger-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Saldo Total
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 transition-transform hover:scale-110">
              <Wallet className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className={cn(
              'text-2xl font-bold animate-number',
              saldoTotal >= 0
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(saldoTotal)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Todas as contas ativas
          </p>
        </CardContent>
      </Card>

      {/* Receitas do Mes */}
      <Card className="card-interactive animate-fade-in-up animate-stagger-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Receitas do Mes
            </span>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 transition-transform hover:scale-110">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400 animate-number">
              {formatCurrency(receitasMes)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {variacaoReceitas >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 transition-transform hover:scale-125" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600 transition-transform hover:scale-125" />
            )}
            <span className={cn(
              'text-xs font-medium animate-number',
              variacaoReceitas >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {Math.abs(variacaoReceitas).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Despesas do Mes */}
      <Card className="card-interactive animate-fade-in-up animate-stagger-3">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Despesas do Mes
            </span>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 transition-transform hover:scale-110">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400 animate-number">
              {formatCurrency(despesasMes)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {variacaoDespesas <= 0 ? (
              <ArrowDownRight className="h-4 w-4 text-green-600 transition-transform hover:scale-125" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-red-600 transition-transform hover:scale-125" />
            )}
            <span className={cn(
              'text-xs font-medium animate-number',
              variacaoDespesas <= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {Math.abs(variacaoDespesas).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card className={cn(
        'card-interactive animate-fade-in-up animate-stagger-4',
        resultado >= 0
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-sm font-medium',
              resultado >= 0
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            )}>
              Resultado do Mes
            </span>
            <div className={cn(
              'p-2 rounded-lg transition-transform hover:scale-110',
              resultado >= 0
                ? 'bg-green-200 dark:bg-green-800'
                : 'bg-red-200 dark:bg-red-800'
            )}>
              <DollarSign className={cn(
                'h-5 w-5',
                resultado >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              )} />
            </div>
          </div>
          <div className="mt-3">
            <span className={cn(
              'text-2xl font-bold animate-number',
              resultado >= 0
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            )}>
              {resultado >= 0 ? '+' : ''}{formatCurrency(resultado)}
            </span>
          </div>
          <p className={cn(
            'text-xs mt-1',
            resultado >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {resultado >= 0 ? 'Lucro no periodo' : 'Prejuizo no periodo'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
