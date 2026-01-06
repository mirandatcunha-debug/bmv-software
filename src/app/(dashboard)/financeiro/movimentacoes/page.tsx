'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
  BarChart3,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react'
import {
  Movimentacao,
  TipoTransacao,
  formatCurrency,
  formatDate,
  tipoTransacaoLabels,
  tipoTransacaoCores,
  categoriasReceita,
  categoriasDespesa,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'

// Dados mockados
const movimentacoesMock: Movimentacao[] = [
  {
    id: '1',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'RECEITA',
    categoria: 'Vendas',
    descricao: 'Pagamento Cliente ABC',
    valor: 15000,
    dataMovimento: new Date('2026-01-05'),
    recorrente: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '2',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'DESPESA',
    categoria: 'Pessoal',
    descricao: 'Folha de Pagamento',
    valor: 18500,
    dataMovimento: new Date('2026-01-05'),
    recorrente: true,
    frequencia: 'MENSAL',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '3',
    tenantId: '1',
    contaId: '2',
    conta: { id: '2', tenantId: '1', nome: 'Itau', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 75450, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'RECEITA',
    categoria: 'Servicos',
    descricao: 'Consultoria Tech Solutions',
    valor: 8500,
    dataMovimento: new Date('2026-01-04'),
    recorrente: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '4',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'DESPESA',
    categoria: 'Aluguel',
    descricao: 'Aluguel Escritorio',
    valor: 4500,
    dataMovimento: new Date('2026-01-03'),
    recorrente: true,
    frequencia: 'MENSAL',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '5',
    tenantId: '1',
    contaId: '2',
    conta: { id: '2', tenantId: '1', nome: 'Itau', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 75450, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'RECEITA',
    categoria: 'Vendas',
    descricao: 'Licenca Software',
    valor: 3200,
    dataMovimento: new Date('2026-01-02'),
    recorrente: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '6',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'DESPESA',
    categoria: 'Marketing',
    descricao: 'Google Ads',
    valor: 2800,
    dataMovimento: new Date('2026-01-02'),
    recorrente: true,
    frequencia: 'MENSAL',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
]

const tipoOptions: { value: TipoTransacao | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos os Tipos' },
  { value: 'RECEITA', label: 'Receitas' },
  { value: 'DESPESA', label: 'Despesas' },
  { value: 'TRANSFERENCIA', label: 'Transferencias' },
]

const contasMock = [
  { id: '1', nome: 'Banco do Brasil' },
  { id: '2', nome: 'Itau' },
]

export default function MovimentacoesPage() {
  const [movimentacoes] = useState<Movimentacao[]>(movimentacoesMock)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoTransacao | 'TODOS'>('TODOS')
  const [contaFiltro, setContaFiltro] = useState<string>('TODOS')

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter((mov) => {
    const matchSearch = mov.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = tipoFiltro === 'TODOS' || mov.tipo === tipoFiltro
    const matchConta = contaFiltro === 'TODOS' || mov.contaId === contaFiltro
    return matchSearch && matchTipo && matchConta
  })

  // Calcular totais
  const totalReceitas = movimentacoesFiltradas
    .filter((m) => m.tipo === 'RECEITA')
    .reduce((acc, m) => acc + m.valor, 0)
  const totalDespesas = movimentacoesFiltradas
    .filter((m) => m.tipo === 'DESPESA')
    .reduce((acc, m) => acc + m.valor, 0)

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Financeiro
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-bmv-primary" />
            Movimentacoes
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as entradas e saidas
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/financeiro/movimentacoes/nova?tipo=RECEITA">
            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita
            </Button>
          </Link>
          <Link href="/financeiro/movimentacoes/nova?tipo=DESPESA">
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <TrendingDown className="h-4 w-4 mr-2" />
              Despesa
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar descricao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

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
      </div>

      {/* Totais */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Receitas: </span>
          <span className="font-semibold text-green-600">{formatCurrency(totalReceitas)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Despesas: </span>
          <span className="font-semibold text-red-600">{formatCurrency(totalDespesas)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Saldo: </span>
          <span className={cn(
            'font-semibold',
            totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(totalReceitas - totalDespesas)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoesFiltradas.length > 0 ? (
              movimentacoesFiltradas.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(mov.dataMovimento)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{mov.descricao}</p>
                      {mov.recorrente && (
                        <span className="text-xs text-muted-foreground">
                          Recorrente
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded',
                        tipoTransacaoCores[mov.tipo]
                      )}
                    >
                      {mov.categoria}
                    </span>
                  </TableCell>
                  <TableCell>{mov.conta?.nome || '-'}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-semibold',
                        mov.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {mov.tipo === 'DESPESA' ? '- ' : '+ '}
                      {formatCurrency(mov.valor)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma movimentacao encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Nao ha movimentacoes para os filtros selecionados.
                  </p>
                  <Link href="/financeiro/movimentacoes/nova">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Movimentacao
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
