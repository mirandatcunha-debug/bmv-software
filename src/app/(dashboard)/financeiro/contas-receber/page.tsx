'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  ArrowDownCircle,
  ArrowDownToLine,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  DollarSign,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/types/financeiro'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'

// Tipos para Contas a Receber
type StatusRecebivel = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'PARCIAL' | 'CANCELADO'

interface ContaReceber {
  id: string
  cliente: string
  clienteId?: string
  descricao: string
  documento?: string
  parcela?: string
  valor: number
  valorPago?: number
  dataEmissao: string
  dataVencimento: string
  dataPagamento?: string
  status: StatusRecebivel
  observacoes?: string
}

interface Cliente {
  id: string
  nome: string
}

// Configuracao de status com cores
const statusConfig: Record<StatusRecebivel, { label: string; cor: string; icon: React.ElementType; bgClass: string; textClass: string }> = {
  PAGO: {
    label: 'Recebido',
    cor: 'green',
    icon: CheckCircle2,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400'
  },
  VENCIDO: {
    label: 'Vencido',
    cor: 'red',
    icon: XCircle,
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400'
  },
  PENDENTE: {
    label: 'Pendente',
    cor: 'gray',
    icon: Clock,
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300'
  },
  PARCIAL: {
    label: 'Parcial',
    cor: 'blue',
    icon: ArrowDownToLine,
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400'
  },
  CANCELADO: {
    label: 'Cancelado',
    cor: 'gray',
    icon: XCircle,
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-500 dark:text-slate-400'
  },
}

// Funcao para verificar se vence hoje
const isVenceHoje = (dataVencimento: string): boolean => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vencimento = new Date(dataVencimento)
  vencimento.setHours(0, 0, 0, 0)
  return vencimento.getTime() === hoje.getTime()
}

// Funcao para obter config de status considerando "vence hoje"
const getStatusDisplay = (conta: ContaReceber) => {
  if (conta.status === 'PENDENTE' && isVenceHoje(conta.dataVencimento)) {
    return {
      label: 'Vence Hoje',
      cor: 'yellow',
      icon: AlertTriangle,
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-700 dark:text-yellow-400'
    }
  }
  return statusConfig[conta.status]
}

