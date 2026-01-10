'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TipoInsight = 'alerta' | 'sugestao' | 'previsao'
export type ImpactoInsight = 'positivo' | 'negativo' | 'neutro'

interface IAInsightCardProps {
  tipo: TipoInsight
  titulo: string
  descricao: string
  impacto: ImpactoInsight
  acao?: string
  onAcao?: () => void
}

const ICONES_TIPO: Record<TipoInsight, React.ReactNode> = {
  alerta: <AlertTriangle className="h-5 w-5" />,
  sugestao: <Lightbulb className="h-5 w-5" />,
  previsao: <TrendingUp className="h-5 w-5" />
}

const LABELS_TIPO: Record<TipoInsight, string> = {
  alerta: 'Alerta',
  sugestao: 'Sugestão',
  previsao: 'Previsão'
}

const CORES_IMPACTO: Record<ImpactoInsight, {
  bg: string
  border: string
  text: string
  icon: string
}> = {
  positivo: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-600'
  },
  negativo: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600'
  },
  neutro: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600'
  }
}

export function IAInsightCard({
  tipo,
  titulo,
  descricao,
  impacto,
  acao,
  onAcao
}: IAInsightCardProps) {
  const cores = CORES_IMPACTO[impacto]
  const icone = ICONES_TIPO[tipo]
  const labelTipo = LABELS_TIPO[tipo]

  return (
    <Card className={cn('border', cores.border, cores.bg)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-md', cores.bg, cores.icon)}>
              {icone}
            </div>
            <span className={cn('text-xs font-medium uppercase', cores.text)}>
              {labelTipo}
            </span>
          </div>
        </div>
        <CardTitle className={cn('text-base font-semibold mt-2', cores.text)}>
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {descricao}
        </p>
        {acao && (
          <Button
            variant="ghost"
            size="sm"
            className={cn('px-0 h-auto font-medium', cores.text)}
            onClick={onAcao}
          >
            {acao}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
