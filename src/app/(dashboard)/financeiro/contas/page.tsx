'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Landmark,
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Power,
  Building2,
  Wallet,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react'
import {
  ContaBancaria,
  TipoConta,
  formatCurrency,
  tipoContaLabels,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'
import { useModulePermissions } from '@/hooks/use-permissions'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { financeiroService } from '@/services/financeiro.service'

// Logos/cores dos bancos
const bancosConfig: Record<string, { cor: string; corSecundaria: string }> = {
  'Banco do Brasil': { cor: '#FFED00', corSecundaria: '#003882' },
  'Itau': { cor: '#FF6600', corSecundaria: '#003399' },
  'Caixa': { cor: '#0066CC', corSecundaria: '#F37021' },
  'Bradesco': { cor: '#CC092F', corSecundaria: '#CC092F' },
  'Santander': { cor: '#EC0000', corSecundaria: '#EC0000' },
  'Nubank': { cor: '#820AD1', corSecundaria: '#820AD1' },
  'Inter': { cor: '#FF7A00', corSecundaria: '#FF7A00' },
  'XP': { cor: '#00875A', corSecundaria: '#00875A' },
  'C6': { cor: '#1A1A1A', corSecundaria: '#1A1A1A' },
  'default': { cor: '#6366f1', corSecundaria: '#6366f1' },
}


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

const getBancoConfig = (banco: string) => {
  return bancosConfig[banco] || bancosConfig['default']
}

export default function ContasPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { canView, canCreate, canEdit, canDelete } = useModulePermissions('financeiro.contas')

  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar contas
  useEffect(() => {
    async function loadContas() {
      try {
        setLoading(true)
        setError(null)
        const contasData = await financeiroService.contas.getContas()
        setContas(contasData)
      } catch (err) {
        console.error('Erro ao carregar contas:', err)
        setError('Erro ao carregar contas bancarias')
      } finally {
        setLoading(false)
      }
    }

    if (user && tenant) {
      loadContas()
    }
  }, [user, tenant])

  // Calcular saldo total
  const saldoTotal = contas
    .filter((c) => c.ativo)
    .reduce((acc, c) => acc + c.saldoAtual, 0)

  // Tendência total (média ponderada)
  const tendenciaTotal = 10.2

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/financeiro"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Financeiro
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Financeiro
      </Link>

      {/* Header com gradiente roxo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Landmark className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Contas Bancarias</h1>
                <p className="text-purple-100 text-sm md:text-base">
                  Gerencie suas contas bancarias e acompanhe saldos
                </p>
              </div>
            </div>
            {canCreate && (
              <Link href="/financeiro/contas/nova">
                <Button
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg shadow-purple-900/30 transition-all hover:scale-105 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </Link>
            )}
          </div>

          {/* Mini cards de resumo no header */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-purple-200" />
                <span className="text-xs text-purple-200">Saldo Total</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(saldoTotal)}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-300">
                <ArrowUpRight className="h-3 w-3" />
                +{tendenciaTotal}% este mes
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-purple-200" />
                <span className="text-xs text-purple-200">Contas Ativas</span>
              </div>
              <p className="text-2xl font-bold">
                {contas.filter(c => c.ativo).length}
              </p>
              <p className="text-xs text-purple-200 mt-1">
                de {contas.length} cadastradas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Contas */}
      {contas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {contas.map((conta, index) => {
            const Icon = getIconByTipo(conta.tipo)
            const bancoConfig = getBancoConfig(conta.banco || '')
            const tendencia = 0 // TODO: calcular tendencia real
            const variacao = conta.saldoAtual - conta.saldoInicial

            return (
              <Card
                key={conta.id}
                className={cn(
                  'group relative overflow-hidden border-2 border-transparent hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 animate-fade-in-up',
                  !conta.ativo && 'opacity-60'
                )}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {/* Barra superior colorida */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: bancoConfig.cor }}
                />

                {/* Background hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <CardContent className="p-6 pt-5 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Logo/Icone do banco */}
                      <div
                        className="p-4 rounded-xl shadow-lg transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${bancoConfig.cor}20`,
                          border: `2px solid ${bancoConfig.cor}40`
                        }}
                      >
                        <Icon
                          className="h-7 w-7"
                          style={{ color: bancoConfig.corSecundaria }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">{conta.nome}</h3>
                          {!conta.ativo && (
                            <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-600">
                              Inativa
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {conta.banco}
                        </p>
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
                            borderColor: `${bancoConfig.cor}50`,
                            color: bancoConfig.corSecundaria
                          }}
                        >
                          {tipoContaLabels[conta.tipo]}
                        </Badge>
                      </div>
                    </div>

                    {(canEdit || canDelete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit && (
                            <Link href={`/financeiro/contas/${conta.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {canEdit && (
                            <DropdownMenuItem className={cn(
                              "cursor-pointer",
                              conta.ativo ? 'text-amber-600' : 'text-green-600'
                            )}>
                              <Power className="h-4 w-4 mr-2" />
                              {conta.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <Link href={`/financeiro/contas/${conta.id}/excluir`}>
                              <DropdownMenuItem className="cursor-pointer text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </Link>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Saldo e Tendência */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Saldo Atual</span>
                        <p
                          className={cn(
                            'text-2xl font-bold',
                            conta.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(conta.saldoAtual)}
                        </p>
                      </div>

                      {/* Indicador de Tendência */}
                      <div className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
                        tendencia >= 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {tendencia >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {tendencia >= 0 ? '+' : ''}{tendencia}%
                      </div>
                    </div>

                    {/* Barra de progresso do saldo */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Inicial: {formatCurrency(conta.saldoInicial)}</span>
                        <span className={variacao >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {variacao >= 0 ? '+' : ''}{formatCurrency(variacao)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            variacao >= 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-rose-500"
                          )}
                          style={{
                            width: `${Math.min(100, Math.abs((conta.saldoAtual / Math.max(conta.saldoInicial, conta.saldoAtual)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="animate-fade-in-up">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-xl"></div>
                <div className="relative p-6 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full">
                  <Landmark className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <Sparkles className="h-6 w-6 text-purple-400 mt-4 animate-pulse" />
              <h3 className="text-xl font-semibold mt-4 mb-2">Nenhuma conta cadastrada</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Adicione sua primeira conta bancaria para comecar a controlar suas financas de forma mais eficiente.
              </p>
              {canCreate && (
                <Link href="/financeiro/contas/nova">
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Conta
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
