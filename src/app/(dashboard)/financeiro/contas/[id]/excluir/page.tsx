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
  Landmark,
  Building2,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { financeiroService } from '@/services/financeiro.service'
import { ContaBancaria, TipoConta, formatCurrency, tipoContaLabels } from '@/types/financeiro'
import { cn } from '@/lib/utils'

const getIconByTipo = (tipo: TipoConta) => {
  switch (tipo) {
    case 'CORRENTE':
      return Building2
    case 'POUPANCA':
      return PiggyBank
    case 'INVESTIMENTO':
      return TrendingUp
    case 'CAIXA':
      return Wallet
    default:
      return Landmark
  }
}

interface ExcluirContaPageProps {
  params: Promise<{ id: string }>
}

export default function ExcluirContaPage({ params }: ExcluirContaPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conta, setConta] = useState<ContaBancaria | null>(null)

  // Carregar dados da conta
  useEffect(() => {
    async function loadConta() {
      try {
        setLoadingData(true)
        setError(null)
        const contaData = await financeiroService.contas.getConta(resolvedParams.id)
        setConta(contaData)
      } catch (err) {
        console.error('Erro ao carregar conta:', err)
        setError('Conta nao encontrada')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && tenant && resolvedParams.id) {
      loadConta()
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
      await financeiroService.contas.deleteConta(resolvedParams.id)

      toast({
        title: 'Conta excluida!',
        description: 'A conta bancaria foi removida com sucesso.',
      })

      router.push('/financeiro/contas')
    } catch (err) {
      console.error('Erro ao excluir conta:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel excluir a conta. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading de autenticação ou dados
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    router.push('/login')
    return null
  }

  // Conta não encontrada
  if (!conta && !loadingData) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link
          href="/financeiro/contas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Contas
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Conta nao encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = conta ? getIconByTipo(conta.tipo) : Landmark

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/financeiro/contas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Contas
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="h-7 w-7 text-red-600" />
          Excluir Conta Bancaria
        </h1>
        <p className="text-muted-foreground">
          Confirme a exclusao da conta bancaria
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
            Voce esta prestes a excluir a seguinte conta bancaria:
          </p>

          {conta && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
              {/* Info da Conta */}
              <div className="flex items-start gap-4">
                <div
                  className="p-4 rounded-xl shadow-lg"
                  style={{
                    backgroundColor: `${conta.cor || '#6366f1'}20`,
                    border: `2px solid ${conta.cor || '#6366f1'}40`
                  }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: conta.cor || '#6366f1' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{conta.nome}</h3>
                    {!conta.ativo && (
                      <Badge variant="secondary" className="text-xs">
                        Inativa
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{conta.banco || 'Sem banco'}</p>
                  {(conta.agencia || conta.conta) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {conta.agencia && `Ag: ${conta.agencia}`}
                      {conta.agencia && conta.conta && ' | '}
                      {conta.conta && `Cc: ${conta.conta}`}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs"
                    style={{
                      borderColor: `${conta.cor || '#6366f1'}50`,
                      color: conta.cor || '#6366f1'
                    }}
                  >
                    {tipoContaLabels[conta.tipo]}
                  </Badge>
                </div>
              </div>

              {/* Saldos */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-xs text-muted-foreground">Saldo Inicial</span>
                  <p className="font-medium">{formatCurrency(conta.saldoInicial)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Saldo Atual</span>
                  <p className={cn(
                    "font-bold text-lg",
                    conta.saldoAtual >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(conta.saldoAtual)}
                  </p>
                </div>
              </div>

              {/* Aviso */}
              {conta.saldoAtual !== 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Esta conta possui saldo diferente de zero. Todas as movimentacoes associadas serao afetadas.
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
