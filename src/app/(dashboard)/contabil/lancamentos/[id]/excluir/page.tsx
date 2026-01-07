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
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { useModulePermissions } from '@/hooks/use-permissions'
import { contabilService, type Lancamento } from '@/services/contabil.service'

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor)
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'CONFIRMADO':
      return {
        label: 'Confirmado',
        icon: CheckCircle2,
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      }
    case 'PENDENTE':
      return {
        label: 'Pendente',
        icon: Clock,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      }
    case 'CANCELADO':
      return {
        label: 'Cancelado',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      }
    default:
      return {
        label: status,
        icon: Clock,
        color: 'bg-slate-100 text-slate-700',
      }
  }
}

interface ExcluirLancamentoPageProps {
  params: Promise<{ id: string }>
}

export default function ExcluirLancamentoPage({ params }: ExcluirLancamentoPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { canDelete } = useModulePermissions('contabil.lancamentos')

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lancamento, setLancamento] = useState<Lancamento | null>(null)

  useEffect(() => {
    async function loadLancamento() {
      try {
        setLoadingData(true)
        setError(null)
        const data = await contabilService.lancamentos.getLancamento(resolvedParams.id)
        setLancamento(data)
      } catch (err) {
        console.error('Erro ao carregar lancamento:', err)
        setError('Lancamento nao encontrado')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && tenant && resolvedParams.id) {
      loadLancamento()
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

    if (!canDelete) {
      toast({
        title: 'Erro',
        description: 'Voce nao tem permissao para excluir lancamentos',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      await contabilService.lancamentos.deleteLancamento(resolvedParams.id)

      toast({
        title: 'Lancamento excluido!',
        description: 'O lancamento contabil foi removido com sucesso.',
      })

      router.push('/contabil/lancamentos')
    } catch (err) {
      console.error('Erro ao excluir lancamento:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel excluir o lancamento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!canDelete) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link href="/contabil/lancamentos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lancamentos
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600">Voce nao tem permissao para excluir lancamentos contabeis.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lancamento && !loadingData) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link href="/contabil/lancamentos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lancamentos
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Lancamento nao encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = lancamento ? getStatusConfig(lancamento.status) : null
  const StatusIcon = statusConfig?.icon || Clock

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/contabil/lancamentos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lancamentos
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="h-7 w-7 text-red-600" />
          Excluir Lancamento Contabil
        </h1>
        <p className="text-muted-foreground">
          Confirme a exclusao do lancamento contabil
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
            Voce esta prestes a excluir o seguinte lancamento contabil:
          </p>

          {lancamento && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
              {/* Info do Lançamento */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <FileText className="h-6 w-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{new Date(lancamento.data).toLocaleDateString('pt-BR')}</span>
                    {statusConfig && (
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold text-violet-600 mb-2">{formatarMoeda(lancamento.valor)}</p>
                  <p className="text-sm text-muted-foreground">{lancamento.historico}</p>
                </div>
              </div>

              {/* Contas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    Conta Debito
                  </div>
                  <p className="font-medium text-sm">
                    {lancamento.contaDebito
                      ? `${lancamento.contaDebito.codigo} - ${lancamento.contaDebito.nome}`
                      : lancamento.contaDebitoId}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    Conta Credito
                  </div>
                  <p className="font-medium text-sm">
                    {lancamento.contaCredito
                      ? `${lancamento.contaCredito.codigo} - ${lancamento.contaCredito.nome}`
                      : lancamento.contaCreditoId}
                  </p>
                </div>
              </div>

              {lancamento.documento && (
                <div className="pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Documento: </span>
                  <span className="text-sm font-medium">{lancamento.documento}</span>
                </div>
              )}

              {/* Aviso */}
              {lancamento.status === 'CONFIRMADO' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Este lancamento ja foi confirmado. A exclusao pode afetar relatorios e saldos.
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
