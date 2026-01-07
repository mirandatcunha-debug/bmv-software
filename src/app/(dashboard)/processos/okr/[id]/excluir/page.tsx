'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Trash2,
  Loader2,
  AlertTriangle,
  Target,
  User,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { okrService } from '@/services/okr.service'
import { StatusOKR, statusLabels } from '@/types/okr'
import { cn } from '@/lib/utils'

const statusColors: Record<StatusOKR, string> = {
  NAO_INICIADO: 'bg-slate-100 text-slate-700',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  ATRASADO: 'bg-amber-100 text-amber-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
}

interface ObjetivoData {
  id: string
  titulo: string
  descricao: string
  dono: { nome: string }
  trimestre?: string
  ano?: number
  status: StatusOKR
  progresso: number
  keyResultsCount: number
}

interface ExcluirObjetivoPageProps {
  params: Promise<{ id: string }>
}

export default function ExcluirObjetivoPage({ params }: ExcluirObjetivoPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [objetivo, setObjetivo] = useState<ObjetivoData | null>(null)

  // Carregar dados do objetivo
  useEffect(() => {
    async function loadObjetivo() {
      try {
        setLoadingData(true)
        setError(null)

        // Simulando dados mockados por enquanto
        await new Promise(resolve => setTimeout(resolve, 500))

        setObjetivo({
          id: resolvedParams.id,
          titulo: 'Aumentar receita recorrente em 30%',
          descricao: 'Expandir a base de clientes e aumentar o ticket medio atraves de upselling e cross-selling.',
          dono: { nome: 'Joao Silva' },
          trimestre: 'Q1',
          ano: 2026,
          status: 'EM_ANDAMENTO',
          progresso: 65,
          keyResultsCount: 3,
        })
      } catch (err) {
        console.error('Erro ao carregar objetivo:', err)
        setError('Objetivo nao encontrado')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && tenant && resolvedParams.id) {
      loadObjetivo()
    }
  }, [user, tenant, resolvedParams.id])

  const handleDelete = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Voce precisa estar autenticado',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await okrService.objetivos.deleteObjetivo(resolvedParams.id)

      toast({
        title: 'Objetivo excluido!',
        description: 'O objetivo foi removido com sucesso.',
      })

      router.push('/processos/okr')
    } catch (err) {
      console.error('Erro ao excluir objetivo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel excluir o objetivo. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading de autenticacao ou dados
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Usuario nao autenticado
  if (!user) {
    router.push('/login')
    return null
  }

  // Objetivo nao encontrado
  if (!objetivo && !loadingData) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link
          href="/processos/okr"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para OKRs
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Objetivo nao encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href={`/processos/okr/${resolvedParams.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Objetivo
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="h-7 w-7 text-red-600" />
          Excluir Objetivo
        </h1>
        <p className="text-muted-foreground">
          Confirme a exclusao do objetivo e seus Key Results
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Confirmation Card */}
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-700 dark:text-red-400">Confirmar Exclusao</CardTitle>
              <CardDescription>
                Esta acao nao pode ser desfeita
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-6">
            Voce esta prestes a excluir o seguinte objetivo:
          </p>

          {objetivo && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
              {/* Info do Objetivo */}
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl shadow-lg bg-blue-100 dark:bg-blue-900/30">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{objetivo.titulo}</h3>
                    <Badge className={cn("text-xs", statusColors[objetivo.status])}>
                      {statusLabels[objetivo.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{objetivo.descricao}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {objetivo.dono.nome}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {objetivo.trimestre} {objetivo.ano}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {objetivo.keyResultsCount} Key Results
                    </div>
                  </div>
                </div>
              </div>

              {/* Progresso */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progresso atual</span>
                  <span className="font-bold text-blue-600">{objetivo.progresso}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${objetivo.progresso}%` }}
                  />
                </div>
              </div>

              {/* Aviso */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Todos os {objetivo.keyResultsCount} Key Results e tarefas vinculadas tambem serao excluidos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3 bg-slate-50 dark:bg-slate-800/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Trash2 className="h-4 w-4 mr-2" />
            Confirmar Exclusao
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
