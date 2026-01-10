'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

type TipoUso = 'usuarios' | 'analises_ia' | 'contas_bancarias' | 'projetos'

interface UsageCounterProps {
  usado: number
  limite: number
  tipo: TipoUso
  className?: string
}

const tipoLabels: Record<TipoUso, { singular: string; plural: string }> = {
  usuarios: { singular: 'usuário', plural: 'usuários' },
  analises_ia: { singular: 'análise de IA', plural: 'análises de IA' },
  contas_bancarias: { singular: 'conta bancária', plural: 'contas bancárias' },
  projetos: { singular: 'projeto', plural: 'projetos' },
}

function getPercentage(usado: number, limite: number): number {
  if (limite <= 0) return 0
  return Math.min((usado / limite) * 100, 100)
}

function getStatusColor(percentage: number): {
  bar: string
  text: string
  bg: string
} {
  if (percentage >= 80) {
    return {
      bar: 'bg-red-500',
      text: 'text-red-600',
      bg: 'bg-red-50',
    }
  }
  if (percentage >= 50) {
    return {
      bar: 'bg-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
    }
  }
  return {
    bar: 'bg-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
  }
}

export function UsageCounter({ usado, limite, tipo, className }: UsageCounterProps) {
  const percentage = getPercentage(usado, limite)
  const colors = getStatusColor(percentage)
  const label = tipoLabels[tipo]
  const isLimiteIlimitado = limite === -1

  // Se for ilimitado, mostra uma versão simplificada
  if (isLimiteIlimitado) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {usado} {usado === 1 ? label.singular : label.plural}
          </span>
          <span className="font-medium text-green-600">Ilimitado</span>
        </div>
        <Progress value={0} className="h-2" indicatorClassName="bg-green-500" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className={cn('font-medium', colors.text)}>{usado}</span> de {limite}{' '}
          {limite === 1 ? label.singular : label.plural}
        </span>
        {percentage >= 80 && (
          <Link
            href="/planos"
            className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline"
          >
            <TrendingUp className="h-3 w-3" />
            Aumentar limite
          </Link>
        )}
      </div>

      <div className={cn('rounded-full', colors.bg)}>
        <Progress
          value={percentage}
          className="h-2"
          indicatorClassName={colors.bar}
        />
      </div>

      {percentage >= 100 && (
        <p className="text-xs text-red-600">
          Limite atingido! Faça upgrade para adicionar mais {label.plural}.
        </p>
      )}
    </div>
  )
}
