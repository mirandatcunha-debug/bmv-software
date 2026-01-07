'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowLeft,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react'

interface Lancamento {
  id: string
  numero: string
  data: string
  tipo: 'debito' | 'credito' | 'partida_dobrada'
  contaDebito: string
  contaCredito: string
  valor: number
  historico: string
  documento: string
  centroCusto?: string
  status: 'conciliado' | 'pendente' | 'rejeitado'
  usuario: string
}

const lancamentos: Lancamento[] = [
  {
    id: '1',
    numero: 'LC-2025-0001',
    data: '05/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '1.1.1.02 - Banco Conta Movimento',
    contaCredito: '4.1.1 - Receita de Vendas',
    valor: 15800,
    historico: 'Recebimento de vendas - NF 1234',
    documento: 'NF 1234',
    centroCusto: 'CC003 - Comercial',
    status: 'conciliado',
    usuario: 'Maria Santos'
  },
  {
    id: '2',
    numero: 'LC-2025-0002',
    data: '05/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '5.2.1 - Despesas com Pessoal',
    contaCredito: '2.1.2.01 - Salários a Pagar',
    valor: 45000,
    historico: 'Provisão folha de pagamento - Janeiro/2025',
    documento: 'FP 01/2025',
    centroCusto: 'CC002 - Administrativo',
    status: 'conciliado',
    usuario: 'Carlos Silva'
  },
  {
    id: '3',
    numero: 'LC-2025-0003',
    data: '04/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '2.1.1.01 - Fornecedores Nacionais',
    contaCredito: '1.1.1.02 - Banco Conta Movimento',
    valor: 8500,
    historico: 'Pagamento fornecedor XYZ - NF 5678',
    documento: 'NF 5678',
    centroCusto: 'CC011 - Compras',
    status: 'conciliado',
    usuario: 'João Oliveira'
  },
  {
    id: '4',
    numero: 'LC-2025-0004',
    data: '04/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '1.1.3.01 - Mercadorias para Revenda',
    contaCredito: '2.1.1.01 - Fornecedores Nacionais',
    valor: 22000,
    historico: 'Compra de mercadorias - NF 9012',
    documento: 'NF 9012',
    centroCusto: 'CC011 - Compras',
    status: 'pendente',
    usuario: 'Ana Costa'
  },
  {
    id: '5',
    numero: 'LC-2025-0005',
    data: '03/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '5.2.2 - Despesas Administrativas',
    contaCredito: '1.1.1.01 - Caixa Geral',
    valor: 1200,
    historico: 'Despesas com material de escritório',
    documento: 'NF 3456',
    centroCusto: 'CC002 - Administrativo',
    status: 'conciliado',
    usuario: 'Maria Santos'
  },
  {
    id: '6',
    numero: 'LC-2025-0006',
    data: '03/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '1.1.2.01 - Clientes',
    contaCredito: '4.1.2 - Receita de Serviços',
    valor: 8900,
    historico: 'Faturamento serviços - NF 7890',
    documento: 'NF 7890',
    centroCusto: 'CC003 - Comercial',
    status: 'pendente',
    usuario: 'Pedro Lima'
  },
  {
    id: '7',
    numero: 'LC-2025-0007',
    data: '02/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '5.2.3 - Despesas Financeiras',
    contaCredito: '1.1.1.02 - Banco Conta Movimento',
    valor: 3500,
    historico: 'Juros e tarifas bancárias - Dezembro/2024',
    documento: 'EXT 12/2024',
    centroCusto: 'CC010 - Financeiro',
    status: 'conciliado',
    usuario: 'Marcos Rodrigues'
  },
  {
    id: '8',
    numero: 'LC-2025-0008',
    data: '02/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '2.1.3.01 - ICMS a Recolher',
    contaCredito: '1.1.1.02 - Banco Conta Movimento',
    valor: 5600,
    historico: 'Pagamento ICMS - Dezembro/2024',
    documento: 'DARF 12/2024',
    centroCusto: 'CC010 - Financeiro',
    status: 'rejeitado',
    usuario: 'Fernanda Souza'
  },
  {
    id: '9',
    numero: 'LC-2025-0009',
    data: '02/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '1.1.1.03 - Aplicações Financeiras',
    contaCredito: '1.1.1.02 - Banco Conta Movimento',
    valor: 50000,
    historico: 'Aplicação em CDB',
    documento: 'AP-001/2025',
    status: 'conciliado',
    usuario: 'Marcos Rodrigues'
  },
  {
    id: '10',
    numero: 'LC-2025-0010',
    data: '01/01/2025',
    tipo: 'partida_dobrada',
    contaDebito: '5.1.1 - CMV',
    contaCredito: '1.1.3.01 - Mercadorias para Revenda',
    valor: 12000,
    historico: 'Baixa de estoque por vendas',
    documento: 'MOV-001/2025',
    centroCusto: 'CC001 - Produção',
    status: 'pendente',
    usuario: 'Roberto Alves'
  }
]

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor)
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'conciliado':
      return {
        label: 'Conciliado',
        icon: CheckCircle2,
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        iconColor: 'text-emerald-600'
      }
    case 'pendente':
      return {
        label: 'Pendente',
        icon: Clock,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        iconColor: 'text-amber-600'
      }
    case 'rejeitado':
      return {
        label: 'Rejeitado',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        iconColor: 'text-red-600'
      }
    default:
      return {
        label: status,
        icon: Clock,
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
        iconColor: 'text-slate-600'
      }
  }
}

