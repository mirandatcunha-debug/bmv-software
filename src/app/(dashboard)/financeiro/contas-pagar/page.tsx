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
  TrendingDown,
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

// Tipos para Contas a Pagar
type StatusPagavel = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'PARCIAL' | 'CANCELADO'

interface ContaPagar {
  id: string
  fornecedor: string
  fornecedorId?: string
  descricao: string
  documento?: string
  parcela?: string
  valor: number
  valorPago?: number
  dataEmissao: string
  dataVencimento: string
  dataPagamento?: string
  status: StatusPagavel
  observacoes?: string
}

interface Fornecedor {
  id: string
  nome: string
}

// Configuracao de status com cores
const statusConfig: Record<StatusPagavel, { label: string; cor: string; icon: React.ElementType; bgClass: string; textClass: string }> = {
  PAGO: {
    label: 'Pago',
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
    icon: DollarSign,
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
const getStatusDisplay = (conta: ContaPagar) => {
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

export default function ContasPagarPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()

  const [contas, setContas] = useState<ContaPagar[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [fornecedorFilter, setFornecedorFilter] = useState<string>('todos')
  const [periodoFilter, setPeriodoFilter] = useState<string>('todos')
  const [triggerSearch, setTriggerSearch] = useState(0)

  // Buscar fornecedores para o filtro
  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const response = await fetch('/api/cadastros/fornecedores?status=ativos')
        if (response.ok) {
          const data = await response.json()
          setFornecedores(data)
        }
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error)
      }
    }
    if (user && tenant) {
      fetchFornecedores()
    }
  }, [user, tenant])

  // Buscar contas a pagar
  useEffect(() => {
    const fetchContas = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (statusFilter !== 'todos') params.append('status', statusFilter)
        if (fornecedorFilter !== 'todos') params.append('fornecedorId', fornecedorFilter)
        if (periodoFilter !== 'todos') params.append('periodo', periodoFilter)

        const response = await fetch(`/api/financeiro/contas-pagar?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setContas(data)
        } else {
          // Se a API nao existe ainda, usar dados mock
          setContas(getMockData())
        }
      } catch (error) {
        console.error('Erro ao buscar contas a pagar:', error)
        // Fallback para dados mock em caso de erro
        setContas(getMockData())
      } finally {
        setLoading(false)
      }
    }

    if (user && tenant) {
      fetchContas()
    }
  }, [user, tenant, search, statusFilter, fornecedorFilter, periodoFilter, triggerSearch])

  // Dados mock para demonstracao
  const getMockData = (): ContaPagar[] => {
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    const semanaPassada = new Date(hoje)
    semanaPassada.setDate(semanaPassada.getDate() - 7)
    const proximaSemana = new Date(hoje)
    proximaSemana.setDate(proximaSemana.getDate() + 7)

    return [
      {
        id: '1',
        fornecedor: 'Distribuidora ABC Ltda',
        fornecedorId: '1',
        descricao: 'Compra de materiais - Janeiro',
        documento: 'NF-2024001',
        parcela: '1/3',
        valor: 12000,
        dataEmissao: semanaPassada.toISOString(),
        dataVencimento: hoje.toISOString(),
        status: 'PENDENTE',
      },
      {
        id: '2',
        fornecedor: 'Papelaria Central',
        fornecedorId: '2',
        descricao: 'Material de escritorio',
        documento: 'NF-2024002',
        parcela: '1/1',
        valor: 850,
        valorPago: 850,
        dataEmissao: semanaPassada.toISOString(),
        dataVencimento: ontem.toISOString(),
        dataPagamento: ontem.toISOString(),
        status: 'PAGO',
      },
      {
        id: '3',
        fornecedor: 'Energia Eletrica S/A',
        fornecedorId: '3',
        descricao: 'Conta de luz - Dezembro',
        documento: 'FAT-122024',
        parcela: '1/1',
        valor: 2500,
        dataEmissao: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dataVencimento: semanaPassada.toISOString(),
        status: 'VENCIDO',
      },
      {
        id: '4',
        fornecedor: 'Aluguel Comercial',
        fornecedorId: '4',
        descricao: 'Aluguel do escritorio - Fevereiro',
        documento: 'REC-022024',
        parcela: '2/12',
        valor: 8000,
        dataEmissao: semanaPassada.toISOString(),
        dataVencimento: proximaSemana.toISOString(),
        status: 'PENDENTE',
      },
      {
        id: '5',
        fornecedor: 'Telefonia Brasil',
        fornecedorId: '5',
        descricao: 'Internet e telefone',
        documento: 'FAT-012024',
        parcela: '1/1',
        valor: 450,
        valorPago: 200,
        dataEmissao: semanaPassada.toISOString(),
        dataVencimento: amanha.toISOString(),
        status: 'PARCIAL',
      },
    ]
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setTriggerSearch(prev => prev + 1)
  }

  const handleRefresh = () => {
    setTriggerSearch(prev => prev + 1)
  }

  // Calculos para os cards de resumo
  const totalPagar = contas
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
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
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

      {/* Header com gradiente vermelho */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingDown className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Contas a Pagar</h1>
                <p className="text-red-100 text-sm md:text-base">
                  Gerencie suas despesas e controle pagamentos
                </p>
              </div>
            </div>
            <Link href="/financeiro/contas-pagar/nova">
              <Button
                className="bg-white text-red-600 hover:bg-white/90 shadow-lg shadow-red-900/30 transition-all hover:scale-105 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta a Pagar
              </Button>
            </Link>
          </div>

          {/* Cards de resumo no header */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-red-200" />
                <span className="text-xs text-red-200">Total a Pagar</span>
              </div>
              <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalPagar)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-300" />
                <span className="text-xs text-red-200">Vencido</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-red-200">{formatCurrency(totalVencido)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-300" />
                <span className="text-xs text-red-200">Vence Hoje</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-yellow-200">{formatCurrency(totalVenceHoje)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-red-200" />
                <span className="text-xs text-red-200">A Vencer</span>
              </div>
              <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalAVencer)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fornecedor ou descricao..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Fornecedores</SelectItem>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
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
                  <SelectItem value="PAGO">Pago</SelectItem>
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

      {/* Tabela de Contas a Pagar */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-0">
          {contas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-full blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full">
                    <FileText className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Nenhuma conta a pagar</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {search || statusFilter !== 'todos' || fornecedorFilter !== 'todos'
                    ? 'Nenhum resultado encontrado. Tente ajustar os filtros.'
                    : 'Adicione sua primeira conta a pagar para comecar a controlar suas despesas.'}
                </p>
                <Link href="/financeiro/contas-pagar/nova">
                  <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta a Pagar
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
                    <TableHead className="font-semibold">Fornecedor</TableHead>
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
                          <div className="font-medium">{conta.fornecedor}</div>
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
                            <span className="font-semibold text-red-600">
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
                                  Registrar Pagamento
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
