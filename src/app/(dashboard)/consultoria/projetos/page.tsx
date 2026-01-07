'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenuSeparator,
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
  Calendar,
  LayoutGrid,
  List,
  Users,
  AlertTriangle,
  Trash2,
} from 'lucide-react'
import {
  Projeto,
  StatusProjeto,
  statusProjetoLabels,
  statusProjetoCores,
} from '@/types/consultoria'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'

// Dados mockados
const projetosMock: Projeto[] = [
  {
    id: '1',
    tenantId: '1',
    nome: 'Implementação ERP',
    descricao: 'Implementação completa do sistema ERP na empresa ABC',
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
    descricao: 'Reestruturação do departamento financeiro',
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
    nome: 'Diagnóstico Operacional',
    descricao: 'Análise e diagnóstico dos processos operacionais',
    cliente: { id: '3', nome: 'Indústria XYZ', email: 'contato@xyz.ind.br' },
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
    nome: 'Gestão de Processos',
    descricao: 'Mapeamento e otimização de processos',
    cliente: { id: '4', nome: 'Comércio Beta', email: 'contato@beta.com.br' },
    dataInicio: new Date('2026-02-01'),
    status: 'NAO_INICIADO',
    progresso: 0,
    criadoEm: new Date('2026-01-02'),
    atualizadoEm: new Date('2026-01-02'),
  },
  {
    id: '5',
    tenantId: '1',
    nome: 'Auditoria Contábil',
    descricao: 'Auditoria completa dos processos contábeis',
    cliente: { id: '5', nome: 'Serviços Gama', email: 'contato@gama.com.br' },
    dataInicio: new Date('2025-10-01'),
    dataFim: new Date('2025-11-30'),
    status: 'PAUSADO',
    progresso: 35,
    criadoEm: new Date('2025-09-15'),
    atualizadoEm: new Date('2025-11-15'),
  },
]

