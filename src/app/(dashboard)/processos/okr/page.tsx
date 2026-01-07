'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Target,
  Plus,
  Filter,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { Objetivo, StatusOKR, statusLabels, statusColors } from '@/types/okr'
import { cn } from '@/lib/utils'
import { objetivosOKR, usuarios } from '@/data/demo-data'
import { useModulePermissions } from '@/hooks/use-permissions'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'

// Função para mapear status do demo-data para o formato esperado
const mapStatusOKR = (status: string): StatusOKR => {
  switch (status) {
    case 'em_andamento':
      return 'EM_ANDAMENTO'
    case 'atrasado':
      return 'ATRASADO'
    case 'em_dia':
      return 'EM_ANDAMENTO'
    case 'concluido':
      return 'CONCLUIDO'
    default:
      return 'NAO_INICIADO'
  }
}

// Mapeando OKRs do demo-data para o formato esperado
const objetivosMock: Objetivo[] = [
  {
    id: objetivosOKR[0]?.id || '1',
    titulo: objetivosOKR[0]?.titulo || 'Aumentar Faturamento',
    descricao: objetivosOKR[0]?.meta || 'Crescimento de 20% no faturamento anual',
    donoId: usuarios[0]?.id || '1',
    dono: { id: usuarios[0]?.id || '1', nome: usuarios[0]?.nome || 'Carlos Mendonça', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: mapStatusOKR(objetivosOKR[0]?.status || 'em_andamento'),
    progresso: objetivosOKR[0]?.progresso || 65,
    keyResults: [
      {
        id: 'kr1',
        objetivoId: objetivosOKR[0]?.id || '1',
        titulo: 'Aumentar vendas de produtos em 25%',
        metrica: 'Receita de vendas',
        baseline: 500000,
        meta: 625000,
        atual: 560000,
        peso: 2,
        progresso: 48,
        tarefas: [],
      },
      {
        id: 'kr2',
        objetivoId: objetivosOKR[0]?.id || '1',
        titulo: 'Expandir base de clientes corporativos',
        metrica: 'Número de clientes',
        baseline: 50,
        meta: 80,
        atual: 68,
        peso: 1,
        progresso: 60,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2026-01-01'),
    atualizadoEm: new Date('2026-01-15'),
  },
  {
    id: objetivosOKR[1]?.id || '2',
    titulo: objetivosOKR[1]?.titulo || 'Reduzir Inadimplência',
    descricao: objetivosOKR[1]?.meta || 'Reduzir inadimplência para 3%',
    donoId: usuarios[2]?.id || '2',
    dono: { id: usuarios[2]?.id || '2', nome: usuarios[2]?.nome || 'Ricardo Santos', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: mapStatusOKR(objetivosOKR[1]?.status || 'atrasado'),
    progresso: objetivosOKR[1]?.progresso || 35,
    keyResults: [
      {
        id: 'kr3',
        objetivoId: objetivosOKR[1]?.id || '2',
        titulo: 'Implementar cobrança automatizada',
        metrica: 'Sistema implementado',
        baseline: 0,
        meta: 100,
        atual: 60,
        peso: 2,
        progresso: 60,
        tarefas: [],
      },
      {
        id: 'kr4',
        objetivoId: objetivosOKR[1]?.id || '2',
        titulo: 'Reduzir prazo médio de recebimento',
        metrica: 'Dias',
        baseline: 45,
        meta: 30,
        atual: 38,
        peso: 1,
        progresso: 47,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2026-01-01'),
    atualizadoEm: new Date('2026-01-10'),
  },
  {
    id: objetivosOKR[2]?.id || '3',
    titulo: objetivosOKR[2]?.titulo || 'Organizar Processos Internos',
    descricao: objetivosOKR[2]?.meta || 'Documentar e otimizar 100% dos processos',
    donoId: usuarios[1]?.id || '1',
    dono: { id: usuarios[1]?.id || '1', nome: usuarios[1]?.nome || 'Fernanda Lima', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: mapStatusOKR(objetivosOKR[2]?.status || 'em_dia'),
    progresso: objetivosOKR[2]?.progresso || 78,
    keyResults: [
      {
        id: 'kr5',
        objetivoId: objetivosOKR[2]?.id || '3',
        titulo: 'Documentar processos principais',
        metrica: 'Processos documentados',
        baseline: 0,
        meta: 15,
        atual: 12,
        peso: 1,
        progresso: 80,
        tarefas: [],
      },
      {
        id: 'kr6',
        objetivoId: objetivosOKR[2]?.id || '3',
        titulo: 'Treinar equipe nos novos processos',
        metrica: 'Colaboradores treinados',
        baseline: 0,
        meta: 18,
        atual: 14,
        peso: 1,
        progresso: 78,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2025-10-01'),
    atualizadoEm: new Date('2025-12-20'),
  },
  {
    id: '4',
    titulo: 'Expandir serviços de suporte técnico',
    descricao: 'Aumentar capacidade de atendimento e contratos de suporte',
    donoId: usuarios[3]?.id || '4',
    dono: { id: usuarios[3]?.id || '4', nome: usuarios[3]?.nome || 'Bruno Alves', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: 'NAO_INICIADO',
    progresso: 0,
    keyResults: [
      {
        id: 'kr7',
        objetivoId: '4',
        titulo: 'Contratar 3 técnicos',
        metrica: 'Técnicos contratados',
        baseline: 0,
        meta: 3,
        atual: 0,
        peso: 1,
        progresso: 0,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2026-01-05'),
    atualizadoEm: new Date('2026-01-05'),
  },
]

const trimestres = ['Q1', 'Q2', 'Q3', 'Q4']
const anos = [2025, 2026, 2027]
const statusOptions: { value: StatusOKR | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'NAO_INICIADO', label: 'Não Iniciado' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'ATRASADO', label: 'Atrasado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

// Usando usuários do demo-data
const responsaveis = [
  { id: 'TODOS', nome: 'Todos' },
  ...usuarios.map(u => ({ id: u.id, nome: u.nome }))
]

// Cores dos status para pills
const statusPillColors: Record<StatusOKR | 'TODOS', string> = {
  TODOS: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
  NAO_INICIADO: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  ATRASADO: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  CONCLUIDO: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
  CANCELADO: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
}

const statusPillColorsActive: Record<StatusOKR | 'TODOS', string> = {
  TODOS: 'bg-slate-600 text-white dark:bg-slate-500',
  NAO_INICIADO: 'bg-slate-600 text-white dark:bg-slate-500',
  EM_ANDAMENTO: 'bg-blue-600 text-white dark:bg-blue-500',
  ATRASADO: 'bg-amber-600 text-white dark:bg-amber-500',
  CONCLUIDO: 'bg-green-600 text-white dark:bg-green-500',
  CANCELADO: 'bg-red-600 text-white dark:bg-red-500',
}

// Indicador de prazo
function getPrazoIndicador(status: StatusOKR, progresso: number) {
  if (status === 'CONCLUIDO') return { label: 'Concluído', color: 'text-green-600', icon: CheckCircle2 }
  if (status === 'ATRASADO') return { label: 'Atrasado', color: 'text-amber-600', icon: AlertTriangle }
  if (progresso >= 70) return { label: 'Em dia', color: 'text-green-600', icon: CheckCircle2 }
  if (progresso >= 40) return { label: 'Atenção', color: 'text-amber-600', icon: Clock }
  return { label: 'Risco', color: 'text-red-600', icon: AlertTriangle }
}

export default function OKRPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { canCreate, canEdit, canDelete } = useModulePermissions('okr.objetivos')

  const [periodoTrimestre, setPeriodoTrimestre] = useState('Q1')
  const [periodoAno, setPeriodoAno] = useState('2026')
  const [statusFiltro, setStatusFiltro] = useState<StatusOKR | 'TODOS'>('TODOS')
  const [responsavelFiltro, setResponsavelFiltro] = useState('TODOS')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<string[]>(['1', '2'])
  const [loading, setLoading] = useState(true)

  // Simular loading inicial
  useEffect(() => {
    if (user && tenant) {
      setLoading(false)
    }
  }, [user, tenant])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Filtrar objetivos
  const objetivosFiltrados = objetivosMock.filter((obj) => {
    const matchTrimestre = obj.trimestre === periodoTrimestre
    const matchAno = obj.ano === parseInt(periodoAno)
    const matchStatus = statusFiltro === 'TODOS' || obj.status === statusFiltro
    const matchResponsavel = responsavelFiltro === 'TODOS' || obj.donoId === responsavelFiltro
    const matchSearch = obj.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchTrimestre && matchAno && matchStatus && matchResponsavel && matchSearch
  })

  // Estatísticas
  const stats = {
    total: objetivosFiltrados.length,
    emAndamento: objetivosFiltrados.filter(o => o.status === 'EM_ANDAMENTO').length,
    atrasados: objetivosFiltrados.filter(o => o.status === 'ATRASADO').length,
    concluidos: objetivosFiltrados.filter(o => o.status === 'CONCLUIDO').length,
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const countByStatus = (status: StatusOKR | 'TODOS') => {
    if (status === 'TODOS') return objetivosMock.filter(o => o.trimestre === periodoTrimestre && o.ano === parseInt(periodoAno)).length
    return objetivosMock.filter(o => o.status === status && o.trimestre === periodoTrimestre && o.ano === parseInt(periodoAno)).length
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/processos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Processos
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">OKRs</h1>
              <p className="text-white/80">
                Objetivos e Resultados-Chave
              </p>
            </div>
          </div>
          {canCreate && (
            <Link href="/processos/okr/novo">
              <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Novo Objetivo
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mini Cards de Estatísticas */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
            <p className="text-lg font-bold">{stats.emAndamento}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Atrasados</p>
            <p className="text-lg font-bold">{stats.atrasados}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Concluídos</p>
            <p className="text-lg font-bold">{stats.concluidos}</p>
          </div>
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
                ? statusPillColorsActive[opt.value]
                : statusPillColors[opt.value]
            )}
          >
            {opt.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {countByStatus(opt.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
        {/* Busca */}
        <div className="flex items-center gap-3 w-full">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Selects - empilham em mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Select value={periodoTrimestre} onValueChange={setPeriodoTrimestre}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              {trimestres.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodoAno} onValueChange={setPeriodoAno}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={responsavelFiltro} onValueChange={setResponsavelFiltro}>
            <SelectTrigger className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              {responsaveis.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        {objetivosFiltrados.length} objetivo(s) encontrado(s)
      </div>

      {/* Lista de Objetivos com Cards Expandíveis */}
      <div className="space-y-4">
        {objetivosFiltrados.length > 0 ? (
          objetivosFiltrados.map((objetivo) => {
            const isExpanded = expandedIds.includes(objetivo.id)
            const prazoIndicador = getPrazoIndicador(objetivo.status, objetivo.progresso)
            const PrazoIcon = prazoIndicador.icon

            return (
              <Card key={objetivo.id} className={cn(
                "transition-all",
                objetivo.status === 'ATRASADO' && "border-amber-200 dark:border-amber-900/50"
              )}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(objetivo.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-lg p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            objetivo.status === 'CONCLUIDO' ? 'bg-green-100 dark:bg-green-900/30' :
                            objetivo.status === 'ATRASADO' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          )}>
                            <Target className={cn(
                              "h-5 w-5",
                              objetivo.status === 'CONCLUIDO' ? 'text-green-600' :
                              objetivo.status === 'ATRASADO' ? 'text-amber-600' :
                              'text-blue-600'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                              <Link
                                href={`/processos/okr/${objetivo.id}`}
                                className="font-semibold text-base sm:text-lg hover:text-blue-600 transition-colors line-clamp-2 sm:line-clamp-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {objetivo.titulo}
                              </Link>
                              <Badge
                                variant="secondary"
                                className={cn("w-fit", statusColors[objetivo.status].bg, statusColors[objetivo.status].text)}
                              >
                                {statusLabels[objetivo.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">{objetivo.descricao}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{objetivo.dono.nome}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {objetivo.trimestre} {objetivo.ano}
                              </span>
                              <span className={cn("flex items-center gap-1", prazoIndicador.color)}>
                                <PrazoIcon className="h-3.5 w-3.5" />
                                {prazoIndicador.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-10 sm:pl-0">
                          {/* Barra de Progresso - mobile mostra simplificado */}
                          <div className="flex-1 sm:flex-none sm:w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground sm:block hidden">Progresso</span>
                              <span className={cn(
                                "font-semibold",
                                objetivo.status === 'CONCLUIDO' ? 'text-green-600' :
                                objetivo.status === 'ATRASADO' ? 'text-amber-600' : 'text-blue-600'
                              )}>{objetivo.progresso}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  objetivo.status === 'CONCLUIDO' ? 'bg-green-500' :
                                  objetivo.status === 'ATRASADO' ? 'bg-amber-500' : 'bg-blue-500'
                                )}
                                style={{ width: `${objetivo.progresso}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {objetivo.keyResults.length} KRs
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          Key Results
                        </h4>
                        {objetivo.keyResults.map((kr) => (
                          <div
                            key={kr.id}
                            className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm sm:text-base">{kr.titulo}</h5>
                                <p className="text-xs sm:text-sm text-muted-foreground">{kr.metrica}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                                  <span>Base: {kr.baseline.toLocaleString()}</span>
                                  <span>Meta: {kr.meta.toLocaleString()}</span>
                                  <span className="font-medium text-blue-600">Atual: {kr.atual.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                                <span className={cn(
                                  "text-xl sm:text-2xl font-bold",
                                  kr.progresso >= 100 ? 'text-green-600' :
                                  kr.progresso >= 70 ? 'text-blue-600' :
                                  kr.progresso >= 40 ? 'text-amber-600' : 'text-red-600'
                                )}>{kr.progresso}%</span>
                                <div className="flex-1 sm:flex-none w-full sm:w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden sm:mt-2">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      kr.progresso >= 100 ? 'bg-green-500' :
                                      kr.progresso >= 70 ? 'bg-blue-500' :
                                      kr.progresso >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${Math.min(kr.progresso, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <Link href={`/processos/okr/${objetivo.id}`}>
                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:border-blue-300 w-full sm:w-auto">
                              Ver Detalhes
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum objetivo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não há objetivos para os filtros selecionados.
              </p>
              {canCreate && (
                <Link href="/processos/okr/novo">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Objetivo
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