export default function ContasReceberPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()

  const [contas, setContas] = useState<ContaReceber[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [clienteFilter, setClienteFilter] = useState<string>('todos')
  const [periodoFilter, setPeriodoFilter] = useState<string>('todos')
  const [triggerSearch, setTriggerSearch] = useState(0)

  // Buscar clientes para o filtro
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch('/api/cadastros/clientes?status=ativos')
        if (response.ok) {
          const data = await response.json()
          setClientes(data)
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
      }
    }
    if (user && tenant) {
      fetchClientes()
    }
  }, [user, tenant])

  // Buscar contas a receber
  useEffect(() => {
    const fetchContas = async () => {
      setLoading(true)
      setError(null)

      // Controller para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos

      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (statusFilter !== 'todos') params.append('status', statusFilter)
        if (clienteFilter !== 'todos') params.append('clienteId', clienteFilter)
        if (periodoFilter !== 'todos') params.append('periodo', periodoFilter)

        const response = await fetch(`/api/financeiro/contas-receber?${params.toString()}`, {
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.status === 401) {
          setError('Voce nao tem permissao para acessar este recurso.')
          setContas([])
          return
        }

        if (response.status === 403) {
          setError('Acesso negado. Seu perfil nao possui permissao para esta funcionalidade.')
          setContas([])
          return
        }

        if (response.status >= 500) {
          setError('Nao foi possivel carregar os dados. Tente novamente.')
          setContas([])
          return
        }

        if (!response.ok) {
          setError('Nao foi possivel carregar os dados. Tente novamente.')
          setContas([])
          return
        }

        const data = await response.json()
        setContas(data)
        setError(null)
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Erro ao buscar contas a receber:', err)

        if (err instanceof Error && err.name === 'AbortError') {
          setError('A conexao demorou muito. Verifique sua internet e tente novamente.')
        } else {
          setError('Nao foi possivel carregar os dados. Tente novamente.')
        }
        setContas([])
      } finally {
        setLoading(false)
      }
    }

    if (user && tenant) {
      fetchContas()
    } else if (!authLoading && !tenantLoading) {
      // Se terminou de carregar mas nao tem user/tenant, para o loading
      setLoading(false)
      if (!user) {
        setError('Faca login para continuar.')
      } else if (!tenant) {
        setError('Nenhuma empresa selecionada.')
      }
    }
  }, [user, tenant, authLoading, tenantLoading, search, statusFilter, clienteFilter, periodoFilter, triggerSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setTriggerSearch(prev => prev + 1)
  }

  const handleRefresh = () => {
    setTriggerSearch(prev => prev + 1)
  }

  // Calculos para os cards de resumo
  const totalReceber = contas
    .filter(c => c.status !== 'PAGO' && c.status !== 'CANCELADO')
    .reduce((acc, c) => acc + c.valor - (c.valorPago || 0), 0)

  const totalVencido = contas
    .filter(c => c.status === 'VENCIDO')
    .reduce((acc, c) => acc + c.valor - (c.valorPago || 0), 0)

  const totalVenceHoje = contas
    .filter(c => c.status === 'PENDENTE' && isVenceHoje(c.dataVencimento))
    .reduce((acc, c) => acc + c.valor, 0)

  const totalAVencer = contas
    .filter(c => {
      if (c.status !== 'PENDENTE') return false
      const vencimento = new Date(c.dataVencimento)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      vencimento.setHours(0, 0, 0, 0)
      return vencimento > hoje
    })
    .reduce((acc, c) => acc + c.valor, 0)

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Erro ao carregar</h3>
              <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <TrendingUp className="h-8 w-8 text-gray-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100">Contas a Receber</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base">
              Gerencie seus recebiveis e acompanhe pagamentos
            </p>
          </div>
        </div>
        <Link href="/financeiro/contas-receber/nova">
          <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta a Receber
          </Button>
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Card className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              <span className="text-xs text-gray-500 dark:text-slate-400">Total a Receber</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-100">{formatCurrency(totalReceber)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-gray-500 dark:text-slate-400">Vencido</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-600">{formatCurrency(totalVencido)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-500 dark:text-slate-400">Vence Hoje</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-yellow-600">{formatCurrency(totalVenceHoje)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              <span className="text-xs text-gray-500 dark:text-slate-400">A Vencer</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-100">{formatCurrency(totalAVencer)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou descricao..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={clienteFilter} onValueChange={setClienteFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Clientes</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="PAGO">Recebido</SelectItem>
                  <SelectItem value="VENCIDO">Vencido</SelectItem>
                  <SelectItem value="PARCIAL">Parcial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mes</SelectItem>
                  <SelectItem value="vencidos">Vencidos</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button type="button" variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Contas a Receber */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-0">
          {contas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <ArrowDownCircle className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {search || statusFilter !== 'todos' || clienteFilter !== 'todos'
                    ? 'Nenhum resultado encontrado'
                    : 'Nenhuma conta a receber cadastrada'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {search || statusFilter !== 'todos' || clienteFilter !== 'todos'
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Registre suas vendas e recebimentos para acompanhar seu faturamento'}
                </p>
                <Link href="/financeiro/contas-receber/novo">
                  <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta a Receber
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-semibold">Vencimento</TableHead>
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Descricao</TableHead>
                    <TableHead className="font-semibold">Documento</TableHead>
                    <TableHead className="font-semibold text-center">Parcela</TableHead>
                    <TableHead className="font-semibold text-right">Valor</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contas.map((conta, index) => {
                    const statusDisplay = getStatusDisplay(conta)
                    const StatusIcon = statusDisplay.icon

                    return (
                      <TableRow
                        key={conta.id}
                        className={cn(
                          "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 animate-fade-in-up",
                          conta.status === 'CANCELADO' && "opacity-50"
                        )}
                        style={{ animationDelay: `${0.05 * index}s` }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={cn(
                              "font-medium",
                              conta.status === 'VENCIDO' && "text-red-600",
                              isVenceHoje(conta.dataVencimento) && conta.status === 'PENDENTE' && "text-yellow-600"
                            )}>
                              {formatDate(conta.dataVencimento)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{conta.cliente}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={conta.descricao}>
                            {conta.descricao}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{conta.documento || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-muted-foreground">
                            {conta.parcela || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(conta.valor)}
                            </span>
                            {conta.valorPago && conta.valorPago > 0 && conta.status !== 'PAGO' && (
                              <span className="text-xs text-muted-foreground">
                                Pago: {formatCurrency(conta.valorPago)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(
                            "gap-1",
                            statusDisplay.bgClass,
                            statusDisplay.textClass
                          )}>
                            <StatusIcon className="h-3 w-3" />
                            {statusDisplay.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {conta.status !== 'PAGO' && conta.status !== 'CANCELADO' && (
                                <DropdownMenuItem className="cursor-pointer text-green-600">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Registrar Recebimento
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
