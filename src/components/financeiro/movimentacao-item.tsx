'use client'

import { TrendingUp, TrendingDown, ArrowLeftRight, Calendar } from 'lucide-react'
import {
  Movimentacao,
  formatCurrency,
  formatDate,
  tipoTransacaoLabels,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'

interface MovimentacaoItemProps {
  movimentacao: Movimentacao
  onClick?: () => void
  className?: string
}

export function MovimentacaoItem({ movimentacao, onClick, className }: MovimentacaoItemProps) {
  const getIcon = () => {
    switch (movimentacao.tipo) {
      case 'RECEITA':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'DESPESA':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'TRANSFERENCIA':
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />
    }
  }

  const getIconBg = () => {
    switch (movimentacao.tipo) {
      case 'RECEITA':
        return 'bg-green-100 dark:bg-green-900/30'
      case 'DESPESA':
        return 'bg-red-100 dark:bg-red-900/30'
      case 'TRANSFERENCIA':
        return 'bg-blue-100 dark:bg-blue-900/30'
    }
  }

  const getValorColor = () => {
    switch (movimentacao.tipo) {
      case 'RECEITA':
        return 'text-green-600'
      case 'DESPESA':
        return 'text-red-600'
      case 'TRANSFERENCIA':
        return 'text-blue-600'
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', getIconBg())}>
          {getIcon()}
        </div>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            {movimentacao.descricao}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {movimentacao.categoria}
            </span>
            {movimentacao.conta && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {movimentacao.conta.nome}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(movimentacao.dataMovimento)}
        </div>
        <div className={cn('font-semibold', getValorColor())}>
          {movimentacao.tipo === 'DESPESA' ? '- ' : '+ '}
          {formatCurrency(movimentacao.valor)}
        </div>
      </div>
    </div>
  )
}
