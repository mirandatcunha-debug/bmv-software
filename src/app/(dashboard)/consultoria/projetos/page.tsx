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
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Calendar,
} from 'lucide-react'
import {
  Projeto,
  StatusProjeto,
  statusProjetoLabels,
  statusProjetoCores,
} from '@/types/consultoria'
import { cn } from '@/lib/utils'

// Dados mockados
const projetosMock: Projeto[] = [
  {
    id: '1',
    tenantId: '1',
    nome: 'Implementacao ERP',
    descricao: 'Implementacao completa do sistema ERP na empresa ABC',
    cliente: { id: '1', nome: 'Empresa ABC Ltda', email: 'contato@abc.com.br' },
    dataInicio: new Date('2026-01-01'),
    dataFim: new Date('2026-06-30'),
    status: 'EM_ANDAMENTO',
    progresso: 45,
    criadoEm: new Date('2025-12-15'),
    atualizadoEm: new Date('2026-01-05'),
  },
  {
    id: '2',
    tenantId: '1',
    nome: 'Consultoria Financeira',
    descricao: 'Reestruturacao do departamento financeiro',
    cliente: { id: '2', nome: 'Tech Solutions SA', email: 'financeiro@tech.com.br' },
    dataInicio: new Date('2025-11-01'),
    dataFim: new Date('2026-02-28'),
    status: 'EM_ANDAMENTO',
    progresso: 72,
    criadoEm: new Date('2025-10-20'),
    atualizadoEm: new Date('2026-01-03'),
  },
  {
    id: '3',
    tenantId: '1',
    nome: 'Diagnostico Operacional',
    descricao: 'Analise e diagnostico dos processos operacionais',
    cliente: { id: '3', nome: 'Industria XYZ', email: 'contato@xyz.ind.br' },
    dataInicio: new Date('2025-12-01'),
    dataFim: new Date('2025-12-20'),
    status: 'CONCLUIDO',
    progresso: 100,
    criadoEm: new Date('2025-11-25'),
    atualizadoEm: new Date('2025-12-20'),
  },
  {
    id: '4',
    tenantId: '1',
    nome: 'Gestao de Processos',
    descricao: 'Mapeamento e otimizacao de processos',
    cliente: { id: '4', nome: 'Comercio Beta', email: 'contato@beta.com.br' },
    dataInicio: new Date('2026-02-01'),
    status: 'NAO_INICIADO',
    progresso: 0,
    criadoEm: new Date('2026-01-02'),
    atualizadoEm: new Date('2026-01-02'),
  },
]

const statusOptions: { value: StatusProjeto | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'NAO_INICIADO', label: 'Nao Iniciado' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'PAUSADO', label: 'Pausado' },
  { value: 'CONCLUIDO', label: 'Concluido' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export default function ProjetosPage() {
  const [projetos] = useState<Projeto[]>(projetosMock)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<StatusProjeto | 'TODOS'>('TODOS')

  // Filtrar projetos
  const projetosFiltrados = projetos.filter((projeto) => {
    const matchSearch =
      projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFiltro === 'TODOS' || projeto.status === statusFiltro
    return matchSearch && matchStatus
  })

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/consultoria"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Consultoria
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-bmv-primary" />
            Projetos
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os projetos de consultoria
          </p>
        </div>
        <Link href="/consultoria/projetos/novo">
          <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projeto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFiltro}
          onValueChange={(value) => setStatusFiltro(value as StatusProjeto | 'TODOS')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        {projetosFiltrados.length} projeto(s) encontrado(s)
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projetosFiltrados.length > 0 ? (
              projetosFiltrados.map((projeto) => (
                <TableRow key={projeto.id}>
                  <TableCell>
                    <Link
                      href={`/consultoria/projetos/${projeto.id}`}
                      className="font-medium hover:text-bmv-primary transition-colors"
                    >
                      {projeto.nome}
                    </Link>
                    {projeto.descricao && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {projeto.descricao}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{projeto.cliente?.nome || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded',
                        statusProjetoCores[projeto.status]
                      )}
                    >
                      {statusProjetoLabels[projeto.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bmv-primary rounded-full"
                          style={{ width: `${projeto.progresso}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {projeto.progresso}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(projeto.dataFim)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/consultoria/projetos/${projeto.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/consultoria/projetos/${projeto.id}/editar`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-amber-600">
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Nao ha projetos para os filtros selecionados.
                  </p>
                  <Link href="/consultoria/projetos/novo">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
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
