'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Target, ChevronRight, AlertTriangle } from 'lucide-react'
import { getProgressoColor, getProgressoTextColor } from '@/types/insights'

interface OKR {
  id: string
  titulo: string
  progresso: number
  dataFim: Date | string
  status: 'EM_DIA' | 'ATENCAO' | 'ATRASADO' | 'CRITICO'
}

interface OKRsDestaqueProps {
  okrs: OKR[]
  loading?: boolean
}

export function OKRsDestaque({ okrs, loading }: OKRsDestaqueProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-bmv-primary" />
              <span>Seus OKRs</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (okrs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-bmv-primary" />
              <span>Seus OKRs</span>
            </div>
            <Link href="/processos/okr">
              <Button variant="ghost" size="sm">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum OKR em andamento</p>
            <Link href="/processos/okr/novo">
              <Button variant="outline" size="sm" className="mt-3">
                Criar primeiro OKR
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-bmv-primary" />
            <span>Seus OKRs</span>
          </div>
          <Link href="/processos/okr">
            <Button variant="ghost" size="sm">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {okrs.map((okr) => {
            const dataFim = new Date(okr.dataFim)
            const diasRestantes = Math.ceil(
              (dataFim.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Link
                key={okr.id}
                href={`/processos/okr/${okr.id}`}
                className="block"
              >
                <div className="group p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {(okr.status === 'CRITICO' || okr.status === 'ATRASADO') && (
                        <AlertTriangle className={cn(
                          'h-4 w-4 flex-shrink-0 mt-0.5',
                          okr.status === 'CRITICO' ? 'text-red-500' : 'text-amber-500'
                        )} />
                      )}
                      <span className="font-medium text-sm truncate">
                        {okr.titulo}
                      </span>
                    </div>
                    <span className={cn(
                      'text-sm font-bold flex-shrink-0 ml-2',
                      getProgressoTextColor(okr.progresso)
                    )}>
                      {okr.progresso}%
                    </span>
                  </div>

                  <Progress
                    value={okr.progresso}
                    className="h-2"
                    indicatorClassName={getProgressoColor(okr.progresso)}
                  />

                  <div className="flex items-center justify-between mt-2">
                    <span className={cn(
                      'text-xs',
                      diasRestantes < 0
                        ? 'text-red-600 dark:text-red-400'
                        : diasRestantes < 15
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground'
                    )}>
                      {diasRestantes < 0
                        ? `Vencido há ${Math.abs(diasRestantes)} dias`
                        : diasRestantes === 0
                        ? 'Vence hoje'
                        : `${diasRestantes} dias restantes`}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
