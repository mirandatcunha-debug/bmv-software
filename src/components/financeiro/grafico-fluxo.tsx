'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/types/financeiro'
import { cn } from '@/lib/utils'

interface DadosMes {
  mes: string
  receitas: number
  despesas: number
}

interface GraficoFluxoProps {
  dados: DadosMes[]
  className?: string
}

export function GraficoFluxo({ dados, className }: GraficoFluxoProps) {
  // Encontrar o valor máximo para escalar as barras
  const maxValor = Math.max(
    ...dados.flatMap((d) => [d.receitas, d.despesas])
  )

  const getAltura = (valor: number) => {
    if (maxValor === 0) return 0
    return (valor / maxValor) * 100
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>Receitas e despesas dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-64">
          {dados.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Barras */}
              <div className="w-full flex gap-1 items-end h-48">
                {/* Receita */}
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${getAltura(item.receitas)}%` }}
                    title={`Receitas: ${formatCurrency(item.receitas)}`}
                  />
                </div>
                {/* Despesa */}
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600"
                    style={{ height: `${getAltura(item.despesas)}%` }}
                    title={`Despesas: ${formatCurrency(item.despesas)}`}
                  />
                </div>
              </div>
              {/* Label do mês */}
              <span className="text-xs text-muted-foreground font-medium">
                {item.mes}
              </span>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
