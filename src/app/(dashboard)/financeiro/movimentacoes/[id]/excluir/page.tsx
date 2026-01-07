'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Trash2, Loader2, AlertTriangle, TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useTenantContext } from '@/contexts/tenant-context'
import { financeiroService } from '@/services/financeiro.service'
import { Movimentacao, formatCurrency, formatDate } from '@/types/financeiro'
import { cn } from '@/lib/utils'

interface ExcluirMovimentacaoPageProps {
  params: Promise<{ id: string }>
}

export default function ExcluirMovimentacaoPage({ params }: ExcluirMovimentacaoPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenantContext()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movimentacao, setMovimentacao] = useState<Movimentacao | null>(null)

  // Carregar movimentação pelo ID
  useEffect(() => {
    async function loadMovimentacao() {
      try {
        setLoadingData(true)
        const response = await fetch(`/api/financeiro/movimentacoes/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Movimentacao nao encontrada')
        }
        const data = await response.json()
        setMovimentacao(data)
      } catch (err) {
        console.error('Erro ao carregar movimentacao:', err)
        setError('Movimentacao nao encontrada')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && tenant && resolvedParams.id) {
      loadMovimentacao()
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
      await financeiroService.movimentacoes.deleteMovimentacao(resolvedParams.id)

      toast({
        title: 'Movimentacao excluida!',
        description: 'A movimentacao foi removida com sucesso.',
      })

      router.push('/financeiro/movimentacoes')
    } catch (err) {
      console.error('Erro ao excluir movimentacao:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel excluir a movimentacao. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading de autenticação
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    router.push('/login')
    return null
  }

  // Movimentação não encontrada
  if (!movimentacao && !loadingData) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link
          href="/financeiro/movimentacoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Movimentacoes
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Movimentacao nao encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isReceita = movimentacao?.tipo === 'RECEITA'

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/financeiro/movimentacoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Movimentacoes
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="h-7 w-7 text-red-600" />
          Excluir Movimentacao
        </h1>
        <p className="text-muted-foreground">
          Confirme a exclusao da movimentacao
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
            Voce esta prestes a excluir a seguinte movimentacao:
          </p>

          {movimentacao && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
              {/* Tipo e Descrição */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={cn(
                        "font-medium",
                        isReceita
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                      )}
                    >
                      {isReceita ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {isReceita ? 'Receita' : 'Despesa'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{movimentacao.descricao}</h3>
                  <p className="text-sm text-muted-foreground">{movimentacao.categoria}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-2xl font-bold",
                    isReceita ? "text-green-600" : "text-red-600"
                  )}>
                    {isReceita ? '+ ' : '- '}{formatCurrency(movimentacao.valor)}
                  </p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{formatDate(movimentacao.dataMovimento)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Conta:</span>
                  <span className="font-medium">{movimentacao.conta?.nome || '-'}</span>
                </div>
              </div>

              {movimentacao.recorrente && (
                <div className="pt-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Movimentacao Recorrente
                  </Badge>
                </div>
              )}

              {movimentacao.observacoes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Observacoes:</span> {movimentacao.observacoes}
                  </p>
                </div>
              )}
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
