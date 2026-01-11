'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Building2,
  Wallet,
  PiggyBank,
  TrendingUp,
  Loader2,
  FileText,
  DollarSign,
  Hash,
} from 'lucide-react'
import {
  ContaBancaria,
  TipoConta,
  formatCurrency,
  tipoContaLabels,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'
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

// Função para formatar data relativa
function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInMs = now.getTime() - targetDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)

  if (diffInMinutes < 1) return 'agora mesmo'
  if (diffInMinutes < 60) return `ha ${diffInMinutes} min`
  if (diffInHours < 24) return `ha ${diffInHours}h`
  if (diffInDays === 1) return 'ontem'
  if (diffInDays < 7) return `ha ${diffInDays} dias`
  if (diffInWeeks === 1) return 'ha 1 semana'
  if (diffInWeeks < 4) return `ha ${diffInWeeks} semanas`
  if (diffInMonths === 1) return 'ha 1 mes'
  if (diffInMonths < 12) return `ha ${diffInMonths} meses`
  return targetDate.toLocaleDateString('pt-BR')
}

export default function ContasPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant()
  const { canCreate, canEdit } = useModulePermissions('financeiro.contas')

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
        setError('Erro ao carregar contas bancarias. Verifique sua conexao.')
      } finally {
        setLoading(false)
      }
    }

    if (user && tenant) {
      loadContas()
    } else if (!authLoading && !tenantLoading) {
      setLoading(false)
      if (!user) {
        setError('Usuario nao autenticado. Faca login novamente.')
      } else if (!tenant) {
        setError(tenantError || 'Configure sua empresa para comecar a usar o sistema.')
      }
    }
  }, [user, tenant, authLoading, tenantLoading, tenantError])

  // Calcular saldo total (apenas contas ativas)
  const contasAtivas = contas.filter((c) => c.ativo)
  const saldoTotal = contasAtivas.reduce((acc, c) => acc + c.saldoAtual, 0)
  const quantidadeAtivas = contasAtivas.length

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Error state - empresa nao configurada
  if (error && !tenant) {
    const isConfigError = error.includes('Configure') || error.includes('configurada')
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
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="p-6 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
                <Building2 className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {isConfigError ? 'Configure sua empresa' : 'Erro ao carregar'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                {isConfigError
                  ? 'Para acessar o modulo financeiro, voce precisa configurar os dados da sua empresa primeiro.'
                  : error}
              </p>
              <div className="flex gap-3">
                {isConfigError ? (
                  <Link href="/configuracoes/empresa">
                    <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white">
                      <Building2 className="h-4 w-4 mr-2" />
                      Configurar Empresa
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state - outros erros
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

      {/* Header profissional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Landmark className="h-8 w-8 text-gray-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100">Contas Bancarias</h1>
            <p className="text-gray-500 dark:text-slate-400">
              Gerencie suas contas bancarias e acompanhe saldos
            </p>
          </div>
        </div>
        {canCreate && (
          <Link href="/financeiro/contas/nova">
            <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </Link>
        )}
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <DollarSign className="h-6 w-6 text-gray-600 dark:text-slate-300" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Saldo Total</span>
                  <InfoTooltip
                    titulo="Saldo Total"
                    descricao="Soma dos saldos de todas as contas ativas"
                  />
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  saldoTotal >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(saldoTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <Hash className="h-6 w-6 text-gray-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Contas Ativas</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                  {quantidadeAtivas}
                  <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">
                    de {contas.length} cadastradas
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteudo: Tabela ou Empty State */}
      {contas.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Banco</TableHead>
                  <TableHead className="font-semibold">Agencia / Conta</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold text-right">Saldo Atual</TableHead>
                  <TableHead className="font-semibold">Ultima Atualizacao</TableHead>
                  <TableHead className="font-semibold text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => {
                  const Icon = getIconByTipo(conta.tipo)
                  const bancoConfig = getBancoConfig(conta.banco || '')

                  return (
                    <TableRow
                      key={conta.id}
                      className={cn(
                        "hover:bg-slate-50 transition-colors",
                        !conta.ativo && "opacity-50 bg-slate-50"
                      )}
                    >
                      {/* Banco com icone */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: `${bancoConfig.cor}20`,
                              border: `1px solid ${bancoConfig.cor}40`
                            }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{ color: bancoConfig.corSecundaria }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{conta.nome}</p>
                            <p className="text-sm text-slate-500">{conta.banco || 'Sem banco'}</p>
                          </div>
                          {!conta.ativo && (
                            <Badge variant="secondary" className="text-xs">
                              Inativa
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Agencia / Conta */}
                      <TableCell>
                        <div className="text-slate-700">
                          {conta.agencia || conta.conta ? (
                            <>
                              <span className="font-medium">{conta.agencia || '-'}</span>
                              <span className="text-slate-400 mx-1">/</span>
                              <span className="font-medium">{conta.conta || '-'}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Tipo */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-medium"
                          style={{
                            borderColor: `${bancoConfig.cor}50`,
                            color: bancoConfig.corSecundaria,
                            backgroundColor: `${bancoConfig.cor}10`
                          }}
                        >
                          {tipoContaLabels[conta.tipo]}
                        </Badge>
                      </TableCell>

                      {/* Saldo Atual */}
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-bold text-lg",
                          conta.saldoAtual >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(conta.saldoAtual)}
                        </span>
                      </TableCell>

                      {/* Ultima Atualizacao */}
                      <TableCell>
                        <span className="text-slate-500 text-sm">
                          {formatRelativeDate(conta.atualizadoEm)}
                        </span>
                      </TableCell>

                      {/* Acoes */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                            <Link href={`/financeiro/movimentacoes?conta=${conta.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Ver extrato
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="p-6 bg-slate-100 rounded-full mb-6">
                <Landmark className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhuma conta bancaria cadastrada
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Adicione suas contas bancarias para comecar a controlar seu fluxo de caixa
              </p>
              {canCreate && (
                <Link href="/financeiro/contas/nova">
                  <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Conta Bancaria
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
