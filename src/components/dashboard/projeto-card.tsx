'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Briefcase, User, Calendar, FileText } from 'lucide-react'
import { getProgressoColor } from '@/types/insights'

interface ProjetoData {
  id: string
  nome: string
  consultor: string
  status: string
  progresso: number
  proximaEntrega?: {
    data: Date | string
    descricao: string
  } | null
}

interface ProjetoCardProps {
  projeto: ProjetoData | null
  loading?: boolean
}

const statusLabels: Record<string, string> = {
  PLANEJAMENTO: 'Planejamento',
  EM_ANDAMENTO: 'Em Andamento',
  PAUSADO: 'Pausado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

const statusColors: Record<string, string> = {
  PLANEJAMENTO: 'bg-blue-100 text-blue-700 border-blue-300',
  EM_ANDAMENTO: 'bg-green-100 text-green-700 border-green-300',
  PAUSADO: 'bg-amber-100 text-amber-700 border-amber-300',
  CONCLUIDO: 'bg-slate-100 text-slate-700 border-slate-300',
  CANCELADO: 'bg-red-100 text-red-700 border-red-300',
}

export function ProjetoCard({ projeto, loading }: ProjetoCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-bmv-primary" />
            <span>Seu Projeto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!projeto) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-bmv-primary" />
            <span>Seu Projeto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum projeto ativo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Entre em contato com seu consultor
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dataProximaEntrega = projeto.proximaEntrega
    ? new Date(projeto.proximaEntrega.data)
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-bmv-primary" />
            <span>Seu Projeto</span>
          </div>
          <Badge
            variant="outline"
            className={cn(statusColors[projeto.status] || statusColors.EM_ANDAMENTO)}
          >
            {statusLabels[projeto.status] || projeto.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nome do Projeto */}
        <div>
          <h3 className="font-semibold text-lg">{projeto.nome}</h3>
        </div>

        {/* Consultor */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Consultor: {projeto.consultor}</span>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{projeto.progresso}%</span>
          </div>
          <Progress
            value={projeto.progresso}
            className="h-2"
            indicatorClassName={getProgressoColor(projeto.progresso)}
          />
        </div>

        {/* Próxima Entrega */}
        {projeto.proximaEntrega && dataProximaEntrega && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Próxima Entrega</p>
                <p className="text-sm font-medium truncate">
                  {projeto.proximaEntrega.descricao}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {dataProximaEntrega.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