const statusOptions: { value: StatusProjeto | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'NAO_INICIADO', label: 'Não Iniciado' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'PAUSADO', label: 'Pausado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

// Cores dos status para os filtros rápidos
const statusFilterColors: Record<StatusProjeto | 'TODOS', string> = {
  TODOS: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
  NAO_INICIADO: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  PAUSADO: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  CONCLUIDO: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
  CANCELADO: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
}

const statusFilterColorsActive: Record<StatusProjeto | 'TODOS', string> = {
  TODOS: 'bg-slate-600 text-white dark:bg-slate-500',
  NAO_INICIADO: 'bg-slate-600 text-white dark:bg-slate-500',
  EM_ANDAMENTO: 'bg-blue-600 text-white dark:bg-blue-500',
  PAUSADO: 'bg-amber-600 text-white dark:bg-amber-500',
  CONCLUIDO: 'bg-green-600 text-white dark:bg-green-500',
  CANCELADO: 'bg-red-600 text-white dark:bg-red-500',
}

export default function ProjetosPage() {
  const [projetos] = useState<Projeto[]>(projetosMock)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<StatusProjeto | 'TODOS'>('TODOS')
  const [viewMode, setViewMode] = useState<'cards' | 'lista'>('cards')

  // Permissões
  const { canCreate, canEdit, canDelete, canView } = usePermissions()

  // Filtrar projetos
  const projetosFiltrados = projetos.filter((projeto) => {
    const matchSearch =
      projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFiltro === 'TODOS' || projeto.status === statusFiltro
    return matchSearch && matchStatus
  })

  // Contar por status
  const countByStatus = (status: StatusProjeto | 'TODOS') => {
    if (status === 'TODOS') return projetos.length
    return projetos.filter((p) => p.status === status).length
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatDateShort = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  const isOverdue = (dataFim: Date | string | undefined, status: StatusProjeto) => {
    if (!dataFim || status === 'CONCLUIDO' || status === 'CANCELADO') return false
    return new Date(dataFim) < new Date()
  }

  // Consultor mockado
  const getConsultor = (projetoId: string) => {
    const consultores = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa']
    return consultores[parseInt(projetoId) % consultores.length]
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/consultoria"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Consultoria
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FolderKanban className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Projetos</h1>
              <p className="text-white/80">
                Gerencie todos os projetos de consultoria
              </p>
            </div>
          </div>
{canCreate('consultoria.projetos') && (
            <Link href="/consultoria/projetos/novo">
              <Button className="bg-white text-orange-600 hover:bg-white/90 shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros por Status (Pills) */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFiltro(opt.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              statusFiltro === opt.value
                ? statusFilterColorsActive[opt.value]
                : statusFilterColors[opt.value]
            )}
          >
            {opt.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {countByStatus(opt.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de Filtros e Visualização */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
        <div className="flex items-center gap-3 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projeto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Toggle de Visualização */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-lg border">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={cn(
              viewMode === 'cards' && 'bg-orange-500 hover:bg-orange-600'
            )}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'lista' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('lista')}
            className={cn(
              viewMode === 'lista' && 'bg-orange-500 hover:bg-orange-600'
            )}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projetosFiltrados.length} projeto(s) encontrado(s)
        </p>
      </div>

      {/* Visualização em Cards */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((projeto) => (
              <Link
                key={projeto.id}
                href={`/consultoria/projetos/${projeto.id}`}
                className="block group"
              >
                <Card className="h-full hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all">
                  <CardContent className="p-5">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate group-hover:text-orange-600 transition-colors">
                          {projeto.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {projeto.cliente?.nome}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canView('consultoria.projetos') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/consultoria/projetos/${projeto.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit('consultoria.projetos') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/consultoria/projetos/${projeto.id}/editar`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canDelete('consultoria.projetos') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="text-red-600">
                                <Link href={`/consultoria/projetos/${projeto.id}/excluir`}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        className={cn(
                          'text-xs',
                          statusProjetoCores[projeto.status]
                        )}
                      >
                        {statusProjetoLabels[projeto.status]}
                      </Badge>
                      {isOverdue(projeto.dataFim, projeto.status) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Atrasado
                        </Badge>
                      )}
                    </div>

                    {/* Descrição */}
                    {projeto.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {projeto.descricao}
                      </p>
                    )}

                    {/* Barra de Progresso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold text-orange-600">{projeto.progresso}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            projeto.progresso === 100
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-orange-500 to-amber-500"
                          )}
                          style={{ width: `${projeto.progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer - Consultor e Data */}
                    <div className="flex items-center justify-between text-sm pt-4 border-t">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="truncate">{getConsultor(projeto.id)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateShort(projeto.dataFim)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState searchTerm={searchTerm} statusFiltro={statusFiltro} />
            </div>
          )}
        </div>
      )}

      {/* Visualização em Lista/Tabela */}
      {viewMode === 'lista' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Consultor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetosFiltrados.length > 0 ? (
                projetosFiltrados.map((projeto) => (
                  <TableRow key={projeto.id} className="group">
                    <TableCell>
                      <Link
                        href={`/consultoria/projetos/${projeto.id}`}
                        className="font-medium hover:text-orange-600 transition-colors"
                      >
                        {projeto.nome}
                      </Link>
                      {projeto.descricao && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {projeto.descricao}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {projeto.cliente?.nome || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getConsultor(projeto.id)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'text-xs',
                            statusProjetoCores[projeto.status]
                          )}
                        >
                          {statusProjetoLabels[projeto.status]}
                        </Badge>
                        {isOverdue(projeto.dataFim, projeto.status) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              projeto.progresso === 100
                                ? "bg-green-500"
                                : "bg-orange-500"
                            )}
                            style={{ width: `${projeto.progresso}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground w-8">
                          {projeto.progresso}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
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
                          {canView('consultoria.projetos') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/consultoria/projetos/${projeto.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit('consultoria.projetos') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/consultoria/projetos/${projeto.id}/editar`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canDelete('consultoria.projetos') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="text-red-600">
                                <Link href={`/consultoria/projetos/${projeto.id}/excluir`}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState searchTerm={searchTerm} statusFiltro={statusFiltro} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

// Componente Empty State
function EmptyState({ searchTerm, statusFiltro }: { searchTerm: string; statusFiltro: StatusProjeto | 'TODOS' }) {
  const hasFilters = searchTerm || statusFiltro !== 'TODOS'
  const { canCreate } = usePermissions()

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
        <FolderKanban className="h-10 w-10 text-orange-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {hasFilters ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {hasFilters
          ? 'Tente ajustar os filtros ou buscar por outro termo.'
          : 'Comece criando seu primeiro projeto de consultoria para gerenciar tarefas e entregas.'}
      </p>
      {!hasFilters && canCreate('consultoria.projetos') && (
        <Link href="/consultoria/projetos/novo">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Projeto
          </Button>
        </Link>
      )}
    </div>
  )
}
