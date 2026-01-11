'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Users,
  ListTodo,
  ArrowUp,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  status: string
  prioridade: string
  dataFim?: string
  responsavel: {
    id: string
    nome: string
  }
}

interface AnaliseIA {
  riscoAtraso: 'ALTO' | 'MEDIO' | 'BAIXO'
  motivo: string
  sugestoes: string[]
}

interface IAAnaliseTaskProps {
  tarefa: Tarefa
}

const riscoConfig = {
  ALTO: {
    label: 'Alto',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  MEDIO: {
    label: 'Médio',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
  BAIXO: {
    label: 'Baixo',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
}

const sugestaoIcons: Record<string, React.ElementType> = {
  redistribuir: Users,
  dividir: ListTodo,
  priorizar: ArrowUp,
}

function getSugestaoIcon(sugestao: string): React.ElementType {
  const lower = sugestao.toLowerCase()
  if (lower.includes('redistribuir') || lower.includes('colaborador')) return Users
  if (lower.includes('dividir') || lower.includes('subtarefa')) return ListTodo
  if (lower.includes('priorizar') || lower.includes('prioridade')) return ArrowUp
  return Lightbulb
}

export function IAAnaliseTask({ tarefa }: IAAnaliseTaskProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analise, setAnalise] = useState<AnaliseIA | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const { toast } = useToast()

  const analisarTarefa = async () => {
    setLoading(true)
    setErro(null)
    setAnalise(null)

    try {
      const response = await fetch('/api/ia/analisar-tarefa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: tarefa.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Limite de IA atingido',
            description: data.message || 'Você atingiu o limite diário de análises.',
            variant: 'destructive',
          })
          setErro('Limite de análises IA atingido. Faça upgrade para continuar.')
          return
        }
        throw new Error(data.error || 'Erro ao analisar tarefa')
      }

      setAnalise(data.analise)
    } catch (error) {
      console.error('Erro ao analisar tarefa:', error)
      setErro('Não foi possível analisar a tarefa. Tente novamente.')
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível analisar a tarefa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    if (!analise && !loading) {
      analisarTarefa()
    }
  }

  const risco = analise ? riscoConfig[analise.riscoAtraso] : null
  const RiscoIcon = risco?.icon

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        onClick={handleOpen}
        title="Análise de IA"
      >
        <Sparkles className="h-4 w-4 text-purple-500" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Análise de IA
            </DialogTitle>
            <DialogDescription className="text-left">
              Análise inteligente da tarefa: <span className="font-medium">{tarefa.titulo}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-3" />
                <p className="text-sm text-muted-foreground">Analisando tarefa...</p>
              </div>
            ) : erro ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
                <p className="text-sm text-muted-foreground">{erro}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={analisarTarefa}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : analise && risco && RiscoIcon ? (
              <>
                {/* Risco de Atraso */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Risco de Atraso</h4>
                  <div className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    risco.color
                  )}>
                    <RiscoIcon className={cn('h-5 w-5', risco.iconColor)} />
                    <span className="font-semibold">{risco.label}</span>
                  </div>
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Motivo da Análise</h4>
                  <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                    {analise.motivo}
                  </p>
                </div>

                {/* Sugestões */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Sugestões</h4>
                  <ul className="space-y-2">
                    {analise.sugestoes.map((sugestao, index) => {
                      const SugestaoIcon = getSugestaoIcon(sugestao)
                      return (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800"
                        >
                          <SugestaoIcon className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{sugestao}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
