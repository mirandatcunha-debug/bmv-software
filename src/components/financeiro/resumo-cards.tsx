'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, ResumoFinanceiro } from '@/types/financeiro'
import { cn } from '@/lib/utils'

interface ResumoCardsProps {
  resumo: ResumoFinanceiro
  className?: string
}

export function ResumoCards({ resumo, className }: ResumoCardsProps) {
  const cards = [
    {
      titulo: 'Saldo Total',
      valor: resumo.saldoTotal,
      icon: Wallet,
      cor: 'bg-bmv-primary/10',
      iconCor: 'text-bmv-primary',
    },
    {
      titulo: 'Receitas (Mês)',
      valor: resumo.receitasMes,
      icon: TrendingUp,
      cor: 'bg-green-100 dark:bg-green-900/30',
      iconCor: 'text-green-600 dark:text-green-400',
    },
    {
      titulo: 'Despesas (Mês)',
      valor: resumo.despesasMes,
      icon: TrendingDown,
      cor: 'bg-red-100 dark:bg-red-900/30',
      iconCor: 'text-red-600 dark:text-red-400',
    },
    {
      titulo: 'Resultado (Mês)',
      valor: resumo.resultadoMes,
      icon: DollarSign,
      cor: resumo.resultadoMes >= 0
        ? 'bg-green-100 dark:bg-green-900/30'
        : 'bg-red-100 dark:bg-red-900/30',
      iconCor: resumo.resultadoMes >= 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {cards.map((card, index) => (
        <Card key={index} className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-2 rounded-lg', card.cor)}>
                <card.icon className={cn('h-5 w-5', card.iconCor)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.titulo}</p>
                <p className={cn(
                  'text-xl font-bold',
                  index === 3 && card.valor < 0 && 'text-red-600',
                  index === 3 && card.valor >= 0 && 'text-green-600'
                )}>
                  {formatCurrency(card.valor)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