export default function LancamentosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalLancamentos = lancamentos.length
  const totalDebitos = lancamentos.reduce((acc, l) => acc + l.valor, 0)
  const totalCreditos = totalDebitos // Em partida dobrada, débito = crédito

  const conciliados = lancamentos.filter(l => l.status === 'conciliado').length
  const pendentes = lancamentos.filter(l => l.status === 'pendente').length
  const rejeitados = lancamentos.filter(l => l.status === 'rejeitado').length

  const filteredLancamentos = lancamentos.filter(l => {
    const matchesSearch =
      l.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.historico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contaDebito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contaCredito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.documento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'todos' || l.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredLancamentos.length / itemsPerPage)
  const paginatedLancamentos = filteredLancamentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-800 via-violet-700 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/contabil" className="inline-flex items-center gap-2 text-violet-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar para Contábil</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <FileText className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              Escrituração
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Lançamentos Contábeis</h1>
          <p className="text-violet-100 max-w-2xl">
            Gerencie os lançamentos contábeis, conciliação e escrituração da empresa.
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-violet-200">Total de Lançamentos</p>
                <p className="font-semibold">{totalLancamentos}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-violet-200">Total Débitos</p>
                <p className="font-semibold">{formatarMoeda(totalDebitos)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-violet-200">Total Créditos</p>
                <p className="font-semibold">{formatarMoeda(totalCreditos)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={`border-l-4 border-l-slate-400 cursor-pointer transition-all ${statusFilter === 'todos' ? 'ring-2 ring-violet-500' : ''}`}
          onClick={() => setStatusFilter('todos')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Todos</p>
                <p className="text-2xl font-bold">{totalLancamentos}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 border-l-emerald-500 cursor-pointer transition-all ${statusFilter === 'conciliado' ? 'ring-2 ring-violet-500' : ''}`}
          onClick={() => setStatusFilter('conciliado')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conciliados</p>
                <p className="text-2xl font-bold text-emerald-600">{conciliados}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 border-l-amber-500 cursor-pointer transition-all ${statusFilter === 'pendente' ? 'ring-2 ring-violet-500' : ''}`}
          onClick={() => setStatusFilter('pendente')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">{pendentes}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 border-l-red-500 cursor-pointer transition-all ${statusFilter === 'rejeitado' ? 'ring-2 ring-violet-500' : ''}`}
          onClick={() => setStatusFilter('rejeitado')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{rejeitados}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, histórico, conta ou documento..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-600" />
                Lançamentos
              </CardTitle>
              <CardDescription>
                {filteredLancamentos.length} lançamento(s) encontrado(s)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-900">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Número</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Débito</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Crédito</th>
                  <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Histórico</th>
                  <th className="text-center p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-center p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedLancamentos.map((lancamento) => {
                  const statusConfig = getStatusConfig(lancamento.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={lancamento.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-violet-600">{lancamento.numero}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {lancamento.data}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm truncate max-w-[200px]" title={lancamento.contaDebito}>
                            {lancamento.contaDebito}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          <span className="text-sm truncate max-w-[200px]" title={lancamento.contaCredito}>
                            {lancamento.contaCredito}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold">{formatarMoeda(lancamento.valor)}</span>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[250px]">
                          <p className="text-sm truncate" title={lancamento.historico}>{lancamento.historico}</p>
                          <p className="text-xs text-muted-foreground">{lancamento.documento}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <Badge variant="outline" className={statusConfig.color}>
                            <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" title="Visualizar">
                            <Eye className="h-4 w-4 text-slate-500" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" title="Editar">
                            <Edit2 className="h-4 w-4 text-slate-500" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" title="Excluir">
                            <Trash2 className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredLancamentos.length)} de {filteredLancamentos.length} registros
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
