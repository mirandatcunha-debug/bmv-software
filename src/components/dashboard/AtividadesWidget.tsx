'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ListTodo,
  ChevronRight,
  Clock,
  AlertTriangle,
  User,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

interface Atividade {
  id: string
  titulo: string
  status: 'A_FAZER' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDA' | 'CANCELADA'
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  dataFim: string | null
  responsavel: {
    id: string
    nome: string
  }
}

interface AtividadesWidgetProps {
  className?: string
}

const statusConfig = {
  A_FAZER: {
    label: 'A fazer',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  EM_ANDAMENTO: {
    label: 'Em andamento',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  EM_REVISAO: {
    label: 'Revisão',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  CONCLUIDA: {
    label: 'Concluída',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  CANCELADA: {
    label: 'Cancelada',
    color: 'bg-gray-100 text-gray-500 border-gray-300',
  },
}

function formatPrazoRelativo(dataFim: string | null): { texto: string; urgente: boolean } {
  if (!dataFim) {
    return { texto: 'Sem prazo', urgente: false }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const prazo = new Date(dataFim)
  prazo.setHours(0, 0, 0, 0)

  const diffMs = prazo.getTime() - hoje.getTime()
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias < 0) {
    const diasPassados = Math.abs(diffDias)
    return {
      texto: diasPassados === 1 ? 'Venceu há 1 dia' : `Venceu há ${diasPassados} dias`,
      urgente: true,
    }
  }

  if (diffDias === 0) {
    return { texto: 'Vence hoje', urgente: true }
  }

  if (diffDias === 1) {
    return { texto: 'Vence amanhã', urgente: false }
  }

  if (diffDias <= 7) {
    return { texto: `Vence em ${diffDias} dias`, urgente: false }
  }

  return { texto: `Vence em ${diffDias} dias`, urgente: false }
}

function truncarTexto(texto: string, maxLength: number = 40): string {
  if (texto.length <= maxLength) return texto
  return texto.slice(0, maxLength).trim() + '...'
}

export function AtividadesWidget({ className }: AtividadesWidgetProps) {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAtividades()
  }, [])

  const fetchAtividades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/atividades-recentes')
      if (response.ok) {
        const data = await response.json()
        setAtividades(data.atividades || [])
      } else {
        setError('Erro ao carregar atividades')
      }
    } catch (err) {
      console.error('Erro ao buscar atividades:', err)
      setError('Erro ao carregar atividades')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <ListTodo className="h-5 w-5 text-bmv-primary" />
              </div>
              <span>Atividades da Equipe</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <ListTodo className="h-5 w-5 text-bmv-primary" />
              </div>
              <span>Atividades da Equipe</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchAtividades}
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (atividades.length === 0) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <ListTodo className="h-5 w-5 text-bmv-primary" />
              </div>
              <span>Atividades da Equipe</span>
            </div>
            <Link href="/processos/atividades">
              <Button variant="ghost" size="sm" className="transition-interactive hover:bg-bmv-primary/10">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 animate-fade-in-up">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhuma atividade pendente</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sua equipe está em dia com as tarefas!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-bmv-primary/10">
              <ListTodo className="h-5 w-5 text-bmv-primary" />
            </div>
            <span>Atividades da Equipe</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {atividades.length}
            </Badge>
          </div>
          <Link href="/processos/atividades">
            <Button variant="ghost" size="sm" className="transition-interactive hover:bg-bmv-primary/10">
              Ver todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {atividades.map((atividade, index) => {
            const prazo = formatPrazoRelativo(atividade.dataFim)
            const config = statusConfig[atividade.status]

            return (
              <div
                key={atividade.id}
                className={cn(
                  'group p-3 rounded-lg border transition-all duration-200',
                  'hover:shadow-sm hover:border-bmv-primary/30',
                  'animate-fade-in-up',
                  prazo.urgente && 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Título da tarefa */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-medium text-sm flex-1 group-hover:text-bmv-primary transition-colors">
                    {truncarTexto(atividade.titulo)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs flex-shrink-0', config.color)}
                  >
                    {config.label}
                  </Badge>
                </div>

                {/* Responsável e Prazo */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{atividade.responsavel.nome.split(' ')[0]}</span>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1.5',
                    prazo.urgente && 'text-red-600 dark:text-red-400 font-medium'
                  )}>
                    {prazo.urgente ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    <span>{prazo.texto}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
