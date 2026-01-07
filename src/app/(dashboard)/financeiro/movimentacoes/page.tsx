'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  BarChart3,
  Search,
  Filter,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  FileX2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  Movimentacao,
  TipoTransacao,
  formatCurrency,
  formatDate,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'
import { useModulePermissions } from '@/hooks/use-permissions'
import {
  movimentacoesFinanceiras,
  contasBancarias,
} from '@/data/demo-data'

// Função para mapear categoria do demo-data
const mapCategoria = (categoria: string): string => {
  const categoriaMap: Record<string, string> = {
    vendas_produtos: 'Vendas',
    vendas_servicos: 'Servicos',
    salarios: 'Pessoal',
    fornecedores: 'Fornecedores',
    marketing: 'Marketing',
    aluguel: 'Aluguel',
    energia: 'Utilidades',
    internet_telefone: 'Utilidades',
    impostos: 'Impostos',
    manutencao: 'Manutencao',
    transporte: 'Transporte',
    outros: 'Outros',
  }
  return categoriaMap[categoria] || 'Outros'
}

// Mapeando movimentações do demo-data para o formato esperado
const movimentacoesMock: Movimentacao[] = movimentacoesFinanceiras.map((mov) => {
  const conta = contasBancarias.find(c => c.id === mov.contaBancariaId)
  return {
    id: mov.id,
    tenantId: '1',
    contaId: mov.contaBancariaId,
    conta: {
      id: mov.contaBancariaId,
      tenantId: '1',
      nome: conta?.banco || 'Banco',
      tipo: 'CORRENTE' as const,
      saldoInicial: 0,
      saldoAtual: conta?.saldo || 0,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    tipo: mov.tipo === 'receita' ? 'RECEITA' as const : 'DESPESA' as const,
    categoria: mapCategoria(mov.categoria),
    descricao: mov.descricao,
    valor: mov.valor,
    dataMovimento: new Date(mov.data),
    recorrente: mov.categoria === 'salarios' || mov.categoria === 'aluguel',
    frequencia: mov.categoria === 'salarios' || mov.categoria === 'aluguel' ? 'MENSAL' as const : undefined,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  }
})

const tipoOptions: { value: TipoTransacao | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos os Tipos' },
  { value: 'RECEITA', label: 'Receitas' },
  { value: 'DESPESA', label: 'Despesas' },
  { value: 'TRANSFERENCIA', label: 'Transferencias' },
]

const periodoOptions = [
  { value: 'TODOS', label: 'Todo o periodo' },
  { value: '7', label: 'Ultimos 7 dias' },
  { value: '15', label: 'Ultimos 15 dias' },
  { value: '30', label: 'Ultimos 30 dias' },
  { value: '90', label: 'Ultimos 90 dias' },
]

// Usando contas do demo-data
const contasMock = contasBancarias.map(conta => ({
  id: conta.id,
  nome: conta.banco,
}))

type SortField = 'data' | 'descricao' | 'categoria' | 'valor'
type SortDirection = 'asc' | 'desc'

export default function MovimentacoesPage() {
  const [movimentacoes] = useState<Movimentacao[]>(movimentacoesMock)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoTransacao | 'TODOS'>('TODOS')
  const [contaFiltro, setContaFiltro] = useState<string>('TODOS')
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('TODOS')
  const [sortField, setSortField] = useState<SortField>('data')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Verificar permissões do módulo financeiro.movimentacoes
  const { canCreate, canEdit, canDelete } = useModulePermissions('financeiro.movimentacoes')

  // Filtrar movimentações
  const movimentacoesFiltradas = useMemo(() => {
    // Função para filtrar por periodo
    const filtrarPorPeriodo = (mov: Movimentacao) => {
      if (periodoFiltro === 'TODOS') return true
      const dias = parseInt(periodoFiltro)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)
      return new Date(mov.dataMovimento) >= dataLimite
    }

    let filtered = movimentacoes.filter((mov) => {
      const matchSearch = mov.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = tipoFiltro === 'TODOS' || mov.tipo === tipoFiltro
      const matchConta = contaFiltro === 'TODOS' || mov.contaId === contaFiltro
      const matchPeriodo = filtrarPorPeriodo(mov)
      return matchSearch && matchTipo && matchConta && matchPeriodo
    })

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'data':
          comparison = new Date(a.dataMovimento).getTime() - new Date(b.dataMovimento).getTime()
          break
        case 'descricao':
          comparison = a.descricao.localeCompare(b.descricao)
          break
        case 'categoria':
          comparison = a.categoria.localeCompare(b.categoria)
          break
        case 'valor':
          comparison = a.valor - b.valor
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [movimentacoes, searchTerm, tipoFiltro, contaFiltro, periodoFiltro, sortField, sortDirection])

  // Calcular totais
  const totalReceitas = movimentacoesFiltradas
    .filter((m) => m.tipo === 'RECEITA')
    .reduce((acc, m) => acc + m.valor, 0)
  const totalDespesas = movimentacoesFiltradas
    .filter((m) => m.tipo === 'DESPESA')
    .reduce((acc, m) => acc + m.valor, 0)
  const saldo = totalReceitas - totalDespesas

  // Função para alternar ordenação
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Ícone de ordenação
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground/50" />
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4 ml-1 text-bmv-primary" />
      : <ChevronDown className="h-4 w-4 ml-1 text-bmv-primary" />
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

      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Movimentacoes</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Gerencie todas as entradas e saidas
                </p>
              </div>
            </div>
            {canCreate && (
              <div className="flex gap-2">
                <Link href="/financeiro/movimentacoes/nova?tipo=RECEITA">
                  <Button
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Receita
                  </Button>
                </Link>
                <Link href="/financeiro/movimentacoes/nova?tipo=DESPESA">
                  <Button
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                    variant="outline"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Despesa
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-4 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Card className="relative overflow-hidden border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Receitas
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalReceitas)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-red-500/20 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Total Despesas
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalDespesas)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden border-2",
          saldo >= 0
            ? "border-blue-500/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
            : "border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
        )}>
          <div className={cn(
            "absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2",
            saldo >= 0 ? "bg-blue-500/10" : "bg-orange-500/10"
          )}></div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Saldo do Periodo
                </p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  saldo >= 0 ? "text-blue-600" : "text-orange-600"
                )}>
                  {saldo >= 0 ? '+' : ''}{formatCurrency(saldo)}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl",
                saldo >= 0 ? "bg-blue-500/10" : "bg-orange-500/10"
              )}>
                <Wallet className={cn(
                  "h-6 w-6",
                  saldo >= 0 ? "text-blue-600" : "text-orange-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar descricao..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                {periodoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={tipoFiltro}
              onValueChange={(value) => setTipoFiltro(value as TipoTransacao | 'TODOS')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {tipoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={contaFiltro} onValueChange={setContaFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas as Contas</SelectItem>
                {contasMock.map((conta) => (
                  <SelectItem key={conta.id} value={conta.id}>
                    {conta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="ml-auto">
              {movimentacoesFiltradas.length} registro(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort('data')}
              >
                <div className="flex items-center">
                  Data
                  <SortIcon field="data" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort('descricao')}
              >
                <div className="flex items-center">
                  Descricao
                  <SortIcon field="descricao" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort('categoria')}
              >
                <div className="flex items-center">
                  Categoria
                  <SortIcon field="categoria" />
                </div>
              </TableHead>
              <TableHead>Conta</TableHead>
              <TableHead
                className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => toggleSort('valor')}
              >
                <div className="flex items-center justify-end">
                  Valor
                  <SortIcon field="valor" />
                </div>
              </TableHead>
              {(canEdit || canDelete) && (
                <TableHead className="w-[50px]"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoesFiltradas.length > 0 ? (
              movimentacoesFiltradas.map((mov, index) => (
                <TableRow
                  key={mov.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        mov.tipo === 'RECEITA'
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      )}>
                        <Calendar className={cn(
                          "h-3.5 w-3.5",
                          mov.tipo === 'RECEITA' ? "text-green-600" : "text-red-600"
                        )} />
                      </div>
                      {formatDate(mov.dataMovimento)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium group-hover:text-bmv-primary transition-colors">
                        {mov.descricao}
                      </p>
                      {mov.recorrente && (
                        <Badge variant="outline" className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                          Recorrente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-medium",
                        mov.tipo === 'RECEITA'
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                          : "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
                      )}
                    >
                      {mov.tipo === 'RECEITA' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {mov.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {mov.conta?.nome || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-bold text-lg',
                        mov.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {mov.tipo === 'DESPESA' ? '- ' : '+ '}
                      {formatCurrency(mov.valor)}
                    </span>
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
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
                            <Link href={`/financeiro/movimentacoes/${mov.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {canDelete && (
                            <Link href={`/financeiro/movimentacoes/${mov.id}/excluir`}>
                              <DropdownMenuItem className="text-red-600 cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </Link>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canEdit || canDelete ? 6 : 5} className="text-center py-16">
                  <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      <div className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full">
                        <FileX2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mt-6 mb-2">Nenhuma movimentacao encontrada</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm text-center">
                      Nao ha movimentacoes para os filtros selecionados. Tente ajustar os filtros ou adicione uma nova movimentacao.
                    </p>
                    {canCreate && (
                      <div className="flex gap-3">
                        <Link href="/financeiro/movimentacoes/nova?tipo=RECEITA">
                          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Nova Receita
                          </Button>
                        </Link>
                        <Link href="/financeiro/movimentacoes/nova?tipo=DESPESA">
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Nova Despesa
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
