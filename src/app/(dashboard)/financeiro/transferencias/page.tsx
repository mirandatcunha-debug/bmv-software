'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  ArrowLeftRight,
  Calendar,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  Loader2,
  Wallet,
  ArrowRight,
  Hash,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/types/financeiro'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'

interface Transfer {
  id: string
  contaOrigem: {
    id: string
    nome: string
  }
  contaDestino: {
    id: string
    nome: string
  }
  valor: number
  data: string
  descricao?: string
  criadoEm: string
}

interface ContaBancaria {
  id: string
  nome: string
}

export default function TransferenciasPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()

  const [transferencias, setTransferencias] = useState<Transfer[]>([])
  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contaOrigemFilter, setContaOrigemFilter] = useState<string>('todas')
  const [contaDestinoFilter, setContaDestinoFilter] = useState<string>('todas')
  const [periodoFilter, setPeriodoFilter] = useState<string>('mes')
  const [triggerSearch, setTriggerSearch] = useState(0)

  // Buscar contas bancárias para os filtros
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const response = await fetch('/api/financeiro/contas')
        if (response.ok) {
          const data = await response.json()
          setContas(data)
        }
      } catch (error) {
        console.error('Erro ao buscar contas:', error)
      }
    }
    if (user && tenant) {
      fetchContas()
    }
  }, [user, tenant])

  // Buscar transferências
  useEffect(() => {
    const fetchTransferencias = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (contaOrigemFilter !== 'todas') params.append('contaOrigemId', contaOrigemFilter)
        if (contaDestinoFilter !== 'todas') params.append('contaDestinoId', contaDestinoFilter)
        if (periodoFilter !== 'todos') params.append('periodo', periodoFilter)

        const response = await fetch(`/api/financeiro/transferencias?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setTransferencias(data)
        } else {
          setTransferencias(getMockData())
        }
      } catch (err) {
        console.error('Erro ao buscar transferências:', err)
        setTransferencias(getMockData())
      } finally {
        setLoading(false)
      }
    }

    if (user && tenant) {
      fetchTransferencias()
    } else if (!authLoading && !tenantLoading) {
      // Se terminou de carregar mas nao tem user/tenant, para o loading
      setLoading(false)
      if (!user) {
        setError('Usuario nao autenticado. Faca login novamente.')
      } else if (!tenant) {
        setError('Nenhuma empresa selecionada.')
      }
    }
  }, [user, tenant, authLoading, tenantLoading, contaOrigemFilter, contaDestinoFilter, periodoFilter, triggerSearch])

  // Dados mock para demonstração
  const getMockData = (): Transfer[] => {
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const semanaPassada = new Date(hoje)
    semanaPassada.setDate(semanaPassada.getDate() - 7)

    return [
      {
        id: '1',
        contaOrigem: { id: '1', nome: 'Conta Corrente Bradesco' },
        contaDestino: { id: '2', nome: 'Caixa' },
        valor: 5000,
        data: hoje.toISOString(),
        descricao: 'Reforço de caixa',
        criadoEm: hoje.toISOString(),
      },
      {
        id: '2',
        contaOrigem: { id: '2', nome: 'Caixa' },
        contaDestino: { id: '3', nome: 'Conta Poupança Itaú' },
        valor: 10000,
        data: ontem.toISOString(),
        descricao: 'Aplicação em poupança',
        criadoEm: ontem.toISOString(),
      },
      {
        id: '3',
        contaOrigem: { id: '1', nome: 'Conta Corrente Bradesco' },
        contaDestino: { id: '4', nome: 'Conta Corrente Itaú' },
        valor: 25000,
        data: semanaPassada.toISOString(),
        descricao: 'Transferência entre bancos',
        criadoEm: semanaPassada.toISOString(),
      },
    ]
  }

  const handleRefresh = () => {
    setTriggerSearch(prev => prev + 1)
  }

  // Cálculos para os cards de resumo
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const totalTransferidoMes = transferencias
    .filter(t => new Date(t.data) >= inicioMes)
    .reduce((acc, t) => acc + t.valor, 0)

  const quantidadeTransferencias = transferencias
    .filter(t => new Date(t.data) >= inicioMes)
    .length

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

      {/* Header com gradiente azul */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ArrowLeftRight className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Transferências entre Contas</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Gerencie as movimentações entre suas contas bancárias
                </p>
              </div>
            </div>
            <Link href="/financeiro/transferencias/nova">
              <Button
                className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-blue-900/30 transition-all hover:scale-105 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transferência
              </Button>
            </Link>
          </div>

          {/* Cards de resumo no header */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Total Transferido (Mês)</span>
              </div>
              <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalTransferidoMes)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Qtd. Transferências</span>
              </div>
              <p className="text-lg sm:text-xl font-bold">{quantidadeTransferencias}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <Select value={contaOrigemFilter} onValueChange={setContaOrigemFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Conta Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Contas (Origem)</SelectItem>
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={contaDestinoFilter} onValueChange={setContaDestinoFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Conta Destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Contas (Destino)</SelectItem>
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="ano">Este Ano</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transferências */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-0">
          {transferencias.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
                    <ArrowLeftRight className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Nenhuma transferência</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {contaOrigemFilter !== 'todas' || contaDestinoFilter !== 'todas'
                    ? 'Nenhum resultado encontrado. Tente ajustar os filtros.'
                    : 'Realize sua primeira transferência entre contas.'}
                </p>
                <Link href="/financeiro/transferencias/nova">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transferência
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Conta Origem</TableHead>
                    <TableHead className="font-semibold text-center"></TableHead>
                    <TableHead className="font-semibold">Conta Destino</TableHead>
                    <TableHead className="font-semibold">Descrição</TableHead>
                    <TableHead className="font-semibold text-right">Valor</TableHead>
                    <TableHead className="font-semibold text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferencias.map((transfer, index) => (
                    <TableRow
                      key={transfer.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 animate-fade-in-up"
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(transfer.data)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">{transfer.contaOrigem.nome}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">{transfer.contaDestino.nome}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-muted-foreground" title={transfer.descricao}>
                          {transfer.descricao || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(transfer.valor)}
                        </span>
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
                            <DropdownMenuItem className="cursor-pointer text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
